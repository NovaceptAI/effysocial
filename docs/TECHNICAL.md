# EffySocial — Technical Reference

The single top-to-bottom engineering document, current as of **27 Sep 2026**
(engine `phase/6`, migration head `e2b7c4d9f1a3`). It links out to the per-module
contracts ([docs/modules/](modules/README.md)) and the endpoint list
([API.md](API.md)) rather than duplicating them. Update it in the same commit as
any change it describes.

- **Product spec (requirements):** [../EffySocial_Claude_Design_Prompt.md](../EffySocial_Claude_Design_Prompt.md)
- **What is built, what remains, the plan and the test cases:** the Launch Ledger
  (https://claude.ai/code/artifact/3e5a7afb-c80e-4a7b-874a-ae03a085111e). The older
  status files ([../BUILD_TRACKER.md](../BUILD_TRACKER.md), [../HANDOFF.md](../HANDOFF.md),
  [READINESS.md](READINESS.md)) predate it and are not kept current.

---

## 1. System overview

EffySocial is an AI content-creation and performance-marketing platform: create
(AI Studio, Ad Films, Product Shots, avatars) → plan → publish → engage →
advertise → convert, with the funnel connected end to end (spec §3.1). It is built
as **two repos** deployed on one host:

```
┌──────────────────────────┐        ┌─────────────────────────────────────┐
│  effysocial (this repo)  │        │  novalab-engine (shared Flask app)  │
│  React 19 SPA + docs     │  HTTPS │  /api/effy/* blueprint              │
│  served as static dist/  │ ─────▶ │  effy_* tables in novastudy_db (PG) │
│  marketing (/) + app     │  /api  │  AI providers · OAuth · scheduler   │
└──────────────────────────┘        └─────────────────────────────────────┘
   nginx (effysocial.effybiz.in): /api → 127.0.0.1:5010 (gunicorn);
   /api/effy/media/* served from disk with signed, expiring links (§5)
```

- **Frontend repo** `github.com/NovaceptAI/effysocial` — the SPA and all docs.
  Routes: marketing site `/`, `/login`, `/onboarding`, `/join`, `/privacy`, `/terms`;
  the app under `/app/*`; public pages `/f/:slug` (form), `/p/:slug` (landing page),
  `/b/:slug` (link-in-bio), `/s/:slug` (website), `/r/:slug` (review request),
  `/report/:token` (shared report).
- **Backend** lives in `github.com/NovaceptAI/novalab-engine` (private, shared AI
  engine). EffySocial is additive: `app/tools/effy/*` and `effy_*` tables, plus two
  shared helpers it calls (`app/tools/social/social_agent.py` for Groq JSON,
  `social_images.py` for Studio images) and `app/tools/avatar/lipsync_service.py`.

### Backend package (`app/tools/effy/`)
`routes.py` creates the `effy` blueprint, the auth and bootstrap routes, and
registers every module's routes. By area:

| Area | Modules |
|---|---|
| Accounts & platform | `auth` (session, active profile) · `tenancy` · `profiles` (profiles, work email, Roles & client approval) · `team` · `onboarding` (onboarding + marketing plan) · `brief` (plan brief, brand kind) · `plans` · `account` · `twofactor` · `ratelimit` · `email` · `interest` · `settings` · `aiusage` (credits, admin) · `scheduler` · `media_links` · `sample` · `cleanup` |
| Creation | `studio` · `filmlab` + `film_basis` (Ad Films) · `productlab` (Product Shots) · `avatarlab` (Personalized Avatar Video, Gemini image helpers) · `characters` · `audio` (ElevenLabs, music beds, fitting lines) · `veo` · `refusals` · `acceptance` · `medialib` · `brand` + `webread` (Brand Brain) · `sites` · `landing` |
| Marketing | `workspaces` · `campaigns` · `publish` · `publisher` · `insights` · `engage` · `strategy` · `ideas` · `analytics` · `reports` · `ads` · `leads` · `forms` · `bio` · `tracking` · `conversions` · `followups` · `workflows` · `assistant` · `integrations` + `oauth` · `gbp` |

`models.py` holds all tables. 268 routes are registered under `/api/effy`.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite 7, Tailwind v3 (**preflight disabled** to protect legacy plain-CSS pages), TanStack Query, Recharts, cmdk, lucide-react, jsPDF (report PDFs), qrcode (two-factor setup) |
| Design system | "Bright Studio" — coral `#e84a33` + cream, warm-charcoal rail; Fraunces (display) + Manrope (body). Tokens in `tailwind.config.js` + `src/styles/theme.css`; primitives in `src/ui/index.jsx` |
| Backend | Flask + SQLAlchemy 2.0 (`Mapped` style) + Alembic; gunicorn (2 workers, 300 s timeout) under systemd; Redis for rate limits and the scheduler lock |
| Database | PostgreSQL `novastudy_db` (shared with the engine's other tools); pgvector enabled (RAG deferred) |
| Text AI | Groq through `social_agent._groq_json`: `GROQ_CHAT_MODEL` (`qwen/qwen3.8-27b`) for realtime voice, `GROQ_CHAT_MODEL_BATCH` (`openai/gpt-oss-120b`) for everything else. The batch model reasons before it answers, so each call gets a 2,000-token reasoning allowance on top of its budget and one retry on `json_validate_failed` |
| Images | Google Nano Banana 2 (`gemini-3.1-flash-image`, Gemini API) for AI Studio images, Ad Films stills, Product Shot stills and avatars; Cloudflare FLUX is the Studio fallback. Vision checks use `gemini-flash-latest`. Studio images are saved as JPEG (Instagram needs it) |
| Video | Veo 3.1 Fast (`veo-3.1-fast-generate-preview`) for Studio clips, film scenes, Product Shots and characters; ffmpeg for Ken Burns fallbacks, assembly, exports and audio fitting |
| Voice | ElevenLabs (`eleven_v3`). The account is on the free plan, so only built-in voices are used; `ELEVENLABS_LIBRARY_VOICES=true` brings back the Indian library narrators after an upgrade |
| Lip-sync | Sync Labs (`SYNC_LABS_API_KEY`) for AI Avatar Video, characters and the agent outro |
| Auth | EffySocial-native accounts, Werkzeug password hashing, Flask signed-cookie session (`effy_uid`, active profile `effy_org`) |
| Crypto | `cryptography` MultiFernet for OAuth tokens and two-factor secrets at rest (keys in `EFFY_TOKEN_KEY`) |
| Media | Files in `app/tools/effy/_media/`, synced nightly to S3 (`scripts/backup_media.py`); served by nginx with `secure_link` signatures |

---

## 3. Data model (`effy_*`)

43 tables, all prefixed `effy_`. Everything a customer makes is scoped to a
workspace; a workspace belongs to an organisation (a **profile**); people reach
organisations through memberships.

```
EffyUser ──< EffyMembership (role) >── EffyOrg  = a profile: type business | personal_brand | agency,
   │                                     │        plan + trial, settings (Roles & client approval),
   │ preferences.profile (last used)     │        work_email (Business), onboarding answers
   │                                     └──< EffyWorkspace (brand_kind business | personal_brand, plan brief)
   │                                                 │  every row below is workspace-scoped
   │     ┌───────────────┬──────────────────┬────────┴───────────┬──────────────────┐
   │  Campaign ◀─ Post   Conversation        Lead ◀─ Form/Submission   ClientFilm ─< FilmScene
   │  MarketingPlan      Review, ReviewLink  Landing, Site, Bio    ProductShot ─< ProductFrame
   │  Idea, Competitor   ReportShare         FollowupWorkflow ─< Run  DealerAvatar, AvatarMaster
   │  Workflow           TrackingEvent       Integration (per provider) Character, Media
   └─ Invite, Token, Interest                BrandFact, BrandSource    JobEvent, Acceptance, AIUsage
```

**Full table list:** users, orgs, workspaces, memberships, invites, interest,
campaigns, posts, conversations, review_links, report_shares, reviews, leads,
forms, form_submissions, landing_pages, sites, bio_pages, tracking_events,
followup_workflows, followup_runs, integrations, brand_facts, brand_sources,
ideas, media, workflows, ai_usage, competitors, dealer_avatars, avatar_masters,
client_films, film_scenes, film_signoffs, characters, product_shots,
product_frames, job_events, acceptance, marketing_plans, scheduler_jobs,
settings, tokens. Columns live in `novalab-engine/app/tools/effy/models.py`;
each module's shape is in its [module doc](modules/README.md) and [API.md](API.md).

**FK discipline:** child→workspace and workspace→organisation are `ON DELETE
CASCADE`; soft links (campaign_id, conversation_id, lead_id, manager_user_id,
owner_user_id) are `ON DELETE SET NULL`, so deleting a campaign never deletes its
content.

**The closed loop:** `Post/Ad → Conversation/Form/Landing → Lead → outcome →
conversion event` (Meta CAPI / Google offline conversion, built and stored ready;
sending waits on provider access, plan 6.12). This is what makes likes traceable
to revenue (spec §3.2).

---

## 4. Accounts, profiles, tenancy & roles

- **Auth:** `/api/effy/auth/*` — register/login/logout/me, email verification and
  password reset through `EffyToken` (purpose-scoped, single-use, expiring). The
  session is a signed cookie keyed `effy_uid`, separate from the platform's own.
  See [Auth-Landing.md](modules/Auth-Landing.md).
- **Profiles (6.14, `profiles.py`):** an organisation is one of three profiles —
  **Business** ("We market our own company or shop"), **Personal Brand** ("I market
  myself — my expertise, practice or profile") and **Agency & Creators** ("I create
  and run marketing for other brands"; the old `freelancer` type). A Business proves
  a **work email** at its own domain (free-mail providers refused) with a six-digit
  code — salted SHA-256 hash in `onboarding.workEmailCode`, 30 minutes, 5 tries, the
  row locked while a code is checked, 5 codes per organisation per hour; the owner's
  own verified company login needs no code. Until then it works, with a banner.
  A Personal Brand never has clients or client approval.
- **Several profiles on one login (6.15):** each profile is its own organisation —
  plan, credits, team and billing. `tenancy.current_membership` picks the profile a
  request works in: the one this session switched to (`session["effy_org"]`), else
  the one used last (`user.preferences.profile`), else the oldest; a choice that is
  no longer a membership is passed over. It is cached in `flask.g` per request, and
  `auth.set_active_org` clears the cache. Each device keeps its own profile.
  `POST /profiles` (Add account type) creates a profile, opens it and starts its
  onboarding at the details step; **only a login's first own profile gets the
  14-day trial** — later ones start on Creative, whose onboarding is creation-only.
  `POST /profiles/:id/switch` changes profile. The bootstrap lists every profile for
  the top-bar switcher; the web app gives each profile its own query cache (the
  `QueryClient` is keyed by organisation id) and remembers the chosen workspace per
  profile (`localStorage effy.workspace = {user, byOrg}`).
- **The tenancy invariant:** every workspace-scoped endpoint must **401** without a
  session and **404** for a workspace outside the active profile — no cross-tenant
  reads. `resolve_workspace(raw)`, `owned_workspace_entity(model, id)` and
  `workspace_in_org` enforce it; `tests/test_effy_tenancy.py` and
  `test_effy_isolation.py` regression-test it.
- **Team (G23, `team.py`):** owners and admins invite by email with a role; the
  invite is a single-use 7-day link (`effy_invites`, token stored hashed), emailed
  and returned to the inviter, since email only reaches the Resend owner until the
  domain is verified. `/join` creates the account or asks the invited email to sign
  in. **Someone who already uses EffySocial can be invited: joining adds that
  organisation to their profiles** and opens it. A removed member keeps their other
  profiles; with none left they see *You're not part of a team* and can create one.
- **Roles:** Agency owner / Agency admin / Workspace admin (manage the organisation:
  `require_org_admin`), Account manager and Copywriter (write), Client approver
  (approval actions only, and only at the client-review stage), View-only.
  `require_write()` blocks the last two on writes; `require_approval_rights()` blocks
  View-only on approvals. Roles are read per request, so a change applies at once.
- **Settings → Roles & client approval (6.16):** four switches on a Business or
  Agency & Creators profile (`effy_orgs.settings`), each off until an owner or admin
  turns it on: the **Clients page** (and client wording, Home's all-clients view),
  the **Client approver** role (brings the client-review stage with it; can't be
  turned off while someone holds or is invited to it), the **client-review stage**
  (without it, internal review approves straight to approved) and **Require approval
  before publishing** (a new post starts before review, AI Studio can't publish
  straight to Instagram, and changing an approved or scheduled post's caption,
  media, channel or format sends it back to review). A Personal Brand has none.
- **Plans (G22, `plans.py`):** Creative (free: creation only, 1 workspace, 1 seat,
  150 credits), Growth (+ Performance Marketing; 1, 2, 500), Pro (+ ads, landing
  pages and websites, forms, leads, follow-ups, full analytics; 3, 5, 1,500), Agency
  (15, 20, 6,000). A login's first own profile gets a 14-day Trial with Pro's
  features and limits and 150 credits, then counts as Creative. A before-request
  hook gates API prefixes by feature; workspace and seat limits are checked on
  create and invite/accept; credits warn at 80%/100% and don't block. The web app
  mirrors the route split in `src/app/plans.js`. Platform admins change plans in
  Admin until checkout (6.6).
- **Two-factor sign-in (G44, `twofactor.py`):** authenticator-app codes (RFC 6238),
  secrets encrypted with the token key, a code works once, eight hashed recovery
  codes. A password sign-in with 2FA on leaves a 10-minute pending sign-in;
  `/auth/2fa/verify` finishes it. Preferences (notifications, density, last-used
  profile) are per person (`account.py`).
- **Workspaces:** owners and admins create and edit them (`workspaces.py`); the web
  app resolves the chosen workspace during render and keys the page outlet by
  workspace, so switching remounts the page.
- **Abuse limits** (`ratelimit.py`, sliding windows in Redis): failed logins per
  email (10 / 15 min) and per IP (50 / 15 min), sign-ups per IP (10 / h), emails per
  address (5 / h) and per IP (20 / h), link attempts per IP (30 / 15 min), invites
  per organisation (50 / day), new profiles per login (10 / day), plan generations
  per workspace (10 / h). Over the limit returns 429 with `Retry-After`. The client
  IP is nginx's `X-Real-IP`, trusted only from loopback. Passwords are 8–128
  characters.
- **Emails** never carry markup from what people typed: names and organisation
  names are HTML-escaped in the verify, reset, invite, work-email and follow-up
  emails.
- **Loading (G45):** every route in `App.jsx` except the landing page, and every
  page in `AppRoot.jsx`, is `React.lazy`. `deploy/content-security-policy.conf` also
  turns on gzip for CSS, JavaScript, JSON and SVG, and sets `Cache-Control`
  (`no-cache` HTML, a year and `immutable` on hashed `/assets/`).
- **Rail:** `railMode()` in `nav.js` keeps the Performance Marketing rail when it
  opens a page both menus share; Home is always the hub.
- **Legal pages:** `/privacy` and `/terms` (`src/marketing/Privacy.jsx`, `Terms.jsx`)
  show a draft notice and highlighted placeholders while `LEGAL.draft` in
  `src/marketing/legal/meta.js` is true; set it false only after the owner and
  client approve the wording.

---

## 5. Integrations, publishing & scheduler

The **integration-adapter pattern** (IMPLEMENTATION_PLAN §22): the app calls a
service that returns a mock, sandbox or real provider chosen by the workspace's
connection state, so mock→real is a provider swap, not an app change
(`get_ads_provider(ws)` in `ads.py`; `conversions.destinations()` for conversion
events).

- **Connection state** — `effy_integrations` (workspace × provider), states
  `available → pending_credentials → connected / expired / disconnected`, catalogue
  in `integrations.py`. Without a provider's credentials `/integrations` reports
  `pending_credentials` with setup steps — no fake OAuth.
- **OAuth 2.0** (`oauth.py`) — provider-agnostic auth-code flow: single-use CSRF
  `state` naming its workspace and an allow-listed return path, token exchange and
  identity fetch, Fernet-encrypted tokens at rest (never sent to the client).
  Redirect URI: `https://effysocial.effybiz.in/api/effy/integrations/<provider>/callback`.
- **Meta** (4.4) — sign-in for Instagram and Facebook Pages gives the Page token
  publishing needs and when Meta's access ends (`data_access_expires_at`, about 90
  days), kept beside the encrypted token; the app warns before, then shows the
  connection expired. Other people's accounts need App Review (6.7).
- **Instagram publishing** (`publisher.py`, 4.1) — everything published is an
  `EffyPost`. `send` creates the media container (image, or REELS for video) from a
  public https link — our media re-signed for a day — and `_finish` publishes it once
  FINISHED, storing the media id and permalink. Failures keep Instagram's message
  on the post; Graph error 190 marks the connection expired. `claim` moves
  approved/scheduled/failed → publishing in one UPDATE so nothing posts twice.
  Graph API v25.0 for publishing and insights.
- **Media links** (`media_links.py`, 2.7) — `/api/effy/media/*` is served by nginx
  with `secure_link` (md5, expiry). App links last 24 hours and are re-issued with
  each response, share links 7 days (`POST /media/share`). `EFFY_MEDIA_SIGNING_KEY`
  must equal the key in `/etc/nginx/snippets/effysocial-media-secret.conf`; rotate
  both together, then restart the engine and reload nginx.
- **Minute scheduler** (`scheduler.py`, `scripts/effy_scheduler.py`, 4.2) — a
  systemd timer (`deploy/systemd/effy-scheduler.{timer,service}`, installed and
  refreshed by `effy_phase.sh deploy`, paused while code and migrations change)
  starts one run a minute. A run takes a Redis lock (`effy:scheduler`) or, while
  Redis is down, a Postgres advisory lock, then runs each `@job` with a 40-second
  budget for starting new work; each run is recorded in `effy_scheduler_jobs`
  (Admin → Scheduler, with Run now). Jobs: `publish-due-posts`,
  `follow-publishing-posts`, `resume-followups` (every minute), `check-ad-rules`
  (every 30 minutes; alerts only, never pauses a campaign) and `check-connections`
  (hourly; asks Meta about each connection every 12 hours).
- Full contract: [Integrations-Framework.md](modules/Integrations-Framework.md).

---

## 6. AI & creation runtime

- **Grounded generation** — Studio copy, the Brand voice test, landing copy, plans
  and the Effy assistant call Groq with a live workspace snapshot and Brand Brain
  (including extracted text from uploaded documents and websites read by
  `webread.py`, public addresses only), and are told never to invent numbers,
  results or testimonials. AI Studio also uses trends and competitor angles, each
  labelled with its source and date, and returns computed, explainable creative
  scores.
- **Images** (`social_images.generate_image`) — Nano Banana 2 first (the Admin image
  engine can put Cloudflare FLUX first; the stored value `imagen` means Google), the
  other as the only fallback; no image rather than one from an unvetted provider.
- **Ad Films** (`filmlab.py`) — seven server-gated stages: direction, script,
  stills, animate (Veo image-to-video), voice (ElevenLabs; lines that overrun their
  beat are sped up to 1.15× or rewritten with *Shorten to fit*), assemble and
  deliver (16:9, 9:16, WhatsApp). Every clip and voice-over stores a fingerprint of
  what it was made from (`film_basis.py`), so a changed still or line marks the
  clip and master out of date. Sign-offs, revision allowance and acceptance records
  are kept (`effy_film_signoffs`, `acceptance.py`); per-film budgets return 402.
- **Refusals** (`refusals.py`) explain Veo and Sync Labs quota, rate-limit and
  safety refusals, and `refund_usage()` refunds a failed render's credits once.
- **Credits** (`aiusage.py`) are counted per organisation per month; per-kind
  monthly caps come from `EFFY_LIMIT_*`.
- **Plan brief** (`brief.py`, 6.17) — every workspace is marked Business or Personal
  Brand (it follows the profile, except in an Agency & Creators profile, where each
  client is either) and has its own brief: one goal (leads, sales, bookings, calls,
  WhatsApp chats, followers, reach or engagement, with a monthly target), what's
  offered, who it's for, the monthly ad budget, the posts a week the team can make,
  and the website. Onboarding fills the first workspace's brief while it's under way.
- **Marketing plan** (`sostac.py`, 6.18; routes in `onboarding.py`) — a four-week plan
  on SOSTAC, written per workspace from its brief (never the organisation's sign-up
  answers), Brand Brain and connected channels; needs at least the goal (400
  `brief_needed`) and reads the brief's website into that workspace's Brand Brain.
  *Situation*: numbers the engine counts itself — Instagram followers, reach and
  interactions, posts published, leads, WhatsApp leads, purchases and appointments
  marked on leads, recorded spend, connected channels, Brand Brain, competitors — each
  with its source and date, or why it can't be measured; the model only reads them
  (and writes a SWOT). *Objective*: the brief's one goal from today's baseline to the
  brief's target (or the model's suggestion, marked, or a fifth above the baseline).
  *Strategy*: audience, positioning, 3–5 pillars adding to 100%, the funnel.
  *Tactics*: channels cut to the team's capacity, 12 ideas, a budget split that adds
  up exactly to the brief's budget (none when it's 0 or blank), up to 3 campaigns.
  *Action*: four weeks of tasks. *Control*: KPIs and each week's planned posts and
  goal; `progress()` counts the actuals whenever the plan is read. *Accept plan*
  creates the campaigns as drafts, once. The older top-level fields (pillars,
  channels, ideas, kpis, funnel, firstWeek) stay, so Fill gaps and campaign
  workspaces read the plan as before; plans written before 6.18 still display.
- **Effy assistant** — 8 agents behind a keyword router; replies carry citations
  and deep-link actions; recommendations are rule-based detections (spec §3.3).
  See [Effy-AI.md](modules/Effy-AI.md).

---

## 7. Migrations

Alembic, additive: `effy_*` migrations add tables or columns and backfill; drops
appear only in `downgrade()`. Every migration that changes existing rows is
rehearsed on a restored backup before deploy (restore into a scratch database as
`backup_db.py verify` does, run the upgrade, check, run the downgrade, drop it).
The EffySocial chain, oldest first:

```
ec89ceaca3ad tenancy → b1d2e3f40511 email/reset tokens → c2e4f60a7233 campaigns
→ d3f5a1b62744 brand brain → e4a6b2c83855 posts/conversations/reviews → f5b7c3d94966 leads
→ a6c8d4e05a77 forms → b8d2e6f13a99 landing → c4f1a7d28b55 tracking → d7e3b9c46a10 followups
→ e9c5d1a37b20 lead outcome → f0a4d7c92b18 link-in-bio → a1b5c9d07e33 integrations
→ 7804810b6fc2 ideas → f08fa5df7d03 media → fbe8f376f4ff workflows → b34786fa9961 ai_usage
→ 5432698bc7b9 settings → 24549f501686 competitors → 25b5cffc8ea3 dealer_avatars
→ 7c1f2ad90e44 films + scenes → 3e8a91c0d7b2 characters → a2f7c1e94b60 product shots
→ b7d2e5a13c80 film fingerprints → c3e8f1a27b54 film sign-offs → d9a4b6c3e2f1 job events + acceptance
→ e5b1c7d9a4f2 avatar masters → f2c8a3b6d1e7 ai_usage.ref → a8d4e2f7b3c9 brand source text
→ b4e9c2d7a1f3 workspace manager → c7f3a9e2d4b8 onboarding, plans, OAuth state
→ d8b3f1c6e9a2 invites → e1c4a7b9d2f5 trial end → f7d2b8e4c1a6 preferences + 2FA
→ a3e6c9f1b7d4 interest → b8d4f2a6c9e3 post publish outcome → c5e8a1d3f7b2 scheduler jobs
→ d6f1b3a8e2c4 follow-up waits → e7a2c4f9b1d3 inbox tags + review links → f1c3e5a7b9d2 report shares
→ a4d8e2f6c1b3 sample workspace → c7e1f3a9d5b2 profiles + work email → d4a8c2e6f1b7 org settings
→ e2b7c4d9f1a3 workspace brand kind + plan brief  [HEAD]
```

Deploys apply migrations (`effy_phase.sh deploy` runs
`FLASK_APP=wsgi.py myenv/bin/flask db upgrade` after the backup).

---

## 8. Deployment & ops

| Thing | Value |
|---|---|
| Host | single AWS Linux box (3.9 GB RAM) |
| Frontend serve | nginx site `effysocial.effybiz.in` → static root `/srv/effysocial/dist`, a symlink to the live release in `.releases/` (SPA fallback to `index.html`) |
| API proxy | nginx `/api/*` → `http://127.0.0.1:5010` (gunicorn) |
| Backend service | `novalab-engine.service` (gunicorn); deploys reload it gracefully with `SIGHUP` |
| Scheduler | `effy-scheduler.timer` (every minute) |
| Python env | `/srv/novalab-engine/myenv` (shared by worktrees — never install packages from a worktree) |
| Database | PostgreSQL `novastudy_db`; `scripts/backup_db.py` dumps to S3 every 3 days and before every deploy, `verify` rehearses a restore |
| Media | `app/tools/effy/_media/`, synced to S3 nightly (`scripts/backup_media.py`) |
| TLS | Let's Encrypt (`/var/well-known/acme-challenge`) |

**Never edit `/srv/novalab-engine` or `/srv/effysocial` directly** — gunicorn
and nginx serve them, so an edit there is an edit to production. All changes go
through `scripts/effy_phase.sh` in the engine repo:

```
effy_phase.sh start  NAME   # worktrees for both repos on branch phase/NAME under ~/effy-work/NAME
                            # …edit and commit in ~/effy-work/NAME/{engine,web}…
effy_phase.sh check  NAME   # backend tests (with the route gate), frontend unit tests, mocked
                            # end-to-end, the real-engine end-to-end, build; records the passing commits
effy_phase.sh deploy NAME   # backup → fast-forward main → migrations → frontend release
                            # → graceful engine reload → scheduler units → smoke checks → push
effy_phase.sh finish NAME   # remove worktrees and merged branches
effy_phase.sh rollback      # previous frontend release + engine commit (migrations are not reverted)
effy_phase.sh status
```

Deploy refuses when the commits differ from what passed `check`, when either
production repo has local or untracked changes (files that must stay are listed in
`.git/info/exclude`) or has drifted from `origin/main`, or when the phase is not
based on the current `main`. Every deploy records the backup it took, with both
commit ranges, in `~/effy-work/deploys.log`. Do not run `npm run build` in
`/srv/effysocial`.

### Environment variables (engine `.env`)
| Key | Purpose |
|---|---|
| `SECRET_KEY` | Flask session signing (shared with novacept-platform; rotation is plan step 1.6, on hold) |
| `EFFY_TOKEN_KEY` | Comma-separated Fernet keys for stored OAuth tokens and 2FA secrets; the first encrypts, all decrypt. Rotate by prepending a key, then `scripts/rekey_tokens.py check` / `apply`. Keep a copy outside the server |
| `EFFY_MEDIA_SIGNING_KEY` | Signs media links; must match nginx's `secure_link` secret (§5) |
| `EFFY_BASE_URL` | Public base for email, media and OAuth links |
| `EFFY_ADMIN_EMAILS` | Platform admins (Admin page, plan changes, scheduler) |
| `EFFY_REQUIRE_VERIFIED_EMAIL` | `false` in production until the sending domain is verified (G06) |
| `RESEND_API_KEY` **or** `EFFY_SMTP_HOST/PORT/USER/PASS`, `EFFY_EMAIL_SENDER` | Transactional email; if sending fails the link is only logged |
| `EFFY_EXPOSE_DEV_LINKS` | **Development only** — returns verification/reset links in responses. Never in production |
| `EFFY_RATELIMIT_STORE`, `EFFY_REDIS_URL`, `EFFY_SCHEDULER_LOCK` | Redis for rate limits and the scheduler lock (default `redis://127.0.0.1:6379/0`); `memory` / `local` are for tests |
| `GROQ_API_KEY`, `GROQ_CHAT_MODEL`, `GROQ_CHAT_MODEL_BATCH` | Text AI (§2) |
| `GEMINI_API_KEY` | Google: Nano Banana 2 images, vision, Veo. `EFFY_IMAGE_MODEL`, `EFFY_AVATAR_IMAGE_MODEL`, `EFFY_AVATAR_VISION_MODEL`, `EFFY_FILM_VISION_MODEL`, `EFFY_VEO_MODEL` override the models |
| `EFFY_IMAGE_PROVIDER`, `EFFY_VIDEO_PROVIDER` | Defaults for the Admin image engine (`google`/`flux`) and video engine (`veo`/`free`); the Admin setting wins |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | FLUX image fallback (the token is currently invalid — G05) |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_MODEL`, `ELEVENLABS_STABILITY/SIMILARITY/STYLE/SPEED`, `ELEVENLABS_LIBRARY_VOICES` | Voice-overs (§2) |
| `SYNC_LABS_API_KEY` | Lip-sync |
| `EFFY_LIMIT_IMG_MONTHLY`, `EFFY_LIMIT_VEO_MONTHLY`, `EFFY_LIMIT_FILM_VEO_MONTHLY`, `EFFY_LIMIT_PRODUCT_VEO_MONTHLY`, `EFFY_LIMIT_AVATAR_MONTHLY` | Per-kind monthly caps |
| `META_APP_ID` / `META_APP_SECRET` | Meta (Instagram, Facebook, Ads, WhatsApp) — live |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth |
| `GOOGLE_CLIENT_ID` / `_SECRET`, `GOOGLE_ADS_CLIENT_ID` / `_SECRET` / `_DEVELOPER_TOKEN` | Google Business Profile, Google Ads — pending |
| `WHATSAPP_WABA_ID` | WhatsApp Cloud API — pending |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `S3_PREFIX` | Media and database backups (a scoped IAM user since 20 Sep) |
| `EFFY_WEB_READ`, `EFFY_SKIP_EMAIL_MX` | Test switches: `off` stops website reads; `1` skips MX lookups at sign-up |

---

## 9. Testing

`effy_phase.sh check` runs every layer below; a phase cannot deploy unless they
pass.

**Backend** (`novalab-engine/tests/`, 78 files, pytest): run
`myenv/bin/python -m pytest -q` from the engine checkout. `conftest.py` points the
app at a throwaway SQLite file, keeps rate limits and the scheduler lock in
process, and provides `register`, `account`, `connect_instagram` and
`switch_on(client, *settings)`; providers are stubbed per test. Tests that write a
plan give the workspace a goal first (`PUT /marketing-plan/brief`); `SOSTAC_RAW` is a
model answer on SOSTAC, and `sostac_answer(plan)` wraps an older flat test plan in it.

**Route gate:** `conftest.py` records every API route a test calls; with
`EFFY_ROUTE_GATE=1` (set by `check`) the run fails and lists any `/api/effy` route
no test calls, so a new endpoint can't ship untested. All 268 routes are called.

**Frontend unit and component** (Vitest + React Testing Library, jsdom, 63 files):
`npm test`. `src/test/mockApi.js` stubs `fetch` for `/api/effy` from a
`"METHOD /path"` table and records calls; `src/test/render.jsx` renders inside the
real auth, workspace, query and router providers. Fixtures in `src/test/fixtures/`
are captured from the engine's test flow — regenerate rather than hand-edit.

**End to end, mocked** (Playwright, `e2e/`): `npm run test:e2e` builds the app,
serves it with `vite preview` on port 4291 (`E2E_PORT`) and runs Chromium with
`/api/effy` stubbed per test. `@playwright/test` is pinned to 1.63.0 to match the
cached Chromium.

**End to end, real engine** (`e2e-film/`, `npm run test:e2e:film`, 22 specs): the
demo film, workspaces and clients, onboarding, team, profiles, approvals, calendar,
publishing, campaigns, reports, reviews, ads, forms, follow-ups, conversions,
strategy, creative, organic, plans, settings, the plan brief and the SOSTAC plan,
against the real engine.
`playwright.film.config.js` starts `scripts/e2e_film_server.py` from the sibling
`../engine` (or `EFFY_ENGINE_DIR`) on port 5099 under `env -i`, with a throwaway
SQLite database, Instagram replaced by an in-process fake and paid providers
stubbed; ffmpeg really assembles and exports. The build is served on 4293.

**Checks before a change is called done:** make the new test fail by breaking the
behaviour it guards (restore from a copy, never `git checkout <file>`); rehearse
row-changing migrations on a restored backup; after deploy, check production with
throwaway accounts and delete them (`cleanup.follow_cascades`).

Name tests after the Launch Ledger case they cover (e.g. `CAMP-003`).

---

## 10. Conventions

- **Docs with the code:** update this file, [API.md](API.md) and the affected
  [module docs](modules/README.md) in the same commits as the change.
- **Real data only:** no invented numbers in the product; derived, sample or
  sandbox data is always labelled (`provider: mock / sandbox / sample`), and the
  sample workspace says so on every screen.
- **Human control:** anything that spends money or publishes publicly is
  approval-gated or explicitly confirmed (spec §3.4).
- **Client dependencies** (their DNS, credentials, business API approvals) are
  recorded in the client report, not only in chat.
