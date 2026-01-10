# PropEquityLab Clone - Full Stack Implementation Plan

## Executive Summary
Transform the current frontend-only PropEquityLab clone into a fully functional property investment portfolio management platform with complete backend infrastructure, user authentication, data persistence, and scenario modeling capabilities.

---

## Phase 1: Core Infrastructure & Authentication (2-3 days)

### 1.1 Database Schema Design

```
Collections:
├── users
│   ├── _id, email, password_hash, name, avatar_url
│   ├── created_at, updated_at, last_login
│   └── subscription_tier (free/pro/enterprise)
│
├── portfolios
│   ├── _id, name, type (actual/scenario), owner_id
│   ├── members[] (user_id, role, invited_at)
│   ├── settings (default_growth_rate, default_interest_rate)
│   └── created_at, updated_at
│
├── properties
│   ├── _id, portfolio_id, address, suburb, state, postcode
│   ├── property_type, bedrooms, bathrooms, car_spaces
│   ├── purchase_price, purchase_date, current_value
│   ├── loan_amount, interest_rate, loan_type, loan_term
│   ├── rental_income, rental_frequency
│   ├── expenses{} (strata, council, water, insurance, maintenance, management)
│   ├── growth_assumptions{} (capital_growth_rate, rental_growth_rate)
│   └── created_at, updated_at
│
├── scenarios
│   ├── _id, portfolio_id, name, description
│   ├── base_scenario_id (null if original)
│   ├── modifications[] (property_id, field, original_value, new_value)
│   ├── is_active, created_by
│   └── created_at, updated_at
│
└── forecasts (cached calculations)
    ├── _id, portfolio_id, scenario_id
    ├── time_range, calculation_date
    ├── yearly_data[] (year, total_value, debt, equity, cashflow, yields)
    └── summary{} (goal_year, total_return, avg_yield)
```

### 1.2 Authentication System

**Endpoints:**
```
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login (JWT)
POST   /api/auth/logout       - Invalidate token
POST   /api/auth/refresh      - Refresh JWT token
GET    /api/auth/me           - Get current user
PUT    /api/auth/profile      - Update profile
POST   /api/auth/forgot       - Password reset request
POST   /api/auth/reset        - Password reset confirm
```

**Security:**
- JWT tokens with 15-minute expiry + refresh tokens
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Email verification (optional Phase 2)

---

## Phase 2: Portfolio & Property Management (3-4 days)

### 2.1 Portfolio CRUD

**Endpoints:**
```
GET    /api/portfolios              - List user's portfolios
POST   /api/portfolios              - Create portfolio
GET    /api/portfolios/:id          - Get portfolio details
PUT    /api/portfolios/:id          - Update portfolio
DELETE /api/portfolios/:id          - Delete portfolio
GET    /api/portfolios/:id/summary  - Get portfolio summary stats
```

**Business Logic:**
- Calculate portfolio summary on-the-fly or from cache
- Support for "Actual" (real data) and "Scenario" (what-if) types
- Soft delete with data retention

### 2.2 Property CRUD

**Endpoints:**
```
GET    /api/portfolios/:id/properties     - List properties in portfolio
POST   /api/portfolios/:id/properties     - Add property
GET    /api/properties/:id                - Get property details
PUT    /api/properties/:id                - Update property
DELETE /api/properties/:id                - Remove property
POST   /api/properties/:id/duplicate      - Clone property
```

**Property Calculations:**
```python
# Key calculations per property
annual_rental_income = rental_income * frequency_multiplier
annual_expenses = sum(all_expenses)
net_rental_income = annual_rental_income - annual_expenses
loan_repayment = calculate_repayment(loan_amount, interest_rate, loan_type)
annual_cashflow = net_rental_income - loan_repayment
gross_yield = (annual_rental_income / current_value) * 100
net_yield = (net_rental_income / current_value) * 100
equity = current_value - loan_amount
```

### 2.3 Member Management

**Endpoints:**
```
GET    /api/portfolios/:id/members        - List members
POST   /api/portfolios/:id/members        - Invite member
PUT    /api/portfolios/:id/members/:uid   - Update member role
DELETE /api/portfolios/:id/members/:uid   - Remove member
POST   /api/invitations/:token/accept     - Accept invitation
```

**Roles:**
- `owner` - Full control, can delete portfolio
- `admin` - Can add/edit properties, invite members
- `member` - View only, can create personal scenarios

---

## Phase 3: Scenario Engine (3-4 days)

### 3.1 Scenario Management

**Endpoints:**
```
GET    /api/portfolios/:id/scenarios      - List scenarios
POST   /api/portfolios/:id/scenarios      - Create scenario
GET    /api/scenarios/:id                 - Get scenario details
PUT    /api/scenarios/:id                 - Update scenario
DELETE /api/scenarios/:id                 - Delete scenario
POST   /api/scenarios/:id/clone           - Clone scenario
POST   /api/scenarios/:id/apply           - Apply scenario to actual
```

