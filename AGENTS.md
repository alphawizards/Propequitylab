# PropEquityLab — Agent Team

## 🎭 Available Specialist Agents

Located in `.claude/agents/` — these are specialized AI personas for project tasks.

### Engineering
| Agent | File | Use For |
|-------|------|---------|
| **Backend Architect** | `engineering-backend-architect.md` | FastAPI, PostgreSQL, API design, scaling |
| **Frontend Developer** | `engineering-frontend-developer.md` | React, shadcn, responsive UI, performance |
| **DevOps Automator** | `engineering-devops-automator.md` | AWS App Runner, Cloudflare Pages, CI/CD |
| **Security Engineer** | `engineering-security-engineer.md` | Auth, GDPR, OWASP, penetration testing |
| **Code Reviewer** | `engineering-code-reviewer.md` | PR review, code quality, best practices |

### Testing
| Agent | File | Use For |
|-------|------|---------|
| **API Tester** | `testing-api-tester.md` | Endpoint testing, load testing, security validation |

### Product
| Agent | File | Use For |
|-------|------|---------|
| **Product Manager** | `product-manager.md` | Feature prioritization, roadmap, user stories |

## 🚀 How to Use

Activate any agent by mentioning their role:

> "As Backend Architect, review the property projection API"

> "As API Tester, run comprehensive tests on the auth endpoints"

> "As Product Manager, prioritize the next sprint features"

> "As DevOps Automator, set up the Cloudflare Pages deployment"

## 📋 Current Project Priorities

1. **Backend Architect** — Fix property creation schema, optimize queries
2. **API Tester** — Achieve 95%+ endpoint coverage with Playwright
3. **Frontend Developer** — Connect React frontend to local backend
4. **DevOps Automator** — Configure Cloudflare Pages auto-deploy
5. **Security Engineer** — Audit auth flow, verify GDPR compliance

## 🔧 Quick Commands

```bash
# Run all API tests (API Tester workflow)
cd backend && python -m pytest tests/ -v

# Check backend health (Backend Architect)
curl http://localhost:8000/api/health

# Build frontend (Frontend Developer)
cd frontend && npm run build

# Deploy to Cloudflare (DevOps Automator)
cd frontend && npx wrangler pages deploy build
```
