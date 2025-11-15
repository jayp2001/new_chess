import { useEffect, useMemo } from 'react'
import type { VariationNode, VariationTree } from '@/types/chess'
import { cn } from '@/lib/utils'

interface NotationPanelProps {
  tree: VariationTree
  currentNodeId: string
  onSelectNode: (nodeId: string) => void
}

function renderSequence(
  startNode: VariationNode | undefined,
  currentNodeId: string,
  onSelect: (nodeId: string) => void,
  isVariationStart = false
): JSX.Element | null {
  if (!startNode) return null

  const elements: JSX.Element[] = []
  let current: VariationNode | undefined = startNode
  let firstInFragment = isVariationStart

  while (current) {
    const includeMoveNumber =
      current.color === 'w' ||
      (current.color === 'b' && (firstInFragment || elements.length === 0))
    if (includeMoveNumber) {
      const label =
        current.color === 'w' ? `${current.moveNumber}.` : `${current.moveNumber}...`
      elements.push(
        <span key={`${current.id}-label`} className="mr-1 text-muted-foreground">
          {label}
        </span>
      )
    }

    elements.push(
      <span
        key={current.id}
        id={`notation-${current.id}`}
        onClick={() => onSelect(current.id)}
        className={cn(
          'cursor-pointer rounded px-1 py-0.5 text-sm transition-colors',
          current.id === currentNodeId
            ? 'bg-secondary font-semibold text-foreground'
            : 'text-foreground hover:bg-muted'
        )}
      >
        {current.san ?? '…'}
      </span>
    )

    const variationChildren = current.children.slice(1)
    variationChildren.forEach((variation) => {
      elements.push(
        <span key={`${variation.id}-variation`} className="text-muted-foreground">
          {' ('}
          {renderSequence(variation, currentNodeId, onSelect, true)}
          {') '}
        </span>
      )
    })

    current = current.children[0]
    firstInFragment = false
  }

  return <>{elements}</>
}

export function NotationPanel({ tree, currentNodeId, onSelectNode }: NotationPanelProps) {
  const notationContent = useMemo(() => {
    return renderSequence(tree.root.children[0], currentNodeId, onSelectNode, false)
  }, [currentNodeId, onSelectNode, tree])

  useEffect(() => {
    const active = document.getElementById(`notation-${currentNodeId}`)
    if (active) {
      active.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [currentNodeId])

  return (
    <div className="max-h-[420px] overflow-y-auto rounded border border-border/60 bg-background px-3 py-2 text-sm leading-relaxed text-foreground">
      {notationContent ?? (
        <p className="text-muted-foreground">No moves yet. Play a move to begin notation.</p>
      )}
    </div>
  )
}

