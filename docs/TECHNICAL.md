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
| Crypto | `cryptography` MultiFernet for OAuth tokens at rest (keys in `EFFY_TOKEN_KEY`) |

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
- **Two-factor sign-in (G44, `twofactor.py`):** authenticator-app codes (RFC 6238, implemented in the engine; the web app draws the QR with `qrcode`). Secrets are encrypted with the token key (and moved by `scripts/rekey_tokens.py`), a code works once, eight hashed recovery codes. A password sign-in with 2FA on leaves a 10-minute pending sign-in in the session; `/auth/2fa/verify` finishes it. Preferences (notifications, density) are per person (`account.py`); compact density sets the root font size inside the app.
- **Plans (G22, `plans.py`):** Creative (free: creation only, 1 workspace, 1 seat, 150 credits), Growth (+ Performance Marketing; 1, 2, 500), Pro (+ ads, landing pages and websites, forms, leads, follow-ups, full analytics; 3, 5, 1,500), Agency (15, 20, 6,000). New organisations get a 14-day Trial with Pro's features and limits and 150 credits (`effy_orgs.trial_ends_at`), then count as Creative. A before-request hook gates API prefixes by feature; workspace and seat limits are checked on create and invite/accept; credits warn at 80%/100% and don't block. The web app mirrors the route split in `src/app/plans.js` (AppShell shows `PlanGate`, the rail marks locked items). Platform admins change plans in Admin until checkout (6.6). Downgrades keep existing data; only new additions are blocked.
- **Team (G23, `team.py`):** owners and admins invite by email with a role; the invite is a single-use 7-day link (`effy_invites`, token stored as a SHA-256 hash) that is emailed and also returned to the inviter to share, since email only reaches the Resend owner until the domain is verified. `/join` creates the account or asks the invited email to sign in (`/login?next=/join?…` — only `/join?` paths are honoured). An account belongs to one organisation; a removed member keeps the account and sees *You're not part of a team*. Roles are read per request, so a change applies at once.
- **RBAC roles:** View-only (read-only), Client approver (approval actions only),
  writers (full). `require_write()` blocks the first two on mutations;
  `require_approval_rights()` blocks View-only on approve/reject.
- **Workspaces:** `require_org_admin(action)` lets Agency owner, Agency admin and
  Workspace admin create and edit workspaces (`workspaces.py`); everyone else gets 403.
  The web app remembers the chosen workspace per user in `localStorage`, resolves it
  during render so the first request after a reload uses it, and keys the page
  outlet by workspace so switching remounts the page (no rows or half-filled forms
  carry over).
- **Abuse limits** (`ratelimit.py`, sliding windows): failed logins per email
  (10 / 15 min) and per IP (50 / 15 min), sign-ups per IP (10 / h), emails per
  address (5 / h) and per IP (20 / h), link attempts per IP (30 / 15 min). Over the
  limit returns 429 with `Retry-After`. The client IP is nginx's `X-Real-IP`,
  trusted only from loopback. Passwords are 8–128 characters.
