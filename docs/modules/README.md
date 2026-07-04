# EffySocial — Module Docs

One doc per module describing **what it does** and **how it connects to the platform**.

📡 **Live API reference (implemented endpoints): [../API.md](../API.md)** — updated as each module's backend ships.

## The rule (how we work)
- **While building the frontend** of a module → create/maintain its doc here (use `_TEMPLATE.md`).
- **While building the backend** → read the module's doc first, implement to its "Backend contract" section. Do not invent fields/endpoints not in the doc; if something's missing, update the doc, then build.
- **Every backend slice ships with tests** (`novalab-engine/tests/`): add the new endpoints to the tenancy-security matrix in `test_effy_tenancy.py` + a contract test file. External providers are mocked; live checks go in the opt-in `RUN_SMOKE=1` tier.
- Keep [../../BUILD_TRACKER.md](../../BUILD_TRACKER.md) status in sync.

## Index
| Module | Doc | Status |
|---|---|---|
| Marketing Landing, Login & Auth | [Auth-Landing.md](Auth-Landing.md) | ✅ landing + login |
| App shell & foundation | [App-Shell.md](App-Shell.md) | ✅ frontend |
| Overview / Home | [Overview.md](Overview.md) | ✅ frontend |
| Clients & Workspaces | [Clients.md](Clients.md) | ✅ frontend |
| Campaigns & Campaign Workspace | [Campaigns.md](Campaigns.md) | ✅ frontend |
| Brand Brain | [Brand-Brain.md](Brand-Brain.md) | ✅ frontend |
| AI Studio | [AI-Studio.md](AI-Studio.md) | ✅ frontend |
| Calendar & Approvals | [Calendar-Approvals.md](Calendar-Approvals.md) | ✅ frontend |
| Unified Inbox & Reviews | [Engage-Inbox.md](Engage-Inbox.md) | ✅ frontend |
| Analytics & Reports | [Analytics.md](Analytics.md) | ✅ Organic + Reports frontend |
| Administration (Integrations, Team) | [Administration.md](Administration.md) | ✅ Integrations + Team |
| Effy AI assistant & agents | [Effy-AI.md](Effy-AI.md) | ✅ v1 |
| Convert — Leads & Pipeline | [Convert-Leads.md](Convert-Leads.md) | ✅ slice 1 |
| Convert — Forms | [Convert-Forms.md](Convert-Forms.md) | ✅ slice 2 |
| …(remaining per BUILD_TRACKER) | | ⬜ |

Source of truth for requirements: [../../EffySocial_Claude_Design_Prompt.md](../../EffySocial_Claude_Design_Prompt.md).
Architecture/phasing: [../../IMPLEMENTATION_PLAN.md](../../IMPLEMENTATION_PLAN.md).
