# Module: Clients & Workspaces

> Agency-level oversight of all client workspaces. _Status: ✅ create, edit and list with real figures (G21) · ✅ shown when the Clients page is switched on (6.16) · ✅ each client a business or a personal brand with its own plan brief (6.17) · client profile pending._
> Spec ref: §8.1–8.2 · Phase 1

## 1. What it does
Lets an agency add clients, see and switch between every client workspace, and read each one's health, spend, leads, approval backlog and alerts from its own data. Selecting a client sets the active workspace across the whole app. Any profile can create extra workspaces from **Choose a workspace**.

## 2. Where it lives
- **Routes:** `/app/clients` (agency list), `/app/workspaces` (choose or create). Client profile `/app/clients/:id` — pending.
- **Frontend:** `src/app/pages/Clients.jsx`, `WorkspaceSelect.jsx`, the agency rollup in `Overview.jsx`; `components/WorkspaceDialog.jsx` (create/edit), `components/ClientFigures.jsx` (health dot, channel names, last activity); `useClientSummary()` in `api/hooks.js`; selection in `context/WorkspaceContext.jsx`. The top bar's Create → Client workspace opens the same dialog.
- **Backend:** `novalab-engine/app/tools/effy/workspaces.py`; `require_org_admin` in `tenancy.py`.

## 3. Screens & key UI
- Table ⇄ card toggle. Columns: client, manager, channels (count; names on hover), organic and paid health (dot; level and reason as its label), spend, leads in the last 30 days (all-time on hover), approvals, alerts, last activity, edit.
- **+ Add client** / **New workspace**: name (required), industry, location, manager (team members; defaults to you) and, in an Agency & Creators profile, *A business* or *A personal brand*. Owners and admins only — other roles see the button disabled with the reason.
- A new client is listed straight away; a new workspace from Choose a workspace becomes the selected one. The choice survives a reload.

## 4. Data model
`effy_workspaces`: id, org_id, name, industry, location, logo, accent, **manager_user_id** (nullable, `SET NULL`; migration `b4e9c2d7a1f3` backfills the org owner), is_sample, **brand_kind** and **brief** (6.17, migration `e2b7c4d9f1a3`). Names are unique per organisation, case-insensitively; at most 100 workspaces per organisation.

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

## Profiles, workspaces and clients (canon — owner's decisions, 26–27 Sep 2026)
- **A profile is who owns the account** — Business ("We market our own company or shop"), Personal Brand ("I market myself") or Agency & Creators ("I create and run marketing for other brands"; the old `freelancer`). One login can hold several profiles, each with its own plan and billing.
- **A workspace is what is marketed**, marked Business or Personal Brand (`brand_kind`, 6.17). It follows the profile, except in an Agency & Creators profile, where each client is either (chosen in the Add client dialog or the plan brief). An agency's own first workspace is a business.
- **Each workspace has its own plan brief** (goal, offer, customer, budget, capacity, website), so a client's plan never uses the agency's own sign-up answers or website.
- **The Clients page, client wording and Home's all-clients view** show once *Clients page* is switched on in Settings → Roles & client approval (6.16); never for a Personal Brand. Influencers and media managers are members with roles (e.g. Copywriter), not profile types.

## 10. Open questions / TODO
- Client workspace profile screen (§8.2).
- Onboarding link for a new client (Flow A).
- Assigned-clients-only visibility for account managers (launch plan 3.3).
- Ad spend from connected ad accounts once Meta/Google Ads are live (spend is campaign-recorded today).
- Deleting or archiving a workspace.
