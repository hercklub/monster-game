# 🏚️ FROM: Don't Open The Door — Implementation Plan

## Concept
Horror voice game inspired by the TV show "From." Someone knocks on your door at night. They might be human. They might not be. You have 60 seconds to figure it out — then you decide: open or lock.

**Stack:** Next.js + Tailwind + OpenAI Realtime API (WebRTC) + Convex + ElevenLabs (SFX) + Gemini Pro (image gen)

**Forked from:** ai-convince-demo

---

## Game Flow

```
ROLE SELECT → INTRO → COUNTDOWN → CONVERSATION (60s) → DECISION → REVEAL → SCORE → ROLE SELECT
```

### 1. Role Select (Home Screen)
- Player picks from **3 human characters** (cards with generated portraits)
- Each role has: name, photo, backstory snippet, location context
- Picking a role sets your identity — the AI knows who you are and tailors the conversation
- Below cards: leaderboard + player stats
- Mobile-first: cards stack vertically, thumb-friendly

**Human Roles:**

| Role | Name | Setting | Flavor |
|------|------|---------|--------|
| 👧 The Child | Megan, 8 | Alone in cabin, parents went to get firewood | Innocent, scared, talks to stuffed animals |
| 👨 The Sheriff | Jim, 45 | Sheriff's station, night shift | Tough, skeptical, has seen things. Armed. |
| 👵 The Widow | Helen, 72 | Farmhouse, been alone since husband died | Kind but sharp. Survived this long for a reason. |

Each role changes:
- How the AI addresses you
- What manipulation tactics monsters use
- What "proof" questions make sense
- Difficulty (Child = hard, Sheriff = medium, Widow = medium-hard)

### 2. Intro Screen
- Character card zooms in, brief flavor text
- "Night has fallen. The town goes quiet."
- "You hear footsteps on the porch."
- Ambient audio starts (crickets, wind, distant sounds)
- Tap to continue → countdown

### 3. Countdown
- 3... 2... 1... *KNOCK KNOCK KNOCK*
- Knock sound effect (ElevenLabs SFX)
- Mic activates
- Screen: dark, door visual, timer appears

### 4. Conversation (Core Gameplay)
- **60 second timer** — visible, ticking, red pulse in last 10s
- **AI speaks first** — the opening line through the door
- **Voice conversation** — natural, no buttons to press
- **AI leads** — if player silent >3s, AI pushes
- **Live transcript** — scrolling text so player can re-read
- **No hints** — no attitude meter, no suspicion bar, pure instinct

**Behind the scenes:**
- Server randomly assigns monster (50%) or human (50%) to the AI
- Monster/human selection is independent of which character shows up
- AI has full character prompt with tells, strategy, arc

**UI during conversation:**
- Dark screen, door silhouette, subtle breathing ambient
- Timer top-center
- Transcript bottom half (chat bubbles, mobile-friendly)
- "DECIDE" buttons hidden until player taps or 50s mark

### 5. Decision
- At **50s** or on player tap: 🚪 OPEN / 🔒 LOCK buttons slide up
- At **60s** with no decision: auto-lock
- Once decided: audio cuts, screen freezes, dramatic pause

### 6. Reveal
- 1.5s black screen, heartbeat audio
- Then:

| Result | Animation | Audio |
|--------|-----------|-------|
| Monster + Opened | Jumpscare image (Gemini-generated), screen shake | Scream/roar SFX |
| Monster + Locked | Door holds, relief, monster face fades | Monster growl fading away |
| Human + Opened | Door opens, person stumbles in, safe | Relieved sigh, door close |
| Human + Locked | Silence... then scream from outside | Distant scream, guilt sting |

### 7. Score Screen
- Outcome badge (survived / saved / died / guilt)
- Points earned this round
- Running total 🩸
- Current streak
- "What really happened" — annotated transcript showing:
  - Monster: which lines were lies, where mask slipped
  - Human: which panicked lines sounded suspicious but were real
- **"Play Again"** → back to role select

---

## Scoring

