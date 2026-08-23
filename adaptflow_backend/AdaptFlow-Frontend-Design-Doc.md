# AdaptFlow — Frontend Design Doc

**Companion document to:** `AdaptFlow-Frontend-PRD.md` (defines screens, components, and data contracts — this document defines the visual and interaction language applied to them)
**Audience:** Frontend engineers and AI coding agents implementing the UI.
**Version:** 1.0

---

## 1. Design Direction

**The subject:** AdaptFlow doesn't advise on workflows — it rewires them, the way an engineer re-routes a circuit. A broken process comes in as a tangle of manual handoffs; what goes out is a clean, routed, agent-driven circuit with clear connection points and a visible "current" flowing through it.

**The direction:** a **diagnostic instrument / circuit-board** aesthetic — not a generic SaaS dashboard. The product reads like a piece of test equipment for workflows: dark PCB-green control surface, copper trace lines connecting components, LED-style status indicators, monospace instrument readouts for data. This is grounded directly in the product's own mechanics (nodes, edges, diagnosis, migration) rather than borrowed from unrelated brand aesthetics.

**What this explicitly avoids:** warm cream + serif + terracotta (generic "AI product" default), near-black + single neon accent with no other grounding, and hairline-rule broadsheet layouts. None of those connect to what AdaptFlow actually does.

**The signature element:** workflow connections are rendered as **copper circuit traces** — right-angled routing (not smooth curves), with a small solder-pad dot at every connection point, and a soft animated current pulse traveling along the "after" (migrated) graph's edges to signal it's live and running. This single motif carries the brand through the landing page, the node-graph canvas, and even small UI details (e.g., a loading indicator is a traveling pulse along a trace, not a spinner).

---

## 2. Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `board-bg` | `#0F1A14` | Primary app background (deep PCB green-black) — used app-wide, not just canvases |
| `board-panel` | `#16241C` | Cards, sidebars, modals, the "raised surface" layer above the board |
| `board-panel-raised` | `#1D3226` | Hover/active state for panels, nested cards |
| `trace-copper` | `#D4A24C` | Primary brand accent — CTAs, active states, brand mark, the signature trace lines |
| `trace-copper-bright` | `#E8BC6A` | Hover state for copper elements, pulse-highlight peak |
| `silver-text` | `#8FA396` | Secondary/muted text, timestamps, captions, inactive labels |
| `text-primary` | `#F1EDE4` | Primary text — warm off-white (reads like silkscreen print on a PCB) |
| `signal-healthy` | `#4ADE80` | Node/status: healthy step, approved state, "after" graph default node color |
| `signal-warning` | `#F5B942` | Node/status: inefficiency flag, pending/adjust state |
| `signal-critical` | `#EF5A5A` | Node/status: critical bottleneck, rejected/error state |
| `signal-human` | `#8AB4F8` | Reserved exclusively for human-in-the-loop gate nodes — never reused for anything else, so "a human is involved here" stays instantly recognizable |

**Rule:** `trace-copper` is the *brand* color and never used for node status. `signal-healthy/warning/critical` are *semantic* status colors and never used decoratively elsewhere. Keeping these vocabularies separate is what makes the node graph legible at a glance.

**Contrast:** `text-primary` on `board-bg` ≈ 13:1. All signal colors on `board-bg`/`board-panel` exceed 4.5:1. Never place `trace-copper` text directly on `board-bg` for body copy (use it for accents/borders/icons/large text only) — at small sizes the contrast is sufficient but the warmth reads better as an accent than as long-form text color.

---

## 3. Typography

| Role | Face | Weight | Size / Line-height | Tracking | Usage |
|---|---|---|---|---|---|
| Display / H1 | **IBM Plex Sans** | 700 | 40–56px / 1.1 | -0.02em | Landing hero, page titles |
| H2 | IBM Plex Sans | 600 | 28px / 1.2 | -0.01em | Section headers, stage titles |
| H3 | IBM Plex Sans | 600 | 20px / 1.3 | normal | Card titles, node labels (large) |
| Body | IBM Plex Sans | 400 | 15–16px / 1.5 | normal | Paragraph copy, descriptions |
| Label / caption | IBM Plex Sans | 500 | 13px / 1.4 | 0.01em | Form labels, badges, legends |
| **Data / instrument readout** | **IBM Plex Mono** | 500 | 14–32px / 1.2 | normal | Confidence scores, impact %, timestamps, audit trail entries, node IDs, exported JSON preview |

