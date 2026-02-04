# PropEquityLab Development Instructions for Ralph

You are Ralph, an autonomous AI agent working on PropEquityLab - a property investment portfolio forecasting platform.

## Project Overview

PropEquityLab is a full-stack web application that helps property investors:
- Track property portfolios with detailed financial data
- Forecast property values, rental income, and loan repayments
- Analyze cashflow and equity across 1-30 year timeframes
- Manage multiple properties, loans, income sources, and expenses
- Visualize financial projections and scenarios

**Stack:**
- Backend: FastAPI (Python) + PostgreSQL (Neon.tech)
- Frontend: React + TailwindCSS
- Deployment: AWS App Runner (backend), AWS S3/CloudFront (frontend)

## Current Status

**Phase 0-4: 95% COMPLETE** (See `docs/PHASE_0_COMPLETE_STATUS.md`)

✅ **Completed:**
- All 13 database models (portfolios, properties, loans, income, expenses, etc.)
- Complete calculation engine (17 functions for projections, cashflow, equity)
- All 12 API endpoints (projections, loans, valuations)
- Frontend integration (12 API service functions)
- Backend server running on port 8000
- Test users created (Free, Premium, Pro tiers)
- Free user sample data populated

⏳ **Remaining Tasks:**
1. Add sample data for Premium and Pro users
2. Verify Phase 5 implementation (frontend visualization/charts)
3. Create subscription tier system (Free/Premium/Pro limits)

## Your Primary Objectives

**IMPORTANT: Follow the prioritized task list in `@fix_plan.md`**

All tasks are documented in `@fix_plan.md` with the following priority levels:
- **P0 (CRITICAL)** - Foundation tasks that block all other work
- **P1 (HIGH)** - Core features needed for MVP
- **P2 (MEDIUM)** - Important features for production
- **P3 (LOW)** - Enhancements and polish

**Testing Strategy:**
- After each implementation task, there's a corresponding ✅ TEST task
- Always verify your changes work before moving to the next task
- Document test results in the designated files
- Use Swagger UI for quick API endpoint testing

### Task 1: Complete Sample Data Population
**Priority: HIGH (P1)**

Create comprehensive sample data for Premium and Pro tier users to demonstrate platform capabilities.

**Premium User Sample Data:**
- Email: premium@test.propequitylab.com
- 2 Portfolios: "Personal" and "Investment"
- 3 Properties across portfolios with realistic Sydney prices
- Multiple income sources (salary, rental income, dividends)
- Assets: Shares $50,000, Super $120,000
- Liabilities: Car loan $15,000
- Complete financial picture with loans attached to properties

**Pro User Sample Data:**
- Email: pro@test.propequitylab.com
- 3 Portfolios: "Personal", "Investment", "SMSF"
- 5+ Properties with diverse types (house, apartment, townhouse)
- Multiple loans with different structures (IO, P&I)
- Complete income/expense tracking
- Assets and liabilities across all portfolios
- Demonstrate advanced forecasting features

**Implementation Approach:**
- Use the pattern from `backend/seed_free_user_data.py`
- Create `backend/seed_premium_user_data.py` and `backend/seed_pro_user_data.py`
- Generate realistic UUIDs for all entities
- Ensure portfolio_id is set for income/expenses
- Include property valuations and growth rate periods where appropriate

### Task 2: Fix UUID Generation for All Models
**Priority: HIGH**

Multiple models are missing UUID generation, causing API endpoint failures.

**Files to Fix:**
- `backend/models/property.py` - Add UUID default_factory
- `backend/models/income.py` - Add UUID default_factory
- `backend/models/expense.py` - Add UUID default_factory
- `backend/models/asset.py` - Add UUID default_factory
- `backend/models/liability.py` - Add UUID default_factory
- `backend/models/plan.py` - Add UUID default_factory

**Also update corresponding route files:**
- `backend/routes/properties.py` - Add `id=str(uuid.uuid4())` in create functions
- `backend/routes/income.py` - Add `id=str(uuid.uuid4())` in create functions
- `backend/routes/expenses.py` - Add `id=str(uuid.uuid4())` in create functions
- `backend/routes/assets.py` - Add `id=str(uuid.uuid4())` in create functions
- `backend/routes/liabilities.py` - Add `id=str(uuid.uuid4())` in create functions

**Pattern to Follow:**
```python
# In model file (e.g., property.py)
import uuid
id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=50)

# In route file (e.g., properties.py)
import uuid
entity = Entity(
    id=str(uuid.uuid4()),
    # ... other fields
)
```

### Task 3: Verify Phase 5 Implementation
**Priority: MEDIUM**

Check if Phase 5 (Frontend Visualization) is implemented:
- Search for chart components in `frontend/src/`
- Look for projection visualization pages/components
- Check if dashboard shows charts/graphs
- Verify if data visualization libraries are installed (Chart.js, Recharts, etc.)
- Document what exists vs. what's missing in `docs/PHASE_5_STATUS.md`

### Task 4: Implement Subscription Tier System
**Priority: MEDIUM**

Add 3-tier subscription system with usage limits:

**Database Changes:**
- Add `subscription_tier` enum field to User model: 'free', 'premium', 'pro'
- Add `subscription_expires_at` timestamp field
- Create migration for these changes

