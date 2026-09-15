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
| POST | `/api/effy/workspaces` | 🔒🏢 | `{name, industry?, location?, logo?, accent?, managerId?}` → `{workspace}` · owners/admins only (403) · 400 no name, outside manager or 100-workspace limit · 409 name taken in the org. `managerId` defaults to the creator; `null` leaves it unassigned |
| PATCH | `/api/effy/workspaces/:id` | 🔒🏢 | any of the create fields → `{workspace}` · 404 outside your org · same 400/403/409 rules |
| GET | `/api/effy/workspaces/summary` | 🔒🏢 | → `{clients:[{id, manager:{id,name}\|null, channels[], spend, leads, leads30d, approvals, alerts, organic:{level,reason}, paid:{level,reason}, lastActivity}]}` — see [Clients.md](modules/Clients.md) |
| GET | `/api/effy/team` | 🔒🏢 | → `{members:[{id, userId, name, email, role, status, verified, joined, isOwner, isYou}], invites:[{id, email, role, status: pending\|expired, invitedBy, expiresAt, createdAt}], roles[]}` · invites only for owners/admins |
| POST | `/api/effy/team/invites` | 🔒🏢 admin | `{email, role}` → `{invite, emailSent, link}` · the join link is returned to the inviter as well as emailed · 400 bad email or role · 409 already in the team, in another organisation, or already invited · 429 after 50 a day |
| POST | `/api/effy/team/invites/:id/resend` | 🔒🏢 admin | → `{invite, emailSent, link}` with a new link (the old one stops working) · 409 if used or cancelled |
| DELETE | `/api/effy/team/invites/:id` | 🔒🏢 admin | cancels a pending invite → `{status}` |
| PATCH | `/api/effy/team/members/:id` | 🔒🏢 admin | `{role}` → `{member}` · 400 for the owner or an unknown role · applies on the member's next request |
| DELETE | `/api/effy/team/members/:id` | 🔒🏢 admin | → `{status}` · not the owner or yourself · clears workspaces they managed; their account stays, with no organisation |
| GET | `/api/effy/invites/:token` | 🔓 | → `{invite:{email, role, org, invitedBy, expiresAt, hasAccount}}` · 404 unknown · 410 used, cancelled or expired · 429 after 30 bad tries in 15 min |
| POST | `/api/effy/invites/:token/accept` | 🔓/🔒 | signed out: `{name, password}` creates the account; signed in: `{}` and the account's email must match (403) → bootstrap, signed in · 401 `needsSignIn` when the email already has an account · 409 account in another organisation |
| GET | `/api/effy/onboarding` | 🔒🏢 | → `{onboarding:{orgType?, details?, offer?, goals?, step?, completedAt?}, options:{orgTypes, offers, goals, timezones, currencies, teamSizes}, org, workspace, plan}` (first workspace and its newest plan) · 404 no organisation |
| PATCH | `/api/effy/onboarding` | 🔒🏢 | any of `{orgType, details:{name, website, industry, location, timezone, currency, teamSize}, offer: creation\|marketing\|both, goals[], step}` → `{onboarding, org}` · merges; owners/admins only (403); 400 names the bad answer and saves nothing. Also sets org type and name, the first workspace's industry/location (and its name while it still matches the organisation's), and the owner's default role |
| POST | `/api/effy/onboarding/complete` | 🔒🏢 | → `{onboarding}` with `completedAt` · 400 without an offer, or when a marketing offer has no plan yet |
| GET | `/api/effy/marketing-plan?workspace=ws_N` | 🔒🏢 | → `{plan: {id, workspace, source, month, inputs, plan:{summary, pillars[], channels[], ideas[], funnel[], kpis[], firstWeek[]}, createdAt} \| null}` (newest) |
| POST | `/api/effy/marketing-plan` | 🔒🏢 write | `{workspace, source?: "onboarding"}` → `{plan}` · generated from the onboarding answers, Brand Brain and its documents · 503 when the model fails or returns an unusable plan (nothing stored) · 429 after 10 an hour per workspace |

