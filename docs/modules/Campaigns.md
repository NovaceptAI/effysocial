# Module: Campaigns & Campaign Workspace

> The hub object that connects strategy → content → ads → leads → revenue. _Status: ✅ frontend + ✅ backend (list/get/create, org-scoped) · other tabs + write-flows pending._
> Spec ref: §9.3, §13.4–13.5 · Phase 1 (organic) → 2–3 (ads)

## 1. What it does
A campaign holds its objective, audience, dates, channels, budget, KPIs and — critically — links to every related object (content, ads, creatives, landing pages, forms, leads, results). The Campaign Workspace shows the full funnel on one screen and organises everything under tabs.

## 2. Where it lives
- **Routes:** `/app/campaigns` (list), `/app/campaigns/:id` (workspace)
- **Frontend files:** `src/app/pages/Campaigns.jsx`, `src/app/pages/CampaignWorkspace.jsx`, data `src/app/data/sampleData.js` (`CAMPAIGNS`, `campaignsFor`, `getCampaign`, `campaignFunnel`)
- **Backend (when built):** blueprint `app/tools/campaign_os/`, tables below.

## 3. Screens & key UI
- **List:** name, objective, status, budget pacing bar, leads, CPL, ROAS, recommendation count; row → workspace.
- **Workspace:** header (status/objective/dates/owner) + 8 tabs (Overview, Plan, Content, Ads, Conversion, Leads, Analytics, Activity).
  - **Overview (built):** KPI cards, **funnel** (Impressions→Clicks→Leads→Qualified→Customers w/ step conversion %), budget pacing, Effy recommendation card, **connected objects** grid (content/ads/landing/forms → links).
  - Other tabs: stubbed, fill as their modules land.

## 4. Data model
Campaign (mock fields → tables): id, workspace_id, name, objective, status [live|scheduled|draft|paused|completed], owner_id, pillar, channels[], start, end, budget, spent, kpis{impressions,clicks,leads,qualified,customers,revenue,cpl,roas,ctr}, counts{content,ads,landingPages,forms}, recommendations.

Backend tables: `campaign`, `campaign_kpi_snapshot` (time-series for charts), plus join references from content/ad/lead/landing/form tables back to `campaign_id`.

## 5. Connections (object graph) — central hub
- **ContentItem.campaign_id**, **Ad.campaign_id**, **Creative**, **LandingPage.campaign_id**, **Form.campaign_id**, **Lead.campaign_id**, **ConversionEvent.campaign_id** all point here.
- **Marketing Plan** generates campaigns; **Calendar** shows campaign content; **Analytics/Reports** aggregate by campaign.
- Funnel + KPIs are computed from the connected objects (leads from forms/ads, revenue from offline conversions).

## 6. AI involvement
Strategy agent creates/edits the plan; Performance agent produces the Overview recommendation (detected/why/action/impact/confidence/approval). Recommendations stored in `recommendation` table, surfaced in the right panel.

## 7. Integrations
Organic: none for the object itself. Paid (Phase 2–3): AdsManager adapter syncs ad-level spend/KPIs into `campaign_kpi_snapshot`.

## 8. States
Empty (no campaigns → create), draft vs live, paused, completed (read-only), tab-empty (module not built), recommendation present.

## 9. Backend contract (to implement)
- **Tables:** as §4.
- **Endpoints:** `GET /api/campaigns?workspace=` · `GET /api/campaigns/:id` (with funnel + counts) · `POST /api/campaigns` · `PATCH /api/campaigns/:id` · `GET /api/campaigns/:id/funnel`.
- **Jobs:** nightly KPI snapshot; recompute counts on linked-object change.
- **RBAC:** manager/strategist/performance edit; client-approver read.

## 10. Open questions / TODO
- Tabs (Plan/Content/Ads/Conversion/Leads/Analytics/Activity) wire to their modules as built.
- Attribution model for `revenue` (Phase 4 multi-touch).

## The campaign workspace (16 Sep 2026, G40)
Every tab now shows what is really linked to the campaign (`GET /campaigns/:id/workspace`), and a campaign with nothing in it reads as zeros rather than sample numbers.
- **Overview**: leads, revenue, CPL and ROAS from its own leads and recorded spend; a funnel of reach → landing views → form submissions → leads → qualified → won; budget pacing; counts of what hangs off it.
- **Plan**: what the campaign is for, and — when a marketing plan exists — the pillar it belongs to, that plan's cadence for the campaign's channels, and the targets it is working towards. Without a plan, a link to build one.
- **Content**: the posts tagged to it, opening in the post dialog; empty state creates in AI Studio with the campaign attached.
- **Ads**: spend against budget, the published posts available as creatives with their reach, and the honest note that ads run once Meta Ads is connected.
- **Conversion**: its landing pages and forms with status, views and submissions. **Leads**: its leads with stage, quality and value, opening the pipeline. **Analytics**: published/reach/submissions/revenue, the same funnel and leads by stage. **Activity**: a timeline built from when each linked thing happened.
- **Edit** opens a dialog (name, objective, status, pillar, owner, budget, dates, channels). **Ask Effy** opens the assistant with a question about this campaign (the panel is now opened through `AssistantContext`, so any page can ask). **New campaign** and the empty state's **Create campaign** open the launch wizard.
