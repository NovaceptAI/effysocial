# EffySocial — Build Tracker

Living status of every module/screen. **Update the Status column as we build.**
- Requirements source of truth: [EffySocial_Claude_Design_Prompt.md](EffySocial_Claude_Design_Prompt.md)
- Architecture & phasing: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- **Per-module contracts (what each does + backend spec): [docs/modules/](docs/modules/README.md)** — created during frontend, obeyed during backend.

**Status:** ✅ done · 🔨 in progress · ⬜ pending · 🧩 partial (stub/placeholder present) · 🔌 needs backend to be "real"
**Mode:** frontend is mock-first; backend wired **module-by-module**. Real so far: auth/tenancy/email, Campaigns, Brand Brain. 🔌 marks screens still on the mock layer awaiting their backend.

---

## Foundation (Phase 0)
| Item | Status | Notes |
|---|---|---|
| Bright Studio design tokens (theme.css + tailwind) | ✅ | coral/cream + charcoal rail |
| UI primitive kit (`src/ui`) | ✅ | Button, Card, Badge, MetricCard, Tabs, StatusBadge, Pacing, EmptyState, PageHeader |
| App shell — nav rail | ✅ | collapsible groups, badges, phase tags |
| App shell — top bar | ✅ | workspace switcher, search, create, AI, notifications, profile |
| App shell — command palette (⌘K) | ✅ | cmdk; quick actions, switch workspace, go-to |
| App shell — contextual right panel | ⬜ | spec §5.3 (AI recs / details / comments) |
| Mock data + WorkspaceContext | ✅ | 6 sample clients, INR helpers |
| Marketing landing (`/`) | ✅ | hero + journey + features + CTA; Log in / Get started |
| Login (`/login`) | ✅ 🔌 | split screen; mock client-side auth gate on `/app` (real auth later) |
| Onboarding (7 steps) | ✅ 🔌 | `/onboarding` — org→details→goals→connect→brand→invite→first plan |
| Workspace selection screen | ✅ | `/app/workspaces` grid + top-bar switcher |
| Demo tools Hub | ✅ | moved to `/tools` |

## Overview (spec §7)
| Screen | Route | Status | Notes |
|---|---|---|---|
| Business overview | `/app` | ✅ | AI summary, metrics, chart, leads, alerts |
| Agency overview | `/app` (agency orgs) | ✅ | org-wide rollup: spend/leads/approvals/alerts + client health + attention list; toggle to client view |
| Social manager overview | — | ⬜ | §7.3 |
| Performance marketer overview | — | ⬜ | §7.4 |

## Strategy (spec §9)
| Screen | Route | Status | Notes |
|---|---|---|---|
| Marketing Plan | `/app/plan` | ✅ 🔌 | pillars planned-vs-actual, split, themes, KPIs, budget, risks |
| Campaigns list | `/app/campaigns` | ✅ | pacing, CPL, ROAS (backend-real) |
| Campaign workspace | `/app/campaigns/:id` | ✅ 🔌 | funnel overview + 8 tabs (Overview built; others stubbed) |
| Trends | `/app/trends` | ✅ P4 | **backend-real**: gaps computed from real posts; feeds Studio |
| Competitors | `/app/competitors` | ✅ P4 | **backend-real** SOV + benchmark; feeds Studio angles |
| Social Listening | `/app/listening` | ✅ 🔌 | sentiment + trend + live mentions + intent → lead |

## Content (spec §10)
| Screen | Route | Status | Notes |
|---|---|---|---|
| Ideas board | `/app/ideas` | ✅ 🔌 | kanban w/ 5 stages, quick-add, stage moves, convert→Studio |
| AI Studio — copy | `/app/studio` | ✅ | 3-panel; **real Groq generation grounded in Brand Brain** + computed scores |
| AI Studio — visual | `/app/studio` | ✅ 🔌 | visual tools + links to Lip Sync / Photo / image-gen |
| Media Library | `/app/media` | ✅ 🔌 | filterable grid, tags, usage, rights/expiry |
| Templates | `/app/templates` | ✅ 🔌 | gallery, categories, brand-locked, dynamic fields → Studio |
| Brand Brain | `/app/brand` | ✅ 🔌 | knowledge centre; real RAG later |

