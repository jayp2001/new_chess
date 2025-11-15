'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GameMetadata } from '@/types/chess'

const RESULT_OPTIONS = ['1-0', '0-1', '1/2-1/2', '*'] as const

interface MetadataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMetadata?: GameMetadata | null
  onSubmit: (metadata: GameMetadata) => void
}

function numericOrUndefined(value: string) {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function MetadataDialog({
  open,
  onOpenChange,
  initialMetadata,
  onSubmit,
}: MetadataDialogProps) {
  const [formState, setFormState] = useState<GameMetadata>({
    title: '',
    event: '',
    site: '',
    date: '',
    round: '',
    white: '',
    black: '',
    whiteElo: undefined,
    blackElo: undefined,
    result: '*',
    eco: '',
    additionalHeaders: {},
  })

  useEffect(() => {
    if (initialMetadata) {
      setFormState((prev) => ({
        ...prev,
        ...initialMetadata,
        whiteElo: initialMetadata.whiteElo,
        blackElo: initialMetadata.blackElo,
      }))
    } else {
      setFormState({
        title: '',
        event: '',
        site: '',
        date: '',
        round: '',
        white: '',
        black: '',
        whiteElo: undefined,
        blackElo: undefined,
        result: '*',
        eco: '',
        additionalHeaders: {},
      })
    }
  }, [initialMetadata, open])

  const handleSubmit = () => {
    onSubmit(formState)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Game Metadata</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="white-player">White</Label>
              <Input
                id="white-player"
                placeholder="White player"
                value={formState.white ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    white: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="white-elo">White ELO</Label>
              <Input
                id="white-elo"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 2750"
                value={formState.whiteElo ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    whiteElo: numericOrUndefined(event.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="black-player">Black</Label>
              <Input
                id="black-player"
                placeholder="Black player"
                value={formState.black ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    black: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="black-elo">Black ELO</Label>
              <Input
                id="black-elo"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 2735"
                value={formState.blackElo ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    blackElo: numericOrUndefined(event.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-name">Event</Label>
            <Input
              id="event-name"
              placeholder="Tournament name"
              value={formState.event ?? ''}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  event: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="site-name">Site</Label>
              <Input
                id="site-name"
                placeholder="City, Country"
                value={formState.site ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    site: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="round">Round</Label>
              <Input
                id="round"
                placeholder="Round number"
                value={formState.round ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    round: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formState.date ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    date: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="result">Result</Label>
              <select
                id="result"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formState.result ?? '*'}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    result: event.target.value as GameMetadata['result'],
                  }))
                }
              >
                {RESULT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eco">ECO Code</Label>
            <Input
              id="eco"
              placeholder="e.g. C65"
              value={formState.eco ?? ''}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  eco: event.target.value,
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setFormState({
                title: '',
                event: '',
                site: '',
                date: '',
                round: '',
                white: '',
                black: '',
                whiteElo: undefined,
                blackElo: undefined,
                result: '*',
                eco: '',
                additionalHeaders: {},
              })
            }}
          >
            Reset
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

  ...