**Tier Limits:**
```python
TIER_LIMITS = {
    'free': {
        'max_portfolios': 1,
        'max_properties': 3,
        'max_projection_years': 1,
        'export_formats': ['csv']
    },
    'premium': {
        'max_portfolios': 5,
        'max_properties': 15,
        'max_projection_years': 10,
        'export_formats': ['csv', 'pdf']
    },
    'pro': {
        'max_portfolios': -1,  # unlimited
        'max_properties': -1,
        'max_projection_years': 30,
        'export_formats': ['csv', 'pdf', 'json']
    }
}
```

**Implementation:**
- Create `backend/utils/subscription.py` with tier checking functions
- Add middleware to enforce limits on relevant endpoints
- Create `/api/subscription` endpoints for tier management
- Update frontend to show tier status and upgrade prompts

## Working Directory Structure

```
backend/
├── server.py                 # FastAPI app entry point
├── models/                   # SQLModel database models
│   ├── user.py
│   ├── portfolio.py         # ✅ Fixed (has UUID)
│   ├── property.py          # ⚠️ Needs UUID fix
│   ├── income.py            # ⚠️ Needs UUID fix
│   ├── expense.py           # ⚠️ Needs UUID fix
│   ├── asset.py             # ⚠️ Needs UUID fix
│   ├── liability.py         # ⚠️ Needs UUID fix
│   ├── financials.py        # Loans, projections
│   └── ...
├── routes/                   # API endpoints
│   ├── portfolios.py        # ✅ Fixed (generates UUID)
│   ├── properties.py        # ⚠️ Needs UUID fix
│   ├── income.py            # ⚠️ Needs UUID fix
│   ├── expenses.py          # ⚠️ Needs UUID fix
│   └── ...
├── utils/
│   ├── calculations.py      # ✅ Complete (17 functions)
│   ├── database_sql.py      # Database connection
│   └── auth.py             # ✅ Fixed (email verification bypass)
├── scripts/
│   └── seed_demo_data.py   # 🔄 In progress
└── .env                     # ✅ Configured

frontend/
├── src/
│   ├── services/api.js      # ✅ Complete (12 functions)
│   └── ...

docs/
├── PHASE_0_COMPLETE_STATUS.md  # Status report
├── CLAUDE_BACKEND_SETUP_PROMPT.md  # Original requirements
└── ...
```

## Important Constraints

1. **Never commit to git** unless explicitly requested
2. **Always use DECIMAL(19, 4)** for currency fields
3. **Backend endpoints** have double `/api` prefix issue (use `/api/api/...` for now)
4. **Email verification** is disabled in .env (`ENABLE_EMAIL_VERIFICATION=false`)
5. **Rate limiting** is set to 1000 calls/min for development
6. **Database** is PostgreSQL on Neon.tech (connection in .env)
7. **Test user passwords** are all `TestPass123!`

## Complete Task List

All implementation tasks from `docs/implementation_plan_full.md` have been added to `@fix_plan.md`. This includes:

**Foundation (P0):**
- Fix UUID generation for all models
- Test UUID generation

**Core Features (P1):**
- Create sample data for Premium and Pro users
- Test sample data creation
- Verify all CRUD endpoints work
- Document CRUD test results

**Dashboard & Projections (P2):**
- Implement dashboard summary endpoint
- Test dashboard calculations
- Verify Phase 5 visualization
- Test frontend charts
- Test projection calculations

**Subscription System (P2):**
- Database changes for tiers
- Subscription utility module
- Tier checks on endpoints
- Subscription API endpoints
- Comprehensive tier testing
- Documentation

**Missing Features (P2):**
- Onboarding endpoints
- Progress/analytics endpoints
- Settings endpoints
- Test all new features

**Enhancements (P3):**
- Fix double API prefix
- Data export features
- Loan/valuation history
- API tests (pytest)
- Plan templates

**Documentation:**
- Update API documentation
- Create user guide
- Update developer docs

**Total:** 100+ individual tasks organized by priority and with testing checkpoints

## Success Criteria

You'll know you're done when:
- ✅ All tasks in `@fix_plan.md` are marked complete
- ✅ All 3 test users have complete, realistic sample data
- ✅ All models generate UUIDs properly
- ✅ All CRUD endpoints work without 500 errors
- ✅ Phase 5 visualization status is documented
- ✅ Subscription tier system is implemented with limits enforced
- ✅ All testing tasks completed with documented results
- ✅ Dashboard calculations work correctly
- ✅ Projections calculate accurately
- ✅ Backend server runs without errors
- ✅ No 404 or 500 errors in API responses

## References

- Backend Health Check: http://localhost:8000/api/health
- API Docs (Swagger): http://localhost:8000/docs
- Database Schema: See models/ directory
- Calculation Engine: `backend/utils/calculations.py`
- Phase Status: `docs/PHASE_0_COMPLETE_STATUS.md`

## Your Approach

1. Start by fixing UUID generation issues (blocking other work)
2. Create seed scripts for Premium and Pro users
3. Run the seed scripts and verify data creation
4. Check Phase 5 implementation status
5. Implement subscription tier system
6. Test all endpoints work correctly
7. Document completion

Remember: Work autonomously and incrementally. Test after each change. Update `@fix_plan.md` to track your progress.
