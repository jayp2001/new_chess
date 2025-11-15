import { supabase } from '@/lib/supabase/client'
import { GameMetadata, VariationTree } from '@/types/chess'
import { serializePgn } from '@/lib/chess/pgn'

interface SaveGamePayload {
  tree: VariationTree
  metadata: GameMetadata
  analysis?: Record<string, unknown> | null
}

export async function saveGameToSupabase({
  tree,
  metadata,
  analysis,
}: SaveGamePayload) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw new Error(authError.message)
  }

  if (!user) {
    throw new Error('You must be signed in to save games.')
  }

  const pgn = serializePgn(tree, metadata)

  const { error } = await supabase.from('games').insert({
    user_id: user.id,
    title: metadata.title ?? metadata.event ?? null,
    event: metadata.event ?? null,
    site: metadata.site ?? null,
    round: metadata.round ?? null,
    date: metadata.date ?? null,
    white_name: metadata.white ?? null,
    white_elo: metadata.whiteElo ?? null,
    black_name: metadata.black ?? null,
    black_elo: metadata.blackElo ?? null,
    result: metadata.result ?? null,
    eco: metadata.eco ?? null,
    pgn,
    analysis: analysis ?? null,
    additional_headers: metadata.additionalHeaders ?? null,
  })

  if (error) {
    throw new Error(error.message)
  }
}

