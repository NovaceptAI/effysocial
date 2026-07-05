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
| GET | `/api/effy/analytics/leads?workspace=ws_N` | 🔒🏢 | `{provider:"live", spendProvider:"mock", kpis:{total,qualified,qualificationRate,won,pipelineValue,costPerQualified}, funnel[], bySource[], byCampaign[], quality[], lostReasons[], outcomes[]}` |
| GET | `/api/effy/analytics/revenue?workspace=ws_N` | 🔒🏢 | `{provider:"live", spendProvider:"mock", attributionModel:"last-touch", kpis:{revenue,customers,avgDeal,spend,cac,roas}, byChannel[], byCampaign[]}` |
| GET | `/api/effy/analytics/creative?workspace=ws_N` | 🔒🏢 | `{provider:"mock", creatives:[{id,name,format,thumb,campaign,platform,adset,spend,ctr,cpl,fatigue}], attributes:{bestFormat, byFormat[], fatigued}}` |

Top posts + reach/engagement KPIs **aggregate real `effy_posts` metrics**; series/demographics are deterministic derived values (flagged `provider:"derived"`) until social integrations sync real snapshots. **Lead/revenue analytics aggregate real `effy_leads` rows** (funnel by stage, source/campaign rollups, lost reasons, sales outcomes; revenue = won-stage + purchase-completed leads, last-touch to campaign/channel). Ad spend (cost/qualified, CAC, ROAS denominators) and all creative rows come from the **ads adapter** (`spendProvider`/`provider:"mock"` until Phase 3 connects Meta/Google).

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
| GET | `/api/effy/leads/:id` | 🔒🏢 | → `{lead}` + `attribution:{source,channel,campaign?,form?{name,submitted,data},conversation?{person,kind,intent,messages},utm}`, `duplicates[{id,name,match:email\|phone,stage,created}]`, `followupRuns[{workflow,when,log}]`, `offlineSignals[]`, `outcomes[]` |
| POST | `/api/effy/leads` | 🔒🏢 write-role | `{workspace, name, phone?, email?, source?, campaignId?, interest?, value?, quality?}` → `{lead}` |
| PATCH | `/api/effy/leads/:id` | 🔒🏢 write-role | `{stage?, quality?, value?, owner?, lostReason?, note?, outcome?}` → `{lead}` · 400 invalid stage/outcome |
| POST | `/api/effy/conversations/:id/convert-lead` | 🔒🏢 write-role | → `{lead, existing}` — idempotent; copies person/channel/interest, sales-intent → hot |

**Lead shape:** `{ id, workspaceId, campaignId?, conversationId?, name, phone, email, source, channel, interest, stage, quality, value, owner, notes[], lostReason, outcome, created }` · stages: new/contacted/qualified/appointment/proposal/won/lost.
**Outcomes (§14.7 closed loop):** `invalid|duplicate|unreachable` (negative) · `qualified|appointment_completed|purchase_completed` (positive). A **changed** outcome appends a note and records one `kind:"offline"` row in `effy_tracking_events` (mock offline-conversion signal; real Meta/Google uploads in Phase 3) — re-marking the same value is a no-op.

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

## Convert — Landing Pages  ([Convert-Landing.md](modules/Convert-Landing.md))
Authed:
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/landing?workspace=ws_N` | 🔒🏢 | → `{pages[]}` (with views) |
| POST | `/api/effy/landing` | 🔒🏢 write-role | `{workspace, name, sections?, campaignId?, whatsapp?, phone?}` → `{page}` (slug generated) |
| PATCH | `/api/effy/landing/:id` | 🔒🏢 write-role | `{name?, sections?, status?, formSlug?, whatsapp?, phone?, campaignId?}` → `{page}` |
| POST | `/api/effy/landing/:id/ai-copy` | 🔒🏢 write-role | `{topic?}` → `{headline, sub, cta, features[], cited[]}` — Groq grounded in Brand Brain (tone/approved/prohibited) · 503 if Groq down |

Public (published pages only):
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/public/landing/:slug` | 🔓 | → `{page:{name,workspace,accent,logo,sections,formSlug,whatsapp,phone}}` — increments `views`; `formSlug` only when it points at a **published** form in the same workspace; CTA fields blank when their section is disabled · 404 if draft |

**Sections shape:** `{hero:{headline,sub,cta}, features:{title,items[]}, testimonial:{quote,author}, enabled:{features,testimonial,form,whatsapp,call}}`.
Hosted page: `/p/:slug` — brand-accented; the embedded form reuses `/api/effy/public/forms/:slug*` end-to-end, so `utm_*` query params flow into the submission → lead.

