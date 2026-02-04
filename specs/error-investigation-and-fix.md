# Plan: Error Investigation and Fix — Browser Test Failures

## Task Description
Three errors were reported when testing PropEquityLab in the browser. Full root-cause investigation was performed against the current codebase before this plan was written. Findings below are concrete and verified against the source files.

**Error #1 — "caused during test the website in the browser"** (suspected Lambda/AWS issue).
The project uses **AWS App Runner, not Lambda** — the CI/CD workflow and Dockerfile confirm this. The real issues are a broken registration flow (frontend stores `undefined` tokens and sets `isAuthenticated = true` prematurely), a Sentry SDK version mismatch on the frontend, a double Sentry init with conflicting privacy settings on the backend, and an unused `jq` dependency.

**Error #2 — `useNavigate()` outside a `<Router>`**.
The referenced `WelcomeModal.jsx` does **not exist** in the current codebase — this is a stale error, likely from before the recent project reorganisation. The live structural bug: `BrowserRouter` is scoped inside `AppRoutes()`, but `<Toaster>` is rendered as its sibling in `App()`, outside the Router context. `Landing.jsx` is also an orphan file that calls `useNavigate` but is never imported or routed.

**Error #3 — "The message channel closed before a response was received"**.
Zero `chrome.runtime`, `postMessage`, or message-channel code exists anywhere in the project. This is browser-extension noise (password managers, ad blockers, etc.). Fix: suppress in Sentry.

## Objective
- Registration flow functional end-to-end (register → verify-email prompt → login)
- Sentry correctly initialised on both frontend (v10 pattern) and backend (single init)
- `<BrowserRouter>` promoted to wrap the entire App — Toaster and all providers inside Router context
- `Landing.jsx` orphan resolved
- Browser-extension message-channel noise suppressed in Sentry
- Frontend build and backend compile both pass

## Problem Statement

### Error #1 — Registration flow + Sentry breakage

**Registration flow (the primary user-facing bug):**

`/auth/register` deliberately returns `{ message, user }` with **no tokens** — the user is unverified and must click the email link before logging in. This is correct backend behaviour.

The frontend does not honour this:
- `api.js` → `register()` destructures `access_token` and `refresh_token` from the response and calls `localStorage.setItem('access_token', access_token)`. Both are `undefined`, so `localStorage` stores the literal string `"undefined"`.
- `AuthContext.register()` then calls `setIsAuthenticated(true)` unconditionally.
- `Register.jsx` already has code at line 112 that checks `result.emailVerificationRequired` and redirects to `/login` with a verification message — but `AuthContext` never returns that flag, so execution falls through to `navigate('/dashboard')`.
- On `/dashboard`, every API call sends `Authorization: Bearer undefined`, gets a 401, the refresh interceptor fires with no refresh token, and the app is force-redirected to `/login`.

Net effect: registration appears to succeed, then the app immediately crashes.

**Sentry — frontend:**
`sentry.js` imports `BrowserTracing` from `@sentry/tracing` (`^7.120.4`). `@sentry/react` is at `^10.32.1`. `@sentry/tracing` is a Sentry v7 package; in v10 `BrowserTracing` is auto-included and the `@sentry/tracing` package is obsolete. This import will be a no-op or throw, and the version mismatch can cause SDK conflicts.

**Sentry — backend:**
`server.py` initialises Sentry twice:
1. Module-level block (after "# Initialize Sentry if DSN is provided") with `send_default_pii=True`.
2. Inside the `lifespan` via `init_sentry()` from `utils/sentry_config.py`, which sets `send_default_pii=False`.

In production both fire, creating conflicting privacy settings. The module-level block should be removed; the lifespan call is the correct one.

**`requirements.txt` cruft:**
- `sentry-sdk[fastapi]==2.0.0` (line 34) and `sentry-sdk[fastapi]>=2.0.0` (line 36) — duplicate entries.
- `jq>=1.6.0` — confirmed via grep that **no file** in `backend/` imports `jq`. It is dead weight and requires the `jq` system binary which the Dockerfile does not install.

**`ErrorBoundary.jsx`:**
Uses `import.meta.env.DEV` — this is Vite syntax. The project uses `@craco/craco` + `react-scripts` (webpack/CRA). The `craco.config.js` does not add `DefinePlugin` support for `import.meta`. This evaluates to `undefined`, so the dev-only error details block never renders, and in strict mode it may throw.

