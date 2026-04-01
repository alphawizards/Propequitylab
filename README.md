# PropEquityLab

[![CI](https://github.com/alphawizards/Propequitylab/actions/workflows/deploy.yml/badge.svg)](https://github.com/alphawizards/Propequitylab/actions/workflows/deploy.yml)

Australian property investment portfolio management platform. Track properties, analyze cash flow, model scenarios, and forecast portfolio growth.

**Live:** https://propequitylab.com
**Stack:** FastAPI (Python 3.11) · React 19 · PostgreSQL (Neon.tech) · Clerk Auth · Railway · Cloudflare Pages

---

## Prerequisites

- Python 3.11+
- Node.js 20+
- A Clerk account (test keys in `.env` files)
- Neon.tech PostgreSQL database (connection string required for backend)

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Verify backend/.env has a real DATABASE_URL (Neon.tech connection string)
# CLERK_JWKS_URL and CLERK_ISSUER must match the same Clerk app as the frontend key

alembic upgrade head
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Health check: `curl http://localhost:8000/api/health`

### Frontend

```bash
cd frontend
npm install
npm start   # dev server on port 3000
```

The frontend requires `REACT_APP_CLERK_PUBLISHABLE_KEY` in `frontend/.env`. See `frontend/.env.example`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon.tech PostgreSQL connection string |
| `JWT_SECRET_KEY` | Yes | Legacy JWT signing key (keep even with Clerk active) |
| `CLERK_JWKS_URL` | Yes | `https://<your-app>.clerk.accounts.dev/.well-known/jwks.json` |
| `CLERK_ISSUER` | Yes | `https://<your-app>.clerk.accounts.dev` |
| `CLERK_WEBHOOK_SECRET` | Yes | Webhook signing secret from Clerk Dashboard |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `RESEND_API_KEY` | No | Email sending via Resend |
| `SENTRY_DSN` | No | Sentry error monitoring |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend URL (e.g. `http://localhost:8000/api`) |
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (`pk_test_` or `pk_live_`) |
| `REACT_APP_SENTRY_DSN` | No | Sentry error monitoring |

---

## Authentication (Clerk)

Auth is fully managed by Clerk. The backend verifies Clerk JWTs via JWKS — no custom login/register endpoints needed.

- **Sign-in/up:** Clerk's hosted `<SignIn>` and `<SignUp>` components
- **Token flow:** Frontend gets token via `useAuth().getToken()` → injected into every API request by Axios interceptor
- **Backend:** `CLERK_JWKS_URL` being set activates Clerk JWT verification (overrides legacy JWT auth)
- **User provisioning:** First sign-in auto-creates a local User + Account + Subscription record

### Clerk Webhooks

Webhooks sync Clerk user events to the local database. Configure in Clerk Dashboard:

- **Endpoint:** `https://api.propequitylab.com/api/webhooks/clerk/`
- **Events:** `user.created`, `user.updated`, `user.deleted`
- **Secret:** Set `CLERK_WEBHOOK_SECRET` in backend env to match the signing secret shown in Clerk Dashboard

---

## Deployment

### Backend (Railway)

The backend deploys automatically on push to `main` via GitHub Actions (`deploy.yml`). Railway reads env vars from the Railway project dashboard.

```bash
# Manual Railway deploy
railway up
```

### Frontend (Cloudflare Pages)

```bash
cd frontend
npm run build
npx wrangler pages deploy build
```

Auto-deploys on push to `main` via GitHub Actions when backend tests pass.

---

## Testing

```bash
# Backend unit + integration tests (SQLite in-memory, no real DB needed)
cd backend && python -m pytest tests/ -v --tb=short

# Single test
pytest tests/backend_test.py -v -k "test_name"

# E2E tests (Playwright)
npx playwright test
```

---

## Architecture

```
backend/
  models/       # SQLModel table definitions
  routes/       # FastAPI route handlers (15 modules)
  utils/        # auth, clerk_auth, database_sql, email, sentry, rate_limiter
  alembic/      # database migrations
  server.py     # app entry point

frontend/src/
  components/   # ui/ (shadcn), dashboard/, properties/, onboarding/, charts/
  context/      # AuthContext (Clerk adapter), UserContext, PortfolioContext, ThemeContext
  pages/        # 19+ page components
  services/     # api.js (centralized Axios client with Clerk token injection)
  hooks/        # custom React hooks
```

See `docs/architecture/` for data flow diagrams.
