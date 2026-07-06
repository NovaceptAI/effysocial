# Module: Strategy Intelligence + Workflows (interlink layer)

> Make Trends & Competitors real, feed them into content creation, and chain modules into guided Playbooks. _Status: ✅ Strategy real + Studio interlink + Content Sprint playbook · spec §3.1, §9 · Phase 4._

## 1. Why
Modules were destinations you visit manually. The content-creation side wasn't interlinked: **Trends & Competitors were mock islands, and AI Studio didn't consume them** — so writing a post meant leaving to "go look." This layer makes strategy intelligence real and pipes it *into* Studio, then chains the steps into a **Content Sprint** playbook (the first workflow).

## 2. Slice 1 — Strategy Intelligence (real)
`app/tools/effy/strategy.py`:
- `GET /api/effy/strategy/trends?workspace=` 🔒🏢 → `{provider, trending[], hashtags[], formats[], gaps[], seasonal[]}`.
  - **gaps** are computed from the workspace's *real* `effy_posts` (missing formats/channels/FAQ this month) — genuinely derived, not mock.
  - **seasonal** derived from the current month; **trending** industry+location seeded. Flagged `provider:"derived"` until a real social-listening integration lands.
- `GET /api/effy/strategy/competitors?workspace=` 🔒🏢 → `{provider, competitors[{name,freq,platforms,engagement,sov,topPost,offers,you}]}` (seeded; honest `provider:"sample"`).

## 3. Slice 2 — Studio interlink (fixes the core gap)
- `GET /api/effy/studio/context?workspace=` 🔒🏢 → one call bundling `{brand:{tone,approved,prohibited}, trends:[top], competitorAngles:[…]}` for the **Studio context rail** (live trends + competitor angles + brand facts *beside the composer*).
- `POST /api/effy/studio/generate` gains optional `trend` / `angle` inputs → woven into the grounded Groq prompt (generation now *uses* the selected trend). Cited in the output.
- Studio "Send to approval" → creates a real `effy_post` (status `internal_review`), carrying `campaignId` if set — closes Studio→Publish.

## 4. Slice 3 — Content Sprint Playbook (first workflow)
`/app/playbooks` → a guided, context-carrying chain: **Trends/Competitors → pick angle → Studio (grounded in brand + angle) → Calendar → Approval**. A "working context" (`{campaign?, trend, angle, brand}`) travels across steps. Backend: `POST /api/effy/playbooks/content-sprint/suggest` returns 3–5 angle cards (trend×brand); each "Create" hands the angle to Studio.

## 5. Workflows — the two kinds (roadmap)
- **A. Automation** (background) — generalize the existing Follow-ups trigger→condition→delay→action engine beyond leads (e.g. "post >X engagement → draft ad").
- **B. Playbooks** (guided, human-in-loop) — Content Sprint (this), then Campaign Launch, Winning-post→Ad, Competitor Response, Trend-jack.

## 6. Tests
Trends gaps reflect real posts; competitors shape; studio/context bundle; generate honours `trend` (appears in citations); Send-to-approval creates a review post; tenancy matrix for the 3 new GETs.
