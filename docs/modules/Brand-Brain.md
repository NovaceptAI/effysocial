# Module: Brand Brain

> The living knowledge centre for a workspace; every AI output draws from it. _Status: ✅ frontend + ✅ backend (facts/sources persistence + Groq-grounded test voice). RAG over large docs (pgvector) pending an embedder._
> Spec ref: §8.3 · Phase 1

## 1. What it does
Stores everything the AI needs to sound like the brand and stay compliant: summary, tone, approved/prohibited words, products, offers, personas, FAQs, objection handling, competitors, visual identity, and legal/compliance rules. Content is extracted from uploaded sources (website, docs) or entered manually, each item tracking which sources influenced it and a confidence/freshness signal. A "Test brand voice" area lets users verify generations before relying on them.

## 2. Where it lives
- **Route:** `/app/brand`
- **Frontend files:** `src/app/pages/BrandBrain.jsx`, data `src/app/data/brandBrain.js`
- **Backend (when built):** blueprint `app/tools/brand/`, tables below; RAG via existing **pgvector** + embeddings in novalab-engine.

## 3. Screens & key UI
- Health strip: completeness %, "needs review" count, last updated.
- Left section navigator (13 sections) with per-section status dots (good/review/empty).
- Section content renderers by `kind`: paragraph, chips (approved=green / prohibited=red), list, personas, faqs, visual (swatches+fonts), sources (type icon + freshness + confidence bar).
- Source-attribution chips under each section ("Sources: Website, Brand guidelines.pdf").
- Actions: Import website, Upload, **Test brand voice** (prompt → sample output citing sources).

## 4. Data model
`brandBrainFor(workspace)` returns: `completeness`, `needsReview`, `lastUpdated`, and per-section `{ status: good|review|empty, sources: string[], data }` where `data` shape depends on section `kind`.

Backend tables:
- `brand_brain` (id, workspace_id, completeness, updated_at)
- `brand_fact` (id, brand_brain_id, section, kind, payload jsonb, status, confidence, created_by, updated_at)
- `brand_source` (id, brand_brain_id, name, type [website|document|manual], url/file_ref, confidence, freshness, embedded_at, last_synced)
- `brand_fact_source` (fact_id, source_id) — which sources influenced each fact (the attribution chips)

## 5. Connections (object graph)
- **AI Studio** & all agents read Brand Brain as RAG context (tone, approved/prohibited words, offers, compliance) and must cite the facts used.
- **Campaign / Marketing Plan** pull personas, offers, pillars.
- **Engage (Community agent)** answers FAQs/objections from here.
- **Compliance** rules here gate generated copy (ties to the existing campaign compliance linter).
- Writes back: "winning content" and approved replies can be promoted into Brand Brain facts over time.

## 6. AI involvement
Every agent reads it. A future "Brand extraction" job parses uploaded sources → suggested facts (status=`review`) for human confirmation (suggested extraction + conflict resolution + version history per spec).

## 7. Integrations
Website import (fetch + parse), document upload (S3 — engine already has S3 helpers), embeddings (voyage/local already configured). No social/ad APIs.

## 8. States
Empty (new workspace → guided import), partial (some sections empty), needs-review (amber), stale source (freshness badge), generating (test voice), error (import/parse failure with retry).

## 9. Backend contract (to implement)
- **Tables:** as §4.
- **Endpoints:**
  - `GET /api/brand/:workspaceId` → full brain (sections + sources + completeness).
  - `POST /api/brand/:workspaceId/fact` (section, kind, payload) → upsert fact.
  - `POST /api/brand/:workspaceId/source` (type, url|file) → ingest + embed (async job) → returns source + extracted suggested facts.
  - `POST /api/brand/:workspaceId/test` (prompt) → sample generation with cited fact ids.
  - `GET /api/brand/:workspaceId/sources/:id/status` → embedding/sync status.
- **Jobs:** website crawl + chunk + embed; document parse + embed; recompute completeness.
- **RBAC:** strategist/admin edit; others read; client-approver read-only.
- **Limits:** source size caps; per-workspace embedding credits.

## 10. Open questions / TODO
- Conflict-resolution UX when two sources disagree (spec mentions it; not yet built).
- Version history view.
