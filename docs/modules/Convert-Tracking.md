# Module: Convert — Conversion Tracking Centre

> Diagnostics page for every conversion source: status, events, match quality, duplicates, consent, test events and fix recommendations. _Status: ✅ frontend + backend (Phase 2 slice 5) · spec §14.8._

## 1. What it does
One place to verify that conversion tracking works end-to-end. Native sources (lead forms, landing pages, WhatsApp) are diagnosed from **real workspace data**; pixel sources (Meta Pixel, Google Tag) report honestly as not-connected via the adapter until Phase 3. Includes a test-event tool, UTM-coverage stats, domain-verification status, a setup guide and computed fix recommendations that deep-link to the module that fixes them.

## 2. Where it lives
- **App route:** `/app/tracking` — sources table + UTM coverage + domain + guide + recommendations.
- **Backend:** `app/tools/effy/tracking.py` → `/api/effy/tracking*`; table `effy_tracking_events` (test-event log; real pixel/webhook events land here in Phase 3).

## 3. Data model
`EffyTrackingEvent`: id, workspace_id, source (forms|landing|whatsapp|meta_pixel|google_tag), kind (test today; lead|purchase|… in Phase 3), meta JSON, created_at.

## 4. Diagnostics (all computed live, no stored aggregates)
- **forms** (native): events = form submissions; match quality = % of submissions carrying email/phone; duplicates = repeat submissions sharing an email/phone; consent = published forms missing consent text.
- **landing** (native): events = page views across landing pages.
- **whatsapp** (native): events = leads with source=whatsapp; configured = published pages with WhatsApp CTA.
- **meta_pixel / google_tag** (adapter): `get_tracking_provider(ws)` → `MockTrackingProvider` (`provider:"mock"`, status not_connected) until real integrations implement the same interface in Phase 3. Domain verification comes from the same provider.
- **UTM coverage:** % of submissions with `utm.source`, plus top sources.
- **Recommendations:** no published form · consent missing · duplicates present · UTM coverage < 60% · published landing page without embedded form · pixels not connected. Each has severity + deep link.

## 5. Backend contract
Authed (🔒🏢): `GET /tracking?workspace=` → `{sources[], domain, utm, recommendations[], guide[]}`.
Write-role: `POST /tracking/test-event {workspace, source}` → `{event:{source,kind:"test",at}}` · 400 unknown source. Each source shows its `lastTest` timestamp.

## 6. Connections
- Reads `effy_forms` + `effy_form_submissions` (Forms), `effy_landing_pages` (Landing), `effy_leads` (Pipeline).
- Recommendations deep-link to `/app/forms`, `/app/landing`, `/app/pipeline`, `/app/integrations`.
- Phase 3: real pixel providers + domain verification behind `get_tracking_provider`; conversions sent back to ad platforms.

## 7. Tests
`test_effy_tracking.py`: empty-workspace shape, forms diagnostics from real submissions (match quality, duplicates, consent, UTM coverage + recs), landing view counting + form-gap rec, WhatsApp source from leads, test-event persistence + 400 gate; tenancy + RBAC matrices extended.
