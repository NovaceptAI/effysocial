# EffySocial API Reference (live)

The **implemented** backend endpoints. Base: `/api/effy` (proxied by nginx on
effysocial.effybiz.in → Flask `novalab-engine`). Auth is a signed session
cookie (`effy_uid`). Update this file whenever an endpoint ships.

Legend: 🔓 no auth · 🔒 requires session · 🏢 org-ownership enforced

## Auth & tenancy  ([Auth-Landing.md](modules/Auth-Landing.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/health` | 🔓 | → `{status, service}` |
| POST | `/api/effy/auth/register` | 🔓 | `{email, password, name?, orgName?, orgType?, industry?, location?}` → bootstrap + `{email_sent, dev_link?}`; logs in |
| POST | `/api/effy/auth/login` | 🔓 | `{email, password}` → bootstrap · 401 on bad creds |
| POST | `/api/effy/auth/logout` | 🔓 | → `{status}` |
| GET | `/api/effy/auth/me` | 🔒 | → `{user:{id,name,email,email_verified}}` |
| GET | `/api/effy/bootstrap` | 🔒 | → `{user, org, role, workspaces[]}` |
| GET | `/api/effy/workspaces` | 🔒 | → same as bootstrap |

### Email verification & password reset
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/auth/verify` | 🔓 | `{token}` → `{status}` · 400 invalid/expired |
| POST | `/api/effy/auth/resend-verification` | 🔒 | → `{status, email_sent, dev_link?}` |
| POST | `/api/effy/auth/forgot` | 🔓 | `{email}` → `{status, dev_link?}` (always ok) |
| POST | `/api/effy/auth/reset` | 🔓 | `{token, password}` → `{status}` · 400 invalid/expired |

**Bootstrap shape:** `{ user:{id,name,email,email_verified}, org:{id,name,type,plan}, role, workspaces:[{id:"ws_N", dbId, name, industry, location, logo, accent}] }`

## Campaigns  ([Campaigns.md](modules/Campaigns.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/campaigns?workspace=ws_N` | 🔒🏢 | → `{campaigns:[...]}` |
| GET | `/api/effy/campaigns/:id` | 🔒🏢 | → `{campaign:{...}}` · 404 if not in your org |
| POST | `/api/effy/campaigns` | 🔒🏢 | `{workspace, name, objective?, status?, channels?, budget?, ...}` → `{campaign}` |

**Campaign shape:** `{ id, workspaceId:"ws_N", name, objective, status, owner, pillar, channels[], start, end, budget, spent, kpis:{impressions,clicks,leads,qualified,customers,revenue,cpl,roas,ctr}, counts:{content,ads,landingPages,forms}, recommendations }`

## Brand Brain  ([Brand-Brain.md](modules/Brand-Brain.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/brand?workspace=ws_N` | 🔒🏢 | → `{brain}` — default template overlaid with stored facts + sources |
| POST | `/api/effy/brand/fact` | 🔒🏢 | `{workspace, section, data, status?, sources?, kind?}` → `{status}` (upsert per section) |
| POST | `/api/effy/brand/source` | 🔒🏢 | `{workspace, name, type?, ref?, confidence?}` → `{source}` |
| POST | `/api/effy/brand/test` | 🔒🏢 | `{workspace, prompt}` → `{output, cited[]}` — Groq generation grounded in the workspace's tone/approved/prohibited facts |

**Brain shape:** `{ completeness, needsReview, lastUpdated, <section>:{status, sources[], data} }` where sections = summary, tone, approved, prohibited, products, offers, personas, faqs, objections, competitors, visual, legal, sources. `data` shape varies by section kind (paragraph/chips/list/personas/faqs/visual/sources).

## AI Studio  ([AI-Studio.md](modules/AI-Studio.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/studio/generate` | 🔒🏢 | `{workspace, type, topic, language?}` → `{caption, hook, cta, hashtags[], scores[], cited[], platform}` |

Grounded in the workspace's Brand Brain (tone/approved/prohibited). `type` ∈ {ig_post, ig_carousel, ig_reel, fb_post, li_post, x_post, yt_short, wa_promo}. **Scores are computed** (brand alignment, hook, CTA, platform fit, readability, ad-policy risk) each with a `note` and `invert` flag — real, explainable, not fabricated.

## Publish  ([Calendar-Approvals.md](modules/Calendar-Approvals.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/posts?workspace=ws_N` | 🔒🏢 | → `{posts:[...]}` |
| POST | `/api/effy/posts` | 🔒🏢 | `{workspace, title, channel?, type?, status?, date?, time?, caption?, campaignId?}` → `{post}` |
| POST | `/api/effy/posts/:id/approve` | 🔒🏢 | advances draft→internal_review→client_review→approved · 400 past approved |
| POST | `/api/effy/posts/:id/request-changes` | 🔒🏢 | `{comment}` → back to draft + comment appended |
| POST | `/api/effy/posts/:id/comment` | 🔒🏢 | `{text}` → comment appended |
| POST | `/api/effy/posts/:id/schedule` | 🔒🏢 | `{date?, time?}` → scheduled (only from approved/failed; failed retry clears error) |

