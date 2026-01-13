# PropEquityLab Task Priority List

This file tracks Ralph's autonomous development tasks. Tasks are prioritized from highest to lowest.

## Status Key
- 🔴 **BLOCKED** - Cannot proceed due to dependency
- 🟡 **IN PROGRESS** - Currently being worked on
- 🟢 **DONE** - Completed
- ⚪ **TODO** - Not started
- ✅ **TEST** - Verification/testing task

---

## 🔥 CRITICAL PRIORITY (P0) - Foundation

### 🟢 Fix UUID Generation for All Models
**Status:** DONE
**Blocking:** All CRUD operations, sample data creation

**Files to Update:**
- [x] `backend/models/property.py` - Add UUID default_factory + import uuid
- [x] `backend/models/income.py` - Add UUID default_factory + import uuid
- [x] `backend/models/expense.py` - Add UUID default_factory + import uuid
- [x] `backend/models/asset.py` - Add UUID default_factory + import uuid
- [x] `backend/models/liability.py` - Add UUID default_factory + import uuid
- [x] `backend/models/plan.py` - Add UUID default_factory + import uuid
- [x] `backend/routes/properties.py` - Add `id=str(uuid.uuid4())` in create function + import uuid
- [x] `backend/routes/income.py` - Already had UUID generation
- [x] `backend/routes/expenses.py` - Already had UUID generation
- [x] `backend/routes/assets.py` - Already had UUID generation
- [x] `backend/routes/liabilities.py` - Already had UUID generation
- [x] `backend/routes/plans.py` - Skipped (no route file exists)

**Pattern:**
```python
# In model:
import uuid
id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=50)

# In route:
import uuid
entity = Entity(id=str(uuid.uuid4()), ...)
```

### ✅ Test UUID Generation Fix
**Status:** DONE (Manual verification - models have default_factory, routes verified to have UUID)
**Depends On:** UUID fix completion

- [x] Property model - UUID default_factory added
- [x] Income model - UUID default_factory added
- [x] Expense model - UUID default_factory added
- [x] Asset model - UUID default_factory added
- [x] Liability model - UUID default_factory added
- [x] Plan model - UUID default_factory added
- [x] All route files verified to have UUID generation in create functions
- [x] Backend server started successfully

---

## 🚀 HIGH PRIORITY (P1) - Sample Data & Core Features

### 🟢 Create Premium User Sample Data
**Status:** DONE
**Depends On:** UUID fix completion

Created `backend/seed_premium_user_data.py` with:
- [x] Premium user (premium@test.propequitylab.com)
- [x] Portfolio 1: "Personal" - PPOR in Parramatta ($1,050,000)
- [x] Portfolio 2: "Investment" - 2 investment properties
- [x] Property 1: Parramatta house $1,050,000 (Personal, P&I loan)
- [x] Property 2: Liverpool apartment $560,000 (Investment, IO loan)
- [x] Property 3: Campbelltown townhouse $590,000 (Investment, IO loan)
- [x] Income: Salary $95,000/year
- [x] Income: Rental Liverpool $27,040/year
- [x] Income: Rental Campbelltown $30,160/year
- [x] Income: Dividends $2,500/year
- [x] Expense: Living $4,500/month, Transport $800/month
- [x] Asset: ASX 200 ETF $50,000
- [x] Asset: Superannuation $120,000
- [x] Liability: Car loan $15,000
- [x] Total value: $2,200,000 in properties

### ✅ Test Premium User Data
**Status:** DONE
**Depends On:** Premium seed script completion

- [x] Run `python seed_premium_user_data.py` - SUCCESS
- [x] Created 2 portfolios
- [x] Created 3 properties ($2.2M total)
- [x] Created 4 income sources ($154,700/year)
- [x] Created 2 expenses ($63,600/year)
- [x] Created 2 assets ($170,000)
- [x] Created 1 liability ($15,000)
- [x] No database errors

### 🟢 Create Pro User Sample Data
**Status:** DONE
**Depends On:** UUID fix completion

Created `backend/seed_pro_user_data.py` with:
- [x] Pro user (pro@test.propequitylab.com)
- [x] Portfolio 1: "Personal" - Primary residence
- [x] Portfolio 2: "Investment" - 3 investment properties
- [x] Portfolio 3: "SMSF" - Commercial property
- [x] 5 Properties totaling $6,170,000:
  - Manly house $3.2M (PPOR)
  - Brisbane apartment $780k (Investment)
  - Gold Coast townhouse $690k (Investment)
  - Newcastle house $880k (Investment)
  - Melbourne commercial $620k (SMSF)
