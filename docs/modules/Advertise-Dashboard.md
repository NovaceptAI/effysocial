# Module: Advertise — Campaigns · Creatives · Audiences · Budgets · Rules

> Cross-platform paid performance: spend → leads → CPL/ROAS, with campaign → ad-set → ad drill-down, plus creative ranking, audiences, budget pacing with in-place edits, and automated guardrail rules. _Status: ✅ full surface live behind the ads adapter (sandbox mode for testing) · spec §13.3–13.5._

## 1. What it does
Five screens off one adapter:
- **Campaigns** (`/app/ads`): account totals (spend, impressions, CPM, clicks, CTR, CPC, leads, CPL, ROAS, pacing), spend/leads trend, campaign → ad set → ad drill-down.
- **Creatives** (`/app/creatives`): every ad ranked by CPL with format tabs, fatigue badges, best-CPL scorecard.
- **Audiences** (`/app/audiences`): saved/custom/lookalike audiences — size, spend, leads, CPL, where used, overlap warnings.
- **Budgets** (`/app/budgets`): per-campaign monthly budget + pacing bars, near-cap and under-pacing flags, **in-place budget edit and pause/resume** (write actions, RBAC-gated).
- **Automated Rules** (`/app/rules`): "when CPL goes above ₹500 → notify/suggest pause" guardrails with a read-only dry-run — rules **suggest, never auto-apply**.

## 2. The integration-adapter pattern
`get_ads_provider(workspace)` returns an `AdsManager` implementation:
- **`MockAdsProvider`** (`mode:"mock"`, read-only): nothing connected — every screen shows an honest "connect ad accounts" state, no sample data.
- **`SandboxAdsProvider`** (`mode:"sandbox"`, writable): deterministic workspace-seeded data behind a real `effy_integrations` row (`meta_ads`, `meta:{sandbox:true}`); budget/status overrides persist to the row's meta so UI round-trips are real. Always badged "Sandbox data — not live spend". Enabled from Integrations or `POST /ads/sandbox`.
- **`MetaAdsProvider` / `GoogleAdsProvider`** (Phase 3, `mode:"live"`): same interface, chosen when the workspace's ad integration is connected.
The app/UI never knows which — swapping sandbox→real is a provider change, not an app change.

## 3. Where it lives
- **Routes:** `/app/ads` · `/app/creatives` · `/app/audiences` · `/app/budgets` · `/app/rules` (Advertise group).
- **Backend:** `app/tools/effy/ads.py` → `GET /ads/dashboard|creatives|audiences|budgets|rules` · `POST /ads/campaigns/:id/status|budget` · `POST /ads/sandbox` · rules CRUD + `POST /ads/rules/dry-run` 🔒🏢. No new tables — sandbox state + overrides live on the integration row; rules in settings.

## 4. Payload shapes
See [API.md — Advertise](../API.md). All payloads carry `provider` + `mode`; the UI gates on `mode ∈ {sandbox, live}`.

## 5. Connections
- CPL/ROAS feed Overview + Effy AI performance recommendations (Phase 3: real numbers replace campaign-table KPIs).
- "Create ad from post" (Published) and campaign-workspace Ads tab will link here.
- Sandbox spend flows into Analytics (revenue CAC/ROAS, creative performance) through the same adapter.

## 6. States
Connect state (mock, all five screens), sandbox badge, empty (no campaigns/creatives/rules), drill-down expand/collapse, paused campaigns dimmed, near-cap warning card, dry-run all-clear vs matches.

## 7. Tests
`test_effy_ads.py` (12): adapter determinism, payload shape, derived-metric sanity, mock refuses writes, sandbox enable/switch + badging, surface shapes, writes persist + reprice, sandbox → analytics spend, rules CRUD/validation, dry-run suggests-never-mutates, dry-run without connection matches nothing.
