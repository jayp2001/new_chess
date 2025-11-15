export type Color = 'w' | 'b'

export interface VariationNode {
  id: string
  moveNumber: number
  color: Color
  san?: string | null
  uci?: string | null
  fenBefore: string
  fenAfter: string
  parentId: string | null
  comment?: string
  nags?: number[]
  isMainline?: boolean
  children: VariationNode[]
}

export interface VariationTree {
  root: VariationNode
  currentNodeId?: string
}

export interface VariationMoveInput {
  san?: string | null
  uci?: string | null
  comment?: string
  nags?: number[]
  isMainline?: boolean
}

export interface GameMetadata {
  title?: string | null
  event?: string | null
  site?: string | null
  date?: string | null
  round?: string | null
  white?: string | null
  black?: string | null
  whiteElo?: number | undefined
  blackElo?: number | undefined
  result?: string | null
  eco?: string | null
  additionalHeaders?: Record<string, string | undefined>
}

export interface EngineOptionState {
  depth?: number
  movetimeMs?: number
  multiPv: number
  maxSuggestions?: number
  showArrows?: boolean
  skillLevel?: number
  threads?: number
  hash?: number
}

export interface EngineEvaluation {
  depth?: number
  scoreCp?: number
  scoreMate?: number
  nodes?: number
  nps?: number
}

export interface EngineTopMove {
  multipv: number
  san: string
  line: string[]
  scoreCp?: number
  mateIn?: number
}

export interface EngineLine {
  id: string
  multipv: number
  depth?: number
  scoreCp?: number
  scoreMate?: number
  nodes?: number
  nps?: number
  pvSan: string[]
  pvUci: string[]
}

