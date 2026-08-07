# EffySocial — Session Handoff (updated 2026-08-03)

Paste the prompt at the bottom into a new thread, **or** resume this session (see "Reading the old thread").

## Session 2026-08-02 → 08-03 — Creative fixes + Advertise (performance marketing) complete

### A. Creative flow fixes (2026-08-02, deployed: backend restarted + frontend rebuilt)
1. **Video prompt tightening** — `novalab-engine/app/tools/effy/studio.py` (`studio_video_start`): Groq system prompt now requires the shot to *visually show the product/service from the brief*; explicitly bans presenters/spokespeople/anyone staring at camera; strips LLM preamble + quotes before the prompt reaches Veo. (Fixes "man staring at camera" for a pet-snacks brief.)
2. **RAI transparency** — `veo.py` (`poll_video`): extracts `raiMediaFilteredReasons` from the Gemini API so blocked renders report the actual safety reason instead of a generic 502.
3. **Character Ken Burns fallback** — `characters.py`: if Veo declines to animate an uploaded photo (RAI filter on faces), a free local Ken Burns base clip is built so lip-sync/character creation still completes.
4. **Veo prompt disclosure** — `AIStudio.jsx`: collapsible "Shot description sent to the video model" row under the generated video (backend already returned `prompt`; UI now shows it).
5. **Media Library masonry** — `MediaLibrary.jsx`: CSS-columns layout (`columns-2/3/4` + `break-inside-avoid`) so mixed aspect ratios (1:1 posts vs 9:16 reels) pack without dead space.
6. **Reuse routing fix** — Media Library "Reuse" now sends videos as `?video=` (was `?image=`, breaking previews); `AIStudio.jsx` accepts `?video=` deep-links into the player.

### B. Advertise / performance marketing — full five-screen surface (2026-08-03, deployed)
Backend (`app/tools/effy/ads.py`, restarted 09:08 UTC):
- **`SandboxAdsProvider`** (`mode:"sandbox"`, writable) behind `get_ads_provider()` — deterministic data on a real `effy_integrations` row (`meta_ads`, `meta:{sandbox:true}`); budget/status overrides persist to the row's meta. `MockAdsProvider` (`mode:"mock"`) = honest connect state, no sample data.
- New endpoints: `GET /ads/creatives|audiences|budgets|rules` · `POST /ads/campaigns/:id/status|budget` (RBAC write, ₹1,000–₹1cr) · `POST /ads/sandbox` (toggle) · rules CRUD (`POST/PATCH/DELETE /ads/rules[...]`, metric ∈ cpl/roas/ctr/pacing, op ∈ gt/lt, action ∈ pause/notify) · `POST /ads/rules/dry-run` (read-only; suggestions never auto-applied).
- Tests: `test_effy_ads.py` → 12 tests (determinism, shapes, mock-refuses-writes, sandbox enable/switch, writes persist + reprice, sandbox→analytics spend, rules CRUD + dry-run). Full suite **220 passed, 3 skipped**.

Frontend (built ✓):
- New pages: `Creatives.jsx` (CPL-ranked table, format tabs, fatigue badges) · `Audiences.jsx` (saved/custom/lookalike, size/CPL/used-in/overlap) · `Budgets.jsx` (pacing bars, near-cap/under-pacing flags, in-place budget edit + pause/resume) · `Rules.jsx` (plain-English rule list, builder, dry-run panel).
- Routes + nav wired in `AppRoot.jsx` / `nav.js` (Advertise group: Campaigns · Creatives · Audiences · Budgets · Automated Rules).
- `AdsDashboard.jsx` gates on `mode ∈ {sandbox, live}` + sandbox badge; `Integrations.jsx` has a Meta Ads **Sandbox** enable button.
- All five screens share the pattern: connect state when mock → full UI + "Sandbox data — not live spend" badge when sandbox.

Docs updated: `docs/API.md` (11 Advertise endpoints + adapter modes) · `docs/modules/Advertise-Dashboard.md` (rewritten for the five-screen surface) · `BUILD_TRACKER.md` (Creatives/Audiences/Budgets/Rules → ✅, adapter → v2).

### Open loops from this session
- **Agent outro integration** into Ad Films (`FilmMaker.jsx`, Stage 6 Assemble) and YouTube Story (`Storyboard.jsx`, post-stitch toggle) — approved ("s1 and s2") but not yet started.
- Everything above is deployed but **not committed/pushed** (both repos have uncommitted changes).

---

## What EffySocial is
AI social-growth & performance-marketing OS for Indian SMBs.
- **Frontend**: `/srv/effysocial` — React 19 + Vite + Tailwind v3 (preflight OFF — never add `.app-root button` global resets; use targeted `bg-transparent`). Build: `npm run build`. Served by nginx from `dist/`.
- **Backend**: `/srv/novalab-engine` — Flask + SQLAlchemy + Alembic + Postgres `novastudy_db`; gunicorn via `novalab-engine.service` on 127.0.0.1:5010. venv: `./myenv/bin/python`. Tests: `./myenv/bin/python -m pytest tests/ -q` (currently 205 passing, 3 skipped).
- **Deploy backend change**: `sudo systemctl restart novalab-engine`. **Deploy frontend**: `npm run build` (from /srv/effysocial).
- Live at https://effysocial.effybiz.in ; demo login `demo@effybiz.in` / `demo@1234` (workspace ref `ws_11`).
- Admin gate: `EFFY_ADMIN_EMAILS`. Usage ledger `effy_ai_usage`; quotas in env (`EFFY_LIMIT_*`).