**Post shape:** `{ id, workspaceId, campaignId?, title, channel, type, status, date, time, assignee, caption, metrics?, comments[], error }` · statuses: idea/draft/internal_review/client_review/approved/scheduled/published/failed.

## Engage  ([Engage-Inbox.md](modules/Engage-Inbox.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/conversations?workspace=ws_N` | 🔒🏢 | → `{conversations:[...]}` |
| POST | `/api/effy/conversations/:id/reply` | 🔒🏢 | `{text}` → message appended, unread cleared |
| POST | `/api/effy/conversations/:id/close` | 🔒🏢 | → status closed |
| GET | `/api/effy/reviews?workspace=ws_N` | 🔒🏢 | → `{reviews:[...]}` |
| POST | `/api/effy/reviews/:id/respond` | 🔒🏢 | → responded=true |

## Analytics
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/effy/analytics/organic?workspace=ws_N` | 🔒🏢 | `{provider:"derived", kpis, followerSeries, reachSeries, topPosts, demographics, bestTimes, insights}` |

Top posts + reach/engagement KPIs **aggregate real `effy_posts` metrics**; series/demographics are deterministic derived values (flagged `provider:"derived"`) until social integrations sync real snapshots.

## Effy AI  ([Effy-AI.md](modules/Effy-AI.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/assistant/chat` | 🔒🏢 | `{workspace, message, history?}` → `{reply, agent, citations[], actions[{label,route}]}` · 400 no message · 503 Groq down |
| GET | `/api/effy/assistant/recommendations?workspace=ws_N` | 🔒🏢 | → `{recommendations:[{id, agent, severity, title, detected, why, action, impact, confidence, needsApproval, route}]}` |

Chat: deterministic keyword router picks one of 8 agents; the Groq reply is grounded ONLY in a live snapshot of the workspace (campaigns w/ KPIs, post pipeline, open conversations, unanswered reviews, brand tone) — inventing numbers is forbidden in the prompt. Recommendations are **rule-based detections** (budget pacing >90%, CPL >₹400, failed publishes, open complaints, negative reviews, calendar gaps) shaped per spec §3.3; spend-affecting ones carry `needsApproval:true` (§3.4).

## Convert — Leads  ([Convert-Leads.md](modules/Convert-Leads.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/leads?workspace=ws_N` | 🔒🏢 | → `{leads:[...]}` |
| POST | `/api/effy/leads` | 🔒🏢 write-role | `{workspace, name, phone?, email?, source?, campaignId?, interest?, value?, quality?}` → `{lead}` |
| PATCH | `/api/effy/leads/:id` | 🔒🏢 write-role | `{stage?, quality?, value?, owner?, lostReason?, note?}` → `{lead}` · 400 invalid stage |
| POST | `/api/effy/conversations/:id/convert-lead` | 🔒🏢 write-role | → `{lead, existing}` — idempotent; copies person/channel/interest, sales-intent → hot |

**Lead shape:** `{ id, workspaceId, campaignId?, conversationId?, name, phone, email, source, channel, interest, stage, quality, value, owner, notes[], lostReason, created }` · stages: new/contacted/qualified/appointment/proposal/won/lost.

## Convert — Forms  ([Convert-Forms.md](modules/Convert-Forms.md))
Authed:
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/forms?workspace=ws_N` | 🔒🏢 | → `{forms[]}` (with submission counts) |
| POST | `/api/effy/forms` | 🔒🏢 write-role | `{workspace, name, type?, fields?, campaignId?, consent_text?, thankyou?}` → `{form}` (slug generated) |
| PATCH | `/api/effy/forms/:id` | 🔒🏢 write-role | `{name?, fields?, status?, consent_text?, thankyou?, campaignId?}` → `{form}` |
| GET | `/api/effy/forms/:id/submissions` | 🔒🏢 | → `{submissions[]}` |

Public (published forms only):
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/public/forms/:slug` | 🔓 | → `{form:{name,type,fields,consentText}}` · 404 if draft |
| POST | `/api/effy/public/forms/:slug/submit` | 🔓 | `{data, utm:{source,medium,campaign}, website:""}` → `{thankyou}` — creates **lead** (source=form, channel=utm_source) + submission; honeypot `website` swallowed silently; required fields → 400 |

Hosted form page: `/f/:slug` (auto-captures `utm_*` query params).

## Planned (not yet implemented)
Brand Brain **RAG over uploaded docs** (pgvector, enabled in DB) pending an embedding provider · RBAC per-feature enforcement · Effy AI agents · Phase-2 modules (Advertise/Convert). This file gets a new section as each ships.
