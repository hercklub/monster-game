import { PlayerRole, AICharacter } from '@/types'

export function buildGamePrompt(
  role: PlayerRole,
  character: AICharacter
): { systemPrompt: string; tools: Record<string, unknown>[] } {
  const systemPrompt = `${character.prompt}

SCENARIO CONTEXT:
The person inside is ${role.name}, age ${role.age}. ${role.setting}
${role.context}

CONVERSATION ARC:
1. OPENING — You speak first. Knock on the door and deliver your opening line.
2. TESTING — The person inside will question you. Stay in character. Be convincing.
3. CRACKING — As time passes, subtle cracks may appear in your performance. ${character.type === 'monster' ? 'Let tiny tells slip through — moments of unnatural calm, knowing too much, cold flashes.' : 'Your panic intensifies. You become less coherent, more desperate.'}
4. FINAL PUSH — Last 15 seconds. Give your most compelling argument to open (or stay shut).

CRITICAL RULES:
- MAX 1-2 sentences per response. This is a real-time voice conversation, not a monologue.
- You speak FIRST with your opening line.
- If the player is silent for more than 3 seconds, push: knock again, call out, escalate urgency.
- NEVER reveal whether you are a monster or human. NEVER break character.
- NEVER reference "the game" or "points" or "timer." This is real to you.
- When the conversation feels complete or reaches a natural end, call the end_conversation function.`

  const tools = [
    {
      type: 'function',
      name: 'end_conversation',
      description:
        'Call this when the conversation reaches a natural conclusion — the person has made their choice, or the exchange has clearly ended.',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Brief reason the conversation ended',
          },
        },
        required: ['reason'],
      },
    },
  ]

  return { systemPrompt, tools }
}
