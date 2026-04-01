# Propequitylab Codebase Data Flow Map 🗺️

This document provides a comprehensive end-to-end visual map of the Propequitylab codebase, illustrating how data flows through various layers of the application.

## 1. End-To-End Application Architecture

The following diagram shows the high-level flow from User Interaction to Database Persistence and back to the Frontend for visualization.

```mermaid
graph TD
    subgraph "Frontend Layer (React/Vite)"
        UI[User Interface Components]
        UC[Context Providers / Hooks]
        API[api.js Client]
        
        UI --> UC
        UC --> API
    end

    subgraph "Network Layer"
        API -->|HTTPS / Clerk Bearer JWT| LB[Load Balancer / Reverse Proxy]
    end

    subgraph "Backend Layer (FastAPI)"
        LB -->|Request| MAIN[server.py]
        MAIN -->|Auth Middleware| SEC[clerk_auth.py — JWKS verification]
        SEC -->|Validated Request| RT[App Routes / Controllers]
        RT -->|Logic / Math| UTIL[Financial Utils / Math]
        RT -->|SQLModel| DB[(PostgreSQL Database)]
    end

    subgraph "Data Services"
        DB -->|Aggregated Data| RT
        UTIL -->|Projections / KPIs| RT
    end

    RT -->|JSON Response| API
    API -->|State Update| UC
    UC -->|Re-render| UI
```

---

## 2. Specific Data Cycles

### A. Authentication & Security Flow
How we ensure only the right eyes see the right data.

Auth stack: **Clerk Core 2 SDK** — `@clerk/clerk-react` v5. The backend verifies Clerk-issued RS256 JWTs against Clerk's JWKS endpoint (`clerk_auth.py`). Legacy HS256 JWT mode is available when `CLERK_JWKS_URL` is unset.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Clerk
    participant Backend
    participant DB

    User->>Frontend: Sign in (Clerk <SignIn> widget)
    Frontend->>Clerk: Credential exchange
    Clerk-->>Frontend: RS256 JWT session token
    Frontend->>Backend: API request + Authorization: Bearer <token>
    Backend->>Clerk: Verify JWT via JWKS (cached 1h)
    Clerk-->>Backend: Public key / valid
    Backend->>DB: Lookup user by clerk_user_id
    DB-->>Backend: User record (auto-provisioned on first sign-in)
    Backend-->>Frontend: JSON response

    Note over Backend,DB: On first sign-in: auto-provisions User + Account + Subscription
    AuthRoute-->>Frontend: Set-Cookie (httpOnly) / Token JSON
    Frontend->>Frontend: Store Auth State (AuthContext)
```

### B. Portfolio & Property CRUD Lifecycle
The core journey of financial data.

```mermaid
flowchart LR
    Start([User Inputs Property Data]) --> Form[Property Wizard Form]
    Form --> Valid[Frontend Validation]
    Valid --> API[api.createProperty]
    API --> Route[POST /api/properties]
    Route --> Schema[Validate with Pydantic Schema]
    Schema --> Persist[SQLModel Instance]
    Persist --> DB[(Save to PostgreSQL)]
    DB --> Success{Success?}
    Success -->|Yes| Notify[Toast Notification]
    Success -->|No| Error[Error Handling]
```

### C. Financial Projection & Dashboard Aggregation
How raw numbers become insights.

```mermaid
graph TD
    DB[(PostgreSQL)] -->|Raw Rows| Agg[Backend Aggregator]
    
    subgraph "The Calculation Engine (FastAPI)"
        Agg -->|Summation| KPIs[Total Assets / Liabilities]
        Agg -->|Math Logic| NetWorth[Net Worth Calculation]
        Agg -->|Time Iteration| Proj[Future Projs / Compounds]
    end
    
    Proj -->|DashboardSummary| JSON[JSON Payload]
    JSON -->|Service Call| Dash[Dashboard Components]
    Dash -->|Recharts| Visual[Visual Charts & Graphs]
```

---

## 3. Core Component Mapping

| Layer | Responsibility | Key Files / Folders |
| :--- | :--- | :--- |
| **API Entry** | Application configuration & Security | `backend/server.py` |
| **Data Models** | Database schemas (SQLModel) | `backend/models/` |
| **Business Logic**| API Endpoints & CRUD operations | `backend/routes/` |
| **Financial Logic**| Interest rates, projections, math | `backend/utils/calculations.py` |
| **Frontend Core** | Application shell & Routing | `frontend/src/App.js` |
| **State Management**| Portfolio & Auth contexts | `frontend/src/context/` |
| **API Integration**| Axios client & centralized methods | `frontend/src/services/api.js` |
| **UI Kit** | Reusable Shadcn/custom components | `frontend/src/components/ui/` |

---

## 4. Key Data Models

Each user owns one or more **Portfolios**. 
Each **Portfolio** contains multiple entities:
- **Properties**: Purchase price, value, location.
- **Loans**: Linked to properties, interest rates.
- **Assets/Liabilities**: Cash, shares, other debts.
- **Income/Expenses**: Salary, rental yield vs maintenance, lifestyle.
- **Financial Plans**: Future scenarios and target outcomes.

---

> [!TIP]
> **Pro-Tip for Developers:** When adding a new feature, follow this flow:
> 1. Define the `SQLModel` in `backend/models/`.
> 2. Create the route in `backend/routes/`.
> 3. Add the API method in `frontend/src/services/api.js`.
> 4. Create the UI component in `frontend/src/components/`.
