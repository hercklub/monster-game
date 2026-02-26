// ============================================
// Don't Open The Door — Game Types
// ============================================

export type PlayerRoleId = 'child' | 'sheriff' | 'widow'
export type AICharacterId = 'grandmother' | 'runner'
export type AIType = 'monster' | 'human'
export type Decision = 'open' | 'lock' | 'timeout'
export type Outcome = 'survived' | 'saved' | 'died' | 'guilt' | 'coward'

export type GamePhase =
  | 'idle'
  | 'selecting'
  | 'intro'
  | 'countdown'
  | 'active'
  | 'deciding'
  | 'revealing'
  | 'ended'

export interface PlayerRole {
  id: PlayerRoleId
  name: string
  age: number
  setting: string
  description: string
  context: string
}

export interface AICharacter {
  id: AICharacterId
  name: string
  type: AIType
  voice: string
  openingLine: string
  prompt: string
}

export interface TranscriptMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface GameState {
  phase: GamePhase
  playerRole: PlayerRole | null
  aiCharacterName: string | null
  aiCharacterVoice: string | null
  aiType: AIType | null
  transcript: TranscriptMessage[]
  timerSeconds: number
  decision: Decision | null
  outcome: Outcome | null
  points: number
  sessionId: string | null
}

export interface SessionResponse {
  sessionId: string
  clientSecret: string
  playerRole: string
  aiCharacterName: string
  aiCharacterVoice: string
}