- [x] 7 income sources ($447,500/year total)
- [x] 4 expense categories ($150,000/year)
- [x] 6 assets ($1,300,000 total)
- [x] 2 liabilities ($55,500 total)
- [x] Net worth (excl PPOR): $4,614,500

### ✅ Test Pro User Data
**Status:** DONE
**Depends On:** Pro seed script completion

- [x] Run `python seed_pro_user_data.py` - SUCCESS
- [x] Created 3 portfolios (Personal, Investment, SMSF)
- [x] Created 5 properties across 4 cities
- [x] Created 7 income sources
- [x] Created 4 expenses
- [x] Created 6 assets (mix of ETFs, super, shares, cash)
- [x] Created 2 liabilities
- [x] Demonstrates unlimited Pro tier capabilities
- [x] No database errors

---

## 📊 HIGH PRIORITY (P1) - Core CRUD Operations

### ⚪ Verify All CRUD Endpoints Work
**Status:** TODO
**Depends On:** UUID fix

Test each entity type's CRUD operations:

**Properties:**
- [ ] Create: `POST /api/api/properties`
- [ ] Read list: `GET /api/api/properties`
- [ ] Read single: `GET /api/api/properties/:id`
- [ ] Update: `PUT /api/api/properties/:id`
- [ ] Delete: `DELETE /api/api/properties/:id`

**Income:**
- [ ] Create: `POST /api/api/income`
- [ ] Read: `GET /api/api/income`
- [ ] Update: `PUT /api/api/income/:id`
- [ ] Delete: `DELETE /api/api/income/:id`

**Expenses:**
- [ ] Create: `POST /api/api/expenses`
- [ ] Read: `GET /api/api/expenses`
- [ ] Update: `PUT /api/api/expenses/:id`
- [ ] Delete: `DELETE /api/api/expenses/:id`

**Assets:**
- [ ] Create: `POST /api/api/assets`
- [ ] Read: `GET /api/api/assets`
- [ ] Update: `PUT /api/api/assets/:id`
- [ ] Delete: `DELETE /api/api/assets/:id`

**Liabilities:**
- [ ] Create: `POST /api/api/liabilities`
- [ ] Read: `GET /api/api/liabilities`
- [ ] Update: `PUT /api/api/liabilities/:id`
- [ ] Delete: `DELETE /api/api/liabilities/:id`

**Plans:**
- [ ] Create: `POST /api/api/plans`
- [ ] Read: `GET /api/api/plans`
- [ ] Update: `PUT /api/api/plans/:id`
- [ ] Delete: `DELETE /api/api/plans/:id`

### ✅ Document CRUD Test Results
**Status:** TODO

- [ ] Create `docs/CRUD_TESTING_RESULTS.md`
- [ ] Document each endpoint tested
- [ ] Include sample requests/responses
- [ ] Note any failures or issues
- [ ] List endpoints still needing implementation

---

## 📈 MEDIUM PRIORITY (P2) - Dashboard & Projections

### ⚪ Implement Dashboard Summary Endpoint
**Status:** TODO

- [ ] Create `GET /api/dashboard/summary` endpoint
- [ ] Calculate net worth (total assets - total liabilities)
- [ ] Calculate total property value
- [ ] Calculate total loan amount
- [ ] Calculate total equity
- [ ] Calculate monthly cash flow
- [ ] Return portfolio-filtered results
- [ ] Handle edge cases (no data, negative values)

### ✅ Test Dashboard Summary
**Status:** TODO

- [ ] Call endpoint with Free user token
- [ ] Verify net worth calculation accurate
- [ ] Test with Premium user (multiple portfolios)
- [ ] Test with Pro user (complex data)
- [ ] Verify calculations match manual calculation
- [ ] Test portfolio filtering works
- [ ] Document formula used for calculations

### ⚪ Verify Phase 5 Frontend Visualization
**Status:** TODO

- [ ] Search for chart components in `frontend/src/`
- [ ] Check `package.json` for visualization libraries (Chart.js, Recharts, D3)
- [ ] Look for projection visualization pages/components
- [ ] Test if charts render with sample data
- [ ] Check dashboard for net worth chart
- [ ] Check projections page for multi-year charts
- [ ] Document findings in `docs/PHASE_5_STATUS.md`

