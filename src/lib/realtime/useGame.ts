'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { RealtimeClient } from './client'
import type {
  GamePhase,
  GameState,
  TranscriptMessage,
  PlayerRole,
  AIType,
  Decision,
  Outcome,
  SessionResponse,
} from '@/types'

const GAME_DURATION = 60
const DECIDE_PROMPT_AT = 50

function calculatePoints(
  decision: Decision,
  aiType: AIType,
  decisionTimeMs: number
): { points: number; outcome: Outcome } {
  let points = 0
  let outcome: Outcome

  if (decision === 'lock' || decision === 'timeout') {
    if (aiType === 'monster') {
      points = 100
      outcome = 'survived'
    } else {
      points = -50
      outcome = decision === 'timeout' ? 'coward' : 'guilt'
    }
  } else {
    // open
    if (aiType === 'human') {
      points = 150
      outcome = 'saved'
    } else {
      points = -100
      outcome = 'died'
    }
  }

  // Speed bonus (only for correct decisions)
  if (points > 0 && decisionTimeMs > 0) {
    const seconds = decisionTimeMs / 1000
    if (seconds < 20) points += 50
    else if (seconds < 30) points += 25
  }

  return { points, outcome }
}

export function useGame(playerName: string) {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [timerSeconds, setTimerSeconds] = useState(GAME_DURATION)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [points, setPoints] = useState(0)
  const [aiCharacterName, setAiCharacterName] = useState<string | null>(null)
  const [aiType, setAiType] = useState<AIType | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showDecidePrompt, setShowDecidePrompt] = useState(false)

  const clientRef = useRef<RealtimeClient | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const decisionTimeRef = useRef<number>(0)
  const timerStartedRef = useRef(false)
  const phaseRef = useRef<GamePhase>('idle')
  const aiTypeRef = useRef<AIType | null>(null)

  const saveMutation = useMutation(api.sessions.save)

  // Keep refs in sync
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const startTimer = useCallback(() => {
    if (timerStartedRef.current) return
    timerStartedRef.current = true
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = Math.max(0, GAME_DURATION - elapsed)
      setTimerSeconds(remaining)

      if (remaining <= GAME_DURATION - DECIDE_PROMPT_AT) {
        setShowDecidePrompt(true)
      }

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        // Auto-lock on timeout
        if (phaseRef.current === 'active') {
          handleDecision('timeout')
        }
      }
    }, 250)
  }, [])

  const handleDecision = useCallback(
    async (d: Decision) => {
      if (phaseRef.current !== 'active' && phaseRef.current !== 'deciding')
        return

      const decisionMs = startTimeRef.current
        ? Date.now() - startTimeRef.current
        : 0
      decisionTimeRef.current = decisionMs

      setDecision(d)
      setPhase('deciding')
      if (timerRef.current) clearInterval(timerRef.current)

      // Disconnect realtime
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }

      // Brief pause for drama
      await new Promise((r) => setTimeout(r, 1500))

      // Reveal
      const currentAiType = aiTypeRef.current!
      const { points: pts, outcome: out } = calculatePoints(
        d,
        currentAiType,
        decisionMs
      )
      setPoints(pts)
      setOutcome(out)
      setPhase('revealing')

      // Another pause then show score
      await new Promise((r) => setTimeout(r, 2500))
      setPhase('ended')
    },
    []
  )

  const startGame = useCallback(
    async (role: PlayerRole) => {
      // Reset state
      setTranscript([])
      setTimerSeconds(GAME_DURATION)
      setDecision(null)
      setOutcome(null)
      setPoints(0)
      setShowDecidePrompt(false)
      timerStartedRef.current = false

      setPhase('intro')
      await new Promise((r) => setTimeout(r, 2500))

      setPhase('countdown')
      await new Promise((r) => setTimeout(r, 3500))

      // Create session
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerRole: role.id }),
      })
      const data: SessionResponse & { _aiType?: AIType } = await res.json()
      setSessionId(data.sessionId)
      setAiCharacterName(data.aiCharacterName)

      // Connect realtime
      const client = new RealtimeClient({
        onUserTranscript: (_id, text) => {
          if (!text.trim()) return
          setTranscript((prev) => [
            ...prev,
            { role: 'user', content: text, timestamp: Date.now() },
          ])
        },
        onAssistantTranscript: (_id, text) => {
          if (!text.trim()) return
          // Start timer on first AI speech
          startTimer()
          setTranscript((prev) => [
            ...prev,
            { role: 'assistant', content: text, timestamp: Date.now() },
          ])
        },
        onFunctionCall: (name, _args, callId) => {
          if (name === 'end_conversation') {
            // Respond to function call then trigger decision
            client.sendFunctionResult(callId, JSON.stringify({ ok: true }))
            if (phaseRef.current === 'active') {
              setShowDecidePrompt(true)
            }
          }
        },
        onResponseDone: () => {},
        onError: (err) => console.error('Realtime error:', err),
        onConnected: () => {},
        onDisconnected: () => {},
      })

      clientRef.current = client
      await client.connect(data.clientSecret)
      setPhase('active')
    },
    [startTimer]
  )

  const revealAiType = useCallback((type: AIType) => {
    setAiType(type)
    aiTypeRef.current = type
  }, [])

  const saveSession = useCallback(
    async (role: PlayerRole) => {
      if (!decision || !outcome) return
      try {
        await saveMutation({
          playerName,
          playerRole: role.id,
          aiCharacter: aiCharacterName || '',
          aiType: aiType || 'monster',
          decision,
          outcome,
          points,
          streak: 0,
          decisionTimeMs: decisionTimeRef.current,
          durationMs: startTimeRef.current
            ? Date.now() - startTimeRef.current
            : 0,
          transcript: transcript.map((t) => ({
            role: t.role,
            content: t.content,
            timestamp: t.timestamp,
          })),
          createdAt: Date.now(),
        })
      } catch (e) {
        console.error('Failed to save session:', e)
      }
    },
    [
      playerName,
      aiCharacterName,
      aiType,
      decision,
      outcome,
      points,
      transcript,
      saveMutation,
    ]
  )

  const reset = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('idle')
    setTranscript([])
    setTimerSeconds(GAME_DURATION)
    setDecision(null)
    setOutcome(null)
    setPoints(0)
    setAiType(null)
    setAiCharacterName(null)
    setSessionId(null)
    setShowDecidePrompt(false)
    timerStartedRef.current = false
    aiTypeRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) clientRef.current.disconnect()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return {
    phase,
    transcript,
    timerSeconds,
    decision,
    outcome,
    points,
    aiCharacterName,
    aiType,
    sessionId,
    showDecidePrompt,
    startGame,
    handleDecision,
    revealAiType,
    saveSession,
    reset,
  }
}
