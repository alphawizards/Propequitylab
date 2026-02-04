# Plan: Propequitylab Project Structure Cleanup

## Task Description
The Propequitylab project root contains a duplicate nested subfolder `Propequitylab/Propequitylab/` which is a more evolved copy of the codebase (additional routes, frontend pages, migrations, seed scripts). The root also has scattered planning `.md` files and three separate `.claude/` directories. This plan consolidates everything into a clean single-level structure: promotes the more complete nested code to root, merges all `.claude/` into the one allowed location (`claude-code-hooks-mastery/.claude/`), organises docs under `docs/`, and removes the nested subfolder entirely.

## Objective
A clean Propequitylab root with:
- One source of truth for `backend/`, `frontend/`, `tests/`, `docs/`
- `.claude/` existing **only** inside `claude-code-hooks-mastery/`
- No nested `Propequitylab/` subfolder
- No `__pycache__`, `.venv`, stale logs, or duplicate planning docs at root

## Problem Statement
During development a nested clone accumulated, producing:
- Duplicated `backend/` and `frontend/` — the nested version is a strict superset (extra routes: gdpr, loans, projections, scenarios, valuations; extra frontend: MortgageCalculator, Settings, legal pages, 10+ dashboard widgets, Sentry integration)
- Three `.claude/` directories (root, nested, hooks-mastery) — policy is one, in hooks-mastery
- Root-level `.md` planning docs that are already organised inside nested `docs/`
- Stale artefacts: `__pycache__/`, `.venv/`, `frontend.log`

## Solution Approach
1. **Merge** unique `.claude/` content (project agents, skills, local settings) into `claude-code-hooks-mastery/.claude/`; delete the other two `.claude/` dirs
2. **Replace** root `backend/` and `frontend/` with the nested versions (superset)
3. **Promote** nested `docs/` and `scripts/` to root; delete duplicate root `.md` files
4. **Remove** `Propequitylab/Propequitylab/` entirely after all content is promoted
5. **Clean** `__pycache__`, `.venv`, `.env`, stale files; verify `.gitignore`

## Relevant Files