### Email verification & password reset
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/auth/verify` | 🔓 | `{token}` → `{status}` · 400 invalid/expired |
| POST | `/api/effy/auth/resend-verification` | 🔒 | → `{status, email_sent, dev_link?}` |
| POST | `/api/effy/auth/forgot` | 🔓 | `{email}` → `{status, dev_link?}` (always ok) |
| POST | `/api/effy/auth/reset` | 🔓 | `{token, password}` → `{status}` · 400 invalid/expired |

### Account and two-factor sign-in
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/auth/login` (2FA on) | 🔓 | password right → `{status:"ok", needsTwoFactor:true}` and no session yet |
| POST | `/api/effy/auth/2fa/verify` | pending sign-in | `{code}` (authenticator or recovery code) → bootstrap, signed in · 400 wrong · 401 `restart` after 10 minutes or with no pending sign-in · 429 after 5 wrong codes in 15 min |
| GET | `/api/effy/auth/2fa` | 🔒 | → `{enabled, enabledAt, recoveryCodesLeft}` |
| POST | `/api/effy/auth/2fa/setup` | 🔒 | `{password}` → `{secret, otpauthUrl}` (not on until enabled) |
| POST | `/api/effy/auth/2fa/enable` | 🔒 | `{code}` → `{enabled, recoveryCodes[8]}` (shown once) |
| POST | `/api/effy/auth/2fa/disable` | 🔒 | `{password, code}` → `{enabled:false}` |
| POST | `/api/effy/auth/2fa/recovery-codes` | 🔒 | `{code}` → `{recoveryCodes}` (old ones stop working) |
| PATCH | `/api/effy/auth/me` | 🔒 | `{name}` → `{user}` |
| GET/PATCH | `/api/effy/me/preferences` | 🔒 | `{notifications:{approvals, failures, leads, reportsEmail}, density: comfortable\|compact}` (merged) → `{preferences}` |
| POST | `/api/effy/auth/reset-link` | 🔒 | → `{emailSent, email}` · emails a reset link to the signed-in address; the link is never returned |

An email verification link doesn't sign in an account with two-factor on (`{verified, needsSignIn}`).

**Bootstrap shape:** `{ user:{id,name,email,email_verified,is_admin,twoFactor,preferences}, org:{id,name,type,plan,onboarding:{completed,offer}}, role, workspaces:[{id:"ws_N", dbId, name, industry, location, logo, accent, managerId}] }`

## Plans and billing  ([Administration.md](modules/Administration.md))
Every session-authenticated route under a gated prefix answers **403** `{code: "plan_required", feature, plan, requiredPlan, message}` when the organisation's plan doesn't include it (engine `plans.py`, before-request hook). *marketing* (Growth and above): `/campaigns`, `/workflows`, `/strategy`, `/marketing-plan`, `/posts`, `/publish`, `/conversations`, `/reviews`, `/analytics/organic`, `/insights`, `/gbp`. *conversion* (Pro and above): `/ads`, `/landing`, `/forms`, `/leads`, `/followups`, `/tracking`, `/bio`, `/sites`, `/analytics/leads`, `/analytics/revenue`, `/analytics/creative`. Public pages aren't gated. New workspaces and invites past the plan's limit answer 403 `{code: "plan_limit", limit, plan, upgradeTo, message}`.

| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/billing/credits?workspace=ws_N` | 🔒🏢 | → `{plan, planInfo, used, allowance, remaining, warning: null\|"near"\|"over", hasPerformanceMarketing}` · credits count across the organisation; warnings don't block |
| GET | `/api/effy/admin/orgs` | 🔒 platform admin | → `{orgs:[{id, name, type, owner, createdAt, creditsUsed, ...planInfo}], plans}` |
| PATCH | `/api/effy/admin/orgs/:id` | 🔒 platform admin | `{plan, trialDays?}` → `{org}` · `Trial` starts a trial of `trialDays` (1–90, default 14) · 400 unknown plan · 404 |

`planInfo` (also on bootstrap `org`): `{plan (in force), storedPlan, features[], limits:{workspaces, seats, credits}, usage:{workspaces, seats}, trial: null | {endsAt, daysLeft, expired}}`.

## Campaigns  ([Campaigns.md](modules/Campaigns.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/campaigns?workspace=ws_N` | 🔒🏢 | → `{campaigns:[...]}` |
| GET | `/api/effy/campaigns/:id` | 🔒🏢 | → `{campaign:{...}}` · 404 if not in your org |
| POST | `/api/effy/campaigns` | 🔒🏢 | `{workspace, name, objective?, status?, channels?, budget?, ...}` → `{campaign}` |
| PATCH | `/api/effy/campaigns/:id` | 🔒🏢 write | `{status?, name?, objective?, budget?}` → `{campaign}` (launch = status→live) |
| GET | `/api/effy/campaigns/:id/assembly` | 🔒🏢 | `{campaign, counts:{content,forms,landing,leads}, checklist[], ready}` — real linked-children for the Launch playbook |