## Convert — Link-in-bio  ([Convert-Bio.md](modules/Convert-Bio.md))
Authed:
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/bio?workspace=ws_N` | 🔒🏢 | → `{pages[]}` (with views + total clicks) |
| POST | `/api/effy/bio` | 🔒🏢 write-role | `{workspace, name, title?, bio?, avatar?, socials?, links?, whatsapp?}` → `{page}` (slug generated; title/avatar default to workspace) |
| PATCH | `/api/effy/bio/:id` | 🔒🏢 write-role | `{name?, title?, bio?, avatar?, theme?, socials?, links?, formSlug?, whatsapp?, status?}` → `{page}` — links sanitised (max 12, label+url required, kind ∈ link\|product\|appointment\|payment\|featured), **clicks preserved by link id**; theme ∈ warm\|dark\|mint |

Public (published pages only):
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/public/bio/:slug` | 🔓 | → `{page:{title,bio,avatar,accent,theme,socials,links[],formSlug,whatsapp}}` — increments `views`; links exclude click counts; `formSlug` only when it points at a **published** form in the same workspace · 404 if draft |
| POST | `/api/effy/public/bio/:slug/click` | 🔓 | `{linkId}` → `{status:"ok"}` — increments that link's `clicks` · 400 unknown link · 404 if draft |

Hosted page: `/b/:slug` — themed profile + links; the lead form button opens `/f/:formSlug` forwarding `utm_*` query params → submission → lead.

## Convert — Conversion Tracking Centre  ([Convert-Tracking.md](modules/Convert-Tracking.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/tracking?workspace=ws_N` | 🔒🏢 | → `{provider, sources[], domain, utm:{submissions,tagged,coverage,topSources[]}, recommendations[], guide[]}` |
| POST | `/api/effy/tracking/test-event` | 🔒🏢 write-role | `{workspace, source}` → `{event:{source,kind:"test",at}}` · 400 unknown source |

**Source shape:** `{id, name, kind:native|pixel, status:healthy|warning|not_connected, events, lastEvent, lastTest, matchQuality, duplicates, consent, detail}`.
Native sources (forms/landing/whatsapp) are computed live from real submissions, page views and leads; pixel sources (Meta Pixel/Google Tag) + domain verification go through `get_tracking_provider(ws)` — `MockTrackingProvider` (`provider:"mock"`) until Phase 3. Test events persist in `effy_tracking_events`.

## Convert — Follow-up Automation  ([Convert-Followups.md](modules/Convert-Followups.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/followups?workspace=ws_N` | 🔒🏢 | → `{workflows[]}` |
| POST | `/api/effy/followups` | 🔒🏢 write-role | `{workspace, name, trigger?, steps?}` → `{workflow}` (status starts `draft`) · 400 invalid trigger/steps |
| PATCH | `/api/effy/followups/:id` | 🔒🏢 write-role | `{name?, status?(draft\|active\|paused), trigger?, steps?}` → `{workflow}` |
| GET | `/api/effy/followups/:id/runs` | 🔒🏢 | → `{runs[{id,lead,log[],at}]}` (last 20) |
| POST | `/api/effy/followups/:id/dry-run` | 🔒🏢 | `{lead?:{name,phone,email,source,stage,quality,channel}}` → `{log[{step,text}]}` — sample lead, **no side effects**, works on drafts |

**Workflow shape:** `{id, workspaceId, name, status, trigger:{type:lead_created\|stage_changed, source?, stage?}, steps[≤10]:[{kind:condition\|delay\|action, …}], runs, created}`.
**Execution:** active workflows fire synchronously inside the lead transaction — on lead create (`/leads`, convert-from-conversation, public form submit) and on actual pipeline stage transitions. Conditions stop the run on mismatch; delays log instantly (scheduled in Phase 3); message actions (whatsapp/email/sms/ai_voice) go through `get_messaging_provider(ws)` → `MockMessagingProvider` until Phase 3, appending notes to the lead; `assign_salesperson` sets the lead owner. Runs persist in `effy_followup_runs`.

## Advertise — Ad Dashboard  ([Advertise-Dashboard.md](modules/Advertise-Dashboard.md))
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/effy/ads/dashboard?workspace=ws_N` | 🔒🏢 | `{provider, totals:{spend,impressions,reach,cpm,clicks,ctr,cpc,leads,cpl,roas,budget,pacing}, series[], campaigns[{...adsets[{...ads[]}]}]}` |

First use of the **integration-adapter pattern**: `get_ads_provider(workspace)` returns `MockAdsProvider` (deterministic, workspace-seeded, realistic economics, flagged `provider:"mock"`) until real Meta/Google providers land in Phase 3 behind the same interface.

## Planned (not yet implemented)
Brand Brain **RAG over uploaded docs** (pgvector, enabled in DB) pending an embedding provider · RBAC per-feature enforcement · Effy AI agents · Phase-2 modules (Advertise/Convert). This file gets a new section as each ships.
