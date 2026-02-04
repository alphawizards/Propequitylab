# Phase 9B Implementation Plan: Security & Data Isolation

**Document Version:** 1.1 (Verified)
**Date:** 2026-01-07
**Status:** ✅ Verified via Chain of Verification (CoVe)
**Estimated Duration:** 1-2 days

---

## ⚠️ CRITICAL SECURITY RULES - READ FIRST

Before implementing ANY route, internalize these **non-negotiable security rules**:

### 🔒 Rule 1: Universal Data Isolation
**EVERY query MUST include `.where(Model.user_id == current_user.id)` - NO EXCEPTIONS**
- Applies to: SELECT (read), SELECT before UPDATE, SELECT before DELETE
- Missing this filter = critical security vulnerability (cross-user data leakage)

### 🔒 Rule 2: Double-Filter for Portfolio-Scoped Resources
**For Income, Expense, Asset, Liability, Property:**
1. ✅ Verify portfolio ownership: `select(Portfolio).where(Portfolio.user_id == current_user.id)`
2. ✅ Query resource with BOTH filters:
   ```python
   select(Resource).where(
       Resource.portfolio_id == portfolio_id,
       Resource.user_id == current_user.id  # ← STILL REQUIRED even after portfolio check!
   )
   ```
**Why both?** Defense in depth - prevents data leakage even if portfolio_id is compromised.

### 🔒 Rule 3: Write Operation Flow (Mandatory Order)
```python
session.add(item)       # 1. Add to session
session.commit()        # 2. Commit to database
session.refresh(item)   # 3. Refresh to get DB-generated fields (id, timestamps)
return item             # 4. Return refreshed object
```
**Skipping refresh = item.id will be None**

### 🔒 Rule 4: Dependency Injection Pattern
**Every endpoint MUST have:**
```python
async def endpoint_name(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
```

### 🔒 Rule 5: Never Trust Input IDs
**Always verify ownership before any operation:**
- ❌ `session.get(Model, item_id)` - WRONG (no user_id check)
- ✅ `select(Model).where(Model.id == item_id, Model.user_id == current_user.id)` - CORRECT

---

## 1. Executive Summary

This plan outlines the systematic migration of **7 remaining route files** from MongoDB patterns to SQLModel with **strict authentication and data isolation**. The goal is to replace all `DEV_USER_ID` hardcoded references with JWT-based authentication via `get_current_user`, ensuring every query includes `.where(Model.user_id == current_user.id)` to prevent unauthorized cross-user data access.

**Golden Masters:**
- [backend/routes/portfolios.py](backend/routes/portfolios.py) - ✅ Complete
- [backend/routes/properties.py](backend/routes/properties.py) - ✅ Complete

**Pending Routes:**
1. `backend/routes/income.py` - Portfolio-scoped income sources
2. `backend/routes/expenses.py` - Portfolio-scoped expenses
3. `backend/routes/assets.py` - Portfolio-scoped assets
4. `backend/routes/liabilities.py` - Portfolio-scoped liabilities
5. `backend/routes/plans.py` - Portfolio-scoped FIRE plans
6. `backend/routes/dashboard.py` - Aggregates all data (must be last)
7. `backend/routes/onboarding.py` - User profile + initial portfolio creation

**Success Criteria:**
- ✅ All routes use `current_user: User = Depends(get_current_user)`
- ✅ All queries include `.where(Model.user_id == current_user.id)`
- ✅ No `DEV_USER_ID` references remain
- ✅ All write operations follow: `session.add()` → `session.commit()` → `session.refresh()`
- ✅ Backend is production-ready for authenticated users

---

## 2. Prerequisite Check

Before starting, verify the following infrastructure exists:

### ✅ Authentication Infrastructure
- [ ] Verify `backend/utils/auth.py` exists
- [ ] Confirm `get_current_user()` dependency function is implemented
- [ ] Verify JWT token validation logic is in place