## Publish (spec §11)
| Screen | Route | Status | Notes |
|---|---|---|---|
| Calendar (month/list) | `/app/calendar` | ✅ 🔌 | month grid + list; drag-drop later |
| Scheduled | `/app/scheduled` | ✅ 🔌 | filterable list |
| Approvals inbox + detail | `/app/approvals` | ✅ 🔌 | queue + detail + stage bar + comments |
| Published | `/app/published` | ✅ 🔌 | metrics + repurpose/create-ad/retry |

## Engage (spec §12)
| Screen | Route | Status | Notes |
|---|---|---|---|
| Unified Inbox + conversation | `/app/inbox` | ✅ 🔌 | 3-pane, queues, AI reply, convert-to-lead |
| Comments | `/app/comments` | ✅ 🔌 | comments/mentions feed + AI reply preview → inbox |
| Reviews | `/app/reviews` | ✅ 🔌 | distribution + feed + AI replies |
| Leads (in Engage) | `/app/engage-leads` | ✅ 🔌 | sales-intent convos + needs-action → pipeline handoff |

## Advertise (spec §13 · Phase 2–3)
| Screen | Route | Status |
|---|---|---|
| Ad dashboard / Campaigns | `/app/ads` | ✅ P2 | KPIs + spend/leads chart + campaign→adset→ad drill-down; mock adapter, honest banner |
| Creatives | `/app/creatives` | 🧩 P2 |
| Audiences | `/app/audiences` | 🧩 P3 |
| Budgets | `/app/budgets` | 🧩 P3 |
| Automated Rules | `/app/rules` | 🧩 P3 |
| Campaign creation wizard | `/app/launch` | ✅ P4 | Campaign Launch playbook: basics→content→landing+form→launch, real assembly checklist |

## Convert (spec §14 · Phase 2)
| Screen | Route | Status |
|---|---|---|
| Landing Pages + builder | `/app/landing` | ✅ P2 | section editor (hero/features/testimonial/CTAs) + AI copy + publish + hosted `/p/:slug` w/ views + embedded form → leads w/ UTM |
| Forms + builder | `/app/forms` | ✅ P2 | list + field editor + publish + share `/f/:slug`; submissions → leads w/ UTM |
| Link-in-bio | `/app/bio` | ✅ P2 | profile/theme/socials/links editor + publish + hosted `/b/:slug` w/ views + per-link click analytics + form → leads w/ UTM |
| Lead Pipeline | `/app/pipeline` | ✅ P2 | kanban+table, stage moves, add lead, value totals; Inbox/EngageLeads convert wired |
| Lead detail | `/app/pipeline/:id` | ✅ P2 | attribution (campaign/form+UTM/conversation), duplicates, follow-up runs, notes, §14.7 outcomes → mock offline-conversion signals |
| Follow-ups (workflow builder) | `/app/followups` | ✅ P2 | trigger/condition/delay/action blocks, activate/pause, dry-run preview, per-lead run log; fires on lead create + stage change (mock messaging) |
| Conversion Tracking Centre | `/app/tracking` | ✅ P2 | source diagnostics (status/events/match quality/dupes/consent) + test-event tool + UTM coverage + domain + fix recs |

## Analytics (spec §15)
| Screen | Route | Status |
|---|---|---|
| Organic | `/app/analytics/organic` | ✅ 🔌 P1 | KPIs, growth/reach charts, what's-working, top posts, demographics, best-times heatmap |
| Advertising | `/app/analytics/ads` | ✅ P2 | channel comparison (spend/leads chart + CPL/CTR/ROAS scorecard) + per-campaign spend pacing w/ near-cap flags |
| Leads | `/app/analytics/leads` | ✅ P2 | real-pipeline KPIs, stage funnel, by source/campaign, quality mix, outcomes, lost reasons |
| Revenue | `/app/analytics/revenue` | ✅ P2 | attributed revenue (won + purchase-completed), CAC/ROAS off adapter spend, by channel/campaign (last-touch) |
| Creative performance | `/app/analytics/creative` | ✅ P2 | attribute analysis (best format, avg CTR, fatigue count) + sortable creative cards (CTR/CPL/spend) |
| Reports list + builder + client view | `/app/reports` | ✅ 🔌 P1 | saved list + builder w/ sections, white-label, AI summary, PDF/share |

