# Module: Publish — Calendar, Scheduled, Approvals, Published

> Plan, review/approve, schedule and track social content across channels. _Status: ✅ frontend + ✅ backend (posts pipeline: list/create/approve/request-changes/schedule)._
> Spec ref: §11 · Phase 1

## 1. What it does
The publishing pipeline: see content on a calendar, move it through the approval workflow (internal → client), schedule to channels, and review what's live with its organic performance. The connective tissue between AI Studio (creation) and Analytics (results).

## 2. Where it lives
- **Routes:** `/app/calendar`, `/app/scheduled`, `/app/approvals`, `/app/published`
- **Frontend files:** `src/app/pages/Calendar.jsx`, `Scheduled.jsx`, `Approvals.jsx`, `Published.jsx`; data `src/app/data/sampleData.js` (`postsFor`, `CHANNELS`, `POST_STATUS`).
- **Backend (when built):** blueprint `app/tools/publish/`; tables below; Celery for publish jobs + retries.

## 3. Screens & key UI
- **Calendar:** month grid with post chips (channel dot + title + status colour); view toggle (Month/Week/List); month nav. (Drag-drop reschedule = enhancement.)
- **Scheduled:** filterable list of upcoming/approved posts (channel, status, date, assignee).
- **Approvals:** inbox (grouped by stage) + detail pane — preview, comments, Approve / Request changes, stage + version, audit trail. Workflow: **Idea → Draft → Internal Review → Client Review → Approved → Scheduled → Published**.
- **Published:** list with organic metrics (reach, engagement, likes, comments) + actions (Repurpose, Create ad from post, Add to report).

## 4. Data model
`Post`/`ContentItem` (shared with AI Studio): id, workspace_id, campaign_id?, title, channel, type, date, time, status [idea|draft|internal_review|client_review|approved|scheduled|published|failed], assignee, approval{stage, comments[], versions[]}, metrics{reach,engagement,likes,comments}?, error?.

Backend tables: `scheduled_post` (schedule + channel + status), `approval_request` (item, stage, due), `approval_comment` (author, body, internal|client), `published_post` (external_ref, metrics snapshot), `publish_job` (Celery job + retry state).

## 5. Connections (object graph)
- **AI Studio** content items enter here as drafts; **Campaign** groups them (`campaign_id`).
- Approved → **scheduled_post** → publish job → **published_post**; metrics feed **Organic Analytics** + the campaign funnel (reach/engagement).
- **Published** → "Create ad from post" hands off to **Advertise**; "Repurpose" loops back to AI Studio.
- Calendar/approval badges feed the nav + Overview.

## 6. AI involvement
Publishing agent: best-time recommendations, calendar-gap detection, fill-the-gaps suggestions. Community/Client-reporting agents reference published performance.

## 7. Integrations
SocialPublisher adapter (mock now → Meta/Instagram/Facebook + LinkedIn real in Phase 1 once app review clears). Token health surfaced as failed-publish/expired states.

## 8. States
Empty calendar (no content → create), gap warning, draft, in-review, changes-requested, approved, scheduled, publishing, published, **failed publish** (token expired → reconnect + retry), permission (client sees only their review queue).

## 9. Backend contract (to implement)
- **Tables:** as §4.
- **Endpoints:** `GET /api/publish/calendar?workspace=&month=` · `GET /api/publish/scheduled` · `GET /api/publish/approvals` · `POST /api/publish/:id/approve` · `POST /api/publish/:id/request-changes` (comment) · `POST /api/publish/:id/schedule` (time, channels) · `GET /api/publish/published` (+metrics) · `POST /api/publish/:id/retry`.
- **Jobs:** scheduled publish (Celery beat), retry queue, metric backfill, first-comment scheduling.
- **RBAC:** copywriter create/draft; manager internal-approve; client-approver client-approve; locked after approval.
- **External approval:** signed link for client approval without full account.

## 10. Open questions / TODO
- Drag-drop reschedule with conflict warning.
- Bulk approval + compare-versions.
- Instagram grid preview.