**Campaign shape:** `{ id, workspaceId:"ws_N", name, objective, status, owner, pillar, channels[], start, end, budget, spent, kpis:{impressions,clicks,leads,qualified,customers,revenue,cpl,roas,ctr}, counts:{content,ads,landingPages,forms}, recommendations }`

## Brand Brain  ([Brand-Brain.md](modules/Brand-Brain.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/brand?workspace=ws_N` | 🔒🏢 | → `{brain}` — default template overlaid with stored facts + sources |
| POST | `/api/effy/brand/fact` | 🔒🏢 | `{workspace, section, data, status?, sources?, kind?}` → `{status}` (upsert per section) |
| POST | `/api/effy/brand/source` | 🔒🏢 write | multipart `file` (PDF/DOCX/TXT/MD, text extracted) → `{source}` · or JSON `{workspace, type: "website", ref, name?}` → `{source, read:{ok, pages, chars, already?} \| {ok:false, message}}` — reads the home page and up to 4 main pages once (webread.py: public addresses only, redirects re-checked, 8 s/1.5 MB a page, 20 s total); an unreadable site is still recorded · or JSON `{workspace, type: "manual", name, content}` for a written brief |
| POST | `/api/effy/brand/test` | 🔒🏢 | `{workspace, prompt}` → `{output, cited[]}` — Groq generation grounded in the workspace's tone/approved/prohibited facts |

**Brain shape:** `{ completeness, needsReview, lastUpdated, <section>:{status, sources[], data} }` where sections = summary, tone, approved, prohibited, products, offers, personas, faqs, objections, competitors, visual, legal, sources. `data` shape varies by section kind (paragraph/chips/list/personas/faqs/visual/sources).

## AI Studio  ([AI-Studio.md](modules/AI-Studio.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/studio/generate` | 🔒🏢 | `{workspace, type, topic, language?}` → `{caption, hook, cta, hashtags[], scores[], cited[], platform}` |
| POST | `/api/effy/studio/image` | 🔒🏢 write | `{workspace, topic, aspect}` → `{imageUrl, prompt}` |
| POST | `/api/effy/studio/embed/image` | 🔒🏢 write | multipart: `workspace, baseName|base, agent, placement?, direction?` → final `{imageUrl, name}` saved to Media Library |
| POST | `/api/effy/studio/video/start` | 🔒🏢 write | `{workspace, topic, aspect, voiceover?, voice?, music?, script?}` → `{op}` |
| POST | `/api/effy/studio/video/status` | 🔒🏢 | `{workspace, op}` → `{status:pending|ready, videoUrl?}` |
| POST | `/api/effy/studio/embed/video/stitch` | 🔒🏢 write | `{workspace, videoName, outroName}` → final `{videoUrl, name}` |
| GET | `/api/effy/characters?workspace=ws_N` | 🔒🏢 | preset + custom EffyCharacters |
| POST | `/api/effy/characters` | 🔒🏢 write | multipart photo/video → reusable EffyCharacter |
| POST | `/api/effy/characters/speak` | 🔒🏢 write | `{workspace, preset|characterId, script, voice?, language?}` → `{job}` |

Grounded in the workspace's Brand Brain (tone/approved/prohibited). `type` ∈ {ig_post, ig_carousel, ig_reel, fb_post, li_post, x_post, yt_short, wa_promo}. **Scores are computed** (brand alignment, hook, CTA, platform fit, readability, ad-policy risk) each with a `note` and `invert` flag — real, explainable, not fabricated.

