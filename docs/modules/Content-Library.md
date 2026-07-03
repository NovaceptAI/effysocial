# Module: Content — Ideas, Media Library, Templates

> The content supply chain around AI Studio: capture ideas, store assets, reuse templates. _Status: 🔨 frontend (mock) · 🔌 backend pending._
> Spec ref: §10.1, §10.4, §10.5 · Phase 1

## 1. What it does
Ideas is the kanban where inspiration is captured (from Trends, Listening, or manually) and moves toward production. Media Library holds every asset (images, videos, logos, approved creatives) with tags and usage history. Templates are reusable, brand-locked layouts with dynamic fields.

## 2. Where it lives
- **Routes:** `/app/ideas`, `/app/media`, `/app/templates`
- **Frontend files:** `src/app/pages/Ideas.jsx`, `MediaLibrary.jsx`, `Templates.jsx`; data `src/app/data/contentData.js`.
- **Backend (when built):** `effy_ideas`, `effy_media_assets` (S3-backed — engine has S3 helpers), `effy_templates`.

## 3. Screens & key UI
- **Ideas:** kanban with stages Captured → Researching → Ready → In production → Scheduled; cards carry source (trend/mention/manual), assignee, due date, campaign chip; quick-add; convert to post.
- **Media Library:** filterable grid (type/tag), asset cards with usage count + rights/expiry flag; upload; detail hints.
- **Templates:** gallery by category (industry/channel/campaign); locked-elements badge for agencies; dynamic-field chips; "Use template" → AI Studio.

## 4. Data model
Idea: {id, title, note, stage, source, assignee, due, campaign?}. MediaAsset: {id, name, type, tags[], uses, rights, thumb}. Template: {id, name, category, channel, locked, fields[]}.

## 5. Connections
- Trends/Listening "Save as idea" → Ideas. Idea "Convert to post" → AI Studio (prefilled).
- Media assets attach to content items/ads; usage history links back to posts.
- Templates open in AI Studio with brand fonts/colors (Brand Brain visual).

## 6. AI involvement
AI-expand an idea (→ brief); AI search of media by visual content (later); template copy-fill from Brand Brain.

## 7. Integrations
S3 for asset storage (engine already configured). Stock-media providers later.

## 8. States
Empty boards/library, upload progress, rights-expiring warning, locked template (agency).

## 9. Backend contract (to implement)
- `GET/POST /api/effy/ideas` + `PATCH /api/effy/ideas/:id` (stage moves).
- `GET/POST /api/effy/media` (S3 presigned upload), `GET /api/effy/media/:id`.
- `GET /api/effy/templates`.

## 10. Open questions / TODO
- Drag-drop stage moves (dnd-kit) — enhancement after basic kanban.
- Real S3 upload wiring.