- **Loading (G45):** every route in `App.jsx` except the landing page, and every page in `AppRoot.jsx`, is `React.lazy`, so `/` loads about 267 KB of JavaScript instead of 1 MB and heavy libraries (charts, LiveKit) load only on their pages. `deploy/content-security-policy.conf` also turns on gzip for CSS, JavaScript, JSON and SVG (nginx.conf only compressed HTML).
- **Rail:** `railMode()` in `nav.js` keeps the Performance Marketing rail when it opens a page both menus share (AI Studio, Ad Films, Media Library, Settings); Home is always the hub. Remembered per tab in `sessionStorage`.
- **Caching:** `deploy/content-security-policy.conf` also sets `Cache-Control`: `no-cache` on the HTML so a deploy is picked up on the next load, a year and `immutable` on hashed `/assets/`.
- **Legal pages:** `/privacy` and `/terms` (`src/marketing/Privacy.jsx`, `Terms.jsx`).
  They show a draft notice and highlighted placeholders while `LEGAL.draft` in
  `src/marketing/legal/meta.js` is true; set it to false only after approval.

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
- **Instagram publishing** (`publisher.py`, launch plan 4.1) — everything published
  is an `EffyPost`: `send` creates Instagram's media container (image, or REELS
  for video) from a public https link — our own media re-signed for a day —
  `_finish` publishes it once the container is FINISHED (images wait a few
  seconds; Reels are followed by `check`), then stores the media id and the real
  permalink. Failures keep Instagram's own message on the post; Graph error 190
  marks the connection expired. `claim` moves approved/scheduled/failed →
  publishing in one UPDATE so a double click or the scheduler can't post twice,
  `check` locks the row, and a lost media_publish answer is resolved by the
  container's PUBLISHED state instead of publishing again. Graph API v25.0.
  Dev-mode token connect for one owned IG Business account. LinkedIn OAuth + Meta
  app creds are live.
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
| Frontend serve | nginx site `effysocial.effybiz.in` → static root `/srv/effysocial/dist`, a symlink to the live release in `.releases/` (SPA fallback to `index.html`) |
| API proxy | nginx `/api/*` → `http://127.0.0.1:5010` (gunicorn) |
| Backend service | `novalab-engine.service` (gunicorn); deploys reload it gracefully with `SIGHUP` |
| Python env | `/srv/novalab-engine/myenv` |
| Database | PostgreSQL `novastudy_db` |
| TLS | Let's Encrypt (`/var/well-known/acme-challenge`) |

**Never edit `/srv/novalab-engine` or `/srv/effysocial` directly** — gunicorn
and nginx serve them, so an edit there is an edit to production. All changes go
through `scripts/effy_phase.sh` in the engine repo:

```
effy_phase.sh start  NAME   # worktrees for both repos on branch phase/NAME under ~/effy-work/NAME
                            # …edit and commit in ~/effy-work/NAME/{engine,web}…
effy_phase.sh check  NAME   # backend tests, frontend tests, build; records the passing commits
effy_phase.sh deploy NAME   # backup → fast-forward main → migrations → frontend release
                            # → graceful engine reload → smoke checks → push
effy_phase.sh finish NAME   # remove worktrees and merged branches
effy_phase.sh rollback      # previous frontend release + engine commit (migrations are not reverted)
effy_phase.sh status
```

Deploy refuses when the commits differ from what passed `check`, when either
production repo has local changes or has drifted from `origin/main`, or when the
phase is not based on the current `main`.

`/srv/effysocial/dist` is a symlink to the live release in
`/srv/effysocial/.releases/` (the newest four are kept); deploy builds a new
release and swaps the link atomically, so nginx never serves a half-written
build. Do not run `npm run build` in `/srv/effysocial` — it would build into the
live release in place. Every deploy first takes a database backup
(`scripts/backup_db.py`) and records it, with both commit ranges, in
`~/effy-work/deploys.log`.

### Environment variables (engine `.env`)
| Key | Purpose |
|---|---|
| `SECRET_KEY` | Flask session signing (shared with novacept-platform). Tokens stored before `EFFY_TOKEN_KEY` can still be read with a key derived from it until rekeyed |
| `EFFY_TOKEN_KEY` | Comma-separated Fernet keys for stored OAuth tokens; the first encrypts, all decrypt. Rotate by prepending a key, then `scripts/rekey_tokens.py check` / `apply`. Keep a copy outside the server — losing it makes stored tokens unreadable |
| `GROQ_API_KEY`, `GROQ_CHAT_MODEL`, `GROQ_CHAT_MODEL_BATCH` | AI generation: realtime voice uses `GROQ_CHAT_MODEL` (`qwen/qwen3.8-27b`), batch work uses `GROQ_CHAT_MODEL_BATCH` (`openai/gpt-oss-120b`) |
| `EFFY_BASE_URL` | Public base for email + OAuth redirect links |
| `RESEND_API_KEY` **or** `EFFY_SMTP_HOST/PORT/USER/PASS` | Transactional email. If sending fails the link is only logged |
| `EFFY_EXPOSE_DEV_LINKS` | **Development only.** `1` returns verification and reset links in API responses when email can't be sent. Never set in production — it would hand out password-reset links |
| `EFFY_RATELIMIT_STORE`, `EFFY_REDIS_URL` | Sign-in rate limits. Default store is Redis at `redis://127.0.0.1:6379/0`, shared by all gunicorn workers; `memory` is per process and meant for tests |
| `EFFY_EMAIL_SENDER` | From-address |
| `META_APP_ID` / `META_APP_SECRET` | Meta (Instagram/FB/Ads/WhatsApp) — **live** |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth — **live** |
| `GOOGLE_ADS_CLIENT_ID` / `_SECRET` / `_DEVELOPER_TOKEN` | Google Ads/GA4/GBP — pending |
| `WHATSAPP_WABA_ID` | WhatsApp Cloud API — pending |

