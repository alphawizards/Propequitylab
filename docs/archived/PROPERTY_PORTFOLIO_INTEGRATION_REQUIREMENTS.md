# Property Portfolio Integration Requirements
## Source Repository Analysis - Property-Portfolio-Website

**Date:** 2026-01-11
**Source Repository:** https://github.com/alphawizards/Property-Portfolio-Website.git
**Target Repository:** Propequitylab
**Analysis Status:** ✅ Complete

---

## Executive Summary

Successfully cloned and analyzed the Property-Portfolio-Website repository. All files referenced in the AI-Agent-Package documentation are **confirmed present and accessible**. This document provides an updated inventory of required files and identifies key integration requirements.

---

## ✅ Repository Verification

### Key Files Confirmed

| File Path | Lines | Status | Purpose |
|-----------|-------|--------|---------|
| `/drizzle/schema.ts` | 427 | ✅ Present | Complete PostgreSQL schema with 24 tables |
| `/shared/calculations.ts` | 645 | ✅ Present | Financial calculation engine (15 exported functions) |
| `/server/routers.ts` | 948 | ✅ Present | Complete tRPC API router |
| `/client/src/pages/PropertyWizard.tsx` | 787 | ✅ Present | Multi-step property creation wizard |
| `/shared/calculations.test.ts` | - | ✅ Present | Calculation engine test suite |
| `/shared/schemas.ts` | - | ✅ Present | Zod validation schemas |
| `/shared/decimal-utils.ts` | - | ✅ Present | Decimal precision utilities |
| `/client/src/components/forms/AddressAutocomplete.tsx` | - | ✅ Present | Google Maps integration |
| `/server/db.ts` | 29,162 bytes | ✅ Present | Database access layer |

---

## 📊 Database Schema Analysis

### Complete Table Inventory (24 Tables)

**Users & Subscriptions (3 tables):**
1. `users` - User accounts with subscription integration
2. `subscription_tiers` - Subscription plan definitions (FREE, PREMIUM_MONTHLY, PREMIUM_ANNUAL)
3. `user_subscriptions` - Active subscription tracking

**Portfolio Management (2 tables):**
4. `portfolios` - Portfolio grouping (Normal, Trust, Company)
5. `portfolio_goals` - Financial goals (equity targets, cashflow targets, value targets)

**Property Core (6 tables):**
6. `properties` - Main property data (address, type, ownership, purchase details)
7. `property_ownership` - Multi-owner percentage tracking
8. `purchase_costs` - Detailed acquisition costs (agent fee, stamp duty, legal fee, inspection)
9. `property_usage_periods` - Investment vs PPOR tracking over time
10. `property_valuations` - Historical property valuations
11. `growth_rate_periods` - Flexible growth rate modeling by time period

**Loan Management (5 tables):**
12. `loans` - Multiple loans per property (EquityLoan, PrincipalLoan)
13. `loan_scenarios` - What-if scenario modeling
14. `extra_repayments` - Recurring extra payment schedules
15. `lump_sum_payments` - One-time additional payments
16. `interest_rate_forecasts` - Future interest rate projections

**Income & Expenses (5 tables):**
17. `rental_income` - Rental income streams with growth rates
18. `expense_logs` - Expense tracking with frequency
19. `expense_breakdown` - Detailed expense categorization
20. `depreciation_schedule` - Tax depreciation schedules
21. `capital_expenditure` - Capital expenditure tracking

**Advanced Features (2 tables):**
22. `scenarios` - Portfolio scenario cloning for comparison
23. `property_drafts` - Multi-step form draft saving

**Feedback System (1 table):**
24. `feedback` - User feedback collection

### Critical Enums

