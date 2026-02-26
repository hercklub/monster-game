# BAT VR Project Brief — Gap Analysis vs Our Architecture

## ✅ Covered Well

| Brief Requirement | Our Architecture |
|---|---|
| Node.js backend | Express server ✅ |
| GPT-4 Real-Time integration | WS relay to OpenAI Realtime ✅ |
| AI soft skills scoring | Scoring service (GPT-4.1) ✅ |
| Automated PDF reports | Report service (pdfkit) ✅ |
| Real-time voice analysis | Supervisor service (attitude tracking) ✅ |
| Customizable personalities | Persona system (DB-backed) ✅ |
| Session management (start/end) | REST endpoints + WS lifecycle ✅ |
| Data export to BAT format | Export service (pluggable transforms) ✅ |
| Post-session AI scoring pass | Scoring service ✅ |
| Web version (React) | Same backend, different client ✅ |
| Sway Meter / mood visualization | Attitude updates via WS ✅ |
| Transcript capture | Server-side transcript logging ✅ |
| Whisper transcription | OpenAI Realtime has built-in transcription ✅ |
| MongoDB for persistence | Sessions, personas, logs collections ✅ |

## ⚠️ Partially Covered — Needs Expansion

### 1. Admin Interface ("The Director")
**Brief says:** Persona injection, environment/difficulty config, start/end sessions, real-time evaluation metrics, consent forms.

**We have:** Basic admin stats endpoint.

**Gap:** We need a full admin panel:
- `POST /api/sessions/start` — admin-initiated session (not just user self-service)
- `GET /api/sessions/:id/live` — SSE/WS for real-time metrics during active session
- `CRUD /api/personas` — create/edit/delete personas from admin
- `CRUD /api/scenarios` — configure difficulty, environment, persona combos
- Consent form management
- **Real-time monitoring** — admin sees live transcript + attitude + errors AS the session happens

### 2. BAT Sales Steps / Behaviour Tree
**Brief says:** Interaction governed by "strict graph based on BAT Sales Steps." Behaviour trees for sales funnel (5MD estimate).

**We have:** Supervisor with free-form evaluation prompt.

**Gap:** The supervisor needs to understand BAT's specific sales methodology:
- Sales steps/phases (not just our generic 3-phase model)
- Specific checkpoints (did they ask DOB? did they show the right product? forbidden words?)
- The evaluation should track completion of each sales step
- This is probably a **configurable behaviour tree** per scenario, not hardcoded

### 3. Product Knowledge / RAG
**Brief says:** "Simple RAG for product knowledge and evaluation" (3MD estimate).

**We have:** Nothing.

**Gap:** Need a RAG pipeline so:
- The AI avatar has product knowledge (glo devices, neo/veo sticks, features)
- Scoring can evaluate whether trainee gave correct product info
- Product catalog should be configurable per scenario
- Could be vector DB (Pinecone/Chroma) or just structured context injection

### 4. Consent Forms & Participant Info
**Brief says:** "Participant info and consent forms through the admin interface." GDPR opt-in required.

**We have:** Just `userName` on session creation.

**Gap:** Need:
- `POST /api/participants` — register participant with consent
- Consent status tracked per session
- Data retention policies (auto-delete after X days?)
- Participant can't start session without consent

### 5. Authentication & RBAC
**Brief says:** "Project setup, architecture, authentication, RBAC - 5MD." Role-Based Access Control.

**We have:** Nothing — all endpoints are open.

**Gap:** Need:
- Auth system (JWT or session-based)
- Roles: **Admin** (BAT managers), **Trainer** (Regional Coordinators), **Trainee** (hostesses)
- Admin: full access (scenarios, personas, all sessions, export)
- Trainer: can start/monitor sessions, view reports for their trainees
- Trainee: can only see their own scores/reports
- RBAC middleware on all endpoints

### 6. BatMan API Integration
**Brief says:** "BatMan API Integration" — connecting data pipelines for reporting to BAT's internal L&D system.

**We have:** Generic export service with pluggable transforms.

**Gap:** Need the actual BatMan API spec. Our export service is the right pattern, but we need:
- BatMan API endpoint + auth details from BAT
- Exact data format they expect (XML/JSON — brief mentions both)
- Error handling + retry logic for failed uploads
- Possibly a sync/reconciliation mechanism

### 7. Real-time Error Notifications
**Brief says:** AI guides hostess through errors in real-time. Mentorship system.

**We have:** Supervisor injects state (hidden from user, guides persona behavior).

**Gap:** The brief wants the AI to also **coach the trainee** — not just steer the avatar:
- Detect errors (forgot DOB check, used forbidden word "free", wrong product selection)
- Alert trainee in real-time (audio cue? visual notification? mentor voice?)
- Track errors for scoring
- This is separate from the supervisor — it's a **mentor service**

## ❌ Not Covered — Needs Adding

### 8. VR-Specific Event Tracking
**Brief says:** Track favorite colors, correct DOB entry, upselling attempts, visual age check, product interactions, tablet interactions.

**We have:** Only transcript + mood tracking.

**Gap:** Unity needs to send **structured events** beyond just audio:
```
POST /api/sessions/:id/events
{ "type": "product_pickup", "product": "glo_hyper", "timestamp": ... }
{ "type": "dob_check", "entered": "1998-05-12", "correct": true }
{ "type": "forbidden_word", "word": "free", "context": "..." }
{ "type": "color_cue_noticed", "color": "blue", "noticed": false }
```
New endpoint + MongoDB events subcollection + scoring should incorporate these.