### Error #2 — useNavigate outside Router

`App.js` component tree:
```
App()
  └─ ThemeProvider
       └─ Sentry.ErrorBoundary
            └─ HelmetProvider
                 └─ AuthProvider
                      └─ UserProvider
                           └─ PortfolioProvider
                                └─ div.App
                                     ├─ AppRoutes()          ← BrowserRouter is HERE
                                     └─ Toaster              ← OUTSIDE BrowserRouter
```

`<Toaster>` (from sonner) renders outside `<BrowserRouter>`. If any toast action, or any component sonner renders, invokes a Router hook, the error fires. This is also an architectural trap for any future code.

`Landing.jsx` defines a component calling `useNavigate()` at line 6 but is never imported anywhere — confirmed by grep. It is dead code but will crash if ever rendered without a Router ancestor.

### Error #3 — Message channel closed

Confirmed by grep: zero occurrences of `chrome.runtime`, `postMessage`, `addEventListener('message')`, or any message-channel APIs in the project. This error is injected by a browser extension. No code change is needed beyond suppressing it in Sentry's `ignoreErrors`.

## Solution Approach

1. **Backend fixes (`backend-fixer`):** Remove duplicate `sentry-sdk` and unused `jq` from `requirements.txt`. Remove the module-level Sentry init block from `server.py` (keep only the lifespan `init_sentry()` call).

2. **Frontend fixes (`frontend-fixer`):** Fix `api.js` → `register()` to guard token storage behind truthiness checks. Fix `AuthContext.register()` to return `{ success: true, emailVerificationRequired: true }` when no token is returned (Register.jsx already handles this flag). Fix `ErrorBoundary.jsx` to use `process.env.NODE_ENV`. Fix `sentry.js`: remove `BrowserTracing` import and `@sentry/tracing` usage; add the message-channel error string to `ignoreErrors`. Promote `<BrowserRouter>` from inside `AppRoutes` to wrap the entire `App` return. Delete orphan `Landing.jsx`.

3. **Validation:** Build frontend, compile-check backend, grep for remnants of fixed patterns.

## Relevant Files

### Backend
- `backend/requirements.txt` — duplicate `sentry-sdk[fastapi]` entries; unused `jq>=1.6.0`
- `backend/server.py` — module-level Sentry init block (lines "# Initialize Sentry if DSN is provided" through the ALLOWED_ORIGINS block) must be removed; lifespan `init_sentry()` call stays
- `backend/utils/sentry_config.py` — reference; correct init logic, do not modify

### Frontend
- `frontend/src/services/api.js` — `register()` function stores `undefined` tokens unconditionally
- `frontend/src/context/AuthContext.jsx` — `register()` method sets `isAuthenticated = true` without checking for token presence; does not return `emailVerificationRequired`
- `frontend/src/pages/Register.jsx` — already handles `result.emailVerificationRequired` at line 112; no changes needed here
- `frontend/src/App.js` — `BrowserRouter` inside `AppRoutes()`; must move to wrap entire App; remove from `AppRoutes`
- `frontend/src/components/ErrorBoundary.jsx` — `import.meta.env.DEV` → `process.env.NODE_ENV === 'development'`
- `frontend/src/utils/sentry.js` — deprecated `BrowserTracing` import; `ignoreErrors` missing message-channel pattern
- `frontend/src/pages/Landing.jsx` — orphan dead code; delete

## Implementation Phases

### Phase 1: Backend Cleanup
Remove the duplicate `sentry-sdk` line and the `jq` line from `requirements.txt`. Strip the module-level Sentry initialisation block from `server.py` — everything between the "# Initialize Sentry if DSN is provided" comment and the `ALLOWED_ORIGINS` assignment. The `init_sentry()` call inside the `lifespan` context manager remains untouched.

### Phase 2: Frontend Fixes
Fix the registration token-handling chain (`api.js` → `AuthContext`). Fix `ErrorBoundary` CRA compatibility. Fix `sentry.js` (remove `BrowserTracing`, add message-channel suppression). Promote `BrowserRouter` in `App.js`. Delete `Landing.jsx`.

