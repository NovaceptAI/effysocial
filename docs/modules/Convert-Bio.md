# Module: Convert — Link-in-bio

> One hosted profile page for all your links — per-link click analytics, socials, lead form and WhatsApp. _Status: ✅ frontend + backend + public page (Phase 2 slice 8) · spec §14.2._

## 1. What it does
Build a link-in-bio page (avatar, title, bio line, theme, social profiles, up to 12 typed links), publish, and drop `/b/:slug` in every social profile. Page views and per-link clicks are counted; the "Get in touch" button opens the hosted form flow so submissions land in the pipeline with UTM attribution.

## 2. Where it lives
- **App route:** `/app/bio` — list (views/clicks/status) + editor (profile, theme, socials, links, form/WhatsApp).
- **Public route:** `/b/:slug` — hosted page (no auth), themed, brand accent; link clicks POST to the click endpoint; the lead form links to `/f/:formSlug` passing the current `utm_*` query string through.
- **Backend:** `app/tools/effy/bio.py` → authed `/api/effy/bio*` + public `/api/effy/public/bio/:slug*`; table `effy_bio_pages` (migration `f0a4d7c92b18`).

## 3. Data model
`EffyBioPage`: id, workspace_id, name, slug (unguessable), title, bio, avatar (emoji), theme (`warm|dark|mint`), socials JSON `{instagram?,facebook?,youtube?,linkedin?,x?}`, links JSON `[{id,kind,label,url,clicks}]` (kind: `link|product|appointment|payment|featured`, max 12), form_slug?, whatsapp, status (draft|published), views, created_at.

## 4. Link sanitisation & click analytics
Links are cleaned on write: label+url required (else dropped), unknown kinds coerced to `link`, capped at 12. **Click counts are preserved by link `id`** across re-saves/reorders; new rows get fresh ids with 0 clicks. `POST /public/bio/:slug/click {linkId}` increments the matching link (published pages only; 400 unknown link).

## 5. Backend contract
Authed (🔒🏢, write-role for mutations): `GET /bio?workspace=` · `POST /bio` · `PATCH /bio/:id` (name/title/bio/avatar/theme/socials/links/formSlug/whatsapp/status).
Public: `GET /public/bio/:slug` → minimal page def (published only; increments `views`; `formSlug` only when it points at a **published** form in the same workspace) · `POST /public/bio/:slug/click` · 404 drafts.

## 6. Connections
- Lead form = an existing **published effy_form** → hosted `/f/:slug` flow → **leads** (source=form) with UTM (bio page forwards `utm_*` params).
- WhatsApp button = `wa.me/<number>?text=…`. Workspace accent colours the page.
- `views` + per-link `clicks` = click analytics per spec §14.2; retargeting pixels arrive with Phase 3 providers (Tracking Centre).

## 7. Tests
`test_effy_bio.py`: CRUD + defaults, link sanitisation + click preservation by id, publish gate + view counting, click validation (draft 404 / unknown 400), form-slug gating to published same-workspace forms, theme/profile updates; tenancy + RBAC matrices.
