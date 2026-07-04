# Module: Advertise — Ad Dashboard (read-only)

> Cross-platform paid performance: spend → leads → CPL/ROAS, with campaign → ad-set → ad drill-down. _Status: ✅ read-only dashboard live (mock adapter) · spec §13.3–13.5._

## 1. What it does
A read-only paid-media dashboard: account totals (spend, impressions, CPM, clicks, CTR, CPC, leads, CPL, ROAS, pacing), spend/leads trend, and the campaign list with drill-down into ad sets and ads. Phase 2 = read-only; Phase 3 adds create/pause/budget actions via the same adapter.

## 2. The integration-adapter pattern (first use)
`get_ads_provider(workspace)` returns an `AdsManager` implementation:
- **`MockAdsProvider`** (now): deterministic, workspace-seeded data — payload flagged `provider:"mock"` so the UI shows an honest "sample data — connect ad accounts" banner.
- **`MetaAdsProvider` / `GoogleAdsProvider`** (Phase 3): same interface, chosen when the workspace's ad integration is connected.
The app/UI never knows which — swapping mock→real is a provider change, not an app change.

## 3. Where it lives
- **Route:** `/app/ads` (Advertise → Campaigns).
- **Backend:** `app/tools/effy/ads.py` → `GET /api/effy/ads/dashboard?workspace=` 🔒🏢. No new tables (read-only; Phase 3 persists sync + actions).

## 4. Payload shape
`{ provider, totals:{spend,impressions,reach,cpm,clicks,ctr,cpc,leads,cpl,roas,budget,pacing}, series:[{week,spend,leads}], campaigns:[{id,name,platform(meta|google),objective,status,budget,spent,pacing,leads,cpl,roas,trend, adsets:[{id,name,audience,spend,leads,cpl, ads:[{id,name,format,ctr,cpl,fatigue}]}]}] }`

## 5. Connections
- CPL/ROAS feed Overview + Effy AI performance recommendations (Phase 3: real numbers replace campaign-table KPIs).
- "Create ad from post" (Published) and campaign-workspace Ads tab will link here.

## 6. States
Mock banner (always, until real connect), empty (no campaigns), drill-down expand/collapse, paused campaigns dimmed.

## 7. Tests
Adapter determinism (same workspace → same numbers), payload shape, derived-metric sanity (cpl=spend/leads etc.), tenancy matrix.
