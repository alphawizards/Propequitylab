# Claude Handoff Guide: Refactor Remaining Routes to SQLModel + Auth

**Context:** The PropEquityLab backend is migrating from MongoDB to PostgreSQL (Neon) with SQLModel. Two routes have been completed as "golden masters": `portfolios.py` and `properties.py`. You need to refactor the remaining 7 route files using the exact same pattern.

---

## Files to Refactor

1. `backend/routes/income.py`
2. `backend/routes/expenses.py`
3. `backend/routes/assets.py`
4. `backend/routes/liabilities.py`
5. `backend/routes/plans.py`
6. `backend/routes/dashboard.py`
7. `backend/routes/onboarding.py`

---

## Step 1: Exact Imports Block (Copy-Paste Ready)

Replace the old imports with this exact block:

```python
"""
[Route Name] Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Model.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import logging

# Import your specific models (adjust based on the route)
from models.[model_name] import [Model], [ModelCreate], [ModelUpdate]
from models.portfolio import Portfolio
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/[route-name]", tags=["[route-name]"])
```

**Example for `income.py`:**
```python
from models.income import Income, IncomeCreate, IncomeUpdate
```

---

## Step 2: Dependency Injection Pattern

Every endpoint function signature MUST include these two dependencies:

```python
async def endpoint_name(
    # ... other parameters ...
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
```

**Example:**
```python
@router.get("", response_model=List[Income])
async def get_incomes(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
```

---

## Step 3: Query Transformation Rules

### OLD (MongoDB):
```python
# Get all
items = await db.collection.find(
    {"user_id": DEV_USER_ID},
    {"_id": 0}
).to_list(100)

# Get one
item = await db.collection.find_one(
    {"id": item_id, "user_id": DEV_USER_ID},
    {"_id": 0}
)

# Create
doc = item.model_dump()
await db.collection.insert_one(doc)

# Update
await db.collection.update_one(
    {"id": item_id, "user_id": DEV_USER_ID},
    {"$set": update_data}
)

# Delete
await db.collection.delete_one(
    {"id": item_id, "user_id": DEV_USER_ID}
)
```

### NEW (SQLModel):
```python
# Get all
statement = select(Model).where(Model.user_id == current_user.id)
items = session.exec(statement).all()

# Get one
statement = select(Model).where(
    Model.id == item_id,
    Model.user_id == current_user.id  # CRITICAL: Data isolation
)
item = session.exec(statement).first()

# Create
item = Model(
    user_id=current_user.id,  # CRITICAL: Set from authenticated user
    # ... other fields ...
)
session.add(item)
session.commit()
session.refresh(item)

# Update
statement = select(Model).where(
    Model.id == item_id,
    Model.user_id == current_user.id
)
item = session.exec(statement).first()

if not item:
    raise HTTPException(status_code=404, detail="Not found")

update_data = data.model_dump(exclude_unset=True)
for key, value in update_data.items():
    setattr(item, key, value)

session.add(item)
session.commit()
session.refresh(item)

# Delete
statement = select(Model).where(
    Model.id == item_id,
    Model.user_id == current_user.id
)
item = session.exec(statement).first()

if not item:
    raise HTTPException(status_code=404, detail="Not found")

session.delete(item)
session.commit()
```

---

## Step 4: Data Isolation Rule (CRITICAL)

**EVERY SINGLE QUERY** must include a `.where(Model.user_id == current_user.id)` filter.

**Why:** Without this, User A could access User B's data by guessing IDs.

**Pattern:**
```python
statement = select(Model).where(
    Model.id == item_id,
    Model.user_id == current_user.id  # ← THIS LINE IS MANDATORY
)
```

**For portfolio-scoped resources (Income, Expense, Asset, Liability, Property):**

You may also need to verify the portfolio belongs to the user:

```python
# First verify portfolio access
portfolio_stmt = select(Portfolio).where(
    Portfolio.id == portfolio_id,
    Portfolio.user_id == current_user.id
)
portfolio = session.exec(portfolio_stmt).first()

if not portfolio:
    raise HTTPException(status_code=404, detail="Portfolio not found")

# Then query the resource
statement = select(Income).where(
    Income.portfolio_id == portfolio_id,
    Income.user_id == current_user.id  # Still required!
)
```

---

## Step 5: Write Operation Flow (CRITICAL)

**Correct order:**
```python
session.add(item)       # 1. Add to session
session.commit()        # 2. Commit to database
session.refresh(item)   # 3. Refresh to get DB-generated fields (id, timestamps)
return item             # 4. Return the refreshed object
```

**Common mistake:**
```python
session.add(item)
return item  # ❌ WRONG: item.id will be None
```

---

## Step 6: Error Handling Pattern

Use this exact pattern for 404 errors:

```python
if not item:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="[Resource] not found or you don't have access"
    )
```

---

## Step 7: Specific Route Guidance