**Scenario Types:**
1. **Interest Rate Change** - What if rates go up/down?
2. **Property Addition** - What if I buy another property?
3. **Property Sale** - What if I sell a property?
4. **Rental Adjustment** - What if rent increases/decreases?
5. **Growth Rate Change** - What if market grows faster/slower?
6. **Loan Restructure** - What if I refinance?

### 3.2 Scenario Modification Structure

```python
class ScenarioModification:
    property_id: str          # null for portfolio-wide changes
    modification_type: str    # 'update', 'add', 'remove'
    field: str               # 'interest_rate', 'rental_income', etc.
    original_value: Any
    new_value: Any
    start_year: int          # When modification takes effect
    end_year: int            # null for permanent
```

### 3.3 Comparison View

**Endpoints:**
```
GET /api/portfolios/:id/compare?scenarios=id1,id2,id3
```

Returns side-by-side comparison data for multiple scenarios.

---

## Phase 4: Forecast & Projection Engine (2-3 days)

### 4.1 Forecast Calculation

**Endpoints:**
```
GET  /api/portfolios/:id/forecast?years=30&scenario=:sid
POST /api/portfolios/:id/forecast/refresh   - Force recalculate
GET  /api/portfolios/:id/forecast/export    - Export to CSV/PDF
```

### 4.2 Projection Algorithm

```python
def calculate_forecast(portfolio, scenario, years):
    projections = []
    
    for year in range(current_year, current_year + years + 1):
        year_data = {
            'year': year,
            'fiscal_year': f'FY{year}',
            'properties': []
        }
        
        total_value = 0
        total_debt = 0
        total_rental = 0
        total_expenses = 0
        
        for property in portfolio.properties:
            # Apply scenario modifications
            prop_data = apply_scenario_mods(property, scenario, year)
            
            # Calculate property projections
            years_held = year - prop_data.purchase_year
            
            # Value growth
            projected_value = prop_data.current_value * (
                (1 + prop_data.capital_growth_rate) ** years_held
            )
            
            # Rental growth
            projected_rental = prop_data.annual_rental * (
                (1 + prop_data.rental_growth_rate) ** years_held
            )
            
            # Loan amortization
            if prop_data.loan_type == 'P&I':
                remaining_loan = calculate_remaining_loan(
                    prop_data.loan_amount,
                    prop_data.interest_rate,
                    years_held
                )
            else:
                remaining_loan = prop_data.loan_amount
            
            # Accumulate totals
            total_value += projected_value
            total_debt += remaining_loan
            total_rental += projected_rental
            total_expenses += project_expenses(prop_data, years_held)
        
        year_data['total_value'] = total_value
        year_data['debt'] = total_debt
        year_data['equity'] = total_value - total_debt
        year_data['gross_yield'] = (total_rental / total_value) * 100
        year_data['net_yield'] = ((total_rental - total_expenses) / total_value) * 100
        year_data['cashflow'] = total_rental - total_expenses - loan_payments
        
        projections.append(year_data)
    
    return projections
```

### 4.3 Goal Tracking

```python
def calculate_goal_year(portfolio, target_equity):
    """Find year when equity reaches target"""
    forecast = calculate_forecast(portfolio, None, 50)
    
    for year_data in forecast:
        if year_data['equity'] >= target_equity:
            return year_data['fiscal_year']
    
    return 'Beyond 50 years'
```

---

## Phase 5: Frontend Integration (2-3 days)

### 5.1 API Service Layer

```javascript
// /src/services/api.js
const API = {
  // Auth
  login: (email, password) => post('/auth/login', { email, password }),
  register: (data) => post('/auth/register', data),
  
  // Portfolios
  getPortfolios: () => get('/portfolios'),
  createPortfolio: (data) => post('/portfolios', data),
  getPortfolio: (id) => get(`/portfolios/${id}`),
  
  // Properties
  addProperty: (portfolioId, data) => post(`/portfolios/${portfolioId}/properties`, data),
  updateProperty: (id, data) => put(`/properties/${id}`, data),
  
  // Scenarios
  getScenarios: (portfolioId) => get(`/portfolios/${portfolioId}/scenarios`),
  createScenario: (portfolioId, data) => post(`/portfolios/${portfolioId}/scenarios`, data),
  
  // Forecasts
  getForecast: (portfolioId, years, scenarioId) => 
    get(`/portfolios/${portfolioId}/forecast?years=${years}&scenario=${scenarioId}`)
};
```

### 5.2 State Management