### ✅ Test Frontend Visualization
**Status:** TODO
**Depends On:** Phase 5 verification

- [ ] Start frontend: `cd frontend && npm start`
- [ ] Login as Free user
- [ ] Navigate to Dashboard - check for charts
- [ ] Navigate to Projections - check for projection charts
- [ ] Navigate to Progress - check for net worth history
- [ ] Test chart interactions (zoom, filter, tooltips)
- [ ] Document what works vs. what's missing
- [ ] Take screenshots for documentation

### ⚪ Implement Projection Endpoints (Already Exist)
**Status:** TODO - Verify functionality

These endpoints exist but need testing:
- [ ] Test `GET /api/api/projections/portfolio/:id?years=10`
- [ ] Test `GET /api/api/projections/property/:id`
- [ ] Test `GET /api/api/projections/property/:id/summary`
- [ ] Test scenario parameters (interest_rate_offset, expense_growth_override)
- [ ] Verify calculation accuracy
- [ ] Test with different year ranges (1, 10, 30 years)

### ✅ Test Projection Calculations
**Status:** TODO

- [ ] Create property with known values
- [ ] Add loan with specific rate and term
- [ ] Set rental income with growth rate
- [ ] Request 10-year projection
- [ ] Manually verify year 1 calculations
- [ ] Verify property value growth applied correctly
- [ ] Verify loan amortization accurate
- [ ] Verify rental income growth calculated
- [ ] Document calculation formulas used
- [ ] Compare with Excel/manual calculations

---

## 🔒 MEDIUM PRIORITY (P2) - Subscription Tier System

### ⚪ Implement Subscription Tier Database Changes
**Status:** TODO

- [ ] Add `subscription_tier` enum field to User model ('free', 'premium', 'pro')
- [ ] Add `subscription_expires_at` timestamp field
- [ ] Add `subscription_started_at` timestamp field
- [ ] Create Alembic migration script
- [ ] Test migration on dev database
- [ ] Update test users with appropriate tiers
- [ ] Document tier enum values

### ⚪ Create Subscription Utility Module
**Status:** TODO

Create `backend/utils/subscription.py`:
- [ ] Define `TIER_LIMITS` constants dictionary
- [ ] Implement `check_portfolio_limit(user, current_count)` function
- [ ] Implement `check_property_limit(user, current_count)` function
- [ ] Implement `check_projection_years_limit(user, years)` function
- [ ] Implement `check_export_format_allowed(user, format)` function
- [ ] Implement `get_tier_limits(tier)` helper function
- [ ] Add clear error messages for each limit type

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

### ⚪ Add Tier Checks to Endpoints
**Status:** TODO

- [ ] Add tier check to `POST /api/api/portfolios` (check portfolio limit)
- [ ] Add tier check to `POST /api/api/properties` (check property limit)
- [ ] Add tier check to `GET /api/api/projections/*` (check years limit)
- [ ] Add tier check to export endpoints (check format allowed)
- [ ] Return HTTP 403 with clear error message when limit exceeded
- [ ] Include upgrade suggestion in error response

### ⚪ Create Subscription API Endpoints
**Status:** TODO

Create `backend/routes/subscription.py`:
- [ ] `GET /api/subscription/status` - Current tier and usage
- [ ] `GET /api/subscription/limits` - Get limits for user's tier
- [ ] `GET /api/subscription/usage` - Current usage vs limits
- [ ] `POST /api/subscription/upgrade` - Request tier upgrade (stub)
- [ ] Include remaining quota in responses

### ✅ Test Subscription Tier System
**Status:** TODO

**Test Free Tier Limits:**
- [ ] Login as Free user
- [ ] Try to create 2nd portfolio (should fail)
- [ ] Try to create 4th property (should fail)
- [ ] Request 5-year projection (should fail or truncate)
- [ ] Verify error messages are clear
- [ ] Test CSV export works
- [ ] Test PDF export fails

**Test Premium Tier Limits:**
- [ ] Login as Premium user
- [ ] Create up to 5 portfolios (should work)
- [ ] Try to create 6th portfolio (should fail)
- [ ] Create up to 15 properties (should work)
- [ ] Request 10-year projection (should work)
- [ ] Request 20-year projection (should fail)
- [ ] Test CSV and PDF export work