## What was built this session (all deployed + pushed)
1. **Ad Films** (client-film mode) — gated production pipeline, all 3 phases done.
   - Backend `app/tools/effy/filmlab.py`; models `EffyClientFilm`/`EffyFilmScene`; UI `src/app/pages/Films.jsx` (landing) + `FilmMaker.jsx` (dark full-screen "theatre" Maker outside app shell).
   - 7 stages: Assets&Direction (analysis-built options only, palette from brand hexes, "Other…" custom) → Script (custom scene count/length, narration fills each scene at ~2.3 w/s) → Stills (hard approval gate, Generate all/Approve all) → Animate (Veo i2v + auto audio-QA for stray voices) → Voice (catalogue + shared-library casting; over/under-run flags) → Assemble (beat-timed VO mix + logo end card + QA) → Deliver (16:9/9:16/WhatsApp exports + per-dealer versions).
   - Separate quota `EFFY_LIMIT_FILM_VEO_MONTHLY=60`; per-film budget cap (hard block non-admin, warn admin). Costs are **list-price-verified**: still $0.067 (gemini-3.1-flash-image 1K), Veo 3.1 Fast $0.15/s. Failed Veo renders refund spend.
   - Full spec: `ad_films_spec.md`.
2. **EffyCharacters** — Runway-style lip-sync speaker gallery (AI Studio format card).
   - Backend `app/tools/effy/characters.py`; model `EffyCharacter`; UI `src/app/components/CharactersStudio.jsx`.
   - 7 presets (nikhil, asha, dev, ravi, meera, gurpreet, bittu) with portraits in `_assets/characters/`. All ready NOW via free Ken Burns base clips; bittu already on Veo. Custom characters from photo (Veo, falls back to Ken Burns if capped) or clip.
   - `/characters/speak` = TTS → Sync Labs lipsync (polled via existing `/studio/avatar/status`). 38-word (~15s) cap.

## Current state / open loops
- **Veo daily quota** was exhausted 2026-07-20; resets ~12:30 PM IST. A **self-cleaning cron** (`/srv/novalab-engine/scripts/render_cast.sh`, log `/var/log/effy-cast-render.log`) upgrades the 5 human cast base clips to livelier Veo idle-motion after reset, sentinel-tracked (`<key>.veo`), removes its own crontab line when done.
  - **TODO after reset**: `git -C /srv/novalab-engine add app/tools/effy/_assets/characters/*.mp4 && commit` the upgraded clips (cron overwrites files on disk; git won't auto-commit).
- **Sync Labs**: model switched to `sync-3` in `app/tools/avatar/lipsync_service.py` (**uncommitted**). Free tier = 3 generations/month, **exhausted**. Decision pending: keep sync-3 ($0.133/s) or revert to lipsync-2-pro ($0.05/s), and whether to upgrade the Sync Labs plan.
- **Open-source / self-hosted lip-sync + GPU** discussed, NOT built. Server is CPU-only (2 CPU/3GB) — can't self-host. Options: Replicate (pay-per-run, needs token) or a rented GPU worker (SadTalker/MuseTalk/LatentSync for lipsync; FLUX/SDXL for images; XTTS for TTS). Awaiting user direction.
- **skyskrabers** site taken down (nginx `return 410` in `novaceptai.online`, 3 blocks; config backed up); `node_modules` deleted (151 MB reclaimed); source + served copy retained. Reversible.

## Key gotchas
- Alembic: strip unrelated autogen drift, additive-only migrations.
- Veo rejects the literal word "silence" in prompts (safety filter) — use "quiet room tone".
- Veo clip durations: only 4/6/8s accepted. Gemini vision model: `gemini-flash-latest` (2.5 retired). Image: `gemini-3.1-flash-image`.
- Full prior transcript: `/home/ubuntu/.claude/projects/-srv-effysocial/a0f6842a-17b4-4b35-a55b-ed40de3c5c42.jsonl`

## Reading the old thread (new session)
1. **Best — resume**: run `claude --resume` (pick this session) or `claude --continue` in the same project dir; full context carries over, no handoff needed.
2. **Read transcript**: point the new thread at the `.jsonl` path above.
3. **Read docs**: this file + `ad_films_spec.md` + `avatar_advert.md` cover the durable state.

---

## PASTE-INTO-NEW-THREAD PROMPT

> I'm continuing work on EffySocial (frontend `/srv/effysocial`, backend `/srv/novalab-engine`). Read `/srv/effysocial/HANDOFF.md` first, then `ad_films_spec.md`, to load context on the two features just built: **Ad Films** (client-film production pipeline) and **EffyCharacters** (lip-sync speaker gallery). I want to do a full review of both — walk me through what's live and how to exercise each end-to-end, flag anything half-finished or risky, and confirm the open loops (Veo cron upgrade + commit, Sync Labs sync-3 vs revert, open-source/GPU lip-sync decision). Don't change anything until I've reviewed; then be ready to make changes. Verify current state against the running system (205 backend tests should pass; both features deployed) rather than assuming.