```typescript
// Property & Ownership
propertyTypeEnum: 'Residential' | 'Commercial' | 'Industrial' | 'Land'
ownershipStructureEnum: 'Trust' | 'Individual' | 'Company' | 'Partnership'
propertyStatusEnum: 'Actual' | 'Projected'
usageTypeEnum: 'Investment' | 'PPOR'

// Loans
loanTypeEnum: 'EquityLoan' | 'PrincipalLoan'
loanStructureEnum: 'InterestOnly' | 'PrincipalAndInterest'
loanPurposeEnum: 'PropertyPurchase' | 'Renovation' | 'Investment' | 'Other'

// Frequency
frequencyEnum: 'Weekly' | 'Fortnightly' | 'Monthly' | 'Quarterly' | 'Annually' | 'OneTime'

// Portfolio
portfolioTypeEnum: 'Normal' | 'Trust' | 'Company'

// Subscriptions
subscriptionTierEnum: 'FREE' | 'PREMIUM_MONTHLY' | 'PREMIUM_ANNUAL'
subscriptionStatusEnum: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'suspended' | 'expired' | 'cancelled'
```

---

## 🧮 Calculation Engine Functions

### Core Financial Calculations (15 Functions)

**Currency Conversion:**
1. `centsToDollars(cents)` - Convert cents to dollars for display
2. `dollarsToCents(dollars)` - Convert dollars to cents for storage

**Loan Calculations:**
3. `calculateInterestOnlyRepayment(loan, rateOffset)` - IO loan payments
4. `calculatePrincipalAndInterestRepayment(loan, rateOffset)` - P&I loan payments using amortization formula
5. `calculateLoanRepayment(loan, rateOffset)` - Wrapper for IO/P&I selection
6. `calculateRemainingBalance(loan, yearsElapsed, rateOffset)` - Loan balance after N years

**Property Value Projections:**
7. `calculatePropertyValue(property, valuations, growthRates, targetYear)` - Project property value using historical data and growth rates

**Income & Expense Projections:**
8. `calculateRentalIncomeForYear(rentalIncomes, targetYear)` - Annual rental income with growth
9. `calculateExpensesForYear(expenses, targetYear, expenseGrowthOverride)` - Annual expenses with growth

**Equity & Cashflow:**
10. `calculatePropertyEquity(property, loans, valuations, growthRates, targetYear, interestRateOffset)` - Property value, debt, equity, LVR
11. `calculatePropertyCashflow(property, loans, rentalIncomes, expenses, depreciation, targetYear, ...)` - Comprehensive cashflow analysis

**Portfolio-Level:**
12. `calculatePortfolioSummary(propertiesData, targetYear)` - Aggregate portfolio metrics
13. `generatePortfolioProjections(propertiesData, startYear, endYear, ...)` - Multi-year projections

**Investment Comparison:**
14. `calculateShareStrategy(initialInvestment, annualContribution, annualReturn, years)` - Share investment modeling
15. `generateInvestmentComparison(propertiesData, startYear, endYear, shareAnnualReturn)` - Property vs Share comparison

### Calculation Features

- **Precision:** All calculations use `Decimal.js` for financial accuracy
- **Storage:** All monetary values stored in cents (integer)
- **Frequency Support:** Weekly, Fortnightly, Monthly, Quarterly, Annually
- **Growth Modeling:** Multi-period growth rates (different rates for different time periods)
- **Scenario Analysis:** Interest rate offsets, expense growth overrides

---

## 🎨 Frontend Components

### Primary Components

**Property Creation:**
- `PropertyWizard.tsx` (787 lines) - 10-step property creation wizard
  - Step 1: Property details (address, type, ownership)
  - Step 2: Usage periods (Investment vs PPOR)
  - Step 3: Purchase information and costs
  - Step 4: Equity loans
  - Step 5: Principal loan
  - Step 6: Property value & growth rates
  - Step 7: Rental income
  - Step 8: Expenses
  - Step 9: Depreciation
  - Step 10: Capital expenditure

**Dashboard & Visualization:**
- `DashboardView.tsx` - Main portfolio dashboard
- `DashboardLayout.tsx` - Layout wrapper with navigation
- `CashflowChart.tsx` - Cashflow visualization
- `PropertyGrowthChart.tsx` - Property value growth charts
- `LoanCalculator.tsx` - Comprehensive loan calculator
- `SimpleEquityCalculator.tsx` - Quick equity calculator

