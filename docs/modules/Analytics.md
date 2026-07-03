# Module: Analytics & Reports

> Turn activity into insight — organic now; advertising/leads/revenue in later phases. _Status: ✅ Organic frontend+backend (aggregation live, series derived) · Reports backend pending._
> Spec ref: §15 · Phase 1 (Organic, Reports) → 2 (Ads/Leads/Revenue/Creative)

## 1. What it does
Measures performance and — critically — connects vanity metrics to outcomes. Organic analytics covers reach, engagement and growth plus "what's working" analysis (best post/format/time/pillar). Reports package this for clients with AI summaries and white-labelling.

## 2. Where it lives
- **Routes:** `/app/analytics/organic` (built), `/app/analytics/ads|leads|revenue|creative` (later), `/app/reports`.
- **Frontend files:** `src/app/pages/OrganicAnalytics.jsx` (+ Reports later); data `src/app/data/sampleData.js` (`organicAnalytics`).
- **Backend (when built):** aggregation endpoints over `metric_snapshot` + `published_post`.

## 3. Screens & key UI
- **Organic:** KPI cards (followers, growth, reach, engagement rate, profile visits, link clicks); follower-growth chart; reach vs engagement; **what's working** panel (best post/format/time/pillar); top-posts table; audience demographics; **best-times heatmap**.
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

## 9. Backend contract (to implement)
- **Tables:** `metric_snapshot`, `report`, `report_schedule`.
- **Endpoints:** `GET /api/analytics/organic?workspace=&range=` → { kpis, followerSeries, reachSeries, topPosts, demographics, bestTimes, insights }; `GET/POST /api/reports`, `POST /api/reports/:id/generate` (AI summary), `POST /api/reports/:id/share`.
- **Jobs:** nightly metric sync from providers → metric_snapshot; scheduled report email.
- **RBAC:** spend/revenue hidden from view-only; client sees their workspace reports.

## 10. Open questions / TODO
- Reports builder + white-label (next).
- Advertising/Leads/Revenue/Creative analytics (Phase 2).
