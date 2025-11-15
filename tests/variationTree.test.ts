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

    // 1. e4
    let result = appendMovesAtNode(tree, tree.root.id, [{ san: 'e4' }], true)
    tree = result.tree
    const e4Node = result.lastNode
    expect(e4Node?.san).toBe('e4')

    // 1... e5
    result = appendMovesAtNode(tree, e4Node!.id, [{ san: 'e5' }], true)
    tree = result.tree
    const e5Node = result.lastNode
    expect(e5Node?.san).toBe('e5')

    // 2. Nf3
    result = appendMovesAtNode(tree, e5Node!.id, [{ san: 'Nf3' }], true)
    tree = result.tree
    const nf3Node = result.lastNode
    expect(nf3Node?.san).toBe('Nf3')

    // Variation: 1... c5
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
    expect(path?.length).toBe(4) // root + three moves

    const lookup = getNodeById(tree, c5Node!.id)
    expect(lookup?.san).toBe('c5')
  })
})