### Promoted from nested → root
- `Propequitylab/backend/` — adds alembic migrations, routes (gdpr, loans, projections, scenarios, valuations), utils (calculations, sentry_config), seed scripts
- `Propequitylab/frontend/` — adds MortgageCalculator, dashboard widgets (Borrowing, KPI, Snapshot, Cashflows, QuickSettings, Scenario), pages (Settings, ForgotPassword, ResetPassword, VerifyEmail, Projections, ScenarioDashboard, legal/*), AuthContext, analytics, Sentry
- `Propequitylab/docs/` — organised sub-folders: agents, architecture, archived, guides, internal, misc, plans, setup, summaries
- `Propequitylab/scripts/` — start_ralph.sh, start_ralph_fixed.sh

### Merged into claude-code-hooks-mastery/.claude/
- `.claude/agents/database-architect.md` — project agent (root)
- `.claude/agents/deployment-engineer.md` — project agent (root)
- `.claude/agents/fullstack-developer.md` — project agent (root)
- `Propequitylab/.claude/agents/devops-engineer.md` — project agent (nested)
- `Propequitylab/.claude/skills/` — skill-creator + fullstack-web-developer
- `Propequitylab/.claude/settings.local.json` — local overrides

### Kept at root (untouched)
- `tests/` — 12 integration tests (only exists at root)
- `.github/workflows/deploy-backend.yml` — CI/CD
- `README.md`
- `.gitignore`
- `claude-code-hooks-mastery/` — internal files NOT touched (only `.claude/` receives additions)

### Root .md files to delete (duplicates now inside docs/)
| Root file | Lives in docs/ as |
|---|---|
| CLAUDE_HANDOFF_GUIDE.md | docs/guides/CLAUDE_HANDOFF_GUIDE.md |
| Claude Handoff Guide\_ Refactor…(1).md | stale downloaded copy — delete |
| COMBINED_IMPLEMENTATION_PLAN.md | docs/plans/COMBINED_IMPLEMENTATION_PLAN.md |
| COMPREHENSIVE_TODO_LIST_RevC.md | docs/misc/COMPREHENSIVE_TODO_LIST_RevC.md |
| IMPLEMENTATION_PLAN.md | docs/plans/IMPLEMENTATION_PLAN.md |
| IMPLEMENTATION_STATUS.md | docs/plans/IMPLEMENTATION_STATUS.md |
| PHASE_9A_COMPLETION_REPORT.md | docs/summaries/PHASE_9A_COMPLETION_REPORT.md |
| PHASE_9B_PROGRESS_REPORT.md | docs/summaries/PHASE_9B_PROGRESS_REPORT.md |
| PROJECT_SUMMARY.md | docs/summaries/PROJECT_SUMMARY.md |
| QUICK_START.md | docs/guides/QUICK_START.md |
| REDIS_PROVISIONING_GUIDE.md | docs/setup/REDIS_PROVISIONING_GUIDE.md |
| test_result.md | docs/guides/test_result.md |

### Junk to delete
- All `__pycache__/` directories
- `Propequitylab/.venv/`
- `Propequitylab/frontend/frontend.log`
- `Propequitylab/frontend/node_modules/`
- `Propequitylab/backend/.env` (secret — must not be committed)
- `Propequitylab/backend/test_users_created.md`
- `Propequitylab/directives/` (placeholder — only a README)
- `Propequitylab/execution/` (placeholder — only a README)
- Root `backend_test.py`
- Root `yarn.lock` (frontend now uses npm / package-lock.json)

### Flags for review
- Nested frontend uses `package-lock.json` (npm); root frontend had `yarn.lock`. Promoted frontend uses npm.
- `backend/.env` must NEVER be committed — confirm in `.gitignore`.

## Implementation Phases

### Phase 1: .claude Consolidation
Copy project-specific agents, skills, and local settings from root `.claude/` and nested `.claude/` into `claude-code-hooks-mastery/.claude/`. Delete both source `.claude/` directories. This is the highest-priority constraint.

### Phase 2: Backend & Frontend Promotion
Replace root `backend/` and `frontend/` with the nested (more complete) versions. Strip `__pycache__`, `.env`, `node_modules`, and log files during the copy. Root `tests/` is left untouched.

### Phase 3: Docs Promotion & Root .md Cleanup
Move `docs/` and `scripts/` from nested to root. Once `docs/` is in place, delete the 12 duplicate root-level `.md` files and `backend_test.py`.

### Phase 4: Nested Removal & Final Cleanup
Remove `Propequitylab/Propequitylab/` entirely. Verify `.gitignore`. Confirm no artefacts remain.

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to the building, validating, testing, deploying, and other tasks.
  - This is critical. You're job is to act as a high level director of the team, not a builder.
  - You're role is to validate all work is going well and make sure the team is on track to complete the plan.
  - You'll orchestrate this by using the Task* Tools to manage coordination between the team members.
  - Communication is paramount. You'll use the Task* Tools to communicate with the team members and ensure they're on track to complete the plan.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: claude-merge
  - Role: Merge all `.claude/` content into `claude-code-hooks-mastery/.claude/` and delete orphan `.claude/` directories
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: backend-promoter
  - Role: Replace root `backend/` with the nested evolved version; strip cache and secret files
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: frontend-promoter
  - Role: Replace root `frontend/` with the nested evolved version; remove `node_modules`, logs; delete root `yarn.lock`
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: docs-consolidator
  - Role: Promote nested `docs/` and `scripts/` to root, then delete duplicate root `.md` files and `backend_test.py`
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: cleanup
  - Role: Remove the entire nested `Propequitylab/` subfolder after all content is promoted; final `.gitignore` audit
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: final-validator
  - Role: Verify final directory layout against acceptance criteria; confirm `.claude/` single-location rule
  - Agent Type: validator
  - Resume: true

## Step by Step Tasks

### 1. Merge .claude into hooks-mastery
- **Task ID**: merge-claude
- **Depends On**: none
- **Assigned To**: claude-merge
- **Agent Type**: builder
- **Parallel**: true
- Copy `.claude/agents/{database-architect,deployment-engineer,fullstack-developer}.md` → `claude-code-hooks-mastery/.claude/agents/`
- Copy `Propequitylab/.claude/agents/devops-engineer.md` → `claude-code-hooks-mastery/.claude/agents/`
- If `Propequitylab/.claude/agents/` has `database-architect.md` or `fullstack-developer.md` that differ from root versions, compare and keep the more feature-aware version (likely nested)
- Copy `Propequitylab/.claude/skills/` → `claude-code-hooks-mastery/.claude/skills/`
- Copy `Propequitylab/.claude/settings.local.json` → `claude-code-hooks-mastery/.claude/settings.local.json`
- Delete root `.claude/` directory entirely
- Delete `Propequitylab/.claude/` directory entirely
- Verify: `find . -name ".claude" -type d` returns only `./claude-code-hooks-mastery/.claude`

### 2. Promote nested backend to root
- **Task ID**: promote-backend
- **Depends On**: none
- **Assigned To**: backend-promoter
- **Agent Type**: builder
- **Parallel**: true
- Delete root `backend/` (including any `__pycache__/`)
- Copy `Propequitylab/backend/` → root `backend/`
- Remove `backend/__pycache__/` and `backend/routes/__pycache__/` from the new copy
- Remove `backend/.env` (secret — must not be in the tree)
- Remove `backend/test_users_created.md` (stale)
- Verify: `server.py` present, all route files present including `gdpr.py`, `loans.py`, `projections.py`, `scenarios.py`, `valuations.py`

### 3. Promote nested frontend to root
- **Task ID**: promote-frontend
- **Depends On**: none
- **Assigned To**: frontend-promoter
- **Agent Type**: builder
- **Parallel**: true
- Delete root `frontend/` (including its `yarn.lock`)
- Copy `Propequitylab/frontend/` → root `frontend/`
- Remove `frontend/node_modules/` from the copy
- Remove `frontend/frontend.log`
- Delete root-level `yarn.lock` (was a leftover from when frontend was at root)
- Verify: `package.json`, `package-lock.json`, `src/components/calculators/MortgageCalculator/` present

### 4. Promote docs and scripts from nested to root
- **Task ID**: promote-docs
- **Depends On**: none
- **Assigned To**: docs-consolidator
- **Agent Type**: builder
- **Parallel**: true
- Copy `Propequitylab/docs/` → root `docs/`
- Copy `Propequitylab/scripts/` → root `scripts/`
- Delete `Propequitylab/directives/` (only a README placeholder)
- Delete `Propequitylab/execution/` (only a README placeholder)

### 5. Delete duplicate root .md files
- **Task ID**: cleanup-root-mds
- **Depends On**: promote-docs
- **Assigned To**: docs-consolidator
- **Agent Type**: builder
- **Parallel**: false
- Delete these root-level files (all have canonical copies in `docs/`):
  - `CLAUDE_HANDOFF_GUIDE.md`
  - `Claude Handoff Guide_ Refactor Remaining Routes to SQLModel + Auth (1).md`
  - `COMBINED_IMPLEMENTATION_PLAN.md`
  - `COMPREHENSIVE_TODO_LIST_RevC.md`
  - `IMPLEMENTATION_PLAN.md`
  - `IMPLEMENTATION_STATUS.md`
  - `PHASE_9A_COMPLETION_REPORT.md`
  - `PHASE_9B_PROGRESS_REPORT.md`
  - `PROJECT_SUMMARY.md`
  - `QUICK_START.md`
  - `REDIS_PROVISIONING_GUIDE.md`
  - `test_result.md`
- Delete root `backend_test.py`

### 6. Remove nested Propequitylab folder and final cleanup
- **Task ID**: remove-nested
- **Depends On**: merge-claude, promote-backend, promote-frontend, promote-docs, cleanup-root-mds
- **Assigned To**: cleanup
- **Agent Type**: builder
- **Parallel**: false
- Delete `Propequitylab/` subfolder entirely (all content has been promoted)
- Audit root `.gitignore` — ensure it includes: `__pycache__/`, `.venv/`, `.env`, `node_modules/`, `*.log`
- Scan for any remaining `__pycache__/` or `.venv/` anywhere in the tree and remove

### 7. Final structure validation
- **Task ID**: validate-all
- **Depends On**: remove-nested
- **Assigned To**: final-validator
- **Agent Type**: validator
- **Parallel**: false
- Run all Validation Commands listed below
- Confirm every Acceptance Criterion is met
- Report any discrepancies

## Acceptance Criteria
- [ ] `.claude/` exists **only** inside `claude-code-hooks-mastery/` — not at project root, not anywhere else
- [ ] `claude-code-hooks-mastery/.claude/agents/` contains: database-architect, deployment-engineer, fullstack-developer, devops-engineer
- [ ] `claude-code-hooks-mastery/.claude/skills/` exists with skill-creator and fullstack-web-developer
- [ ] Root `backend/` contains all routes including gdpr, loans, projections, scenarios, valuations
- [ ] Root `frontend/` contains MortgageCalculator, Settings page, legal pages, and all dashboard widgets
- [ ] Root `docs/` exists with sub-folders: agents, architecture, archived, guides, internal, misc, plans, setup, summaries
- [ ] Root `scripts/` exists with start_ralph.sh files
- [ ] `tests/` with 12 integration tests is untouched
- [ ] `.github/workflows/deploy-backend.yml` is untouched
- [ ] `claude-code-hooks-mastery/` internal files are untouched (only `.claude/` received additions)
- [ ] No nested `Propequitylab/Propequitylab/` subfolder exists
- [ ] No `__pycache__/`, `.venv/`, `.env`, or `frontend.log` anywhere in the tree
- [ ] No duplicate planning `.md` files at root (all consolidated into `docs/`)
- [ ] `.gitignore` covers `__pycache__/`, `.venv/`, `.env`, `node_modules/`, `*.log`

## Validation Commands
Execute these commands from the project root to verify the task is complete:

- `find . -name "__pycache__" -type d` — must return nothing
- `find . -name ".venv" -type d` — must return nothing
- `find . -name ".env" -type f` — must return nothing
- `find . -name ".claude" -type d` — must return only `./claude-code-hooks-mastery/.claude`
- `find . -maxdepth 1 -name "Propequitylab" -type d` — must return nothing
- `ls backend/routes/` — confirm gdpr.py, loans.py, projections.py, scenarios.py, valuations.py
- `ls frontend/src/components/calculators/MortgageCalculator/` — confirm component files present
- `ls docs/` — confirm agents, architecture, archived, guides, internal, misc, plans, setup, summaries
- `ls scripts/` — confirm start_ralph.sh present
- `ls tests/integration/` — confirm 12 test files unchanged
- `ls .github/workflows/` — confirm deploy-backend.yml
- `ls claude-code-hooks-mastery/.claude/agents/` — confirm 4 project agents + existing hooks-mastery agents
- `ls claude-code-hooks-mastery/.claude/skills/` — confirm skill-creator, fullstack-web-developer

## Notes
- `backend/.env` must never be committed. Verify `.gitignore` covers it before any git operations.
- The nested frontend switched from yarn to npm. Root `yarn.lock` is removed; `frontend/package-lock.json` is the lock file going forward.
- `claude-code-hooks-mastery/` internal files must not be modified by any task — only new files are added to its `.claude/` sub-tree.
- Nested `.claude/agents/` had copies of `database-architect.md` and `fullstack-developer.md`. The builder should compare against root versions and keep whichever is more feature-aware (the nested versions likely reference Sentry/alembic).
- Tasks 1–4 have no mutual dependencies and can run in parallel. Task 5 depends on Task 4. Task 6 depends on all of 1–5. Task 7 depends on Task 6.
