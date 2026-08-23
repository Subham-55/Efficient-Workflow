# AdaptFlow — Frontend Product Requirements Document (PRD)

**Document owner:** Frontend Engineering Lead
**Scope:** Frontend only (web client). Backend — CrewAI/LangGraph agent pipeline + Groq inference — is owned by a separate team member and is treated as an external API/WebSocket contract in this document.
**Audience:** Human frontend engineers and AI coding agents (e.g. Claude Code) implementing this project for a hackathon, with a path to production scalability.
**Version:** 1.0
**Status:** Ready for build

---

## 1. Product Summary

AdaptFlow is an AI product that detects inefficient operational workflows (support ticket triage, lead routing, HR approvals, etc.) and **self-migrates** them into AI-agent-driven automations — not just a recommendation engine, but a system that outputs a runnable, agent-based replacement for the broken process.

The backend pipeline (owned by teammate) is: **Input → Parse → Diagnose → Migrate → Visualize**, built on CrewAI (agent roles), LangGraph (state machine / orchestration), and Groq (low-latency LLM inference).

The pitch deck specifies Streamlit as the demo UI. **This PRD intentionally replaces Streamlit with a dedicated, production-grade frontend.** Streamlit is fast to prototype but reads as a "notebook demo" to judges and cannot deliver the polished before/after workflow visualization, live agent trace, and human-in-the-loop approval UI that the pitch deck's own narrative depends on ("Live Demo," "Supervisor dashboard," "confidence score, human override"). A custom frontend is what turns this from a script into a product — which directly improves scores on technical execution, demo quality, and feasibility.

### 1.1 What "winning" looks like for this frontend
- A judge can, in under 60 seconds, see a broken workflow go in and a working AI-agent flow come out, visually.
- The before/after comparison (manual effort 90%→30%, response speed 35%→85%, per the deck) is the emotional core of the demo — the UI must make that comparison unmissable.
- The UI must survive a live demo failure gracefully (backend down, Groq latency spike) via a built-in mock/replay mode.
- The UI must look like a real SaaS product, not a hackathon template — because AdaptFlow's own pitch is "we don't just advise, we build the real thing."

---

## 2. Goals & Non-Goals

### 2.1 Goals
1. Ship a demo-ready, deployed web app within the hackathon window (24–48 hrs) that fully supports the 5-stage pipeline narrative.
2. Provide an **offline/mock demo mode** so the presentation never depends on live backend/Groq availability.
3. Visualize the workflow diagnosis and migration as an actual node-graph (not just text/bullets) — this is the single highest-leverage UI investment given the pitch's "before vs after flow" framing.
4. Support a human-in-the-loop approval interaction (confidence score + override), since this is explicitly called out in the deck as a trust/impact feature.
5. Be built on a stack an AI coding agent can scaffold, extend, and debug with minimal ambiguity — every screen, component, and data contract in this document is specified concretely enough to implement without further product decisions.
6. Be architected so post-hackathon, it can scale from a single demo workflow (support-ticket triage) to a multi-workflow SaaS platform (HR onboarding, lead routing, grievance routing) without a rewrite.

### 2.2 Non-Goals (out of scope for this document)
- Backend agent logic (CrewAI role definitions, LangGraph graph definition, prompt engineering) — teammate's responsibility. This PRD only defines the **API contract** the frontend expects.
- Authentication provider selection/implementation details beyond a stubbed auth layer (see §10).
- Payment/billing (post-hackathon SaaS concern, mentioned only in scaling notes).
- Native mobile apps.

---

## 3. Users & Core User Journeys

### 3.1 Primary persona
**Ops/Support Lead at a small team, SME, or college club** — not a developer. Needs to see, in plain language and visuals, why their workflow is slow and what will replace it. Low tolerance for jargon; high trust need (wants an override button, not a black box).

### 3.2 Secondary persona (hackathon-specific)
**Hackathon judge.** Spends ~2–3 minutes per project. Needs the value prop legible without narration: a problem workflow, a diagnosis, a transformed workflow, and a measurable improvement, all visible on screen.