### ✅ Database Infrastructure
- [ ] Verify `backend/utils/database_sql.py` exists
- [ ] Confirm `get_session()` dependency function is implemented
- [ ] Verify PostgreSQL/Neon connection is configured

### ✅ Models Infrastructure
- [ ] Verify all models in `backend/models/` have:
  - `user_id: str` field
  - `portfolio_id: Optional[str]` field (where applicable)
  - Base CRUD schemas (`Create`, `Update`, base model)

### ✅ Golden Master Validation
- [ ] Read [backend/routes/portfolios.py](backend/routes/portfolios.py) to understand the pattern
- [ ] Read `backend/routes/properties.py` to see portfolio-scoped resource example

**Expected State:**
- Auth and database utilities are **already implemented** (per IMPLEMENTATION_STATUS.md context)
- We are **only refactoring routes** to use these utilities

---

## 3. Implementation Checklist

Execute in this order (least dependent → most dependent):

---

### 📋 File 1: `backend/routes/income.py`

**Model:** `IncomeSource`
**Scoped To:** `portfolio_id`
**Key Fields:** `amount` (Decimal), `frequency`, `source`, `category`, `taxable`

**🔒 SECURITY ALERT:** This is a portfolio-scoped resource. Apply **Rule 2 (Double-Filter)** from the security rules above.

**Refactor Checklist:**

- [ ] **Step 1:** Replace imports
  ```python
  """
  Income Routes - SQL-Based with Authentication & Data Isolation
  ⚠️ CRITICAL: All queries include .where(IncomeSource.user_id == current_user.id) for data isolation
  """

  from fastapi import APIRouter, Depends, HTTPException, status
  from sqlmodel import Session, select
  from typing import List
  from datetime import datetime
  import logging

  from models.income import IncomeSource, IncomeCreate, IncomeUpdate
  from models.portfolio import Portfolio
  from models.user import User
  from utils.database_sql import get_session
  from utils.auth import get_current_user

  logger = logging.getLogger(__name__)
  router = APIRouter(prefix="/api/income", tags=["income"])
  ```

- [ ] **Step 2:** Add dependency injection to ALL endpoints
  - Add `current_user: User = Depends(get_current_user)` parameter
  - Add `session: Session = Depends(get_session)` parameter

- [ ] **Step 3:** Refactor Read Operations
  - Replace MongoDB `find()` with `select(IncomeSource).where(...)`
  - Add `.where(IncomeSource.user_id == current_user.id)` to EVERY query
  - **⚠️ CRITICAL:** For portfolio-scoped queries, use DOUBLE-FILTER pattern:

  ```python
  # STEP 1: Verify portfolio ownership (1st security check)
  portfolio_stmt = select(Portfolio).where(
      Portfolio.id == portfolio_id,
      Portfolio.user_id == current_user.id
  )
  portfolio = session.exec(portfolio_stmt).first()
  if not portfolio:
      raise HTTPException(status_code=404, detail="Portfolio not found")

  # STEP 2: Query income with BOTH filters (2nd security check - defense in depth)
  statement = select(IncomeSource).where(
      IncomeSource.portfolio_id == portfolio_id,
      IncomeSource.user_id == current_user.id  # ← MUST include even after Step 1!
  )
  incomes = session.exec(statement).all()
  ```

  **Why both filters?** Portfolio verification alone isn't enough. Always verify user_id on the resource itself.

- [ ] **Step 4:** Refactor Write Operations (Create)
  ```python
  income = IncomeSource(
      user_id=current_user.id,  # CRITICAL: Set from authenticated user
      portfolio_id=portfolio_id,
      # ... other fields from data ...
  )
  session.add(income)
  session.commit()
  session.refresh(income)
  return income
  ```

