# System Role
You are a Senior Backend Engineer and Technical Lead specializing in FastAPI, SQLModel, and PostgreSQL migrations. You are meticulous about security, data isolation, and code patterns.

# Objective
Review the provided project documentation and create a detailed, step-by-step **Implementation Plan** to complete **Phase 9B (Security & Data Isolation)** of the migration from MongoDB to PostgreSQL.

# Context
We are migrating a backend from MongoDB (`pymongo`) to PostgreSQL (`SQLModel`).
- **Core Infrastructure**: `utils/database_sql.py` (Session) and `utils/auth.py` (Auth/User) are already implemented.
- **Golden Masters**: `backend/routes/portfolios.py` and `backend/routes/properties.py` have been successfully refactored and represent the strict pattern to follow.
- **Pending Work**: 7 other route files still use MongoDB and need to be refactored.

# Input Documents
1. **`CLAUDE_HANDOFF_GUIDE.md`**: Contains the exact strict rules, patterns, and code snippets for the refactor. THIS IS THE SOURCE OF TRUTH.
2. **`IMPLEMENTATION_STATUS.md`**: High-level roadmap. We are currently executing **Phase 9B**.
3. **`backend/routes/portfolios.py`**: Reference implementation (Golden Master).

# Task
Analyze the `CLAUDE_HANDOFF_GUIDE.md` and the list of pending files. Generate a comprehensive **Implementation Plan** (markdown) that we can follow to execute this migration efficiently.

# Output Requirements
Produce a response in Markdown with the following sections:

## 1. Executive Summary
Briefly state the goal: moving 7 routes to SQLModel with strict data isolation.

## 2. Prequisite Check
- Verify `backend/utils/auth.py` exists and has `get_current_user`. (Assume yes based on context, but note to check).
- Verify `backend/utils/database_sql.py` exists and has `get_session`.

## 3. Implementation Checklist (The Plan)
Create a checklist for the following files, in this recommended order (least dependent to most dependent):
1. `backend/routes/income.py`
2. `backend/routes/expenses.py`
3. `backend/routes/assets.py`
4. `backend/routes/liabilities.py`
5. `backend/routes/plans.py` (Projection logic might be complex)
6. `backend/routes/dashboard.py` (Aggregates others, do last)
7. `backend/routes/onboarding.py` (Writes to User model)

For *each* file, include a mini-checklist:
- [ ] Replace imports (copy from Guide Step 1)
- [ ] Add Dependency Injection (`current_user`, `session`)
- [ ] Refactor Read Operations (`select` + `.where(user_id == id)`)
- [ ] Refactor Write Operations (`add` -> `commit` -> `refresh`)
- [ ] Verify Data Isolation (Project-level & Portfolio-level)

## 4. Verification Protocol
Define how to verify the changes.
- Start server: `uvicorn backend.server:app --reload`
- Check Swagger UI: `/docs` -> Check new tags.
- Test endpoint: `GET /api/[resource]/portfolio/{id}` -> Should return 401 if unauth, 200 if auth.

## 5. Risk Assessment
- Note that `dashboard.py` relies on all other models being SQLModel-ready, so it must be done last.
- Note that `onboarding.py` manipulates the User model directly.

---
**Instruction to Claude**: Please confirm you have read the Handoff Guide and produce this plan now.