**Form Components:**
- `AddressAutocomplete.tsx` - Google Maps Places API integration

### UI Component Library

**Radix UI Components Used:**
- Accordion, AlertDialog, AspectRatio, Avatar
- Checkbox, Collapsible, ContextMenu, Dialog
- DropdownMenu, HoverCard, Label, Menubar
- NavigationMenu, Popover, Progress, RadioGroup
- ScrollArea, Select, Separator, Slider
- Slot, Switch, Tabs, Toggle, ToggleGroup, Tooltip

**Additional Libraries:**
- `recharts` - Chart visualization
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `wouter` - Client-side routing (needs conversion to React Router DOM)
- `date-fns` - Date utilities
- `lucide-react` - Icon library
- `framer-motion` - Animations
- `sonner` - Toast notifications

---

## 🔧 Tech Stack Comparison

### Property-Portfolio-Website Stack

**Backend:**
- Language: TypeScript
- Runtime: Node.js 22.13.0
- Framework: Express 4.21.2
- API Layer: tRPC 11.6.0 (type-safe RPC)
- Database: PostgreSQL
- ORM: Drizzle ORM 0.44.6
- Authentication: Clerk (SaaS)
- Payments: Stripe 20.0.0

**Frontend:**
- Framework: React 19.1.1
- Build Tool: Vite 5.4.21
- Styling: TailwindCSS 4.1.14
- State: Zustand 5.0.9 + React Query 5.90.2
- Routing: Wouter 3.3.5
- Forms: React Hook Form 7.64.0
- Validation: Zod 4.1.12

**Development:**
- Package Manager: pnpm 10.4.1
- TypeScript: 5.9.3
- Testing: Vitest 2.1.4

### Translation Requirements for Propequitylab

**Backend Changes Required:**
| Component | From | To | Effort |
|-----------|------|-----|--------|
| Language | TypeScript | Python | HIGH |
| Framework | Express | FastAPI | HIGH |
| API Pattern | tRPC (RPC) | REST | HIGH |
| ORM | Drizzle | SQLModel | HIGH |
| Auth | Clerk | Custom JWT | MEDIUM |

**Frontend Changes Required:**
| Component | From | To | Effort |
|-----------|------|-----|--------|
| API Client | tRPC | Axios | MEDIUM |
| Routing | Wouter | React Router DOM | LOW |
| Validation | Zod (client) | Zod (add if missing) | LOW |
| State | Zustand | React Hook Form state | LOW |

**Compatible (No Changes):**
| Component | Status |
|-----------|--------|
| React 19 | ✅ Same version |
| Radix UI | ✅ Same library |
| TailwindCSS | ⚠️ Version diff (4.x vs 3.x) - minor |
| React Hook Form | ✅ Same library |
| PostgreSQL | ✅ Same database |
| Decimal precision | ✅ Python has `decimal.Decimal` |

---

## 📋 Files Required for Integration

### Critical Files (Must Have)

**Database Schema:**
1. ✅ `/drizzle/schema.ts` - Complete schema definition
2. ✅ `/drizzle/relations.ts` - Table relationships

**Calculation Engine:**
3. ✅ `/shared/calculations.ts` - Financial calculations
4. ✅ `/shared/calculations.test.ts` - Test cases for validation
5. ✅ `/shared/decimal-utils.ts` - Decimal precision utilities
6. ✅ `/shared/schemas.ts` - Zod validation schemas

**API Layer:**
7. ✅ `/server/routers.ts` - Main API router
8. ✅ `/server/db.ts` - Database access layer
9. ✅ `/server/routers/property-draft-router.ts` - Draft saving functionality