Without a provider's creds, `/integrations` reports `pending_credentials` with
exact setup steps — no fake OAuth.

---

## 9. Testing

`effy_phase.sh check` runs all three layers below; a phase cannot deploy unless
they pass.

**Backend** (`novalab-engine/tests/`, pytest): run
`myenv/bin/python -m pytest -q` from the engine checkout. SQLite override plus
register/account fixtures live in `conftest.py`; providers are stubbed, and a
small opt-in live smoke tier exists (`RUN_SMOKE=1`). Every backend slice ships a
contract file plus an entry in the tenancy matrix (401/404 cross-org).

**Route gate:** `conftest.py` records every API route a test calls. `effy_phase.sh
check` sets `EFFY_ROUTE_GATE=1`, which fails the run and lists any `/api/effy`
route that no test calls, so a new endpoint can't ship untested. Set
`EFFY_ROUTE_COVERAGE=<file>` to write the called routes out. As of 14 Sep 2026
all 214 routes are called.

**Frontend unit and component** (Vitest + React Testing Library, jsdom):
`npm test` (or `npm run test:watch`). Tests sit beside the code as
`*.test.js(x)`. `src/test/mockApi.js` stubs `fetch` for `/api/effy` from a
`"METHOD /path"` table, records calls and lists anything unhandled;
`src/test/render.jsx` renders a page inside the real auth, workspace, query and
router providers. The session fixture mirrors the engine's bootstrap payload.

**End to end** (Playwright, `e2e/`): `npm run test:e2e` builds the app, serves it
with `vite preview` on port 4291 (set `E2E_PORT` to change it) and runs Chromium on desktop, plus a Pixel 7
viewport for `responsive.spec.js`. `/api/effy` is stubbed per test with
`e2e/support/api.js`, so no backend or live data is involved. `@playwright/test`
is pinned to exactly 1.63.0 because that version uses the Chromium build cached
in `~/.cache/ms-playwright`; an upgrade needs `npx playwright install chromium`.

**Real engine** (`e2e-film/`, `npm run test:e2e:film`): the strategy's primary demo
(`demo-film.spec.js`), workspaces and clients (`workspaces.spec.js`) and onboarding
(`onboarding.spec.js`) in Chromium
against the real engine. `playwright.film.config.js` starts
`scripts/e2e_film_server.py` from the engine checkout (the sibling `../engine` in a
phase worktree, else `/srv/novalab-engine`; `EFFY_ENGINE_DIR` overrides) on port
5099 with a throwaway SQLite database and temporary media folder, and serves the
build on 4293 with `/api/effy` proxied to it. Only paid providers are stubbed
(script beats, stills, Veo clips, voice-overs, the audio check, the marketing plan); ffmpeg assembles
and exports for real, and the run downloads the master, 9:16 reel and WhatsApp
exports and checks them with ffprobe. The engine runs under `env -i` without the
production `.env`, so an unstubbed provider fails instead of spending money. It
takes about a minute and runs in `effy_phase.sh check`.

Name tests after the Launch Ledger case they cover (e.g. `CAMP-003`), and check
a new test fails when the behaviour it guards is broken.

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
