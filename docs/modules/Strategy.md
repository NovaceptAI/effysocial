# Module: Strategy — Marketing Plan, Plan brief, Trends, Competitors, Ideas, Social Listening

> The planning layer that feeds everything downstream. _Status (28 Sep 2026): ✅ Marketing Plan on SOSTAC (6.18) written from each workspace's own plan brief (6.17) · ✅ Trends and Competitors with sources and dates · ✅ Ideas board · 🟡 Social Listening part 1 (7 Oct 2026): Instagram comments and tags; sentiment and intent, and mentions beyond the account (6.13), still to come._
> Spec ref: §9

## 1. What it does
**Marketing Plan** turns a workspace's plan brief, Brand Brain and its own counted numbers into a four-week plan on **SOSTAC** — Situation, Objectives, Strategy, Tactics, Action, Control — and checks each week against what really happened. **Plan brief** says what is marketed in the workspace (a business or a personal brand) and holds its one goal, offer, customer, ad budget, posting capacity and website. **Trends** and **Competitors** surface angles, each labelled with where it comes from. **Ideas** collects post ideas. **Social Listening** lists comments on the connected Instagram account's recent posts and posts that tag it, refreshed every 30 minutes or on Refresh.

## 2. Where it lives
- **Routes:** `/app/plan`, `/app/trends`, `/app/competitors`, `/app/ideas`, `/app/listening`.
- **Frontend:** `src/app/pages/{MarketingPlan, Trends, Competitors, Ideas, SocialListening}.jsx`, `components/PlanView.jsx` (a plan: SOSTAC or older), `components/SostacView.jsx` (the six steps), `components/PlanBrief.jsx` (the brief, sidebar of Marketing Plan), `components/SourceNote.jsx`.
- **Engine:** `sostac.py` (situation numbers, the plan, weekly progress, accept), `onboarding.py` (plan routes), `brief.py` (brief, brand kind), `strategy.py` (trends, competitors, Studio context), `ideas.py`.

## 3. Screens & key UI
- **Marketing Plan:** two columns — the newest plan on the left (*Write a new plan* keeps the old ones), **This week: planned vs actual** and the **Plan brief** on the right. The plan: its summary and one-line objective (*Leads: from 12 to 40 leads a month by 25 Oct*, marked *Suggested* when the brief had no target), then six steps along the top:
  - **Situation** — *Where things stand*: the workspace's numbers, each with its source, or why it isn't measured (e.g. *Connect Instagram to measure this*); the model's reading of them; SWOT; *What's missing*.
  - **Objectives** — the goal, its starting point and where that comes from, the target and by when.
  - **Strategy** — who it's for, how it stands out, content pillars with shares, from post to customer.
  - **Tactics** — channels and posts a week (within the team's capacity), the budget split with its total, up to three campaigns (objective, channels, weeks, budget), 12 post ideas.
  - **Action** — each of the four weeks with its dates, focus and tasks.
  - **Control** — *Planned against actual* per week (posts, and the goal where it can be counted), and what to aim for.
  - **Accept plan** creates its campaigns as drafts in Campaigns, once; afterwards the page says how many and links there. Plans written before SOSTAC keep their own layout, with a note that they have no counted starting point or weekly check.
- **Plan brief** (sidebar): *What's marketed here* (Business / Personal Brand — chosen per workspace only in an Agency & Creators profile, otherwise it follows the profile), *Goal* (Leads, Sales, Bookings, Phone calls, WhatsApp chats, Followers, Reach, Engagement) with a monthly *Target*, what's offered, who it's for, ad budget (0 = organic only), posts a week the team can make, website. A note lists what's still missing; *Generate plan* stays disabled until there's a goal. Read-only roles see both but can't change them.
- **Trends:** suggested themes, hashtags, formats to try, content gaps (from real posts), seasonal moments, *your best format* (from measured posts) — each with its source, date and limits.
- **Competitors:** the competitors you add (name, links, notes); no invented metrics.
- **Ideas:** captured → developing → ready; AI suggestions from Brand Brain, the season and real gaps; open one in AI Studio.

## 4. Data model
`effy_marketing_plans` (per workspace: source onboarding|marketing_plan, month, `inputs` it was written from, `plan` — `format: "sostac"` since 6.18, with `accepted` once accepted), `effy_workspaces.brand_kind` + `effy_workspaces.brief` (6.17: `goal {metric, target}`, `offer`, `customer`, `budget`, `capacity`, `website`, `updatedAt`), `effy_competitors`, `effy_ideas`.

## 5. Connections
- The plan's pillars, channels (posts a week), ideas and KPIs feed **Fill gaps** on the Calendar and each **campaign's workspace** (pillar, KPIs, channels).
- *Accept plan* creates the plan's campaigns as drafts in **Campaigns** (name, objective, channels, pillar, budget, start and end from the plan's weeks).
- The Situation and the weekly check count **posts** published through EffySocial, the **lead pipeline** (and WhatsApp leads), **lead outcomes** (purchase and appointment completed), **Instagram** (followers, reach, interactions), recorded campaign spend, connected channels, Brand Brain and competitors.
- Onboarding fills the first workspace's brief (the first measurable goal, the website) while onboarding is under way, and sets each workspace's kind from the profile.
- The brief's website is read into that workspace's Brand Brain when a plan is written — an agency's own site never reaches a client.
- Trends and competitor angles feed AI Studio's context rail.

