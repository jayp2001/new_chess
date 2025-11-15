'use client'

import { useState } from 'react'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { useChessEngine } from '@/components/chess/ChessEngine'
import { ChessRules } from '@/components/chess/ChessRules'
import { useChessGame } from '@/hooks/useChessGame'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Chess } from 'chess.js'

export default function DemoPage() {
  const { game, makeMove, resetGame, gameState } = useChessGame()
  const rules = new ChessRules(game.fen())
  const [evaluation, setEvaluation] = useState<number | null>(null)

  const { calculateBestMove, isThinking, stopThinking } = useChessEngine({
    game,
    depth: 10,
    onBestMove: (move) => {
      // Apply engine move
      const from = move.substring(0, 2)
      const to = move.substring(2, 4)
      makeMove({ from, to })
    },
    onEvaluation: (score) => {
      setEvaluation(score)
    },
    enabled: true,
  })

  const handleEngineMove = () => {
    calculateBestMove(game.fen())
  }

  const currentGameState = rules.getGameState()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Chess Components Demo</CardTitle>
            <CardDescription>
              This page demonstrates the reusable chess components working together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chess Board */}
              <div className="lg:col-span-2">
                <ChessBoard
                  position={game.fen()}
                  onMove={(from, to) => {
                    const isValid = rules.isValidMove(from, to)
                    if (isValid) {
                      try {
                        rules.makeMove(from, to)
                        makeMove({ from, to })
                        return true
                      } catch {
                        return false
                      }
                    }
                    return false
                  }}
                  boardOrientation="white"
                  arePiecesDraggable={true}
                  showBoardNotation={true}
                />
              </div>

              {/* Game Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Game State</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <strong>Turn:</strong> {gameState.turn === 'w' ? 'White' : 'Black'}
                    </div>
                    {gameState.isCheck && (
                      <div className="text-destructive">
                        <strong>Check!</strong>
                      </div>
                    )}
                    {gameState.isCheckmate && (
                      <div className="text-destructive">
                        <strong>Checkmate!</strong>
                      </div>
                    )}
                    {gameState.isStalemate && (
                      <div className="text-muted-foreground">
                        <strong>Stalemate</strong>
                      </div>
                    )}
                    {gameState.isDraw && (
                      <div className="text-muted-foreground">
                        <strong>Draw</strong>
                      </div>
                    )}
                    {evaluation !== null && (
                      <div>
                        <strong>Evaluation:</strong> {evaluation > 0 ? '+' : ''}
                        {evaluation.toFixed(2)}
                      </div>
                    )}
                    {isThinking && (
                      <div className="text-primary">
                        <strong>Engine thinking...</strong>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button onClick={resetGame} variant="outline" className="w-full">
                      Reset Game
                    </Button>
                    <Button
                      onClick={handleEngineMove}
                      disabled={isThinking || gameState.isGameOver}
                      className="w-full"
                    >
                      {isThinking ? 'Thinking...' : 'Get Engine Move'}
                    </Button>
                    {isThinking && (
                      <Button
                        onClick={stopThinking}
                        variant="destructive"
                        className="w-full"
                      >
                        Stop Engine
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Move History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
                      {gameState.history.length === 0 && (
                        <div className="text-muted-foreground">No moves yet</div>
                      )}
                      {gameState.history.map((move, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {Math.floor(index / 2) + 1}.
                            {index % 2 === 0 ? '' : '..'}
                          </span>
                          <span>{move.san}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