### 3.3 Core user journey (maps 1:1 to backend pipeline stages)
1. **Input** — User describes a workflow in free text, or uploads an SOP/notes/ticket CSV, or picks a pre-loaded example ("Support Ticket Triage") for demo speed.
2. **Parse** — UI shows a loading/processing state that narrates what's happening (actors, steps, dependencies extracted) rather than a generic spinner.
3. **Diagnose** — UI shows the current ("before") workflow as a node graph, with bottlenecks/pain points highlighted directly on the relevant nodes.
4. **Migrate** — UI shows the proposed ("after") AI-agent workflow as a second node graph, with agent roles, decision nodes, and handoff logic labeled.
5. **Visualize / Decide** — UI shows both graphs side-by-side (or toggle), with impact metrics (manual effort %, response speed %), a confidence score, and an **Approve / Adjust / Reject** action — the human-in-the-loop moment.
6. **Export** — User can export the execution plan (PDF/JSON) and/or view an audit trail entry.

---

## 4. Recommended Tech Stack (Frontend)

This stack is chosen specifically to (a) make the node-graph before/after visualization trivial rather than custom-built, (b) look and feel like a polished product to judges with minimal design effort, (c) be something an AI coding agent can scaffold quickly and safely, and (d) scale cleanly past the hackathon.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router, TypeScript)** | Industry-standard, file-based routing keeps the AI agent's mental model simple, built-in API routes double as a mock-backend layer for demo safety, trivial Vercel deployment for judge access via a live URL. |
| Language | **TypeScript (strict mode)** | Contracts (API responses, node/edge shapes) become compile-time-checked, which matters most when frontend and backend are built by two people in parallel under time pressure. |
| Styling | **Tailwind CSS** | Fast, consistent, no context-switching to separate CSS files — ideal for AI-agent-driven development and hackathon speed. |
| Component library | **shadcn/ui** (Radix primitives + Tailwind) | Accessible, unstyled-by-default primitives that look professional out of the box (buttons, dialogs, tabs, tooltips, sliders, toast) without fighting a heavy design system. |
| Workflow graph visualization | **React Flow (`@xyflow/react`)** | Purpose-built for exactly this problem: rendering interactive node/edge diagrams with custom node types, highlighting, and animated edges. This is the single most important library choice in this PRD — it is what turns "before/after workflow" from a slide graphic into a live, interactive demo artifact. |
| Animation | **Framer Motion** | Smooth transitions between pipeline stages (parse → diagnose → migrate) and node highlight/pulse effects on bottlenecks — cheap visual polish that reads as "finished product." |
| Charts (impact metrics) | **Recharts** | Manual-effort % and response-speed % bar/gauge comparisons (before vs after) — lightweight, composable, good default aesthetics. |
| Client state | **Zustand** | Minimal-boilerplate global state for pipeline stage, current workflow session, and UI mode (live vs mock demo) — far simpler than Redux for an agent to reason about and modify. |
| Server state / data fetching | **TanStack Query (React Query)** | Handles polling/retry against the backend pipeline endpoints, caching, and loading/error states without hand-rolled fetch logic scattered across components. |
| Real-time updates | **native WebSocket (or Socket.IO client if backend adopts Socket.IO) + TanStack Query cache updates** | The "Diagnostic AI" and "Migrate" stages are agent reasoning steps that take real time — streaming partial progress (which agent is running, which step is done) keeps the demo visually alive instead of a dead spinner. |
| Forms/validation | **React Hook Form + Zod** | Input stage (free text / SOP upload / CSV upload) needs validation and typed schemas shared with the API contract layer. |
| Icons | **lucide-react** | Matches shadcn/ui conventions, consistent stroke-based icon set. |
| Deployment | **Vercel** | Zero-config Next.js hosting, instant preview URLs per commit — critical for judges accessing a live link, and for iterating during the build window. |
| Testing (lightweight) | **Vitest + React Testing Library** | Just enough to sanity-check the mock-data path and core components before the demo; not a heavy QA investment given the timeline. |

