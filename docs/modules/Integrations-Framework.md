# Module: Integrations — Connection Framework (Phase 3 slice 1)

> Real per-workspace connection state driving adapter selection (mock ⇄ real). _Status: 🔨 building · spec §17.2 · Phase 3._

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
- Env keys checked: `META_APP_ID/SECRET`, `GOOGLE_ADS_CLIENT_ID/SECRET`, `LINKEDIN_CLIENT_ID/SECRET`.
- Adapter wiring: `get_ads_provider(ws)` → real provider iff `meta_ads`/`google_ads` row `connected`, else mock.

## 5. Table
`effy_integrations`: id, workspace_id, provider, state, account, meta JSON (token refs later — encrypted, never serialized), last_sync, created_at. Unique (workspace_id, provider).

## 6. Tests
Catalogue merge, connect → pending_credentials without env creds, disconnect, adapter selection honors connection state, tenancy/RBAC matrix.
