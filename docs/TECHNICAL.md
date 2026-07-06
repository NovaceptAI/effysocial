# EffySocial — Technical Reference

The single top-to-bottom engineering document. It links out to the per-module
contracts ([docs/modules/](modules/README.md)) and the live endpoint list
([API.md](API.md)) rather than duplicating them.

- **Product spec (requirements):** [../EffySocial_Claude_Design_Prompt.md](../EffySocial_Claude_Design_Prompt.md)
- **Architecture decisions & phasing:** [../IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- **Live status board:** [../BUILD_TRACKER.md](../BUILD_TRACKER.md)

---

## 1. System overview

EffySocial is an AI social-growth & performance-marketing OS: plan → create →
publish → engage → advertise → convert, with the funnel connected end-to-end
(spec §3.1). It is built as **two repos** deployed on one host:

```
┌──────────────────────────┐        ┌─────────────────────────────────────┐
│  effysocial (this repo)  │        │  novalab-engine (shared Flask app)  │
│  React 19 SPA + docs     │  HTTPS │  /api/effy/* blueprint              │
│  served as static dist/  │ ─────▶ │  effy_* tables in novastudy_db (PG) │
│  marketing (/) + app     │  /api  │  Groq AI · OAuth · adapters         │
└──────────────────────────┘        └─────────────────────────────────────┘
        nginx (effysocial.effybiz.in) reverse-proxies /api → 127.0.0.1:5010
```

- **Frontend repo** `github.com/NovaceptAI/effysocial` — the SPA + all docs.
- **Backend** lives in `github.com/NovaceptAI/novalab-engine` (private, shared
  AI engine). EffySocial is a **fully additive** package: `app/tools/effy/*`
  and `effy_*` tables only — no existing engine tables/tools are touched.

### Repo topology (backend package)
`app/tools/effy/` — `routes.py` (blueprint + auth/bootstrap) registers 17 route
groups: `auth·tenancy` (routes.py), `campaigns`, `brand`, `studio`, `publish`,
`engage`, `analytics`, `assistant`, `leads`, `forms`, `ads`, `integrations`,
`landing`, `tracking`, `followups`, `bio`, `publisher`, `strategy`. Plus
`models.py`, `oauth.py`, `tenancy.py`, `email.py`.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite, Tailwind v3 (**preflight disabled** to protect legacy plain-CSS pages), TanStack Query, Recharts, cmdk, lucide-react |
| Design system | "Bright Studio" — coral `#e84a33` + cream, warm-charcoal rail; Fraunces (display) + Manrope (body). Tokens in `tailwind.config.js` + `src/styles/theme.css`; primitives in `src/ui/index.jsx` |
| Backend | Flask + SQLAlchemy 2.0 (`Mapped` style) + Alembic, gunicorn under systemd |
| Database | PostgreSQL `novastudy_db` (shared); pgvector enabled (RAG deferred) |
| AI | Groq `llama-3.3-70b-versatile` (text); Cloudflare FLUX / Pollinations (images, free); `rembg` local (CEO photo) |
| Auth | EffySocial-native accounts, Werkzeug password hashing, Flask signed-cookie session (`effy_uid`) |
| Crypto | `cryptography` Fernet for OAuth token-at-rest (key derived from `SECRET_KEY`) |

---

## 3. Data model (`effy_*`)

All tables are workspace-scoped and prefixed `effy_`. Ownership chain:

```
EffyUser ──┐
           ├─ EffyMembership (user × org × role)
EffyOrg ───┤        org.type ∈ {business, freelancer, agency}
           └─ EffyWorkspace (brand / agency-client)   ← every row below is workspace-scoped
                   │
   ┌───────────────┼───────────────────────────────────────────────┐
   │               │                                                 │
EffyCampaign   EffyPost ─campaign_id→ Campaign        EffyConversation
 (hub §3.1)    EffyReview                              EffyLead ─┬─ campaign_id
   │                                                            ├─ conversation_id
   │  Campaign ← content / forms / landing / leads (counts)     └─ (outcome → offline signal)
   ▼
EffyForm ─→ EffyFormSubmission ─lead_id→ EffyLead
EffyLandingPage (form_slug → published form)     EffyBioPage
EffyFollowupWorkflow ─→ EffyFollowupRun ─lead_id→ EffyLead
EffyTrackingEvent   EffyIntegration (per workspace × provider)
EffyBrandFact / EffyBrandSource (Brand Brain)   EffyToken (verify/reset/oauth state)
```

**Full table list (23):** users, orgs, workspaces, memberships, campaigns,
posts, conversations, reviews, leads, forms, form_submissions, landing_pages,
bio_pages, tracking_events, followup_workflows, followup_runs, integrations,
brand_facts, brand_sources, tokens. Column-level detail lives in
`novalab-engine/app/tools/effy/models.py`; each module's shape is in its
[module doc](modules/README.md) and [API.md](API.md).

**FK discipline:** child→workspace is `ON DELETE CASCADE`; soft links
(campaign_id, conversation_id, lead_id, form.lead_id) are `ON DELETE SET NULL`
so deleting a campaign never orphans/deletes its content.

**The closed loop:** `Post/Ad → Conversation/Form/Landing → Lead → outcome →
offline signal (→ ad platforms, Phase 3)`. This is what makes likes traceable
to revenue (spec §3.2).

---

## 4. Auth, tenancy & RBAC

- **Auth:** `/api/effy/auth/*` — register/login/logout/me, email verification +
  password reset via `EffyToken` (purpose-scoped, single-use, expiring).
  Session is a signed cookie keyed `effy_uid` (separate from the platform's own
  session). See [Auth-Landing.md](modules/Auth-Landing.md).
- **Tenancy helpers** (`tenancy.py`): `resolve_workspace(raw)` → `(ws, err)`,
  `user_org_id`, `workspace_in_org`, `require_write()`, `require_approval_rights()`.
- **The invariant:** every workspace-scoped endpoint must (a) **401** without a
  session and (b) **404** for a workspace in another org — no cross-tenant reads.
  Enforced and regression-tested by the **tenancy matrix** in
  `tests/test_effy_tenancy.py` (every new endpoint is added to it).
- **RBAC roles:** View-only (read-only), Client approver (approval actions only),
  writers (full). `require_write()` blocks the first two on mutations;
  `require_approval_rights()` blocks View-only on approve/reject.

---

## 5. Integrations, adapters & OAuth

The **integration-adapter pattern** (IMPLEMENTATION_PLAN §22): the app calls a
service that returns a **mock** provider (seeded, flagged `provider:"mock"`) or
a **real** one, chosen by the workspace's connection state — so mock→real is a
provider swap, not an app change. First live use: `get_ads_provider(ws)` in
`ads.py`.

- **Connection state** — `effy_integrations` (workspace × provider), states
  `available → pending_credentials → connected/expired/disconnected`. Catalogue
  + `is_connected()` / `connection_token()` in `integrations.py`.
- **OAuth 2.0** (`oauth.py`) — provider-agnostic auth-code flow: single-use CSRF
  `state` (via `EffyToken`, 15-min), token exchange + identity fetch, and
  **Fernet-encrypted tokens at rest** (never serialized to the client).
  Providers are data in `PROVIDERS`; adding Meta/Google is config, not new flow.
  Redirect URI: `https://effysocial.effybiz.in/api/effy/integrations/<provider>/callback`.
- **Instagram publishing** (`publisher.py`) — real Graph API two-step publish
  (media container from a public image URL → publish); dev-mode token connect
  for one owned IG Business account. LinkedIn OAuth + Meta app creds are live.
- Full contract: [Integrations-Framework.md](modules/Integrations-Framework.md).

---

## 6. AI & agent runtime

- **Grounded generation** — Studio, Brand-voice test, Landing copy and the Effy
  assistant call Groq with a live workspace snapshot (campaigns/posts/convos/
  reviews/brand) and are forbidden to invent numbers. AI Studio also consumes
  **trends + competitor angles** (strategy interlink) and returns **computed,
  explainable creative scores** — not opaque "AI scores".
- **8 agents** (Strategy/Content/Creative/Publishing/Community/Performance/
  Analytics/Reporting) — a deterministic keyword router picks one per assistant
  message; replies carry citations + deep-link actions.
- **Recommendations** are rule-based detections shaped per spec §3.3 (detected /
  why / action / impact / confidence / needs-approval). See
  [Effy-AI.md](modules/Effy-AI.md).
- **Playbooks** (the workflow layer) chain modules with context flowing through:
  Content Sprint and Campaign Launch. See
  [Workflows-Intelligence.md](modules/Workflows-Intelligence.md).

---

## 7. Migrations

Alembic, **strictly additive** — every `effy_*` migration creates only its own
tables; drops appear solely in `downgrade()`. Linear chain (root → head):

```
a7c3d9e4f012 → ec89ceaca3ad (tenancy) → b1d2e3f40511 (email/reset tokens)
→ c2e4f60a7233 (campaigns) → d3f5a1b62744 (brand brain)
→ e4a6b2c83855 (posts/conversations/reviews) → f5b7c3d94966 (leads)
→ a6c8d4e05a77 (forms) → b8d2e6f13a99 (landing) → c4f1a7d28b55 (tracking)
→ d7e3b9c46a10 (followups) → e9c5d1a37b20 (lead outcome)
→ f0a4d7c92b18 (link-in-bio) → a1b5c9d07e33 (integrations)  [HEAD]
```

Apply: `cd /srv/novalab-engine && FLASK_APP=wsgi.py myenv/bin/flask db upgrade`.

---

## 8. Deployment & ops

| Thing | Value |
|---|---|
| Host | single AWS Linux box |
| Frontend serve | nginx site `effysocial.effybiz.in` → static root `/srv/effysocial/dist` (SPA fallback to `index.html`) |
| API proxy | nginx `/api/*` → `http://127.0.0.1:5010` (gunicorn) |
| Backend service | `systemctl {restart,status} novalab-engine.service` (gunicorn) |
| Python env | `/srv/novalab-engine/myenv` |
| Database | PostgreSQL `novastudy_db` |
| TLS | Let's Encrypt (`/var/well-known/acme-challenge`) |

**Deploy frontend:** `cd /srv/effysocial && npm run build` (writes `dist/`,
served immediately; Vite hashes assets so no cache-bust needed).
**Deploy backend:** pull + `flask db upgrade` (if new migration) +
`sudo systemctl restart novalab-engine.service`.

### Environment variables (engine `.env`)
| Key | Purpose |
|---|---|
| `SECRET_KEY` | Flask session + Fernet token-encryption key derivation |
| `GROQ_API_KEY`, `GROQ_CHAT_MODEL` | AI generation (default `llama-3.3-70b-versatile`) |
| `EFFY_BASE_URL` | Public base for email + OAuth redirect links |
| `RESEND_API_KEY` **or** `EFFY_SMTP_HOST/PORT/USER/PASS` | Transactional email (dev falls back to logged links) |
| `EFFY_EMAIL_SENDER` | From-address |
| `META_APP_ID` / `META_APP_SECRET` | Meta (Instagram/FB/Ads/WhatsApp) — **live** |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth — **live** |
| `GOOGLE_ADS_CLIENT_ID` / `_SECRET` / `_DEVELOPER_TOKEN` | Google Ads/GA4/GBP — pending |
| `WHATSAPP_WABA_ID` | WhatsApp Cloud API — pending |

Without a provider's creds, `/integrations` reports `pending_credentials` with
exact setup steps — no fake OAuth.

---

## 9. Testing

- **173 tests** (`tests/test_effy_*.py`, 20 files), run:
  `cd /srv/novalab-engine && PYTHONPATH=. myenv/bin/pytest tests/ -q`
  (SQLite override + register/account fixtures in `conftest.py`).
- **Discipline:** every backend slice ships tests — a contract file per module
  **plus** an entry in the tenancy-security matrix (401/404 cross-org). Groq is
  mocked in tests; a small opt-in live smoke tier exists (`test_smoke_external`).

---

## 10. Conventions

- **Docs-first:** a module's [contract](modules/README.md) is authored during
  the frontend build and obeyed during the backend build (prevents drift).
- **Mock-first honesty:** derived/sample data is always flagged
  (`provider:"mock"/"derived"/"sample"`); the UI shows it plainly.
- **Human control:** anything that spends money or publishes publicly is
  approval-gated (spec §3.4).
- **Commit-per-slice:** each shipped slice → tests green → commit + push both
  repos, with the tracker updated.
