# Zapiio + ProjectionLab Inspired - Combined Implementation Plan

## Executive Summary

This plan combines the property investment focus of Zapiio with the comprehensive financial planning UX of ProjectionLab to create a superior Australian property investment platform.

---

## Gap Analysis: Current Zapiio Clone vs ProjectionLab

### What ProjectionLab Has (That We're Missing)

| Feature | ProjectionLab | Current Zapiio Clone | Priority |
|---------|---------------|----------------------|----------|
| **Onboarding Wizard** | Step-by-step guided setup (5-10 min) | None - direct to dashboard | HIGH |
| **Personal Profile** | Age, DOB, location, currency, family status | None | HIGH |
| **Multi-Person Planning** | Individual or couple planning | Single user only | MEDIUM |
| **Income Management** | Multiple income sources, growth rates, end dates | Not implemented | HIGH |
| **Expense Tracking** | Categorized spending with projections | Basic property expenses only | MEDIUM |
| **Multiple Asset Types** | Stocks, bonds, crypto, real estate, cash | Properties only | HIGH |
| **Liability Management** | Multiple debt types with payoff strategies | Property loans only | MEDIUM |
| **FIRE Planning** | Multiple retirement scenarios (FIRE, Lean FIRE, Fat FIRE) | Goal year only | HIGH |
| **Net Worth Dashboard** | Assets vs Liabilities summary | Portfolio value only | HIGH |
| **Progress Tracking** | Historical net worth over time | No history | MEDIUM |
| **Multiple Plans** | Compare different life scenarios | Actual vs Scenario only | HIGH |
| **Tax Modeling** | Income tax, capital gains, deductions | Not implemented | HIGH |
| **Monte Carlo Simulations** | Probability-based projections | Single projection line | MEDIUM |
| **Social Security/Super** | Retirement benefits modeling | Not implemented | HIGH |
| **Life Events** | Marriage, children, education, inheritance | Not implemented | MEDIUM |
| **Export/Reports** | PDF reports, CSV exports | Not implemented | LOW |
| **Dark Mode** | Theme toggle | Light only | LOW |

### What Zapiio Has (To Keep/Enhance)

| Feature | Status | Enhancement Needed |
|---------|--------|-------------------|
| Property-focused dashboard | ✅ Excellent | Keep as primary view |
| Portfolio stats cards | ✅ Good | Add more metrics |
| Equity/Cashflow toggle | ✅ Good | Enhance calculations |
| Time range filters | ✅ Good | Add custom ranges |
| Projection chart | ✅ Basic | Add interactive tooltips |
| Forecast table | ✅ Good | Add drill-down |
| Add property modal | ✅ Good | Add Australian data APIs |
| Member management | ✅ Basic | Enhance permissions |

---

## UI/UX Adaptations from ProjectionLab

### 1. Design Language Updates

