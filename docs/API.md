# EffySocial API Reference (live)

The **implemented** backend endpoints. Base: `/api/effy` (proxied by nginx on
effysocial.effybiz.in → Flask `novalab-engine`). Auth is a signed session
cookie (`effy_uid`); the organisation a request works in is the session's active
profile. Update this file in the same commit as any endpoint that ships or changes.
All 268 routes are listed (checked against the engine's url_map on 28 Sep 2026).

Legend: 🔓 no auth · 🔒 requires session · 🏢 org-ownership enforced

## Auth & tenancy  ([Auth-Landing.md](modules/Auth-Landing.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/health` | 🔓 | → `{status, service}` |
| POST | `/api/effy/auth/register` | 🔓 | `{email, password, name?, orgName?, orgType?, industry?, location?}` → bootstrap + `{email_sent, dev_link?}`; logs in |
| POST | `/api/effy/auth/login` | 🔓 | `{email, password}` → bootstrap · 401 on bad creds |
| POST | `/api/effy/auth/logout` | 🔓 | → `{status}` |
| GET | `/api/effy/auth/me` | 🔒 | → `{user:{id,name,email,email_verified}}` |
| GET | `/api/effy/bootstrap` | 🔒 | → `{user, org, role, workspaces[], profiles[], newProfileTrial}` for the profile in use (shape below) |
| GET | `/api/effy/workspaces` | 🔒 | → same as bootstrap |
| POST | `/api/effy/workspaces` | 🔒🏢 | `{name, industry?, location?, logo?, accent?, managerId?, brandKind?}` → `{workspace}` · `brandKind` business\|personal_brand is chosen only in an Agency & Creators profile; elsewhere it follows the profile (400 if different) · owners/admins only (403) · 400 no name, outside manager or 100-workspace limit · 409 name taken in the org. `managerId` defaults to the creator; `null` leaves it unassigned |
| PATCH | `/api/effy/workspaces/:id` | 🔒🏢 | any of the create fields → `{workspace}` · 404 outside your org · same 400/403/409 rules |
| GET | `/api/effy/workspaces/summary` | 🔒🏢 | → `{clients:[{id, manager:{id,name}\|null, channels[], spend, leads, leads30d, approvals, alerts, organic:{level,reason}, paid:{level,reason}, lastActivity}]}` — see [Clients.md](modules/Clients.md) |
| GET | `/api/effy/team` | 🔒🏢 | → `{members:[{id, userId, name, email, role, status, verified, joined, isOwner, isYou}], invites:[{id, email, role, status: pending\|expired, invitedBy, expiresAt, createdAt}], roles[]}` · invites only for owners/admins |
| POST | `/api/effy/team/invites` | 🔒🏢 admin | `{email, role}` → `{invite, emailSent, link}` · the join link is returned to the inviter as well as emailed · 400 bad email or role · 409 already in the team or already invited · 400 `Client approver` until that role is switched on in Settings (never for a Personal Brand) · someone who uses EffySocial elsewhere can be invited · 429 after 50 a day |
| POST | `/api/effy/team/invites/:id/resend` | 🔒🏢 admin | → `{invite, emailSent, link}` with a new link (the old one stops working) · 409 if used or cancelled |
| DELETE | `/api/effy/team/invites/:id` | 🔒🏢 admin | cancels a pending invite → `{status}` |
| PATCH | `/api/effy/team/members/:id` | 🔒🏢 admin | `{role}` → `{member}` · 400 for the owner or an unknown role · applies on the member's next request |
| DELETE | `/api/effy/team/members/:id` | 🔒🏢 admin | → `{status}` · not the owner or yourself · clears workspaces they managed; their account stays, with no organisation |
| GET | `/api/effy/invites/:token` | 🔓 | → `{invite:{email, role, org, invitedBy, expiresAt, hasAccount}}` · 404 unknown · 410 used, cancelled or expired · 429 after 30 bad tries in 15 min |
| POST | `/api/effy/invites/:token/accept` | 🔓/🔒 | signed out: `{name, password}` creates the account; signed in: `{}` and the account's email must match (403) → bootstrap, signed in and working in the organisation joined, which is added to the person's profiles (their own profiles stay) · 401 `needsSignIn` when the email already has an account |
| GET | `/api/effy/onboarding` | 🔒🏢 | → `{onboarding:{orgType?, details?, offer?, goals?, step?, completedAt?}, options:{orgTypes, offers, goals, timezones, currencies, teamSizes}, org, workspace, plan}` (first workspace and its newest plan) · 404 no organisation |
| PATCH | `/api/effy/onboarding` | 🔒🏢 | any of `{orgType, details:{name, website, industry, location, timezone, currency, teamSize}, offer: creation\|marketing\|both, goals[], step}` → `{onboarding, org}` · merges; owners/admins only (403); 400 names the bad answer and saves nothing; `offer` marketing or both is refused on a plan without marketing (a Creative profile onboards for creation). While onboarding is unfinished, `goals` (the first measurable one) and `details.website` also fill the first workspace's plan brief, and `orgType` sets the workspaces' kind. Also sets org type and name, the first workspace's industry/location (and its name while it still matches the organisation's), and the owner's default role |
| POST | `/api/effy/onboarding/complete` | 🔒🏢 | → `{onboarding}` with `completedAt` · 400 without an offer, or when a marketing offer on a plan that includes marketing has no plan yet |
| GET | `/api/effy/marketing-plan?workspace=ws_N` | 🔒🏢 | → `{plan: {id, workspace, source, month, inputs, plan, createdAt} \| null, progress, brief, briefOptions:{kinds[], metrics:[{key, label, unit}]}}` — the newest plan and the workspace's plan brief. A plan on SOSTAC (6.18) has `plan:{format: "sostac", summary, startsOn, endsOn, capacity, situation:{numbers:[{key, label, value, unit, source, asOf, why}], gaps[], reading[], swot:{strengths[], weaknesses[], opportunities[], threats[]}}, objective:{metric, label, unit, baseline, baselineSource, target, suggested, by, why, measured}, strategy:{audience, positioning, pillars[], funnel[]}, tactics:{channels[], ideas[], budget:{total, currency, split:[{area, amount, why}], note}, campaigns:[{name, objective, channels[], pillar, budget, startWeek, endWeek, why}]}, action:{weeks:[{week, focus, tasks[]}]}, control:{kpis[], weekly:[{week, start, end, plannedPosts, plannedGoal}]}, accepted?:{at, by, campaignIds[]}}` plus the older fields `pillars, channels, ideas, kpis, funnel, firstWeek`; `progress` is its weeks with `status: done\|current\|ahead, actualPosts, actualGoal` (null = not counted yet or not measurable), counted on every read. An older plan has only the older fields and `progress: null` |
| PUT | `/api/effy/marketing-plan/brief` | 🔒🏢 write | any of `{workspace, kind: business\|personal_brand, goal:{metric: leads\|sales\|bookings\|calls\|whatsapp\|followers\|reach\|engagement, target?}, offer?, customer?, budget? (0 = organic only), capacity? (posts a week, 1–50), website?}` → `{brief:{kind, kindLabel, kindEditable, goal:{metric, label, unit, target}, offer, customer, budget, currency, capacity, website, updatedAt, missing[]}}` · merges; blank numbers clear · `kind` only changes in an Agency & Creators profile (400 otherwise) · 400 names the bad answer and saves nothing |
| POST | `/api/effy/marketing-plan` | 🔒🏢 write | `{workspace, source?: "onboarding"}` → `{plan, progress}` · a four-week plan on SOSTAC (shape above) · the Situation's numbers, the objective's baseline, the budget split (adds up to the brief's budget exactly) and the weekly plan are the engine's, not the model's · written from **the workspace's own brief** (kind, goal and target, offer, customer, budget, capacity, website — read into that workspace's Brand Brain), its Brand Brain and documents, never the organisation's sign-up answers; the cadence is cut to the brief's capacity · 400 `{code: "brief_needed", missing:["goal"]}` until the brief has a goal · 503 when the model fails or returns an unusable plan (nothing stored) · 429 after 10 an hour per workspace |
| POST | `/api/effy/marketing-plan/<id>/accept` | 🔒🏢 write | → `{plan, campaigns:[campaign]}` · creates the SOSTAC plan's campaigns as **drafts** (dates from the plan's weeks), once — again returns the same ones · nothing is published or spent · 400 for a plan written before SOSTAC · 404 outside the organisation |

### Profiles, work email and Roles & client approval  ([Auth-Landing.md](modules/Auth-Landing.md), [Administration.md](modules/Administration.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/profiles` | 🔒 | Add account type: `{type: business\|personal_brand\|agency, name}` → bootstrap in the new profile + `{trial}` · only a login's first own profile gets the 14-day trial; later ones start on Creative · onboarding continues from the details step · 400 `Choose Business, Personal Brand or Agency & Creators.` / `Enter your name.` / `Enter a name for this profile.` · 429 after 10 a day per login |
| POST | `/api/effy/profiles/:orgId/switch` | 🔒 | → bootstrap in that profile; kept for this device and used at the next sign-in · 404 `You’re not part of that profile.` |
| POST | `/api/effy/profile/work-email` | 🔒 admin, Business | `{email}` → `{verified, sent?, email?, profile}` · the signed-in owner's own verified login verifies at once; otherwise a 6-digit code (30 min, 5 tries) is emailed · 400 free-mail address or not a Business · 401 signed out · 429 after 5 codes an hour |
| POST | `/api/effy/profile/work-email/verify` | 🔒 admin, Business | `{code}` → `{verified, profile}` · 400 `That code isn’t right. N tries left.` / `That code has expired. Send a new one.` |
| PATCH | `/api/effy/profile/settings` | 🔒 admin | any of `{clientsPage, clientApprover, clientReview, requireApproval}` (booleans) → `{profile}` · the Client approver brings client review with it; turning client review off turns the Client approver off · 400 `Turn a setting on or off.` or a Personal Brand · 409 while someone holds or is invited to the Client approver role |

### Email verification & password reset
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/auth/verify` | 🔓 | `{token}` → `{status}` · 400 invalid/expired |
| POST | `/api/effy/auth/resend-verification` | 🔒 | → `{status, email_sent, dev_link?}` |
| POST | `/api/effy/auth/forgot` | 🔓 | `{email}` → `{status, dev_link?}` (always ok) |
| POST | `/api/effy/auth/reset` | 🔓 | `{token, password}` → `{status}` · 400 invalid/expired |
| POST | `/api/effy/auth/resend-public` | 🔓 | `{email}` → the same answer whether or not the account exists (no account enumeration) |

### Notify me when ready
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/interest` | 🔒 | → `{features[]}` the signed-in person asked about |
| POST | `/api/effy/interest` | 🔒 | `{feature}` (blog, whatsapp-alerts, voice-cloning, playbook-post-to-ad, playbook-competitor-response) → `{feature, label, alreadyAsked, email}` · once per person · 400 unknown feature |
| GET | `/api/effy/admin/interest` | 🔒 platform admin | → `{features:[{feature, label, count, people:[{email, name, org, at}]}]}` |

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
| GET/PATCH | `/api/effy/me/preferences` | 🔒 | `{notifications:{approvals, failures, leads, reportsEmail}, density: comfortable\|compact}` (merged; the last-used profile is kept) → `{preferences}` |
| POST | `/api/effy/auth/reset-link` | 🔒 | → `{emailSent, email}` · emails a reset link to the signed-in address; the link is never returned |

An email verification link doesn't sign in an account with two-factor on (`{verified, needsSignIn}`).

**Bootstrap shape:** `{ user:{id,name,email,email_verified,is_admin,twoFactor,preferences}, org:{id, name, type, profile:{type, label, desc, clientFeatures, settings:{clientsPage, clientApprover, clientReview, requireApproval}, workEmail?:{email, verified, verifiedAt, pending}}, plan, planInfo, onboarding:{completed,offer}, timezone}, role, workspaces:[{id:"ws_N", dbId, name, industry, location, logo, accent, managerId, sample, brandKind}], profiles:[{id, name, type, label, role, plan, isOwner, current}], newProfileTrial }` — `org` and `role` are the profile in use; `workEmail` only for a Business.

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
| PATCH | `/api/effy/campaigns/:id` | 🔒🏢 write | `{status?, name?, objective?, pillar?, owner?, budget?, channels?, start?, end?}` → `{campaign}` (launch = status→live) · channels outside instagram/facebook/whatsapp/linkedin/google/youtube/x are dropped · 400 `Use dates like 2026-09-30.` · 400 when the end is before the start |
| GET | `/api/effy/campaigns/:id/workspace` | 🔒🏢 | everything the campaign's tabs show, from the rows linked to it → `{campaign, plan:{pillar?, kpis[], channels[], hasPlan}, content:[posts], conversion:{landing[], forms[]}, leads[], analytics:{leads, qualified, won, revenue, spend, budget, cpl, roas, published, scheduled, reach, engagement, byStage, submissions, views}, activity:[{at, kind, text}]}` — a new campaign reads as zeros |
| POST | `/api/effy/campaigns/suggest` | 🔒🏢 | `{workspace}` → `{campaigns[], provider}` — proposals from Brand Brain, the season and real content gaps; nothing is created · 503 |
| GET | `/api/effy/campaigns/:id/assembly` | 🔒🏢 | `{campaign, counts:{content,forms,landing,leads}, checklist[], ready}` — real linked-children for the Launch playbook |


**Campaign shape:** `{ id, workspaceId:"ws_N", name, objective, status, owner, pillar, channels[], start, end, budget, spent, kpis:{impressions,clicks,leads,qualified,customers,revenue,cpl,roas,ctr}, counts:{content,ads,landingPages,forms}, recommendations }`

## Brand Brain  ([Brand-Brain.md](modules/Brand-Brain.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/brand?workspace=ws_N` | 🔒🏢 | → `{brain}` — default template overlaid with stored facts + sources |
| POST | `/api/effy/brand/fact` | 🔒🏢 | `{workspace, section, data, status?, sources?, kind?}` → `{status}` (upsert per section) |
| POST | `/api/effy/brand/source` | 🔒🏢 write | multipart `file` (PDF/DOCX/TXT/MD, text extracted) → `{source}` · or JSON `{workspace, type: "website", ref, name?}` → `{source, read:{ok, pages, chars, already?} \| {ok:false, message}}` — reads the home page and up to 4 main pages once (webread.py: public addresses only, redirects re-checked, 8 s/1.5 MB a page, 20 s total); an unreadable site is still recorded · or JSON `{workspace, type: "manual", name, content}` for a written brief |
| POST | `/api/effy/brand/suggest` | 🔒🏢 write | `{workspace, section}` → `{suggestion, cited[]}` — a draft for one section from the brief, documents and website · 400 unsupported section · 503 |
| POST | `/api/effy/brand/logo` | 🔒🏢 write | multipart `workspace, logo` (PNG, JPG, WEBP or SVG under 8 MB) → `{visual, colors, fonts, mood, extracted}` · 400 |
| DELETE | `/api/effy/brand/source/:id` | 🔒🏢 write | → `{status}` · 404 |
| POST | `/api/effy/brand/test` | 🔒🏢 | `{workspace, prompt}` → `{output, cited[]}` — Groq generation grounded in the workspace's tone/approved/prohibited facts |

**Brain shape:** `{ completeness, needsReview, lastUpdated, <section>:{status, sources[], data} }` where sections = summary, tone, approved, prohibited, products, offers, personas, faqs, objections, competitors, visual, legal, sources. `data` shape varies by section kind (paragraph/chips/list/personas/faqs/visual/sources).

## AI Studio  ([AI-Studio.md](modules/AI-Studio.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/studio/generate` | 🔒🏢 | `{workspace, type, topic, language?}` → `{caption, hook, cta, hashtags[], scores[], cited[], platform}` |
| POST | `/api/effy/studio/image` | 🔒🏢 write | `{workspace, topic, aspect}` → `{imageUrl, prompt}` · Google Nano Banana 2, then Cloudflare FLUX; a JPEG saved to Media Library · 503 when neither answers · 429 monthly image cap |
| POST | `/api/effy/studio/refine` | 🔒🏢 write | `{workspace, caption, tool, type?, language?}` → `{caption, hook, hashtags?, scores, tool}` — transforms the current caption (rewrite, shorten, expand, tone, CTA, hooks, hashtags, translate) · 400 nothing to refine · 503 |
| GET | `/api/effy/studio/voices` | 🔒 | → `{voices, libraryVoices, music, veoMaxSeconds, videoProvider}` for the audio controls |
| POST | `/api/effy/studio/animate` | 🔒🏢 write | `{workspace, name, motion, seconds?, aspect?}` → `{videoUrl, name}` — a library image made to move with a camera preset (ffmpeg, no AI cost) · 404 unknown image |
| POST | `/api/effy/studio/story/ideas` | 🔒🏢 | `{workspace, category}` → `{ideas[4]}` (static fallbacks when Groq is down) |
| POST | `/api/effy/studio/story/plan` | 🔒🏢 write | `{workspace, topic, category?, scenes?, clipSeconds?, voiceover?}` → `{scenes[]}` |
| POST | `/api/effy/studio/story/scene` | 🔒🏢 write | `{workspace, prompt, aspect?, seconds?, motion?, caption?, narration?, voiceover?, voice?, language?}` → `{op}` — one scene: a brand image and a Veo clip · 429 cap · 503 |
| POST | `/api/effy/studio/story/scene/status` | 🔒🏢 | `{workspace, op, narration?, voice?, …}` → `{status: pending\|ready, videoUrl?, name?}` · a refusal answers `{message, reason, charged:false}` |
| POST | `/api/effy/studio/story/stitch` | 🔒🏢 write | `{workspace, names[≥2], music?, audio?}` → `{videoUrl, name}` · 400 fewer than two scenes |
| POST | `/api/effy/studio/avatar` | 🔒🏢 write | multipart `workspace, video` (≤20 MB) + `audio` or `script` (+ `voice`, `language`, `template`) → `{job}` — Sync Labs lip-sync · 400 missing clip or speech · 429 cap |
| POST | `/api/effy/studio/avatar/status` | 🔒🏢 | `{workspace, job}` → `{status, videoUrl?, name?}` · refusals as above |
| POST | `/api/effy/studio/embed/image` | 🔒🏢 write | multipart: `workspace, baseName\|base, agent, placement?, direction?` → final `{imageUrl, name}` saved to Media Library |
| POST | `/api/effy/studio/video/start` | 🔒🏢 write | `{workspace, topic, aspect, voiceover?, voice?, music?, script?}` → `{op}` |
| POST | `/api/effy/studio/video/status` | 🔒🏢 | `{workspace, op}` → `{status:pending\|ready, videoUrl?}` |
| POST | `/api/effy/studio/embed/video/stitch` | 🔒🏢 write | `{workspace, videoName, outroName}` → final `{videoUrl, name}` |
| GET | `/api/effy/characters?workspace=ws_N` | 🔒🏢 | preset + custom EffyCharacters |
| POST | `/api/effy/characters` | 🔒🏢 write | multipart photo/video → reusable EffyCharacter |
| POST | `/api/effy/characters/speak` | 🔒🏢 write | `{workspace, preset\|characterId, script, voice?, language?}` → `{job}` |
| POST | `/api/effy/characters/:id/status` | 🔒🏢 | follow a custom character's photo → clip render → `{character}` (ready, or still animating; Ken Burns fallback when Veo declines) |
| DELETE | `/api/effy/characters/:id` | 🔒🏢 write | → `{status}` |
| GET | `/api/effy/characters/asset/:name` | 🔓 | the shipped preset portraits and base clips |

Grounded in the workspace's Brand Brain (tone/approved/prohibited). `type` ∈ {ig_post, ig_carousel, ig_reel, fb_post, li_post, x_post, yt_short, wa_promo}. **Scores are computed** (brand alignment, hook, CTA, platform fit, readability, ad-policy risk) each with a `note` and `invert` flag — real, explainable, not fabricated.

Agent image embeds use Gemini multi-image editing. Agent video outros reuse EffyCharacters (photo → base clip → TTS/Sync Labs lip-sync), then normalize and append the speaking clip locally with ffmpeg. Every input media name is checked against the active workspace.

## Publish  ([Calendar-Approvals.md](modules/Calendar-Approvals.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/posts?workspace=ws_N` | 🔒🏢 | → `{posts:[...]}` |
| POST | `/api/effy/posts` | 🔒🏢 | `{workspace, title, channel?, type?, status?, date?, time?, caption?, campaignId?, mediaUrl?}` → `{post}` · 400 for status publishing/published (only the publisher sets them) · with Require approval on, only idea, draft or internal_review (400 `Posts here need approval before they’re scheduled or published. Send it for review first.`) · client_review only when that stage is on · `mediaUrl`: one of our signed media links (403 bad, 410 expired) or a public https link (400 otherwise) |
| PATCH | `/api/effy/posts/:id` | 🔒🏢 write | `{title?, caption?, channel?, type?, mediaUrl? ("" removes), date?, time?, assignee?, campaignId?, status? (idea → draft or internal_review only)}` → `{post}` · a published or publishing post only takes `campaignId` · a scheduled post's date/time move with `/schedule`, and its content must stay publishable · edits to a post in review, approved or scheduled add a signed comment ("Edited the caption.") · with Require approval on, changing the caption, media, channel or format of an approved, scheduled or failed post moves it back to internal_review (and off the schedule) with a signed comment |
| POST | `/api/effy/posts/:id/approve` | 🔒🏢 | advances draft → internal_review → client_review (only when that stage is on; otherwise straight to approved) → approved · 400 past approved · 403 for a Client approver unless the post is at client review |
| POST | `/api/effy/posts/bulk-approve` | 🔒🏢 | `{workspace, ids[]}` (≤100) → `{approved:[posts], skipped:[{id, title, reason}]}` — each post moves one stage, following the same chain; the rest are listed with why |
| POST | `/api/effy/posts/:id/request-changes` | 🔒🏢 | `{comment}` → back to draft + signed comment · 400 once publishing or published · 403 for a Client approver unless at client review |
| POST | `/api/effy/posts/:id/comment` | 🔒🏢 | `{text}` → signed comment appended · 400 empty · 403 for a Client approver unless at client review |
| POST | `/api/effy/posts/:id/schedule` | 🔒🏢 | `{date?, time?}` (YYYY-MM-DD, HH:MM, in the organisation's timezone; stored zero-padded) → scheduled (from approved, failed, or scheduled to move it; clears the error) · 400 missing or invalid date/time · 400 `09:00 on 1 Sep 2026 has already passed (India time). Pick a later time.` · 400 when it couldn't be published now (no media, caption over limits, channel without a publisher, Instagram not connected) — a scheduled post is one EffySocial will publish |
| POST | `/api/effy/posts/:id/unschedule` | 🔒🏢 write | scheduled → approved (keeps its date) · 400 otherwise |
| POST | `/api/effy/posts/:id/insights` | 🔒🏢 | a published Instagram post's live numbers → `{metrics:{reach, views, likes, comments, saved, shares, interactions, engagement (% of reach), profileVisits?, follows?, syncedAt}, post}`, also kept on `post.metrics` · 410 `This post is no longer on Instagram.` (the post keeps a note and loses its link) · 502 Instagram's message (a token error marks the connection expired) · 400 for other posts |
| POST | `/api/effy/posts/fill-gaps` | 🔒🏢 write | `{workspace, from?, to?, ai? (default true)}` → `{from, to, perWeek, suggestions:[{date, time, title, channel, type, format, pillar, angle, source: plan\|ideas\|ai}], unfilled}` — empty days from tomorrow (≤31 days) at the marketing plan's posts a week (WhatsApp excluded; 3 without a plan), filled from the plan's unused ideas, then the Ideas board, then AI; nothing is created |
| POST | `/api/effy/posts/:id/publish` | 🔒🏢 write | publish an approved, scheduled or failed post now (Retry) → 200 `{status:"ok", mediaId, permalink, post}` published · 200 `{status:"pending", creationId, post}` Instagram still processing · 502 `{message, post}` failed with Instagram's own message · 400 not publishable / no media / caption over Instagram's limits / channel without a publisher / no connection · 409 already publishing |
| POST | `/api/effy/posts/:id/publish/check` | 🔒🏢 write | follow a post Instagram is processing → `{post}` as it now stands (published, publishing or failed) |
| POST | `/api/effy/publish/instagram` | 🔒🏢 write | `{workspace, imageUrl, caption?, title?}` → creates the post and publishes it; answers as `/posts/:id/publish` plus `postId` · 400 `Connect an Instagram account first (Integrations).` / `A public image URL (https) is required by Instagram.` / caption limits · 400 `code: needs_approval` when Require approval is on |
| POST | `/api/effy/publish/instagram-reel` | 🔒🏢 write | `{workspace, videoUrl, caption?, title?}` → creates the post and starts a Reel; usually `pending` → follow with `/posts/:id/publish/check` |

**Post shape:** `{ id, workspaceId, campaignId?, title, channel, type, status, date, time, assignee, caption, metrics?, comments[{author, role, text, when (ISO), internal}], error, mediaUrl, mediaKind, permalink, externalId, attempts, publishedAt }` · statuses: idea/draft/internal_review/client_review/approved/scheduled/publishing/published/failed. `mediaUrl` is re-signed on every response; `permalink` is Instagram's link to the live post; `error` is Instagram's message when it refused (a token error also marks the connection expired).

**Scheduled posts publish themselves** (engine `scheduler.py`, launch plan 4.2): every minute the scheduler publishes each scheduled post whose date and time have come in its organisation's timezone (onboarding; India time by default), and follows uploads Instagram is still processing. A post more than 12 hours late isn't published late; it fails with the reason, as does one that can no longer be published (e.g. the connection expired). Platform admins: `GET /api/effy/admin/scheduler` → `{running, lastRunAt, jobs:[{name, label, lastStartedAt, lastFinishedAt, ok, error, result, runs, failures}]}` (`running` = a run finished in the last 5 minutes); `POST /api/effy/admin/scheduler/run` `{job?}` runs one job, or all, now under the same lock (404 unknown job). Jobs: publish-due-posts, follow-publishing-posts, resume-followups (every minute), check-ad-rules (30 min), check-connections (hourly).

**Instagram limits checked before sending:** captions up to 2,200 characters, 30 hashtags and 20 @ tags (`publisher.caption_problem`, mirrored in the web app's `publishing.js`).

## Engage  ([Engage-Inbox.md](modules/Engage-Inbox.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/conversations?workspace=ws_N` | 🔒🏢 | → `{conversations:[...]}` |
| POST | `/api/effy/conversations/:id/reply` | 🔒🏢 | `{text}` → message appended, unread cleared |
| POST | `/api/effy/conversations/:id/close` | 🔒🏢 | → status closed |
| GET | `/api/effy/reviews?workspace=ws_N` | 🔒🏢 | → `{reviews:[...]}` |
| POST | `/api/effy/reviews/:id/respond` | 🔒🏢 | → responded=true ("Mark as replied": nothing is posted to Google yet, G32) |
| PUT | `/api/effy/conversations/:id/tags` | 🔒🏢 write | `{tags[≤8, ≤24 chars]}` (case-insensitive dedupe) → `{conversation}` |
| POST | `/api/effy/conversations/:id/escalate` | 🔒🏢 write | `{to: member user id, note}` → `{conversation}` — urgent, assigned, and in the notification centre until resolved · 400 not an active member |
| DELETE | `/api/effy/conversations/:id/escalate` | 🔒🏢 write | resolves the escalation → `{conversation}` |
| GET | `/api/effy/reviews/request-link?workspace=ws_N` | 🔒🏢 | → `{link:{slug, url, visits, clicks}\|null, sites[]}` |
| PUT | `/api/effy/reviews/request-link` | 🔒🏢 write | `{workspace, sites:[{id: google\|facebook\|other, label, url (https)}]}` → `{link}` · one link per workspace |
| GET | `/api/effy/public/reviews/:slug` | 🔓 | → `{business:{name, logo}, sites[]}` — every visitor sees every site, whatever their rating (no review gating) · 404 |
| POST | `/api/effy/public/reviews/:slug/click` | 🔓 | counts a click → `{status}` |
| POST | `/api/effy/public/reviews/:slug/feedback` | 🔓 | `{name?, rating, text, website:""}` → private feedback that lands in Reviews as a direct review · honeypot `website` · 429 after 5 an hour |

## Analytics
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/effy/analytics/organic?workspace=ws_N` | 🔒🏢 | real sources only (5.9): `{sources:{instagram, posts:{published, measured}}, account, kpis:{followers, reach28, views28, profileViews28, accountsEngaged28, interactions28, linkTaps28, postEngagement}, reachSeries, followerGrowth, audience, topPosts[], bestTimes:{available, rows, best, reason}, working:{bestPost, bestFormat, bestHook, bestTime}}` — `null` where Instagram gives no number; best times need 6 measured posts |
| GET | `/api/effy/insights/instagram?workspace=ws_N` | 🔒🏢 | the connected Instagram account's 28-day totals and series (Graph v25, cached 5 minutes) |
| GET | `/api/effy/analytics/leads?workspace=ws_N` | 🔒🏢 | `{provider:"live", spendProvider:"mock", kpis:{total,qualified,qualificationRate,won,pipelineValue,costPerQualified}, funnel[], bySource[], byCampaign[], quality[], lostReasons[], outcomes[]}` |
| GET | `/api/effy/analytics/revenue?workspace=ws_N` | 🔒🏢 | `{provider:"live", spendProvider:"mock", attributionModel:"last-touch", kpis:{revenue,customers,avgDeal,spend,cac,roas}, byChannel[], byCampaign[]}` |
| GET | `/api/effy/analytics/creative?workspace=ws_N` | 🔒🏢 | `{organic:{published, measured, byFormat[], byHook[], bestFormat, bestHook, posts[]}, provider, mode, creatives[], attributes}` — `organic` compares your own published posts (a post counts once its numbers were read); `creatives` come from the ads adapter |

Organic analytics shows only real numbers (Instagram and posts published through EffySocial); nothing is derived or invented. **Lead/revenue analytics aggregate real `effy_leads` rows** (funnel by stage, source/campaign rollups, lost reasons, sales outcomes; revenue = won-stage + purchase-completed leads, last-touch to campaign/channel). Ad spend (cost/qualified, CAC, ROAS denominators) and ad creative rows come from the **ads adapter** (`spendProvider`, `mode` mock or sandbox until live ad accounts, plan 6.11).

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
**Outcomes (§14.7 closed loop):** `invalid|duplicate|unreachable` (negative) · `qualified|appointment_completed|purchase_completed` (positive). A **changed** outcome appends a note and records one `kind:"offline"` row in `effy_tracking_events` holding a ready Meta CAPI event and Google offline conversion (email/phone hashed per platform, never stored raw; fbclid/gclid from the lead's first submission); the note says *ready*, not sent — sending waits on provider access (6.12). Re-marking the same value is a no-op.

## Convert — Forms  ([Convert-Forms.md](modules/Convert-Forms.md))
Authed:
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/forms?workspace=ws_N` | 🔒🏢 | → `{forms[]}` (with submission counts) |
| POST | `/api/effy/forms` | 🔒🏢 write-role | `{workspace, name, type?, fields?, campaignId?, consent_text?, thankyou?}` → `{form}` (slug generated) |
| PATCH | `/api/effy/forms/:id` | 🔒🏢 write-role | `{name?, fields?, status?, consent_text?, thankyou?, campaignId?}` → `{form}` |
| GET | `/api/effy/forms/:id/submissions` | 🔒🏢 | → `{total, shown, submissions:[{…, lead:{id, name, stage, outcome}\|null}]}` (up to 200) |

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
| POST | `/api/effy/landing/quick-site` | 🔒🏢 write | `{workspace, brief}` → `{brief, options[3]}` — one line → AI copy grounded in Brand Brain → three styled options; nothing stored until one is published · 400 empty brief |
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
Native sources (forms/landing/whatsapp) are computed live from real submissions, page views and leads; pixel sources (Meta Pixel/Google Tag) and domain verification go through `get_tracking_provider(ws)` — mock until pixel access (6.12). Lead outcomes' conversion events are shown as ready, not sent. Test events persist in `effy_tracking_events`.

## Convert — Follow-up Automation  ([Convert-Followups.md](modules/Convert-Followups.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/followups?workspace=ws_N` | 🔒🏢 | → `{workflows[]}` |
| POST | `/api/effy/followups` | 🔒🏢 write-role | `{workspace, name, trigger?, steps?}` → `{workflow}` (status starts `draft`) · 400 invalid trigger/steps |
| PATCH | `/api/effy/followups/:id` | 🔒🏢 write-role | `{name?, status?(draft\|active\|paused), trigger?, steps?}` → `{workflow}` |
| GET | `/api/effy/followups/:id/runs` | 🔒🏢 | → `{runs[{id,lead,log[],at}]}` (last 20) |
| POST | `/api/effy/followups/:id/dry-run` | 🔒🏢 | `{lead?:{name,phone,email,source,stage,quality,channel}}` → `{log[{step,text}]}` — sample lead, **no side effects**, works on drafts |

**Workflow shape:** `{id, workspaceId, name, status, trigger:{type:lead_created\|stage_changed, source?, stage?}, steps[≤10]:[{kind:condition\|delay\|action, …}], runs, created}`.
**Execution:** active workflows start inside the lead transaction — on lead create (`/leads`, convert-from-conversation, public form submit) and on pipeline stage changes — and walk their steps until done, stopped or a delay. A delay makes the run wait (`status: waiting`, `resume_at`); the `resume-followups` scheduler job carries it on, re-checking the lead as it is then, and stops it if the lead or workflow is gone. Email really sends (reply-to the organisation owner; outside inboxes need the verified sending domain, G06); WhatsApp, SMS and AI voice are recorded as *not sent — isn't connected yet*, never as sent. `assign_salesperson` sets the lead owner. Runs persist in `effy_followup_runs`.

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
| GET | `/api/effy/ads/rules?workspace=ws_N` | 🔒🏢 | `{provider, mode, rules[], alerts[], checkedAt}` — alerts from the `check-ad-rules` job (every 30 minutes; a pause rule only suggests) |
| POST | `/api/effy/ads/rules` | 🔒🏢 write | `{workspace, name, metric:cpl\|roas\|ctr\|pacing, op:gt\|lt, threshold, action:pause\|notify, scope?}` → `{rule}` |
| PATCH/DELETE | `/api/effy/ads/rules/:id` | 🔒🏢 write | `{workspace, enabled?}` → `{rule}` / `{}` · 404 unknown rule · a blank threshold is refused, never saved as 0 |
| POST | `/api/effy/ads/rules/alerts/:id/dismiss` | 🔒🏢 write | `{workspace}` → `{alert}` — put away until the campaign leaves the rule and breaches it again |
| GET | `/api/effy/ads/analytics?workspace=ws_N` | 🔒🏢 | active campaigns' spend by platform, objective, creative format and audience; impressions → clicks → leads funnel; weekly cost-per-lead; cheapest and dearest campaign — from the same ads adapter (sandbox-badged) |
| POST | `/api/effy/ads/rules/dry-run` | 🔒🏢 | `{workspace}` → `{mode, results[{ruleId,rule,matches[{campaignId,campaign,metric,value,threshold,op,suggestedAction}]}]}` — read-only, suggestions never auto-applied |

The **integration-adapter pattern**: `get_ads_provider(workspace)` returns `SandboxAdsProvider` (writable, deterministic, badged `mode:"sandbox"`) when the sandbox integration row is enabled, `MockAdsProvider` (`mode:"mock"`, UI shows the connect state) otherwise; real Meta/Google providers land in 6.11 behind the same interface with `mode:"live"`.

## Strategy Intelligence + Workflows  ([Workflows-Intelligence.md](modules/Workflows-Intelligence.md))
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/effy/strategy/trends?workspace=ws_N` | 🔒🏢 | `{provider, trending[], hashtags[], formats[], gaps[], seasonal[], yourBestFormat?, basis:{trending, gaps, seasonal, hashtags, formats}}` — each `basis` says `{source, asOf, covers, limits}`; gaps come from real posts, `yourBestFormat` only from published posts with numbers |
| GET | `/api/effy/strategy/competitors?workspace=ws_N` | 🔒🏢 | `{provider:"tracked", competitors[], basis}` — the competitors you added (no metrics are invented) |
| POST | `/api/effy/strategy/competitors` | 🔒🏢 write | `{workspace, name, links?, notes?}` → `{competitor}` · 400 no name |
| DELETE | `/api/effy/strategy/competitors/:id` | 🔒🏢 write | → `{status}` · 404 |
| GET | `/api/effy/studio/context?workspace=ws_N` | 🔒🏢 | `{brand:{tone,approved,prohibited}, trends[], competitorAngles[]}` — powers the Studio context rail |
| POST | `/api/effy/studio/generate` | 🔒🏢 write | now accepts optional `trend` / `angle` → woven into the grounded prompt, echoed in `cited[]` |
| POST | `/api/effy/studio/send-to-approval` | 🔒🏢 write | `{workspace, caption, hook?, channel?, type?, campaignId?, mediaUrl?}` → creates `internal_review` post (with the image or video to publish) → `{postId}` · `mediaUrl` checked as for `POST /posts` |

**Interlink:** Trends/Competitors → Studio context rail → generation consumes the chosen trend/angle → Send-to-approval creates a review post. The **Content Sprint playbook** (`/app/playbooks`) chains these with context flowing via query params.

## Ideas  ([Strategy.md](modules/Strategy.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/ideas?workspace=ws_N` | 🔒🏢 | → `{ideas:[{id, title, notes, stage: captured\|developing\|ready, heat, source}]}` |
| POST | `/api/effy/ideas` | 🔒🏢 write | `{workspace, title, notes?, heat?, source?}` → `{idea}` · 400 no title |
| PATCH | `/api/effy/ideas/:id` | 🔒🏢 write | `{title?, notes?, stage?}` → `{idea}` · 400 unknown stage · 404 |
| DELETE | `/api/effy/ideas/:id` | 🔒🏢 write | → `{status}` · 404 |
| POST | `/api/effy/ideas/generate` | 🔒🏢 | `{workspace}` → `{ideas[], provider}` — suggestions from Brand Brain, the season and real content gaps; nothing is saved · 503 |

## Workflows (playbooks)  ([Workflows-Intelligence.md](modules/Workflows-Intelligence.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/workflows?workspace=ws_N` | 🔒🏢 | → `{workflows[], templates:[{key, name, steps}]}` |
| POST | `/api/effy/workflows` | 🔒🏢 write | `{workspace, template, campaignId?}` or `{workspace, template, name, objective?, budget?}` (creates the campaign as step 1) → `{workflow}` · 400 unknown template or campaign |
| GET | `/api/effy/workflows/:id` | 🔒🏢 | → `{workflow}` with each step's state computed from the campaign's real linked rows |
| PATCH | `/api/effy/workflows/:id` | 🔒🏢 write | `{step, action: done\|skip\|reset}` / `{adsDraft}` / `{status: archived}` → `{workflow}` · 400 |

## Campaign reports  ([Analytics.md](modules/Analytics.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/campaigns/:id/report` | 🔒🏢 | → `{report}` — spend, leads, CPL, ROAS, pacing, reach, engagement (`null` where unknown, never 0 by default) and recommended actions, from the same calculation as the campaign workspace |
| POST | `/api/effy/campaigns/:id/report/share` | 🔒🏢 write | `{days: 7\|30\|90}` → `{share, url}` — a read-only link to a frozen copy; the token is shown once and stored hashed · 400 |
| GET | `/api/effy/campaigns/:id/report/shares` | 🔒🏢 | → `{shares:[{id, createdAt, expiresAt, revoked}]}` |
| DELETE | `/api/effy/reports/shares/:id` | 🔒🏢 write | stops the link → `{share}` |
| GET | `/api/effy/public/reports/:token` | 🔓 | → `{report, sharedAt, expiresAt}` (business name only) · 404 unknown · 410 expired or stopped |

PDFs are built in the browser (`src/app/reportPdf.js`, jsPDF); the sample workspace's reports say *Sample data*.

## Ad Films  ([AI-Studio.md](modules/AI-Studio.md) · engine `filmlab.py`)
Seven stages with server gates: direction → script → stills → animate → voice → assemble → deliver. Every scene clip and voice-over stores a fingerprint of what it was made from, so a changed still or line marks it (and the master) out of date. Credits and each film's `budgetUsd` apply (402 over budget for non-admins; admins get `budgetWarning`).

| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/films?workspace=ws_N` | 🔒🏢 | → `{films[]}` newest first, with `posterUrl` |
| POST | `/api/effy/films` | 🔒🏢 write | `{workspace, title?, client?, product?, aspect: 16:9\|9:16, durationS? (8–600), language?, budgetUsd?}` → `{film}` |
| GET | `/api/effy/films/:id` | 🔒🏢 | → `{film}` |
| PATCH | `/api/effy/films/:id` | 🔒🏢 write | `{direction?, styleBlock?, endCard?, durationS?, stage?, status?, revisionAllowance?, budgetUsd? (admins)}` → `{film}` · 409 a stage jump past its gate |
| DELETE | `/api/effy/films/:id` | 🔒🏢 write | → `{status}` |
| POST | `/api/effy/films/:id/asset` | 🔒🏢 write | multipart `file` (≤15 MB) → `{film, analysis}` — vision analysis merges suggestions into unset direction fields · 400 |
| POST | `/api/effy/films/:id/direction-options` | 🔒🏢 write | → `{film}` with four option sets built from the analysed assets (palettes from the brand's colours) · 400 no assets · 503 |
| POST | `/api/effy/films/:id/script` | 🔒🏢 write | `{brief?, scenes?, sceneSeconds? (4\|6\|8)}` → `{film}` — scenes with approved stills are kept · 503 |
| POST | `/api/effy/films/:id/script/import` | 🔒🏢 write | `{text, sceneSeconds?}` → `{film}` — a pasted script structured into scenes, keeping its spoken lines · 400 too short · 503 |
| PATCH | `/api/effy/films/:id/scenes/:sceneId` | 🔒🏢 write | `{seconds?, line?, visual?, motion?}` → `{film, scene}` |
| POST | `/api/effy/films/:id/scenes/:sceneId/redraft` | 🔒🏢 write | `{field: line\|visual}` → `{scene}` — AI rewrite in the film's style; resets the still's approval when the visual changes · 503 |
| POST | `/api/effy/films/:id/scenes/:sceneId/still` | 🔒🏢 write | `{edit?}` → `{film, scene, budgetWarning?}` — Nano Banana 2, seed-chained for consistency · 402 budget · 429 cap · 502 |
| POST | `/api/effy/films/:id/scenes/:sceneId/approve` | 🔒🏢 approval | `{approved, note?}` → `{film, scene}` — records who signed off (a Client approver may) |
| POST | `/api/effy/films/:id/scenes/:sceneId/animate` | 🔒🏢 write | → `{scene, budgetWarning?}` (Veo operation started) · 409 until every still is approved · 402 · 429 · 503 |
| POST | `/api/effy/films/:id/scenes/:sceneId/animate/status` | 🔒🏢 | → `{scene}` when the clip is ready (with an audio listen-pass) · a refusal answers `{message, reason, charged:false}` and refunds |
| GET | `/api/effy/films/voices/search?q=` | 🔒 | ElevenLabs shared library → `{voices[]}` · 409 while the account is on the free plan (library voices off) |
| POST | `/api/effy/films/:id/voice-adopt` | 🔒🏢 write | `{voiceId, ownerId, name}` → `{film}` · 409 library voices off |
| POST | `/api/effy/films/:id/vo` | 🔒🏢 write | `{voice?}` → `{film, overruns[], underruns[], tightened[]}` — every line read and measured against its beat; small overruns sped up to 1.15× · 502 |
| POST | `/api/effy/films/:id/scenes/:sceneId/vo` | 🔒🏢 write | `{line?}` → `{scene, speed, over, under, targetWords}` — one line re-read |
| POST | `/api/effy/films/:id/scenes/:sceneId/fit` | 🔒🏢 write | → `{scene, was, line, speed, over}` — *Shorten to fit*: rewritten to the beat's word count and re-read · 400 no line · 503 |
| POST | `/api/effy/films/:id/assemble` | 🔒🏢 write | → `{film}` (master with beat-timed voice-over, music and logo end card, plus a QA listen-pass) · 409 `{blockers[]}` until every scene has a clip · 502 |
| POST | `/api/effy/films/:id/signoff` | 🔒🏢 approval | `{stage: master\|cutdown, target?, decision: approved\|changes, note?}` → `{film, signoff}` · counts revision rounds against the allowance · 409 out of date |
| POST | `/api/effy/films/:id/exports` | 🔒🏢 write | → `{film}` with 16:9, 9:16 (blur-padded) and WhatsApp 480p exports · 409 needs an approved, current master |
| POST | `/api/effy/films/:id/personalize` | 🔒🏢 write | `{dealers}` → `{variants}` — end-card variants (removed from the UI on 24 Sep; the route stays) |

## Product Shots  ([AI-Studio.md](modules/AI-Studio.md) · engine `productlab.py`)
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/product-shots?workspace=ws_N` | 🔒🏢 | → `{shots[]}` |
| POST | `/api/effy/product-shots` | 🔒🏢 write | `{workspace, title?, product?, style?, aspect?}` → `{shot}` |
| GET / PATCH / DELETE | `/api/effy/product-shots/:id` | 🔒🏢 (write) | → `{shot}` · PATCH `{aspect?, budgetUsd? (admins)}` |
| GET | `/api/effy/product-shots/music` | 🔒 | → `{music[]}` built-in beds |
| POST | `/api/effy/product-shots/:id/source` | 🔒🏢 write | multipart `photo` (JPG/PNG ≤10 MB) → `{shot}` — the reference every still is locked to · 400 |
| POST | `/api/effy/product-shots/:id/frames` | 🔒🏢 write | `{look?, motion?, seconds?}` → `{shot}` · 400 more than 6 shots |
| PATCH / DELETE | `/api/effy/product-shots/:id/frames/:frameId` | 🔒🏢 write | `{look?, motion?, seconds?}` → `{frame}` / `{shot}` · 400 deleting the last shot |
| POST | `/api/effy/product-shots/:id/frames/:frameId/still` | 🔒🏢 write | → `{frame, shot, budgetWarning?}` — reference-locked still · 409 no product photo · 402 · 502 |
| POST | `/api/effy/product-shots/:id/frames/:frameId/approve` | 🔒🏢 approval | → `{frame}` · 409 no still |
| POST | `/api/effy/product-shots/:id/frames/:frameId/animate` | 🔒🏢 write | → `{frame, budgetWarning?}` · 409 until the still is approved · Ken Burns when Veo is capped |
| POST | `/api/effy/product-shots/:id/frames/:frameId/animate/status` | 🔒🏢 | → `{frame}` · refusals as for films |
| POST | `/api/effy/product-shots/:id/music` | 🔒🏢 write | multipart `music` (mp3/m4a/wav, <15 MB) → `{shot}` · 400 |
| POST | `/api/effy/product-shots/:id/build` | 🔒🏢 write | → `{shot}` with the master (approved, animated shots plus the music bed) saved to Media Library · 409 no animated shot · 502 |

## Personalized Avatar Video  ([AI-Studio.md](modules/AI-Studio.md) · engine `avatarlab.py`)
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/dealer-avatars?workspace=ws_N` | 🔒🏢 | → `{dealers[]}` |
| POST | `/api/effy/dealer-avatars` | 🔒🏢 write | multipart `workspace, name, photo` (+ `shop, city, language`) → `{dealer}` · 400 missing name or photo, >10 MB, not JPG/PNG |
| GET / PATCH | `/api/effy/dealer-avatars/:id` | 🔒🏢 (write) | → `{dealer}` · PATCH `{name?, shop?, city?, language?, voice?, brandLine?}` |
| POST | `/api/effy/dealer-avatars/:id/reference` | 🔒🏢 write | photo → cartoon reference → `{dealer}` · 409 once identity is locked · 429 · 502 |
| POST | `/api/effy/dealer-avatars/:id/pose` | 🔒🏢 write | `{key: greeting\|speaking\|festive}` → `{dealer}` with the pose and an AI-estimated consistency score · 400 no reference |
| POST | `/api/effy/dealer-avatars/:id/lock` | 🔒🏢 write | locks the identity → `{dealer}` · 400 no poses |
| POST | `/api/effy/dealer-avatars/:id/voice-preview` | 🔒🏢 | → `{audioUrl}` · 502 |
| POST | `/api/effy/dealer-avatars/:id/compliance` | 🔒🏢 | → `{script, checks[], passed, total}` — prohibited words, risky claims, slot fit and an AI review, each naming its evidence |
| POST | `/api/effy/dealer-avatars/:id/render` | 🔒🏢 write | → `{dealer}` rendered on the active brand master · 400 not locked · 502 |
| POST | `/api/effy/dealer-avatars/:id/exports` | 🔒🏢 write | → `{dealer, captions}` · 400 not rendered |
| GET | `/api/effy/dealer-avatars/masters?workspace=ws_N` | 🔒🏢 | → the workspace's brand master videos (one active) |
| POST | `/api/effy/dealer-avatars/masters` | 🔒🏢 write | multipart `workspace, file` (≤25 MB), `title?` → the new active master · 400 |
| POST | `/api/effy/dealer-avatars/masters/from-library` | 🔒🏢 write | `{workspace, name, title?}` → a Media Library video as the master · 404 |
| POST | `/api/effy/dealer-avatars/masters/placeholder` | 🔒🏢 write | `{workspace}` → an ffmpeg-built placeholder master |
| PATCH / DELETE | `/api/effy/dealer-avatars/masters/:id` | 🔒🏢 write | `{title?, active?, slots?}` (overlay windows) → the master · DELETE removes it from the list (the video stays in Media Library) |

## Acceptance records  (engine `acceptance.py`)
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/acceptance?workspace=ws_N` | 🔒🏢 | → `{rows:[film, product shot or Studio job with cost, retries, revision rounds, turnaround and verdict], totals}` |
| POST | `/api/effy/acceptance/:kind/:ref` | 🔒🏢 approval | `{workspace, result: accepted\|accepted_with_fixes\|rejected, quality?, defects? (required unless accepted), deliveryHours?, notes?}` → `{record, summary}` · 400 · 404 |

## Media Library & media links  ([Content-Library.md](modules/Content-Library.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/library?workspace=ws_N&type=image\|video` | 🔒🏢 | → `{media[]}` with signed links |
| POST | `/api/effy/library/upload` | 🔒🏢 write | multipart `workspace, file` (JPG, PNG, WEBP, GIF, MP4, MOV, WEBM; ≤30 MB) → `{media, name, url, kind}` · 400 type, empty or too large |
| DELETE | `/api/effy/library/:id` | 🔒🏢 write | → `{status}` · 404 |
| GET | `/api/effy/media/:name?s=…&e=…` | signed link | the file, served by nginx `secure_link` (403 bad signature, 410 expired); app links last 24 h and are re-issued with every response |
| POST | `/api/effy/media/share` | 🔒 | `{url}` (a link the app showed) → `{url, expires}` valid 7 days · 403 not ours · 410 expired |

## Websites  ([Convert-Landing.md](modules/Convert-Landing.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/api/effy/sites/generate` | 🔒🏢 write | `{workspace, template: retail\|restaurant\|clinic\|salon\|realestate\|services, style?}` → `{site, provider}` · 400 unknown template |
| GET | `/api/effy/sites?workspace=ws_N` | 🔒🏢 | → `{sites[]}` |
| GET / PATCH / DELETE | `/api/effy/sites/:id` | 🔒🏢 (write) | → `{site}` · PATCH `{name?, pages?, theme?, style?, contact?, status: draft\|published}` |
| GET | `/api/effy/public/site/:slug` | 🔓 | → `{site}` for `/s/:slug` · 404 draft |

## Integrations & Business Profile  ([Integrations-Framework.md](modules/Integrations-Framework.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/integrations?workspace=ws_N` | 🔒🏢 | → `{integrations:[{provider, label, category, state, status, account, credsConfigured, lastSync, accessEndsAt, daysLeft, reconnectSoon}]}` — an ended connection reads `expired` |
| POST | `/api/effy/integrations/:provider/connect` | 🔒🏢 write | `{workspace, returnTo?}` → `{redirect}` (OAuth, state stored single-use) or `{setup}` steps when credentials are missing · 400 unknown provider |
| GET | `/api/effy/integrations/:provider/callback` | 🔓 (state) | OAuth return → redirects to `/app/integrations?status=connected\|denied\|invalid_state\|exchange_failed&reason=…` |
| POST | `/api/effy/integrations/instagram/connect-token` | 🔒🏢 write | `{workspace, token}` → `{account, igUserId, accessEndsAt}` — development path: a pasted Meta user token exchanged for a long-lived one · 400 |
| POST | `/api/effy/integrations/:provider/disconnect` | 🔒🏢 write | → `{status}` — the stored token is removed |
| GET | `/api/effy/gbp/profile?workspace=ws_N` | 🔒🏢 | → `{profile, mode: mock\|live, categories[]}` |
| POST | `/api/effy/gbp/profile` | 🔒🏢 write | `{workspace, name, category, address, phone?, website?, hours?, description?}` → `{profile, mode}` — patches a synced location, creates otherwise (idempotent requestId) · 400 missing field |
| POST | `/api/effy/gbp/profile/verify` | 🔒🏢 write | `{workspace}` → `{profile, mode, note}` · 404 no profile |

## Admin (platform admins, `EFFY_ADMIN_EMAILS`)  ([Administration.md](modules/Administration.md))
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/effy/admin/settings` | platform admin | → `{settings:{image_provider: google\|flux, video_provider: veo\|free}}` (a stored `imagen` reads as `google`) |
| PATCH | `/api/effy/admin/settings` | platform admin | `{image_provider?, video_provider?}` → `{settings}` — applies to every workspace at once · 400 outside the options |
| GET | `/api/effy/admin/usage` | platform admin | → `{month, totals, limits, workspaces[], recent[]}` — AI usage and estimated cost per workspace |
| GET / POST | `/api/effy/admin/scheduler`, `/api/effy/admin/scheduler/run` | platform admin | see *Scheduled posts publish themselves* under Publish |
| GET / PATCH | `/api/effy/admin/orgs`, `/api/effy/admin/orgs/:id` | platform admin | see Plans and billing |
| GET | `/api/effy/admin/interest` | platform admin | see Notify me when ready |

