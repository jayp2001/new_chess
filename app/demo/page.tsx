'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { useChessGame } from '@/hooks/useChessGame'
import { useStockfishEngine } from '@/hooks/useStockfishEngine'
import { NotationPanel } from '@/components/analysis/NotationPanel'
import {
  appendMovesAtNode,
  createInitialTree,
  getNodeById,
} from '@/lib/chess/variationTree'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AnalysisDemoPage() {
  const { game, makeMove, undoMove, resetGame, gameState } = useChessGame()
  const stockfish = useStockfishEngine({ multiPv: 3 })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [displayFen, setDisplayFen] = useState<string | null>(null)

  const handleBoardMove = useCallback(
    ({ from, to, promotion }: { from: string; to: string; promotion?: string }) => {
      try {
        const snapshot = new Chess(game.fen())
          const result = snapshot.move({ from, to, promotion })
          if (!result) {
            return false
          }
          makeMove({ from, to, promotion })
          setDisplayFen(null)
          return true
      } catch {
        return false
      }
    },
    [game, makeMove]
  )

  const notationTree = useMemo(() => {
    let tree = createInitialTree()
    let parentId = tree.root.id
    let lastNodeId = tree.root.id
    gameState.history.forEach((move) => {
      const result = appendMovesAtNode(tree, parentId, [{ san: move.san }], true)
      tree = result.tree
      if (result.lastNode) {
        parentId = result.lastNode.id
        lastNodeId = result.lastNode.id
      }
    })
    return { tree, lastNodeId }
  }, [gameState.history])

  useEffect(() => {
    const id = notationTree.lastNodeId
    const timeout = setTimeout(() => {
      setSelectedNodeId(id)
      setDisplayFen(null)
    }, 0)
    return () => clearTimeout(timeout)
  }, [notationTree.lastNodeId])

  const handleSelectNotationNode = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    if (nodeId === notationTree.lastNodeId) {
      setDisplayFen(null)
      return
    }
    const node = getNodeById(notationTree.tree, nodeId)
    if (node?.fenAfter) {
      setDisplayFen(node.fenAfter)
    } else {
      setDisplayFen(notationTree.tree.root.fenAfter)
    }
  }

  const startEngineAnalysis = () => {
    stockfish.analyzePosition({
      fen: displayFen ?? game.fen(),
    })
  }

  const stopEngine = () => {
    stockfish.stop()
  }

  const renderScore = (line: { scoreCp?: number; scoreMate?: number }) => {
    if (typeof line.scoreMate === 'number') {
      return `M${line.scoreMate}`
    }
    if (typeof line.scoreCp === 'number') {
      const value = (line.scoreCp / 100).toFixed(2)
      return value.startsWith('-') ? value : `+${value}`
    }
    return '—'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8">
        <header className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Proof of concept
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Chess Analysis Board
            </h1>
            <p className="text-sm text-muted-foreground">
              Board on the left, notation and engine tools on the right.
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled>
              Import PGN
            </Button>
            <Button variant="outline" size="sm" disabled>
              Export PGN
            </Button>
            <Button size="sm" disabled>
              Save to Supabase
            </Button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Analysis board</CardTitle>
                  <CardDescription>
                    Drag pieces or use controls to explore the position.
                  </CardDescription>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{gameState.turn === 'w' ? "White's move" : "Black's move"}</div>
                  {gameState.isGameOver && <div className="text-destructive">Game over</div>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mx-auto max-w-[min(640px,100%)] space-y-3">
                  {displayFen && (
                    <p className="text-xs text-muted-foreground">
                      Viewing a historical move. Resume play to re-enable board interactions.
                    </p>
                  )}
                  <ChessBoard
                    fen={displayFen ?? game.fen()}
                    onMove={handleBoardMove}
                    boardOrientation="white"
                    showBoardNotation
                    isInteractive={!displayFen}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick controls</CardTitle>
                <CardDescription>
                  Basic navigation hooks until the full variation tree is wired.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={resetGame}>
                  Reset to start
                </Button>
                <Button
                  variant="outline"
                  onClick={undoMove}
                  disabled={gameState.history.length === 0}
                >
                  Undo move
                </Button>
                <Button variant="outline" disabled>
                  Forward
                </Button>
                <Button variant="outline" disabled>
                  Autoplay
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game state</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Turn</span>
                  <span className="font-medium">
                    {gameState.turn === 'w' ? 'White' : 'Black'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check</span>
                  <span className={gameState.isCheck ? 'text-destructive' : ''}>
                    {gameState.isCheck ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Checkmate</span>
                  <span className={gameState.isCheckmate ? 'text-destructive' : ''}>
                    {gameState.isCheckmate ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Draw</span>
                  <span>{gameState.isDraw ? 'Yes' : 'No'}</span>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notation</CardTitle>
                <CardDescription>
                  Click a move to jump to that position. Variations will appear inline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotationPanel
                  tree={notationTree.tree}
                  currentNodeId={selectedNodeId ?? notationTree.tree.root.id}
                  onSelectNode={handleSelectNotationNode}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engine panel</CardTitle>
                <CardDescription>
                  {stockfish.status === 'error'
                    ? stockfish.error ?? 'Engine error'
                    : `Status: ${stockfish.status}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={startEngineAnalysis}
                    disabled={stockfish.status === 'thinking'}
                  >
                    {stockfish.status === 'thinking' ? 'Analyzing…' : 'Analyze position'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopEngine}
                    disabled={stockfish.status !== 'thinking'}
                  >
                    Stop
                  </Button>
                </div>
                {stockfish.bestMove && (
                  <p className="text-foreground">
                    Best move suggestion: <span className="font-medium">{stockfish.bestMove}</span>
                  </p>
                )}
                {stockfish.lines.length === 0 ? (
                  <p>No engine lines yet. Start an analysis to view suggestions.</p>
                ) : (
                  <ul className="space-y-2 text-foreground">
                    {stockfish.lines.map((line) => (
                      <li
                        key={line.id}
                        className="rounded border border-border px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            #{line.multipv} {line.pvSan[0] ?? line.pvUci[0]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {renderScore(line)}
                          </span>
                        </div>
                        {line.pvSan.length > 1 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {line.pvSan.slice(1, 6).join(' ')}
                            {line.pvSan.length > 6 ? ' …' : ''}
                          </p>
                        )}
                        {line.depth && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Depth {line.depth}
                            {line.nps ? ` • ${Math.round(line.nps / 1000)} knps` : ''}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}
