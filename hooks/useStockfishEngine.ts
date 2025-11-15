import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import type { EngineLine, EngineOptionState } from '@/types/chess'

type EngineStatus = 'loading' | 'idle' | 'thinking' | 'error'

interface AnalyzeConfig {
  fen: string
  moves?: string[]
  newGame?: boolean
  depth?: number
  infinite?: boolean
}

const DEFAULT_OPTIONS: EngineOptionState = {
  multiPv: 3,
  movetimeMs: 1500,
  depth: undefined,
  maxSuggestions: 5,
  showArrows: true,
}

const WORKER_PATH = '/workers/stockfish-worker.js'

function sanFromUci(fen: string, moves: string[]): string[] {
  const result: string[] = []
  try {
    const chess = new Chess(fen)
    moves.forEach((uci) => {
      if (!uci) return
      const move = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.slice(4) || undefined,
      })
      if (move?.san) {
        result.push(move.san)
      }
    })
  } catch {
    // ignore conversion errors
  }
  return result
}

function parseInfoLine(line: string, fen: string): EngineLine | null {
  const tokens = line.trim().split(/\s+/)
  if (tokens.length < 2) return null

  let depth: number | undefined
  let multipv = 1
  let scoreCp: number | undefined
  let scoreMate: number | undefined
  let nodes: number | undefined
  let nps: number | undefined
  let pvIndex = tokens.indexOf('pv')

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    switch (token) {
      case 'depth':
        depth = Number(tokens[i + 1])
        i += 1
        break
      case 'multipv':
        multipv = Number(tokens[i + 1]) || 1
        i += 1
        break
      case 'score': {
        const scoreType = tokens[i + 1]
        const scoreValue = Number(tokens[i + 2])
        if (scoreType === 'cp') {
          scoreCp = scoreValue
        } else if (scoreType === 'mate') {
          scoreMate = scoreValue
        }
        i += 2
        break
      }
      case 'nodes':
        nodes = Number(tokens[i + 1])
        i += 1
        break
      case 'nps':
        nps = Number(tokens[i + 1])
        i += 1
        break
      default:
        break
    }
  }

  if (pvIndex === -1) {
    pvIndex = tokens.findIndex((token) => token === 'pv')
  }
  if (pvIndex === -1) {
    return null
  }

  const pvUci = tokens.slice(pvIndex + 1)
  if (pvUci.length === 0) {
    return null
  }

  const pvSan = sanFromUci(fen, pvUci)

  return {
    id: `${multipv}:${pvUci[0]}:${depth ?? 0}`,
    multipv,
    depth,
    nodes,
    nps,
    scoreCp,
    scoreMate,
    pvSan,
    pvUci,
  }
}