### Phase 3: Validation
Build and compile. Grep for any residual `import.meta.env`, `BrowserTracing`, duplicate `sentry-sdk`, and confirm `BrowserRouter` placement.

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to to the building, validating, testing, deploying, and other tasks.
  - This is critical. You're job is to act as a high level director of the team, not a builder.
  - You're role is to validate all work is going well and make sure the team is on track to complete the plan.
  - You'll orchestrate this by using the Task* Tools to manage coordination between the team members.
  - Communication is paramount. You'll use the Task* Tools to communicate with the team members and ensure they're on track to complete the plan.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: backend-fixer
  - Role: Remove duplicate sentry-sdk and unused jq from requirements.txt; strip module-level Sentry init from server.py
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: frontend-fixer
  - Role: Fix registration flow (api.js + AuthContext), ErrorBoundary, sentry.js, BrowserRouter placement in App.js, delete Landing.jsx
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: final-validator
  - Role: Run frontend build + backend compile; grep for residual issues; confirm all acceptance criteria
  - Agent Type: validator
  - Resume: true

## Step by Step Tasks

### 1. Fix backend dependencies and Sentry
- **Task ID**: fix-backend
- **Depends On**: none
- **Assigned To**: backend-fixer
- **Agent Type**: builder
- **Parallel**: true
- In `backend/requirements.txt`:
  - Delete the line `sentry-sdk[fastapi]>=2.0.0` (the duplicate; keep `sentry-sdk[fastapi]==2.0.0` or consolidate to one `>=2.0.0` — pick one)
  - Delete the line `jq>=1.6.0` (confirmed: no Python file in backend/ imports jq)
- In `backend/server.py`:
  - Remove the entire module-level Sentry block. It starts after the `logger = logging.getLogger(__name__)` and rate-limiter init, at the comment `# Initialize Sentry if DSN is provided`. It ends just before the `# Get allowed origins from environment` comment. Remove these lines:
    ```python
    SENTRY_DSN = os.environ.get("SENTRY_DSN")
    if SENTRY_DSN:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.2,
            environment=os.environ.get("ENVIRONMENT", "development"),
            send_default_pii=True
        )
        logging.info("Sentry initialized")
    ```
  - The `init_sentry()` call inside the `lifespan` async context manager stays as-is
- Also remove the now-unused `import sentry_sdk` and `from sentry_sdk.integrations.fastapi import FastApiIntegration` lines at the top of server.py if `sentry_sdk` is no longer referenced at module level (check first — `init_sentry` in utils handles its own imports)
- Verify: `python -m py_compile backend/server.py` passes

### 2. Fix frontend registration, Sentry, Router, and orphan
- **Task ID**: fix-frontend
- **Depends On**: none
- **Assigned To**: frontend-fixer
- **Agent Type**: builder
- **Parallel**: true
- **api.js — `register()` function** (around line 157-168): Guard token storage. Only store and set headers if the values are present:
  ```javascript
  if (access_token) {
    localStorage.setItem('access_token', access_token);
  }
  if (refresh_token) {
    localStorage.setItem('refresh_token', refresh_token);
  }
  if (access_token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
  }
  ```
- **AuthContext.jsx — `register()` method** (around line 108-113): After `const data = await apiRegister(userData)`, check if `data.access_token` is present. If present: set user and `isAuthenticated` as now. If absent: set user, do NOT set `isAuthenticated`, and return `{ success: true, emailVerificationRequired: true }`. The `Register.jsx` page already handles this return value correctly (line 112-119) — do not modify Register.jsx.
  ```javascript
  const data = await apiRegister(userData);
  if (data.access_token) {
    setUser(data.user);
    setIsAuthenticated(true);
    setUserContext(data.user);
    return { success: true };
  } else {
    // Registration successful but email verification required
    return { success: true, emailVerificationRequired: true };
  }
  ```
- **ErrorBoundary.jsx** (line 6): Replace `import.meta.env.DEV` with `process.env.NODE_ENV === 'development'`
- **sentry.js**:
  - Delete the import line: `import { BrowserTracing } from "@sentry/tracing";`
  - Remove `new BrowserTracing()` from the `integrations` array (Sentry v10 auto-includes performance monitoring; the array can be left empty `integrations: []` or removed entirely)
  - Add to the `ignoreErrors` array:
    ```javascript
    'The message channel closed before a response was received',
    ```
