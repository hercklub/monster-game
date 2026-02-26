import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const save = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('sessions', args)
  },
})

export const leaderboard = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query('sessions').collect()
    const playerMap = new Map<string, { totalPoints: number; games: number }>()

    for (const s of sessions) {
      const existing = playerMap.get(s.playerName)
      if (existing) {
        existing.totalPoints += s.points
        existing.games++
      } else {
        playerMap.set(s.playerName, { totalPoints: s.points, games: 1 })
      }
    }

    return Array.from(playerMap.entries())
      .map(([name, data]) => ({
        playerName: name,
        totalPoints: data.totalPoints,
        games: data.games,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 20)
  },
})

export const playerStats = query({
  args: { playerName: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_player', (q) => q.eq('playerName', args.playerName))
      .order('desc')
      .collect()

    if (sessions.length === 0) return null

    const totalPoints = sessions.reduce((sum, s) => sum + s.points, 0)
    const survived = sessions.filter(
      (s) => s.outcome === 'survived' || s.outcome === 'saved'
    ).length

    return {
      games: sessions.length,
      totalPoints,
      survived,
      survivalRate: Math.round((survived / sessions.length) * 100),
      recentGames: sessions.slice(0, 5),
    }
  },
})
