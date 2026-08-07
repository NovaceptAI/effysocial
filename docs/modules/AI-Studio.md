# Module: AI Studio

> Brand-aware copy, images, video, characters and post-production. _Status: ✅ live frontend + backend._
> Spec ref: §10.2–10.3 · Phase 1

## 1. What it does
Where users create platform-shaped content with AI. A brief (or a campaign/trend/product/URL/document) plus Brand Brain context produces copy and visuals, with live variants, creative quality scores (each explained), and an accurate channel preview before it goes to the calendar/approvals.

## 2. Where it lives
- **Route:** `/app/studio` (optionally `?type=&campaign=`)
- **Frontend:** `src/app/pages/AIStudio.jsx`; specialist flows under `src/app/components/` (Storyboard, AvatarStudio, CharactersStudio, ProductShotStudio).
- **Backend:** `app/tools/effy/studio.py`, `characters.py`, `avatarlab.py`, `audio.py`, `veo.py`, and `medialib.py`.

## 3. Screens & key UI
Three-panel editor:
- **Left** — content type (IG post/carousel/reel/story, FB, LinkedIn, X/thread, YouTube, GBP, Ad, Blog, Email, WhatsApp), creation mode (brief/campaign/trend/product/URL/document/repurpose/variants-from-winner), brief inputs, and **Brand context** chips (tone + approved words pulled from Brand Brain), language (English/Hindi/Hinglish…).
- **Centre** — Copy ⇄ Visual tabs.
  - Copy: caption editor + AI tools (Generate, Rewrite, Shorten, Expand, Change tone, Add CTA, Hooks, Hashtags, Translate, Hinglish, Keywords).
  - Visual: canvas/placeholder + tools (AI image, Background removal, Resize/aspect, Carousel, Thumbnail, Text overlay, Logo placement, Safe-zone) — Lip Sync & Photo open the existing tools.
- **Right** — Variants, **Creative scores** (§10.3: brand alignment, hook, CTA, platform suitability, readability, ad-policy risk, predicted engagement) each with explanation + suggested fix, **channel preview** (desktop/mobile toggle), comments.
- Actions: Save draft, Send to approval, Add to calendar.
- **Agent image embed:** after generating an image, upload an agent photo, choose placement and optional art direction, then create one identity-preserving composite saved to Media Library.
- **Agent video outro:** after generating a video, pick an existing EffyCharacter or upload a photo, enter a ≤16-word CTA, then generate the speaking clip and append it to the ad.

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
Image generation/editing (Gemini/Imagen or configured provider), video (Veo/local fallback), ElevenLabs TTS, Sync Labs lip-sync, and local ffmpeg assembly. Publishing is handled by Publish.

## 8. States
Empty (pick a type / start from), generating (skeleton), variant compare, low-score warning, compliance flag, image-provider unavailable, save/approve success.

## 9. Backend contract
- **Persistence:** generated outputs are indexed in `effy_media`; reusable speakers in `effy_characters`.
- **Agent endpoints:** `POST /api/effy/studio/embed/image`; `POST /api/effy/studio/embed/video/stitch`; character create/speak/status endpoints.
- **Security:** workspace ownership is checked for every referenced media/character; write RBAC applies to generation and stitching.
- **Limits:** image, Veo and avatar renders use the existing monthly usage meters.

## 10. Open questions / TODO
- Carousel multi-slide builder + video script editor depth.
- Repurpose (blog→posts, long video→clips) flows.
