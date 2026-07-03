# Module: Clients & Workspaces

> Agency-level oversight of all client workspaces. _Status: ✅ frontend (list) · 🔌 backend + client profile pending._
> Spec ref: §8.1–8.2 · Phase 1

## 1. What it does
Lets an agency see and switch between every client workspace, with at-a-glance health, spend, leads, approval backlog and alerts. Selecting a client sets the active workspace across the whole app.

## 2. Where it lives
- **Route:** `/app/clients` (list). Client workspace profile `/app/clients/:id` — pending.
- **Frontend files:** `src/app/pages/Clients.jsx`, workspace switching via `src/app/context/WorkspaceContext.jsx`, data `src/app/data/sampleData.js` (`WORKSPACES`, `ORG`).
- **Backend (when built):** part of tenancy in `app/tools/tenancy/`.

## 3. Screens & key UI
- Table ⇄ card toggle. Columns: client (logo+industry+location), manager, channels, organic/paid health dots, monthly spend (INR), leads, approvals badge, alerts badge, last report.
- Row/card click → `setWorkspaceId` + navigate to `/app`.
- Pending: dedicated client workspace profile (§8.2), "Add client" flow.

## 4. Data model
Workspace (mock → tables): id, org_id, name, industry, location, logo, accent, manager_id, channels[], organic_health, paid_health, monthly_spend, leads (derived), approvals (derived), alerts (derived), last_report.

Backend: `organization`, `workspace`, `membership` (user×workspace×role). Health/spend/leads are **derived** aggregates, not stored raw.

## 5. Connections (object graph)
- `workspace_id` scopes **every** other object in the app (campaigns, content, leads, ads…).
- Manager = a `membership`/`user`. Approvals/alerts/leads counts aggregate from Publish/Engage/Advertise modules.
- Client profile (§8.2) will surface that workspace's campaigns, content history, accounts, team, assets.

## 6. AI involvement
Agency overview agent flags "clients needing attention" (failed publishing, anomalies, overdue approvals) — feeds the list's alert badges.

## 7. Integrations
Channel connection status per workspace comes from the Integrations module (which accounts are connected/expired).

## 8. States
Empty (agency with no clients → add first), per-client health (good/attention/poor), approval/alert backlogs, permission (some members see only assigned clients).

## 9. Backend contract (to implement)
- **Tables:** `organization`, `workspace`, `membership`, `invitation`.
- **Endpoints:** `GET /api/workspaces` (scoped to org + membership) · `GET /api/workspaces/:id` (profile) · `POST /api/workspaces` · `GET /api/workspaces/:id/summary` (health/spend/leads aggregates).
- **RBAC:** agency-owner/admin see all; account-manager sees assigned; client-approver sees own workspace only.
- **Scoping:** middleware injects `workspace_id` filter on all domain queries.


## Org-type model (canon — decided 2026-07-02)
- **Organization = who owns the account.** `business` (one brand marketing itself), `freelancer` (a person running **multiple businesses of their own** — no client semantics), `agency` (a marketing firm serving paying clients).
- **Workspace = a brand being marketed.** For agencies these are clients; for freelancers, their own brands.
- **Membership + role = who works inside.** Influencers/media managers are NOT org types — they're invited members (e.g. Copywriter) whose drafts flow through approvals; RBAC limits them.
- **Agency chrome** (Clients page, agency rollup board, client approvers, white-label) shows only for `agency` orgs. Freelancers/businesses never see it. A neutral "All brands" rollup for any multi-workspace org is a possible later refinement.
- No clash with EffySocial itself: EffySocial is the tool; account owners do the marketing through it. Agencies are a customer segment.

## 10. Open questions / TODO
- Client workspace profile screen (§8.2).
- "Add client" + onboarding link (Flow A).