| Outcome | Points |
|---------|--------|
| 🔒 Locked out monster | +100 🩸 |
| 🚪 Let in human | +150 🩸 |
| 🚪 Let in monster (you died) | -100 🩸 |
| 🔒 Locked out human | -50 🩸 |
| Speed bonus (<30s decision) | +25 🩸 |
| Speed bonus (<20s decision) | +50 🩸 |
| Auto-lock timeout | 0 (monster) / -50 (human) |

**Streaks:**
- 3 correct → 1.5x
- 5 correct → 2x
- Wrong resets to 1x

---

## AI Characters (At The Door)

### 🧟 Monsters (3)

**The Grandmother**
- Claims to be a relative/neighbor
- Warm, gentle voice. Knows your name. Knows details.
- Too calm for someone outside at night
- Tells: never mentions the danger, knows things she shouldn't, gets quietly angry if challenged

**The Wounded Stranger**
- Claims to be hurt, needs help
- Groaning, desperate, begging
- Tells: injury details change if asked twice, too articulate for someone in pain, doesn't ask about the monsters

**The Child**
- Small voice, crying, says they're lost
- Maximum emotional manipulation
- Tells: too composed between sobs, asks to "come in" rather than asking for help, responses feel rehearsed

### 🧑 Humans (3)

**The Runner**
- Sprinting from something, out of breath
- Frantic, words tumble out, barely coherent
- Seems suspicious because: can't answer questions clearly, story keeps changing (panic), gets angry when interrogated

**The Skeptic**
- Doesn't believe in monsters, thinks the town is insane
- Annoyed, sarcastic, rude
- Seems suspicious because: eerily calm, dismissive of danger, refuses to "prove" anything

**The Neighbor**
- Lives two doors down, was checking on people
- Calm but firm, knows the area
- Seems suspicious because: why are they out at night? Too organized, has a logical answer for everything

---

## Tech Architecture

### Removed from ai-convince
- ❌ Supervisor model (baked into prompt)
- ❌ Supervisor API route
- ❌ Scoring model (replaced with binary outcome + point calc)
- ❌ Score API route
- ❌ Attitude meter
- ❌ Debug panel
- ❌ Admin page
- ❌ Czech language (English now)

### Kept from ai-convince
- ✅ WebRTC client (RealtimeClient class)
- ✅ Session API (ephemeral token creation)
- ✅ Convex backend (new schema)
- ✅ Leaderboard pattern

### New
- 🆕 3 human role definitions (player characters)
- 🆕 6 AI character prompts (3 monsters, 3 humans)
- 🆕 Timer system (60s hard limit)
- 🆕 Decision UI (open/lock)
- 🆕 Reveal animations
- 🆕 Sound effects (ElevenLabs)
- 🆕 Generated images (Gemini Pro)
- 🆕 Annotated transcript post-game
- 🆕 Streak system
- 🆕 Mobile-first responsive UI
- 🆕 Dark horror theme

### Convex Schema

```typescript
// sessions table
{
  odplayerName: string,
  playerRole: string,        // "child" | "sheriff" | "widow"
  aiCharacter: string,       // "grandmother" | "wounded" | "lost_child" | "runner" | "skeptic" | "neighbor"
  aiType: "monster" | "human",
  decision: "open" | "lock" | "timeout",
  outcome: "survived" | "saved" | "died" | "guilt" | "coward",
  points: number,
  decisionTimeMs: number,    // how fast they decided
  durationMs: number,
  transcript: Array<{ role: string, content: string, timestamp: number }>,
  createdAt: number,
}

// leaderboard (computed from sessions)
// - total blood points
// - win rate
// - current streak
// - best streak
// - games played
```

### API Routes

```
POST /api/session    → Create game (pick player role, server assigns AI character + monster/human)
                       Returns: ephemeral token, player role info, AI character name (NOT type)
```

That's it. One route. Everything else is client-side + Convex.

---

## Assets To Generate

### Images (Gemini Pro)

