# Module: Strategy — Marketing Plan, Plan brief, Trends, Competitors, Ideas, Social Listening

> The planning layer that feeds everything downstream. _Status (28 Sep 2026): ✅ Marketing Plan written from each workspace's own plan brief (6.17) · ✅ Trends and Competitors with sources and dates · ✅ Ideas board · ⬜ SOSTAC plan (6.18, next) · ⬜ Social Listening (needs a data provider, 6.13)._
> Spec ref: §9

## 1. What it does
**Marketing Plan** turns a workspace's plan brief and Brand Brain into a month of strategy: content pillars, channels and cadence, post ideas, a funnel, KPIs and first-week actions. **Plan brief** says what is marketed in the workspace (a business or a personal brand) and holds its one goal, offer, customer, ad budget, posting capacity and website. **Trends** and **Competitors** surface angles, each labelled with where it comes from. **Ideas** collects post ideas. Social Listening waits on a data provider.

## 2. Where it lives
- **Routes:** `/app/plan`, `/app/trends`, `/app/competitors`, `/app/ideas`, `/app/listening`.
- **Frontend:** `src/app/pages/{MarketingPlan, Trends, Competitors, Ideas, SocialListening}.jsx`, `components/PlanView.jsx` (the plan), `components/PlanBrief.jsx` (the brief, sidebar of Marketing Plan), `components/SourceNote.jsx`.
- **Engine:** `onboarding.py` (plan generation and routes), `brief.py` (brief, brand kind), `strategy.py` (trends, competitors, Studio context), `ideas.py`.

## 3. Screens & key UI
- **Marketing Plan:** two columns — the newest plan on the left (*Write a new plan* keeps the old ones), the **Plan brief** on the right. The brief: *What's marketed here* (Business / Personal Brand — chosen per workspace only in an Agency & Creators profile, otherwise it follows the profile), *Goal* (Leads, Sales, Bookings, Phone calls, WhatsApp chats, Followers, Reach, Engagement) with a monthly *Target*, what's offered, who it's for, ad budget (0 = organic only), posts a week the team can make, website. A note lists what's still missing; *Generate plan* stays disabled until there's a goal. Read-only roles see both but can't change them.
- **Trends:** suggested themes, hashtags, formats to try, content gaps (from real posts), seasonal moments, *your best format* (from measured posts) — each with its source, date and limits.
- **Competitors:** the competitors you add (name, links, notes); no invented metrics.
- **Ideas:** captured → developing → ready; AI suggestions from Brand Brain, the season and real gaps; open one in AI Studio.

## 4. Data model
`effy_marketing_plans` (per workspace: source onboarding|marketing_plan, month, `inputs` it was written from, `plan`), `effy_workspaces.brand_kind` + `effy_workspaces.brief` (6.17: `goal {metric, target}`, `offer`, `customer`, `budget`, `capacity`, `website`, `updatedAt`), `effy_competitors`, `effy_ideas`.

## 5. Connections
- The plan's pillars, channels (posts a week), ideas and KPIs feed **Fill gaps** on the Calendar and each **campaign's workspace** (pillar, KPIs, channels).
- Onboarding fills the first workspace's brief (the first measurable goal, the website) while onboarding is under way, and sets each workspace's kind from the profile.
- The brief's website is read into that workspace's Brand Brain when a plan is written — an agency's own site never reaches a client.
- Trends and competitor angles feed AI Studio's context rail.

## 6. AI involvement
Groq writes the plan from the brief in words (kind — a personal brand is written in the person's voice — goal and target, or a request to suggest one; offer; customer; budget or *organic only*; capacity; website; connected channels; season), Brand Brain and its documents. It is told never to invent statistics, results, prices or testimonials. The output is normalised (3–5 pillars adding to 100%, known channels only, up to 12 ideas) and the cadence is cut to the team's capacity, every channel keeping at least one post a week when there's room; an unusable answer is refused (503) and nothing is stored.

## 7. Integrations
Connected channels are named to the plan. Trends' themes come from Brand Brain or general guidance; Social Listening needs a provider (6.13).

## 8. States
No brief goal (generate disabled, the brief lists what's missing) · no plan yet · writing (under a minute) · plan · refused (503, try again) · too many plans this hour (429) · read-only role.

## 9. Backend contract (built)
`GET /marketing-plan` → `{plan, brief, briefOptions}`, `PUT /marketing-plan/brief`, `POST /marketing-plan` (400 `brief_needed` without a goal), trends, competitors, ideas — see [API.md](../API.md). Tests: `test_effy_brief.py`, `test_effy_onboarding.py`, `test_effy_strategy.py`, `planBrief.test.jsx`, `MarketingPlan.test.jsx`, `e2e-film/brief.spec.js`, `e2e-film/onboarding.spec.js`.

## 10. Open questions / TODO
- **SOSTAC plan (6.18):** situation from real numbers, one measurable objective with a baseline, strategy, tactics with a budget split, campaigns created as drafts on *Accept plan*, and weekly planned vs actual.
- Social Listening data source (6.13).