**Test Pro Tier (Unlimited):**
- [ ] Login as Pro user
- [ ] Create 10+ portfolios (should work)
- [ ] Create 30+ properties (should work)
- [ ] Request 30-year projection (should work)
- [ ] Test all export formats work
- [ ] Verify no limits enforced

### ✅ Document Subscription System
**Status:** TODO

- [ ] Create `docs/SUBSCRIPTION_TIERS.md`
- [ ] Document tier limits and features
- [ ] Document API endpoints
- [ ] Include example requests/responses
- [ ] Document error codes and messages
- [ ] Add upgrade flow documentation

---

## 🎨 MEDIUM PRIORITY (P2) - Missing Pages & Features

### ⚪ Implement Onboarding Endpoints
**Status:** TODO

Create `backend/routes/onboarding.py` (if not exists):
- [ ] `GET /api/onboarding/status` - Get completion status
- [ ] `POST /api/onboarding/complete` - Mark onboarding complete
- [ ] `POST /api/onboarding/skip` - Skip onboarding
- [ ] `PUT /api/onboarding/step` - Update current step
- [ ] Track onboarding progress in user model

### ✅ Test Onboarding Flow
**Status:** TODO

- [ ] Register new test user
- [ ] Check onboarding status (should be incomplete)
- [ ] Navigate through onboarding steps
- [ ] Add income during onboarding
- [ ] Add property during onboarding
- [ ] Complete onboarding
- [ ] Verify status updated
- [ ] Test skip functionality

### ⚪ Implement Progress/Analytics Endpoints
**Status:** TODO

Create `backend/routes/progress.py`:
- [ ] `GET /api/progress/net-worth?range=1y` - Net worth history
- [ ] `GET /api/progress/allocation` - Asset allocation breakdown
- [ ] `GET /api/progress/goals` - Goal progress tracking
- [ ] `GET /api/progress/milestones` - Achievement timeline
- [ ] Implement net worth snapshot creation
- [ ] Store historical data for charting

### ✅ Test Progress Analytics
**Status:** TODO

- [ ] Create snapshots over time (manual or seed)
- [ ] Request net worth history
- [ ] Verify data points returned correctly
- [ ] Test date range filtering
- [ ] Test asset allocation calculation
- [ ] Verify percentages sum to 100%
- [ ] Test with empty data (new user)

### ⚪ Implement Settings Endpoints
**Status:** TODO

Create/expand settings endpoints:
- [ ] `PUT /api/auth/me` - Update profile (name, email)
- [ ] `PUT /api/auth/password` - Change password
- [ ] `PUT /api/settings/notifications` - Notification preferences
- [ ] `PUT /api/settings/preferences` - Currency, date format, etc.
- [ ] `GET /api/settings/export` - Export all user data
- [ ] Validate email uniqueness on update

### ✅ Test Settings Functionality
**Status:** TODO

- [ ] Update user profile (name change)
- [ ] Verify profile updated in database
- [ ] Test email update (should require verification)
- [ ] Change password
- [ ] Test login with new password
- [ ] Update notification preferences
- [ ] Verify preferences saved
- [ ] Test data export generates file

---

## 🔧 LOW PRIORITY (P3) - Enhancements & Polish

### ⚪ Fix Double API Prefix Issue
**Status:** TODO (Nice to have)

**Current:** Routes are at `/api/api/...`
**Expected:** Routes should be at `/api/...`

**Options:**
1. Remove `/api` prefix from individual route files
2. Update server.py to not add prefix to api_router
3. Update frontend to use correct paths

**Implementation:**
- [ ] Choose approach (recommend Option 1)
- [ ] Update all route files to remove `/api` prefix
- [ ] Test all endpoints still work
- [ ] Update frontend API service if needed
- [ ] Update documentation

### ✅ Test API Prefix Fix
**Status:** TODO

- [ ] Verify all endpoints accessible at `/api/...`
- [ ] Test with Swagger UI
- [ ] Test with frontend
- [ ] Update PROMPT.md and @AGENT.md docs
- [ ] No broken endpoints

### ⚪ Implement Data Export Features
**Status:** TODO

