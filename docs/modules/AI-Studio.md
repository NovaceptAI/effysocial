# Module: AI Studio

> The 3-panel content creation studio for copy + visuals, brand-aware and score-checked. _Status: ✅ frontend done · 🔌 backend pending._
> Spec ref: §10.2–10.3 · Phase 1

## 1. What it does
Where users create platform-shaped content with AI. A brief (or a campaign/trend/product/URL/document) plus Brand Brain context produces copy and visuals, with live variants, creative quality scores (each explained), and an accurate channel preview before it goes to the calendar/approvals.

## 2. Where it lives
- **Route:** `/app/studio` (optionally `?type=&campaign=`)
- **Frontend files:** `src/app/pages/AIStudio.jsx`, helpers in-file; brand context via `src/app/data/brandBrain.js`.
- **Folds in existing tools:** copy ← Campaign Generator engine; visual ← image-gen (`/api/social/image`), Lip Sync (`/lipsync`), Leadership Photo (`/photo`).
- **Backend (when built):** reuse existing `app/tools/social` (Groq copy + image) + new `content_item` persistence.

## 3. Screens & key UI
Three-panel editor:
- **Left** — content type (IG post/carousel/reel/story, FB, LinkedIn, X/thread, YouTube, GBP, Ad, Blog, Email, WhatsApp), creation mode (brief/campaign/trend/product/URL/document/repurpose/variants-from-winner), brief inputs, and **Brand context** chips (tone + approved words pulled from Brand Brain), language (English/Hindi/Hinglish…).
- **Centre** — Copy ⇄ Visual tabs.
  - Copy: caption editor + AI tools (Generate, Rewrite, Shorten, Expand, Change tone, Add CTA, Hooks, Hashtags, Translate, Hinglish, Keywords).
  - Visual: canvas/placeholder + tools (AI image, Background removal, Resize/aspect, Carousel, Thumbnail, Text overlay, Logo placement, Safe-zone) — Lip Sync & Photo open the existing tools.
- **Right** — Variants, **Creative scores** (§10.3: brand alignment, hook, CTA, platform suitability, readability, ad-policy risk, predicted engagement) each with explanation + suggested fix, **channel preview** (desktop/mobile toggle), comments.
- Actions: Save draft, Send to approval, Add to calendar.

## 4. Data model
`ContentItem`: id, workspace_id, campaign_id?, type, platform, mode, brief{topic,audience,tone,language}, copy{caption|thread[], hooks[], hashtags[], cta}, visual{image_ref, aspect, layers}, variants[], scores{...}, status [draft|in_review|approved|scheduled|published], created_by, updated_at.

## 5. Connections (object graph)
- Reads **Brand Brain** (tone, approved/prohibited words, offers, compliance) as generation context; cites which facts were used.
- Optionally attached to a **Campaign** (`campaign_id`) — appears in that campaign's Content tab.
- Output flows to **Calendar/Scheduled → Approvals → Published**.
- A published item can become an **Ad creative** (Advertise) or be repurposed.

## 6. AI involvement
Content agent (copy) + Creative agent (visual + scoring). Each generation records the Brand Brain facts cited and produces explainable scores (detected/why/fix). Compliance linter (existing) gates risky claims.

## 7. Integrations
Image providers (Cloudflare FLUX / Pollinations — existing), Lip Sync (Sync Labs — existing), Photo (rembg — existing). Publishing handled by the Publish module, not here.

## 8. States
Empty (pick a type / start from), generating (skeleton), variant compare, low-score warning, compliance flag, image-provider unavailable, save/approve success.

## 9. Backend contract (to implement)
- **Tables:** `content_item`, `content_variant`, `creative_score`.
- **Endpoints:** `POST /api/studio/generate` (type, brief, brand_ctx) → copy + cited facts + scores; `POST /api/studio/visual` (prompt, aspect) → image (reuse `/api/social/image`); `POST /api/studio/rewrite|shorten|expand|tone|translate`; `POST /api/content` / `PATCH /api/content/:id` (persist draft); `POST /api/content/:id/submit` (→ approvals).
- **RBAC:** copywriter/designer/strategist create; client-approver comment only.
- **Limits:** AI credit per generation; image quota.

## 10. Open questions / TODO
- Carousel multi-slide builder + video script editor depth.
- Repurpose (blog→posts, long video→clips) flows.