- [ ] **Step 5:** Refactor Write Operations (Update)
  ```python
  statement = select(IncomeSource).where(
      IncomeSource.id == income_id,
      IncomeSource.user_id == current_user.id
  )
  income = session.exec(statement).first()

  if not income:
      raise HTTPException(status_code=404, detail="Income not found")

  update_data = data.model_dump(exclude_unset=True)
  for key, value in update_data.items():
      setattr(income, key, value)

  session.add(income)
  session.commit()
  session.refresh(income)
  return income
  ```

- [ ] **Step 6:** Refactor Write Operations (Delete)
  ```python
  statement = select(IncomeSource).where(
      IncomeSource.id == income_id,
      IncomeSource.user_id == current_user.id
  )
  income = session.exec(statement).first()

  if not income:
      raise HTTPException(status_code=404, detail="Income not found")

  session.delete(income)
  session.commit()
  return {"message": "Income deleted successfully"}
  ```

- [ ] **Step 7:** Verify Data Isolation
  - Check every `select()` statement has `.where(IncomeSource.user_id == current_user.id)`
  - Check portfolio verification exists for portfolio-scoped endpoints
  - Remove all `DEV_USER_ID` references

- [ ] **Step 8:** Test endpoints
  - Start server: `uvicorn backend.server:app --reload`
  - Check `/docs` → Test GET/POST/PUT/DELETE operations
  - Verify 401 response without auth token
  - Verify 200 response with valid auth token

---

### 📋 File 2: `backend/routes/expenses.py`

**Model:** `Expense`
**Scoped To:** `portfolio_id`
**Key Fields:** `amount` (Decimal), `frequency`, `category`, `description`, `retirement_percentage`

**🔒 SECURITY ALERT:** This is a portfolio-scoped resource. Apply **Rule 2 (Double-Filter)** from the security rules above.

**Refactor Checklist:**

- [ ] **Step 1:** Replace imports (same pattern as income.py)
  - Update model imports to `Expense`, `ExpenseCreate`, `ExpenseUpdate`
  - Update router prefix to `/api/expenses`, tags to `["expenses"]`

- [ ] **Step 2:** Add dependency injection to ALL endpoints
  - Add `current_user: User = Depends(get_current_user)`
  - Add `session: Session = Depends(get_session)`

- [ ] **Step 3:** Refactor Read Operations
  - Replace MongoDB queries with SQLModel `select(Expense).where(...)`
  - Add `.where(Expense.user_id == current_user.id)` to ALL queries
  - Verify portfolio access for portfolio-scoped queries

- [ ] **Step 4:** Refactor Write Operations (Create)
  - Use `session.add()` → `session.commit()` → `session.refresh()`
  - Set `user_id=current_user.id` from authenticated user

- [ ] **Step 5:** Refactor Write Operations (Update)
  - Query with user_id filter, update fields, commit, refresh

- [ ] **Step 6:** Refactor Write Operations (Delete)
  - Query with user_id filter, delete, commit

- [ ] **Step 7:** Verify Data Isolation
  - Audit all queries for `.where(Expense.user_id == current_user.id)`
  - Remove all `DEV_USER_ID` references

- [ ] **Step 8:** Test endpoints via `/docs`

---

### 📋 File 3: `backend/routes/assets.py`

**Model:** `Asset`
**Scoped To:** `portfolio_id`
**Key Fields:** `current_value` (Decimal), `asset_type`, `institution`, `contribution_amount`

**🔒 SECURITY ALERT:** This is a portfolio-scoped resource. Apply **Rule 2 (Double-Filter)** from the security rules above.

**Refactor Checklist:**

- [ ] **Step 1:** Replace imports (same pattern)
  - Update model imports to `Asset`, `AssetCreate`, `AssetUpdate`
  - Update router prefix to `/api/assets`, tags to `["assets"]`

- [ ] **Step 2:** Add dependency injection to ALL endpoints

- [ ] **Step 3:** Refactor Read Operations
  - Replace MongoDB with SQLModel
  - Add `.where(Asset.user_id == current_user.id)`
  - Verify portfolio access

