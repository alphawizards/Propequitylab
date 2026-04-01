# PropEquityLab Documentation

Australian property investment portfolio management platform.

**Stack:** FastAPI (Python 3.11) · React 19 · PostgreSQL (Neon serverless) · Cloudflare Pages · Railway

---

## Current Status (April 2026)

| Area | Status | Notes |
|------|--------|-------|
| Backend API | ✅ Live | Railway, `/api/health` healthy |
| Frontend | ✅ Live | Cloudflare Pages, `propequitylab.com` |
| Authentication | ✅ Live | Clerk Core 2 SDK — JWKS verification, auto-provisioning |
| Database | ✅ Live | Neon PostgreSQL, Alembic migrations |
| Webhooks | ✅ Live | Clerk `user.created/updated/deleted` with svix verification |
| Email | ✅ Live | Resend API |
| Error Tracking | ✅ Live | Sentry (frontend + backend) |
| E2E Tests | ✅ Live | Playwright + `@clerk/testing`, smoke + authenticated + auth-lifecycle suites |

---

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | `https://propequitylab.com` |
| Backend API | `https://api.propequitylab.com` |
| Health check | `https://api.propequitylab.com/api/health` |
| API docs | `https://api.propequitylab.com/docs` |

---

## Infrastructure

| Component | Provider | Notes |
|-----------|----------|-------|
| Frontend hosting | Cloudflare Pages | Auto-deploy via GitHub Actions |
| Backend hosting | Railway | Auto-deploy on push to `main` via GitHub integration |
| Database | Neon PostgreSQL | Serverless, connection pooling via `DATABASE_URL` |
| Auth | Clerk | Core 2 SDK, JWKS JWT verification, webhook sync |
| Email | Resend | Transactional email |
| Error tracking | Sentry | Frontend + FastAPI integration |

### Key Environment Variables

**Railway (backend):**
- `DATABASE_URL` — Neon PostgreSQL connection string
- `CLERK_JWKS_URL` — activates Clerk auth (disables legacy JWT mode)
- `CLERK_ISSUER` — Clerk issuer URL for JWT verification
- `CLERK_WEBHOOK_SECRET` — svix signing secret for webhook handler
- `JWT_SECRET_KEY` — required even in Clerk mode (legacy guard)
- `CORS_ORIGINS` — comma-separated allowed origins
- `RESEND_API_KEY`, `SENTRY_DSN`

**Cloudflare Pages (frontend):**
- `REACT_APP_API_URL` — backend API base URL
- `REACT_APP_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `REACT_APP_SENTRY_DSN`

---

## Architecture Overview

```
User → Cloudflare Pages (React 19)
         └── ClerkProvider (session management)
         └── AuthContext (thin Clerk adapter)
         └── api.js (Axios, auto-attaches Clerk Bearer token)
              │
              ▼
         Railway (FastAPI)
         └── CORSMiddleware
         └── SecurityHeadersMiddleware (HSTS, CSP, etc.)
         └── SlowAPI rate limiter (100/min)
         └── get_current_user (clerk_auth.py — JWKS verification)
              │
              ▼
         Neon PostgreSQL (SQLModel)
         └── User + Account + Subscription (auto-provisioned on first sign-in)
         └── Portfolio, Property, Income, Expense, Asset, Liability, Plan, Loan, ...
```

### Authentication Flow

1. User signs in via Clerk-hosted `<SignIn>` widget
2. Clerk issues a short-lived RS256 JWT
3. Frontend `api.js` interceptor calls `getToken()` and attaches `Authorization: Bearer <token>`
4. Backend `clerk_auth.py` verifies the JWT against Clerk JWKS endpoint (cached 1h)
5. On first sign-in: auto-provisions `User` + `Account` + `AccountMembership` + `Subscription`
6. Clerk webhook (`/api/webhooks/clerk/`) keeps local DB in sync with Clerk user lifecycle events

---

## Development Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
# Create backend/.env with values from .env.example
uvicorn server:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Create frontend/.env with values from .env.example
npm start   # dev on port 3000
```

### Migrations

```bash
cd backend
alembic upgrade head
alembic revision --autogenerate -m "Description"
```

### E2E Tests

```bash
# Smoke suite (no auth required)
npx playwright test --project=smoke

# Authenticated suite (requires .env.playwright)
npx playwright test --project=authenticated

# Clerk auth lifecycle suite (requires .env.playwright)
npx playwright test --project=clerk-auth-flow
```

`.env.playwright` requires:
- `CLERK_SECRET_KEY` — Clerk Backend API key
- `CLERK_TEST_USER_ID` — `user_xxx` ID of the test user
- `PLAYWRIGHT_FRONTEND_URL` — (optional, defaults to production)
- `PLAYWRIGHT_API_URL` — (optional, defaults to production API)

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/server.py` | FastAPI app entry point, middleware, route mounting |
| `backend/utils/clerk_auth.py` | Clerk JWT verification + user auto-provisioning |
| `backend/utils/auth.py` | Legacy JWT auth (active when `CLERK_JWKS_URL` unset) |
| `backend/routes/clerk_webhooks.py` | Clerk user lifecycle webhook handler |
| `frontend/src/services/api.js` | Centralized Axios client, token interceptor |
| `frontend/src/context/AuthContext.jsx` | Thin Clerk adapter (preserves legacy interface) |
| `railway.toml` | Railway deployment config |
| `playwright.config.js` | E2E test suite configuration |
| `tasks/todo.md` | Active task tracker |
| `tasks/lessons.md` | Lessons learned |
| `decisions/` | Architectural decision records |

---

## Decisions Log

See [`decisions/`](../decisions/) for architectural decision records.

*Last updated: 2026-04-01*
