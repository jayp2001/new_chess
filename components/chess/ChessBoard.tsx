'use client'

import { Chessboard } from 'react-chessboard'
import { useChessGame } from '@/hooks/useChessGame'
import { Chess } from 'chess.js'

interface ChessBoardProps {
  position?: string // FEN notation
  onMove?: (from: string, to: string) => boolean | void
  boardOrientation?: 'white' | 'black'
  arePiecesDraggable?: boolean
  customBoardStyle?: React.CSSProperties
  customSquareStyles?: { [square: string]: React.CSSProperties }
  showBoardNotation?: boolean
}

export function ChessBoard({
  position,
  onMove,
  boardOrientation = 'white',
  arePiecesDraggable = true,
  customBoardStyle,
  customSquareStyles,
  showBoardNotation = true,
}: ChessBoardProps) {
  const { game, makeMove, resetGame, getPosition, isValidMove } = useChessGame(position)

  const handlePieceDrop = (sourceSquare: string, targetSquare: string) => {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Default to queen promotion
    }

    try {
      const gameCopy = new Chess(game.fen())
      const result = gameCopy.move(move)

      if (result) {
        // If custom onMove handler is provided, use it
        if (onMove) {
          const moveResult = onMove(sourceSquare, targetSquare)
          if (moveResult === false) {
            return false // Prevent the move
          }
        }
        makeMove(move)
        return true
      }
      return false // Invalid move
    } catch (error) {
      return false // Invalid move
    }
  }

  return (
    <div className="w-full max-w-[600px] aspect-square mx-auto">
      <Chessboard
        position={game.fen()}
        onPieceDrop={handlePieceDrop}
        boardOrientation={boardOrientation}
        arePiecesDraggable={arePiecesDraggable}
        customBoardStyle={customBoardStyle}
        customSquareStyles={customSquareStyles}
        showBoardNotation={showBoardNotation}
        boardWidth={600}
      />
    </div>
  )
}

