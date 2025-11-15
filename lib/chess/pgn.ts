import { parse } from '@mliebelt/pgn-parser'
import { Chess } from 'chess.js'
import {
  GameMetadata,
  VariationMoveInput,
  VariationNode,
  VariationTree,
} from '@/types/chess'
import {
  appendMovesAtNode,
  createInitialTree,
} from '@/lib/chess/variationTree'

interface ParsedGame {
  tree: VariationTree
  metadata: GameMetadata
}

function parseNag(nag: string | null | undefined): number | undefined {
  if (!nag) return undefined
  const trimmed = nag.replace('$', '')
  const value = Number.parseInt(trimmed, 10)
  return Number.isFinite(value) ? value : undefined
}

function extractComment(move: any): string | undefined {
  if (typeof move?.commentAfter === 'string' && move.commentAfter.trim()) {
    return move.commentAfter.trim()
  }
  if (typeof move?.commentBefore === 'string' && move.commentBefore.trim()) {
    return move.commentBefore.trim()
  }
  if (typeof move?.comment === 'string' && move.comment.trim()) {
    return move.comment.trim()
  }
  if (
    typeof move?.commentDiag?.comment === 'string' &&
    move.commentDiag.comment.trim()
  ) {
    return move.commentDiag.comment.trim()
  }
  return undefined
}

function toVariationMove(move: any): VariationMoveInput {
  return {
    san: move?.notation?.notation ?? null,
    comment: extractComment(move),
    nags: (() => {
      const nagValue = parseNag(move?.nag)
      return nagValue !== undefined ? [nagValue] : undefined
    })(),
  }
}

function buildTreeFromMoves(
  tree: VariationTree,
  parentId: string,
  moves: any[],
  asMainline: boolean
): VariationTree {
  let currentTree = tree
  let currentParentId = parentId

  moves.forEach((move, index) => {
    const moveInput = toVariationMove(move)
    const { tree: updatedTree, lastNode } = appendMovesAtNode(
      currentTree,
      currentParentId,
      [moveInput],
      asMainline && index === 0
    )

    currentTree = updatedTree
    const targetNode = lastNode
    if (!targetNode) {
      return
    }

    if (Array.isArray(move?.variations)) {
      move.variations.forEach((variation: any[]) => {
        currentTree = buildTreeFromMoves(
          currentTree,
          targetNode.id,
          variation,
          false
        )
      })
    }

    currentParentId = targetNode.id
  })

  return currentTree
}

function buildMetadata(tags: Record<string, string | undefined>): GameMetadata {
  const filteredTags = { ...tags }
  delete (filteredTags as any).messages

  return {
    title: filteredTags.Event,
    event: filteredTags.Event,
    site: filteredTags.Site,
    date: filteredTags.Date,
    round: filteredTags.Round,
    white: filteredTags.White,
    black: filteredTags.Black,
    whiteElo: filteredTags.WhiteElo
      ? Number.parseInt(filteredTags.WhiteElo, 10)
      : undefined,
    blackElo: filteredTags.BlackElo
      ? Number.parseInt(filteredTags.BlackElo, 10)
      : undefined,
    result: filteredTags.Result,
    eco: filteredTags.ECO,
    additionalHeaders: filteredTags,
  }
}

export function parsePgn(pgn: string): ParsedGame {
  if (!pgn.trim()) {
    throw new Error('PGN text is empty.')
  }

  let parsed
  try {
    parsed = parse(pgn, { startRule: 'game', sloppy: true })
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Unable to parse PGN input.'
    )
  }

  if (!parsed) {
    throw new Error('No game found in PGN input.')
  }

  const game = Array.isArray(parsed) ? parsed[0] : parsed
  if (!game) {
    throw new Error('No game found in PGN input.')
  }

  const tags = game.tags ?? {}
  const initialFen = tags.FEN ?? new Chess().fen()

  let tree = createInitialTree(initialFen)
  if (Array.isArray(game.moves) && game.moves.length > 0) {
    tree = buildTreeFromMoves(tree, tree.root.id, game.moves, true)
  }

  const metadata = buildMetadata(tags)

  return {
    tree,
    metadata,
  }
}

export type { ParsedGame }

const DEFAULT_FEN = new Chess().fen()

function formatTag(key: string, value: string) {
  return `[${key} "${value.replace(/"/g, "'")}"]`
}

function formatDate(date?: string) {
  if (!date) return '????.??.??'
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(date)) return date
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date.replace(/-/g, '.')
  }
  return date
}

function serializeMoves(
  startNode: VariationNode | undefined,
  isVariationStart: boolean
): string {
  if (!startNode) return ''

  const tokens: string[] = []
  let current: VariationNode | undefined = startNode
  let first = isVariationStart

  while (current) {
    const includeMoveNumber =
      current.color === 'w' ||
      (current.color === 'b' && (first || tokens.length === 0))

    if (includeMoveNumber) {
      if (current.color === 'w') {
        tokens.push(`${current.moveNumber}.`)
      } else if (current.color === 'b') {
        tokens.push(`${current.moveNumber}...`)
      }
    }

    if (current.san) {
      tokens.push(current.san)
    }

    if (current.nags) {
      current.nags.forEach((nag) => tokens.push(`$${nag}`))
    }

    if (current.comment) {
      tokens.push(`{${current.comment}}`)
    }

    current.children.slice(1).forEach((variation) => {
      const variationText = serializeMoves(variation, true)
      if (variationText) {
        tokens.push(`(${variationText})`)
      }
    })

    current = current.children[0]
    first = false
  }

  return tokens.join(' ').replace(/\s+/g, ' ').trim()
}

export function serializePgn(
  tree: VariationTree,
  metadata: GameMetadata
): string {
  const tags: string[] = []
  const usedKeys = new Set<string>()
  const headers: Array<[string, string]> = [
    ['Event', metadata.event ?? metadata.title ?? '?'],
    ['Site', metadata.site ?? '?'],
    ['Date', formatDate(metadata.date)],
    ['Round', metadata.round ?? '?'],
    ['White', metadata.white ?? '?'],
    ['Black', metadata.black ?? '?'],
    ['Result', metadata.result ?? '*'],
  ]

  if (metadata.whiteElo !== undefined) {
    headers.push(['WhiteElo', String(metadata.whiteElo)])
  }
  if (metadata.blackElo !== undefined) {
    headers.push(['BlackElo', String(metadata.blackElo)])
  }
  if (metadata.eco) {
    headers.push(['ECO', metadata.eco])
  }

  const initialFen = tree.root.fenAfter
  if (initialFen && initialFen !== DEFAULT_FEN) {
    headers.push(['SetUp', '1'])
    headers.push(['FEN', initialFen])
  }

  headers.forEach(([key, value]) => {
    usedKeys.add(key.toLowerCase())
    tags.push(formatTag(key, value || '?'))
  })

  if (metadata.additionalHeaders) {
    Object.entries(metadata.additionalHeaders).forEach(([key, value]) => {
      if (!value) return
      if (usedKeys.has(key.toLowerCase())) return
      tags.push(formatTag(key, value))
      usedKeys.add(key.toLowerCase())
    })
  }

  const moveText = serializeMoves(tree.root.children[0], true)
  const resultToken = metadata.result ?? '*'
  const body = moveText
    ? `${moveText} ${resultToken}`.trim()
    : resultToken

  return `${tags.join('\n')}\n\n${body}`.trim()
}

