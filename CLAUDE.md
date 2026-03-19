# PropEquityLab

Australian property investment portfolio management platform. Users track properties, analyze cash flow, model scenarios, and forecast portfolio growth.

**Stack:** FastAPI (Python 3.11) + React 19 + PostgreSQL (Neon.tech serverless) + Cloudflare Pages

For full project documentation see @AGENTS.md.

---

## Tool Usage (Mandatory)

- **Code search**: Always use **jcodemunch-mcp** tools for searching code — never raw grep/find
- **Complex tasks**: Always invoke **superpowers skills** before planning or executing multi-step work

---

## Build & Dev Commands

### Backend
```bash
cd backend
python -m venv venv && source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000  # dev
uvicorn server:app --host 0.0.0.0 --port 8000           # prod
```

### Migrations (Alembic)
```bash
alembic upgrade head
alembic revision --autogenerate -m "Description"
alembic downgrade -1
```

### Frontend
```bash
cd frontend
npm install
npm start        # dev on port 3000 (CRACO)
npm run build    # production build
npm test         # Jest via CRACO
```

### Testing
```bash
pytest tests/ -v --tb=short          # full suite
pytest tests/backend_test.py -v -k "test_name"  # single test
```

### Docker (backend)
```bash
docker build -t propequitylab-backend ./backend
docker run -p 8000:8000 propequitylab-backend
```

### Deployment
- **Backend**: AWS App Runner (ap-southeast-2) via `.github/workflows/deploy-backend.yml` — auto-deploys on push to `main` after tests pass
- **Frontend**: `npx wrangler pages deploy build` from `frontend/`

---

## Critical Rules

**IMPORTANT: All monetary/financial fields MUST use `DECIMAL(19, 4)` — never Float or int.**

**IMPORTANT: Every database query MUST include a data isolation filter:**
```python
.where(Model.user_id == current_user.id)
```
Missing this filter is an IDOR vulnerability.

---

## Backend Conventions

- **Write flow** (always this order): `session.add(obj)` → `session.commit()` → `session.refresh(obj)`
- **Primary keys**: `str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)`
- **Schemas**: Each model has separate `ModelCreate`, `ModelUpdate`, `ModelResponse` classes in the same file
- **Nested data** (loan_details, rental_details): stored as JSON columns with companion Pydantic schemas; convert with `.model_dump(mode='json')`
- **Route pattern**: `APIRouter(prefix="/...", tags=["..."])` + `Depends(get_current_user)` + `Depends(get_session)` on every protected endpoint
- All routes mounted under `/api` prefix in `server.py`
- Type hints and docstrings required on all public functions
- Rate limit: 100 req/min via SlowAPI

---

## Frontend Conventions

- **JSX only** — no TypeScript. Functional components and hooks exclusively.
- **UI components**: shadcn/ui "new-york" style, imported from `@/components/ui` (`@/` = `src/`)
- **Styling**: Tailwind CSS only. Emerald/mint color theme. Dark mode via `class` strategy.
- **API calls**: ALL requests go through `frontend/src/services/api.js` (centralized Axios instance with auto token attach/refresh). Never create ad-hoc fetch/axios calls.
- **Context provider order**: `ThemeProvider > AuthProvider > UserProvider > PortfolioProvider`
- **Layouts**: `MainLayout` (standard pages), `DashboardLayout` (dashboard with right panel)
- **Protected routes**: wrap with `ProtectedRoute` component

---

## Architecture

```
backend/
  models/     # SQLModel table models (11 files)
  routes/     # FastAPI route handlers (16 endpoints)
  utils/      # auth, database, calculations, email, sentry, rate_limiter
  server.py   # app entry point + middleware
  alembic/    # migrations

frontend/src/
  components/ # ui/ (shadcn primitives), dashboard/, properties/, onboarding/, charts/
  context/    # Auth, User, Portfolio, Theme contexts
  pages/      # 21 page components (.jsx)
  services/   # api.js (centralized Axios client)
  hooks/      # custom hooks
```

---

## Testing Patterns

- Backend tests use **SQLite in-memory** (`StaticPool`) — no real Postgres needed locally
- Dependency injection overrides in conftest:
  ```python
  app.dependency_overrides[get_session] = override_get_session
  app.dependency_overrides[get_current_user] = override_get_current_user
  ```
- CI (`.github/workflows/deploy-backend.yml`) uses a real PostgreSQL 15 service container
- Run individual test files rather than the full suite to stay fast

---

## Environment Variables

**Backend** (in `backend/.env`, never commit):
```
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000
RESEND_API_KEY=...
SENTRY_DSN=...
```

**Frontend** (in `frontend/.env`, see `frontend/.env.example`):
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SENTRY_DSN=...
```

---

## Common Gotchas

- Frontend build uses **CRACO**, not plain CRA — webpack config is in `craco.config.js`
- `@/` path alias is configured in CRACO; if it breaks, check `craco.config.js`
- Alembic targets Neon Postgres; local tests bypass migrations via SQLite overrides in `conftest.py`
- `frontend/.npmrc` contains secrets — do not commit (it is gitignored)
- `justfile` at project root is for Bowser browser automation testing, not the main app
