import { describe, expect, it } from 'vitest'
import {
  appendMovesAtNode,
  createInitialTree,
  getNodeById,
  getPathToNode,
} from '@/lib/chess/variationTree'

describe('variationTree', () => {
  it('builds mainline and variation branches', () => {
    let tree = createInitialTree()

    let result = appendMovesAtNode(tree, tree.root.id, [{ san: 'e4' }], true)
    tree = result.tree
    const e4Node = result.lastNode
    expect(e4Node?.san).toBe('e4')

    result = appendMovesAtNode(tree, e4Node!.id, [{ san: 'e5' }], true)
    tree = result.tree
    const e5Node = result.lastNode
    expect(e5Node?.san).toBe('e5')

    result = appendMovesAtNode(tree, e5Node!.id, [{ san: 'Nf3' }], true)
    tree = result.tree
    const nf3Node = result.lastNode
    expect(nf3Node?.san).toBe('Nf3')

    result = appendMovesAtNode(tree, e4Node!.id, [{ san: 'c5' }], false)
    tree = result.tree
    const c5Node = result.lastNode
    expect(c5Node?.san).toBe('c5')

    const mainlineHead = tree.root.children[0]
    expect(mainlineHead?.san).toBe('e4')
    expect(mainlineHead?.children[0]?.san).toBe('e5')
    expect(mainlineHead?.children[0]?.children[0]?.san).toBe('Nf3')
    expect(mainlineHead?.children[1]?.san).toBe('c5')

    const path = getPathToNode(tree, nf3Node!.id)
    expect(path?.map((node) => node.san)).toEqual([null, 'e4', 'e5', 'Nf3'])

    const lookup = getNodeById(tree, c5Node!.id)
    expect(lookup?.san).toBe('c5')
  })

  it('tracks move numbers, colors, and nested variation paths', () => {
    let tree = createInitialTree()

    // 1. d4 d5 2. c4
    let result = appendMovesAtNode(
      tree,
      tree.root.id,
      [{ san: 'd4' }, { san: 'd5' }, { san: 'c4' }],
      true
    )
    tree = result.tree
    const c4Node = result.lastNode!
    expect(c4Node.moveNumber).toBe(2)
    expect(c4Node.color).toBe('w')

    const d5Node = getNodeById(tree, c4Node.parentId!)
    expect(d5Node?.moveNumber).toBe(1)
    expect(d5Node?.color).toBe('b')

    // Variation branch from 1...d5: 2. c4 e6 3. Nc3
    result = appendMovesAtNode(
      tree,
      d5Node!.id,
      [{ san: 'c4' }, { san: 'e6' }, { san: 'Nc3' }],
      false
    )
    tree = result.tree
    const nc3Node = result.lastNode!

    // Nested variation from 2...e6: 3. Nf3
    const variationParent = getNodeById(tree, nc3Node.parentId!)
    result = appendMovesAtNode(tree, variationParent!.id, [{ san: 'Nf3' }], false)
    tree = result.tree
    const nf3Variation = result.lastNode!

    const path = getPathToNode(tree, nf3Variation.id)
    expect(path).toBeDefined()
    expect(path!.length).toBe(6)
    expect(path!.map((node) => node.san)).toEqual([
      null,
      'd4',
      'd5',
      'c4',
      'e6',
      'Nf3',
    ])
    expect(path![5].moveNumber).toBe(3)
    expect(path![5].color).toBe('w')
  })

  it('returns undefined paths for missing nodes', () => {
    const tree = createInitialTree()
    expect(getPathToNode(tree, 'missing-node')).toBeUndefined()
  })
})