```javascript
// Using React Context or Zustand
const usePortfolioStore = create((set) => ({
  portfolios: [],
  currentPortfolio: null,
  scenarios: [],
  forecast: [],
  
  fetchPortfolios: async () => { ... },
  setCurrentPortfolio: (id) => { ... },
  addProperty: async (data) => { ... },
  createScenario: async (data) => { ... },
  updateForecast: async (years) => { ... }
}));
```

### 5.3 Component Updates

| Component | Changes Required |
|-----------|------------------|
| `Dashboard.jsx` | Connect to portfolio API, real-time stats |
| `PortfolioStats.jsx` | Fetch from `/portfolio/summary` |
| `ProjectionChart.jsx` | Use forecast API data |
| `ForecastTable.jsx` | Paginated API data |
| `AddPropertyModal.jsx` | POST to properties API |
| `Login.jsx` | JWT authentication flow |

---

## Phase 6: Advanced Features (Optional, 3-5 days)

### 6.1 Australian Property Data Integration

```python
# External API integrations
- CoreLogic API - Property valuations
- Domain API - Rental estimates  
- ABS API - Suburb growth data
- RBA API - Interest rate data
```

### 6.2 Reports & Export

```
GET /api/portfolios/:id/reports/summary     - Executive summary
GET /api/portfolios/:id/reports/detailed    - Full report
GET /api/portfolios/:id/export?format=pdf   - PDF export
GET /api/portfolios/:id/export?format=csv   - CSV export
```

### 6.3 Notifications & Alerts

```python
# Alert triggers
- Interest rate changes
- Property value milestones
- Goal achievement
- Scenario comparison alerts
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React + TailwindCSS + Shadcn/UI + React Query              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│  FastAPI + JWT Auth + Rate Limiting                         │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic                            │
│  ├── Auth Service                                           │
│  ├── Portfolio Service                                      │
│  ├── Property Service                                       │
│  ├── Scenario Service                                       │
│  └── Forecast Engine                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  MongoDB (Primary) + Redis (Caching)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## API Contracts Summary

### Authentication
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/auth/register` | `{email, password, name}` | `{user, token}` |
| POST | `/api/auth/login` | `{email, password}` | `{user, token, refresh_token}` |

### Portfolios
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/portfolios` | - | `[{id, name, type, summary}]` |
| POST | `/api/portfolios` | `{name, type}` | `{portfolio}` |
| GET | `/api/portfolios/:id/summary` | - | `{properties, totalValue, debt, equity, goalYear}` |

### Properties
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/portfolios/:id/properties` | `{address, suburb, ...}` | `{property}` |
| PUT | `/api/properties/:id` | `{field: value}` | `{property}` |

### Scenarios
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/portfolios/:id/scenarios` | `{name, modifications[]}` | `{scenario}` |
| GET | `/api/scenarios/:id/forecast` | `?years=30` | `{yearlyData[]}` |

### Forecasts
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/portfolios/:id/forecast` | `?years=30&scenario=id` | `{yearlyData[], summary}` |

---

## Implementation Timeline

| Phase | Description | Duration | Dependencies |
|-------|-------------|----------|--------------|
| 1 | Infrastructure & Auth | 2-3 days | None |
| 2 | Portfolio & Property CRUD | 3-4 days | Phase 1 |
| 3 | Scenario Engine | 3-4 days | Phase 2 |
| 4 | Forecast Engine | 2-3 days | Phase 2, 3 |
| 5 | Frontend Integration | 2-3 days | Phase 1-4 |
| 6 | Advanced Features | 3-5 days | Phase 1-5 |

**Total Estimated Time: 15-22 days**

---

## File Structure

```
/app
├── backend/
│   ├── server.py              # FastAPI app entry
│   ├── config.py              # Environment config
│   ├── database.py            # MongoDB connection
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── portfolio.py
│   │   ├── property.py
│   │   ├── scenario.py
│   │   └── forecast.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── portfolios.py
│   │   ├── properties.py
│   │   ├── scenarios.py
│   │   └── forecasts.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── portfolio_service.py
│   │   ├── property_service.py
│   │   ├── scenario_service.py
│   │   └── forecast_engine.py
│   │
│   └── utils/
│       ├── security.py        # JWT, hashing
│       ├── calculations.py    # Financial formulas
│       └── validators.py      # Input validation
│
└── frontend/
    └── src/
        ├── services/
        │   └── api.js         # API client
        ├── stores/
        │   └── useStore.js    # State management
        ├── hooks/
        │   ├── useAuth.js
        │   ├── usePortfolio.js
        │   └── useForecast.js
        └── pages/
            └── (existing)
```

---

## Next Steps

1. **Confirm scope** - Which phases do you want to implement first?
2. **Authentication preference** - JWT only or add Google OAuth?
3. **Scenario complexity** - Basic (single modifications) or advanced (compound scenarios)?
4. **External integrations** - Need real Australian property data APIs?

Ready to begin implementation when you give the go-ahead!
