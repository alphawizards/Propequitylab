# PropEquityLab - AI Agent Guide

This document provides essential information for AI coding agents working on the PropEquityLab project.

---

## Project Overview

**PropEquityLab** is a property investment portfolio management platform that helps users track their property investments, analyze cash flow, and forecast portfolio growth. The application provides tools for:

- Property portfolio management and tracking
- Financial forecasting and projections
- Loan management and mortgage calculations
- Income and expense tracking
- Scenario modeling (Pro feature)
- Net worth analysis

The platform uses a modern fintech stack with a FastAPI backend and React frontend.

---

## Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | FastAPI (Python 3.11) |
| Database | PostgreSQL (Neon.tech) |
| ORM | SQLModel (SQLAlchemy 2.0) |
| Migrations | Alembic |
| Authentication | JWT (python-jose) + bcrypt |
| Rate Limiting | SlowAPI |
| Error Tracking | Sentry SDK |
| Email | Resend |
| Testing | pytest + pytest-asyncio |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 19 |
| Build Tool | Create React App + CRACO |
| Styling | Tailwind CSS 3.4 |
| UI Components | Radix UI + shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Error Tracking | Sentry React |
| Deployment | Cloudflare Pages (wrangler) |

---

## Project Structure

```
Propequitylab/
├── backend/                    # FastAPI backend
│   ├── alembic/               # Database migrations
│   │   └── versions/          # Migration files
│   ├── models/                # SQLModel database models
│   │   ├── user.py            # User model
│   │   ├── portfolio.py       # Portfolio model
│   │   ├── property.py        # Property model
│   │   ├── financials.py      # Loans, valuations, projections
│   │   └── ...
│   ├── routes/                # FastAPI route handlers
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── portfolios.py      # Portfolio CRUD
│   │   ├── properties.py      # Property CRUD
│   │   ├── projections.py     # Financial projections
│   │   ├── loans.py           # Loan management
│   │   └── ...
│   ├── utils/                 # Utility functions
│   │   ├── auth.py            # JWT, password hashing
│   │   ├── database_sql.py    # Database connection
│   │   ├── calculations.py    # Financial calculations
│   │   ├── email.py           # Email sending
│   │   └── sentry_config.py   # Error monitoring
│   ├── server.py              # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Container configuration
│   └── .env                   # Environment variables (not in git)
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components (46 files)
│   │   │   ├── dashboard/    # Dashboard-specific components
│   │   │   ├── properties/   # Property-related components
│   │   │   ├── onboarding/   # Onboarding wizard
│   │   │   └── ...
│   │   ├── context/          # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── UserContext.jsx
│   │   │   └── PortfolioContext.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── DashboardNew.jsx
│   │   │   ├── ProjectionsPage.jsx
│   │   │   └── ...
│   │   ├── services/         # API client
│   │   │   └── api.js        # All API calls (856 lines)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── App.js            # Main application
│   │   └── index.js          # Entry point
│   ├── public/               # Static assets
│   ├── build/                # Production build output
│   ├── package.json          # NPM dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── craco.config.js       # CRACO configuration
│   ├── components.json       # shadcn/ui config
│   └── wrangler.jsonc        # Cloudflare deployment config
│
├── tests/                     # Test suite
│   ├── conftest.py           # pytest configuration & fixtures
│   ├── integration/          # Integration tests
│   │   ├── test_health.py
│   │   ├── legacy_test_assets.py
│   │   └── ...
│   └── backend_test.py       # Standalone backend tests
│
├── docs/                      # Documentation
│   ├── architecture/         # Architecture docs
│   ├── setup/                # Setup guides
│   ├── guides/               # Development guides
│   └── ...
│
└── scripts/                   # Automation scripts
    └── start_ralph.sh
```

---

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Neon.tech account)

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and other secrets

# 5. Run database migrations
alembic upgrade head

# 6. Start development server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/api/health`

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your REACT_APP_API_URL

# 4. Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

---

## Build Commands

### Backend
```bash
# Run server (development)
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Run server (production)
uvicorn server:app --host 0.0.0.0 --port 8000

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
alembic downgrade -1

# Docker build
docker build -t propequitylab-backend .
docker run -p 8000:8000 propequitylab-backend
```

### Frontend
```bash
# Development
npm start

# Production build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy build
```

---

## Testing

### Backend Tests
```bash
# Run all tests
cd tests
pytest

# Run with coverage
pytest --cov=backend

# Run specific test file
pytest integration/test_health.py

# Run with verbose output
pytest -v
```

