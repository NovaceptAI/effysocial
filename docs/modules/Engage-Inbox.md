# Module: Engage — Unified Inbox, Comments, Reviews, Leads

> One place to handle every conversation across channels, with AI assist and lead hand-off. _Status: ✅ frontend + ✅ backend (conversations reply/close, reviews respond)._
> Spec ref: §12 · Phase 1

## 1. What it does
Aggregates comments, DMs, mentions, ad comments and reviews into a single inbox where the team (and an AI community manager) can triage, reply, detect sales intent vs complaints, and convert conversations into leads.

## 2. Where it lives
- **Routes:** `/app/inbox`, `/app/comments`, `/app/reviews`, `/app/engage-leads`
- **Frontend files:** `src/app/pages/Inbox.jsx`, `Reviews.jsx`; data `src/app/data/sampleData.js` (`conversationsFor`, `reviewsFor`).
- **Backend (when built):** blueprint `app/tools/engage/`; tables below; webhooks for inbound messages.

## 3. Screens & key UI
- **Unified Inbox (3-pane):** left = queues (All/Unread/Mentions/DMs/Sales intent/Complaints) + channel filters with counts; centre = conversation list (person, channel, preview, time, sentiment, unread); right = conversation thread + **customer context** + **AI-suggested reply** + actions (Reply, Assign, Tag, Convert to lead, Escalate, Close) + SLA timer.
- **Reviews:** rating distribution + average, review feed with source/sentiment/response-status and AI-suggested replies; review-request action.
- **Comments / Engage-Leads:** filtered views over the same data (comments-only; conversational leads → hand to pipeline).

## 4. Data model
`Conversation`: id, workspace_id, channel, kind [comment|dm|mention|review|ad_comment], person{name,handle}, sentiment, intent [sales|complaint|question|spam], priority, assignee, status [open|pending|closed], messages[{from:them|us, text, time}], suggested_reply, lead_id?.
`Review`: id, workspace_id, source, author, rating, text, time, sentiment, responded, suggested_reply.

Backend tables: `conversation`, `message`, `review`, `saved_reply`.

## 5. Connections (object graph)
- Inbound tied to a **published_post**/**ad** when it's a comment on one.
- **Convert to lead** creates a `Lead` (Convert module) with source = this conversation.
- **Brand Brain** powers AI replies (FAQs, tone, approved words) and routing rules.
- Complaint/anger → escalation task; sentiment + volume feed **Social Listening** + Overview alerts.

## 6. AI involvement
Community agent: drafts replies, detects intent/anger/urgency, answers FAQs from Brand Brain, **routes legal/medical/financial/complaints to a human**, suggests sales follow-up, learns from approved replies. Every reply is clearly marked suggested vs approved vs sent.

## 7. Integrations
MessagingProvider adapter: Instagram/Facebook comments+DMs, Google Business, WhatsApp (Phase 2). Mock now. Some channels are read-only via API — surfaced as such.

## 8. States
Empty (inbox zero), unread, pending-reply, SLA-breach, complaint/urgent flag, spam, AI-suggested (awaiting approval), sent, escalated, channel-disconnected, permission (agents see assigned queues).

## 9. Backend contract (to implement)
- **Tables:** as §4.
- **Endpoints:** `GET /api/engage/conversations?workspace=&queue=&channel=` · `GET /api/engage/conversations/:id` · `POST /api/engage/:id/reply` · `POST /api/engage/:id/assign|tag|close|escalate` · `POST /api/engage/:id/convert-lead` · `GET /api/engage/reviews` · `POST /api/engage/reviews/:id/respond`.
- **Webhooks:** inbound message/comment/review ingestion → conversation upsert + intent/sentiment classification (async).
- **RBAC:** community manager replies; sensitive categories require human; client-approver read.
- **Limits:** AI reply credits; rate-limit auto-replies.

## 10. Open questions / TODO
- Saved replies library + macros.
- Auto-reply safety policy config.
