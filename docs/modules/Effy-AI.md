# Module: Effy AI — Assistant & Agents

> A persistent assistant that answers from real workspace data, routed through 8 specialist agents, plus explainable recommendations. _Status: ✅ frontend + backend (v1) · spec §16, §3.3 · Phase 1._

## 1. What it does
"Ask Effy" from anywhere: a right-side panel with (a) **chat** — questions routed to the right agent (Strategy/Content/Creative/Publishing/Community/Performance/Analytics/Reporting), grounded ONLY in the workspace's live data (campaigns, posts, conversations, reviews, Brand Brain) with citations and suggested deep-link actions; and (b) **recommendations** — rule-detected issues rendered per §3.3: what was detected, why it matters, recommended action, expected impact, confidence, needs-approval.

## 2. Where it lives
- **Frontend:** `src/app/components/AssistantPanel.jsx` (right drawer; also fulfils part of §5.3's contextual panel), opened from the TopBar ✦ button.
- **Backend:** `app/tools/effy/assistant.py` → `/api/effy/assistant/*`.

## 3. Key design decisions
- **Routing is deterministic** (keyword classifier → agent), so it's testable and free; only the reply text uses Groq.
- **Context = real DB reads**, not memory: campaigns w/ KPIs, post pipeline counts + failures, unread/complaint conversations, pending reviews, Brand Brain tone/approved words. The prompt forbids inventing numbers.
- **Recommendations are rule-based detections** (budget >90% pacing, CPL above target, failed publishes, unread complaints, calendar gaps, unanswered negative reviews) — deterministic, explainable, zero AI spend; each includes route for one-click follow-through.

## 4. Data model
No new tables (reads existing effy_*). Chat is stateless per request (history passed by client). Later: `agent_run` + persisted `recommendation` rows with dismiss/feedback.

## 5. Connections
Reads Campaigns, Publish, Engage, Brand Brain, Analytics. Actions deep-link into every module. Recommendation counts can feed nav badges/Overview alerts later.

## 6. Backend contract
- `POST /api/effy/assistant/chat` 🔒🏢 `{workspace, message, history?[{role,text}]}` → `{reply, agent, citations[], actions[{label,route}]}` · 503 if Groq down.
- `GET /api/effy/assistant/recommendations?workspace=` 🔒🏢 → `{recommendations:[{id, agent, severity, title, detected, why, action, impact, confidence, needsApproval, route}]}`.

## 7. States
Panel closed/open · chat empty (starter prompts) · thinking · Groq-down error · no recommendations ("all clear").

## 8. Tests
Router classification, chat grounding (mocked Groq — context contains real campaign numbers), recommendation rules fire on seeded conditions, tenancy matrix entries.

## 9. TODO
Persisted recommendation dismiss/feedback, apply-with-preview + undo, per-page contextual mode, streaming replies.