> **AI-agent build note:** Scaffold with `npx create-next-app@latest --typescript --tailwind --app`, then add shadcn/ui via `npx shadcn@latest init`, then install `@xyflow/react framer-motion recharts zustand @tanstack/react-query react-hook-form zod lucide-react`.

---

## 5. Information Architecture (Pages/Routes)

```
/                          → Landing / marketing page (for judges browsing before the live demo)
/app                       → Main product shell (authenticated or demo-mode entry)
/app/new                   → Input stage: describe workflow / upload SOP / pick example
/app/session/[sessionId]   → Core pipeline view (Parse → Diagnose → Migrate → Visualize), tabbed or stepper
/app/session/[sessionId]/report → Export / audit trail / execution plan view
/app/dashboard             → (Scaling feature, stub for hackathon) list of past sessions, org-wide metrics
/app/settings              → (Stub) org/team settings, human-approval policy toggle
```

For the hackathon build, `/`, `/app/new`, and `/app/session/[sessionId]` are P0 (must-have). `/app/session/[sessionId]/report`, `/app/dashboard`, `/app/settings` are P1 (nice-to-have polish if time remains).

---

## 6. Detailed Screen Specifications

### 6.1 Landing Page (`/`)
**Purpose:** First impression for judges scanning submissions; also doubles as the "hero slide" of the live demo.

- Hero section: product name "AdaptFlow", one-line mission ("AdaptFlow finds broken digital workflows and turns them into AI automations you can actually deploy"), primary CTA button "Try a Live Workflow" → `/app/new`.
- Below the fold: 3-step visual summary (Diagnostic AI 🧠 / Self-Migration Engine 🔁 / Hackathon-ready Execution ⚡) matching the deck's innovation slide — implement as three cards with icon, title, one-line description.
- Impact stats strip: 65% adoption signal, 400% ROI potential, 89% market interest (from the deck) as three animated counters (Framer Motion) — purely a credibility/impact visual.
- Footer: tech stack badges (CrewAI, LangGraph, Groq) for technical credibility.

### 6.2 Input Stage (`/app/new`)
**Purpose:** Start a new diagnosis session; must be fast for a live demo.

Components:
- Tabbed input selector: **"Describe a workflow"** (free-text textarea, React Hook Form + Zod, min 20 chars) / **"Upload SOP or CSV"** (drag-and-drop file upload, accepts `.txt, .md, .csv, .pdf`) / **"Use a demo example"** (pre-set cards: "Support Ticket Triage", "Lead Routing", "HR Onboarding" — each populates a canned mock session instantly, critical for demo-safety).
- Submit button "Analyze Workflow" — disabled until valid input; shows loading state and transitions to `/app/session/[sessionId]`.
- A visible toggle/badge: **"Live Mode" vs "Demo Mode"** (see §9 Mock Data Strategy) — lets the presenter consciously choose safety during the actual pitch.

### 6.3 Pipeline View (`/app/session/[sessionId]`) — **the core screen**
**Purpose:** This is where the demo lives. It must visually walk through Parse → Diagnose → Migrate → Visualize.

Layout: a horizontal stepper/tab bar at the top (`Parse · Diagnose · Migrate · Visualize`) with the active stage highlighted, plus a persistent "session summary" sidebar (workflow name, timestamp, input source).

**Stage: Parse**
- Shows extracted structure as a simple list/table: Actors, Steps, Dependencies, Pain Points (raw, pre-diagnosis) — sourced from backend's LangGraph state-machine output.
- Skeleton loading state with staged reveal (Framer Motion) — items appear one at a time as if being extracted live, even if the actual API response arrives all at once (this is a deliberate demo-pacing choice — see §9).

**Stage: Diagnose ("Before" workflow)**
- **React Flow canvas** rendering the current workflow as a node graph: each step = a node, dependencies = directed edges.
- Nodes flagged as bottlenecks/inefficiencies are visually distinct: red/amber border, a small warning icon, and a pulsing animation (Framer Motion `animate` on the node wrapper).
- Clicking a flagged node opens a side panel with the specific diagnosis text (e.g., "Manual triage step — average delay 4.2 hrs, no prioritization logic").
- A small legend: green = healthy step, amber = inefficiency, red = critical bottleneck.