**Frontend Components:**
10. ✅ `/client/src/pages/PropertyWizard.tsx` - Property creation wizard
11. ✅ `/client/src/components/forms/AddressAutocomplete.tsx` - Address autocomplete
12. ✅ `/client/src/components/DashboardView.tsx` - Dashboard layout
13. ✅ `/client/src/components/CashflowChart.tsx` - Cashflow visualization
14. ✅ `/client/src/components/charts/PropertyGrowthChart.tsx` - Growth charts
15. ✅ `/client/src/components/LoanCalculator.tsx` - Loan calculator

**Utilities:**
16. ✅ `/client/src/lib/australianTaxCalculators.ts` - Australian stamp duty calculations
17. ✅ `/client/src/lib/australianTaxCalculators.test.ts` - Tax calculation tests

**Configuration:**
18. ✅ `/package.json` - Dependencies and scripts
19. ✅ `/.env.example` - Environment variable template

### Supporting Files (Nice to Have)

20. `/server/routers/auth-router.ts` - Authentication patterns (for reference)
21. `/server/routers/feature-gates-router.ts` - Feature flag system
22. `/server/subscription-router.ts` - Subscription management
23. `/client/src/components/SimpleEquityCalculator.tsx` - Simple calculator
24. `/client/src/components/DashboardLayout.tsx` - Layout component

---

## 🔄 Integration Phases - Updated Assessment

### Phase 0: Foundation Repair (PREREQUISITE - NOT in AI-Agent-Package)

**Status:** ❌ BLOCKING - Must complete before Phase 1

**Critical Issues:**
1. All 56 API endpoints in Propequitylab return 404
2. Backend deployment appears broken (AWS App Runner issue?)
3. Authentication bypassed (dev mode)
4. Database connectivity uncertain

**Required Actions:**
1. Diagnose AWS App Runner deployment
2. Fix API routing configuration
3. Implement real authentication
4. Verify database connection
5. Create base CRUD endpoints for:
   - `/api/auth/*` (login, register, refresh, verify)
   - `/api/portfolios` (basic CRUD)
   - `/api/properties` (basic CRUD)
   - `/api/income` (basic CRUD)
   - `/api/expenses` (basic CRUD)
   - `/api/assets` (basic CRUD)
   - `/api/liabilities` (basic CRUD)

**Estimated Effort:** 2-3 weeks
**Priority:** CRITICAL - Blocks all other phases

---

### Phase 1: Database Schema Extension

**Prerequisite:** Phase 0 complete ✅

**Objective:** Add 24 new tables to Propequitylab PostgreSQL database

**Key Files to Translate:**
- `/drizzle/schema.ts` (427 lines) → Python SQLModel definitions

**New Tables to Create:**
1. `subscription_tiers`
2. `user_subscriptions`
3. `portfolio_goals`
4. `property_ownership`
5. `purchase_costs`
6. `property_usage_periods`
7. `property_valuations`
8. `growth_rate_periods`
9. `loans`
10. `loan_scenarios`
11. `rental_income`
12. `expense_logs`
13. `expense_breakdown`
14. `depreciation_schedule`
15. `capital_expenditure`
16. `scenarios`
17. `extra_repayments`
18. `lump_sum_payments`
19. `interest_rate_forecasts`
20. `feedback`
21. `property_drafts`

**Python Enums to Create:**
```python
class PropertyType(str, Enum):
    RESIDENTIAL = "Residential"
    COMMERCIAL = "Commercial"
    INDUSTRIAL = "Industrial"
    LAND = "Land"

class LoanStructure(str, Enum):
    INTEREST_ONLY = "InterestOnly"
    PRINCIPAL_AND_INTEREST = "PrincipalAndInterest"

class Frequency(str, Enum):
    WEEKLY = "Weekly"
    FORTNIGHTLY = "Fortnightly"
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    ANNUALLY = "Annually"
    ONE_TIME = "OneTime"

# ... (10+ more enums)
```

**Migration Strategy:**
1. Create `/backend/models/financials.py` with all new models
2. Generate Alembic migration: `alembic revision --autogenerate -m "Add property portfolio tables"`
3. Review generated migration for correctness
4. Apply migration: `alembic upgrade head`
5. Verify all tables created with proper indexes and foreign keys