## Administration (spec §17)
| Screen | Route | Status |
|---|---|---|
| Clients | `/app/clients` | ✅ | table + card |
| Team & permissions | `/app/team` | ✅ 🔌 | members + roles + invite |
| Integrations | `/app/integrations` | ✅ 🔌 | categories + health states + reconnect/troubleshoot |
| Billing | `/app/billing` | ✅ 🔌 | plan, usage meters (AI credits/posts/seats), invoices |
| Settings | `/app/settings` | ✅ 🔌 | notifications, density, locale, security (2FA soon) |
| Notification centre | ✅ | bell dropdown: real Effy recommendations + pending-approvals count |

## AI & cross-cutting
| Item | Status | Notes |
|---|---|---|
| Effy AI assistant (persistent) | ✅ | right-drawer panel: agent-routed grounded chat + §3.3 recommendations |
| 8 AI agents | ✅ (v1) | deterministic router → 8 agent personas over live data; autonomous actions/apply-preview later |
| Required states everywhere (§19) | 🧩 | EmptyState in use; full matrix pending |
| Mobile approvals / lead follow-up | ⬜ | §20 |
| White-label | ⬜ | §17.4 |

---

## Backend (novalab-engine) — started
All additive + namespaced `effy_*` / `/api/effy/*`. No existing tables/tools touched.
| Item | Status |
|---|---|
| Auth + accounts (EffySocial-native) | ✅ login/register/logout/me, werkzeug hashing, `effy_uid` session |
| Email verification + password reset | ✅ tokens table, verify/resend/forgot/reset endpoints, provider-agnostic email (Resend/SMTP/dev-log), /verify /forgot /reset pages + in-app banner |
| Tenancy (org/workspace/membership) | ✅ tables + migration `ec89ceaca3ad` (additive) + seed script |
| `/api/effy` blueprint + nginx proxy + bootstrap | ✅ live & verified via public domain |
| Frontend wired to real auth | ✅ AppAuth → `/api/effy`; RequireAuth gates `/app` |
| Real workspaces in app (bootstrap → WorkspaceContext) | ✅ enriched w/ mock metrics for not-yet-migrated modules |
| Campaigns — real persistence | ✅ effy_campaigns table + `/api/effy/campaigns` (list/get/create), org-ownership enforced, seeded; frontend on TanStack Query |
| Brand Brain — real persistence + grounded gen | ✅ effy_brand_facts/sources + `/api/effy/brand` (get/fact/source/test); default template overlaid with edits; **Groq-grounded test voice** live; RAG-over-docs pending embedder |
| AI Studio — real generation | ✅ `/api/effy/studio/generate` — Groq copy grounded in Brand Brain + **real computed creative scores**; frontend Generate wired |
| Publish — real persistence | ✅ effy_posts + `/api/effy/posts` (list/create/approve/request-changes/comment/schedule); Calendar/Scheduled/Approvals/Published on live data with **working approve/retry/comment actions** |
| Engage — real persistence | ✅ effy_conversations + effy_reviews + reply/close/respond endpoints; Inbox/Comments/EngageLeads/Reviews live with **working reply & respond** |
| Effy AI — assistant runtime | ✅ `/api/effy/assistant/chat` + `/recommendations`; grounded chat verified with real numbers |
| Leads (Convert) — real persistence | ✅ effy_leads + `/api/effy/leads` (list/create/patch) + convert-from-conversation (idempotent, attributed) |
| Lead detail + outcomes — closed loop (§14.7) | ✅ `GET /leads/:id` (attribution, duplicates, follow-up runs, offline signals) + PATCH outcome → note + mock offline-conversion `effy_tracking_events` row (real Meta/Google uploads Phase 3) |
| Forms — real persistence + public capture | ✅ effy_forms/submissions + authed CRUD + public GET/submit (honeypot, UTM → lead) + hosted `/f/:slug` page |
| Landing pages — real persistence + public page | ✅ effy_landing_pages + authed CRUD + Groq AI copy (Brand-Brain-grounded) + public GET w/ view counting + hosted `/p/:slug` page (embedded form reuses Forms flow) |
| Conversion Tracking Centre — live diagnostics | ✅ effy_tracking_events + `/api/effy/tracking` (native sources computed from real forms/landing/leads data; pixels via mock adapter) + test-event tool |
| Follow-up automation — engine + runs | ✅ effy_followup_workflows/runs + `/api/effy/followups` CRUD/runs/dry-run; synchronous engine hooked into lead create/convert/stage-change + form submit; messaging via mock adapter until Phase 3 |
| Organic Analytics — real endpoint | ✅ `/api/effy/analytics/organic` — top posts/reach aggregate real post metrics; series flagged `derived` until channel sync |
| Analytics expansion — leads/revenue/creative | ✅ `/api/effy/analytics/leads|revenue|creative` — lead/revenue aggregate real `effy_leads` (funnel, source/campaign rollups, last-touch revenue, CAC/ROAS); creative + spend via ads adapter (`spendProvider:"mock"` until Phase 3) |
| RBAC enforcement | ✅ View-only = read-only; Client approver = approval actions only; enforced on every write endpoint |
| Other module data endpoints (Brand Brain, Publish, Engage, Analytics) | ⬜ (still mock-derived off real workspace) |
| Integration-adapter layer (mock→real providers) | ✅ (v1) AdsManager: MockAdsProvider live behind `get_ads_provider()`; Meta/Google implement same interface in Phase 3 |
| AI agent runtime (Groq + Brand Brain RAG via pgvector) | ⬜ |
| Celery jobs / webhooks | ⬜ |

