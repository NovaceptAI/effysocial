# Brand Brain — Deep Dive & Completion Plan

_Created 2026-07-21. The goal: **when a Brand Brain exists, everything (trends, ideas, campaigns, prompts) is molded to it.** This doc is the working plan — check items off as we build._

## Where things stand today

### The model is rich (backend)
`app/tools/effy/brand.py` + models `EffyBrandFact` / `EffyBrandSource`. **12 sections**, each `{status, sources, data}`:

`summary · tone · approved (words) · prohibited (words) · products · offers · personas · faqs · objections · competitors · visual (colors/fonts) · legal`

- `_build_brain(ws)` starts **empty** (no invented content) and fills only from saved facts; computes a **completeness %** and a **needsReview** count.
- Endpoints: `GET /brand`, `POST /brand/fact` (upsert a section), `POST /brand/source`, `POST /brand/test` (voice test).

### Where the Brain is consumed (the "molding")
| Module | Brand-aware? | Notes |
|---|---|---|
| **AI Studio** (`studio.py`) | ✅ deep | `_build_brain` threaded into generate / refine / image / video / context / story; **scores drafts vs approved/prohibited words** — the gold standard |
| **Landing** (`landing.py`) | ✅ yes | |
| **Assistant** (`assistant.py`) | ✅ yes | |
| **Trends / Strategy** (`strategy.py`) | ❌ **no** | trends are a hardcoded generic list seeded only by `ws.industry` |
| **Ideas** (`ideas.py`) | ❌ no | |
| **Campaigns** (`campaigns.py`) | ❌ no | |
| **Follow-ups** (`followups.py`) | ❌ no | |

### The Brand Brain page (frontend `BrandBrain.jsx`)
- Only wired to `getBrand` + `saveBrandFact`.
- Editable sections: **6 of 12** (summary, tone, approved, prohibited, products, offers, personas). **Missing edit UI:** faqs, objections, competitors, visual, legal.
- `/brand/source` and `/brand/test` exist but are **not wired** (no add-source UI, no voice-test playground).
- **No auto-extraction** — adding a brain is a manual questionnaire.

---

## The plan — two sides

### 🌊 Wave A — make everything bend to the Brain (output side; the priority)
- [ ] **A1. Brand-aware Trends** — rewrite `/strategy/trends` to use `_build_brain(ws)`: when a brain exists, generate themes grounded in **personas, products, tone, offers** and **filter out prohibited angles**; fall back to the generic industry list only when the brain is empty. _Flagship change._
- [ ] **A2. Brand-aware Ideas & Campaigns** — ground generation in the brain the same way.
- [ ] **A3. Shared `brand_prompt(ws)` helper** — one source of truth every module grounds against (no drift).

**Gating rule (applies everywhere):** molding activates only when `completeness > 0`; an empty brain keeps today's generic behavior, so new accounts never regress.

### 🌊 Wave B — make the Brain effortless to build & complete (input side)
- [ ] **B1. Auto-extract from a URL** ⭐ — paste website URL (+ optional IG/FB) → backend fetches + AI extracts a proposed brain (summary, tone, products, personas, offers, FAQs, prohibited candidates) → **review-and-approve** per section (nothing auto-saves) → website auto-registered as a source. New endpoint `/brand/extract` + review UI. _The single biggest ease-of-use win; the one net-new backend piece._
- [ ] **B2. Voice-test playground** — "test your brand voice" box → copy in your tone using approved words, avoiding prohibited; shows facts cited. _Backend `/brand/test` exists — wiring + UI._
- [ ] **B3. Sources panel** — list sources with confidence + freshness badges + "add source"; flag stale. _Backend `/brand/source` exists — wiring._
- [x] **B4. Full 12-section editor** — DONE. `BrandBrain.jsx` rebuilt as a unified per-section inline editor (Add/Edit/Save/Cancel) covering all 12 sections incl. the previously-unreachable FAQs (Q→A), objections (objection→response), competitors, visual (colours/fonts) and legal/compliance. Backend `brand_context`/`brand_prompt` now surface + ground all 5 new sections, so filling them actually molds output (verified). Completeness can now reach 100% (was hard-capped at 58% = 7/12 because 5 sections had no UI).
- [ ] **B5. Completeness & health** — per-section status dashboard (good / needs-review / empty) + meter; surface the `needsReview` count; nudges to fill gaps.
- [ ] **B6. Fact provenance** — each fact shows origin (Website / Auto-extract / Questionnaire / Manual) + freshness.

---

## Recommended build order
1. **A1 — brand-aware Trends** (most visible proof; backend brain already there; contained)
2. **A3 — shared `brand_prompt` helper** (so the rest light up consistently)
3. **A2 — Ideas & Campaigns** grounded
4. **B1 — auto-extract from URL** (turns brain-building from 20 min → 30 sec)
5. **B2 / B3 / B5 / B6** — mostly wiring existing endpoints + UI
6. **B4 — remaining section editors**

## Status
- Nothing here is built yet — this is the agreed plan.
- Related session work (dark theme, Product Shots, unified IA/dashboard, credits scaffolding, dark landing) is currently **uncommitted**.
