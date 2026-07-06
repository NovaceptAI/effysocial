# EffySocial

**AI-powered social growth & performance marketing operating system** — plan, create, publish, engage, advertise and convert from one platform.

Live: https://effysocial.effybiz.in · Product app at `/app` · Marketing landing at `/`

## Stack
- **Frontend (this repo):** React 19 + Vite, Tailwind (Bright Studio design system: coral/cream + charcoal rail), TanStack Query, Recharts, cmdk. Product SPA under `src/app`, marketing under `src/marketing`, legacy demo tools under `src/modules` (served at `/tools`).
- **Backend:** Flask (`novalab-engine` repo) — namespaced `effy_*` tables + `/api/effy/*` blueprint (auth/tenancy, campaigns, Brand Brain, AI Studio, publish, engage, analytics, Effy AI assistant, leads). Groq for AI generation.

## Documentation (start here)
| Doc | Purpose |
|---|---|
| **[docs/TECHNICAL.md](docs/TECHNICAL.md)** | **Top-to-bottom engineering reference** (architecture, data model, auth/tenancy, OAuth, deploy, testing) |
| [EffySocial_Claude_Design_Prompt.md](EffySocial_Claude_Design_Prompt.md) | Master product spec (source of truth) |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Architecture, decisions, phases |
| [BUILD_TRACKER.md](BUILD_TRACKER.md) | Live status of every screen/module |
| [docs/API.md](docs/API.md) | Implemented backend endpoints |
| [docs/modules/](docs/modules/README.md) | Per-module contracts (frontend authors → backend obeys) |

## Development
```bash
npm install
cp .env.example .env
npm run dev      # note: /api/effy proxying is production-nginx only for now
npm run build    # outputs dist/ (served by nginx)
```

Backend tests live in the `novalab-engine` repo: `PYTHONPATH=. pytest tests/ -q` (100+ tests incl. tenancy-security matrix).

## Status
Phase 1 complete (organic product + Effy AI + RBAC). Phase 2 (performance marketing) in progress — see BUILD_TRACKER.
