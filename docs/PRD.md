# Product Requirements Document (PRD): PropEquityLab

## 1. Executive Summary

**PropEquityLab** is a specialized financial planning and forecasting platform designed specifically for Australian property investors and FIRE (Financial Independence, Retire Early) aspirants. Unlike generic financial tools, PropEquityLab fills a critical gap in the market by offering deep, localised modeling for property portfolios, including granular handling of rental income, expenses, and loan structures, alongside traditional assets like Superannuation, ETFs, and Crypto.

The platform provides a comprehensive "wealth dashboard" that allows users to visualize their current net worth, project future growth, and model various "What If" scenarios (e.g., "What if I retire at 45?", "What if property grows at 7%?"). It empowers users to move away from complex, error-prone spreadsheets to a secure, automated, and professional-grade projection engine.

**MVP Goal**: To launch a fully functional, secure, and user-friendly web application that enables users to onboard their financial data, visualize their net worth, and run basic FIRE projections. The MVP targets the "Alpha" release stage, focusing on core data integrity, security (Auth/Data Isolation), and a polished user experience.

## 2. Mission

**Mission Statement**: To democratize professional-grade financial modeling for Australian property investors, empowering them to make data-driven decisions on their path to financial independence.

**Core Principles**:
*   **Precision**: Financial calculations must be accurate and relevant to the Australian context (e.g., Super, negative gearing concepts).
*   **Privacy First**: User data is isolated, secured, and owned by the user.
*   **Clarity**: Complex financial data should be presented through intuitive, beautiful visualizations ("Emerald & Wealth" theme).
*   **Empowerment**: Users should feel in control of their financial future through interactive scenario planning.

## 3. Target Users

**Primary Persona: The Property-Focused FIRE Aspirant**
*   **Profile**: Australians aged 25-45 who own or aspire to own investment properties.
*   **Technical Comfort**: Moderate to High. They likely use spreadsheets (Excel/Google Sheets) currently and demand granular control.
*   **Needs**:
    *   Consolidating scattered financial info (Properties, Super, Shares, Loans).
    *   Forecasting when they can retire (FIRE number).
    *   Understanding the impact of property growth vs. rental yield.
*   **Pain Points**:
    *   Spreadsheets are hard to maintain and prone to errors.
    *   Generic apps (Mint, PocketSmith) don't handle property equity or Australian tax nuances well.
    *   Lack of visualization for long-term compounding.

## 4. MVP Scope

The MVP is defined by the features currently implemented in Phases 1-9F.

### In Scope (MVP) ✅
*   **Core Infrastructure**:
    *   ✅ FastAPI Backend (Python) with SQLModel & PostgreSQL (Neon).
    *   ✅ React Frontend (Vite/CRA) with Tailwind CSS & Shadcn/UI.
    *   ✅ Cloudflare Pages (Frontend) & AWS App Runner (Backend) hosting.
*   **User Management & Security**:
    *   ✅ JWT-based Authentication (Login, Register, Password Reset).
    *   ✅ Email Verification (Resend API).
    *   ✅ Data Isolation (User-scoped interactions).
    *   ✅ Rate Limiting & Security Headers (CORS, HSTS).
*   **Financial Modeling**:
    *   ✅ 9 Core Data Models (Income, Expenses, Assets, Liabilities, Properties, etc.).
    *   ✅ Comprehensive Onboarding Wizard (8 steps).
    *   ✅ Property Portfolio Management ("Self-Servicing" metrics, LVR).
    *   ✅ FIRE Calculator & Projection Engine (Compound growth, inflation-adjusted, withdrawal strategies).
*   **Visualization**:
    *   ✅ Interactive Dashboard (Net Worth, Asset Allocation, Cashflow Charts).
    *   ✅ "Emerald & Wealth" UI Theme (Dark/Light mode support).
*   **Legal & Compliance**:
    *   ✅ Privacy Policy & Terms of Service (GDPR compliant).

