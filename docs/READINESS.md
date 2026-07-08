# EffySocial — Real-Data Readiness Audit

_Cleanup date: 2026-07-08. Goal: no mock data anywhere; every module accepts
real user-entered data; integrations gate what needs a channel._

## 1. Database — CLEAN ✅
All demo/test accounts and seeded rows deleted (demo agency + 6 demo workspaces,
3 test accounts, experiment rows). Remaining: the real admin account only.
Every `effy_*` content table is at 0 and ready for user-entered rows.
(Seed scripts remain in `novalab-engine/scripts/` if a demo env is ever needed.)

## 2. Integration-first UX ✅ (v1)
- Fresh workspaces now show a persistent **"Connect your channels"** banner
  (whole app, until ≥1 integration is connected) → `/app/integrations`.
- Integrations page is real: connect (OAuth or IG token), disconnect, honest
  `pending_credentials` with setup steps. Connection state stored in
  `effy_integrations` (encrypted tokens).
- `WorkspaceContext` no longer invents metrics (channels/spend/leads/health
  default to honest zeros).

## 3. Module readiness — real vs still-mock

### ✅ Backed by real DB + create flows (ready for user data now)
| Module | Store | Create flow |
|---|---|---|
| Auth / org / workspaces | effy_users/orgs/workspaces/memberships | register/onboard |
| Campaigns (+ assembly/launch) | effy_campaigns | Campaigns page + `/app/launch` wizard |
| Brand Brain | effy_brand_facts/sources | section editors (facts persist) |
| AI Studio (copy/image/refine/scores) | — (generates) → posts | full flow; Send-to-approval → effy_posts |
| Publish (Calendar/Scheduled/Approvals/Published) | effy_posts | Studio → approval; approve/schedule actions |
| Leads pipeline + detail | effy_leads | add lead; convert-from-conversation; form submits |
| Forms (+ public /f/) | effy_forms/_submissions | builder + publish + public submit → lead |
| Landing pages (+ public /p/) | effy_landing_pages | builder + AI copy + publish |
| Link-in-bio (+ public /b/) | effy_bio_pages | builder + publish + click tracking |
| Follow-ups | effy_followup_workflows/runs | builder; triggers on lead events |
| Tracking Centre | effy_tracking_events | test-event + outcome signals |
| Strategy: Trends/Competitors | derived/sample (flagged) | reads real posts for gaps |
| Effy AI assistant | reads live workspace data | — |
| Integrations | effy_integrations | connect/disconnect/OAuth |

### 🔌 Still mock on the frontend (rework queue — in priority order)
| Page | Mock imports | What "real" needs |
|---|---|---|
| **Overview** | overviewMetrics, trendSeries, UPCOMING_CONTENT, ATTENTION_LEADS, ALERTS | derive all from real posts/leads/campaigns + recommendations; empty states for fresh accounts |
| **Engage: Inbox/Comments/Reviews data** | (API real, but tables now empty) | need channel sync (Meta/Google APIs) to fill — gated on integrations |
| **CampaignWorkspace funnel** | campaignFunnel | compute from campaign KPIs + linked children |
| **Reports** | savedReports, templates, metrics | persist reports; build from real analytics |
| **Ideas** | ideasFor | effy_ideas table + CRUD (small) |
| **MarketingPlan** | marketingPlan | effy_plans table + editor |
| **MediaLibrary** | mediaFor | persist generated/uploaded assets (S3 exists) |
| **Templates** | templatesFor | static gallery is acceptable v1; brand-lock later |
| **SocialListening** | listening | needs external listening provider — Phase later |
| **Team** | TEAM, ROLES | list real memberships + invite flow (backend partial) |
| **Billing** | plan/usage stubs | wire to PRICING plans + usage metering |
| Harmless constants (not mock data) | BrandBrain SECTIONS, Calendar TODAY, Scheduled CHANNELS, Ideas IDEA_STAGES, AIStudio brandBrainFor(fallback) | keep |

## 4. Credentials — what's needed for fully-real data

### ✅ Present (engine .env)
GROQ (AI) · META_APP_ID/SECRET (IG/FB/Ads dev-mode) · LINKEDIN_CLIENT_ID/SECRET ·
CLOUDFLARE (images) · POLLINATIONS_API_KEY · AWS/S3 · SECRET_KEY · DATABASE_URL

### ❌ Missing — blocks real user-facing behaviour
| Credential | Unlocks | How to get |
|---|---|---|
| ✅ **RESEND_API_KEY** — SET & delivering | Real verification/reset emails now send (tested, delivered). Email gate LIVE: bad/disposable/nonexistent-domain rejected at signup; unverified users blocked from login. | **Done.** ⚠️ Using Resend TEST sender (`onboarding@resend.dev`) → can only email the Resend account owner (novaceptai@gmail.com). **To email real customers: verify `effybiz.in` at resend.com/domains (add SPF/DKIM DNS), then set `EFFY_EMAIL_SENDER=EffySocial <noreply@effybiz.in>`.** Until then, external signups fall back to the dev-link. |
| **EFFY_EMAIL_SENDER** | From-address for those emails | e.g. `EffySocial <noreply@effybiz.in>` (domain must be verified with the provider) |
| **GOOGLE_ADS_CLIENT_ID/SECRET** | Google OAuth (Ads, GA4, Business Profile) | Google Cloud Console OAuth client |
| **GOOGLE_ADS_DEVELOPER_TOKEN** | Google Ads data | apply in Google Ads account (basic-access review) |
| **WHATSAPP_WABA_ID** | WhatsApp Cloud API messaging | WABA in Meta Business Manager |
| **EFFY_BASE_URL** (optional) | explicit public base for links | defaults to https://effysocial.effybiz.in |
| Meta **App Review** (not a key) | IG/FB for *other* users' accounts (beyond dev-mode admins) | submit scopes for review |

## 5. Next steps (module-by-module, with the user)
1. **Overview → real** (derive metrics; fresh-account empty states) — most visible.
2. **Email**: add SMTP/Resend key → flip verification to real sends.
3. **Team**: real members list + invites.
4. **Ideas / MarketingPlan / Reports / MediaLibrary**: small tables + CRUD each.
5. **Channel sync** (needs Meta review/Google creds): fill Inbox/Reviews/analytics with real platform data.
