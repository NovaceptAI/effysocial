# Module: Administration — Integrations, Team, Billing, Settings

> Workspace administration: connections, people/roles, plan and configuration. _Status: ✅ Integrations + Team frontend · 🔌 backend + Billing/Settings pending._
> Spec ref: §17 · Phase 1

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