**Data Types:**
- Currency: `DECIMAL(19, 4)` (cents with 4 decimal precision)
- Percentages: `DECIMAL(5, 2)` (e.g., 7.25 for 7.25%)
- Dates: `date` for dates, `timestamp` for datetime

**Backward Compatibility:**
- Do NOT modify existing `properties` table
- New tables coexist with current schema
- Existing JSON fields (`loan_details`, `rental_details`, etc.) remain functional

**Estimated Effort:** 40 hours (1-2 weeks)

---

### Phase 2: Calculation Engine Translation

**Prerequisite:** Phase 1 complete ✅

**Objective:** Translate 645 lines of TypeScript calculations to Python

**Source File:** `/shared/calculations.ts`
**Target File:** `/backend/utils/calculations.py`

**Key Functions to Translate:**

```python
# Loan Calculations
def calculate_interest_only_repayment(loan: Loan, rate_offset: Decimal = Decimal("0")) -> LoanRepayment
def calculate_principal_and_interest_repayment(loan: Loan, rate_offset: Decimal = Decimal("0")) -> LoanRepayment
def calculate_loan_repayment(loan: Loan, rate_offset: Decimal = Decimal("0")) -> LoanRepayment
def calculate_remaining_balance(loan: Loan, years_elapsed: int, rate_offset: Decimal = Decimal("0")) -> Decimal

# Property Value
def calculate_property_value(property: Property, valuations: List[PropertyValuation],
                             growth_rates: List[GrowthRatePeriod], target_year: int) -> Decimal

# Income & Expenses
def calculate_rental_income_for_year(rental_incomes: List[RentalIncome], target_year: int) -> Decimal
def calculate_expenses_for_year(expenses: List[ExpenseLog], target_year: int,
                                expense_growth_override: Optional[Decimal] = None) -> Decimal

# Equity & Cashflow
def calculate_property_equity(property: Property, loans: List[Loan],
                              valuations: List[PropertyValuation],
                              growth_rates: List[GrowthRatePeriod],
                              target_year: int,
                              interest_rate_offset: Decimal = Decimal("0")) -> PropertyEquity
def calculate_property_cashflow(...) -> PropertyCashflow

# Portfolio Level
def calculate_portfolio_summary(properties_data: List[PropertyData], target_year: int) -> PortfolioSummary
def generate_portfolio_projections(properties_data: List[PropertyData],
                                   start_year: int, end_year: int, ...) -> List[PortfolioProjection]
```

**Critical Requirements:**
1. Use `Decimal` for ALL financial calculations (never `float`)
2. Store all monetary values in cents as integers
3. Maintain exact same algorithm logic as TypeScript
4. Implement comprehensive unit tests matching `/shared/calculations.test.ts`

**Formulas to Preserve:**
- Loan amortization: `M = P × [r(1+r)^n] / [(1+r)^n - 1]`
- Compound growth: `FV = PV × (1 + r)^n`
- Frequency conversions: Weekly=52, Fortnightly=26, Monthly=12, Quarterly=4, Annually=1

**Testing Strategy:**
- Port all test cases from `/shared/calculations.test.ts`
- Golden master testing with known scenarios
- Verify decimal precision (no floating point errors)
- Performance: 30-year projection must complete in <1 second

**Estimated Effort:** 50 hours (2-3 weeks)

---

### Phase 3: API Endpoint Creation

**Prerequisite:** Phase 2 complete ✅

**Objective:** Create FastAPI endpoints to expose calculation engine

**Source File:** `/server/routers.ts` (948 lines)
**Target Files:**
- `/backend/routes/projections.py` (new)
- `/backend/routes/loans.py` (new)
- `/backend/routes/valuations.py` (new)
- `/backend/routes/properties.py` (extend existing)

**Key Endpoints to Create:**

