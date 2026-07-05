# Module: Analytics & Reports

> Turn activity into insight. _Status: ✅ Organic (aggregation live, series derived) · ✅ Ads/Leads/Revenue/Creative (P2 — leads/revenue aggregate real pipeline, spend/creatives via ads adapter) · Reports backend pending._
> Spec ref: §15 · Phase 1 (Organic, Reports) → 2 (Ads/Leads/Revenue/Creative)

## 1. What it does
Measures performance and — critically — connects vanity metrics to outcomes. Organic analytics covers reach, engagement and growth plus "what's working" analysis (best post/format/time/pillar). Reports package this for clients with AI summaries and white-labelling.

## 2. Where it lives
- **Routes:** `/app/analytics/organic`, `/app/analytics/ads`, `/app/analytics/leads`, `/app/analytics/revenue`, `/app/analytics/creative` (all built), `/app/reports`.
- **Frontend files:** `src/app/pages/OrganicAnalytics.jsx`, `AdsAnalytics.jsx`, `LeadAnalytics.jsx`, `RevenueAnalytics.jsx`, `CreativeAnalytics.jsx` (+ Reports later).
- **Backend:** `app/tools/effy/analytics.py` — organic aggregates `effy_posts`; leads/revenue aggregate `effy_leads` (+ campaign names); creative + all spend figures flatten the ads adapter (`get_ads_provider`). Ads Analytics reuses `GET /ads/dashboard`.

## 3. Screens & key UI
- **Organic:** KPI cards (followers, growth, reach, engagement rate, profile visits, link clicks); follower-growth chart; reach vs engagement; **what's working** panel (best post/format/time/pillar); top-posts table; audience demographics; **best-times heatmap**.
- **Ads:** channel comparison (spend/leads dual-axis bars + scorecard: spend, leads, CPL, CTR, ROAS per platform) and per-campaign **spend pacing** bars with near-cap flags.
- **Leads:** KPI cards (total, qualified + rate, pipeline value, cost/qualified); stage-funnel bar chart; leads by source & campaign; quality mix (hot/warm/cold); sales outcomes; lost reasons.
- **Revenue:** attributed revenue, customers, avg deal, spend, CAC, ROAS; revenue by channel & campaign (last-touch). Empty state guides marking leads Won / purchase-completed.
- **Creative:** attribute analysis strip (best format, avg CTR per format, fatigue count) + sortable creative cards (CTR/CPL/spend) with platform + fatigue badges.
- **Reports (later):** drag-drop builder, white-label, AI-written summary, recommended actions, PDF/share link, client comments; role-specific defaults (§15.6).

## 4. Data model
Read-only aggregation. `metric_snapshot` (workspace_id, entity, metric, value, ts) feeds time-series; `published_post.metrics` feeds top posts. `report` + `report_schedule` for saved/scheduled reports.

## 5. Connections (object graph)
- Sources: Publish (published_post metrics), Engage (response stats), Campaign (per-campaign rollups).
- Outputs: "reusable winning ideas" → AI Studio (create variant); reports pull from every module; metrics drill-down deep-links to source objects.

## 6. AI involvement
Analytics agent: explains changes ("why engagement rose"), surfaces best patterns, writes report summaries + recommended next actions.

## 7. Integrations
Numbers originate from connected social providers (organic) and ad/analytics providers (paid, later) via adapters. Mock now.

## 8. States
Empty (no published content yet → guidance), partial (some channels disconnected), loading skeletons, compare-period, export.

## 9. Backend contract
- **Built:** `GET /api/effy/analytics/organic` (real post aggregation, derived series); `GET /api/effy/analytics/leads` (real `effy_leads`: kpis/funnel/bySource/byCampaign/quality/lostReasons/outcomes); `GET /api/effy/analytics/revenue` (won + purchase-completed leads, last-touch byChannel/byCampaign; spend from ads adapter → CAC/ROAS, `spendProvider:"mock"`); `GET /api/effy/analytics/creative` (flattened adapter creatives + byFormat/fatigue attributes). All org/RBAC-scoped; tests in `test_effy_analytics.py` + tenancy matrix.
- **Later:** `metric_snapshot` table + nightly provider sync (makes organic series live); `report`/`report_schedule` + `GET/POST /api/reports`, `POST /api/reports/:id/generate` (AI summary), `POST /api/reports/:id/share`.
- **RBAC:** spend/revenue hidden from view-only; client sees their workspace reports.

## 10. Open questions / TODO
- Reports builder + white-label (next).
- Phase 3: real Meta/Google spend & creatives through the adapter (removes `spendProvider:"mock"`); pipeline-history snapshots for time-series lead/revenue charts.
