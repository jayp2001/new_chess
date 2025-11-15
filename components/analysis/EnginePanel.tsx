'use client'

import { EngineEvaluation, EngineOptionState, EngineTopMove } from '@/types/chess'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function formatScore(move: EngineTopMove) {
  if (typeof move.scoreCp === 'number') {
    const value = move.scoreCp / 100
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}`
  }

  if (typeof move.mateIn === 'number') {
    return `Mate in ${Math.abs(move.mateIn)}`
  }

  return '—'
}

interface EnginePanelProps {
  isRunning: boolean
  isAvailable: boolean
  evaluation: EngineEvaluation | null
  topMoves: EngineTopMove[]
  options: EngineOptionState
  onOptionsChange: (updates: Partial<EngineOptionState>) => void
  onStart: () => void
  onStop: () => void
}

export function EnginePanel({
  isRunning,
  isAvailable,
  evaluation,
  topMoves,
  options,
  onOptionsChange,
  onStart,
  onStop,
}: EnginePanelProps) {
  const multiPvMax = options.maxSuggestions ?? 5

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <span
          className={cn(
            'text-sm font-medium',
            !isAvailable && 'text-destructive',
            isRunning && 'text-primary'
          )}
        >
          {!isAvailable ? 'Unavailable' : isRunning ? 'Running' : 'Idle'}
        </span>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={isRunning ? onStop : onStart}
            disabled={!isAvailable}
          >
            {isRunning ? 'Stop Engine' : 'Start Engine'}
          </Button>
          <Button
            size="sm"
            variant={options.showArrows ? 'default' : 'outline'}
            onClick={() =>
              onOptionsChange({ showArrows: !options.showArrows })
            }
          >
            Arrows: {options.showArrows ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="multiPv">Multi PV</Label>
          <Input
            id="multiPv"
            type="number"
            min={1}
            max={multiPvMax}
            value={options.multiPv}
            disabled={!isAvailable || isRunning}
            onChange={(event) =>
              onOptionsChange({ multiPv: Number(event.target.value) })
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="depth">Depth</Label>
          <Input
            id="depth"
            type="number"
            min={1}
            max={99}
            value={options.depth ?? ''}
            disabled={!isAvailable || isRunning}
            onChange={(event) =>
              onOptionsChange({
                depth: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="movetime">Movetime (ms)</Label>
          <Input
            id="movetime"
            type="number"
            min={0}
            value={options.movetimeMs ?? ''}
            disabled={!isAvailable || isRunning}
            onChange={(event) =>
              onOptionsChange({
                movetimeMs: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-dashed border-muted-foreground/40 p-4">
        <div className="flex items-baseline justify-between">
          <h4 className="text-sm font-medium text-foreground">Top moves</h4>
          {evaluation && (
            <span className="text-xs text-muted-foreground">
              Depth {evaluation.depth ?? '—'}
            </span>
          )}
        </div>

        {topMoves.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Engine output will appear here.
          </p>
        ) : (
          <ul className="space-y-2 text-sm text-foreground">
            {topMoves.map((move) => (
              <li
                key={move.multipv}
                className="rounded border border-muted-foreground/20 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    #{move.multipv} {move.san}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatScore(move)}
                  </span>
                </div>
                {move.line.length > 1 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {move.line.slice(1).join(' ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

