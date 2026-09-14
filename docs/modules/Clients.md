# Module: Clients & Workspaces

> Agency-level oversight of all client workspaces. _Status: ✅ create, edit and list with real figures (14 Sep 2026, G21) · client profile pending._
> Spec ref: §8.1–8.2 · Phase 1

## 1. What it does
Lets an agency add clients, see and switch between every client workspace, and read each one's health, spend, leads, approval backlog and alerts from its own data. Selecting a client sets the active workspace across the whole app. Businesses and freelancers create extra workspaces from **Choose a workspace**.

## 2. Where it lives
- **Routes:** `/app/clients` (agency list), `/app/workspaces` (choose or create). Client profile `/app/clients/:id` — pending.
- **Frontend:** `src/app/pages/Clients.jsx`, `WorkspaceSelect.jsx`, the agency rollup in `Overview.jsx`; `components/WorkspaceDialog.jsx` (create/edit), `components/ClientFigures.jsx` (health dot, channel names, last activity); `useClientSummary()` in `api/hooks.js`; selection in `context/WorkspaceContext.jsx`. The top bar's Create → Client workspace opens the same dialog.
- **Backend:** `novalab-engine/app/tools/effy/workspaces.py`; `require_org_admin` in `tenancy.py`.

## 3. Screens & key UI
- Table ⇄ card toggle. Columns: client, manager, channels (count; names on hover), organic and paid health (dot; level and reason as its label), spend, leads in the last 30 days (all-time on hover), approvals, alerts, last activity, edit.
- **+ Add client** / **New workspace**: name (required), industry, location, manager (team members; defaults to you). Owners and admins only — other roles see the button disabled with the reason.
- A new client is listed straight away; a new workspace from Choose a workspace becomes the selected one. The choice survives a reload.

## 4. Data model
`effy_workspaces`: id, org_id, name, industry, location, logo, accent, **manager_user_id** (nullable, `SET NULL`; migration `b4e9c2d7a1f3` backfills the org owner). Names are unique per organisation, case-insensitively; at most 100 workspaces per organisation.

Figures are derived on read by `client_summaries(org_id)`, never stored:

| Figure | Source |
|---|---|
| channels | integrations in state `connected` |
| spend | sum of `spent` on the workspace's campaigns |
| leads / leads30d | leads, all time and created in the last 30 days |
| approvals | posts in `internal_review` or `client_review` |
| alerts | warnings and errors from the notification centre (`assistant._recommendations`) |
| organic | `none` no channel and no posts · `poor` a failed post, or posts with no social channel · `attention` fewer than 4 published (30 days) or queued · `good` otherwise |
| paid | `none` no live campaign · `poor` a live campaign's budget used up, or spending with no leads in 30 days · `attention` over 90% of budget or CPL above ₹400 · `good` otherwise |
| lastActivity | newest post, lead, campaign, media or film |

## 5. Connections (object graph)
- `workspace_id` scopes **every** other object in the app (campaigns, content, leads, ads…).
- Manager = an org member (`effy_memberships`); `/team` returns `userId` for the picker.
- Client profile (§8.2) will surface that workspace's campaigns, content history, accounts, team, assets.

## 6. AI involvement
None on this page. Alerts reuse the rule-based detections behind the notification bell.

## 7. Integrations
Channel counts come from the Integrations module's connection state; expired connections don't count.

## 8. States
New workspace shows grey health dots ("No activity") and zeros; figures show "…" while loading and "—" with a message if they fail to load. Permission: owners and admins manage workspaces.

## 9. Backend contract
- `POST /api/effy/workspaces`, `PATCH /api/effy/workspaces/:id`, `GET /api/effy/workspaces/summary` — see [API.md](../API.md).
- Tests: `tests/test_effy_workspaces.py` (engine); `src/app/pages/Clients.test.jsx`; `e2e-film/workspaces.spec.js` against the real engine (TEN-004, TEN-006, TEN-007, TEN-008).

## Org-type model (canon — decided 2026-07-02)
- **Organization = who owns the account.** `business` (one brand marketing itself), `freelancer` (a person running **multiple businesses of their own** — no client semantics), `agency` (a marketing firm serving paying clients).
- **Workspace = a brand being marketed.** For agencies these are clients; for freelancers, their own brands.
- **Membership + role = who works inside.** Influencers/media managers are NOT org types — they're invited members (e.g. Copywriter) whose drafts flow through approvals; RBAC limits them.
- **Agency chrome** (Clients page, agency rollup board, client approvers, white-label) shows only for `agency` orgs. Freelancers/businesses never see it. A neutral "All brands" rollup for any multi-workspace org is a possible later refinement.
- No clash with EffySocial itself: EffySocial is the tool; account owners do the marketing through it. Agencies are a customer segment.

## 10. Open questions / TODO
- Client workspace profile screen (§8.2).
- Onboarding link for a new client (Flow A).
- Assigned-clients-only visibility for account managers (launch plan 3.3).
- Ad spend from connected ad accounts once Meta/Google Ads are live (spend is campaign-recorded today).
- Deleting or archiving a workspace.
