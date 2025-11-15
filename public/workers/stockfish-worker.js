// Load the prebuilt Stockfish script that lives alongside this worker file.
importScripts('/workers/stockfish.js')

const MESSAGE_TYPES = {
  READY: 'READY',
  INFO: 'INFO',
  BESTMOVE: 'BESTMOVE',
  LOG: 'LOG',
  ERROR: 'ERROR',
}

let engine = null
let isReady = false
let pendingCommands = []

function post(type, payload) {
  self.postMessage({ type, payload })
}

function ensureEngine(commandOnReady) {
  if (!engine) {
    try {
      engine = Stockfish()
      engine.addMessageListener(handleEngineMessage)
      engine.postMessage('uci')
    } catch (error) {
      post(MESSAGE_TYPES.ERROR, {
        message: error instanceof Error ? error.message : String(error),
      })
      return
    }
  }

  if (typeof commandOnReady === 'string') {
    queueCommand(commandOnReady)
  }
}

function queueCommand(command) {
  if (isReady) {
    engine.postMessage(command)
  } else {
    pendingCommands.push(command)
  }
}

function flushPending() {
  if (!engine || !isReady) return
  while (pendingCommands.length > 0) {
    const cmd = pendingCommands.shift()
    engine.postMessage(cmd)
  }
}

function handleEngineMessage(event) {
  const line = typeof event === 'string' ? event : event?.data
  if (typeof line !== 'string') return

  if (line === 'uciok') {
    queueCommand('setoption name UCI_AnalyseMode value true')
    queueCommand('isready')
    return
  }

  if (line === 'readyok') {
    isReady = true
    flushPending()
    post(MESSAGE_TYPES.READY, null)
    return
  }

  if (line.startsWith('info ')) {
    post(MESSAGE_TYPES.INFO, line)
    return
  }

  if (line.startsWith('bestmove')) {
    post(MESSAGE_TYPES.BESTMOVE, line)
    return
  }

  post(MESSAGE_TYPES.LOG, line)
}

function handleInit() {
  if (engine) {
    try {
      engine.postMessage('quit')
    } catch {
      // ignore
    }
    engine = null
  }
  isReady = false
  pendingCommands = []
  ensureEngine()
}

function handleSetOptions(options = {}) {
  Object.entries(options).forEach(([name, value]) => {
    if (value === undefined || value === null) {
      return
    }
    queueCommand(`setoption name ${name} value ${value}`)
  })
}

function handlePosition(payload = {}) {
  const { fen, moves, newGame } = payload
  if (!fen && !moves) return
  if (newGame) {
    queueCommand('ucinewgame')
  }
  if (fen) {
    const movePart = Array.isArray(moves) && moves.length > 0 ? ` moves ${moves.join(' ')}` : ''
    queueCommand(`position fen ${fen}${movePart}`)
  } else if (Array.isArray(moves) && moves.length > 0) {
    queueCommand(`position startpos moves ${moves.join(' ')}`)
  }
}

function handleGo(payload = {}) {
  const { depth, movetime, nodes, infinite } = payload
  const parts = ['go']
  if (typeof depth === 'number') parts.push('depth', depth)
  if (typeof movetime === 'number') parts.push('movetime', movetime)
  if (typeof nodes === 'number') parts.push('nodes', nodes)
  if (infinite) parts.push('infinite')
  queueCommand(parts.join(' '))
}

function handleStop() {
  if (!engine) return
  engine.postMessage('stop')
}

function handleQuit() {
  if (engine) {
    try {
      engine.postMessage('quit')
    } catch {
      // ignore
    }
  }
  engine = null
  isReady = false
  pendingCommands = []
  close()
}

self.onmessage = (event) => {
  const { type, payload } = event.data || {}

  switch (type) {
    case 'INIT':
      handleInit()
      break
    case 'SET_OPTIONS':
      ensureEngine()
      handleSetOptions(payload)
      break
    case 'POSITION':
      ensureEngine()
      handlePosition(payload)
      break
    case 'GO':
      ensureEngine()
      handleGo(payload)
      break
    case 'STOP':
      handleStop()
      break
    case 'QUIT':
      handleQuit()
      break
    default:
      break
  }
}