- [ ] **Step 4:** Refactor Write Operations (Create)
  - Set `user_id=current_user.id`
  - Use add → commit → refresh

- [ ] **Step 5:** Refactor Write Operations (Update)
  - Query with user_id filter, update, commit, refresh

- [ ] **Step 6:** Refactor Write Operations (Delete)
  - Query with user_id filter, delete, commit

- [ ] **Step 7:** Verify Data Isolation
  - Remove all `DEV_USER_ID` references

- [ ] **Step 8:** Test endpoints via `/docs`

---

### 📋 File 4: `backend/routes/liabilities.py`

**Model:** `Liability`
**Scoped To:** `portfolio_id`
**Key Fields:** `current_balance` (Decimal), `original_amount` (Decimal), `interest_rate`, `lender`

**🔒 SECURITY ALERT:** This is a portfolio-scoped resource. Apply **Rule 2 (Double-Filter)** from the security rules above.

**Refactor Checklist:**

- [ ] **Step 1:** Replace imports (same pattern)
  - Update model imports to `Liability`, `LiabilityCreate`, `LiabilityUpdate`
  - Update router prefix to `/api/liabilities`, tags to `["liabilities"]`

- [ ] **Step 2:** Add dependency injection to ALL endpoints

- [ ] **Step 3:** Refactor Read Operations
  - Replace MongoDB with SQLModel
  - Add `.where(Liability.user_id == current_user.id)`
  - Verify portfolio access

- [ ] **Step 4:** Refactor Write Operations (Create)
  - Set `user_id=current_user.id`
  - Use add → commit → refresh

- [ ] **Step 5:** Refactor Write Operations (Update)
  - Query with user_id filter, update, commit, refresh

- [ ] **Step 6:** Refactor Write Operations (Delete)
  - Query with user_id filter, delete, commit

- [ ] **Step 7:** Verify Data Isolation
  - Remove all `DEV_USER_ID` references

- [ ] **Step 8:** Test endpoints via `/docs`

---

### 📋 File 5: `backend/routes/plans.py`

**Model:** `Plan`
**Scoped To:** `portfolio_id`
**Key Fields:** `target_equity` (Decimal), `target_passive_income` (Decimal), `plan_type`, `withdrawal_rate`

**🔒 SECURITY ALERT:** This is a portfolio-scoped resource. Apply **Rule 2 (Double-Filter)** from the security rules above.

**⚠️ COMPLEXITY WARNING:** This file contains projection logic. Be extra careful with calculation endpoints - they aggregate data from multiple models and EVERY query must include user_id filters.

**Refactor Checklist:**

- [ ] **Step 1:** Replace imports (same pattern)
  - Update model imports to `Plan`, `PlanCreate`, `PlanUpdate`
  - Update router prefix to `/api/plans`, tags to `["plans"]`

- [ ] **Step 2:** Add dependency injection to ALL endpoints
  - Include projection endpoints (`POST /api/plans/project`, `GET /api/plans/{id}/projections`)

- [ ] **Step 3:** Refactor Read Operations
  - Replace MongoDB with SQLModel
  - Add `.where(Plan.user_id == current_user.id)`
  - Verify portfolio access

- [ ] **Step 4:** Refactor Write Operations (Create/Update/Delete)
  - Same pattern as previous routes

- [ ] **Step 5:** Refactor Projection Endpoints
  - Ensure projection calculations query assets/income/expenses with user_id filters
  - Verify portfolio access before calculating projections
  - Use `select(Model).where(Model.portfolio_id == portfolio_id, Model.user_id == current_user.id)`

- [ ] **Step 6:** Verify Data Isolation in Aggregations
  - Any calculation that fetches related data (income, expenses, assets) must filter by user_id

- [ ] **Step 7:** Remove all `DEV_USER_ID` references

