# BAT VR Sales Trainer — Express + WebSocket Architecture

## Overview

Backend server for AI-powered sales training. WebSocket relay to OpenAI Realtime, server-side supervisor, scoring, structured data export, PDF reports. Unity VR + Web clients connect via WebSocket + REST.

```
┌──────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                          │
│                                                           │
│  ┌──────────┐  ┌───────────┐  ┌────────┐  ┌───────────┐ │
│  │ WS Relay │  │Supervisor │  │Scoring │  │  REST     │ │
│  │ Manager  │←→│  Service  │  │Service │  │  API      │ │
│  └────┬─────┘  └───────────┘  └────────┘  └───────────┘ │
│       │                                                   │
│  ┌────┴─────┐  ┌───────────┐  ┌────────┐  ┌───────────┐ │
│  │ OpenAI   │  │  Report   │  │ Export │  │  Events   │ │
│  │ Realtime │  │  (PDF)    │  │Service │  │  Service  │ │
│  └──────────┘  └───────────┘  └────────┘  └───────────┘ │
│                                                           │
│                    ┌──────────────┐                        │
│                    │   MongoDB    │                        │
│                    │ sessions     │                        │
│                    │ personas     │                        │
│                    │ events       │                        │
│                    └──────────────┘                        │
└──────────────────────────────────────────────────────────┘
        ▲                           ▲
        │ WebSocket                 │ REST
        │ (audio + events)          │ (session mgmt)
        │                           │
┌───────┴───────────────────────────┴──────┐
│         UNITY VR / WEB CLIENT            │
└──────────────────────────────────────────┘
```

---

## Personas (5 customer types)

Each persona has its own personality, supervisor prompt, and scoring criteria. No difficulty levels — the persona IS the difficulty.

| Persona | Type | Challenge |
|---|---|---|
| FMC Smoker | Traditional cigarette user | Resistant to switching, loyal to brand |
| Velo User | Nicotine pouch user | Already alternative, why switch? |
| Glo Lapsed | Former glo user who stopped | Had bad experience, needs re-convincing |
| Curious Newcomer | Never tried alternatives | Open but confused, needs education |
| Hostile/No Time | Negative, in a rush | Doesn't want to be bothered |

Each persona has:
- Unique system prompt (personality, speech style, objections)
- Unique supervisor prompt (what to evaluate, how attitude shifts)
- Unique scoring criteria (different weights per persona type)
- Product knowledge context baked into supervisor + realtime prompts

---

## Structured Data Format

All session data is stored in a folder structure for export:

```
sessions/
└── BAT-001/
    ├── session.json
    ├── events.json
    └── transcript.json
```

### session.json
```json
{
  "sessionId": "BAT-001",
  "traineeId": "REP_55",
  "personaId": "fmc_smoker",
  "personaName": "Karel",
  "scenarioId": "fmc_resistant",
  "sessionStartUtc": "2024-10-27T10:00:00Z",
  "sessionEndUtc": "2024-10-27T10:08:32Z",
  "durationMs": 512000,
  "outcome": "converted",
  "finalAttitude": 7,
  "moodHistory": [2, 3, 3, 5, 6, 7],
  "score": {
    "overall": 75,
    "categories": {
      "empathy": 80,
      "argumentQuality": 70,
      "persistence": 65,
      "adaptability": 85
    },
    "highlights": ["Good use of product comparison", "Asked about preferences"],
    "improvements": ["Forgot DOB check", "Used forbidden word 'free'"],
    "summary": "Solid performance with room for improvement on protocol."
  },
  "client": "unity-vr",
  "metadata": {}
}
```

### events.json (NDJSON — one event per line)
```json
{"time": 0.0, "type": "SYSTEM", "data": "Session_Start"}
{"time": 1.5, "type": "SYSTEM", "data": "Persona_Loaded"}
{"time": 5.2, "type": "VR_INTERACTION", "data": {"interactedObject": "GLO_Device", "action": "PICKUP"}}
{"time": 12.4, "type": "TABLET_CHOICE", "data": {"question": "Q1", "answer": "Option_B"}}
{"time": 45.3, "type": "SUPERVISOR", "data": {"attitude": 4, "direction": "rising", "guidance": "..."}}
{"time": 88.0, "type": "ERROR", "data": {"errorType": "forbidden_word", "word": "free"}}
{"time": 120.5, "type": "DOB_CHECK", "data": {"entered": "1998-05-12", "correct": true}}
{"time": 510.0, "type": "SYSTEM", "data": "Session_End"}
```

