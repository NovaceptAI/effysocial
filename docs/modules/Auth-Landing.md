# Module: Marketing Landing, Login & Auth

> The public front door → login → onboarding → gated product. _Status: ✅ landing + real login · ✅ onboarding saved on the organisation, routed by offer, with a real first plan (15 Sep 2026, G20)._
> Spec ref: §6 (onboarding), screens #1–3 · Phase 0

## 1. What it does
`/` markets the EffySocial product and routes visitors to **/login**, which authenticates and drops them into **/app**. Currently a mock client-side session gates the product; real EffySocial-native accounts + onboarding land with the backend.

## 2. Where it lives
- **Routes:** `/` (Landing), `/login` (Login), `/app/*` (gated). Demo tools at `/tools`, `/lipsync`, etc.
- **Frontend files:** `src/marketing/Landing.jsx`, `src/marketing/Login.jsx`, auth `src/app/context/AppAuth.jsx`, guard `RequireAuth` in `src/App.jsx`. Logout in `TopBar`.

## 3. Screens & key UI
- **Landing:** sticky nav (Log in / Get started), fluid-shader hero with the positioning line, mock app preview, connected-journey strip, feature grid, who-it's-for, CTA band, footer.
- **Login:** split screen (brand panel + form), email/password, Google (stub), → `/app`. Demo: any credentials work.
- **Logout:** TopBar profile menu → clears session → `/`.

## 4. Data model
Mock: `localStorage['effy.auth'] = { email, name }` via `AppAuthProvider`.
Backend: `user`, `session`, plus onboarding writes `organization` + first `workspace` + `brand_brain`.

## 5. Connections (object graph)
- Auth establishes the `user` → memberships → workspaces that scope the whole app (see App-Shell, Clients).
- Onboarding (§6) feeds Brand Brain, Integrations, and generates the first Marketing Plan.

## 6. AI involvement
**Onboarding (G20)** — `src/marketing/Onboarding.jsx`, engine `onboarding.py`. Each Continue saves that step's answers and the next step on `effy_orgs.onboarding`, so a reload or a later visit (Home shows *Finish setting up*) resumes there. Steps by offer: *Create content* → organisation, details, offer, Brand Brain, start (AI Studio or Ad Films; no connections, no plan). *Market and grow* / *Both* → organisation, details, offer, goals, connect (real integration states; Connect starts the real OAuth flow and returns to onboarding), Brand Brain (documents and website links), first plan (generated from the answers, Brand Brain and its documents; Finish stays disabled until it exists) → `/app/home` (marketing) or `/app` (both). The plan is stored in `effy_marketing_plans` and shown on Marketing Plan. Only owners and admins set up the organisation. Tests: `tests/test_effy_onboarding.py`, `Onboarding.test.jsx`, `MarketingPlan.test.jsx`, `e2e-film/onboarding.spec.js` (real engine).

## 7. Integrations
Onboarding "connect accounts" step uses the Integrations adapter (OAuth) with connected/partial/expired states.

## 8. States
Logged-out (→ landing/login), logging-in, invalid creds (real auth), gated redirect to `/login`, onboarding incomplete → resume.

## 9. Backend contract (to implement)
- **Endpoints:** `POST /api/auth/register|login|logout`, `GET /api/auth/me`, `GET /api/bootstrap` (user + org + workspaces + role), `POST /api/onboarding/*` (org, goals, connect, brand, invite, plan).
- **Swap:** replace `AppAuth` localStorage with the session cookie; `RequireAuth` checks `/api/auth/me`.
- **RBAC:** role assigned at invite; org-owner on signup.

## Email (transactional)
Provider-agnostic sender `app/tools/effy/email.py` — tries **Resend** (`RESEND_API_KEY`), then **SMTP** (`EFFY_SMTP_HOST` + `EFFY_SMTP_PORT/USER/PASS`), else **dev-log** (logs the link; endpoints return `dev_link`). Set `EFFY_EMAIL_SENDER` and `EFFY_BASE_URL` too. Verification token 48h, reset token 1h, one-time use. Tables: `effy_tokens` + `effy_users.email_verified` (migration `b1d2e3f40511`).

## 10. Open questions / TODO
- Plug a real email provider (set `RESEND_API_KEY` or SMTP env) — currently dev-log only.
- Gate sensitive actions on `email_verified` (currently a soft banner, non-blocking).
- SSO (Google) is still a stub; SSO bridge to existing novacept session optional.
