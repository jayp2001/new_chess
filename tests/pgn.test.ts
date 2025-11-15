import { describe, expect, it } from 'vitest'
import { parsePgn, serializePgn } from '@/lib/chess/pgn'
import { createInitialTree } from '@/lib/chess/variationTree'

describe('pgn utilities', () => {
  const samplePgn = `[Event "Test Event"]
[Site "Internet"]
[Date "2024.01.01"]
[Round "1"]
[White "White Player"]
[Black "Black Player"]
[Result "*"]

1. e4 e5 (1... c5 2. Nf3) 2. Nf3 Nc6 *
`

  it('parses PGN into variation tree', () => {
    const { tree, metadata } = parsePgn(samplePgn)
    expect(metadata.event).toBe('Test Event')
    const firstMove = tree.root.children[0]
    expect(firstMove?.san).toBe('e4')
    const firstVariation = firstMove?.children[1]
    expect(firstVariation?.san).toBe('c5')
  })

  it('serializes variation tree back to PGN', () => {
    const { tree, metadata } = parsePgn(samplePgn)
    const output = serializePgn(tree, metadata)
    expect(output).toContain('[Event "Test Event"]')
    expect(output).toContain('1. e4 e5')
    expect(output).toContain('(1... c5 2. Nf3)')
  })

  it('handles empty tree when exporting', () => {
    const tree = createInitialTree()
    const metadata = {
      title: '',
      event: 'Untitled',
      site: '',
      date: '',
      round: '',
      white: '',
      black: '',
      whiteElo: undefined,
      blackElo: undefined,
      result: '*',
      eco: '',
      additionalHeaders: {},
    }
    const output = serializePgn(tree, metadata)
    expect(output).toContain('[Event "Untitled"]')
    expect(output.trim().endsWith('*')).toBe(true)
  })
})

