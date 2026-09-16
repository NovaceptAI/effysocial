# Module: Integrations — Connection Framework (Phase 3 slice 1)

> Real per-workspace connection state driving adapter selection (mock ⇄ real). _Status: ✅ framework + real OAuth (LinkedIn live) + frontend · spec §17.2 · Phase 3._

## 1. What it does
Replaces the static Integrations mock with a real `effy_integrations` table: each workspace tracks which providers are connected, with what account and health. `get_ads_provider()` (and future publisher/messaging adapters) select **real providers when connected, mock otherwise** — making the Phase-2 adapter pattern operational.

## 2. Provider catalogue & states
Providers: `meta_ads`, `google_ads`, `instagram`, `facebook_page`, `linkedin`, `google_business`, `whatsapp`, `ga4`.
States: `available` → `pending_credentials` (OAuth app creds not configured server-side) → `connected` / `expired` / `disconnected`.

## 3. External dependencies (user-provided, tracked here)
| Provider | Needs from us | Status |
|---|---|---|
| Meta (ads + IG/FB + WhatsApp) | Meta App ID/secret, business verification, App Review for ads_management/pages/IG scopes | ⬜ not started |
| Google (Ads + GA4 + GBP) | Google Cloud OAuth client, Ads developer token (basic access review) | ⬜ not started |
| LinkedIn | LinkedIn app + Marketing Developer Platform approval | ⬜ not started |
Until credentials exist, "Connect" returns `pending_credentials` with exact setup instructions — honest, no fake OAuth.

## 4. Backend contract
- `GET /api/effy/integrations?workspace=` 🔒🏢 → `{integrations:[{provider, label, category, state, account?, lastSync?, note?}]}` (catalogue merged with stored rows)
- `POST /api/effy/integrations/:provider/connect` 🔒🏢 admin-write → starts OAuth when server creds exist (`{redirect}`), else `{state:"pending_credentials", setup:[…]}`
- `POST /api/effy/integrations/:provider/disconnect` 🔒🏢 admin-write
- Env keys checked: `META_APP_ID/SECRET`, `GOOGLE_ADS_CLIENT_ID/SECRET` (Ads/GA4), `GOOGLE_CLIENT_ID/SECRET` (Business Profile), `LINKEDIN_CLIENT_ID/SECRET`.
- Adapter wiring: `get_ads_provider(ws)` → real provider iff `meta_ads`/`google_ads` row `connected`, else mock.
- **GBP profile (mock⇄live, same flow):** `GET /api/effy/gbp/profile?workspace=` → `{mode:"mock"|"live", categories[], profile?}` · `POST /api/effy/gbp/profile` 🔒🏢 write → saves to the `google_business` row's `meta.profile`; in live mode also pushes to Google's Business Information API (`sync:{state:synced|error|mock}`) · `POST /api/effy/gbp/profile/verify` → demo-verifies (mock) or reports honest `pending_verification` (live). Connect/disconnect preserve `meta.profile`, so a demo-created profile syncs unchanged once credentials land. UI: `/app/google-business` wizard, linked from the Integrations card.

## 5. Table
`effy_integrations`: id, workspace_id, provider, state, account, meta JSON (token refs later — encrypted, never serialized), last_sync, created_at. Unique (workspace_id, provider).

## 6. Tests
Catalogue merge, connect → pending_credentials without env creds, disconnect, adapter selection honors connection state, tenancy/RBAC matrix.


## 7. OAuth flow (real — shipped)
`oauth.py` holds provider-agnostic OAuth 2.0: authorize-code flow, CSRF `state` via EffyToken (single-use, 15-min; owned by the connecting user and naming the workspace in `workspace_id`; `returnTo: "onboarding"` on connect sends the browser back to onboarding, anything else to Integrations), token exchange + identity fetch, and **Fernet token encryption at rest** (key derived from SECRET_KEY; tokens never serialized to the client). Providers are data in `PROVIDERS` — adding Meta/Google is config, not new flow code.
- `POST /integrations/:provider/connect` → `{state:"redirect", redirect}` when creds exist, else `{state:"pending_credentials", setup[]}`.
- `GET /integrations/:provider/callback` (public) → exchanges code, stores encrypted token, redirects to `/app/integrations?connected=…&status=…`.
- **LinkedIn is live** (real creds). **Google Business Profile OAuth is configured** (`GOOGLE_CLIENT_ID/SECRET`, scope `business.manage`, offline access + consent for refresh tokens) — pending the client secret + GBP API access approval in Google Cloud. **Redirect URI to register in each provider app:** `https://effysocial.effybiz.in/api/effy/integrations/<provider>/callback`.

## 8. Meta sign-in and when access ends (16 Sep 2026, G28)
Instagram and Facebook Pages connect through Meta's own sign-in (`PROVIDERS["instagram"]`, `["facebook_page"]` → `https://www.facebook.com/v25.0/dialog/oauth`). The code becomes a long-lived user token, which names the Page — and, for Instagram, the Instagram Business account linked to it — and the Page token is what publishing uses. Scopes: `instagram_basic, instagram_content_publish, instagram_manage_insights, pages_show_list, pages_read_engagement` for Instagram; `pages_show_list, pages_read_engagement, pages_manage_posts` for a Page. Meta's own reason for a failure (no linked Instagram account, a used code) is shown on the Integrations page instead of a generic message.

**Redirect URI to add in the Meta app** (Facebook Login → Settings → Valid OAuth Redirect URIs): `https://effysocial.effybiz.in/api/effy/integrations/instagram/callback` and `.../facebook_page/callback`. Until Meta App Review (6.7), only the app's own admins, developers and testers can connect their accounts.

**When access ends:** a Page token doesn't expire, but Meta's access to the data does, ninety days after the person authorised the app (`debug_token` → `data_access_expires_at`). That date is stored beside the encrypted token as `meta.expiresAt` and returned as `accessEndsAt`/`daysLeft`/`reconnectSoon`; Integrations shows "Access ends 15 Dec 2026", warns with a Reconnect button in the last fourteen days, and shows the connection as expired once the date passes. Reading the token then marks the row expired, so publishing and scheduling say "Your Instagram connection has expired. Reconnect Instagram in Integrations." The scheduler's hourly `check-connections` job marks ended connections expired and asks Meta about live ones every twelve hours, which also catches an account whose owner removed the app.
