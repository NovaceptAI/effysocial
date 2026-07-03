# Module: App Shell & Foundation

> The chrome every screen lives in + the design/data foundation. _Status: ✅ frontend · 🔌 auth/tenancy backend pending._
> Spec ref: §4, §5 · Phase 0

## 1. What it does
Provides the persistent application frame — left nav rail, top bar, command palette, (future) right context panel — plus the shared design system, UI primitive kit, mock data layer and workspace context that all modules build on.

## 2. Where it lives
- **Route:** wraps everything under `/app/*` (lazy-loaded).
- **Frontend files:** `src/app/shell/AppShell.jsx`, `NavRail.jsx`, `TopBar.jsx`, `CommandPalette.jsx` (+ css); `src/app/AppRoot.jsx` (router + providers); `src/app/nav.js`; `src/ui/index.jsx` (primitives); `src/lib/cn.js`; theme in `src/styles/theme.css` + `tailwind.config.js`; context `src/app/context/WorkspaceContext.jsx`; mock data `src/app/data/sampleData.js`.
- **Backend (when built):** auth + tenancy + RBAC (`app/tools/tenancy/`, `app/core/auth`).

## 3. Screens & key UI
- **NavRail** (warm-charcoal): 9 collapsible groups (Overview/Strategy/Content/Publish/Engage/Advertise/Convert/Analytics/Administration), active highlight, badge counts, phase tags (P2/P3), open-state persisted in localStorage.
- **TopBar:** workspace switcher (with health dots), command/search trigger, date-range (stub), Create menu (Campaign/Post/Ad/Landing/Form/Report/Rule/Client), AI/notifications/help/profile.
- **CommandPalette (⌘K):** quick actions, switch workspace, go-to any page.
- **Pending:** right context panel (§5.3) for AI recs / details / comments / activity.

## 4. Data model
`WorkspaceContext` exposes `{ org, user, workspaces, workspace, setWorkspaceId }`. Currently from mock `sampleData.js`. INR/number helpers (`inr`, `num`).

Backend tenancy tables: `organization`, `workspace`, `user`, `membership`, `invitation`, `role`/`permission`.

## 5. Connections (object graph)
- `workspace` is the global scope key passed to every module's data calls.
- Nav badges (approvals, inbox) aggregate from Publish/Engage.
- Create menu deep-links into module creation flows.

## 6. AI involvement
Top-bar AI entry + ⌘K "Ask Effy" open the persistent assistant (Effy AI, §16 — pending).

## 7. Integrations
None directly; surfaces connection health from the Integrations module in the switcher/overview.

## 8. States
Loading (suspense fallback while `/app` chunk loads), workspace-switching, reduced-motion, (future) signed-out → redirect to login.

## 9. Backend contract (to implement)
- **Auth:** EffySocial-native accounts; `POST /api/auth/login`, `/register`, `GET /api/auth/me`, session cookie (can bridge existing novacept session later).
- **Tenancy:** `GET /api/bootstrap` → { user, org, workspaces, role per workspace } to hydrate the shell.
- **Scoping middleware:** every domain request carries/validates `workspace_id` against membership.
- **RBAC:** roles per §17.1 (agency-owner … view-only); permission checks per feature.

## 10. Open questions / TODO
- Right context panel component + API.
- Login/onboarding screens (Phase 0 remaining).
- Density modes (comfortable/compact) per §4.