**Why IBM Plex:** it was designed as an engineering/technical documentation typeface, which matches AdaptFlow's "diagnostic instrument" personality directly, and the Mono variant gives every metric and readout a legitimate "this is a real instrument panel" feel — the confidence score and impact percentages are the most judge-visible numbers in the whole product, and they should look like an authoritative readout, not a marketing stat.

**Import:** `IBM Plex Sans` (400/500/600/700) and `IBM Plex Mono` (500) via Google Fonts or self-hosted `next/font/google`.

---

## 4. Spacing & Layout Grid

- **Base unit: 4px.** All spacing values are multiples of 4 (4, 8, 12, 16, 24, 32, 48, 64).
- **Card padding:** 24px default, 16px for dense/compact cards (e.g., node detail popovers).
- **Section gaps:** 48px between major page sections, 24px between related components within a section.
- **Background texture:** a faint dot-grid (`board-panel` dots at 4% opacity, 24px spacing) behind the hero section and behind the React Flow canvases — evokes PCB layout grid paper without being a decorative cliché, since it mirrors the literal grid the node graph snaps to.
- **Border radius:** 8px for cards/buttons/inputs, 4px for badges/pills, **0px for node boxes and trace edges** — nodes should look like components on a board, not soft SaaS cards. This is a deliberate contrast: soft UI chrome, hard-edged circuit elements.

---

## 5. The Signature Element — Circuit Trace Connections

This is the one thing the product should be remembered for. Implementation guidance for React Flow:

- **Edges:** custom `ConditionalEdge` component using `smoothstep`/orthogonal routing (right-angle bends, `borderRadius: 2` on the bend for a slight "etched" softness), stroke color `trace-copper` for neutral flow, `signal-healthy` when marking an approved/active path.
- **Solder pads:** a small filled circle (6px radius, `trace-copper-bright`) rendered at every node's connection handle — replaces React Flow's default handle dot.
- **Current pulse:** on the "after" (Migrate/Visualize stage) graph only, animate a brighter dot traveling along each edge on a 3–4s loop (CSS `offset-path` or an SVG `animateMotion` along the edge path) — signals "this flow is live" without needing a caption. Respect `prefers-reduced-motion`: fall back to a static bright edge, no travel animation.
- **Node shells:** sharp-cornered rectangles (0px radius) with a 1.5px border in the node's status color, `board-panel` fill, small colored dot (not the full node tinted) to indicate status — keeps the graph legible even with many nodes on screen.
- **Human gate nodes:** always rendered with a distinct hexagonal shape (not a rectangle) in addition to the `signal-human` color, so the human-in-the-loop moment is recognizable even to a colorblind viewer or in a black-and-white printout of the deck.

---

## 6. Iconography