### 9. Local Storage / Offline Resilience (Unity)
**Brief says:** "Local storage — saving events, metadata, transcript (video/audio?) - 3MD"

**Our architecture:** Assumes always-online (WS connected to server).

**Gap:** Unity should buffer events locally in case of connection drop:
- Queue events → send when reconnected
- Save partial session data if WS drops mid-conversation
- This is Unity-side, but backend needs `POST /api/sessions/:id/sync` for batch upload

### 10. Difficulty Levels
**Brief says:** "Environment customization, difficulty (easy/medium/hard)"

**We have:** Single difficulty per persona.

**Gap:** Difficulty should modify:
- Avatar resistance level (initial attitude, how fast they soften)
- Number/intensity of distractions
- Strictness of scoring
- Sales step requirements
- This is a `difficulty` field on Scenario config

### 11. Tutorial vs Evaluative Mode
**Brief says:** Two versions — tutorial (with guidance) vs evaluative (scored, no help).

**We have:** Single mode only.

**Gap:** Need a `mode` field on sessions:
- **Tutorial:** Real-time mentorship, hints, pauses for explanation, lighter scoring
- **Evaluative:** No help, strict scoring, results count for KPIs
- Mode affects mentor service behavior + scoring weights

### 12. Multiple Environments
**Brief says:** Valmont store interior, street/outdoor location, promo table, checkout, newsstand.

**We have:** No environment concept.

**Gap:** Environments are mostly Unity-side (3D scenes), but backend should:
- Track which environment the session used
- Allow admin to configure environment per scenario
- Include environment in metadata for scoring context

### 13. Distraction System
**Brief says:** Visual distractions (display ads), audio distractions (traffic, sirens, conversations), operational distractions (tablet battery, badge, empty device).

**We have:** Nothing — this is all Unity-side.

**Gap:** Backend needs:
- Distraction config per scenario/difficulty (which distractions, timing, intensity)
- Event tracking for distraction responses
- Scoring should consider how trainee handled distractions

### 14. Audio/Video Recording
**Brief says:** "Local storage - saving events, metadata, transcript (video/audio?) - 3MD"

**We have:** Text transcript only.

**Gap:** Consider:
- Audio recording upload (for review by trainers)
- Storage implications (S3/GCS for blobs)
- GDPR: consent specifically for audio recording
- This might be post-MVP

### 15. Localization
**Brief says:** "Czech language. Registrations limited to Czech and Slovak phone numbers."

**We have:** Hardcoded Czech prompts.

**Gap:** Need:
- Language config per scenario (CZ/SK initially, potentially EN later)
- Phone number validation on registration
- All prompts/scoring should support language parameter

---

## Architecture Updates Needed

### New Endpoints
```
# Admin / Director
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

CRUD   /api/personas
CRUD   /api/scenarios
CRUD   /api/participants          # with consent tracking

POST   /api/sessions/start        # admin-initiated
GET    /api/sessions/:id/live     # SSE for real-time monitoring

POST   /api/sessions/:id/events   # structured events from Unity
POST   /api/sessions/:id/sync     # batch upload (offline recovery)

# Product knowledge
GET    /api/products              # product catalog
POST   /api/products/search       # RAG search
```

### New Services
```
services/
├── mentor.ts        # Real-time error detection + trainee coaching
├── behavior-tree.ts # BAT sales steps evaluation
├── rag.ts           # Product knowledge retrieval
├── auth.ts          # JWT + RBAC
└── events.ts        # Structured event processing
```

### New MongoDB Collections
```
participants    # trainee profiles + consent status
events          # structured VR events per session
products        # product catalog for RAG
```

### Updated Session Schema
```json
{
  "sessionId": "...",
  "mode": "tutorial" | "evaluative",
  "difficulty": "easy" | "medium" | "hard",
  "environment": "valmont_interior" | "street" | ...,
  "language": "cs" | "sk",
  "participantId": "...",    // links to consent
  "trainerId": "...",        // who initiated
  "events": [...],           // structured VR events
  "salesSteps": {            // BAT sales funnel tracking
    "greeting": { "completed": true, "quality": 8 },
    "needsAssessment": { "completed": true, "quality": 6 },
    "productPresentation": { "completed": false },
    "dobCheck": { "completed": true, "correct": true },
    ...
  },
  "errors": [                // forbidden words, missed cues, etc.
    { "type": "forbidden_word", "word": "free", "timestamp": ... }
  ],
  ...existing fields
}
```

---

## Priority Assessment

### Must Have (MVP)
1. ✅ WS relay + supervisor + scoring (we have this)
2. ⚠️ Admin panel (The Director) — basic CRUD + session monitoring
3. ⚠️ Auth + RBAC — can't ship without it for B2B
4. ⚠️ BAT sales steps in supervisor/scoring
5. ⚠️ Consent flow
6. ❌ Structured event tracking from Unity
7. ❌ Tutorial vs Evaluative mode

### Should Have
8. ⚠️ RAG for product knowledge
9. ❌ Difficulty levels
10. ⚠️ BatMan API integration (when spec available)
11. ❌ Real-time admin monitoring (SSE)

### Nice to Have (Post-MVP)
12. ❌ Audio recording + storage
13. ❌ Offline resilience (Unity local buffer)
14. ❌ Advanced distraction config
15. ❌ Multi-language support