### Test Configuration
- Tests use SQLite in-memory database via `conftest.py`
- Fixtures provide test users, portfolios, and auth tokens
- Tests use FastAPI TestClient for HTTP requests

---

## Code Style Guidelines

### Python (Backend)
- **Formatter**: Black
- **Import Sorter**: isort
- **Linter**: flake8
- **Type Checker**: mypy (optional but recommended)

```bash
# Format code
black backend/
isort backend/

# Lint
flake8 backend/
```

#### Python Conventions
- Use type hints for function signatures
- Use SQLModel for all database models
- Use `Decimal` (DECIMAL(19, 4)) for all currency fields
- Use async/await for I/O operations
- Follow PEP 8 naming conventions
- Add docstrings to all public functions/classes

### JavaScript/React (Frontend)
- **Linter**: ESLint with React plugins
- Use functional components with hooks
- Use JSX for component files
- Use Tailwind classes for styling
- Use Radix UI primitives for accessibility
- Follow React Hooks rules (exhaustive-deps)

```bash
# Lint
npm run lint
```

---

## Key Architecture Patterns

### Database Models (SQLModel)
All models use SQLModel with SQLAlchemy 2.0:

```python
from sqlmodel import SQLModel, Field
from sqlalchemy import DECIMAL
from decimal import Decimal

class Portfolio(SQLModel, table=True):
    __tablename__ = "portfolios"
    
    id: str = Field(primary_key=True, max_length=50)
    user_id: str = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=255)
    # Financial fields use DECIMAL for precision
    total_equity: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
```

### API Routes (FastAPI)
```python
from fastapi import APIRouter, Depends
from sqlmodel import Session

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])

@router.get("/{portfolio_id}")
async def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Implementation
```

### Frontend API Client
All API calls are centralized in `frontend/src/services/api.js`:

```javascript
import api from '../services/api';

// Usage in components
const portfolios = await api.getPortfolios();
```

The API client includes:
- Automatic token attachment
- Token refresh on 401 errors
- Request/response interceptors

---

## Security Considerations

### Authentication
- JWT tokens with 30-minute access token expiry
- 7-day refresh token expiry
- Password hashing with bcrypt
- Email verification required (configurable)
- Rate limiting on auth endpoints

### Environment Variables (NEVER commit these)
```bash
# Critical
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=your-secure-secret
SENTRY_DSN=https://...

# Email
RESEND_API_KEY=re_...

# AWS (if used)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Security Headers
The backend implements:
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### CORS
Allowed origins are configured via `CORS_ORIGINS` environment variable. In production, only specific domains are allowed.

### GDPR Compliance
- User data export endpoint (`/api/gdpr/export-data`)
- Account deletion endpoint (`/api/gdpr/delete-account`)
- Data summary endpoint (`/api/gdpr/data-summary`)
- Sentry configured with `send_default_pii=False`

---

## Common Development Tasks

### Adding a New API Endpoint
1. Define request/response models in `models/`
2. Add route handler in `routes/`
3. Include router in `server.py`
4. Add API function in `frontend/src/services/api.js`
5. Create migration if database schema changes

### Adding a Database Model
1. Create model in `backend/models/`
2. Import in `models/__init__.py`
3. Generate migration: `alembic revision --autogenerate -m "Add X model"`
4. Apply migration: `alembic upgrade head`

### Adding a Frontend Page
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.js`
3. Add navigation link if needed
4. Create reusable components in `frontend/src/components/`

---

## Deployment

### Backend (AWS App Runner)
- Containerized with Dockerfile
- Environment variables configured in App Runner console
- Auto-deploys from GitHub Actions (if configured)

### Frontend (Cloudflare Pages)
- Built with `npm run build`
- Deployed with Wrangler: `npx wrangler pages deploy build`
- SPA routing configured in `wrangler.jsonc`

---

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
python -c "from utils.database_sql import test_connection; print(test_connection())"
```

### Migration Issues
```bash
# Reset migrations
alembic downgrade base
alembic upgrade head

# Check current version
alembic current
```

### Frontend Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Additional Documentation

- Phase setup guides: `docs/setup/`
- Architecture docs: `docs/architecture/`
- Sentry setup: `SENTRY_SETUP_GUIDE.md`
- Settings page: `SETTINGS_PAGE_COMPLETE.md`

---

## Contact & Support

For issues or questions:
1. Check existing documentation in `docs/`
2. Review test files for usage examples
3. Check Swagger UI at `/docs` for API details

---

*Last updated: 2026-02-05*