### transcript.json (NDJSON — one utterance per line)
```json
{"startTime": 2.1, "endTime": 4.5, "speaker": "AVATAR", "text": "Hi, I am looking for something new."}
{"startTime": 5.0, "endTime": 8.2, "speaker": "TRAINEE", "text": "Sure, have you tried the GLO Hyper?"}
{"startTime": 9.1, "endTime": 12.8, "speaker": "AVATAR", "text": "I don't know, I've been smoking Marlboro for 20 years..."}
{"startTime": 13.5, "endTime": 18.3, "speaker": "TRAINEE", "text": "I understand. Many of our customers switched from traditional cigarettes."}
```

---

## WebSocket Relay (core)

Client connects to our server, server opens parallel WS to OpenAI Realtime. Two-way bridge with supervisor tapping the stream.

```
Unity ←──WS──→ Express Server ←──WS──→ OpenAI Realtime API
                     │
                     ├── Captures transcripts (both sides)
                     ├── Runs supervisor (debounced)
                     ├── Injects state back into OpenAI WS
                     └── Records events with timestamps
```

### Client → Server messages
```jsonc
// Audio streaming
{ "type": "audio", "data": "<base64 PCM16 24kHz>" }

// VR interaction events (Unity sends these)
{ "type": "event", "data": { "type": "VR_INTERACTION", "data": { "interactedObject": "GLO_Device", "action": "PICKUP" } } }
{ "type": "event", "data": { "type": "TABLET_CHOICE", "data": { "question": "Q1", "answer": "Option_B" } } }
{ "type": "event", "data": { "type": "DOB_CHECK", "data": { "entered": "1998-05-12", "correct": true } } }

// Client wants to end
{ "type": "end_session" }
```

### Server → Client messages
```jsonc
// Audio from AI
{ "type": "audio", "data": "<base64 PCM16 24kHz>" }

// Transcript updates (for UI)
{ "type": "transcript", "speaker": "AVATAR"|"TRAINEE", "text": "...", "startTime": 2.1, "endTime": 4.5 }

// Attitude update (for mood meter / sway meter)
{ "type": "attitude", "value": 5, "direction": "rising" }

// Session ended
{ "type": "session_ended", "outcome": "converted"|"rejected"|"walked_away" }

// Score ready
{ "type": "score", "data": { "overall": 75, "categories": {...}, ... } }

// Error
{ "type": "error", "message": "..." }
```

---

## REST Endpoints

### Sessions
```
POST   /api/sessions                  Create new session
GET    /api/sessions/:id              Get session (status, transcript, score)
GET    /api/sessions                  List sessions (with filters)
POST   /api/sessions/:id/events       Upload batch events (from Unity local buffer)
```

### WebSocket
```
WSS    /ws/sessions/:id               Audio relay + bidirectional events
```

### Reports & Export
```
GET    /api/sessions/:id/report       Download PDF report card
POST   /api/sessions/:id/export       Transform + upload to BatMan API
GET    /api/sessions/:id/data         Download structured data (session.json + events.json + transcript.json as zip)
```

### Scenarios & Personas
```
GET    /api/scenarios                 List available scenarios
GET    /api/personas                  List personas
```

### Dashboard
```
GET    /api/dashboard                 Session list with basic stats
GET    /api/dashboard/stats           Aggregate: avg scores, conversion rates
```

---

## WebSocket Connection Flow