export function useStockfishEngine(initialOptions?: Partial<EngineOptionState>) {
  const workerRef = useRef<Worker | null>(null)
  const [status, setStatus] = useState<EngineStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [options, setOptionsState] = useState<EngineOptionState>({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
  })
  const [lines, setLines] = useState<EngineLine[]>([])
  const [bestMove, setBestMove] = useState<string | undefined>()
  const currentFenRef = useRef<string>('')
  const pendingOptionSync = useRef(false)

  const isClient = typeof window !== 'undefined'

  const postToWorker = useCallback((message: Record<string, unknown>) => {
    if (!workerRef.current) return
    workerRef.current.postMessage(message)
  }, [])

  useEffect(() => {
    if (!isClient) return
    if (workerRef.current) return

    try {
      const worker = new Worker(WORKER_PATH)
      workerRef.current = worker

      worker.onmessage = (event: MessageEvent) => {
        const { type, payload } = event.data || {}
        if (type === 'READY') {
          setStatus((prev) => (prev === 'loading' ? 'idle' : prev))
          if (!pendingOptionSync.current) {
            postToWorker({
              type: 'SET_OPTIONS',
              payload: {
                MultiPV: options.multiPv,
                SkillLevel: options.skillLevel,
                Threads: options.threads,
                Hash: options.hash,
              },
            })
            pendingOptionSync.current = true
          }
        } else if (type === 'INFO' && typeof payload === 'string') {
          const parsed = parseInfoLine(payload, currentFenRef.current)
          if (parsed) {
            setLines((prev) => {
              const nextMap = new Map<number, EngineLine>()
              prev.forEach((line) => {
                nextMap.set(line.multipv, line)
              })
              nextMap.set(parsed.multipv, parsed)
              const sorted = Array.from(nextMap.values()).sort(
                (a, b) => a.multipv - b.multipv
              )
              return sorted
            })
          }
        } else if (type === 'BESTMOVE' && typeof payload === 'string') {
          const tokens = payload.trim().split(/\s+/)
          if (tokens.length >= 2) {
            setBestMove(tokens[1])
          }
          setStatus('idle')
        } else if (type === 'ERROR') {
          setError(
            typeof payload?.message === 'string'
              ? payload.message
              : 'Stockfish worker error'
          )
          setStatus('error')
        }
      }

      worker.onerror = (event) => {
        setError(event.message ?? 'Stockfish worker error')
        setStatus('error')
      }

      worker.postMessage({ type: 'INIT' })
    } catch (err) {
      setTimeout(() => {
        setError(err instanceof Error ? err.message : 'Failed to start Stockfish')
        setStatus('error')
      }, 0)
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'QUIT' })
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [isClient, options.multiPv, options.skillLevel, options.hash, options.threads, postToWorker])

  const setOptions = useCallback((updates: Partial<EngineOptionState>) => {
    setOptionsState((prev) => ({ ...prev, ...updates }))
  }, [])

  useEffect(() => {
    if (!workerRef.current) return
    const optionPayload: Record<string, number | string> = {}
    if (typeof options.multiPv === 'number') {
      optionPayload.MultiPV = options.multiPv
    }
    if (typeof options.skillLevel === 'number') {
      optionPayload.SkillLevel = options.skillLevel
    }
    if (typeof options.threads === 'number') {
      optionPayload.Threads = options.threads
    }
    if (typeof options.hash === 'number') {
      optionPayload.Hash = options.hash
    }
    if (Object.keys(optionPayload).length > 0) {
      postToWorker({
        type: 'SET_OPTIONS',
        payload: optionPayload,
      })
    }
  }, [options.multiPv, options.skillLevel, options.threads, options.hash, postToWorker])

  const analyzePosition = useCallback(
    (config: AnalyzeConfig) => {
      if (!workerRef.current) return
      setLines([])
      setBestMove(undefined)
      setStatus('thinking')
      currentFenRef.current = config.fen

      postToWorker({
        type: 'POSITION',
        payload: {
          fen: config.fen,
          moves: config.moves ?? [],
          newGame: config.newGame ?? false,
        },
      })

      postToWorker({
        type: 'GO',
        payload: {
          depth: config.depth ?? options.depth,
          movetime: config.infinite ? undefined : options.movetimeMs,
          infinite: config.infinite ?? false,
        },
      })
    },
    [options.depth, options.movetimeMs, postToWorker]
  )

  const stop = useCallback(() => {
    if (!workerRef.current) return
    postToWorker({ type: 'STOP' })
    setStatus('idle')
  }, [postToWorker])

  const dispose = useCallback(() => {
    if (!workerRef.current) return
    postToWorker({ type: 'QUIT' })
    workerRef.current.terminate()
    workerRef.current = null
  }, [postToWorker])

  const state = useMemo(
    () => ({
      status,
      error,
      options,
      lines,
      bestMove,
      analyzePosition,
      stop,
      setOptions,
      dispose,
    }),
    [analyzePosition, bestMove, dispose, error, lines, options, setOptions, status, stop]
  )

  return state
}

