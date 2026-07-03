# Module: Overview / Home

> Role-aware dashboard connecting organic, paid, leads and revenue with actions. _Status: ✅ frontend (business view) · 🔌 backend + role variants pending._
> Spec ref: §7 · Phase 1

## 1. What it does
The landing screen of the app: an at-a-glance, **actionable** summary that always ties vanity metrics to business outcomes (leads, customers, revenue, ROAS) and surfaces what needs attention today.

## 2. Where it lives
- **Route:** `/app` (index)
- **Frontend files:** `src/app/pages/Overview.jsx`, data `src/app/data/sampleData.js` (`overviewMetrics`, `trendSeries`, `UPCOMING_CONTENT`, `ATTENTION_LEADS`, `ALERTS`)
- **Backend (when built):** aggregation endpoints across modules.

## 3. Screens & key UI
- AI morning-summary strip (explains the week's change).
- Metric cards: attributed revenue, ad spend, leads (+qualified), ROAS (+CPL) — INR formatted, tabular figures.
- 8-week area chart (leads/spend/revenue) via Recharts.
- Leads needing action, upcoming content, critical alerts.
- Pending: **role variants** — agency (§7.2), social manager (§7.3), performance marketer (§7.4); customisable/draggable widgets; date + compare controls; drill-down.

## 4. Data model
Read-only **aggregation** of other modules per workspace + date range. No own tables; reads campaign KPIs, leads, scheduled content, alerts.

## 5. Connections (object graph)
- Pulls from Campaigns (KPIs/funnel), Convert (leads/revenue), Publish (upcoming content), and the alert engine (Advertise/Integrations/Engage).
- Every metric drill-down deep-links into its module (revenue→Revenue analytics, leads→pipeline, content→calendar).

## 6. AI involvement
Analytics agent writes the morning summary + anomaly explanations ("why did CPL rise"). Surfaced as the summary strip + alert details.

## 7. Integrations
Indirect — metrics originate from connected social/ad/analytics providers via their modules.

## 8. States
Empty (new workspace → "connect accounts / create first plan"), loading skeleton, partial (some channels disconnected), error per-widget (not whole page), compare-period.

## 9. Backend contract (to implement)
- **Endpoints:** `GET /api/overview?workspace=&range=&role=` → { metrics, trend[], upcoming[], attentionLeads[], alerts[], summaryText }.
- **Compute:** server-side aggregation across campaign_kpi_snapshot, leads, scheduled_post, alerts; role param selects widget set.
- **RBAC:** widget set varies by role; spend hidden from view-only.

## 10. Open questions / TODO
- Role-variant layouts; widget customisation/drag-order; date-range + compare.
