# PropEquityLab — Agent Team

## Available Specialist Agents

Located in `.claude/agents/` — these are specialized AI personas for project tasks.

### Engineering
| Agent | File | Use For |
|-------|------|---------|
| **Fullstack Developer** | `fullstack-developer.md` | End-to-end feature work, FastAPI + React, debugging |
| **DevOps Engineer** | `devops-engineer.md` | Railway, Cloudflare Pages, CI/CD pipelines |
| **Deployment Engineer** | `deployment-engineer.md` | Releases, env config, production deployments |
| **Database Architect** | `database-architect.md` | PostgreSQL/Neon schema, Alembic migrations, query optimization |

### QA / Testing
| Agent | File | Use For |
|-------|------|---------|
| **Bowser QA Agent** | `bowser-qa-agent.md` | Chrome-based browser automation QA |
| **Claude Bowser Agent** | `claude-bowser-agent.md` | Observable browser automation |
| **Playwright Bowser Agent** | `playwright-bowser-agent.md` | Headless Playwright test automation |

### Meta / Utilities
| Agent | File | Use For |
|-------|------|---------|
| **Meta Agent** | `meta-agent.md` | Orchestrating other agents |
| **Work Completion Summary** | `work-completion-summary.md` | Generating session summaries |
| **LLM/AI Research** | `llm-ai-agents-and-eng-research.md` | Research into AI/LLM patterns |

## How to Use

Activate any agent by mentioning their role:

> "As Fullstack Developer, implement the property projection endpoint"

> "As DevOps Engineer, fix the Railway deployment pipeline"

> "As Database Architect, optimize the portfolio dashboard query"

> "As Playwright Bowser Agent, run E2E auth tests"

## Current Project Priorities (2026-04-01)

1. **Fullstack Developer** — Verify Clerk auth flow end-to-end (sign-up → dashboard)
2. **Playwright Bowser Agent** — Build E2E test suite covering auth + core flows
3. **DevOps Engineer** — Confirm Railway backend + Cloudflare Pages are healthy
4. **Database Architect** — Verify Alembic migrations applied on Neon, add composite indexes

## Quick Commands

```bash
# Run backend tests
cd backend && python -m pytest tests/ -v --tb=short

# Check backend health
curl http://localhost:8000/api/health

# Start frontend dev server
cd frontend && npm start

# Deploy frontend to Cloudflare Pages
cd frontend && npx wrangler pages deploy build

# Run Playwright E2E tests
npx playwright test

# Check Railway deployment
railway status
```
