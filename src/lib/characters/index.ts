import { AICharacter, AICharacterId } from '@/types'
import { grandmother } from './monsters/grandmother'
import { runner } from './humans/runner'

export const characters: Record<AICharacterId, AICharacter> = {
  grandmother,
  runner,
}

export const monsterCharacters: AICharacter[] = [grandmother]
export const humanCharacters: AICharacter[] = [runner]

export function getCharacter(id: string): AICharacter | undefined {
  return characters[id as AICharacterId]
}

export function pickRandomCharacter(): AICharacter {
  const isMonster = Math.random() < 0.5
  const pool = isMonster ? monsterCharacters : humanCharacters
  return pool[Math.floor(Math.random() * pool.length)]
}
