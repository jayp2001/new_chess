'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { parsePgn } from '@/lib/chess/pgn'
import { GameMetadata, VariationTree } from '@/types/chess'
import { toast } from 'sonner'

interface ImportPGNDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: { tree: VariationTree; metadata: GameMetadata }) => void
}

export function ImportPGNDialog({
  open,
  onOpenChange,
  onImport,
}: ImportPGNDialogProps) {
  const [pgnText, setPgnText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImport = async () => {
    if (!pgnText.trim()) {
      setError('Please paste a PGN game before importing.')
      return
    }

    try {
      setIsSubmitting(true)
      const result = parsePgn(pgnText)
      onImport(result)
      setPgnText('')
      setError(null)
      onOpenChange(false)
      toast.success('PGN imported successfully.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to import PGN. Please check the format.'
      )
      toast.error(
        err instanceof Error ? err.message : 'Unable to import PGN. Please check the format.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import PGN</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Paste a PGN game with optional comments and variations. The current analysis
            will be replaced.
          </p>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="pgn-input">PGN</Label>
          <Textarea
            id="pgn-input"
            value={pgnText}
            onChange={(event) => {
              setPgnText(event.target.value)
              if (error) setError(null)
            }}
            placeholder="Paste PGN here..."
            minLength={4}
            className="min-h-[200px] font-mono text-sm"
          />
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setPgnText('')
              setError(null)
            }}
          >
            Clear
          </Button>
          <Button onClick={handleImport} disabled={isSubmitting}>
            {isSubmitting ? 'Importing…' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

