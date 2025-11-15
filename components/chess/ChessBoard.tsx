'use client'

import type { CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import { cn } from '@/lib/utils'

type Square = `${'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

interface BoardMove {
  from: Square
  to: Square
  promotion?: string
}

interface BoardArrow {
  from: Square
  to: Square
  color?: string
}

interface ChessBoardProps {
  fen: string
  onMove?: (move: BoardMove) => boolean | void
  boardOrientation?: 'white' | 'black'
  arePiecesDraggable?: boolean
  isInteractive?: boolean
  customBoardStyle?: CSSProperties
  customSquareStyles?: { [square: string]: CSSProperties }
  showBoardNotation?: boolean
  arrows?: BoardArrow[]
  width?: number
  className?: string
}

const DEFAULT_PROMOTION = 'q'
const DEFAULT_WIDTH = 560

export function ChessBoard({
  fen,
  onMove,
  boardOrientation = 'white',
  arePiecesDraggable = true,
  isInteractive = true,
  customBoardStyle,
  customSquareStyles,
  showBoardNotation = true,
  arrows = [],
  width = DEFAULT_WIDTH,
  className,
}: ChessBoardProps) {
  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (!isInteractive) {
      return false
    }

    if (sourceSquare === targetSquare) {
      return false
    }

    const moveResult = onMove?.({
      from: sourceSquare,
      to: targetSquare,
      promotion: DEFAULT_PROMOTION,
    })

    if (moveResult === false) {
      return false
    }

    return true
  }

  return (
    <div className={cn('relative mx-auto w-full', className)}>
      <Chessboard
        position={fen}
        onPieceDrop={handlePieceDrop}
        boardOrientation={boardOrientation}
        arePiecesDraggable={isInteractive && arePiecesDraggable}
        customBoardStyle={customBoardStyle}
        customSquareStyles={customSquareStyles}
        showBoardNotation={showBoardNotation}
        customArrows={arrows.map((arrow) => [
          arrow.from,
          arrow.to,
          arrow.color ?? 'rgba(250, 204, 21, 0.85)',
        ])}
        boardWidth={width}
        id="analysis-board"
      />
    </div>
  )
}