```
1.  Client:  POST /api/sessions { scenarioId, traineeId }
             → gets sessionId + wsUrl + persona info

2.  Client:  WS Connect to /ws/sessions/{sessionId}
3.  Server:  Opens WS to OpenAI Realtime (persona prompt + tools + product knowledge)
4.  Server:  → Client: { type: "ready" }

5.  Client:  Starts sending { type: "audio", data: "..." }
6.  Server:  Forwards to OpenAI via input_audio_buffer.append
7.  OpenAI:  Streams back response.audio.delta → Server → Client
8.  Server:  Captures transcripts both directions
9.  Client:  Sends VR events as they happen { type: "event", data: {...} }

10. Server:  Supervisor runs (debounced 2s after each assistant message):
             - Evaluates conversation state
             - Checks BAT sales steps compliance
             - Injects state into OpenAI conversation
             - Sends attitude update to client

11. OpenAI:  Calls end_conversation tool → Server handles end:
             - Waits for audio playback (~5s)
             - Disconnects OpenAI WS
             - Runs scoring (GPT-4.1)
             - Saves everything to MongoDB
             - Writes structured data files (session/events/transcript.json)
             - Sends score to client
```

---

## Server-Side Supervisor

Runs entirely server-side. Taps the relay stream, sees all transcripts + events, injects state into OpenAI WS.

```
OpenAI events → Relay captures transcript
Client events → Events service logs VR interactions
                    ↓
              Supervisor debounce (2s after last assistant msg)
                    ↓
              Call GPT-4.1 with:
                - Transcript
                - VR events (product interactions, DOB checks, etc.)
                - Persona-specific evaluation criteria
                - BAT sales steps checklist
                - Product knowledge context
                    ↓
              Inject state via conversation.item.create → OpenAI WS
              Send attitude update → Client WS
              If shouldEnd → end session flow
```

### Product knowledge & BAT sales steps

Baked into the supervisor + realtime prompts per persona. No separate RAG needed:

