import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  sessions: defineTable({
    playerName: v.string(),
    playerRole: v.string(),
    aiCharacter: v.string(),
    aiType: v.string(),
    decision: v.string(),
    outcome: v.string(),
    points: v.number(),
    streak: v.number(),
    decisionTimeMs: v.number(),
    durationMs: v.number(),
    transcript: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
    createdAt: v.number(),
  })
    .index('by_player', ['playerName'])
    .index('by_created', ['createdAt']),
})