## Testing
Suite lives in `novalab-engine/tests/` · run: `PYTHONPATH=. myenv/bin/pytest tests/ -q`
| Area | Status |
|---|---|
| Auth (register/login/logout/me + failure modes) | ✅ `test_effy_auth.py` |
| Token flows (verify/reset, one-time use, expiry) | ✅ `test_effy_tokens.py` |
| **Tenancy security** (401 unauth, cross-org 404 on every scoped endpoint) | ✅ `test_effy_tenancy.py` |
| Campaigns / Brand Brain / Studio contracts (Groq mocked; scores computed) | ✅ `test_effy_campaigns_brand_studio.py` |
| Publish/Engage/Analytics contracts (pipeline stages, reply flows, aggregation) | ✅ `test_effy_publish_engage.py` |
| Effy AI (router, grounding, rec rules, severity) | ✅ `test_effy_assistant.py` |
| RBAC (view-only blocked, approver approval-only, writers pass) | ✅ `test_effy_rbac.py` |
| Leads (CRUD, stages, convert idempotency+attribution, RBAC) | ✅ `test_effy_leads.py` |
| Forms (publish gate, public submit→lead+UTM, honeypot, validation) | ✅ `test_effy_forms.py` |
| Ads adapter (determinism, shape, realistic-range guards) | ✅ `test_effy_ads.py` |
| Landing pages (CRUD, publish gate, view counting, form embed, AI copy mocked) | ✅ `test_effy_landing.py` |
| Tracking Centre (diagnostics from real data, UTM coverage, recs, test-event) | ✅ `test_effy_tracking.py` |
| Follow-ups (CRUD/validation, trigger matching, engine side effects, dry-run) | ✅ `test_effy_followups.py` |
| Lead detail (attribution, duplicates, runs, outcome marking + signals) | ✅ `test_effy_leads.py` |
| Link-in-bio (CRUD, publish gate, public payload, click tracking, form gating) | ✅ `test_effy_bio.py` |
| Analytics expansion (lead funnel/rollups, revenue attribution, creative flatten) | ✅ `test_effy_analytics.py` |
| Live external smoke (Groq key/gen, API health) — opt-in `RUN_SMOKE=1` | ✅ `test_smoke_external.py` |
| Frontend (Vitest) | ⬜ later |

**Rule going forward: every new backend slice ships with its tests** (add cases to the tenancy matrix + a contract file per module).

_Last updated: **PHASE 2 COMPLETE** — all P1 screens real, 8 backend modules live (auth/tenancy/email, Campaigns, Brand Brain, AI Studio, Publish, Engage, Analytics, Effy AI), RBAC enforced, agency overview + notifications + workspace-select shipped. Right context panel partially covered by the Effy drawer. Phase 2 slices 1–9 shipped (Lead Pipeline, Forms, Ad Dashboard + adapter pattern, Landing Pages, Tracking Centre, Follow-up Automation, Lead Detail + outcomes, Link-in-bio, Analytics expansion: Ads/Leads/Revenue/Creative), 149 tests green. Next: Phase 3 — real integrations (Meta/Google ads, social publishing, messaging) through the existing adapters._