- [ ] **Step 8:** Test endpoints
  - Test CRUD operations
  - **CRITICAL:** Test projection calculations with authenticated user

---

### 📋 File 6: `backend/routes/dashboard.py`

**⚠️ DO THIS LAST** - Aggregates data from ALL other models

**Purpose:** Aggregates data across Portfolio, Property, IncomeSource, Expense, Asset, Liability, Plan, NetWorthSnapshot

**Refactor Checklist:**

- [ ] **Step 1:** Replace imports
  ```python
  """
  Dashboard Routes - SQL-Based with Authentication & Data Isolation
  ⚠️ CRITICAL: All queries include .where(Model.user_id == current_user.id) for data isolation
  """

  from fastapi import APIRouter, Depends, HTTPException, status
  from sqlmodel import Session, select
  from typing import Dict
  from decimal import Decimal
  import logging

  from models.portfolio import Portfolio
  from models.property import Property
  from models.income import IncomeSource
  from models.expense import Expense
  from models.asset import Asset
  from models.liability import Liability
  from models.plan import Plan
  from models.net_worth_snapshot import NetWorthSnapshot
  from models.user import User
  from utils.database_sql import get_session
  from utils.auth import get_current_user

  logger = logging.getLogger(__name__)
  router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
  ```

- [ ] **Step 2:** Add dependency injection
  - Add `current_user: User = Depends(get_current_user)`
  - Add `session: Session = Depends(get_session)`

- [ ] **Step 3:** Refactor Aggregation Queries
  - For EACH model query, add `.where(Model.user_id == current_user.id)`

  ```python
  # Example for dashboard summary
  properties = session.exec(
      select(Property).where(Property.user_id == current_user.id)
  ).all()

  incomes = session.exec(
      select(IncomeSource).where(IncomeSource.user_id == current_user.id)
  ).all()

  expenses = session.exec(
      select(Expense).where(Expense.user_id == current_user.id)
  ).all()

  assets = session.exec(
      select(Asset).where(Asset.user_id == current_user.id)
  ).all()

  liabilities = session.exec(
      select(Liability).where(Liability.user_id == current_user.id)
  ).all()
  ```

- [ ] **Step 4:** Calculate Totals
  - Use Python `sum()` on Decimal fields
  - Handle `None` values with `or Decimal(0)`

  ```python
  total_property_value = sum(p.current_value or Decimal(0) for p in properties)
  total_assets = sum(a.current_value or Decimal(0) for a in assets)
  total_liabilities = sum(l.current_balance or Decimal(0) for l in liabilities)
  net_worth = total_property_value + total_assets - total_liabilities
  ```

- [ ] **Step 5:** Verify Data Isolation
  - Every `select()` statement must have `.where(Model.user_id == current_user.id)`
  - No cross-user data leakage

- [ ] **Step 6:** Remove all `DEV_USER_ID` references

- [ ] **Step 7:** Test dashboard endpoint
  - Verify aggregated totals match individual pages
  - Test with authenticated user token

---

### 📋 File 7: `backend/routes/onboarding.py`

**⚠️ SPECIAL CASE** - Creates/updates User record + initial Portfolio

**Purpose:** Handles onboarding wizard flow, may create initial portfolio

**Refactor Checklist:**

- [ ] **Step 1:** Replace imports
  ```python
  """
  Onboarding Routes - SQL-Based with Authentication & Data Isolation
  ⚠️ CRITICAL: All queries include .where(User.id == current_user.id) for data isolation
  """

  from fastapi import APIRouter, Depends, HTTPException, status
  from sqlmodel import Session, select
  from typing import Dict
  from datetime import datetime
  import logging

  from models.user import User, UserUpdate
  from models.portfolio import Portfolio, PortfolioCreate
  from utils.database_sql import get_session
  from utils.auth import get_current_user

  logger = logging.getLogger(__name__)
  router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])
  ```

