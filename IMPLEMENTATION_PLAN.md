# EffySocial — Full Product Implementation Plan

_Status: approved. Building Phase 0 + Phase 1._

## Locked decisions
- **Look:** Bright Studio (coral `#e84a33` / light coral `#ff6b5e` / cream) + **warm-charcoal left nav rail** on a light canvas. Dark mode in a later phase. (Overrides the design prompt's indigo suggestion.)
- **Frontend:** React 19 + Vite + **Tailwind v3** (preflight disabled to protect existing pages) + Radix/shadcn-style primitives + **Recharts** + **TanStack Query/Table** + `cmdk` + `dnd-kit`, all themed to Bright Studio tokens.
- **Backend:** extend **novalab-engine** (Flask) — new blueprints + tables; reuse Postgres, Celery/Redis, **pgvector**, and existing AI integrations.
- **Strategy:** **mock-first** behind an integration-adapter layer + seeded realistic sample data; real Meta/Google/LinkedIn/WhatsApp OAuth phased in.

## App placement
- Marketing landing stays at `/`. Authenticated product at `/app/*` (one SPA, code-split per module).
- Existing demo tools fold in: Media Creator→AI Studio · Campaign Generator→Strategy/Content · Lip Sync + Leadership Photo→Creative tools · AI Caller→AI voice-callback follow-up.

## Org-type canon (2026-07-02)
business = one brand · freelancer = multiple own brands (no client semantics, no agency chrome) · agency = clients-as-workspaces with full agency chrome. Influencers/managers = invited memberships with roles, never org types.

## Tenancy & object graph
`Organization` → `Workspace` (brand or agency client) → `Membership` (user × workspace × role). Every row workspace-scoped.
`Campaign` is the hub object: `Campaign ↔ ContentItem ↔ Ad/Creative ↔ Lead ↔ Conversion/Revenue`.

## Integration-adapter layer (mock-first)
Provider interfaces per category — `SocialPublisher`, `AdsManager`, `MessagingProvider`, `AnalyticsProvider`, `CRM` — each with a `MockProvider` (seeded) and real impl. The app calls a service layer that picks mock vs real by the workspace's integration status.

## AI agent runtime
Shared runtime (Groq, optional Claude). Agents: Strategy, Content, Creative, Publishing, Community, Performance, Analytics, Client-Reporting. Output = citations + recommendation (detected / why / action / expected impact / confidence / needs-approval). RAG over Brand Brain via pgvector.

## Phases
- **Phase 0 — Foundations:** stack + theme + component library, app shell (rail/top-bar/right-panel/command palette), routing, auth + multi-tenancy + RBAC, workspace switcher, onboarding skeleton, seed/sample-data system, integration-adapter framework (mock), notifications scaffold.
- **Phase 1 — Organic product:** Brand Brain (RAG), Strategy (Marketing Plan, Pillars, Campaign workspace, Trends, Competitors, Social Listening), Content (Ideas, AI Studio, Media Library, Templates), Publish (Calendar, Scheduled, Approvals, Published), Engage (Inbox, Comments, Reviews, Leads), Organic Analytics + Reports + client portal, agents.
- **Phase 2 — Performance Marketing Starter:** ad connect (read-only), brief builder, ad variants, UTM, landing pages, forms, lead inbox/pipeline, WhatsApp follow-up, Tracking Centre, CPL/ROAS reporting.
- **Phase 3 — Campaign Execution:** real Meta/Google campaign create/manage, budgets, audiences, automated rules, creative tests, offline conversions.
- **Phase 4 — Advanced Intelligence:** attribution, creative analysis, predictive lead quality, forecasting, anomaly detection, optimization (behind "requires data/beta/enterprise").

## Cross-cutting (every phase)
Component library (§22) · all required states (§19) with recovery actions · accessibility · notifications (in-app/email/WhatsApp) · billing + AI credits (Razorpay INR + Stripe) · audit/security (2FA, logs) · mobile view/approve/light-edit · white-label.

## Sequencing
Indicative: Phase 0 ≈ 2–3 sprints · Phase 1 ≈ 6–8 · Phase 2 ≈ 4–5 · Phase 3 ≈ 4–6 · Phase 4 ongoing.
**Sprint 1 (now):** Tailwind+theme, app shell, routing, tenancy/workspace switcher (mock), seed data, Business + Agency Overview. Backend auth/tenancy tables follow once the shell is validated.

## Secondary decisions (defaults)
EffySocial-native auth (optional SSO bridge later) · marketing `/`, product `/app/*`, same repo · WhatsApp = Meta Cloud API · Billing = Razorpay + Stripe · backend in novalab-engine.
