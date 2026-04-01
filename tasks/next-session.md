# PropEquityLab — Next Session Todo

Generated: 2026-04-01
Context: Security hardening, E2E tests, and docs completed. All smoke tests passing (26/26). Backend unit tests passing (45/45 + 28 integration). Ready for the next phase.

---

## Priority 1 — Must Do (Blocks full verification)

### 1a. Clerk Dashboard Webhook — Manual Verification
Requires browser access to https://dashboard.clerk.com

- [ ] Open Clerk Dashboard → Webhooks
- [ ] Confirm endpoint URL is `https://api.propequitylab.com/api/webhooks/clerk/`
- [ ] Confirm subscribed events: `user.created`, `user.updated`, `user.deleted`
- [ ] Click "Send test" → check Railway logs for `"status": "ok"` response

**Skill:** `everything-claude-code:verification-loop`

---

### 1b. E2E Auth Lifecycle Tests — Run with Real Credentials
Requires `.env.playwright` to be populated.

- [ ] Create `Propequitylab/.env.playwright` with:
  ```
  CLERK_SECRET_KEY=sk_live_...
  CLERK_TEST_USER_ID=user_...
  PLAYWRIGHT_FRONTEND_URL=https://propequitylab.com
  PLAYWRIGHT_API_URL=https://api.propequitylab.com/api
  ```
- [ ] Run `npx playwright test --project=clerk-auth-flow` — all 4 tests must pass
- [ ] Run `npx playwright test --project=authenticated` — all session tests must pass
- [ ] Confirm sign-up → onboarding redirect works (manual, requires disposable email)

**Skill:** `everything-claude-code:e2e-testing`

---

## Priority 2 — Backend Route Tests (Major Gap)

The conftest has a full `TestClient` with auth overrides + portfolio fixtures, but **zero endpoint tests exist**. This is the biggest quality gap.

### 2a. Write route-level integration tests
- [ ] `tests/integration/test_portfolios.py` — GET/POST/PUT/DELETE, ownership check (IDOR)
- [ ] `tests/integration/test_properties.py` — CRUD + data isolation filter present
- [ ] `tests/integration/test_dashboard.py` — summary endpoint, net worth snapshot
- [ ] `tests/integration/test_onboarding.py` — status, complete, reset
- [ ] `tests/integration/test_auth_isolation.py` — confirm user A cannot read user B's data

**Critical test pattern:**
```python
def test_cannot_access_other_users_data(client, other_user_client, test_portfolio):
    # other_user_client must get 404, not 200
    response = other_user_client.get(f"/api/portfolios/{test_portfolio.id}")
    assert response.status_code == 404
```

**Skill:** `everything-claude-code:tdd-workflow` + `superpowers:subagent-driven-development`

---

## Priority 3 — Python 3.12 Deprecation Fix

`datetime.utcnow()` is deprecated and will be removed. Affects ~35 call sites across the codebase.

- [ ] Run: `grep -rn "datetime.utcnow()" backend/ --include="*.py"` to get full list
- [ ] Replace all with `datetime.now(timezone.utc)` (add `from datetime import timezone` where missing)
- [ ] Files confirmed affected:
  - `backend/utils/auth.py`
  - `backend/routes/clerk_webhooks.py` (×3)
  - `backend/routes/portfolios.py` (×3)
  - `backend/routes/properties.py` (×3)
  - `backend/routes/plans.py`
  - `tests/conftest.py` (×2)
  - Many others

**Skill:** `superpowers:subagent-driven-development` (multi-file, use parallel agents)

---

## Priority 4 — CI/CD: Add Backend Deploy Job

`.github/workflows/deploy.yml` has no backend deploy step. Railway deploys automatically via GitHub integration, but there's no visibility in Actions.

- [ ] Option A (recommended): Add a comment in `deploy.yml` documenting that Railway auto-deploys on push to `main` — no action needed in CI
- [ ] Option B: Add a `deploy-backend` job using `railway up` CLI to make deploys explicit in Actions
- [ ] Either way: add `deploy.yml` badge to `README.md`

**Skill:** `everything-claude-code:deployment-patterns`

---

## Priority 5 — Frontend Cleanup

### 5a. PortfolioContext direct Clerk import
- [ ] In `frontend/src/context/PortfolioContext.jsx` — replace `import { useAuth } from '@clerk/clerk-react'` with `import { useAuth } from './AuthContext'`
- [ ] Verify portfolios still load after change

### 5b. Frontend env example
- [ ] `frontend/.env.example` has `REACT_APP_CLERK_PUBLISHABLE_KEY=` with no example value or comment explaining where to get it
- [ ] Add a comment: `# Get from Clerk Dashboard → API Keys → Publishable key`

**Skill:** `everything-claude-code:code-review`

---

## Priority 6 — Alembic: Add Composite Indexes

The AGENTS.md lists "Add composite indexes" as a current priority. Performance optimization for common query patterns.

- [ ] Identify hot query paths (user_id + portfolio_id lookups are most common)
- [ ] Add composite indexes via Alembic migration:
  ```python
  # Example patterns
  Index("ix_property_user_portfolio", Property.user_id, Property.portfolio_id)
  Index("ix_income_user_portfolio", IncomeSource.user_id, IncomeSource.portfolio_id)
  ```
- [ ] Run migration against Neon and verify explain plans improve

**Skill:** `everything-claude-code:database-reviewer` (PostgreSQL patterns)

---

## Priority 7 — Docs: Audit Setup Guides

`docs/setup/` has 11 setup guides written pre-Clerk. Many reference JWT auth steps.

- [ ] Read each file in `docs/setup/` and flag stale ones
- [ ] Priority files to audit: `PHASE_0_SETUP_GUIDE.md`, `CLAUDE_BACKEND_SETUP_PROMPT.md`
- [ ] Archive or update as appropriate

**Skill:** `everything-claude-code:docs`

---

## Recommended Execution Order

```
Session start → jcodemunch resolve_repo + index_repo (always)
     │
     ├─ 1a. Clerk Dashboard webhook (manual, 10 min)
     ├─ 1b. Run clerk-auth-flow tests (need .env.playwright)
     │
     ├─ 2. Backend route tests (biggest impact, 2-3 hrs)
     │      └── IDOR isolation test is the most critical
     │
     ├─ 3. datetime.utcnow() fix (1 hr, use parallel agents)
     │
     ├─ 4. CI/CD comment or deploy job (30 min)
     │
     ├─ 5. Frontend cleanup (30 min)
     │
     ├─ 6. Alembic composite indexes (1 hr)
     │
     └─ 7. Docs audit (30 min)
```

---

## Known Low-Risk Skips

These exist but are not worth fixing now:
- `financials.py` is 16KB with 12 table classes — candidate for splitting, but no bugs, skip
- `DashboardNew.jsx` vs `Dashboard.jsx` — two dashboard files; `DashboardNew.jsx` is active but `Dashboard.jsx` still exists; clean up when touching dashboard
- `docs/guides/` — pre-Clerk auth guides; archive when you need to onboard someone new