```python
# Projections
GET /api/projections/{property_id}?years=10&expense_growth_override=3.5&interest_rate_offset=1.0
GET /api/projections/portfolio/{portfolio_id}?years=10

# Loans
POST /api/loans
GET /api/loans/property/{property_id}
GET /api/loans/{loan_id}
PUT /api/loans/{loan_id}
DELETE /api/loans/{loan_id}

# Valuations
POST /api/valuations
GET /api/valuations/property/{property_id}
DELETE /api/valuations/{valuation_id}

# Property Extensions
GET /api/properties/{property_id}/complete  # Get property with all related data
POST /api/properties/{property_id}/equity   # Calculate current equity
```

**Pydantic Models Required:**
```python
# Request Models
class LoanCreate(BaseModel)
class LoanUpdate(BaseModel)
class ValuationCreate(BaseModel)
class PropertyCompleteCreate(BaseModel)  # Nested loans, income, expenses

# Response Models
class LoanResponse(BaseModel)
class PropertyEquityResponse(BaseModel)
class ProjectionYearResponse(BaseModel)
class PortfolioProjectionResponse(BaseModel)
```

**Security Requirements:**
1. All endpoints require authentication
2. Verify user ownership before access/modify
3. Row-level security: `WHERE property.user_id == current_user.id`
4. Input validation with Pydantic
5. Rate limiting on computation-heavy endpoints

