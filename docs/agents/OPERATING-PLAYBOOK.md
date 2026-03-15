# PropEquityLab — AI Agent Operating Playbook

> **Purpose:** How to use Claude agents + jcodemunch-mcp together to review, improve, and maintain PropEquityLab with optimal token efficiency.  
> **Last Updated:** 2026-03-10

---

## Overview

This playbook defines the operating model for AI-assisted development on PropEquityLab. It combines:

- **jcodemunch-mcp** — Indexed codebase retrieval (saves ~400k tokens per query vs. raw file reads)
- **Claude agents** in `~/.claude/agents/` — Specialist decision-makers
- **Directives** in `directives/` — Plans that survive context window resets
- **Execution scripts** in `execution/` — Deterministic tools

The golden rule:
> **Agents use jcodemunch to retrieve code — they do not read full files unless symbol-level retrieval is insufficient.**

---

## jcodemunch Index Status

| Property | Value |
|---------|-------|
| Repo ID | `local/Propequitylab-016335a0` |
| Files indexed | 243 |
| Symbols indexed | 964 |
| Languages | Python (71), JavaScript (157), TypeScript (13) |
| Re-index command | `jcodemunch index_folder C:/Users/ckr_4/01 Web Projects/Propequitylab` |

**Re-index after:** significant model/route additions, major frontend restructuring, or after applying large patches.

---

## Token-Efficient Retrieval Order

Always retrieve in this order — stop as soon as you have enough context:

| Step | Tool | When to use |
|------|------|-------------|
| 1 | `get_repo_outline` | First call in any new task — understand structure |
| 2 | `search_symbols` | Find relevant functions/classes by intent |
| 3 | `get_file_outline` | Inspect a file's top-level symbols |
| 4 | `get_symbol` / `get_symbols` | Load exact function/class bodies |
| 5 | `search_text` | Only for string literals, config values, comments |
| 6 | `read_file` (raw) | Last resort — only if symbol-level is insufficient |

**Never start with `read_file` on large files** (api.js is 856 lines, server.py is 200+ lines).

---

## Agent Selection Guide

### For any new feature → Feature Planner first
```
"Use PropEquityLab Feature Planner to plan [feature name]"
```
Outputs a directive to `directives/[feature-name].md`.

### For backend work
```
"Use PropEquityLab Backend Engineer to [implement/fix/review]"
```
Knows: FastAPI, SQLModel, Alembic, ownership checks, Decimal for money.

### For frontend work
```
"Use PropEquityLab Frontend Engineer to [implement/fix/review]"
```
Knows: React 19, shadcn/ui, Recharts, api.js centralization.

### For tests
```
"Use PropEquityLab QA Engineer to write tests for [feature]"
```
Knows: conftest fixtures, financial edge cases, security test patterns.

### For security
```
"Use PropEquityLab Security Reviewer to review [file/feature]"
```
Knows: IDOR, JWT, GDPR, fintech-specific data exposure rules.

### Final sign-off
```
"Use Reality Checker to certify [feature] is production ready"
```
Defaults to NEEDS WORK. Requires evidence.

---

## Standard Feature Development Workflow

```
1. PLAN
   Agent: Feature Planner + jcodemunch
   Input: Feature description
   Output: directives/[feature].md

2. BACKEND
   Agent: Backend Engineer + jcodemunch (search_symbols first)
   Input: directive
   Output: models, routes, migration

3. FRONTEND
   Agent: Frontend Engineer + jcodemunch (search_symbols first)
   Input: directive + new backend endpoints
   Output: pages, components, api.js additions

4. TEST
   Agent: QA Engineer + jcodemunch (find similar tests first)
   Input: new endpoints and components
   Output: tests/integration/test_[feature].py

5. REVIEW
   Agent: Security Reviewer + jcodemunch (grep auth/ownership)
   Input: all changed files
   Output: APPROVED / BLOCKED with specific findings

6. BUILD VALIDATION
   Command: powershell -Command "Set-Location frontend; & '.\node_modules\.bin\craco.cmd' build"
   Expected: "Compiled successfully"

7. COMMIT
   Only after: build passes + security review APPROVED
```

---

## Stabilization Workflow (Getting to Working Website)

Use this when working to fix bugs and get the app functional:

