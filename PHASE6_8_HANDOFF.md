# Zapiio - Agent Handoff Summary
## Phases 6-8 Implementation Guide

**GitHub Repository**: https://github.com/alphawizards/Propequitylab.git
**Preview URL**: https://8ed6ce0a-a567-4e35-a121-0e1572dabac7.preview.emergentagent.com

---

## ✅ COMPLETED PHASES (1-5)

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Core Infrastructure (FastAPI + MongoDB + React) | ✅ Complete |
| Phase 2 | 8-Step Onboarding Wizard | ✅ Complete |
| Phase 3 | Property Management (CRUD + 5-tab form) | ✅ Complete |
| Phase 4 | Assets & Liabilities Pages | ✅ Complete |
| Phase 5 | Net Worth Dashboard with Charts | ✅ Complete |

### Phase 5 Summary (Just Completed):
- **Recharts library** installed (`recharts: ^3.6.0`)
- **Line/Area Chart**: Net Worth over time with date range selector (6/12/24/60 months)
- **Pie/Donut Chart**: Asset allocation breakdown by type
- **Bar Chart**: Monthly cashflow (Income vs Expenses vs Net Savings)
- **Savings Rate indicator** with progress bar
- **Snapshot button** for manual net worth snapshots

---

## 🔴 REMAINING PHASES (6-8)

---

### Phase 6: Plans & Scenarios (FIRE Planning)
**Priority: HIGH**

#### Goal
Build financial planning and scenario modeling features for FIRE (Financial Independence, Retire Early) planning.

#### Features to Implement

1. **Plans Page** (`/plans`)
   - List of user's financial plans
   - Create new plan wizard
   - Plan summary cards with key metrics
   - Plan comparison view

2. **Plan Creation/Edit Modal**
   - Plan name and description
   - Target retirement age (slider 40-75)
   - Target net worth goal
   - Target passive income goal
   - Risk tolerance setting (Conservative/Moderate/Aggressive)

3. **Scenario Builder**
   - Multiple scenarios per plan:
     - **Base Case**: Current trajectory
     - **Optimistic**: Higher returns, faster growth
     - **Conservative**: Lower returns, higher expenses
     - **Custom**: User-defined parameters
   - Adjustable parameters:
     - Asset growth rates
     - Salary growth rate
     - Inflation rate
     - Property appreciation
     - Contribution rates

4. **FIRE Calculator**
   - Calculate years to FIRE based on:
     - Current savings rate
     - Current net worth
     - Target FIRE number (25x annual expenses)
     - Expected investment returns
   - Display:
     - FIRE number target
     - Years to FIRE
     - Required monthly savings
     - Progress percentage

5. **Plan Timeline Visualization**
   - Timeline chart showing projected milestones
   - Key events (retirement, goal achievements)
   - Wealth accumulation path

#### Backend Resources (Already Exist)
- **Model**: `/app/backend/models/plan.py`
- **Routes**: `/app/backend/routes/plans.py`
- **API Endpoints**:
  - `GET /api/plans/types` - Get plan types
  - `GET /api/plans/portfolio/{portfolio_id}` - Get plans for portfolio
  - `POST /api/plans` - Create plan
  - `GET /api/plans/{id}` - Get plan details
  - `PUT /api/plans/{id}` - Update plan
  - `DELETE /api/plans/{id}` - Delete plan

#### Frontend Files to Create
```
/app/frontend/src/pages/PlansPage.jsx
/app/frontend/src/components/plans/PlanCard.jsx
/app/frontend/src/components/plans/PlanFormModal.jsx
/app/frontend/src/components/plans/PlanDetailsModal.jsx
/app/frontend/src/components/plans/ScenarioBuilder.jsx
/app/frontend/src/components/plans/FIRECalculator.jsx
/app/frontend/src/components/plans/PlanTimeline.jsx
```