- [ ] **Step 2:** Add dependency injection to ALL endpoints

- [ ] **Step 3:** Refactor User Update Endpoint
  ```python
  # Get user (should always exist since they're authenticated)
  statement = select(User).where(User.id == current_user.id)
  user = session.exec(statement).first()

  if not user:
      raise HTTPException(status_code=404, detail="User not found")

  # Update user fields
  update_data = data.model_dump(exclude_unset=True)
  for key, value in update_data.items():
      setattr(user, key, value)

  user.onboarding_completed = True  # Mark as completed

  session.add(user)
  session.commit()
  session.refresh(user)
  return user
  ```

- [ ] **Step 4:** Refactor Portfolio Creation
  - May create initial portfolio during onboarding
  - Set `user_id=current_user.id`

  ```python
  portfolio = Portfolio(
      user_id=current_user.id,
      name="Primary Portfolio",
      type="individual",
      # ... other fields ...
  )
  session.add(portfolio)
  session.commit()
  session.refresh(portfolio)
  ```

- [ ] **Step 5:** Verify Data Isolation
  - User queries: `.where(User.id == current_user.id)`
  - Portfolio queries: `.where(Portfolio.user_id == current_user.id)`

- [ ] **Step 6:** Remove all `DEV_USER_ID` references

- [ ] **Step 7:** Test onboarding flow
  - Test user profile update
  - Test initial portfolio creation
  - Verify `onboarding_completed` flag is set

---

## 4. Verification Protocol

After refactoring **each file**, perform these verification steps:

### ✅ Code Audit Checklist

- [ ] **Import Audit:** No `from utils.database import db` imports remain
- [ ] **Constants Audit:** No `DEV_USER_ID` references remain
- [ ] **Dependency Audit:** All endpoints have:
  - `current_user: User = Depends(get_current_user)`
  - `session: Session = Depends(get_session)`
- [ ] **Query Audit:** Every `select()` statement has `.where(Model.user_id == current_user.id)`
- [ ] **Write Operation Audit:** All create/update operations use:
  - `session.add(item)`
  - `session.commit()`
  - `session.refresh(item)`
  - `return item`
- [ ] **Error Handling Audit:** 404 errors use consistent message:
  ```python
  raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="[Resource] not found or you don't have access"
  )
  ```
- [ ] **Router Prefix Audit:** Router uses `/api/[route-name]` (not just `/[route-name]`)

### ✅ Runtime Testing

1. **Start Server:**
   ```bash
   cd backend
   uvicorn server:app --reload
   ```

2. **Check Swagger UI:**
   - Navigate to `http://localhost:8001/docs`
   - Verify new route tags appear
   - Check endpoint definitions

3. **Test Authentication:**
   - Try endpoint **without** Authorization header → Should return 401 Unauthorized
   - Add valid JWT token → Should return 200 OK (if data exists)

4. **Test CRUD Operations:**
   - Create: POST endpoint → Should return 201 with created object
   - Read: GET endpoint → Should return 200 with data
   - Update: PUT endpoint → Should return 200 with updated object
   - Delete: DELETE endpoint → Should return 200 with success message

5. **Test Data Isolation:**
   - As User A: Create resource with ID `xyz`
   - As User B: Try to GET resource `xyz` → Should return 404 (not 200)
   - Verify User B cannot access User A's data

### ✅ Cross-File Integration Test

After ALL files are refactored:

- [ ] Test dashboard aggregation with multiple portfolio-scoped resources
- [ ] Test portfolio deletion (cascade delete should work)
- [ ] Test onboarding → creates portfolio → add income/expenses → see in dashboard
- [ ] Verify no cross-user data leakage in any endpoint

---

## 5. Risk Assessment

### 🔴 High Risk Areas

