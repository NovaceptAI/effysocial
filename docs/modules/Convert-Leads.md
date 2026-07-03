# Module: Convert — Lead Inbox & Pipeline

> Marketing-generated leads with full source attribution, moving New → Won/Lost. _Status: ✅ frontend + backend (slice 1: pipeline + convert) · spec §14.4–14.5._

## 1. What it does
Every lead — from a WhatsApp click, form, DM or ad — lands here with its source attribution (campaign, channel, conversation) and moves through the pipeline: **New → Contacted → Qualified → Appointment → Proposal → Won/Lost**. Closing the loop: outcomes later feed back to ad platforms (Phase 3) and power CPL/CAC/ROAS.

## 2. Where it lives
- **Route:** `/app/pipeline` (kanban ⇄ table views). Engage's "Convert to lead" creates rows here.
- **Frontend:** `src/app/pages/Pipeline.jsx`; hooks in `src/app/api/hooks.js`.
- **Backend:** `app/tools/effy/leads.py` → `/api/effy/leads*`; table `effy_leads`.

## 3. Data model
`EffyLead`: id, workspace_id, campaign_id?, conversation_id?, name, phone, email, source (whatsapp|form|dm|comment|ad|manual), channel, interest, stage, quality (hot|warm|cold), value (₹), owner, notes[], lost_reason, created_at.

## 4. Connections (object graph)
- **Engage → Convert:** `POST /conversations/:id/convert-lead` copies person/channel/intent context and links `conversation_id`.
- **Campaign:** `campaign_id` attribution → campaign Leads tab + funnel counts (later real rollup).
- **Overview/EngageLeads** read real leads (replacing `ATTENTION_LEADS` mock).
- Phase 2 later: Forms + WhatsApp webhooks create leads; follow-up workflows trigger on stage changes.

## 5. Backend contract
- `GET /api/effy/leads?workspace=` 🔒🏢 → `{leads[]}`
- `POST /api/effy/leads` 🔒🏢 write-role `{workspace, name, phone?, email?, source?, campaignId?, interest?, value?, quality?}`
- `PATCH /api/effy/leads/:id` 🔒🏢 write-role `{stage?, quality?, value?, owner?, lost_reason?}` — stage must be valid
- `POST /api/effy/conversations/:id/convert-lead` 🔒🏢 write-role → `{lead}` (idempotent: returns existing if already converted)

## 6. States
Empty pipeline, stage columns w/ counts, hot/warm/cold flags, won/lost terminal, duplicate-convert guarded.

## 7. Tests
CRUD + stage validation, convert-from-conversation (attribution + idempotency), tenancy matrix, RBAC (view-only blocked).