```
1. AUDIT
   Agent: Feature Planner + jcodemunch
   Task: "Run a codebase audit. Use get_repo_outline, then search_symbols 
          for known problem areas (auth, dashboard, projections). 
          Output findings to directives/stabilization-[date].md"

2. TRIAGE
   Sort findings by: BLOCKER → HIGH → MEDIUM → LOW
   Blockers: app won't start, auth broken, dashboard blank, build fails

3. FIX BLOCKERS FIRST
   Agent: Backend Engineer (backend blockers)
   Agent: Frontend Engineer (frontend blockers)
   One fix at a time — validate build after each

4. VERIFY CORE FLOWS
   Flow 1: Register → verify email → login → dashboard loads
   Flow 2: Add property → view in portfolio
   Flow 3: View projections
   Flow 4: Settings / logout

5. CERTIFY
   Agent: Reality Checker
   Must provide: build output, screenshots, flow walkthrough
```

---

## Known Codebase State (as of 2026-03-10)

### ✅ Fixed (confirmed by code review)
- Registration flow: api.js and AuthContext both guard token storage correctly
- AuthContext returns `emailVerificationRequired: true` when no token
- BrowserRouter wraps entire App() — Toaster is inside it
- No module-level `sentry_sdk.init()` in server.py
- No `BrowserTracing` / `@sentry/tracing` in frontend
- No `import.meta.env` anywhere in frontend (CRA-compatible)
- Sentry ignoreErrors includes message-channel browser extension noise
- `requirements.txt` clean: single `sentry-sdk` entry, no `jq`
- `Landing.jsx` orphan deleted

### ✅ Build Status
- Frontend: `Compiled successfully` (craco build — 411kB gzipped JS)
- Backend: Python imports compile cleanly

### 🔍 Items to Monitor
- CORS: `allow_methods=["*"]` and `allow_headers=["*"]` — restrict for production
- User ID logging in `utils/auth.py` — consider session IDs instead
- Connection pool exhaustion under load — add monitoring
- Missing startup validation for `DATABASE_URL` and `JWT_SECRET_KEY` env vars

### 🎯 Next Priority Work
1. End-to-end testing: registration → login → dashboard → core flows
2. Dashboard data loading correctness
3. Projections/calculations end-to-end accuracy
4. Scenario feature completeness
5. Mobile responsive review

---

## Build Commands

```bash
# Frontend build (from project root)
powershell -Command "Set-Location 'C:\Users\ckr_4\01 Web Projects\Propequitylab\frontend'; & '.\node_modules\.bin\craco.cmd' build"

# Backend compile check
python -m py_compile backend/server.py

# Backend dev server
cd backend && uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Frontend dev server
powershell -Command "Set-Location frontend; & '.\node_modules\.bin\craco.cmd' start"

# Run backend tests
cd tests && python -m pytest -v

# Re-index jcodemunch (after major changes)
# Use jcodemunch MCP tool: index_folder with path C:/Users/ckr_4/01 Web Projects/Propequitylab
```

---

## Directive Format

Every feature plan should follow this skeleton:

```markdown
# Directive: [Feature Name]
**Created**: [Date]
**Status**: Ready / In Progress / Done
**Priority**: High / Medium / Low

## Summary
[What it does and why]

## Data Model Changes
[New/modified models + migration required]

## API Contract
[Endpoints, request/response shapes]

## Frontend Changes
[Pages, components, api.js additions]

## Security Requirements
[Ownership checks, GDPR, rate limiting]

## Financial Edge Cases
[Zero values, negative equity, Decimal precision]

## Tests Required
[List of test scenarios]

## File Change List
[Exact files to touch]

## Implementation Order
[1. models → 2. routes → 3. api.js → 4. UI → 5. tests → 6. review]
```

---

## Handoff Format Between Agents

When one agent finishes and another continues, output this:

```markdown
## Agent Handoff

**From:** [Agent name]
**To:** [Agent name]
**Task:** [What's next]

**Completed:**
- [What was done]
- [Files changed]

**jcodemunch symbols used:**
- [symbol_id] — why it was relevant

**Decisions made:**
- [Key choices and rationale]

**Open risks:**
- [Anything the next agent should watch for]

**Context needed by next agent:**
- [Minimal context to continue without re-reading everything]
```

---

*This playbook should be updated whenever the workflow or codebase conventions change significantly.*