**Stage: Migrate ("After" workflow)**
- Second **React Flow canvas**, same visual language, but nodes now represent agent roles / decision nodes / handoff logic (e.g., "Classifier Agent", "Router (LangGraph decision node)", "Auto-Draft Response Agent", "Human Review Gate").
- Distinct node type/color for **human-in-the-loop gates** (per the deck's "Supervisor dashboard... human override") — these nodes always render with a small "person" icon, regardless of confidence score, so the human-oversight story is visually obvious to judges.
- Edge labels show conditions (e.g., "if confidence < 0.7 → escalate to human").

**Stage: Visualize (comparison + decision)**
- Side-by-side or toggle view of Before/After graphs (reuse the same React Flow instances with a layout toggle, don't rebuild).
- **Impact metrics panel** (Recharts): grouped bar chart or paired gauge charts for "Manual Effort %" (90 → 30) and "Response Speed %" (35 → 85), animated count-up on mount.
- **Confidence score** — a radial/gauge indicator (0–100%) representing the AI's confidence in the proposed migration.
- **Decision bar** (sticky footer or card): three actions — **Approve & Deploy**, **Adjust** (opens a lightweight edit mode — reassign a step back to manual, or edit an agent's role label), **Reject**. Approve triggers a success toast + unlocks the Report/Export stage.

### 6.4 Report / Export (`/app/session/[sessionId]/report`) — P1
- Read-only summary of the approved plan: final workflow graph (static export image or same React Flow instance, non-editable), impact metrics, confidence score, and an audit trail list (timestamped entries: "Diagnosis generated", "Human approved migration", "Exported plan").
- Export buttons: "Export as PDF" (client-side render of the summary card via `html-to-image` + browser print, or a simple server route), "Export as JSON" (raw workflow schema, see §8).

### 6.5 Dashboard (`/app/dashboard`) — P1/stretch
- Table of past sessions (workflow name, date, status: Diagnosed / Approved / Rejected, impact summary).
- This screen exists mainly to demonstrate the **scalability story** from the deck ("scale as a SaaS workflow intelligence layer") — even a static/mocked version signals to judges that the team thought past the single demo.

---

## 7. Component Architecture

```
/app
  /(marketing)/page.tsx                 → Landing page
  /app/new/page.tsx                     → Input stage
  /app/session/[sessionId]/page.tsx     → Pipeline view (stepper container)
  /app/session/[sessionId]/report/page.tsx
  /app/dashboard/page.tsx
  /api/mock/*.ts                        → Next.js API routes serving canned demo responses (see §9)

/components
  /pipeline
    PipelineStepper.tsx
    ParseStageView.tsx
    DiagnoseStageView.tsx
    MigrateStageView.tsx
    VisualizeStageView.tsx
    DecisionBar.tsx
  /flow
    WorkflowCanvas.tsx        → wraps React Flow, shared by Diagnose/Migrate/Visualize
    nodes/
      StepNode.tsx            → default workflow step node
      AgentNode.tsx           → agent-role node (Migrate stage)
      HumanGateNode.tsx       → human-in-the-loop gate node
    edges/
      ConditionalEdge.tsx     → labeled edge for decision logic
  /metrics
    ImpactBarChart.tsx
    ConfidenceGauge.tsx
    StatCounter.tsx
  /input
    WorkflowInputForm.tsx
    FileUploadDropzone.tsx
    DemoExamplePicker.tsx
  /layout
    AppShell.tsx
    SessionSidebar.tsx
  /ui                          → shadcn/ui primitives (button, dialog, tabs, tooltip, toast, slider, badge)

/lib
  api/
    client.ts                 → typed fetch wrapper
    schemas.ts                 → Zod schemas mirroring the backend contract (§8)
    mockData.ts                → canned session payloads for demo mode
  store/
    sessionStore.ts            → Zustand store: current session, pipeline stage, live/demo mode
  hooks/
    useSession.ts               → TanStack Query hook wrapping GET /session/:id + polling
    useWorkflowSocket.ts         → WebSocket hook for live pipeline progress events
```

---

## 8. Frontend ↔ Backend API Contract (proposed — confirm with backend teammate)

This is the contract the frontend is built against. If the backend implements exactly this, no frontend rework is needed; if it can't, the Zod schemas in `lib/api/schemas.ts` are the single place to update.

### 8.1 REST endpoints

```
POST /api/sessions
  body: { inputType: "text" | "file" | "example", content: string, exampleId?: string }
  returns: { sessionId: string }

GET /api/sessions/:sessionId
  returns: SessionResponse (see schema below)

POST /api/sessions/:sessionId/decision
  body: { action: "approve" | "adjust" | "reject", adjustments?: NodeAdjustment[] }
  returns: { status: "ok", auditEntryId: string }

GET /api/sessions/:sessionId/export?format=json|pdf
  returns: file stream or JSON blob
```

### 8.2 WebSocket / streaming events (for live pipeline progress)

```
ws: /api/sessions/:sessionId/stream

event: "stage_started"   payload: { stage: "parse"|"diagnose"|"migrate"|"visualize" }
event: "stage_progress"  payload: { stage: string, message: string, percent?: number }
event: "stage_completed" payload: { stage: string, data: <stage-specific payload> }
event: "error"           payload: { stage: string, message: string }
```

### 8.3 Core data schema (TypeScript / Zod shape)

```ts
type WorkflowNode = {
  id: string;
  type: "step" | "agent" | "humanGate";
  label: string;
  description?: string;
  status?: "healthy" | "inefficient" | "critical"; // for "before" nodes
  confidence?: number; // 0-1, for "after" agent/decision nodes
  position?: { x: number; y: number }; // optional, auto-layout fallback if absent
};

type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string; // e.g. "if confidence < 0.7"
};

type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

type SessionResponse = {
  sessionId: string;
  status: "parsing" | "diagnosing" | "migrating" | "ready" | "approved" | "rejected";
  parsed: { actors: string[]; steps: string[]; dependencies: string[]; painPoints: string[] };
  before: WorkflowGraph;
  after: WorkflowGraph;
  impact: {
    manualEffortBefore: number; // %
    manualEffortAfter: number;
    responseSpeedBefore: number;
    responseSpeedAfter: number;
    overallConfidence: number; // 0-1
  };
  auditTrail: { timestamp: string; event: string }[];
};
```

> **AI-agent note:** implement `lib/api/schemas.ts` with Zod mirroring this exactly, and derive the TypeScript types via `z.infer<>` so the mock data, the real API client, and the components all share one source of truth.

---

## 9. Mock Data / Demo-Safety Strategy (critical for hackathon)

Live demos fail on WiFi, backend cold-starts, or LLM latency spikes — and this pitch deck explicitly plans a fallback ("Keep a 30–45 second screen recording ready"). The frontend should do better than a recording: a **fully functional mock mode** built into the app itself.

- Implement `lib/api/mockData.ts` with 2–3 complete, hand-authored `SessionResponse` payloads (at minimum: "Support Ticket Triage" matching the deck's demo story exactly — before: 90% manual effort / 35% response speed, after: 30% / 85%).
- `/api/mock/sessions/*` Next.js API routes serve these with artificial delay + staged WebSocket-style events (simulated via `setInterval` or a mock event emitter) so the Parse/Diagnose/Migrate stages still animate in believably, even fully offline.
- A single environment flag or in-app toggle (`NEXT_PUBLIC_DEMO_MODE` / Zustand `mode: "live" | "demo"`) switches the data source app-wide without touching component code — all components consume data via `useSession()`, never fetch directly.
- **Recommendation: present with Demo Mode on by default during judging**, with Live Mode available to prove the real pipeline works if a judge asks to see it live.

---

## 10. Non-Functional Requirements

- **Responsiveness:** Desktop-first (judging happens on a laptop/projector), but must not break down to tablet width (React Flow canvases should remain usable at 1024px width minimum).
- **Performance:** Landing page LCP < 2s on Vercel's default edge network; pipeline view should render the first (Parse) stage skeleton within 300ms of navigation regardless of backend latency.
- **Accessibility:** shadcn/ui + Radix primitives give this mostly for free (keyboard nav, focus states, ARIA); ensure node-graph flagged states aren't color-only (icons + text, not just red/amber borders).
- **Error handling:** every stage view has an explicit error state (not just a blank screen) with a "Switch to Demo Mode" recovery action — turns a live-demo failure into a one-click recovery instead of a dead end.
- **Auth (stub only for hackathon):** a lightweight session-token-in-localStorage stub is sufficient; do not build a full auth provider integration unless time remains post-MVP. Structure `lib/api/client.ts` so a real auth header can be added later without touching call sites.
- **Scalability path (post-hackathon):** the `WorkflowGraph` schema and `WorkflowCanvas` component are workflow-type-agnostic by design — adding "HR Onboarding" or "Lead Routing" as new workflow templates requires only new mock/seed data and a new `exampleId`, not new components. This directly supports the deck's stated scaling plan (§7 of the deck: template library, SaaS workflow intelligence layer).

---

## 11. Build Plan (hackathon timeline, hour-by-hour against a 36-hr window)

| Hours | Milestone |
|---|---|
| 0–2 | Scaffold Next.js + Tailwind + shadcn/ui; set up folder structure; define Zod schemas (§8) |
| 2–6 | Build Landing page + Input stage (`/app/new`) with all 3 input modes and demo examples |
| 6–10 | Build `WorkflowCanvas` + `StepNode`/`AgentNode`/`HumanGateNode` components in React Flow; get a static before/after graph rendering from mock data |
| 10–14 | Build Parse/Diagnose/Migrate/Visualize stage views + `PipelineStepper`; wire Zustand session store |
| 14–18 | Build `ImpactBarChart`, `ConfidenceGauge`, `DecisionBar`; wire mock data end-to-end (full click-through demo works, fully mocked) |
| 18–22 | Integrate real backend endpoints via TanStack Query + WebSocket hook; test live mode against teammate's API as soon as available |
| 22–26 | Polish: Framer Motion transitions, node pulse animations, loading skeletons, empty/error states |
| 26–30 | Report/Export page (P1); Dashboard stub (P1) if time allows |
| 30–33 | Cross-browser/demo rehearsal; fix overflow/responsive issues; confirm Demo Mode is bulletproof |
| 33–36 | Deploy to Vercel, final QA pass, prepare backup screen recording anyway |

---

## 12. Success Metrics (tie back to hackathon judging criteria)

| Judging criterion (per deck) | Frontend contribution |
|---|---|
| Innovation & originality | Interactive before/after node-graph migration (not a slide, an artifact) makes the "we migrate, not just recommend" claim tangible. |
| Technical execution & feasibility | Typed API contract, real-time streaming UI, and a working mock-mode all signal engineering maturity, not a mockup. |
| Demo quality | Guaranteed-to-work Demo Mode + staged animations remove all live-demo risk. |
| Impact | Impact metrics panel (90%→30%, 35%→85%) is the single most judge-legible artifact in the whole product. |
| Scalability | Workflow-agnostic schema/components + Dashboard stub show a credible SaaS path without extra build time. |

---

## 13. Open Questions for Backend Teammate

1. Will the real API match the `SessionResponse` schema in §8.3, or does the frontend need an adapter layer?
2. Is progress streamed via WebSocket, Server-Sent Events, or simple polling? (Frontend defaults to WebSocket; polling fallback via TanStack Query `refetchInterval` is trivial to add if not.)
3. Auto-layout: will the backend provide `x/y` positions per node, or should the frontend run an auto-layout algorithm (e.g. `dagre` via `@dagrejs/dagre`, commonly paired with React Flow) on receipt?
4. What's the expected latency for the Diagnose/Migrate stages with Groq inference — does the frontend need to plan for >10s waits (affects whether staged/simulated progress is needed even in live mode)?

---

*End of PRD.*