#### Technical Considerations
- Use Recharts for timeline and projection charts
- Consider using React Hook Form for complex scenario forms
- Store scenarios as JSON within the plan document
- Calculate FIRE metrics client-side for responsiveness

---

### Phase 7: Projection Engine
**Priority: MEDIUM**

#### Goal
Build the core financial projection/simulation engine for accurate wealth forecasting.

#### Features to Implement

1. **Compound Growth Calculator**
   - Apply compound growth to assets
   - Account for contributions
   - Adjust for inflation
   - Support different compounding frequencies

2. **Property Projections**
   - Capital growth projections
   - Rental income growth
   - Loan paydown schedule
   - Equity accumulation over time

3. **Investment Return Projections**
   - Asset-class specific returns
   - Dividend reinvestment modeling
   - Dollar-cost averaging effects
   - Rebalancing scenarios

4. **Loan Amortization Engine**
   - Principal & Interest schedules
   - Interest-only period transitions
   - Offset account impact
   - Extra payment scenarios

5. **Tax Implications Modeling** (Australian-specific)
   - Negative gearing calculations
   - Capital gains tax projections
   - Super contribution tax benefits
   - HECS repayment thresholds

6. **Monte Carlo Simulations**
   - Random return variations
   - Confidence intervals (10th, 50th, 90th percentile)
   - Risk-adjusted projections
   - Sequence of returns risk modeling

7. **Multi-Year Projection Dashboard**
   - Year-by-year breakdown table
   - Net worth projection chart
   - Asset/liability projection stacks
   - Key milestone markers

#### Backend Implementation
Create new module: `/app/backend/utils/projections.py`

```python
# Suggested functions to implement:
def compound_growth(principal, rate, years, contributions=0, frequency='annual')
def amortization_schedule(principal, rate, term_years, payment_type='pi')
def project_property(property_data, years, growth_rate, rental_growth)
def monte_carlo_simulation(initial_value, mean_return, std_dev, years, simulations=1000)
def calculate_fire_number(annual_expenses, withdrawal_rate=0.04)
def calculate_years_to_fire(current_nw, annual_savings, target_nw, return_rate)
```

#### Frontend Files to Create
```
/app/frontend/src/components/projections/ProjectionChart.jsx
/app/frontend/src/components/projections/ProjectionTable.jsx
/app/frontend/src/components/projections/MonteCarloChart.jsx
/app/frontend/src/pages/ProjectionsPage.jsx
```

#### Technical Considerations
- Heavy calculations should be done on backend
- Use Web Workers for client-side Monte Carlo if needed
- Cache projection results to avoid recalculation
- Consider using numpy for efficient calculations

---

### Phase 8: Frontend Polish
**Priority: LOW**

#### Goal
Final UI/UX improvements, accessibility, and export features.

#### Features to Implement

1. **Dark Mode Toggle**
   - Add theme toggle in header/settings
   - Use Tailwind dark: classes
   - Persist preference in localStorage
   - System preference detection

2. **Data Export**
   - PDF Report Generation:
     - Net worth summary
     - Asset/liability breakdown
     - Projection charts
     - Plan summaries
   - CSV Exports:
     - Assets list
     - Liabilities list
     - Properties list
     - Transaction history
   - Consider using:
     - `jspdf` + `html2canvas` for PDF
     - Native CSV generation

3. **Loading States & Skeletons**
   - Skeleton loaders for:
     - Dashboard cards
     - Asset/liability grids
     - Charts
   - Loading spinners for actions
   - Optimistic UI updates

4. **Error Handling**
   - Toast notifications (using Sonner - already installed)
   - Form validation errors
   - API error messages
   - Retry mechanisms
   - Offline detection

5. **Responsive Design**
   - Mobile navigation (hamburger menu)
   - Responsive charts
   - Touch-friendly controls
   - Collapsible sidebar on mobile

