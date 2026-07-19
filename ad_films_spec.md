# Ad Films — Client Film Mode: Final Spec

_Finalized 2026-07-19. Planning document — implementation pending go-ahead._
_Origin: the Dr. Fixit "Roof Ka Rakshak" production (July 2026), done manually via scripts; this productizes that exact pipeline._

## 1. Positioning

- **Not part of AI Studio.** AI Studio = "type a prompt, get an asset." Ad Films = a deliberate, human-in-the-loop production tool where money is spent in gated stages.
- Nav entry under the **Content** group: **"Ad Films"**. Page headline: _"Create your own ad film."_
- Core principle the tool enforces: **no Veo money is spent until every still is approved; no film ships until audio QA passes.**

## 2. Pages & navigation

### 2.1 Landing page — `/films` (light theme, inside normal app shell)
- **Step cards row**: the 7 stages, each card = icon + one sentence + cost behavior tag ("free" / "~$0.05 per image" / "~$0.60 per scene").
- Primary CTA: **Create your film**.
- **Your Films grid**: every film ever started. Card = poster (first approved still), client name, status chip (`Draft — Stage 3 of 7` / `In production` / `Delivered`), spend so far, actions Resume / Duplicate / Delete.
- **Delivered** cards flip to a share-forward state: play preview, copy link, download exports. The landing page doubles as a portfolio over time.

### 2.2 The Maker — `/films/:id` (dark "theatre", full-screen route OUTSIDE the app shell)
- No sidebar, no top nav, no notifications. Thin header only: film name · 7-dot stage rail (current lit coral) · running spend · single **← Exit** (top-left) returning to `/films`.
- Same-tab full-screen takeover (NOT a new tab — popup blockers, mobile, lost-tab confusion). Figma/Canva editor pattern.
- **Lights-down transition**: ~300ms fade to dark on enter; lights back up on exit.
- **No save button, no cancel.** Every action autosaves to the film record instantly. Exit at any stage; Resume returns to the exact stage with all state (and spend) intact.

## 3. Dark theatre palette (CSS tokens scoped to the Maker route only)

| Token | Hex | Usage |
|---|---|---|
| `--film-stage` | `#0D0E12` | Page background (near-black, neutral — never tinted) |
| `--film-surface` | `#16181D` | Panels, cards, script table |
| `--film-surface-raised` | `#1D2026` | Hover states, modals, dropdowns |
| `--film-border` | `#2A2E36` | Hairlines |
| `--film-preview-well` | `#000000` | ONLY the letterbox around video/stills |
| `--film-text` | `#EDEEF0` | Primary text (not pure white — eye fatigue) |
| `--film-text-dim` | `#9BA1AB` | Labels, hints, timestamps |
| `--film-coral` | `#FF6A5C` | Primary CTA, active stage dot, progress bar — ~5 places max |
| `--film-coral-pressed` | `#E55446` | Hover/active |
| `--film-green` | `#3DDC97` | Approved stills, "audio clean" badges |
| `--film-amber` | `#FFB020` | Warnings: VO overrun, audio flagged |
| `--film-red` | `#FF5D5D` | Cost confirmations, destructive actions |

Rules: neutral grays near the preview (color judgment); pure black only inside the preview well; coral scarce; status colors are functional navigation (approved/blocked readable at a glance).

## 4. The seven stages (final order)

### Stage 1 — Assets & Direction  _(moved BEFORE script: direction informs writing, agency-style)_
**Beat 1 — Upload & analysis.** Drop in logo, pack shot, reference footage, product photos (all optional). Per asset, one Gemini vision pass: classify type (logo / pack / footage / photo), extract dominant brand colors as hex swatches, read grading mood from reference frames, guess product category. ~1¢/asset, seconds.

**Beat 2 — Direction chips, pre-filled by analysis.** Four compact chip groups, each showing the AI pick tagged "AI suggested from your assets", one-tap override:
- **Color palette** — first option always "Brand-derived" (extracted swatches) + 3–4 curated alternates. Feeds end card, overlays, style-block tonal language.
- **Target audience** — homeowners / young families / dealers & trade / B2B… Feeds script tone, VO casting, who appears in stills.
- **Environment** — urban rooftop / village home / shopfront / interior / monsoon streets… Feeds still prompts directly.
- **Ad concept** — problem→solution / product demo / festive / testimonial / offer-promo. Drives the beat map.

Hard rules: (a) **every chip must be plumbed** into `style_block` / beat map — no decorative options; (b) **confidence labeling** — palette presented assertively (near-deterministic), audience/concept as "our guess, tap to change"; (c) whole stage skippable → sensible defaults.

### Stage 2 — Brief & Script
Client, product, target duration, **language: English / Hinglish / Hindi** (Hinglish keeps brand terms in English — Pidilite-ad style). AI drafts the beat map knowing the Stage-1 direction; script rendered as an **editable table** (line · beat · seconds), same pattern as the dealer-avatar compliance table.

### Stage 3 — Stills (the approval gate)
- Generate all stills with **seed-chaining from scene 1** (identity-lock pattern; verbatim `style_block` in every prompt).
- Per-scene: **Approve / Regenerate / Edit** — Edit = targeted flash-image edit pass on the still ("put the branded bucket in the foreground").
- Film-level banner: "4/5 approved — animation locked until all approved." **Hard gate.** This is the cheap iteration zone.

### Stage 4 — Animate
- Per approved scene: Veo i2v, motion prompt + auto-appended _"Audio: … no speech, no human voices, no narration"_.
- On download: **automatic audio QA** (Gemini listen pass) → stamps `audio_clean` / `audio_flagged` with finding ("dialogue detected 0:00–0:04") + one-click voice-free retake.
- Every render shows cost pre-flight before firing; respects monthly caps; take counter per scene (2-take budget norm surfaced as a nudge, not a block).