- **Lucide-react**, stroke width 1.75px (slightly heavier than default 1.5px, to read clearly at small node-label sizes).
- Icons inside nodes/status badges sit inside a small circular "LED" backing (16–20px) in the relevant signal color at 15% opacity, icon at full color — reinforces the instrument-panel indicator-light feel.
- No decorative icons — every icon must map to a real status or action (per PRD's node/status vocabulary), never used purely as visual filler.

---

## 7. Component States

| Component | Default | Hover | Focus | Disabled | Error |
|---|---|---|---|---|---|
| Primary button | `trace-copper` fill, `board-bg` text | `trace-copper-bright` fill | 2px `signal-human` outline, 2px offset | 40% opacity, no pointer | n/a |
| Input field | `board-panel` fill, 1px `silver-text` border | border → `trace-copper` at 50% | border → `trace-copper`, subtle glow (0 0 0 3px copper at 15%) | 40% opacity | border → `signal-critical`, helper text in `signal-critical` |
| Card | `board-panel` | `board-panel-raised` + 4px lift shadow | n/a (unless interactive) | n/a | n/a |
| Node (graph) | status border color, `board-panel` fill | slight scale (1.02) + brighter border | 2px `signal-human` outline (keyboard nav through graph) | 50% opacity, dashed border | n/a |
| Tab / stepper item | `silver-text` text, no underline | `text-primary` | underline in `trace-copper`, 2px | n/a | n/a |

**Focus rings always use `signal-human` blue**, never copper — this keeps keyboard-focus indication visually distinct from brand/hover states across the entire app, which matters for accessibility review.

---

## 8. Motion

| Moment | Duration | Easing | Notes |
|---|---|---|---|
| Page transitions (stage → stage) | 350ms | `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-expo-ish) | Slide + fade, not a full page reload feel |
| Node bottleneck pulse (Diagnose stage) | 1.8s loop | ease-in-out | Border glow intensifies/fades — draws the eye without being frantic |
| Current pulse along edge (Migrate/Visualize) | 3–4s loop | linear | Constant speed reads as "flow," not "alert" |
| Stat counter count-up (Landing, Impact panel) | 900ms | ease-out | Runs once on scroll-into-view, not on every re-render |
| Button/input hover | 120ms | ease-out | Snappy, not floaty |
| Toast in/out | 200ms / 150ms | ease-out / ease-in | |

**Orchestration, not scatter:** the one "big moment" is the Diagnose→Migrate transition — the before-graph should visibly morph/cross-fade into the after-graph layout rather than an abrupt swap, since that transformation *is* the product's core claim. Everything else should be quiet by comparison.

**Always respect `prefers-reduced-motion`:** disable the current-pulse travel and count-up animations, keep instant-but-still-legible state changes.

---

## 9. Voice & Microcopy

- **Active voice, plain verbs.** Buttons say what happens: "Approve & Deploy," not "Submit." A toast confirms in the same words: "Deployed."
- **Instrument-panel tone for data, not marketing tone.** Labels read like a readout: "Confidence: 82%" not "We're pretty confident!"
- **Errors state the fact and the fix, no apology voice:** "Live pipeline unreachable. Switched to Demo Mode." — not "Oops, something went wrong!"
- **Empty states are invitations, not dead ends:** the empty session list on `/app/dashboard` should read "No workflows analyzed yet — start with an example" with the CTA right there, not a lone illustration.

---

## 10. Tailwind Implementation (drop-in)

```js
// tailwind.config.ts (extend block)
colors: {
  board: {
    bg: "#0F1A14",
    panel: "#16241C",
    raised: "#1D3226",
  },
  copper: {
    DEFAULT: "#D4A24C",
    bright: "#E8BC6A",
  },
  silver: "#8FA396",
  ink: "#F1EDE4",
  signal: {
    healthy: "#4ADE80",
    warning: "#F5B942",
    critical: "#EF5A5A",
    human: "#8AB4F8",
  },
},
fontFamily: {
  sans: ["var(--font-plex-sans)", "sans-serif"],
  mono: ["var(--font-plex-mono)", "monospace"],
},
borderRadius: {
  node: "0px",
  card: "8px",
  pill: "4px",
},
```

```ts
// app/layout.tsx — font loading
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-plex-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-plex-mono" });
```

---

## 11. Accessibility Checklist

- [ ] All status meaning is conveyed by icon + shape + color together, never color alone (colorblind-safe by design — see human-gate hexagon rule in §5).
- [ ] Focus rings visible on every interactive element, using `signal-human`, 2px, 2px offset.
- [ ] `prefers-reduced-motion` disables all looping/traveling animations, keeps static equivalents.
- [ ] Minimum 4.5:1 contrast for all body text; verified above for the core palette.
- [ ] React Flow canvas is keyboard-navigable (tab between nodes, enter to open detail panel) — don't ship a mouse-only graph.

---

*End of Design Doc. Pairs with `AdaptFlow-Frontend-PRD.md` §6 (screens) and §7 (components) — apply these tokens directly to the components specified there.*
