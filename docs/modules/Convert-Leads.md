# Module: Convert — Lead Inbox & Pipeline

> Marketing-generated leads with full source attribution, moving New → Won/Lost. _Status: ✅ frontend + backend (slice 1: pipeline + convert · slice 7: lead detail + outcomes) · spec §14.4–14.5, §14.7._

## 1. What it does
Every lead — from a WhatsApp click, form, DM or ad — lands here with its source attribution (campaign, channel, conversation) and moves through the pipeline: **New → Contacted → Qualified → Appointment → Proposal → Won/Lost**. The **lead detail** view aggregates everything known about one lead: attribution (campaign / form submission with UTMs / conversation transcript), possible duplicates, follow-up runs, notes, and **sales outcomes** (§14.7) — marking `qualified`/`purchase_completed`/etc. records a mock offline-conversion signal so ad platforms can optimise for buyers (real Meta/Google uploads in Phase 3).

## 2. Where it lives
- **Route:** `/app/pipeline` (kanban ⇄ table views) → click a lead → `/app/pipeline/:id` detail. Engage's "Convert to lead" creates rows here.
- **Frontend:** `src/app/pages/Pipeline.jsx`, `src/app/pages/LeadDetail.jsx`; hooks in `src/app/api/hooks.js`.
- **Backend:** `app/tools/effy/leads.py` → `/api/effy/leads*`; table `effy_leads`.

## 3. Data model
`EffyLead`: id, workspace_id, campaign_id?, conversation_id?, name, phone, email, source (whatsapp|form|dm|comment|ad|manual), channel, interest, stage, quality (hot|warm|cold), value (₹), owner, notes[], lost_reason, **outcome** (invalid|duplicate|unreachable|qualified|appointment_completed|purchase_completed), created_at.

## 4. Connections (object graph)
- **Engage → Convert:** `POST /conversations/:id/convert-lead` copies person/channel/intent context and links `conversation_id`; detail shows the conversation transcript.
- **Campaign:** `campaign_id` attribution → campaign Leads tab + funnel counts (later real rollup); detail links back to the campaign.
- **Forms:** submission rows link `lead_id` → detail shows form name, submitted data, and UTMs.
- **Follow-ups:** detail lists this lead's `EffyFollowupRun` executions with per-step logs.
- **Tracking:** outcome marking writes a `kind="offline"` `EffyTrackingEvent` (mock offline-conversion signal, Phase 3 sends it to Meta/Google).
- **Overview/EngageLeads** read real leads (replacing `ATTENTION_LEADS` mock).

## 5. Backend contract
- `GET /api/effy/leads?workspace=` 🔒🏢 → `{leads[]}`
- `GET /api/effy/leads/:id` 🔒🏢 → `{lead}` + `attribution` (campaign/form+utm/conversation), `duplicates[]` (same email/phone in workspace), `followupRuns[]`, `offlineSignals[]`, `outcomes[]` (valid values)
- `POST /api/effy/leads` 🔒🏢 write-role `{workspace, name, phone?, email?, source?, campaignId?, interest?, value?, quality?}`
- `PATCH /api/effy/leads/:id` 🔒🏢 write-role `{stage?, quality?, value?, owner?, lostReason?, note?, outcome?}` — stage/outcome must be valid; a **changed** outcome appends a note + records one offline signal (idempotent per value)
- `POST /api/effy/conversations/:id/convert-lead` 🔒🏢 write-role → `{lead}` (idempotent: returns existing if already converted)

## 6. States
Empty pipeline, stage columns w/ counts, hot/warm/cold flags, won/lost terminal, duplicate-convert guarded. Detail: manual lead (no attribution), duplicate warnings, no-runs empty state, outcome marked (positive/negative highlight + signal log).

## 7. Tests
CRUD + stage validation, convert-from-conversation (attribution + idempotency), detail shape, conversation/form+UTM attribution, duplicates by email & phone, follow-up runs in detail, outcome marking (400 gate, note, signal, re-mark idempotency, outcome change), tenancy matrix + detail cross-org 404, RBAC (view-only blocked, detail read ok).