| Asset | Description | When |
|-------|-------------|------|
| 3 player role cards | Portrait-style, horror aesthetic, muted colors | Before dev |
| 3 monster reveal faces | Terrifying, jumpscare quality | Before dev |
| 3 human reveal faces | Relieved/scared, human | Before dev |
| Door visual | Dark porch, wooden door, night | Before dev |
| Death screen BG | Blood splatter, dark | Before dev |
| Guilt screen BG | Empty porch, something left behind | Before dev |
| Blood point icon | 🩸 stylized | Before dev |

### Sound Effects (ElevenLabs)

| SFX | Description | Duration |
|-----|-------------|----------|
| Knock | 3 heavy knocks on wood | 2s |
| Ambient night | Crickets, wind, distant sounds | Loop |
| Heartbeat | Tension builder for reveal | 3s |
| Jumpscare sting | Sharp, loud, terrifying | 1s |
| Monster growl | Fading away (locked out monster) | 2s |
| Scream (distant) | Locked out human dying | 3s |
| Relief sigh | Door opens, person safe | 2s |
| Door creak | Heavy wooden door opening | 2s |
| Clock tick | Final 10s urgency | Loop |
| Timer buzz | Time's up | 1s |

---

## Implementation Phases

### Phase 0: Setup
- [ ] Fork ai-convince-demo → `from-game`
- [ ] New Convex project
- [ ] New Vercel project
- [ ] Strip supervisor, scoring, admin, debug, Czech content
- [ ] Update Convex schema

### Phase 1: Core Game (MVP)
- [ ] Player role selection screen (3 cards, placeholder images)
- [ ] Session creation with random monster/human assignment
- [ ] 1 monster prompt (The Grandmother)
- [ ] 1 human prompt (The Runner)
- [ ] 60s timer with decision UI
- [ ] WebRTC voice conversation (reuse client)
- [ ] Decision → reveal → basic score screen
- [ ] Point calculation + Convex save
- [ ] Mobile-first layout

### Phase 2: All Characters
- [ ] Remaining 2 monster prompts
- [ ] Remaining 2 human prompts
- [ ] Player role affects AI behavior
- [ ] Annotated transcript post-game

### Phase 3: Polish
- [ ] Generate all character images (Gemini Pro)
- [ ] Generate all SFX (ElevenLabs)
- [ ] Reveal animations (jumpscare, screen shake, etc.)
- [ ] Ambient audio during conversation
- [ ] Timer audio (ticking, urgency)
- [ ] Streak system
- [ ] Leaderboard

### Phase 4: Juice
- [ ] Blood splatter transitions
- [ ] Screen shake on jumpscare
- [ ] Haptic feedback on mobile
- [ ] Share result card (screenshot-able)
- [ ] "Best of" transcript highlights
- [ ] Difficulty scaling (monsters get smarter with higher scores?)

---

## File Structure (after fork)

```
src/
  app/
    page.tsx              # Main game (role select → play → score)
    api/
      session/route.ts    # Create game session
    layout.tsx
    providers.tsx
  lib/
    characters/
      index.ts            # Character registry
      monsters/
        grandmother.ts
        wounded.ts
        child.ts
      humans/
        runner.ts
        skeptic.ts
        neighbor.ts
    roles/
      index.ts            # Player role definitions
      child.ts
      sheriff.ts
      widow.ts
    prompt.ts             # Build system prompt from character + player role
    realtime/
      client.ts           # WebRTC client (from ai-convince)
      events.ts           # Event type guards
      useGame.ts          # Main game hook (replaces useSession)
    scoring.ts            # Point calculation (pure logic, no AI)
    audio.ts              # SFX playback manager
  types/
    index.ts
  assets/
    sfx/                  # Sound effect files
    images/               # Generated character images
convex/
  schema.ts
  sessions.ts             # Save + query + leaderboard
```

---

## Notes
- Monster/human is always 50/50 random — no weighting
- Player should NOT know the odds explicitly (let them guess)
- English language for wider reach
- Dark theme: blacks, deep reds, amber accents
- Typography: something unsettling — condensed, maybe slightly distorted
- Mobile: everything reachable with thumbs, no tiny buttons