## 6. AI involvement
Groq writes the plan on SOSTAC from the brief in words (kind — a personal brand is written in the person's voice — goal and target, or a request to suggest one; offer; customer; budget or *organic only*; capacity; website; connected channels; season), Brand Brain and its documents, and the workspace's counted numbers with today's baseline for the goal. It is told to use only those numbers, never to invent statistics, results, prices, testimonials or competitor figures, and to make the first KPI the objective itself. The output is normalised (3–5 pillars adding to 100%, known channels only, up to 12 ideas, budget rows scaled to add up exactly to the brief's budget, up to 3 campaigns within the four weeks with a known objective and the plan's own channels) and the cadence is cut to the team's capacity, every channel keeping at least one post a week when there's room; an unusable answer is refused (503) and nothing is stored. The numbers, the baseline, the target when the brief sets one, and the weekly plan are the engine's, never the model's.

## 7. Integrations
Connected channels are named to the plan. Trends' themes come from Brand Brain or general guidance. Social Listening reads the connected Instagram account through Graph v25 (`listening.py`, needs `instagram_manage_comments`); mentions anywhere else need a provider (6.13).

## 8. States
No brief goal (generate disabled, the brief lists what's missing) · no plan yet · writing (under a minute) · plan on SOSTAC · accepted · an older plan (its own layout, with a note) · a week's goal not measurable (*not measured*, and why) · the four weeks over (*write a new plan*) · refused (503, try again) · too many plans this hour (429) · read-only role (sees, can't write or accept).

## 9. Backend contract (built)
`GET /marketing-plan` → `{plan, progress, brief, briefOptions}`, `PUT /marketing-plan/brief`, `POST /marketing-plan` → `{plan, progress}` (400 `brief_needed` without a goal), `POST /marketing-plan/<id>/accept` → `{plan, campaigns}`, trends, competitors, ideas — see [API.md](../API.md). Tests: `test_effy_sostac.py`, `test_effy_brief.py`, `test_effy_onboarding.py`, `test_effy_strategy.py`, `sostac.test.jsx`, `planBrief.test.jsx`, `MarketingPlan.test.jsx`, `e2e-film/sostac.spec.js`, `e2e-film/brief.spec.js`, `e2e-film/onboarding.spec.js`.

## 10. Open questions / TODO
- Calls can't be counted yet (no call tracking), so a *Phone calls* goal has no baseline or weekly actual.
- Reach per week needs Instagram's daily reach series; engagement per week counts only posts whose Instagram numbers have been read.
- Social Listening: sentiment and intent (part 2); mentions beyond the connected account need a data source (6.13). Tests: `test_effy_listening.py`, `SocialListening.test.jsx`.