**Error Handling:**
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (not resource owner)
- 404: Not Found (property/loan doesn't exist)
- 500: Internal Server Error (calculation errors)

**Estimated Effort:** 40 hours (1-2 weeks)

---

### Phase 4: Frontend Property Wizard

**Prerequisite:** Phase 3 complete ✅

**Objective:** Adapt 10-step property wizard to Propequitylab

**Source File:** `/client/src/pages/PropertyWizard.tsx` (787 lines)
**Target File:** `/frontend/src/components/PropertyWizard.tsx`

**Key Adaptations Required:**

1. **API Integration:**
```typescript
// BEFORE (tRPC)
const createProperty = trpc.properties.create.useMutation();
createProperty.mutate(formData);

// AFTER (Axios)
const createProperty = async (formData: PropertyFormData) => {
  const response = await axios.post('/api/properties', formData);
  return response.data;
};
```

2. **Routing:**
```typescript
// BEFORE (Wouter)
import { useLocation } from "wouter";
const [location, setLocation] = useLocation();
setLocation("/dashboard");

// AFTER (React Router DOM)
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/dashboard");
```

3. **State Management:**
- Keep existing React Hook Form implementation
- Add Zod validation schemas (already compatible)
- Implement draft auto-save with new endpoint

**Supporting Components:**
- Copy `/client/src/components/forms/AddressAutocomplete.tsx`
- Adapt Google Maps integration (API key configuration)
- Copy Radix UI form components (already compatible)

**New API Service:**
```typescript
// /frontend/src/services/propertyApi.ts
export const createProperty = async (data: PropertyFormData) => { ... }
export const saveDraft = async (data: any) => { ... }
export const getDraft = async () => { ... }
export const deleteDraft = async () => { ... }
```

**Estimated Effort:** 30 hours (2-3 weeks including testing)

---

### Phase 5: Data Visualization

**Prerequisite:** Phase 4 complete ✅

**Objective:** Display projections with interactive charts

**Source Files:**
- `/client/src/components/CashflowChart.tsx`
- `/client/src/components/charts/PropertyGrowthChart.tsx`
- `/client/src/components/DashboardView.tsx`

**Target Components:**
- `/frontend/src/components/PropertyProjections.tsx` (new)
- `/frontend/src/components/ProjectionCharts.tsx` (new)
- `/frontend/src/components/PropertyDashboard.tsx` (adapt)

**Charts to Implement:**

1. **Multi-Year Property Value Chart:**
```typescript
<LineChart data={projections}>
  <Line dataKey="totalValue" stroke="#8884d8" name="Property Value" />
  <Line dataKey="totalEquity" stroke="#82ca9d" name="Equity" />
  <Line dataKey="totalDebt" stroke="#ffc658" name="Debt" />
</LineChart>
```

2. **Cashflow Projection Chart:**
```typescript
<BarChart data={projections}>
  <Bar dataKey="rentalIncome" fill="#10b981" name="Rental Income" />
  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
  <Bar dataKey="netCashflow" fill="#3b82f6" name="Net Cashflow" />
</BarChart>
```

3. **LVR Trend Chart:**
```typescript
<AreaChart data={projections}>
  <Area dataKey="lvr" stroke="#f59e0b" fill="#fef3c7" name="LVR %" />
</AreaChart>
```

**Interactive Controls:**
- Years slider (5, 10, 20, 30 years)
- Interest rate offset (-2% to +5%)
- Expense growth override input
- Scenario comparison toggle

**Estimated Effort:** 20 hours (1-2 weeks)

---

### Phase 6: Data Migration

**Prerequisite:** Phase 5 complete ✅

**Objective:** Migrate existing JSON data to normalized tables

**Target Script:** `/backend/scripts/migrate_financials.py`

**Migration Functions:**

```python
def migrate_loans(session: Session):
    """Migrate loan_details JSON to loans table"""
    properties = session.exec(select(Property)).all()
    for prop in properties:
        if prop.loan_details:
            loan = Loan(
                property_id=prop.id,
                lender_name=prop.loan_details.get("lender", "Unknown"),
                original_amount=Decimal(str(prop.loan_details.get("amount", 0))),
                # ... map other fields
            )
            session.add(loan)
    session.commit()

def migrate_rental_income(session: Session): ...
def migrate_expenses(session: Session): ...
def migrate_growth_rates(session: Session): ...
```

**Migration Steps:**
1. Backup production database
2. Run migration in staging first
3. Validate data integrity (no data loss)
4. Generate migration report
5. Test rollback procedure
6. Run in production
7. Monitor for issues

**Dual-Mode Support:**
```python
def get_property_loans(property_id: str, session: Session) -> List[Loan]:
    # Try normalized table first
    loans = session.exec(select(Loan).where(Loan.property_id == property_id)).all()

    if not loans:
        # Fallback to JSON field
        property = session.get(Property, property_id)
        if property and property.loan_details:
            return [convert_json_to_loan(property.loan_details)]

    return loans
```

**Estimated Effort:** 20 hours (1 week)

---

## 🎯 Success Criteria

### Phase Completion Checklist

**Phase 0: Foundation**
- [ ] All API endpoints respond (no 404s)
- [ ] Authentication working (dev mode disabled)
- [ ] Database connected and accessible
- [ ] Base CRUD operations functional
- [ ] Health check endpoint returns healthy

**Phase 1: Database**
- [ ] All 24 tables created
- [ ] Foreign keys and indexes in place
- [ ] Enums defined correctly
- [ ] Migration reversible
- [ ] No breaking changes to existing schema

**Phase 2: Calculations**
- [ ] All 15 functions translated
- [ ] Unit tests pass (100% of test cases)
- [ ] Decimal precision verified
- [ ] Performance <1s for 30-year projection
- [ ] Edge cases handled (zero rates, negative growth, loan payoff)

**Phase 3: API**
- [ ] All endpoints functional
- [ ] Authentication enforced
- [ ] Authorization (ownership) verified
- [ ] Pydantic validation working
- [ ] Error handling comprehensive
- [ ] OpenAPI docs generated

**Phase 4: Wizard**
- [ ] All 10 steps render correctly
- [ ] Form validation working
- [ ] Draft saving functional
- [ ] API integration successful
- [ ] Navigation working
- [ ] Address autocomplete functional

**Phase 5: Visualization**
- [ ] Charts render correctly
- [ ] Data updates in real-time
- [ ] Scenario controls functional
- [ ] Export to CSV/PDF working
- [ ] Performance smooth (no lag)

**Phase 6: Migration**
- [ ] All data migrated successfully
- [ ] Validation passes
- [ ] No data loss
- [ ] Rollback tested
- [ ] Documentation complete

---

## 📦 Deliverables

Upon completion of all phases:

1. ✅ Updated Propequitylab codebase with all changes
2. ✅ Migration scripts ready to run
3. ✅ Test results showing 100% pass rate
4. ✅ OpenAPI/Swagger documentation
5. ✅ User guide for new features
6. ✅ Deployment instructions
7. ✅ Performance benchmarks
8. ✅ Known issues and limitations document

---

## ⚠️ Critical Risks

### High Priority Risks

1. **Financial Calculation Accuracy**
   - Risk: Errors in loan amortization
   - Impact: Incorrect forecasts for users
   - Mitigation: Comprehensive test suite, golden master testing

2. **Phase 0 Unknown Root Cause**
   - Risk: Backend 404 issue may be architectural
   - Impact: Could delay all other phases
   - Mitigation: Prioritize diagnosis, allocate extra time

3. **Database Migration Complexity**
   - Risk: Data loss during JSON → normalized migration
   - Impact: User data corruption
   - Mitigation: Backup, staging testing, dual-mode operation

4. **Performance at Scale**
   - Risk: 24 tables with joins could slow queries
   - Impact: Poor user experience
   - Mitigation: Proper indexing, query optimization, caching

### Medium Priority Risks

5. **API Response Size**
   - Risk: Projection data for 30 years could be large
   - Impact: Slow page loads
   - Mitigation: Pagination, lazy loading, compression

6. **Decimal Precision Differences**
   - Risk: TypeScript Decimal.js vs Python Decimal differences
   - Impact: Calculation discrepancies
   - Mitigation: Thorough testing, use same precision settings

---

## 🚀 Next Steps

### Immediate Actions Required

1. **Diagnose Phase 0 Issues (CRITICAL)**
   - Check AWS App Runner logs
   - Verify FastAPI application startup
   - Test database connectivity
   - Review routing configuration

2. **Access Verification**
   - Confirm access to Property-Portfolio-Website repo ✅
   - Review all key files are readable ✅
   - Identify any missing dependencies ⏳

3. **Planning**
   - Decide: Fix Phase 0 first OR start Phase 1 in parallel?
   - Allocate development resources
   - Set timeline expectations
   - Identify stakeholders for testing

4. **Environment Setup**
   - Set up development environment
   - Configure local database
   - Install Python dependencies
   - Configure frontend build tools

### Recommended Approach

**Option A: Sequential (Recommended)**
1. Complete Phase 0 (2-3 weeks)
2. Complete Phases 1-6 in order (8-13 weeks)
3. Total: 10-16 weeks

**Option B: Parallel (Higher Risk)**
1. Start Phase 1 while diagnosing Phase 0
2. Assumes Phase 0 can be fixed quickly
3. Risk: Wasted effort if Phase 0 is blocking

---

## 📊 Effort Summary

| Phase | Description | Estimated Hours | Weeks (FT) |
|-------|-------------|----------------|------------|
| Phase 0 | Foundation Repair | 80-120 | 2-3 |
| Phase 1 | Database Schema | 40 | 1-2 |
| Phase 2 | Calculation Engine | 50 | 2-3 |
| Phase 3 | API Endpoints | 40 | 1-2 |
| Phase 4 | Property Wizard | 30 | 2-3 |
| Phase 5 | Data Visualization | 20 | 1-2 |
| Phase 6 | Data Migration | 20 | 1 |
| **Total** | **Complete Integration** | **280-320** | **10-16** |

**Assumptions:**
- Single full-time developer
- Developer proficient in Python, FastAPI, React
- No major blockers or scope changes
- Testing included in estimates

---

## ✅ Repository Status

**Property-Portfolio-Website Repository:**
- Status: ✅ Successfully cloned
- Location: `/tmp/Property-Portfolio-Website`
- All key files verified present
- Ready for integration work

**Next Step:** Await decision on Phase 0 approach before proceeding.

---

*Document generated: 2026-01-11*
*Last updated: 2026-01-11*
