import { NextResponse } from 'next/server'
import { getRealtimeToken } from '@/lib/openai'
import { buildGamePrompt } from '@/lib/prompt'
import { getRole } from '@/lib/roles'
import { pickRandomCharacter } from '@/lib/characters'
import { SessionResponse } from '@/types'

export async function POST(request: Request) {
  try {
    const { playerRole } = await request.json()
    const role = getRole(playerRole)

    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const character = pickRandomCharacter()
    const { systemPrompt, tools } = buildGamePrompt(role, character)

    const { clientSecret } = await getRealtimeToken(
      systemPrompt,
      tools as Array<Record<string, unknown>>,
      character.voice
    )

    const sessionId = crypto.randomUUID()

    const response: SessionResponse = {
      sessionId,
      clientSecret,
      playerRole: role.id,
      aiCharacterName: character.name,
      aiCharacterVoice: character.voice,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
