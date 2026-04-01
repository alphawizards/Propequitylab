# PropEquityLab — Task Tracker

## Active Tasks

### Clerk Webhook Verification (manual — requires Clerk Dashboard access)
- [ ] Confirm Clerk Dashboard webhook URL points to `https://api.propequitylab.com/api/webhooks/clerk/`
- [ ] Confirm `user.created`, `user.updated`, `user.deleted` events are subscribed
- [ ] Trigger a test webhook from Clerk Dashboard and verify Railway logs show `"status": "ok"`

### E2E Auth Lifecycle (requires `.env.playwright` credentials)
- [ ] Create `.env.playwright` with `CLERK_SECRET_KEY` and `CLERK_TEST_USER_ID`
- [ ] Run `npx playwright test --project=clerk-auth-flow` and confirm all 4 tests pass
- [ ] Run `npx playwright test --project=authenticated` and confirm session tests pass

### Known Low-Priority Issues
- [ ] Replace `datetime.utcnow()` with `datetime.now(timezone.utc)` project-wide (Python 3.12 deprecation)
- [ ] Route `PortfolioContext.jsx` through `AuthContext` instead of importing from `@clerk/clerk-react` directly

## Completed

### Operational Verification
- [x] Railway backend healthy — `/api/health` returns 200, `"database": "connected"`
- [x] Cloudflare Pages frontend live — verified `/login` loads (JS-rendered, Clerk widget confirmed in smoke tests)
- [x] Smoke tests confirm: protected routes redirect to `/login`, 401 on unauth API calls, CORS headers correct

### Security Hardening
- [x] Fixed `JWT_SECRET_KEY` crash in Clerk-only mode (`auth.py:27`)
- [x] Removed dead commented security headers block from `server.py`
- [x] Tightened CORS: `allow_methods` and `allow_headers` restricted from `["*"]`
- [x] Removed stale `*.awsapprunner.com` from CSP `connect-src`
- [x] Narrowed webhook exception catch from `Exception` to `WebhookVerificationError`
- [x] Deleted dead MongoDB code (`backend/utils/dev_user.py`, `backend/utils/__init__.py` cleared)

### Deployment Cleanup
- [x] Fixed stale `"PostgreSQL + App Runner"` string in health endpoint
- [x] Fixed `package.json` test script (was a no-op, now runs Playwright)
- [x] Fixed `CLAUDE.md` deployment reference (AWS App Runner → Railway)

### E2E Test Suite
- [x] Fixed hardcoded production URLs in `propequitylab.spec.js` (now reads from env vars)
- [x] Enhanced `authenticated.spec.js` — token polling, array assertion, dashboard/summary test
- [x] Created `tests/e2e/clerk-auth-flow.spec.js` — 4 tests: sign-in, dashboard access, Bearer token, sign-out
- [x] Added `clerk-auth-flow` project to `playwright.config.js`
- [x] 26/26 smoke tests passing

### jcodemunch
- [x] jcodemunch registered as MCP server
- [x] Repo indexed (2,425 symbols, 299 files) — verified with `search_symbols`

### Documentation
- [x] `docs/README.md` — full rewrite (was dated Jan 2026, referenced JWT auth + App Runner)
- [x] `docs/architecture/codebase_data_flow_map.md` — updated auth flow to Clerk sequence diagram
- [x] `CLAUDE.md` — fixed AWS App Runner → Railway reference
- [x] `decisions/2026-04-01-clerk-migration.md` — created
- [x] `decisions/2026-04-01-deployment-strategy.md` — created

### Previous Session
- [x] Removed stale "Zapiio" log line from `backend/server.py`
- [x] Removed dead MongoDB packages (`pymongo`, `motor`) from `requirements.txt`
- [x] Created `tasks/` and `decisions/` directories
- [x] AGENTS.md — updated to match actual `.claude/agents/` files
- [x] CLAUDE.md — fixed jcodemunch tool table