### `income.py`
- Model: `Income`
- Scoped to: `portfolio_id`
- Fields: `amount` (DECIMAL), `frequency`, `source`, `category`
- Verify portfolio access before queries

### `expenses.py`
- Model: `Expense`
- Scoped to: `portfolio_id`
- Fields: `amount` (DECIMAL), `frequency`, `category`, `description`
- Verify portfolio access before queries

### `assets.py`
- Model: `Asset`
- Scoped to: `portfolio_id`
- Fields: `current_value` (DECIMAL), `asset_type`, `institution`
- Verify portfolio access before queries

### `liabilities.py`
- Model: `Liability`
- Scoped to: `portfolio_id`
- Fields: `current_balance` (DECIMAL), `original_amount` (DECIMAL), `interest_rate`
- Verify portfolio access before queries

### `plans.py`
- Model: `Plan`
- Scoped to: `portfolio_id`
- Fields: `target_equity` (DECIMAL), `target_passive_income` (DECIMAL), `plan_type`
- Verify portfolio access before queries

### `dashboard.py`
- **Special:** This route aggregates data across multiple models
- Use `select()` with `.where(Model.user_id == current_user.id)` for each model
- Calculate totals using Python `sum()` on DECIMAL fields
- Return aggregated data (no direct model)

### `onboarding.py`
- **Special:** May create/update User record
- Queries: `select(User).where(User.id == current_user.id)`
- May create initial Portfolio for user
- Set `user.onboarding_completed = True` at end

---

## Step 8: Testing Checklist

After refactoring each file, verify:

1. ✅ No `from utils.database import db` imports remain
2. ✅ No `DEV_USER_ID` references remain
3. ✅ Every query has `.where(Model.user_id == current_user.id)`
4. ✅ All endpoints have `current_user: User = Depends(get_current_user)`
5. ✅ All endpoints have `session: Session = Depends(get_session)`
6. ✅ Write operations use `session.add()` → `session.commit()` → `session.refresh()`
7. ✅ Router prefix is `/api/[route-name]` (not just `/[route-name]`)

---

## Step 9: Example Transformation

### BEFORE (`income.py` - MongoDB):
```python
from fastapi import APIRouter, HTTPException
from typing import List

from models.income import Income, IncomeCreate, IncomeUpdate
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/income", tags=["income"])

@router.get("/portfolio/{portfolio_id}", response_model=List[Income])
async def get_portfolio_income(portfolio_id: str):
    incomes = await db.income_sources.find(
        {"portfolio_id": portfolio_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    ).to_list(100)
    return incomes
```

### AFTER (`income.py` - SQLModel):
```python
"""
Income Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Income.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
import logging

from models.income import Income, IncomeCreate, IncomeUpdate
from models.portfolio import Portfolio
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/income", tags=["income"])

@router.get("/portfolio/{portfolio_id}", response_model=List[Income])
async def get_portfolio_income(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all income sources for a portfolio"""
    # Verify portfolio access
    portfolio_stmt = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    )
    portfolio = session.exec(portfolio_stmt).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Get income with data isolation
    statement = select(Income).where(
        Income.portfolio_id == portfolio_id,
        Income.user_id == current_user.id  # CRITICAL: Data isolation
    )
    incomes = session.exec(statement).all()
    
    return incomes
```

---

## Step 10: Commit Message Template

After refactoring each file:

```
feat: Refactor [route-name] routes to SQLModel with authentication

- Replaced MongoDB queries with SQLModel/PostgreSQL
- Added authentication via get_current_user dependency
- Enforced data isolation with user_id filters
- Updated write operations to use session.add/commit/refresh
- Verified all queries include data isolation checks

File: backend/routes/[route-name].py
Status: Phase 9B - Security Hardening
```

---

## Golden Master Reference Files

Use these as reference:
1. `backend/routes/portfolios.py` - Complete CRUD with cascade delete
2. `backend/routes/properties.py` - Portfolio-scoped resource with verification

Both files demonstrate:
- Correct imports
- Data isolation
- Write operation flow
- Error handling
- Logging

---

## CRITICAL Reminders

1. **NEVER skip the `.where(Model.user_id == current_user.id)` filter**
2. **ALWAYS use `session.refresh(item)` after `session.commit()` for creates/updates**
3. **ALWAYS verify portfolio access for portfolio-scoped resources**
4. **NEVER use raw SQL queries** - use SQLModel ORM only
5. **ALWAYS use `current_user.id` not `DEV_USER_ID`**

---

## Success Criteria

When all 7 files are refactored:
- ✅ No MongoDB imports remain
- ✅ No DEV_USER_ID references remain
- ✅ All endpoints require authentication
- ✅ All queries enforce data isolation
- ✅ Backend is production-ready for deployment

---

**Ready to start?** Begin with `income.py` and work through the list. Each file should take 10-15 minutes following this guide.
