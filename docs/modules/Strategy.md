# Module: Strategy — Marketing Plan, Trends, Competitors, Social Listening

> AI-guided strategy: what to post, what's trending, what competitors do, what people say. _Status: 🔨 frontend (mock) · 🔌 backend pending._
> Spec ref: §9 · Phase 1

## 1. What it does
The planning layer that feeds everything downstream. Marketing Plan turns a brief into a monthly strategy (pillars, themes, budget split, KPIs). Trends surfaces timely angles. Competitors benchmarks rivals. Social Listening tracks mentions, sentiment and purchase-intent — each convertible into an idea/post/campaign/lead.

## 2. Where it lives
- **Routes:** `/app/plan`, `/app/trends`, `/app/competitors`, `/app/listening`
- **Frontend files:** `src/app/pages/MarketingPlan.jsx`, `Trends.jsx`, `Competitors.jsx`, `SocialListening.jsx`; data `src/app/data/strategyData.js`.
- **Backend (when built):** Strategy agent (Groq) + Trends signals (Google News/YouTube — already used by the legacy social tool) + listening ingestion.

## 3. Screens & key UI
- **Marketing Plan:** generate → content pillars (% + planned-vs-actual), recommended platforms, organic/paid split, campaign themes, posting frequency, suggested KPIs, budget recommendation, risks/assumptions; convert to campaigns/calendar.
- **Trends:** trending topics (with why-now), suggested hashtags, hot formats, content gaps, seasonal opportunities; save-as idea/post/campaign.
- **Competitors:** list with posting frequency, platform activity, engagement rate, top post, offers, share-of-voice.
- **Social Listening:** live mention stream + sentiment split + trend chart + keywords; convert a mention to response/lead/idea.

## 4. Data model
Backend: `marketing_plan`, `content_pillar`, plus `trend_signal`, `competitor`, `mention` (listening). Mock now via `strategyData.js` (workspace-derived).

## 5. Connections
- Plan → creates **Campaigns** + **content pillars** used across Content/Analytics.
- Trends/Competitors/Listening → feed **Ideas**, **AI Studio** angles, and **Engage** (mentions → leads/tasks).

## 6. AI involvement
Strategy agent (plan), Trends signal synthesis (reuses the legacy social tool's Groq trend engine), listening sentiment/intent classification.

## 7. Integrations
Trends: Google News RSS + YouTube (keyless/quota, already wired in legacy social). Listening/Competitors: social provider APIs (mock now).

## 8. States
Empty (no plan yet → generate), generating, partial (limited signals), no-mentions.

## 9. Backend contract (to implement)
- `POST /api/effy/plan/generate` (workspace, brief) → plan; `GET /api/effy/plan`.
- `GET /api/effy/trends?workspace=` (reuse social trend engine, brand-scoped).
- `GET /api/effy/competitors?workspace=`, `GET /api/effy/listening?workspace=`.
- Convert actions create Idea/Campaign/Lead rows.

## 10. Open questions / TODO
- Real listening requires social API access + streaming ingestion (Phase 2+).
