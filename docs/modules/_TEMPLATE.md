# Module: <Name>

> One-line purpose. _Status: ⬜ planned / 🔨 building / ✅ frontend done / 🔌 backend done._
> Spec ref: EffySocial_Claude_Design_Prompt.md §<n> · Phase <n>

## 1. What it does
2–4 sentences: the job this module performs for the user and why it exists.

## 2. Where it lives
- **Routes:** `/app/...`
- **Frontend files:** `src/app/pages/...`, data in `src/app/data/...`
- **Backend (when built):** blueprint `app/tools/<...>`, tables `<...>`

## 3. Screens & key UI
Bullet the screens and the important components/interactions.

## 4. Data model
The object(s) this module owns. Fields the frontend currently uses (mock shape) →
the backend tables/columns to create. Mark required vs optional.

## 5. Connections (object graph)
How this module links to others: which objects it references, which reference it,
and what events flow in/out. This is the anti-hallucination section — be explicit.

## 6. AI involvement
Which agent(s) read/write here, what context they use (e.g. Brand Brain), and the
explanation/approval requirements.

## 7. Integrations
External providers used (via the adapter layer), and what's mock vs real per phase.

## 8. States
Empty / loading / error / disconnected / permission / upgrade etc. relevant here.

## 9. Backend contract (to implement)
- **Tables:** …
- **Endpoints:** `GET/POST …` with request/response shape.
- **Jobs/webhooks:** …
- **RBAC:** which roles can read/write.
- **Validation/limits:** …

## 10. Open questions / TODO
Anything unresolved.
