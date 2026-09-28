# Module: Marketing Landing, Login, Accounts & Profiles

> The public front door → sign-up → onboarding → the app, and the profiles a login works in. _Status (27 Sep 2026): ✅ real accounts, email verification and reset, two-factor · ✅ onboarding saved and routed by offer · ✅ three profiles with a Business work email (6.14) · ✅ several profiles per login, switcher, invites across organisations (6.15)._
> Spec ref: §6 (onboarding), screens #1–3

## 1. What it does
`/` markets EffySocial and sends visitors to **/login**, which signs in or creates an account and continues to **/onboarding** or **/app**. Every account works inside a **profile** — an organisation of one of three types — and one login can hold several.

## 2. Where it lives
- **Routes:** `/` (Landing), `/login`, `/verify`, `/forgot`, `/reset`, `/join` (invites), `/onboarding`, `/privacy`, `/terms`, `/app/*` (gated by `RequireAuth`).
- **Frontend:** `src/marketing/{Landing, Login, Onboarding, Join, Privacy, Terms}.jsx`, auth state `src/app/context/AppAuth.jsx` (bootstrap, `switchProfile`, `addProfile`), profile definitions `src/app/profiles.js`, switcher `src/app/shell/ProfileSwitcher.jsx`, `src/app/components/AddProfileDialog.jsx`, `WorkEmailForm.jsx`, `WorkEmailBanner` in `AppShell.jsx`.
- **Engine:** `routes.py` (register, login, verify, reset, bootstrap), `auth.py` (session, active profile), `profiles.py`, `onboarding.py`, `team.py` (invites), `twofactor.py`, `account.py`, `email.py`, `ratelimit.py`.

## 3. Screens & key UI
- **Landing:** positioning hero with the product films, connected-journey strip, feature grid, pricing link, footer with Privacy and Terms.
- **Login:** sign in or create an account (email + 8–128 character password); two-factor code step when on; resend verification; *Continue with Google* is not built yet (6.5).
- **Onboarding:** profile type → details → what you need (create, market, both) → goals → connect → Brand Brain → first plan (or *Start creating* for creation only). A Personal Brand is asked about themselves; a Creative-plan profile (a second profile) onboards for creation only.
- **Profile switcher** (top bar): every profile on the login with its type, role and plan; *Add account type* (type + name; says whether the trial comes with it).
- **Work email** (Business): a banner until verified; Settings → Organisation → Work email sends and checks the code.

## 4. Data model
`effy_users` (email, password hash, email_verified, preferences incl. last-used profile, 2FA) · `effy_orgs` (the profile: name, `type` business | personal_brand | agency, plan, trial_ends_at, owner, onboarding answers, work_email, settings) · `effy_memberships` (user × org × role; unique per pair) · `effy_workspaces` · `effy_invites` · `effy_tokens` (verify, reset, OAuth state). The session holds `effy_uid` and the active profile `effy_org`.

## 5. Connections (object graph)
- The active profile scopes every request (`tenancy.current_membership`); switching profile remounts the app with a fresh cache.
- Onboarding feeds Brand Brain (brief, documents, website), Integrations (connect step) and the first Marketing Plan.
- Invites add an organisation to someone's profiles; removal leaves their other profiles.

## 6. AI involvement
The first marketing plan (Groq, grounded in the answers, Brand Brain and documents) and the website read during onboarding. Nothing else here calls AI.

## 7. Integrations
Onboarding's connect step uses the real OAuth flows with their true states; email goes through Resend (the test sender only reaches the account owner until effybiz.in is verified, G06).

## 8. States
Signed out → landing/login; unverified email (banner; sign-in isn't blocked while `EFFY_REQUIRE_VERIFIED_EMAIL=false`); two-factor pending; onboarding incomplete → *Finish setting up* on Home; no organisation → *You're not part of a team* with *Create your own profile*; unverified Business → work-email banner; rate-limited → 429 with a wait.

## 9. Backend contract (built)
See [API.md](../API.md) — Auth & tenancy, Profiles, Email verification, Account and two-factor. Rules that matter:
- Only a login's **first own profile** gets the 14-day trial; later ones start on Creative.
- A Business work email must be at the company's own domain (free-mail providers refused); code: 6 digits, salted hash, 30 minutes, 5 tries, row-locked while checked, 5 codes an hour.
- Names are HTML-escaped in every email.
- Tests: `test_effy_auth.py`, `test_effy_profiles.py`, `test_effy_onboarding.py`, `test_effy_team.py`, `profiles.test.jsx`, `profileSwitcher.test.jsx`, `Onboarding.test.jsx`, `e2e-film/{onboarding,profiles,team}.spec.js`.

## Email (transactional)
`app/tools/effy/email.py` tries **Resend** (`RESEND_API_KEY`), then **SMTP** (`EFFY_SMTP_*`), else logs the link. Verification token 48 h, reset token 1 h, one-time use.

## 10. Open questions / TODO
- Verified sending domain (G06, 6.3), then `EFFY_REQUIRE_VERIFIED_EMAIL=true`.
- Google sign-in (6.5).
- Privacy Policy and Terms wording to be approved (`LEGAL.draft`).
- A way to leave or delete a profile (not built).