1. **`plans.py` - Projection Calculations**
   - **Risk:** Complex aggregation logic may miss user_id filters
   - **Mitigation:** Carefully audit every `select()` statement in projection endpoints
   - **Test:** Run projections with different users, verify no data leakage

2. **`dashboard.py` - Multi-Model Aggregations**
   - **Risk:** Aggregates data from 8+ models, easy to miss a user_id filter
   - **Mitigation:** Explicitly add `.where(Model.user_id == current_user.id)` to EVERY query
   - **Test:** Create test data for 2 users, verify dashboard only shows own data

3. **`onboarding.py` - User Model Manipulation**
   - **Risk:** Directly updates User model, potential to modify wrong user
   - **Mitigation:** Always query with `.where(User.id == current_user.id)`
   - **Test:** Verify user can only update their own profile

### 🟡 Medium Risk Areas

4. **Portfolio-Scoped Resources (income, expenses, assets, liabilities)**
   - **Risk:** Must verify both portfolio ownership AND user_id
   - **Mitigation:** Always check portfolio access before querying resource
   - **Pattern:**
     ```python
     # Step 1: Verify portfolio
     portfolio_stmt = select(Portfolio).where(
         Portfolio.id == portfolio_id,
         Portfolio.user_id == current_user.id
     )
     portfolio = session.exec(portfolio_stmt).first()
     if not portfolio:
         raise HTTPException(404)

     # Step 2: Query resource
     resource_stmt = select(Resource).where(
         Resource.portfolio_id == portfolio_id,
         Resource.user_id == current_user.id  # Still required!
     )
     ```

### 🟢 Low Risk Areas

5. **Basic CRUD Endpoints**
   - **Risk:** Minimal if following pattern exactly
   - **Mitigation:** Copy-paste from golden master, adapt model names

---

## 6. Execution Strategy

### Recommended Approach: Sequential Migration

**Day 1: Simple Portfolio-Scoped Resources (4-5 hours)**
1. `income.py` (45 min)
2. `expenses.py` (45 min)
3. `assets.py` (45 min)
4. `liabilities.py` (45 min)
5. Test all 4 endpoints (30 min)

**Day 1 Afternoon: Complex Routes (3-4 hours)**
6. `plans.py` (90 min - includes projection logic)
7. Test plans + projections (30 min)

**Day 2: Aggregation Routes (2-3 hours)**
8. `dashboard.py` (90 min - aggregates all models)
9. `onboarding.py` (45 min - user model updates)
10. Test dashboard + onboarding flow (30 min)

**Day 2 Afternoon: Final Verification (2 hours)**
11. Full integration testing
12. Multi-user data isolation testing
13. Cross-reference all queries for user_id filters
14. Update IMPLEMENTATION_STATUS.md

### Alternative Approach: Parallel Migration (If Multiple Developers)

**Developer 1:**
- income.py
- expenses.py
- Test both

**Developer 2:**
- assets.py
- liabilities.py
- Test both

**Developer 3:**
- plans.py
- Test projections

**Final (Both):**
- dashboard.py (requires all others complete)
- onboarding.py
- Integration testing

---

## 7. Commit Strategy

After refactoring **each file**, create a commit:

```bash
git add backend/routes/[route-name].py
git commit -m "feat: Refactor [route-name] routes to SQLModel with authentication

- Replaced MongoDB queries with SQLModel/PostgreSQL
- Added authentication via get_current_user dependency
- Enforced data isolation with user_id filters on all queries
- Updated write operations to use session.add/commit/refresh
- Verified all queries include data isolation checks

File: backend/routes/[route-name].py
Status: Phase 9B - Security Hardening"
```

### Final Commit (After All 7 Files)

```bash
git add backend/routes/
git commit -m "feat: Complete Phase 9B - Security & Data Isolation

- Refactored 7 route files to SQLModel with authentication
- income.py, expenses.py, assets.py, liabilities.py
- plans.py (with projection endpoints)
- dashboard.py (multi-model aggregation)
- onboarding.py (user profile updates)
- All routes enforce data isolation via user_id filters
- Removed all DEV_USER_ID references
- Backend is production-ready for authenticated users

Status: Phase 9B Complete ✅"
```

