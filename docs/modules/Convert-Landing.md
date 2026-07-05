# Module: Convert — Landing Pages

> Hosted, brand-accented landing pages with embedded lead capture and WhatsApp/call CTAs. _Status: ✅ frontend + backend + public page (Phase 2 slice 4) · spec §14.1._

## 1. What it does
Compose a landing page from sections (hero, features, testimonial, lead form, WhatsApp CTA, call CTA), generate on-brand copy with AI, publish, and share `/p/:slug`. Visits are counted; the embedded form feeds the lead pipeline with UTM attribution (reuses the Forms public flow end-to-end).

## 2. Where it lives
- **App route:** `/app/landing` — list + section editor + publish + share.
- **Public route:** `/p/:slug` — hosted page (no auth), brand accent + workspace name, passes `utm_*` through to the embedded form submission.
- **Backend:** `app/tools/effy/landing.py` → authed `/api/effy/landing*` + public `/api/effy/public/landing/:slug`; table `effy_landing_pages`.

## 3. Data model
`EffyLandingPage`: id, workspace_id, campaign_id?, name, slug (unguessable), status (draft|published), sections JSON `{hero:{headline,sub,cta}, features:{title,items[]}, testimonial:{quote,author}, enabled:{features,testimonial,form,whatsapp,call}}`, form_slug?, whatsapp, phone, views, created_at.

## 4. AI copy
`POST /api/effy/landing/:id/ai-copy {topic?}` → Groq generation grounded in Brand Brain (tone/approved/prohibited + products) returning `{headline, sub, cta, features[]}` — write-role gated (burns credits).

## 5. Backend contract
Authed (🔒🏢, write-role for mutations): `GET /landing?workspace=` · `POST /landing` · `PATCH /landing/:id` (sections/status/form_slug/whatsapp/phone/name) · `POST /landing/:id/ai-copy`.
Public: `GET /public/landing/:slug` → page def (published only; increments `views`; includes `formSlug` for inline embed) · 404 drafts.

## 6. Connections
- Embedded form = an existing **published effy_form** → submissions → **leads** (source=form) with UTM.
- WhatsApp CTA = `wa.me/<number>?text=…`; Call CTA = `tel:`. Campaign attribution via `campaign_id`.
- `views` + form submissions ≈ landing conversion rate (Tracking Centre later).

## 7. Tests
CRUD + publish gate, public GET increments views + hides drafts, AI copy (Groq mocked) grounded prompt, tenancy/RBAC matrix.
