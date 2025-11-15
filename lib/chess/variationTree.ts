import { Chess, type ShortMove } from 'chess.js'
import {
  VariationMoveInput,
  VariationNode,
  VariationTree,
} from '@/types/chess'

const DEFAULT_FEN = new Chess().fen()

function createNodeId() {
  const globalCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return globalCrypto.randomUUID()
  }
  return `node_${Math.random().toString(36).slice(2, 10)}`
}

function cloneNode(node: VariationNode): VariationNode {
  return {
    ...node,
    children: node.children.map(cloneNode),
  }
}

function findNode(node: VariationNode, id: string): VariationNode | undefined {
  if (node.id === id) {
    return node
  }

  for (const child of node.children) {
    const match = findNode(child, id)
    if (match) {
      return match
    }
  }

  return undefined
}

function nextColor(parent: VariationNode): 'w' | 'b' {
  if (parent.parentId === null) {
    return 'w'
  }
  return parent.color === 'w' ? 'b' : 'w'
}

function nextMoveNumber(parent: VariationNode, color: 'w' | 'b'): number {
  if (parent.parentId === null) {
    return 1
  }
  if (color === 'w') {
    return parent.moveNumber + 1
  }
  return parent.moveNumber
}

function applyMove(fen: string, move: VariationMoveInput) {
  const chess = new Chess(fen)
  const fenBefore = chess.fen()
  let result: ReturnType<Chess['move']> | null = null

  if (move.uci) {
    const normalized = move.uci.trim().toLowerCase()
    const from = normalized.slice(0, 2)
    const to = normalized.slice(2, 4)
    const promotion = normalized.length > 4 ? normalized.slice(4) : undefined
    const promotionPiece =
      promotion && promotion.length > 0
        ? (promotion[0] as ShortMove['promotion'])
        : undefined
    const shortMove: ShortMove = {
      from: from as ShortMove['from'],
      to: to as ShortMove['to'],
      promotion: promotionPiece,
    }
    result = chess.move(shortMove)
  } else if (move.san) {
    try {
      const options = { sloppy: true } as Parameters<Chess['move']>[1]
      result = chess.move(move.san, options)
    } catch {
      result = null
    }
  }

  if (!result) {
    const label = move.san ?? move.uci ?? 'unknown move'
    throw new Error(`Invalid move "${label}" for position "${fenBefore}".`)
  }

  const fenAfter = chess.fen()
  const uci = `${result.from}${result.to}${result.promotion ?? ''}`

  return {
    result,
    fenBefore,
    fenAfter,
    uci,
  }
}

function buildNode(
  parent: VariationNode,
  move: VariationMoveInput,
  markAsMainline: boolean
): VariationNode {
  const { result, fenBefore, fenAfter, uci } = applyMove(parent.fenAfter, move)
  const color = nextColor(parent)
  const moveNumber = nextMoveNumber(parent, color)

  return {
    id: createNodeId(),
    moveNumber,
    color,
    san: result.san,
    uci,
    fenBefore,
    fenAfter,
    parentId: parent.id,
    comment: move.comment,
    nags: move.nags,
    isMainline: markAsMainline || move.isMainline || false,
    children: [],
  }
}

export function createInitialTree(initialFen?: string): VariationTree {
  const fen = initialFen || DEFAULT_FEN
  const root: VariationNode = {
    id: createNodeId(),
    moveNumber: 0,
    color: 'w',
    san: null,
    uci: null,
    fenBefore: fen,
    fenAfter: fen,
    parentId: null,
    children: [],
    isMainline: true,
  }

  return {
    root,
    currentNodeId: root.id,
  }
}

export function getNodeById(
  tree: VariationTree | VariationNode,
  id: string
): VariationNode | undefined {
  const root = 'root' in tree ? tree.root : tree
  return findNode(root, id)
}

export function getPathToNode(
  tree: VariationTree,
  id: string
): VariationNode[] | undefined {
  const path: VariationNode[] = []

  const dfs = (node: VariationNode): boolean => {
    path.push(node)
    if (node.id === id) {
      return true
    }
    for (const child of node.children) {
      if (dfs(child)) {
        return true
      }
    }
    path.pop()
    return false
  }

  const found = dfs(tree.root)
  if (!found) {
    return undefined
  }

  return path
}

export function appendMovesAtNode(
  tree: VariationTree,
  parentId: string,
  moves: VariationMoveInput[],
  markMainline = false
): { tree: VariationTree; lastNode?: VariationNode } {
  if (moves.length === 0) {
    return { tree, lastNode: undefined }
  }

  const clonedTree: VariationTree = {
    ...tree,
    root: cloneNode(tree.root),
  }

  const parent = getNodeById(clonedTree, parentId)
  if (!parent) {
    throw new Error(`Parent node ${parentId} not found.`)
  }

  let cursor = parent
  let lastNode: VariationNode | undefined

  moves.forEach((moveInput, index) => {
    const shouldBeMainline = index === 0 ? markMainline : true
    const node = buildNode(cursor, moveInput, shouldBeMainline)
    cursor.children = [...cursor.children, node]
    cursor = node
    lastNode = node
  })

  return {
    tree: clonedTree,
    lastNode,
  }
}