6. **Accessibility**
   - ARIA labels on all interactive elements
   - Keyboard navigation
   - Focus management in modals
   - Screen reader support
   - Color contrast compliance

7. **Keyboard Shortcuts**
   - `N` - New item (context-aware)
   - `S` - Search focus
   - `Esc` - Close modals
   - `?` - Show shortcuts help

8. **Print-Friendly Views**
   - Print stylesheet
   - Simplified layouts for printing
   - QR code for digital access

#### Files to Modify/Create
```
/app/frontend/src/context/ThemeContext.jsx (new)
/app/frontend/src/components/ui/Skeleton.jsx (may exist)
/app/frontend/src/utils/exportPDF.js (new)
/app/frontend/src/utils/exportCSV.js (new)
/app/frontend/tailwind.config.js (add dark mode)
/app/frontend/src/App.css (print styles)
```

---

## 📁 KEY FILES REFERENCE

### Backend
```
/app/backend/server.py          # FastAPI main app
/app/backend/models/            # 9 Pydantic models
/app/backend/routes/            # 9 API route modules
/app/backend/utils/database.py  # MongoDB connection
/app/backend/utils/dev_user.py  # DEV_USER_ID = "dev-user-01"
```

### Frontend
```
/app/frontend/src/App.js                    # React routing
/app/frontend/src/services/api.js           # API client
/app/frontend/src/context/UserContext.jsx   # User state
/app/frontend/src/context/PortfolioContext.jsx # Portfolio state
/app/frontend/src/pages/DashboardNew.jsx    # Dashboard with charts
/app/frontend/src/components/layout/        # Sidebar, Header, MainLayout
```

---

## 🔧 QUICK START COMMANDS

```bash
# Check service status
sudo supervisorctl status

# Restart all services
sudo supervisorctl restart all

# View logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/frontend.out.log

# Test backend API
curl http://localhost:8001/api/health
curl http://localhost:8001/api/dashboard/summary

# Install new frontend dependencies
cd /app/frontend && yarn add <package-name>

# Install new backend dependencies
cd /app/backend && pip install <package> && pip freeze > requirements.txt
```

---

## 🎨 DESIGN SYSTEM

- **Primary Color**: Lime green `#84cc16` / `lime-400`
- **Background**: White/Gray `bg-gray-50`
- **Cards**: White with subtle borders and shadows
- **UI Framework**: Shadcn/UI components
- **Icons**: Lucide React
- **Charts**: Recharts

---

## ⚠️ IMPORTANT NOTES

1. **Dev Mode Active**: No authentication - using `DEV_USER_ID = "dev-user-01"`
2. **Don't modify .env files**: URLs and ports are pre-configured
3. **Use yarn, not npm**: `npm` causes breaking changes
4. **All API routes use `/api` prefix**: Required for Kubernetes ingress
5. **MongoDB ObjectID**: Use UUIDs instead (already implemented)
6. **Hot reload enabled**: Only restart for new dependencies

---

## 📊 CURRENT DATA STATE

Sample data exists in the database:
- **Portfolio**: "My Portfolio" (actual type)
- **Assets**: Emergency Fund ($50K), Superannuation ($150K), Vanguard VAS ($75K)
- **Liabilities**: HECS Debt ($35K)
- **Income**: Salary ($120K annual)
- **Expenses**: Rent ($2,500/month)
- **Net Worth**: $240,000
- **Savings Rate**: 75%

---

## 🚀 RECOMMENDED APPROACH

1. **Start with Phase 6** - Plans & Scenarios
   - Backend models/routes already exist
   - Build on existing patterns from Assets/Liabilities pages
   - Use Recharts (already installed) for visualizations

2. **Then Phase 7** - Projection Engine
   - Create backend utility functions first
   - Test with curl before building UI
   - Can be integrated into existing dashboard

3. **Finally Phase 8** - Polish
   - Lower priority
   - Can be done incrementally
   - Focus on most impactful features first

Good luck! 🎉