Agent image embeds use Gemini multi-image editing. Agent video outros reuse EffyCharacters (photo → base clip → TTS/Sync Labs lip-sync), then normalize and append the speaking clip locally with ffmpeg. Every input media name is checked against the active workspace.

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
| GET | `/api/effy/ads/dashboard?workspace=ws_N` | 🔒🏢 | `{provider, mode, totals:{spend,impressions,reach,cpm,clicks,ctr,cpc,leads,cpl,roas,budget,pacing}, series[], campaigns[{...adsets[{...ads[]}]}]}` |
| GET | `/api/effy/ads/creatives?workspace=ws_N` | 🔒🏢 | `{provider, mode, creatives[{id,name,format,thumb,campaign,platform,adset,spend,leads,ctr,cpl,fatigue,status}]}` |
| GET | `/api/effy/ads/audiences?workspace=ws_N` | 🔒🏢 | `{provider, mode, audiences[{id,name,type:saved\|custom\|lookalike,size,description,spend,leads,cpl,usedIn[],overlapWarning}]}` |
| GET | `/api/effy/ads/budgets?workspace=ws_N` | 🔒🏢 | `{provider, mode, totals:{budget,spend,pacing}, budgets[{id,campaign,platform,status,budget,spent,pacing,cpl,roas,nearCap,underPacing}]}` |
| POST | `/api/effy/ads/campaigns/:id/status` | 🔒🏢 write | `{workspace, status:active\|paused}` → `{campaign}` · 400 if provider is read-only |
| POST | `/api/effy/ads/campaigns/:id/budget` | 🔒🏢 write | `{workspace, budget}` (₹1,000–₹1cr) → `{campaign}` · 400 if provider is read-only |
| POST | `/api/effy/ads/sandbox` | 🔒🏢 write | `{workspace, enabled}` → `{sandbox}` — toggles the sandbox ad account (real `effy_integrations` row, `meta:{sandbox:true}`) |
| GET | `/api/effy/ads/rules?workspace=ws_N` | 🔒🏢 | `{provider, mode, rules[]}` |
| POST | `/api/effy/ads/rules` | 🔒🏢 write | `{workspace, name, metric:cpl\|roas\|ctr\|pacing, op:gt\|lt, threshold, action:pause\|notify, scope?}` → `{rule}` |
| PATCH/DELETE | `/api/effy/ads/rules/:id` | 🔒🏢 write | `{workspace, enabled?}` → `{rule}` / `{}` · 404 unknown rule |
| POST | `/api/effy/ads/rules/dry-run` | 🔒🏢 | `{workspace}` → `{mode, results[{ruleId,rule,matches[{campaignId,campaign,metric,value,threshold,op,suggestedAction}]}]}` — read-only, suggestions never auto-applied |

The **integration-adapter pattern**: `get_ads_provider(workspace)` returns `SandboxAdsProvider` (writable, deterministic, badged `mode:"sandbox"`) when the sandbox integration row is enabled, `MockAdsProvider` (`mode:"mock"`, UI shows the connect state) otherwise; real Meta/Google providers land in Phase 3 behind the same interface with `mode:"live"`.

## Strategy Intelligence + Workflows  ([Workflows-Intelligence.md](modules/Workflows-Intelligence.md))
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/effy/strategy/trends?workspace=ws_N` | 🔒🏢 | `{provider:"derived", trending[], hashtags[], formats[], gaps[], seasonal[]}` — **gaps computed from real posts** |
| GET | `/api/effy/strategy/competitors?workspace=ws_N` | 🔒🏢 | `{provider:"sample", competitors[{name,freq,platforms,engagement,sov,topPost,offers,you}]}` |
| GET | `/api/effy/studio/context?workspace=ws_N` | 🔒🏢 | `{brand:{tone,approved,prohibited}, trends[], competitorAngles[]}` — powers the Studio context rail |
| POST | `/api/effy/studio/generate` | 🔒🏢 write | now accepts optional `trend` / `angle` → woven into the grounded prompt, echoed in `cited[]` |
| POST | `/api/effy/studio/send-to-approval` | 🔒🏢 write | `{workspace, caption, hook?, channel?, type?, campaignId?}` → creates `internal_review` post → `{postId}` |

**Interlink:** Trends/Competitors → Studio context rail → generation consumes the chosen trend/angle → Send-to-approval creates a review post. The **Content Sprint playbook** (`/app/playbooks`) chains these with context flowing via query params.

## Planned (not yet implemented)
Brand Brain **RAG over uploaded docs** (pgvector, enabled in DB) pending an embedding provider · RBAC per-feature enforcement · Effy AI agents · Phase-2 modules (Advertise/Convert). This file gets a new section as each ships.