**Current (Zapiio):**
- Dark navy (#1a1f36) with lime green (#BFFF00) accents
- Property-centric layout

**Adopt from ProjectionLab:**
- Clean, minimal white/gray backgrounds for data entry
- Soft blue (#4299E1) accent for progress and CTAs
- Card-based UI with clear hierarchy
- Gradient backgrounds for key metrics
- Progress indicators in wizards

### 2. Navigation Structure

**Current:**
```
Scenarios | Portfolios
```

**New (ProjectionLab-inspired):**
```
Sidebar Navigation:
├── Dashboard (Net Worth Overview)
├── Current Finances
│   ├── Income
│   ├── Spending
│   ├── Assets (Properties + Other)
│   └── Liabilities
├── Progress (Historical Tracking)
├── Plans
│   ├── FIRE Plan
│   ├── Property Goal
│   └── + New Plan
├── Settings
└── Help Center
```

### 3. Onboarding Wizard Flow

```
Step 1: WELCOME
├── Normal walkthrough (5-10 min)
└── Sandbox mode (pre-populated demo)

Step 2: ABOUT YOU
├── Planning type (Individual/Couple)
├── Personal details (Name, DOB)
├── Location (Australia + State)
└── Currency (AUD)

Step 3: INCOME
├── Primary employment
├── Partner income (if applicable)
├── Rental income (auto from properties)
├── Investment income
└── Growth assumptions

Step 4: SPENDING
├── Annual expenses
├── Categories (Housing, Food, Transport, etc.)
├── Inflation assumptions
└── Post-retirement spending

Step 5: ASSETS
├── Properties (detailed entry)
├── Super/401k
├── Investment accounts
├── Cash/Savings
└── Other assets

Step 6: LIABILITIES
├── Property loans (linked to properties)
├── Car loans
├── Credit cards
├── HECS/Student loans
└── Other debts

Step 7: GOALS
├── Retirement age target
├── Equity goal ($X million)
├── Passive income goal ($X/year)
└── Property count goal

Step 8: SUMMARY
├── Quick projections preview
├── Suggested optimizations
└── Go to Dashboard
```

---

## Combined Database Schema

```
Collections:
├── users
│   ├── _id, email, password_hash, name
│   ├── date_of_birth, planning_type (individual/couple)
│   ├── country, state, currency
│   ├── partner_details{} (if couple)
│   ├── created_at, updated_at
│   └── subscription_tier, onboarding_completed

├── portfolios
│   ├── _id, name, type, owner_id
│   ├── members[], settings{}
│   ├── goal_settings{} (retirement_age, equity_target, income_target)
│   └── created_at, updated_at

├── properties
│   ├── _id, portfolio_id
│   ├── address, suburb, state, postcode
│   ├── property_type, bedrooms, bathrooms, car_spaces
│   ├── purchase_price, purchase_date, current_value
│   ├── loan_details{} (amount, rate, type, term, lender)
│   ├── rental_details{} (income, frequency, vacancy_rate)
│   ├── expenses{} (itemized)
│   ├── growth_assumptions{}
│   └── created_at, updated_at

├── income_sources (NEW)
│   ├── _id, user_id, portfolio_id
│   ├── name, type (salary/rental/dividend/business)
│   ├── amount, frequency
│   ├── owner (you/partner/joint)
│   ├── start_date, end_date
│   ├── growth_rate
│   └── tax_treatment

├── expenses (NEW)
│   ├── _id, user_id, portfolio_id
│   ├── category, name
│   ├── amount, frequency
│   ├── inflation_rate
│   ├── start_date, end_date (for temporary expenses)
│   └── retirement_percentage (% of current in retirement)

├── assets (NEW - Non-property)
│   ├── _id, user_id, portfolio_id
│   ├── type (super/shares/etf/crypto/cash/other)
│   ├── name, institution
│   ├── current_value, purchase_value
│   ├── contributions{} (amount, frequency)
│   ├── growth_assumptions{}
│   └── tax_treatment

├── liabilities (NEW - Non-property loans)
│   ├── _id, user_id, portfolio_id
│   ├── type (car/credit/hecs/personal/other)
│   ├── name, lender
│   ├── original_amount, current_balance
│   ├── interest_rate, minimum_payment
│   ├── payment_strategy
│   └── payoff_date

├── scenarios
│   ├── _id, portfolio_id, name
│   ├── type (fire/lean_fire/property_goal/custom)
│   ├── base_scenario_id
│   ├── modifications[]
│   ├── simulation_settings{} (monte_carlo, inflation, etc.)
│   └── created_at, updated_at

├── plans (NEW)
│   ├── _id, portfolio_id, name
│   ├── type (fire/coast_fire/barista_fire/custom)
│   ├── retirement_age, target_equity
│   ├── withdrawal_strategy
│   ├── social_security_assumptions{}
│   └── projections{} (cached)

├── net_worth_history (NEW)
│   ├── _id, user_id, portfolio_id
│   ├── date, total_assets, total_liabilities
│   ├── net_worth, breakdown{}
│   └── created_at

└── life_events (NEW)
    ├── _id, user_id
    ├── type (retirement/property_purchase/sale/child/inheritance)
    ├── date, financial_impact{}
    └── notes
```

---

## Revised Implementation Phases

### Phase 1: Core Infrastructure & Auth (3-4 days)
- JWT authentication with refresh tokens
- User registration with basic profile
- Password reset flow
- Database setup with all collections
- API structure and error handling

### Phase 2: Onboarding Wizard (3-4 days)
- Multi-step setup wizard UI
- About You form (personal details, location)
- Income sources management
- Expense categories
- Save progress between steps
- Skip/complete later functionality

### Phase 3: Property Management Enhanced (2-3 days)
- Enhanced property form with Australian data
- Property loan details with multiple lenders
- Rental income tracking
- Expense breakdown by category
- Property valuation history

### Phase 4: Assets & Liabilities (3-4 days)
- Superannuation tracking
- Share/ETF portfolio
- Cryptocurrency holdings
- Cash/savings accounts
- Non-property debts (car, HECS, credit)
- Debt payoff strategies

### Phase 5: Net Worth Dashboard (2-3 days)
- Net worth calculation engine
- Assets vs Liabilities breakdown
- Net worth history tracking
- Interactive charts (Recharts/Chart.js)
- Drill-down by asset type

### Phase 6: Plans & Scenarios (4-5 days)
- Multiple plan creation (FIRE, Lean FIRE, etc.)
- Scenario comparison view
- What-if modifications
- Property purchase/sale scenarios
- Interest rate change modeling
- Monte Carlo simulations (basic)

### Phase 7: Projection Engine (3-4 days)
- Enhanced forecast calculations
- Australian tax modeling (basic)
- Superannuation projections
- Social security estimates
- Goal tracking and alerts
- Retirement income projections

### Phase 8: Frontend Polish (2-3 days)
- Sidebar navigation implementation
- Dark mode support
- Mobile responsiveness
- Export to PDF/CSV
- Help center integration
- Performance optimization

---

## Updated API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
PUT    /api/auth/profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Onboarding
```
GET    /api/onboarding/status
PUT    /api/onboarding/step/:step
POST   /api/onboarding/complete
POST   /api/onboarding/skip
```

### Portfolio
```
GET    /api/portfolios
POST   /api/portfolios
GET    /api/portfolios/:id
PUT    /api/portfolios/:id
DELETE /api/portfolios/:id
GET    /api/portfolios/:id/summary
GET    /api/portfolios/:id/net-worth
```

### Properties
```
GET    /api/portfolios/:id/properties
POST   /api/portfolios/:id/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id
GET    /api/properties/:id/projections
```

### Income
```
GET    /api/portfolios/:id/income
POST   /api/portfolios/:id/income
PUT    /api/income/:id
DELETE /api/income/:id
```

### Expenses
```
GET    /api/portfolios/:id/expenses
POST   /api/portfolios/:id/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/categories
```

### Assets (Non-Property)
```
GET    /api/portfolios/:id/assets
POST   /api/portfolios/:id/assets
PUT    /api/assets/:id
DELETE /api/assets/:id
```

### Liabilities
```
GET    /api/portfolios/:id/liabilities
POST   /api/portfolios/:id/liabilities
PUT    /api/liabilities/:id
DELETE /api/liabilities/:id
GET    /api/liabilities/:id/payoff-projection
```

### Plans & Scenarios
```
GET    /api/portfolios/:id/plans
POST   /api/portfolios/:id/plans
GET    /api/plans/:id
PUT    /api/plans/:id
DELETE /api/plans/:id
GET    /api/plans/:id/projections
POST   /api/plans/:id/simulate

GET    /api/portfolios/:id/scenarios
POST   /api/portfolios/:id/scenarios
PUT    /api/scenarios/:id
DELETE /api/scenarios/:id
GET    /api/portfolios/:id/compare-scenarios
```

### Forecasts & Analytics
```
GET    /api/portfolios/:id/forecast
GET    /api/portfolios/:id/net-worth-history
POST   /api/portfolios/:id/snapshot
GET    /api/portfolios/:id/insights
```

---

## UI Component Updates Required

### New Components to Build

```
/src/components/
├── onboarding/
│   ├── OnboardingWizard.jsx
│   ├── WelcomeStep.jsx
│   ├── AboutYouStep.jsx
│   ├── IncomeStep.jsx
│   ├── SpendingStep.jsx
│   ├── AssetsStep.jsx
│   ├── LiabilitiesStep.jsx
│   ├── GoalsStep.jsx
│   └── SummaryStep.jsx
│
├── layout/
│   ├── Sidebar.jsx (NEW)
│   ├── Navbar.jsx (UPDATE)
│   └── PageHeader.jsx
│
├── dashboard/
│   ├── NetWorthCard.jsx (NEW)
│   ├── AssetBreakdown.jsx (NEW)
│   ├── LiabilityBreakdown.jsx (NEW)
│   ├── NetWorthChart.jsx (NEW)
│   └── (existing components)
│
├── finances/
│   ├── IncomeManager.jsx (NEW)
│   ├── ExpenseManager.jsx (NEW)
│   ├── AssetManager.jsx (NEW)
│   ├── LiabilityManager.jsx (NEW)
│   └── FinancialSummary.jsx (NEW)
│
├── plans/
│   ├── PlansList.jsx (NEW)
│   ├── PlanCard.jsx (NEW)
│   ├── PlanEditor.jsx (NEW)
│   ├── FIRECalculator.jsx (NEW)
│   └── ScenarioComparison.jsx (NEW)
│
└── charts/
    ├── NetWorthAreaChart.jsx (NEW)
    ├── AssetAllocationPie.jsx (NEW)
    ├── ProjectionLineChart.jsx (UPDATE)
    └── CashflowBarChart.jsx (NEW)
```

---

## Implementation Timeline

| Phase | Description | Duration | Dependencies |
|-------|-------------|----------|--------------|
| **1** | Core Infrastructure & Auth | 3-4 days | None |
| **2** | Onboarding Wizard | 3-4 days | Phase 1 |
| **3** | Property Management Enhanced | 2-3 days | Phase 1 |
| **4** | Assets & Liabilities | 3-4 days | Phase 1 |
| **5** | Net Worth Dashboard | 2-3 days | Phase 3, 4 |
| **6** | Plans & Scenarios | 4-5 days | Phase 5 |
| **7** | Projection Engine | 3-4 days | Phase 6 |
| **8** | Frontend Polish | 2-3 days | All phases |

**Total Estimated Time: 23-30 days**

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async)
- **Auth**: JWT with python-jose, passlib for hashing
- **Validation**: Pydantic models
- **Calculations**: NumPy, pandas for financial math

### Frontend
- **Framework**: React 19
- **Styling**: TailwindCSS + Shadcn/UI
- **State**: Zustand or React Context
- **Charts**: Recharts (primary) or Chart.js
- **Forms**: React Hook Form + Zod
- **API**: Axios with React Query

### External APIs (Future)
- CoreLogic - Property valuations
- Domain - Rental estimates
- RBA - Interest rates
- ATO - Tax rates

---

## Priority Recommendation

**For MVP (2 weeks):**
1. Phase 1: Auth & Infrastructure
2. Phase 3: Property Management
3. Phase 5: Net Worth Dashboard (basic)
4. Phase 7: Projection Engine (basic)

**For Version 1.0 (4 weeks):**
- Add Phase 2: Onboarding
- Add Phase 4: Assets & Liabilities
- Add Phase 6: Plans & Scenarios

**For Version 2.0 (6+ weeks):**
- Full tax modeling
- Monte Carlo simulations
- External API integrations
- Mobile app

---

## Next Steps

1. **Confirm MVP scope** - Which features are must-have for first release?
2. **Design approval** - Should I update the UI to match ProjectionLab's cleaner style?
3. **Start Phase 1** - Begin with authentication and database setup?

Ready to proceed when you confirm!