- [ ] Create `backend/utils/export.py`
- [ ] Implement CSV export for projections
- [ ] Implement PDF export with charts (reportlab or weasyprint)
- [ ] Implement JSON export for raw data
- [ ] Add export endpoints to relevant routes
- [ ] Stream large exports to avoid memory issues

### ✅ Test Export Functionality
**Status:** TODO

- [ ] Test CSV export with sample data
- [ ] Open CSV in Excel, verify format
- [ ] Test PDF export generates correctly
- [ ] Verify PDF includes charts/tables
- [ ] Test JSON export structure
- [ ] Test with large datasets (performance)
- [ ] Verify file cleanup after download

### ⚪ Implement Loan/Valuation History
**Status:** TODO

Already have models, need to verify functionality:
- [ ] Test `GET /api/api/loans/property/:id` - List property loans
- [ ] Test `POST /api/api/loans` - Create loan
- [ ] Test `PUT /api/api/loans/:id` - Update loan
- [ ] Test `GET /api/api/valuations/property/:id` - Property valuations
- [ ] Test `POST /api/api/valuations` - Add valuation
- [ ] Verify loan calculations use correct values

### ✅ Test Loan Calculations
**Status:** TODO

- [ ] Create property with purchase price $500k
- [ ] Add IO loan $400k @ 6.5% for 30 years
- [ ] Calculate expected monthly payment
- [ ] Request projection with loan
- [ ] Verify loan repayments calculated correctly
- [ ] Verify principal/interest split
- [ ] Verify remaining balance decreases
- [ ] Test with extra repayments
- [ ] Test with lump sum payments

### ⚪ Add API Tests (pytest)
**Status:** TODO (Nice to have)

- [ ] Create `backend/tests/` directory structure
- [ ] Install pytest and dependencies
- [ ] Create `conftest.py` with fixtures
- [ ] Write authentication tests
- [ ] Write CRUD tests for each entity
- [ ] Write projection calculation tests
- [ ] Write subscription tier tests
- [ ] Add to CI/CD if applicable
- [ ] Aim for >80% coverage

### ⚪ Implement Plan Templates
**Status:** TODO (Future enhancement)

- [ ] Define common plan templates (retirement, debt payoff, etc.)
- [ ] Create `GET /api/api/plans/templates` endpoint
- [ ] Return template definitions
- [ ] Add "Use Template" functionality
- [ ] Test template application

---

## 📚 DOCUMENTATION TASKS

### ⚪ Update API Documentation
**Status:** TODO

- [ ] Ensure all endpoints have OpenAPI/Swagger docs
- [ ] Add request/response examples to Swagger
- [ ] Document authentication requirements
- [ ] Document error codes and responses
- [ ] Add endpoint descriptions
- [ ] Test Swagger UI completeness

### ⚪ Create User Documentation
**Status:** TODO

- [ ] Create `docs/USER_GUIDE.md`
- [ ] Document each feature
- [ ] Add screenshots/examples
- [ ] Include FAQ section
- [ ] Document subscription tiers
- [ ] Add troubleshooting guide

### ⚪ Create Developer Documentation
**Status:** TODO

- [ ] Update `docs/PHASE_0_COMPLETE_STATUS.md` with final status
- [ ] Document all implemented features
- [ ] Create deployment guide
- [ ] Document environment setup
- [ ] Add contribution guidelines
- [ ] Document testing procedures

---

## 📝 NOTES

**Completed in Previous Session:**
- ✅ Backend server running
- ✅ Test users created and verified
- ✅ Free user sample data populated
- ✅ Portfolio model UUID fix
- ✅ Email verification bypass for development

**Known Issues:**
- Double `/api` prefix (use `/api/api/...` for now)
- Rate limiting may trigger with rapid testing (15 min reset)

**Resources:**
- Sample data pattern: `backend/seed_free_user_data.py`
- Database models: `backend/models/`
- API routes: `backend/routes/`
- Implementation plan: `docs/implementation_plan_full.md`
- Status docs: `docs/PHASE_0_COMPLETE_STATUS.md`

**Testing Strategy:**
- Test after each major change
- Use Swagger UI for quick API testing
- Create automated tests for critical paths
- Verify with all three user tiers
- Document test results

**Success Metrics:**
- All CRUD operations work without errors
- All three test users have complete sample data
- Subscription tier limits enforced correctly
- Projections calculate accurately
- Frontend can display all data
- No 404 or 500 errors in production use