### Stage 5 — Voice
- Pick from the standing catalogue (Raunak added day one) — Phase 1.
- **Casting (Phase 2)**: proxy search of ElevenLabs shared-voice library (`?search=hinglish` etc.), generate samples **with the film's actual script**, side-by-side comparison player in-app, one click adds winner to account + film.
- Per-line TTS with measured durations; overrun vs beat window flagged amber with auto-suggestions (extend end card / start line earlier).

### Stage 6 — Assemble
- End card built from real brand assets via the avatarlab compositor (real logo PNG — never AI-drawn text).
- Mix = the shipped Dr. Fixit recipe: ambience at 0.6, VO beat-timed via adelay, amix normalize=0, apad (never -shortest truncation).
- **Final QA report** on the mix: exactly one narrator, all lines heard, no stray voices — shown as a pass/fail card ("AI-checked" label; human listen stays on the delivery checklist).

### Stage 7 — Deliver & revise
- Exports: 16:9 master · 9:16 reel · WhatsApp 480p (reuse `make_exports` pattern). Auto-catalogue all outputs into **Media Library**.
- Revision loop: change one scene → re-still → re-animate that scene only → re-stitch. Everything else cached.
- Optional hook into avatarlab for per-dealer end-card personalization (Phase 3).

**Library model (settled):** film _projects_ live in the Your Films grid on `/films`; finished _outputs_ live in Media Library like all other media. "Ad Films is where films are made; Media Library is where finished media lives."

## 5. Data model & backend

- **`EffyClientFilm`** — client name, product, brief, language, target duration, status, budget cap, `style_block` (verbatim grading paragraph reused across all prompts), direction JSON (palette/audience/environment/concept + confidence), chosen voice ID, timestamps.
- **`EffyFilmScene`** — ordered per film: script line, motion prompt, beat window (start/duration), still media ID + status (`draft → still_ready → approved`), clip media ID + status (`animating → clip_ready → audio_flagged | audio_clean`), take counter.
- Assets & outputs: reuse **`EffyMedia`** with `film_id` tag.
- Usage: existing **`effy_ai_usage`** with `surface='film'` (kinds unchanged: image / veo_video / tts).
- New module **`app/tools/effy/filmlab.py`** alongside avatarlab.py; reuses `veo.py`, `audio.py`, media store. Alembic migration additive-only (strip autogen drift, as always).
- Endpoint sketch: `/film` CRUD · `/film/<id>/analyze-asset` · `/film/<id>/script` · `/scene/<id>/still` (+ approve / edit) · `/scene/<id>/animate` (+status) · `/film/<id>/voices/search` · `/film/<id>/voice-sample` · `/film/<id>/vo` · `/film/<id>/assemble` · `/film/<id>/qa` · `/film/<id>/exports`.
- Frontend: **`ClientFilmStudio.jsx`** (Maker) + **`Films.jsx`** (landing), following the DealerAvatarStudio numbered-panel pattern; Maker rendered on a shell-less route.

## 6. Phasing

**Phase 1 — the complete usable pipeline (~2–3 sessions)**
- Nav entry + landing page (step cards, Your Films grid).
- Maker shell: full-screen dark route, theatre tokens, stage rail, Exit, autosave/resume.
- Models + migration.
- Stage 1: uploads + vision analysis of image assets (palette extraction, classification) + all four chip groups plumbed.
- Stage 2: brief + AI beat map + editable script table + **Hinglish/Hindi language support**.
- Stage 3: seed-chained stills, approve/regen/edit passes, hard gate.
- Stage 4: Veo i2v + no-voices direction + automatic audio QA + retakes + cost pre-flight.
- Stage 5 (lite): fixed catalogue, **Raunak added to VOICE_CHOICES immediately**.
- Stage 6: end-card compositor, beat-timed mix, final QA report.
- Stage 7: exports, Media Library cataloguing, per-scene revision loop.

**Phase 2 — casting & polish (~1 session)**
- Shared-voice-library search + in-app comparison player + one-click voice adoption.
- Beat-overrun auto-suggestions UX.
- Landing-page Delivered/share-forward card state.

**Phase 3 — brand fidelity & scale (~1–2 sessions)**
- Reference **footage** grading extraction (crops → style_block), beyond Phase 1's image-palette analysis.
- End-card designer (layout options from brand assets).
- Dealer personalization hook (avatarlab compositor).
- Batch/dealer variants.

**Explicitly out of scope for now:** synthetic SFX via ElevenLabs sound-generation (API key lacks the permission; wasn't needed — native Veo audio + transplants covered it).

## 7. Open decisions (need user call)

1. **Veo quota**: separate `EFFY_LIMIT_FILM_VEO_MONTHLY` for client work vs sharing the global 20/month. **Recommendation: separate** — client jobs are billable and must never compete with internal testing.
2. **Budget cap per film**: hard block at cap vs warn-and-allow for admin. **Recommendation: warn-and-allow for admin, hard block for other users.**

## 8. Known costs (from the Dr. Fixit production, for the step-card tags)

- Still generation/edit: ~$0.04–0.05 per image (gemini-3.1-flash-image / Imagen).
- Veo 3.1 Fast i2v: ~$0.15/second → ~$0.60 per 4s scene take.
- TTS: negligible marginal (ElevenLabs subscription quota).
- A full 20s film, all revisions included, landed at ~$4.10 in API spend.