### Out of Scope (deferred) ❌
*   ❌ Monte Carlo Simulations.
*   ❌ Automated Bank Feeds / Open Banking.
*   ❌ CoreLogic/Domain Property Data Integration (AVM).
*   ❌ Native Mobile App (PWA planned for future).
*   ❌ Complex Tax Modeling (CGT, detailed Negative Gearing - simplified versions only).
*   ❌ PDF/CSV Exports (Phase 11).

## 5. User Stories

### Core User Stories
1.  **Onboarding**: *"As a new user, I want to quickly input my current financial snapshot (properties, income, debts) through a guided wizard so that I can immediately see my Net Worth and estimated FIRE age."*
2.  **Property Management**: *"As a property investor, I want to record detailed metrics for each property (rental income, management fees, mortgage rates) so that I can see which properties are 'self-servicing' and their individual LVR."*
3.  **FIRE Projection**: *"As a FIRE aspirant, I want to project my net worth 30 years into the future using different growth rates and inflation assumptions so that I know if I'm on track to retire at 45."*
4.  **Scenario Planning**: *"As a planner, I want to create a copy of my current portfolio and simulate selling a property to buy ETFs so that I can compare the long-term outcome against holding."*
5.  **Security**: *"As a privacy-conscious user, I want to ensure my financial data is encrypted and only accessible by me, with secure login and email verification."*

## 6. Core Architecture & Patterns

**High-Level Architecture**:
*   **Frontend**: Single Page Application (SPA) built with React. Hosted on **Cloudflare Pages** for edge performance.
    *   **Pattern**: Context API for global state (`AuthContext`, `PortfolioContext`, `ThemeContext`), Reusable Components (`shadcn/ui`), Modular Layouts (`MainLayout`, `DashboardLayout`).
*   **Backend**: RESTful API built with **FastAPI** (Python). Hosted on **AWS App Runner** as a Docker container.
    *   **Pattern**: Service-Repository pattern (Routes -> CRUD Modules -> Database). Dependency Injection for User Authentication.
*   **Database**: **PostgreSQL** (via Neon Serverless).
    *   **Pattern**: **SQLModel** (Pydantic + SQLAlchemy) for ORM. Strict schema validation.
*   **Security**: "Defense-in-Depth".
    *   **Layer 1**: Cloudflare WAF / DNS.
    *   **Layer 2**: Application Rate Limiting (Redis + SlowAPI).
    *   **Layer 3**: JWT Authentication Middleware.
    *   **Layer 4**: Row-Level Data Isolation (User ID filtering on every query).

**Directory Structure**:
*   `/app/frontend`: React codebase.
*   `/app/backend`: FastAPI application.
*   `/docs`: Comprehensive project documentation.

## 7. Technology Stack

### Frontend
*   **Framework**: React 18
*   **Build Tool**: Vite / Create React App (migration implied)
*   **Styling**: Tailwind CSS, Shadcn/UI, Lucide React (Icons)
*   **State Management**: React Context, Hooks
*   **Visualization**: Recharts
*   **Utilities**: Axios, Date-fns, Zod

### Backend
*   **Framework**: FastAPI (Python 3.11+)
*   **ORM**: SQLModel (SQLAlchemy + Pydantic)
*   **Database**: PostgreSQL (Neon)
*   **Authentication**: PyJWT, Passlib (Bcrypt)
*   **Validation**: Pydantic
*   **Tasks/Caching**: Redis (for rate limiting)

### Infrastructure & Services
*   **Hosting**: Cloudflare Pages (Frontend), AWS App Runner (Backend)
*   **Email**: Resend API
*   **Monitoring**: UptimeRobot, Sentry (Frontend/Backend)

## 8. Security & Configuration

