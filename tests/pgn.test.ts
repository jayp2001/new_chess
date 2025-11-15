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

  const nestedPgn = `[Event "Nested Variations"]
[Site "Internet"]
[Date "2024.02.02"]
[Round "1"]
[White "Alpha"]
[Black "Beta"]
[Result "*"]

1. e4 e5 (1... c5 2. Nf3 (2... d6 3. d4)) 2. Nf3 Nc6 *
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
      expect(output).toContain('1. e4 (1... c5 2. Nf3) e5')
      expect(output).toContain('Nc6 *')
    })

    it('parses and preserves nested variations', () => {
      const { tree, metadata } = parsePgn(nestedPgn)
      const firstMove = tree.root.children[0]
      expect(firstMove?.san).toBe('e4')

      const mainlineReply = firstMove?.children[0]
      expect(mainlineReply?.san).toBe('e5')

      const sicilian = firstMove?.children[1]
      expect(sicilian?.san).toBe('c5')

    const nestedWhite = sicilian?.children[0]
    expect(nestedWhite?.san).toBe('Nf3')
    const nestedVariation = nestedWhite?.children[0]
      expect(nestedVariation?.san).toBe('d6')
      expect(nestedVariation?.children[0]?.san).toBe('d4')

    const output = serializePgn(tree, metadata)
    expect(output).toContain('(1... c5 2. Nf3 (2... d6 3. d4))')
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