- **Realtime prompt:** Persona personality + product awareness (what they know/don't know about glo)
- **Supervisor prompt:** BAT sales steps checklist + product accuracy evaluation
- **Scoring prompt:** Weights adjusted per persona type

The supervisor prompt includes the sales funnel steps and evaluates whether the trainee:
- Greeted properly
- Assessed needs (asked questions before pitching)
- Presented the right product for the customer type
- Did DOB/age verification
- Used correct product info (neo vs veo, features)
- Avoided forbidden words
- Handled objections appropriately
- Closed properly

---

## Dashboard (Simple)

Minimal web UI:
- **Session list** — table with: sessionId, traineeId, persona, outcome, score, date, duration
- **Filters** — by trainee, persona, outcome, date range
- **Per session** — view details + download PDF report
- **Stats bar** — total sessions, avg score, conversion rate

No admin CRUD, no session management from dashboard. Sessions are created by clients (Unity/Web).

---

## Data Pipeline

```
Session ends
    ↓
┌───────────────────────┐
│ 1. Scoring (GPT-4.1)  │  Auto on session end
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ 2. Save to MongoDB    │  Full session record
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ 3. Write Data Files   │  sessions/{id}/session.json
│                       │  sessions/{id}/events.json
│                       │  sessions/{id}/transcript.json
└───────┬───────┬───────┘
        ↓       ↓
┌─────────┐ ┌──────────┐
│ 4. PDF  │ │ 5.Export │  On demand (dashboard or API call)
│ Report  │ │ BatMan   │
└─────────┘ └──────────┘
```

---

## MongoDB Collections

### `sessions`
```json
{
  "_id": "ObjectId",
  "sessionId": "BAT-001",
  "traineeId": "REP_55",
  "scenarioId": "fmc_resistant",
  "personaId": "fmc_smoker",
  "personaName": "Karel",
  "status": "active" | "ended",
  "outcome": "converted" | "rejected" | "walked_away" | null,
  "transcript": [
    { "startTime": 2.1, "endTime": 4.5, "speaker": "AVATAR", "text": "..." },
    { "startTime": 5.0, "endTime": 8.2, "speaker": "TRAINEE", "text": "..." }
  ],
  "events": [
    { "time": 5.2, "type": "VR_INTERACTION", "data": { "interactedObject": "GLO_Device", "action": "PICKUP" } }
  ],
  "moodHistory": [2, 3, 5, 7],
  "finalAttitude": 7,
  "score": { "overall": 75, "categories": {...}, "highlights": [...], "improvements": [...], "summary": "..." },
  "supervisorLogs": [...],
  "endTrigger": "end_conversation:converted",
  "durationMs": 512000,
  "client": "unity-vr",
  "metadata": {},
  "exports": [{ "exportId": "uuid", "status": "sent", "sentAt": "ISODate" }],
  "dataFilesWritten": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### `personas`
```json
{
  "_id": "ObjectId",
  "id": "fmc_smoker",
  "name": "Karel",
  "type": "FMC Smoker",
  "age": 45,
  "description": "Long-time Marlboro smoker, skeptical about alternatives",
  "voice": "verse",
  "initialAttitude": 2,
  "traits": ["skeptical", "loyal to brand", "health-conscious deep down"],
  "realtimePrompt": "...",
  "supervisorPrompt": "...",
  "scoringPrompt": "...",
  "productKnowledge": "..."
}
```

---

## Project Structure

```
bat-vr-backend/
├── src/
│   ├── server.ts                 # Express + WS setup
│   ├── config.ts                 # env vars, constants
│   ├── db/
│   │   ├── connection.ts         # MongoDB client
│   │   ├── sessions.ts           # Session CRUD
│   │   └── personas.ts           # Persona CRUD + seed
│   ├── routes/
│   │   ├── sessions.ts           # REST: /api/sessions + events
│   │   ├── scenarios.ts          # REST: /api/scenarios + personas
│   │   └── dashboard.ts          # REST: /api/dashboard
│   ├── ws/
│   │   ├── relay.ts              # WS relay manager (client ↔ OpenAI)
│   │   └── handlers.ts           # Message routing + audio forwarding
│   ├── services/
│   │   ├── openai.ts             # OpenAI client + Realtime WS
│   │   ├── supervisor.ts         # Evaluation + state injection + sales steps
│   │   ├── scoring.ts            # Post-session scoring
│   │   ├── prompt.ts             # Persona prompt builder
│   │   ├── report.ts             # PDF generation (pdfkit)
│   │   ├── export.ts             # Data transform + BatMan API upload
│   │   └── data-writer.ts        # Write session/events/transcript.json files
│   └── types/
│       └── index.ts              # Shared types
├── data/
│   └── sessions/                 # Structured data output
│       └── BAT-001/
│           ├── session.json
│           ├── events.json
│           └── transcript.json
├── package.json
├── tsconfig.json
├── .env.example
└── docker-compose.yml            # Express + MongoDB
```

---

## Environment Variables

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/bat-vr-trainer
OPENAI_API_KEY=sk-...

# Models
REALTIME_MODEL=gpt-4o-realtime-preview-2025-06-03
SUPERVISOR_MODEL=gpt-4.1
SCORING_MODEL=gpt-4.1

# Export
BATMAN_API_URL=https://...
BATMAN_API_AUTH=Bearer xxx

# Data
DATA_DIR=./data/sessions

# Optional
CORS_ORIGIN=*
LOG_LEVEL=info
```

---

## What Ports from ai-convince-demo

| Current (Next.js) | New (Express) | Changes |
|---|---|---|
| `lib/supervisor.ts` | `services/supervisor.ts` | + BAT sales steps + events context |
| `lib/scoring.ts` | `services/scoring.ts` | + per-persona criteria + events |
| `lib/prompt.ts` | `services/prompt.ts` | Per-persona prompts from DB |
| `lib/openai.ts` | `services/openai.ts` | + WS connection |
| `lib/personas/*` | `db/personas.ts` + seed | DB-backed, 5 personas |
| `types/index.ts` | `types/index.ts` | + events + BAT types |
| `lib/realtime/client.ts` | `ws/relay.ts` | WS not WebRTC |
| `lib/realtime/events.ts` | `ws/handlers.ts` | Same event types |
| Convex sessions | `db/sessions.ts` | MongoDB |
| — | `services/data-writer.ts` | **NEW:** structured file output |
| — | `services/report.ts` | **NEW:** PDF generation |
| — | `services/export.ts` | **NEW:** BatMan API upload |
| — | `routes/dashboard.ts` | **NEW:** simple dashboard |

---

## Deployment

- **Dev:** `docker-compose up` (Express + MongoDB)
- **Prod:** VPS with Docker (Railway / Render / Fly.io / any VM)
- **No serverless** — WebSocket connections need persistent server
- `data/sessions/` directory needs persistent storage (or S3 for prod)
