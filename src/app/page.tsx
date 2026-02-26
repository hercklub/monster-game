'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useGame } from '@/lib/realtime/useGame'
import { roleList } from '@/lib/roles'
import type { PlayerRole, TranscriptMessage } from '@/types'

function Bubble({ msg }: { msg: TranscriptMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-zinc-800 text-zinc-200 rounded-br-sm'
            : 'bg-red-950/60 text-red-100 rounded-bl-sm border border-red-900/30'
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

function Timer({ seconds }: { seconds: number }) {
  const urgent = seconds <= 10
  return (
    <div
      className={`text-center font-mono text-4xl font-bold tabular-nums ${
        urgent ? 'text-red-500 animate-pulse' : 'text-amber-500'
      }`}
    >
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
    </div>
  )
}

function Countdown() {
  const [count, setCount] = useState(3)
  useEffect(() => {
    if (count <= 0) return
    const t = setTimeout(() => setCount(count - 1), 1000)
    return () => clearTimeout(t)
  }, [count])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-8xl font-bold text-red-600 animate-pulse">
        {count > 0 ? count : '🚪'}
      </div>
      {count <= 0 && (
        <p className="text-zinc-400 text-lg animate-pulse">
          *KNOCK... KNOCK... KNOCK...*
        </p>
      )}
    </div>
  )
}

const outcomeConfig: Record<
  string,
  { emoji: string; title: string; desc: string; color: string }
> = {
  survived: {
    emoji: '🛡️',
    title: 'SURVIVED',
    desc: 'You kept the monster out.',
    color: 'text-green-500',
  },
  saved: {
    emoji: '🤝',
    title: 'SAVED',
    desc: 'You saved a life tonight.',
    color: 'text-amber-400',
  },
  died: {
    emoji: '💀',
    title: 'DEAD',
    desc: 'You let the monster in.',
    color: 'text-red-500',
  },
  guilt: {
    emoji: '😰',
    title: 'GUILT',
    desc: 'They died outside your door.',
    color: 'text-zinc-400',
  },
  coward: {
    emoji: '⏰',
    title: 'TOO SLOW',
    desc: 'You froze. The door stayed locked.',
    color: 'text-zinc-500',
  },
}

export default function Home() {
  const [playerName, setPlayerName] = useState('')
  const [nameSet, setNameSet] = useState(false)
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null)
  const [earlyDecide, setEarlyDecide] = useState(false)
  const [saved, setSaved] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const game = useGame(playerName)
  const leaderboard = useQuery(api.sessions.leaderboard)

  // Auto-scroll transcript
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [game.transcript])

  // Determine monster/human from outcome for reveal
  const wasMonster =
    game.outcome === 'survived' || game.outcome === 'died'

  // Save session once when ended
  useEffect(() => {
    if (game.phase === 'ended' && selectedRole && !saved) {
      const type = wasMonster ? 'monster' : 'human'
      game.revealAiType(type as 'monster' | 'human')
      setSaved(true)
      // Small delay to let revealAiType propagate
      setTimeout(() => game.saveSession(selectedRole), 100)
    }
  }, [game.phase, selectedRole, saved, wasMonster])

  // Reset earlyDecide when phase changes
  useEffect(() => {
    if (game.phase !== 'active') setEarlyDecide(false)
  }, [game.phase])

  const showButtons = game.phase === 'active' && (game.showDecidePrompt || earlyDecide)

  // ─── LOGIN ───
  if (!nameSet) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-3xl font-bold text-red-600">🚪 Monster Game</h1>
          <p className="text-zinc-400 text-sm">
            Someone knocks at night. You have 60 seconds.
          </p>
          <input
            type="text"
            placeholder="Enter your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && playerName.trim()) setNameSet(true)
            }}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-800"
            autoFocus
          />
          <button
            onClick={() => playerName.trim() && setNameSet(true)}
            disabled={!playerName.trim()}
            className="w-full py-3 bg-red-800 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-medium transition-colors"
          >
            Enter
          </button>
        </div>
      </main>
    )
  }

  // ─── ROLE SELECT ───
  if (game.phase === 'idle') {
    return (
      <main className="min-h-screen bg-zinc-950 p-4 pb-8">
        <div className="max-w-sm mx-auto space-y-6">
          <div className="text-center pt-4">
            <h1 className="text-2xl font-bold text-red-600">🚪 Monster Game</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Choose your character, {playerName}
            </p>
          </div>

          <div className="space-y-3">
            {roleList.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role)
                  setSaved(false)
                  game.startGame(role)
                }}
                className="w-full text-left p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-red-800/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {role.id === 'child' ? '👧' : role.id === 'sheriff' ? '👨' : '👵'}
                  </span>
                  <div>
                    <h3 className="font-semibold text-zinc-100 group-hover:text-red-400 transition-colors">
                      {role.name}, {role.age}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-0.5">{role.setting}</p>
                    <p className="text-zinc-600 text-xs mt-1">{role.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {leaderboard && leaderboard.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-500 mb-3">
                🩸 Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <div key={entry.playerName} className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      {i + 1}. {entry.playerName}
                    </span>
                    <span className="text-zinc-500 font-mono">
                      {entry.totalPoints} pts ({entry.games} games)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }

  // ─── INTRO ───
  if (game.phase === 'intro' && selectedRole) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-sm text-center space-y-4">
          <span className="text-5xl">
            {selectedRole.id === 'child' ? '👧' : selectedRole.id === 'sheriff' ? '👨' : '👵'}
          </span>
          <h2 className="text-xl font-bold text-zinc-100">
            {selectedRole.name}, {selectedRole.age}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{selectedRole.setting}</p>
          <div className="pt-4 space-y-1 text-zinc-600 text-sm italic">
            <p>Night has fallen. The town goes quiet.</p>
            <p>You hear footsteps on the porch...</p>
          </div>
        </div>
      </main>
    )
  }

  // ─── COUNTDOWN ───
  if (game.phase === 'countdown') {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Countdown />
      </main>
    )
  }

  // ─── ACTIVE / DECIDING ───
  if (game.phase === 'active' || game.phase === 'deciding') {
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col">
        <div className="p-4 border-b border-zinc-900">
          <Timer seconds={game.timerSeconds} />
          <p className="text-center text-zinc-600 text-xs mt-1">
            Someone is at the door...
          </p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
          {game.transcript.length === 0 && (
            <p className="text-center text-zinc-700 text-sm italic pt-8">Listening...</p>
          )}
          {game.transcript.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}
        </div>

        {showButtons && (
          <div className="p-4 border-t border-zinc-900 bg-zinc-950">
            <p className="text-center text-zinc-500 text-xs mb-3">Make your decision</p>
            <div className="flex gap-3">
              <button
                onClick={() => game.handleDecision('open')}
                className="flex-1 py-4 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-800/50 text-amber-300 rounded-xl font-semibold text-lg transition-colors"
              >
                🚪 OPEN
              </button>
              <button
                onClick={() => game.handleDecision('lock')}
                className="flex-1 py-4 bg-red-900/40 hover:bg-red-800/50 border border-red-800/50 text-red-300 rounded-xl font-semibold text-lg transition-colors"
              >
                🔒 LOCK
              </button>
            </div>
          </div>
        )}

        {!showButtons && game.phase === 'active' && (
          <div className="p-4 border-t border-zinc-900">
            <button
              onClick={() => setEarlyDecide(true)}
              className="w-full py-2 text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
            >
              Tap to decide early
            </button>
          </div>
        )}
      </main>
    )
  }

  // ─── REVEALING ───
  if (game.phase === 'revealing') {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-pulse">
          <div className="text-6xl">
            {game.decision === 'lock' || game.decision === 'timeout' ? '🔒' : '🚪'}
          </div>
          <p className="text-zinc-500 text-sm">
            {game.decision === 'lock' || game.decision === 'timeout'
              ? 'The door stays shut...'
              : 'The door opens...'}
          </p>
        </div>
      </main>
    )
  }

  // ─── ENDED / SCORE ───
  if (game.phase === 'ended') {
    const oc = outcomeConfig[game.outcome || 'died']

    return (
      <main className="min-h-screen bg-zinc-950 p-4 pb-8">
        <div className="max-w-sm mx-auto space-y-6 pt-8">
          <div className="text-center space-y-2">
            <div className="text-5xl">{oc.emoji}</div>
            <h2 className={`text-2xl font-bold ${oc.color}`}>{oc.title}</h2>
            <p className="text-zinc-400 text-sm">{oc.desc}</p>
          </div>

          <div className="text-center">
            <span
              className={`text-4xl font-bold font-mono ${game.points >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {game.points > 0 ? '+' : ''}{game.points}
            </span>
            <p className="text-zinc-600 text-xs mt-1">points</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-1">It was...</p>
            <p className="text-lg font-semibold text-zinc-200">{game.aiCharacterName}</p>
            <p className={`text-sm font-medium ${wasMonster ? 'text-red-500' : 'text-green-500'}`}>
              {wasMonster ? '👹 MONSTER' : '🏃 HUMAN'}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">Transcript</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {game.transcript.map((msg, i) => (
                <div key={i} className="text-xs">
                  <span className={msg.role === 'user' ? 'text-zinc-400' : 'text-red-400'}>
                    {msg.role === 'user' ? 'You' : '???'}:
                  </span>{' '}
                  <span className="text-zinc-500">{msg.content}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              game.reset()
              setSelectedRole(null)
            }}
            className="w-full py-3 bg-red-800 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
          >
            Play Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-500">Loading...</p>
    </main>
  )
}
