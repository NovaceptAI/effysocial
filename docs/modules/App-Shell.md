# Module: App Shell & Foundation

> The chrome every screen lives in + the design/data foundation. _Status (27 Sep 2026): ✅ built on the real bootstrap — profiles, workspaces, roles, plans and Roles & client approval switches._
> Spec ref: §4, §5

## 1. What it does
Provides the persistent frame — nav rail, top bar with the profile switcher, notification centre, command palette, the Effy assistant panel and the banners — plus the design system and the contexts every module reads.

## 2. Where it lives
- **Route:** everything under `/app/*`, each page lazy-loaded.
- **Frontend:** `src/app/AppRoot.jsx` (router + providers; one `QueryClient` per profile, keyed by organisation id), `src/app/shell/{AppShell, NavRail, TopBar, ProfileSwitcher, CreditsChip, Dropdown, CommandPalette}.jsx`, `src/app/nav.js`, `src/app/plans.js`, contexts `src/app/context/{AppAuth, WorkspaceContext, AssistantContext, ThemeContext}.jsx`, primitives `src/ui/index.jsx`.

## 3. Screens & key UI
- **NavRail:** the hub menu (Home, AI Studio, Ad Films, Performance Marketing, Media Library…) and the deep Performance Marketing menu in groups; `railMode()` keeps the marketing rail on shared pages. Items the plan doesn't include are locked; *Clients* shows only when the Clients page is switched on.
- **TopBar:** profile switcher (left), the **credits chip**, Create menu, Effy AI, theme, notifications, and the avatar menu (workspace switcher, Profile & settings, Log out).
- **Credits chip** (6.20): the organisation's credits left this month (across all its workspaces), e.g. *⚡ 138 credits left*; hover says *138 of 150 credits left this month. They reset on 1 Oct.* Amber from 80% used, red once all are used (*Work isn't blocked yet*). Opens Billing. From tablet width it sits in the bar (the number alone below 768px); on phones it is the first line of the avatar menu, and a dot on the avatar turns amber or red. It reads `/billing/credits` again 0.8 s after any change the app makes (`effyApi` sends `effy:changed` after every request that isn't a GET) and every minute.
- **Banners:** sample workspace, Business work email (owners and admins get *Verify now*), email verification, plan/trial.
- **PlanGate:** a locked page explains which plan includes it.
- **Command palette (⌘K):** go to any page, quick actions.

## 4. Data model
`WorkspaceContext` exposes `{org, user, role, canManageWorkspaces, canWrite, planInfo, workspaceLimit, workspaces, workspace, setWorkspaceId, profiles, switches, refreshWorkspaces}` from the engine's bootstrap. The chosen workspace is remembered per profile (`localStorage effy.workspace = {user, byOrg}`); `switches` are the Roles & client approval settings.

## 5. Connections (object graph)
- The workspace id scopes every module's data calls; the page outlet is keyed by workspace.
- Switching profile sets a new bootstrap and remounts the app with an empty cache.
- Notifications combine pending approvals with the assistant's recommendations (ad-rule alerts, escalations, failures).
- The credits chip and Billing share one query (`billing-credits`), so both always show the same numbers.

## 6. AI involvement
Effy AI opens from the top bar, ⌘K or any page's *Ask Effy* (`AssistantContext`), with a seeded question.

## 7. Integrations
Connection health appears through Integrations and the notification centre.

## 8. States
Page loading (suspense), workspace switching, profile switching, locked by plan, sample workspace, no organisation, reduced motion, compact density; credits plenty / running low (80%) / used up.

## 9. Backend contract (built)
`GET /api/effy/bootstrap` hydrates the shell and `GET /api/effy/billing/credits` feeds the credits chip (see [API.md](../API.md) for the shapes). Every workspace-scoped call is checked against the active profile (401/404).

## Coming features and unknown addresses (G49)
`ModulePlaceholder` is the in-shell *Page not found*. Features not built yet — the blog, WhatsApp alerts, dealer voice cloning, two playbooks — carry `components/NotifyMe`, which records the ask once per person (`effy_interest`); Admin lists who asked.

## 10. Open questions / TODO
- Right context panel (spec §5.3) for details, comments and activity.
