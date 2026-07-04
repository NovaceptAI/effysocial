# Module: Convert — Forms

> Lead-capture forms with UTM attribution; submissions become pipeline leads. _Status: ✅ frontend + backend + public capture · spec §14.3._

## 1. What it does
Build a form (lead/contact/appointment/quote), publish it, and share its public link. Visitors submit without logging in; hidden UTM fields are captured automatically; every submission creates a **lead** in the pipeline with `source=form` + campaign attribution, plus a stored submission record.

## 2. Where it lives
- **App route:** `/app/forms` — list + builder (fields editor, consent, thank-you, publish, share link).
- **Public route:** `/f/:slug` — the hosted form page (no auth), auto-captures `utm_*` query params.
- **Backend:** `app/tools/effy/forms.py` → authed `/api/effy/forms*` + public `/api/effy/public/forms/:slug*`; tables `effy_forms`, `effy_form_submissions`.

## 3. Data model
`EffyForm`: id, workspace_id, campaign_id?, name, type (lead|contact|appointment|quote), slug (unique, unguessable), fields JSON `[{id,label,type(text|email|phone|select|textarea),required,options?}]`, consent_text, thankyou, status (draft|published), created_at.
`EffyFormSubmission`: id, form_id, data JSON, utm JSON, lead_id?, created_at.

## 4. Connections
- Submission → **EffyLead** (name/phone/email extracted; interest = form name; `campaign_id` from the form's link or `utm_campaign` match) → appears in `/app/pipeline` and Engage-Leads "new leads".
- Campaign workspace counts (`counts.forms`) reference forms (rollup later).

## 5. Backend contract
Authed (🔒🏢, write-role for mutations):
- `GET /api/effy/forms?workspace=` → `{forms[]}` (with submission counts)
- `POST /api/effy/forms` `{workspace, name, type?, fields?, campaignId?, consent_text?, thankyou?}` → `{form}` (slug generated)
- `PATCH /api/effy/forms/:id` `{name?, fields?, status?, consent_text?, thankyou?, campaignId?}` → `{form}`
- `GET /api/effy/forms/:id/submissions` → `{submissions[]}`

Public (🔓, published forms only):
- `GET /api/effy/public/forms/:slug` → `{name, type, fields, consent_text}` · 404 if draft/unknown
- `POST /api/effy/public/forms/:slug/submit` `{data:{fieldId:value}, utm:{source,medium,campaign}, website:""}` → `{status, thankyou}` — honeypot field `website` must be empty; basic length caps.

## 6. States
Draft vs published, empty submissions, share-link copied, public 404 for drafts, thank-you screen, honeypot silently accepted (no signal to bots).

## 7. Tests
Form CRUD + publish gate, public GET draft → 404, submit → lead + submission with UTM, honeypot rejected-silently, missing required field → 400, tenancy/RBAC matrix.
