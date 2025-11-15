'use client'

import type { CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import type { ChessboardOptions } from 'react-chessboard/dist/ChessboardProvider'
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
  const handlePieceDrop: NonNullable<ChessboardOptions['onPieceDrop']> = ({
    sourceSquare,
    targetSquare,
  }) => {
    if (!isInteractive) {
      return false
    }

    if (!targetSquare || sourceSquare === targetSquare) {
      return false
    }

    const moveResult = onMove?.({
      from: sourceSquare as Square,
      to: targetSquare as Square,
      promotion: DEFAULT_PROMOTION,
    })

    if (moveResult === false) {
      return false
    }

    return true
  }

  const arrowOptions: ChessboardOptions['arrows'] = arrows.map((arrow) => ({
    startSquare: arrow.from,
    endSquare: arrow.to,
    color: arrow.color ?? 'rgba(250, 204, 21, 0.85)',
  }))

  const options: ChessboardOptions = {
    id: 'analysis-board',
    position: fen,
    boardOrientation,
    allowDragging: isInteractive && arePiecesDraggable,
    showNotation: showBoardNotation,
    boardStyle: {
      ...(customBoardStyle ?? {}),
      maxWidth: width,
      width: '100%',
      aspectRatio: '1 / 1',
    },
    squareStyles: customSquareStyles,
    arrows: arrowOptions,
    onPieceDrop: handlePieceDrop,
  }

  return (
    <div className={cn('relative mx-auto w-full', className)} style={{ maxWidth: width }}>
      <Chessboard options={options} />
    </div>
  )
}