---

## 8. Post-Refactor Tasks

After completing Phase 9B:

- [ ] Update [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Mark Phase 9B as ✅ Complete
- [ ] Document any edge cases or deviations from golden master
- [ ] Run full backend test suite (if exists)
- [ ] Test onboarding flow end-to-end
- [ ] Test dashboard with multiple portfolios
- [ ] Test FIRE projections with authenticated user
- [ ] Verify all Swagger UI endpoints require authentication
- [ ] Update API documentation (if separate from Swagger)

---

## 9. Success Criteria

Phase 9B is **COMPLETE** when:

1. ✅ All 7 route files follow the golden master pattern
2. ✅ Zero `DEV_USER_ID` references in backend codebase
3. ✅ Every endpoint requires authentication (401 without token)
4. ✅ Every query includes `.where(Model.user_id == current_user.id)`
5. ✅ Data isolation testing passes (User A cannot access User B's data)
6. ✅ All CRUD operations use `session.add()` → `session.commit()` → `session.refresh()`
7. ✅ Dashboard aggregation works with authenticated user
8. ✅ Projection calculations work with authenticated user
9. ✅ Onboarding flow works with authenticated user
10. ✅ Backend server starts without errors

---

## 10. Troubleshooting Guide

### Common Issues

**Issue 1: 401 Unauthorized on all endpoints**
- **Cause:** JWT token not included in request headers
- **Fix:** Add `Authorization: Bearer <token>` header in Swagger UI or Postman

**Issue 2: `user_id` is None after creating resource**
- **Cause:** Forgot to set `user_id=current_user.id` in constructor
- **Fix:** Add `user_id=current_user.id` to model instantiation

**Issue 3: `AttributeError: 'NoneType' object has no attribute 'id'`**
- **Cause:** `session.refresh(item)` not called after `session.commit()`
- **Fix:** Always call `session.refresh(item)` before returning

**Issue 4: Data from other users appearing in results**
- **Cause:** Missing `.where(Model.user_id == current_user.id)` filter
- **Fix:** Audit all `select()` statements, add user_id filter

**Issue 5: Portfolio verification fails even though portfolio exists**
- **Cause:** Portfolio belongs to different user
- **Fix:** This is correct behavior! Portfolio verification prevents cross-user access.

---

## 11. Reference Links

- **Golden Master 1:** [backend/routes/portfolios.py](backend/routes/portfolios.py)
- **Golden Master 2:** `backend/routes/properties.py`
- **Handoff Guide:** [CLAUDE_HANDOFF_GUIDE.md](CLAUDE_HANDOFF_GUIDE.md)
- **Implementation Status:** [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
- **Auth Utilities:** `backend/utils/auth.py`
- **Database Utilities:** `backend/utils/database_sql.py`

---

## 12. Questions & Clarifications

**Q: Do we need to update frontend code?**
A: No, this phase is **backend-only**. Frontend already uses JWT tokens (assumed). We're only changing backend route implementation.

**Q: What happens to existing MongoDB data?**
A: Data migration is assumed complete (per IMPLEMENTATION_STATUS context). We're refactoring routes, not migrating data.

**Q: Should we delete `utils/database.py` (MongoDB)?**
A: **After Phase 9B is complete and tested**, you can remove MongoDB dependencies. Keep it for now as backup.

**Q: Do we need to update tests?**
A: If unit/integration tests exist, update them to mock `get_current_user` and `get_session` dependencies.

---

**Ready to Execute?** Start with [backend/routes/income.py](backend/routes/income.py) and follow the checklist step-by-step.

---

*Document prepared for Phase 9B execution. Refer to golden masters and handoff guide for exact implementation patterns.*
