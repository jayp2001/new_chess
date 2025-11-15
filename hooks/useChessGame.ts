'use client'

import { useState, useCallback, useMemo } from 'react'
import { Chess, Square } from 'chess.js'

export function useChessGame(initialFen?: string) {
  const [game, setGame] = useState<Chess>(() => new Chess(initialFen))

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    setGame((currentGame) => {
      const newGame = new Chess(currentGame.fen())
      try {
        newGame.move(move)
        return newGame
      } catch (error) {
        return currentGame
      }
    })
  }, [])

  const resetGame = useCallback(() => {
    setGame(new Chess(initialFen))
  }, [initialFen])

  const undoMove = useCallback(() => {
    setGame((currentGame) => {
      const newGame = new Chess(currentGame.fen())
      newGame.undo()
      return newGame
    })
  }, [])

  const getPosition = useCallback(() => {
    return game.fen()
  }, [game])

  const isValidMove = useCallback((from: Square | string, to: Square | string) => {
    try {
      const moves = game.moves({
        square: from as Square,
        verbose: true,
      })
      return moves.some((move) => move.to === to)
    } catch {
      return false
    }
  }, [game])

  const gameState = useMemo(() => {
    return {
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isStalemate: game.isStalemate(),
      isDraw: game.isDraw(),
      isGameOver: game.isGameOver(),
      turn: game.turn(),
      history: game.history({ verbose: true }),
    }
  }, [game])

  return {
    game,
    makeMove,
    resetGame,
    undoMove,
    getPosition,
    isValidMove,
    gameState,
  }
}

