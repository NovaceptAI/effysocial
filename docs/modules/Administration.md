# Module: Administration — Integrations, Team, Billing, Settings

> Workspace administration: connections, people/roles, plan and configuration. _Status: ✅ Integrations + Team frontend · 🔌 backend + Billing/Settings pending._
> Spec ref: §17 · Phase 1

**Settings (15 Sep 2026, G44):** `/app/settings` (also *Profile & settings* in the profile menu) — profile name; notification choices and density saved to the account; the organisation's time zone and currency (admins; saved with the onboarding details); two-factor sign-in (turn on with password → QR or setup key → code → recovery codes; turn off with password and code; new recovery codes); and *Send reset link*, which emails the signed-in address. Theme stays per browser.

**Billing and plans (15 Sep 2026, G22):** `/app/billing` shows the plan in force (or the trial and its end date), what it includes and what's locked, usage meters for credits (warning at 80%/100%), workspaces and seats, and a plan comparison. Payment isn't live; platform admins change a plan under Admin → Organisations and plans (choosing Trial starts a fresh 14 days). Pages a plan doesn't include show an upgrade screen instead, with a notice across the app when a trial ends or credits run low.

**Team (15 Sep 2026, G23):** `/app/team` lists real members (owner and *You* marked) and, for owners and admins, pending and expired invites. *Invite member* takes an email and a role (Agency admin or Workspace admin by organisation type, Account manager, Copywriter, Client approver, View-only, each with a one-line description) and shows the join link to copy — the email may not arrive until the sending domain is verified. Admins change roles inline, remove members after a confirm, and resend (new link) or cancel invites. The owner can't be changed or removed. Invitees join at `/join`. Engine `team.py`; tests `test_effy_team.py`, `Team.test.jsx`, `Join.test.jsx`, `e2e-film/team.spec.js`.

## 1. What it does
Manage the operational backbone: which external accounts are connected (and healthy), who's on the team and what they can do, the subscription/usage, and white-label + security settings.

## 2. Where it lives
- **Routes:** `/app/integrations`, `/app/team`, `/app/billing`, `/app/settings`.
- **Frontend files:** `src/app/pages/Integrations.jsx`, `Team.jsx`; data `src/app/data/sampleData.js` (`INTEGRATIONS`, `TEAM`, `ROLES`).
- **Backend (when built):** `app/tools/tenancy/` (members/roles) + `app/tools/integrations/` (OAuth connections + health).

## 3. Screens & key UI
- **Integrations:** grouped by category (Social publishing, Advertising, Analytics, CRM, Messaging, Storage, Commerce, Scheduling, Payments). Each card: connected account, **permission health**, last sync, data available, actions supported, Reconnect / Disconnect / Troubleshoot. States: connected / partial / expired / available.
- **Team:** members table (name, email, role, workspace access, status, last active) + Invite; roles per §17.1; permissions by workspace & feature.
- **Billing / Settings:** plan, seats, usage, AI credits, white-label, audit/security (later).

## 4. Data model
`Integration`: id, workspace_id, provider, category, state, account, scopes, last_sync, data_available[], actions[].
`Membership`: user_id, workspace_id, role, status; `Role` → permission set.

Backend tables: `integration`, `oauth_token`, `membership`, `role`, `invitation`, `audit_log`.

## 5. Connections (object graph)
- Integration state drives every module's mock-vs-real adapter selection and the "disconnected/expired" states across Publish/Engage/Advertise/Analytics.
- Roles gate actions everywhere (RBAC); workspace membership scopes data.
- Token expiry → failed-publish alerts (Publish) + Overview alerts.

## 6. AI involvement
None core. Troubleshoot may use guided diagnostics later (mirrors Conversion Tracking Centre pattern).

## 7. Integrations
This *is* the integrations surface — OAuth connect flows per provider (Meta, Google, LinkedIn, WhatsApp Cloud API, GA4, CRM, Razorpay/Stripe). Mock now.

## 8. States
Connected / partial (some scopes) / expired (reconnect) / available (connect) / unavailable (plan-gated); member active / invited / suspended; permission-restricted.

## 9. Backend contract (to implement)
- **Endpoints:** `GET /api/integrations?workspace=` · `POST /api/integrations/:provider/connect` (OAuth start) · `POST /api/integrations/:id/reconnect|disconnect` · `GET /api/integrations/:id/health`. `GET /api/team` · `POST /api/team/invite` · `PATCH /api/team/:id/role` · `DELETE /api/team/:id`.
- **OAuth callbacks + token refresh jobs**; health checks (scope/expiry).
- **RBAC:** only admin/owner manage integrations, team, billing.

## 10. Open questions / TODO
- Billing (Razorpay/Stripe) + AI credit metering.
- Settings: white-label, 2FA, audit log, density modes.

**Scheduler (16 Sep 2026, launch plan 4.2):** Admin → Scheduler shows whether the minute scheduler is running (a run finished in the last five minutes), when it last ran, and for each job — publishing due posts, finishing processing uploads — its run and failure counts or the last error. On the server: `scripts/effy_phase.sh scheduler` installs or refreshes the systemd timer and prints the same status; `journalctl -u effy-scheduler` has one line per run that did something.