**Authentication**:
*   JWT (JSON Web Tokens) with Access (short-lived) and Refresh (long-lived) tokens.
*   HttpOnly cookies or Secure LocalStorage (currently implementation uses LocalStorage with auto-refresh).
*   Bcrypt password hashing.

**Configuration**:
*   Environment variables managed via `.env` (local) and Cloud Provider Secrets (Production).
*   Key Vars: `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `REACT_APP_API_URL`.

**Security Scope**:
*   **In-Scope**: SQL Injection prevention (SQLModel), XSS (React sanitization), CSRF (Standard protections), Rate Limiting.
*   **Out-of-Scope**: Biometric auth, Hardware key support (YubiKey).

## 9. API Specification

The API follows strict REST principles.

**Key Endpoints**:
*   `POST /api/auth/register`: Create new user & send verification.
*   `POST /api/auth/login`: Authenticate & receive tokens.
*   `GET /api/portfolios/me`: Get full portfolio hierarchy for current user.
*   `POST /api/plans/project`: Run projection engine for a specific plan.
*   `CRUD /api/properties`, `/api/income`, `/api/liabilities`, etc.

**Response Format**: JSON. Standardized error envelopes `{ "detail": "message" }`.

## 10. Success Criteria

**MVP Success Definition**:
*   Successfully deploy to Production (Live URL accessible).
*   Pass "Day 4" User Acceptance Testing (Manual checklist).
*   Zero Critical Security Vulnerabilities (Audit clean).
*   Email Verification flow functioning 100%.

**Quality Indicators**:
*   **Performance**: < 400ms API response time.
*   **Availability**: 99.9% Uptime.
*   **Code Quality**: All linting passed, strict typing (Python hints/React PropTypes).

## 11. Implementation Phases & Status

### Phase 1-8: Core Features ✅ (Complete)
*   Foundation, Database, 9 Models, API, Dashboard, Onboarding, Projections.
*   ✅ **New Feature**: Portfolio Scenario Planning (Phase 1).

### Phase 9: Production Readiness 🟡 (In Progress)
*   ✅ **9A: Auth**: JWT, Login/Register pages.
*   ✅ **9B: Security**: Data isolation, Rate limiting.
*   ✅ **9C: Email**: Resend integration.
*   ✅ **9F: Legal**: Privacy/Terms pages.
*   ✅ **9E: Monitoring**: Sentry/UptimeRobot (Complete).
*   🟡 **9D: Onboarding Polish**: Welcome modal, sample data (In Progress).

### Phase 10+: Post-Launch 🔮 (Planned)
*   Advanced Tax, Monte Carlo, Mobile App.

## 12. Risks & Mitigations

1.  **Risk**: Calculation Inaccuracy.
    *   *Mitigation*: Extensive manual testing (Day 4 Checklist) against known spreadsheets. "Alpha" label to set user expectations.
2.  **Risk**: Login Reliability (Network Errors).
    *   *Mitigation*: Deep debugging of Auth Context and API Client (Current Active Task).
2.  **Risk**: Data Loss.
    *   *Mitigation*: PostgreSQL Point-in-Time Recovery (Neon), Daily Snapshots.
3.  **Risk**: Security Breach.
    *   *Mitigation*: Strict Row-Level Security logic (Double-filter pattern), Rate limiting, Security Headers, Regular audits.
4.  **Risk**: User Confusion (Complexity).
    *   *Mitigation*: "Quick Start" onboarding option, Tooltips, "Emerald" theme redesign for better visual hierarchy.

## 13. Appendix

*   **Repository**: [Project Repository Link]
*   **Documentation**:
    *   [docs/README.md](./README.md)
    *   [docs/plans/IMPLEMENTATION_STATUS.md](./plans/IMPLEMENTATION_STATUS.md)
    *   [docs/plans/PROPEQUITY_LAB_DESIGN_IMPLEMENTATION_PLAN.md](./plans/PROPEQUITY_LAB_DESIGN_IMPLEMENTATION_PLAN.md)