- **App.js — Router promotion**:
  - In the `App()` function, wrap the entire return with `<BrowserRouter>` as the outermost element (inside the fragment or as the single root). Move `import { BrowserRouter, ... }` stays at the top (it's already imported).
  - In `AppRoutes()`, remove `<BrowserRouter>` — keep `<Routes>` and all `<Route>` elements unchanged. `AppRoutes` should now return just `<Routes>...</Routes>`.
  - Result: `App()` returns `<BrowserRouter><ThemeProvider>...<AppRoutes />...<Toaster />...</ThemeProvider></BrowserRouter>`
- **Landing.jsx**: Delete `frontend/src/pages/Landing.jsx` entirely. It is never imported or routed.
- Verify: `npm run build` in `frontend/` completes with no errors

### 3. Final validation
- **Task ID**: validate-all
- **Depends On**: fix-backend, fix-frontend
- **Assigned To**: final-validator
- **Agent Type**: validator
- **Parallel**: false
- Run all Validation Commands listed below
- Confirm every Acceptance Criterion is met
- Report any discrepancies

## Acceptance Criteria
- [ ] `backend/requirements.txt` has exactly one `sentry-sdk` entry
- [ ] `backend/requirements.txt` has no `jq` line
- [ ] `backend/server.py` has no module-level `sentry_sdk.init(...)` call — only `init_sentry()` inside lifespan
- [ ] `backend/server.py` compiles cleanly (`python -m py_compile`)
- [ ] `frontend/src/services/api.js` `register()` guards token storage with truthiness checks
- [ ] `frontend/src/context/AuthContext.jsx` `register()` returns `emailVerificationRequired: true` when no token in response
- [ ] `frontend/src/components/ErrorBoundary.jsx` uses `process.env.NODE_ENV === 'development'` (not `import.meta.env`)
- [ ] `frontend/src/utils/sentry.js` has no `BrowserTracing` import or usage
- [ ] `frontend/src/utils/sentry.js` `ignoreErrors` includes `'The message channel closed before a response was received'`
- [ ] `<BrowserRouter>` wraps the top-level `App` return (Toaster and all providers are inside it)
- [ ] `AppRoutes()` does not contain `<BrowserRouter>` — only `<Routes>`
- [ ] `frontend/src/pages/Landing.jsx` does not exist
- [ ] `npm run build` in `frontend/` succeeds

## Validation Commands
Execute these commands from the project root to verify the task is complete:

- `python -m py_compile backend/server.py` — backend entry point compiles
- `cd frontend && npm run build` — frontend builds cleanly
- `grep -n "sentry-sdk" backend/requirements.txt` — confirm single entry
- `grep -n "jq" backend/requirements.txt` — confirm no match
- `grep -n "sentry_sdk.init" backend/server.py` — must return nothing (module-level block removed)
- `grep -rn "import.meta.env" frontend/src/` — must return nothing
- `grep -rn "BrowserTracing" frontend/src/` — must return nothing
- `grep -n "BrowserRouter" frontend/src/App.js` — confirm present in App() function, NOT in AppRoutes()
- `ls frontend/src/pages/Landing.jsx` — must report file not found
- `grep -n "emailVerificationRequired" frontend/src/context/AuthContext.jsx` — confirm present
- `grep -n "message channel closed" frontend/src/utils/sentry.js` — confirm present

## Notes
- The project deploys to **AWS App Runner** (ap-southeast-2), not Lambda. The user's error report referenced Lambda — this is a misidentification. The Dockerfile and `.github/workflows/deploy-backend.yml` confirm App Runner.
- The `/auth/register` endpoint deliberately omits tokens because users must verify their email first. The two-step flow is: register → check email → verify → login. The frontend `Register.jsx` already has the conditional logic (line 112-119) for `emailVerificationRequired` — it just never receives the flag from `AuthContext`. This is the minimal fix path.
- `@sentry/tracing` (`^7.120.4`) is a Sentry v7 package listed in `frontend/package.json` dependencies. Removing the `BrowserTracing` import from `sentry.js` is sufficient for the fix; the `@sentry/tracing` package entry in `package.json` can be cleaned up in a follow-up (it does no harm sitting there unused).
- Error #3 is definitively browser-extension noise. The Sentry suppression is the only action needed. Users can also be advised to test in an extension-free profile to confirm.
- `Landing.jsx` may have been intended as a public landing page. If so it can be routed to `/` in a future iteration. For now it is dead code and is deleted.
