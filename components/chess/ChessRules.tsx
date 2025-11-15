'use client'

import { useRef } from 'react'
import { Chess, Square } from 'chess.js'

export class ChessRules {
  private game: Chess

  constructor(fen?: string) {
    this.game = new Chess(fen)
  }

  // Get current FEN position
  getFen(): string {
    return this.game.fen()
  }

  // Get current game state
  getGameState() {
    return {
      fen: this.game.fen(),
      turn: this.game.turn(),
      isCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isGameOver: this.game.isGameOver(),
      isInsufficientMaterial: this.game.isInsufficientMaterial(),
      isThreefoldRepetition: this.game.isThreefoldRepetition(),
      history: this.game.history({ verbose: true }),
      pgn: this.game.pgn(),
    }
  }

  // Check if a move is valid
  isValidMove(from: Square | string, to: Square | string, promotion?: string): boolean {
    try {
      const moves = this.game.moves({
        square: from as Square,
        verbose: true,
      })
      return moves.some(
        (move) =>
          move.to === to &&
          (!promotion || move.promotion === promotion || !move.promotion)
      )
    } catch {
      return false
    }
  }

  // Get all valid moves for a square
  getValidMoves(from: Square | string) {
    try {
      return this.game.moves({
        square: from as Square,
        verbose: true,
      })
    } catch {
      return []
    }
  }

  // Get all valid moves for all pieces
  getAllValidMoves() {
    const moves: { [key: string]: string[] } = {}
    const squares: Square[] = [
      'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
      'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
      'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
      'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
      'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
      'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
      'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
      'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
    ]

    squares.forEach((square) => {
      const piece = this.game.get(square)
      if (piece && piece.color === this.game.turn()) {
        const movesForSquare = this.game.moves({
          square,
          verbose: true,
        })
        if (movesForSquare.length > 0) {
          moves[square] = movesForSquare.map((move) => move.to)
        }
      }
    })

    return moves
  }

  // Make a move
  makeMove(from: Square | string, to: Square | string, promotion?: string) {
    try {
      const move = this.game.move({
        from: from as Square,
        to: to as Square,
        promotion: promotion as any,
      })
      return move
    } catch (error) {
      throw new Error(`Invalid move: ${error}`)
    }
  }

  // Undo last move
  undoMove() {
    const move = this.game.undo()
    return move
  }

  // Reset game to starting position
  reset() {
    this.game.reset()
  }

  // Load position from FEN
  loadPosition(fen: string) {
    try {
      this.game.load(fen)
    } catch (error) {
      throw new Error(`Invalid FEN: ${error}`)
    }
  }

  // Load game from PGN
  loadPgn(pgn: string) {
    try {
      this.game.loadPgn(pgn)
    } catch (error) {
      throw new Error(`Invalid PGN: ${error}`)
    }
  }

  // Get piece on a square
  getPiece(square: Square | string) {
    return this.game.get(square as Square)
  }

  // Check if square is under attack
  isSquareUnderAttack(square: Square | string, color: 'w' | 'b') {
    return this.game.isAttacked(square as Square, color)
  }

  // Check if move would put own king in check
  wouldMoveLeaveKingInCheck(from: Square | string, to: Square | string) {
    const testGame = new Chess(this.game.fen())
    const currentTurn = testGame.turn()
    try {
      const move = testGame.move({ from: from as Square, to: to as Square })
      // After the move, the turn switches. Check if the king of the player who just moved is attacked
      // Find the king square of the player who just moved
      const kingSquare = this.findKingSquare(testGame, currentTurn)
      if (!kingSquare) return true
      
      // Check if the king is attacked by the opponent
      const opponentColor = currentTurn === 'w' ? 'b' : 'w'
      return testGame.isAttacked(kingSquare, opponentColor)
    } catch {
      return true
    }
  }

  // Helper method to find king square
  private findKingSquare(game: Chess, color: 'w' | 'b'): Square | null {
    const squares: Square[] = [
      'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
      'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
      'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
      'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
      'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
      'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
      'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
      'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
    ]
    
    for (const square of squares) {
      const piece = game.get(square)
      if (piece && piece.type === 'k' && piece.color === color) {
        return square
      }
    }
    return null
  }

  // Get the internal chess.js game instance
  getGame() {
    return this.game
  }
}

// Hook to use ChessRules
export function useChessRules(fen?: string) {
  const rulesRef = useRef<ChessRules | null>(null)

  if (!rulesRef.current) {
    rulesRef.current = new ChessRules(fen)
  }

  return rulesRef.current
}

