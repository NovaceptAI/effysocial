# Module: Convert — Follow-up Automation

> Visual workflow builder: trigger + condition/delay/action blocks that run automatically on lead events. _Status: ✅ frontend + backend (Phase 2 slice 6) · spec §14.6._

## 1. What it does
Automates the first response to every lead. A workflow = one **trigger** (lead created — optionally filtered by source — or pipeline stage changed to a given stage) followed by up to 10 **blocks**: conditions (continue only if a lead field matches), delays, and actions (WhatsApp/Email/SMS/AI-voice message, assign salesperson, follow-up reminder, appointment link, retargeting/nurture/reactivation). Active workflows fire synchronously whenever a matching lead event happens; every run is logged per lead.

## 2. Where it lives
- **App route:** `/app/followups` — workflow list (trigger, blocks, run count, activate/pause toggle, runs drawer) + block editor with dry-run preview.
- **Backend:** `app/tools/effy/followups.py` → `/api/effy/followups*`; tables `effy_followup_workflows` + `effy_followup_runs`.

## 3. Data model
- `EffyFollowupWorkflow`: id, workspace_id, name, status (draft|active|paused), trigger JSON `{type: lead_created|stage_changed, source?, stage?}`, steps JSON `[{kind: condition|delay|action, …}]`, runs counter, created_at.
- `EffyFollowupRun`: id, workflow_id, workspace_id, lead_id (SET NULL on lead delete), log JSON `[{step, text}]`, created_at.

## 4. Execution model (Phase 2)
- **Hooks:** `trigger_followups(lead, event, stage=None)` is called inside the lead transaction from `leads.py` (create, convert-from-conversation, stage change on PATCH — only on an actual transition) and `forms.py` (public submit). Caller flushes the lead first and commits after.
- **Blocks:** conditions compare a lead field (source|quality|stage|channel) case-insensitively and stop the run on mismatch; delays execute instantly and are logged as "instant in Phase 2" (scheduled delays arrive with the jobs runner in Phase 3); message actions go through `get_messaging_provider(ws)` → `MockMessagingProvider` (logs the send honestly as mock — nothing leaves the app until real WhatsApp/Email/SMS providers land in Phase 3).
- **Side effects on the lead:** message/reminder/appointment actions append a `[workflow name] …` note; assign_salesperson sets `lead.owner`. Retargeting/nurture/reactivation only log (Phase 3 surfaces).
- `{name}` in messages is replaced with the lead's name.

## 5. Backend contract
Authed (🔒🏢): `GET /followups?workspace=` → `{workflows[]}` · `GET /followups/:id/runs` → last 20 runs with lead name + log · `POST /followups/:id/dry-run {lead?}` → `{log[]}` (sample lead, **no side effects**, works on drafts).
Write-role: `POST /followups {workspace, name, trigger?, steps?}` (status starts draft) · `PATCH /followups/:id {name?, status?, trigger?, steps?}` — trigger/steps are validated + cleaned (400 on unknown types/fields/units; steps capped at 10).

## 6. Connections
- Fires from **Forms** public submissions, **Pipeline** lead creation/stage changes, and **Engage** convert-to-lead — all funnel through the same hook.
- Runs append notes visible in the **Lead pipeline** drawer.
- Phase 3: real messaging providers behind `get_messaging_provider`, scheduled delays via jobs runner, retargeting audiences to ad platforms.

## 7. Tests
`test_effy_followups.py`: CRUD defaults + validation gates, active workflow fires on lead create (notes, owner, run log order), drafts don't fire, condition stops runs, trigger source filter, stage-change trigger (incl. no re-fire on same stage), form submission fires workflow, dry-run has no side effects; tenancy + RBAC matrices extended.
