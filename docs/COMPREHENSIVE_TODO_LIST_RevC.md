# ZAPIIO COMPREHENSIVE TODO LIST - REVISION C
## Serverless Fintech Architecture
## Generated: January 2026

---

## 📋 EXECUTIVE SUMMARY

**Project Status:** Core features complete (8/8 phases), pivoting to serverless fintech stack for production launch.

**Architecture Pivot:** Moving from MongoDB/Vercel to AWS App Runner (Python), Neon PostgreSQL, and Cloudflare Pages for high-integrity, low-latency performance.

**Current Blocker:** Database migration from MongoDB to PostgreSQL required. Authentication system needs SQL-based refactoring.

**Critical Path to Launch:**
1. Migrate database to Neon PostgreSQL (Phase 8C)
2. Implement SQL-based authentication (Phase 9A)
3. Enforce data isolation with SQL injection protection (Phase 9B)
4. Deploy to AWS App Runner + Cloudflare Pages (Phase 9E)

**Estimated Timeline:** 3-4 weeks to production launch

---

## 🎯 ARCHITECTURE OVERVIEW

### New Serverless Fintech Stack

**Backend:**
- **Runtime:** AWS App Runner (Python 3.11)
- **Region:** ap-southeast-2 (Sydney)
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** SQLModel (SQLAlchemy + Pydantic)
- **Cache/Rate Limiting:** Upstash Redis

**Frontend:**
- **Hosting:** Cloudflare Pages
- **Framework:** React 18 + Vite
- **API Proxy:** Cloudflare Workers

**CI/CD:**
- **Platform:** GitHub Actions
- **Testing:** pytest (backend), Jest (frontend)
- **Deployment:** Automated on PR merge

### Why This Stack?

1. **Financial Integrity:** PostgreSQL DECIMAL(19,4) for all currency fields (no float rounding errors)
2. **Low Latency:** AWS App Runner in Sydney + Cloudflare global CDN
3. **Scalability:** Serverless auto-scaling with provisioned concurrency
4. **Cost Efficiency:** Pay-per-use pricing, no idle costs
5. **Security:** SQL injection protection via ORM, distributed rate limiting

---

## 🟢 PHASE 8C: DATABASE MIGRATION (MONGO → POSTGRES)
**Priority:** P0 - Must complete before Phase 9A  
**Estimated Time:** 4-5 days  
**Dependencies:** Neon account, SQLModel, psycopg2

### Step 1: Neon PostgreSQL Setup

#### 1.1 Provision Neon Database
**Platform:** https://neon.tech

- [ ] Create Neon account
- [ ] Create new project: "zapiio-production"
- [ ] **CRITICAL:** Select region: **aws-ap-southeast-2** (Sydney)
- [ ] Note the connection string (pooled)
- [ ] Create database: `zapiio`
- [ ] Enable connection pooling (PgBouncer)
- [ ] Set minimum compute: 0.25 vCPU (auto-scale to 1 vCPU)

#### 1.2 Configure Environment Variables
**File:** `backend/.env`

```bash
# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-xxx.ap-southeast-2.aws.neon.tech/zapiio?sslmode=require
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20
DATABASE_POOL_TIMEOUT=30

# Legacy MongoDB (for migration only)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=zapiio
```

- [ ] Add these environment variables
- [ ] Test connection to Neon
- [ ] Verify SSL connection works

### Step 2: Refactor Backend Models

#### 2.1 Install SQLModel Dependencies
**File:** `backend/requirements.txt`

```txt
sqlmodel>=0.0.14
psycopg2-binary>=2.9.9
alembic>=1.13.0
```

- [ ] Add these dependencies to requirements.txt
- [ ] Run `pip install -r requirements.txt`
- [ ] Verify SQLModel installed correctly

#### 2.2 Create Database Connection Utility
**File:** `backend/utils/database.py` (REWRITE)

```python
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import QueuePool
import os

DATABASE_URL = os.getenv("DATABASE_URL")
POOL_SIZE = int(os.getenv("DATABASE_POOL_SIZE", "10"))
MAX_OVERFLOW = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))
POOL_TIMEOUT = int(os.getenv("DATABASE_POOL_TIMEOUT", "30"))

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    pool_pre_ping=True,  # Verify connections before using
    echo=False,  # Set to True for SQL query logging
    poolclass=QueuePool
)

def create_db_and_tables():
    """Create all database tables"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for FastAPI routes"""
    with Session(engine) as session:
        yield session
```

- [ ] Create this file
- [ ] Test connection to Neon
- [ ] Verify connection pooling works
- [ ] Test `create_db_and_tables()` function

#### 2.3 Refactor User Model
**File:** `backend/models/user.py` (REWRITE)

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class PlanningType(str, Enum):
    INDIVIDUAL = "individual"
    COUPLE = "couple"
    FAMILY = "family"

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: str = Field(primary_key=True, max_length=50)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    name: str = Field(max_length=255)
    
    # Profile
    planning_type: str = Field(default="individual", max_length=50)
    country: str = Field(default="Australia", max_length=100)
    state: str = Field(default="NSW", max_length=50)
    currency: str = Field(default="AUD", max_length=10)
    
    # Authentication
    is_verified: bool = Field(default=False)
    verification_token: Optional[str] = Field(default=None, max_length=255)
    reset_token: Optional[str] = Field(default=None, max_length=255)
    reset_token_expires: Optional[datetime] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

- [ ] Create this model
- [ ] Add Pydantic models: `UserCreate`, `UserLogin`, `UserResponse`
- [ ] Test model creation

#### 2.4 Refactor Portfolio Model
**File:** `backend/models/portfolio.py` (REWRITE)

⚠️ **CRITICAL:** Use `DECIMAL(19, 4)` for all currency fields. Do not use Floats.

```python
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL
from datetime import datetime
from typing import Optional
from decimal import Decimal

class Portfolio(SQLModel, table=True):
    __tablename__ = "portfolios"
    
    id: str = Field(primary_key=True, max_length=50)
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    
    # Financial Summary (DECIMAL for precision)
    total_property_value: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    total_loan_amount: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    total_equity: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    
    # Metadata
    is_primary: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

- [ ] **CRITICAL:** Create this model with DECIMAL(19, 4) for all currency fields
- [ ] Verify no float types are used
- [ ] Test model creation
- [ ] Add relationships to properties, income, expenses

#### 2.5 Refactor Property Model
**File:** `backend/models/property.py` (REWRITE)

⚠️ **CRITICAL:** Ensure all currency fields (loan_amount, property_value, cashflow) use DECIMAL(19, 4) precision.

```python
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL
from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from enum import Enum

class PropertyType(str, Enum):
    HOUSE = "house"
    APARTMENT = "apartment"
    TOWNHOUSE = "townhouse"
    LAND = "land"
    COMMERCIAL = "commercial"

class Property(SQLModel, table=True):
    __tablename__ = "properties"
    
    id: str = Field(primary_key=True, max_length=50)
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    portfolio_id: str = Field(foreign_key="portfolios.id", index=True, max_length=50)
    
    # Basic Info
    name: str = Field(max_length=255)
    property_type: str = Field(max_length=50)
    address: str = Field(max_length=500)
    
    # Financial (DECIMAL for precision)
    purchase_price: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    current_value: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    loan_amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    interest_rate: Decimal = Field(sa_column=Column(DECIMAL(5, 2)))  # e.g., 5.25%
    
    # Rental Income (DECIMAL for precision)
    rental_income_weekly: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    
    # Dates
    purchase_date: date
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

- [ ] **CRITICAL:** Create this model with DECIMAL(19, 4) for all currency fields
- [ ] Use DECIMAL(5, 2) for percentages (interest_rate)
- [ ] Verify no float types are used
- [ ] Test model creation

#### 2.6 Refactor Remaining Models
**Files:** `backend/models/*.py`

Apply the same DECIMAL pattern to all financial models:

- [ ] **Income Model** - Use DECIMAL(19, 4) for `amount`, `annual_amount`
- [ ] **Expense Model** - Use DECIMAL(19, 4) for `amount`, `annual_amount`
- [ ] **Asset Model** - Use DECIMAL(19, 4) for `current_value`, `purchase_price`
- [ ] **Liability Model** - Use DECIMAL(19, 4) for `balance`, `interest_rate`
- [ ] **Plan Model** - Use DECIMAL(19, 4) for `target_amount`, `current_amount`
- [ ] **NetWorthSnapshot Model** - Use DECIMAL(19, 4) for all financial fields

⚠️ **CRITICAL:** Never use `float` or `Float` for currency. Always use `Decimal` with `DECIMAL(19, 4)`.

### Step 3: Create ETL Migration Script

#### 3.1 ETL Script (Extract, Transform, Load)
**File:** `backend/scripts/migrate_mongo_to_postgres.py` (NEW FILE)

- [ ] Create ETL script to extract JSON data from local MongoDB
- [ ] Transform MongoDB documents to SQL schema
- [ ] Convert all numeric currency values to Decimal
- [ ] Load data into Neon PostgreSQL
- [ ] Verify data integrity after migration
- [ ] Create summary report of migrated records

**Key Functions:**
```python
def to_decimal(value, default="0.0000"):
    """Convert any numeric value to Decimal"""
    if value is None:
        return Decimal(default)
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))

async def migrate_users():
    """Migrate users collection"""
    # Extract from MongoDB
    # Transform to SQLModel
    # Load into PostgreSQL

async def migrate_portfolios():
    """Migrate portfolios collection"""
    # Extract from MongoDB
    # Transform to SQLModel with DECIMAL fields
    # Load into PostgreSQL

# Similar functions for all 9 collections
```

- [ ] Create migration script with all collection migrations
- [ ] Test with sample data
- [ ] Run full migration: `python backend/scripts/migrate_mongo_to_postgres.py`
- [ ] Verify all records migrated successfully

#### 3.2 Verify Migration
**Commands:**

```bash
# Connect to Neon database
psql $DATABASE_URL

# Check table counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'portfolios', COUNT(*) FROM portfolios
UNION ALL
SELECT 'properties', COUNT(*) FROM properties;

# Verify DECIMAL precision
\d properties
# Should show: purchase_price | numeric(19,4)
```

- [ ] Verify all data migrated
- [ ] **CRITICAL:** Check DECIMAL precision on all currency fields
- [ ] Verify foreign key relationships
- [ ] Test queries for performance
- [ ] Create indexes on frequently queried fields

### Step 4: Update All Route Files

#### 4.1 Refactor Routes to Use SQLModel
**Pattern for all route files:**

```python
# OLD (MongoDB)
from utils.database import db
portfolios = await db.portfolios.find({"user_id": user_id}).to_list(None)

# NEW (PostgreSQL + SQLModel)
from utils.database import get_session
from models.portfolio import Portfolio
from sqlmodel import Session, select

@router.get("/portfolios")
def get_portfolios(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Portfolio).where(Portfolio.user_id == current_user.id)
    portfolios = session.exec(statement).all()
    return portfolios
```

Apply to all route files:

- [ ] `backend/routes/portfolios.py`
- [ ] `backend/routes/properties.py`
- [ ] `backend/routes/income.py`
- [ ] `backend/routes/expenses.py`
- [ ] `backend/routes/assets.py`
- [ ] `backend/routes/liabilities.py`
- [ ] `backend/routes/plans.py`
- [ ] `backend/routes/dashboard.py`
- [ ] `backend/routes/onboarding.py`

⚠️ **CRITICAL:** Use SQLModel ORM methods exclusively. Never use raw SQL strings.

---

## 🔴 PHASE 9A: AUTHENTICATION & USER MANAGEMENT (SQL-BASED)
**Priority:** P0 - Must complete after Phase 8C  
**Estimated Time:** 3-4 days  
**Dependencies:** Phase 8C completion, SQLModel User model

### Step 1: Backend Auth Infrastructure

#### 1.1 User Model (Already Created in Phase 8C)
**File:** `backend/models/user.py`

- [x] SQLModel User table with all auth fields
- [x] Password hash field
- [x] Email verification fields
- [x] Password reset fields
- [x] Timestamps

#### 1.2 Create Auth Utilities
**File:** `backend/utils/auth.py` (NEW FILE)

```python
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from utils.database import get_session
from models.user import User
import os

# Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def validate_password_strength(password: str) -> Tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain number"
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain special character"
    return True, ""

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str, token_type: str = "access") -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != token_type:
            raise HTTPException(status_code=401, detail=f"Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    token = credentials.credentials
    payload = verify_token(token, token_type="access")
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
```

- [ ] Create this file
- [ ] Test password hashing
- [ ] Test JWT token creation
- [ ] Test `get_current_user` dependency
- [ ] Verify tokens expire correctly

#### 1.3 Rate Limiting with Redis
**File:** `backend/utils/rate_limiter.py` (UPDATE)

⚠️ **CRITICAL:** Provision Redis (Upstash/Railway) for distributed rate limiting and token blacklisting.

```python
import os
import redis
from fastapi import Request, HTTPException, status

REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
    raise ValueError("⚠️ REDIS_URL environment variable required for production")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host

async def check_rate_limit(key: str, max_requests: int, window_seconds: int) -> bool:
    current = redis_client.get(key)
    
    if current is None:
        redis_client.setex(key, window_seconds, 1)
        return True
    
    if int(current) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {window_seconds} seconds."
        )
    
    redis_client.incr(key)
    return True

async def rate_limit_login(request: Request):
    ip = get_client_ip(request)
    await check_rate_limit(f"login:{ip}", max_requests=5, window_seconds=900)

async def rate_limit_register(request: Request):
    ip = get_client_ip(request)
    await check_rate_limit(f"register:{ip}", max_requests=3, window_seconds=3600)

async def rate_limit_password_reset(request: Request):
    ip = get_client_ip(request)
    await check_rate_limit(f"reset:{ip}", max_requests=3, window_seconds=3600)
```

- [ ] **CRITICAL:** Provision Redis instance (Upstash recommended: https://upstash.com)
- [ ] Set `REDIS_URL` environment variable
- [ ] Update rate limiter to use Redis
- [ ] Test rate limiting with multiple requests
- [ ] Verify rate limits work across multiple server instances

### Step 2: Authentication Routes

#### 2.1 Create Auth Router
**File:** `backend/routes/auth.py` (UPDATE for SQLModel)

- [ ] Update all auth endpoints to use SQLModel
- [ ] Use `session.exec(select(User).where(...))` instead of MongoDB queries
- [ ] Test registration with PostgreSQL
- [ ] Test login with PostgreSQL
- [ ] Test token refresh
- [ ] Verify rate limiting works
- [ ] Test email verification flow
- [ ] Test password reset flow

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login with JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend verification

---

## 🔴 PHASE 9B: SECURITY & DATA ISOLATION (SQL INJECTION PROTECTION)
**Priority:** P0 - Must complete after Phase 9A  
**Estimated Time:** 2-3 days  
**Dependencies:** Phase 9A completion

### Step 1: SQL Injection Protection

#### 1.1 Security Principles

⚠️ **CRITICAL:** Use SQLModel/ORM methods exclusively to prevent SQL Injection. Validate all inputs with Pydantic.

**SAFE (ORM-based):**
```python
# SQLModel automatically parameterizes queries
statement = select(User).where(User.email == user_email)
user = session.exec(statement).first()
```

**UNSAFE (Raw SQL - NEVER DO THIS):**
```python
# Vulnerable to SQL injection
query = f"SELECT * FROM users WHERE email = '{user_email}'"
result = session.execute(query)
```

#### 1.2 Input Validation
**File:** `backend/utils/validation.py` (NEW FILE)

```python
from pydantic import BaseModel, validator, EmailStr
from decimal import Decimal
from typing import Optional

class PropertyCreate(BaseModel):
    name: str
    purchase_price: Decimal
    current_value: Decimal
    
    @validator('purchase_price', 'current_value')
    def validate_positive(cls, v):
        if v < 0:
            raise ValueError('Value must be positive')
        return v
    
    @validator('name')
    def validate_name_length(cls, v):
        if len(v) < 2 or len(v) > 255:
            raise ValueError('Name must be 2-255 characters')
        return v

class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v
```

- [ ] Create validation utilities
- [ ] Add Pydantic models for all create/update operations
- [ ] Validate all numeric inputs (must be positive, within range)
- [ ] Validate all string inputs (length, format)
- [ ] Never trust user input

#### 1.3 Update All Routes with SQL Injection Protection

Apply to all route files:

- [ ] **CRITICAL:** Use SQLModel ORM methods exclusively
- [ ] Never use raw SQL strings
- [ ] Never use f-strings in queries
- [ ] Validate all inputs with Pydantic
- [ ] Use parameterized queries (automatic with SQLModel)

**Example Pattern:**
```python
@router.get("/portfolios/{portfolio_id}")
def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # SAFE: SQLModel automatically parameterizes
    statement = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    )
    portfolio = session.exec(statement).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    return portfolio
```

### Step 2: Data Isolation

#### 2.1 Enforce User Ownership
**Pattern for all routes:**

- [ ] Add `user_id` filter to ALL queries
- [ ] Verify users can only access their own data
- [ ] Test with multiple users
- [ ] Test unauthorized access attempts
- [ ] Return 404 (not 403) for unauthorized access to prevent data leakage

**Apply to all routes:**
- [ ] `backend/routes/portfolios.py` - Filter by `Portfolio.user_id == current_user.id`
- [ ] `backend/routes/properties.py` - Filter by `Property.user_id == current_user.id`
- [ ] `backend/routes/income.py` - Filter by `Income.user_id == current_user.id`
- [ ] `backend/routes/expenses.py` - Filter by `Expense.user_id == current_user.id`
- [ ] `backend/routes/assets.py` - Filter by `Asset.user_id == current_user.id`
- [ ] `backend/routes/liabilities.py` - Filter by `Liability.user_id == current_user.id`
- [ ] `backend/routes/plans.py` - Filter by `Plan.user_id == current_user.id`
- [ ] `backend/routes/dashboard.py` - Filter all queries by `user_id`
- [ ] `backend/routes/onboarding.py` - Filter by `user_id`

---

## 🟡 PHASE 9C: FRONTEND AUTHENTICATION INTEGRATION
**Priority:** P1 - Required for user-facing features  
**Estimated Time:** 2-3 days  
**Dependencies:** Phase 9A, 9B completion

### Step 1: API Service Updates

#### 1.1 Request Interceptor with Race Condition Fix
**File:** `frontend/src/services/api.js` (UPDATE)

⚠️ **CRITICAL:** Implement 'Request Queueing' in API interceptor to handle multiple simultaneous 401 errors (prevents logout loops).

```javascript
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Request queueing for race condition prevention
let isRefreshing = false;
let failedRequestsQueue = [];

const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with request queueing
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('accessToken', newAccessToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

- [ ] **CRITICAL:** Implement request queueing as shown above
- [ ] Test with 5 simultaneous API calls
- [ ] Verify only ONE refresh attempt is made
- [ ] Verify all 5 requests succeed after refresh
- [ ] Verify user is NOT logged out

### Step 2: Authentication Pages

#### 2.1 Login Page
**File:** `frontend/src/pages/Login.jsx` (ALREADY CREATED)

- [x] Login form with email/password
- [x] Error handling
- [x] Loading states
- [x] Redirect after login

#### 2.2 Register Page
**File:** `frontend/src/pages/Register.jsx` (ALREADY CREATED)

- [x] Registration form
- [x] Password strength validation
- [x] Client-side validation
- [x] Redirect after registration

#### 2.3 Protected Routes
**File:** `frontend/src/components/ProtectedRoute.jsx` (ALREADY CREATED)

- [x] Authentication check
- [x] Redirect to login
- [x] Preserve intended destination

---

## 🟡 PHASE 9E: PRODUCTION DEPLOYMENT (SERVERLESS STACK)
**Priority:** P1 - Required for launch  
**Estimated Time:** 3-4 days  
**Dependencies:** Phases 8C, 9A, 9B, 9C completion

### Step 1: Backend Deployment (AWS App Runner)

#### 1.1 Dockerize FastAPI Application
**File:** `backend/Dockerfile` (NEW FILE)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health')"

# Run application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
```

- [ ] Create Dockerfile
- [ ] Test Docker build locally: `docker build -t zapiio-backend .`
- [ ] Test Docker run locally: `docker run -p 8000:8000 zapiio-backend`
- [ ] Verify health check works

#### 1.2 Deploy to AWS App Runner
**Platform:** AWS Console or AWS CLI

**Configuration:**
- [ ] Create App Runner service: "zapiio-backend-production"
- [ ] **CRITICAL:** Region: **ap-southeast-2** (Sydney)
- [ ] Source: GitHub repository (automatic deployment)
- [ ] Build: Dockerfile
- [ ] Instance: 1 vCPU, 2 GB RAM
- [ ] **CRITICAL:** Set **Provisioned Concurrency = 1** (eliminates cold starts)
- [ ] Auto-scaling: Min 1, Max 5 instances
- [ ] Health check: `/api/health`

**Environment Variables:**
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.ap-southeast-2.aws.neon.tech/zapiio
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=Zapiio <noreply@zapiio.com>
FRONTEND_URL=https://zapiio.pages.dev
CORS_ORIGINS=https://zapiio.pages.dev,https://www.zapiio.com
ENABLE_RATE_LIMITING=True
```

- [ ] Deploy to App Runner
- [ ] **CRITICAL:** Set provisioned concurrency = 1
- [ ] Configure environment variables
- [ ] Test health endpoint
- [ ] Note the App Runner URL (e.g., `https://xxx.ap-southeast-2.awsapprunner.com`)

#### 1.3 Configure Database Connection
**Neon Pooled Connection:**

- [ ] Use Neon's **Pooled Connection String** (PgBouncer)
- [ ] Set `DATABASE_POOL_SIZE=10`
- [ ] Set `DATABASE_MAX_OVERFLOW=20`
- [ ] Enable `pool_pre_ping=True` (verify connections)
- [ ] Test connection from App Runner

### Step 2: Frontend Deployment (Cloudflare Pages)

#### 2.1 Build Configuration
**File:** `frontend/package.json` (UPDATE)

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**File:** `frontend/.env.production` (NEW FILE)

```bash
REACT_APP_API_URL=https://xxx.ap-southeast-2.awsapprunner.com/api
```

- [ ] Create production environment file
- [ ] Set API URL to App Runner endpoint
- [ ] Test production build locally: `npm run build`

#### 2.2 Deploy to Cloudflare Pages
**Platform:** https://pages.cloudflare.com

**Configuration:**
- [ ] Connect GitHub repository
- [ ] Project name: "zapiio"
- [ ] Production branch: `main`
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist`
- [ ] Root directory: `frontend`
- [ ] Node version: 18

**Environment Variables:**
```bash
REACT_APP_API_URL=https://xxx.ap-southeast-2.awsapprunner.com/api
```

- [ ] Deploy to Cloudflare Pages
- [ ] Configure environment variables
- [ ] Test deployment
- [ ] Note the Cloudflare Pages URL (e.g., `https://zapiio.pages.dev`)

### Step 3: CI/CD Pipeline (GitHub Actions)

#### 3.1 Backend CI/CD
**File:** `.github/workflows/backend-ci.yml` (NEW FILE)

⚠️ **CRITICAL:** Configure GitHub Actions to run pytest suite on every Push/PR before allowing deployment.

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: zapiio_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/zapiio_test
          JWT_SECRET_KEY: test-secret-key
        run: |
          cd backend
          pytest tests/ -v
      
      - name: Deploy to App Runner
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          # App Runner automatically deploys from GitHub
          echo "App Runner will auto-deploy"
```

- [ ] **CRITICAL:** Create this workflow file
- [ ] Add backend tests
- [ ] Test CI pipeline
- [ ] Verify deployment only happens after tests pass

#### 3.2 Frontend CI/CD
**File:** `.github/workflows/frontend-ci.yml` (NEW FILE)

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm test
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Deploy to Cloudflare Pages
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          # Cloudflare Pages automatically deploys from GitHub
          echo "Cloudflare Pages will auto-deploy"
```

- [ ] Create this workflow file
- [ ] Add frontend tests
- [ ] Test CI pipeline
- [ ] Verify deployment only happens after tests pass

### Step 4: Monitoring & Observability

#### 4.1 AWS App Runner Monitoring
- [ ] Enable CloudWatch Logs
- [ ] Set up log retention (30 days)
- [ ] Create CloudWatch alarms:
  - High error rate (>5%)
  - High response time (>2s)
  - Low health check success rate (<95%)

#### 4.2 Neon Monitoring
- [ ] Enable Neon metrics dashboard
- [ ] Monitor connection pool usage
- [ ] Set up alerts for:
  - High connection count
  - Slow queries (>1s)
  - Database size approaching limit

#### 4.3 Cloudflare Analytics
- [ ] Enable Cloudflare Web Analytics
- [ ] Monitor page load times
- [ ] Track API request patterns
- [ ] Set up alerts for downtime

---

## 🔴 PHASE 9D: EMAIL SERVICE INTEGRATION
**Priority:** P1 - Required for user verification  
**Estimated Time:** 1-2 days  
**Dependencies:** Resend account

### Email Service Setup

**File:** `backend/utils/email.py` (ALREADY CREATED)

- [x] Resend API integration
- [x] Email templates (verification, password reset, welcome)
- [x] Email simulation mode for development

**Configuration:**
- [ ] Sign up for Resend: https://resend.com
- [ ] Verify sending domain
- [ ] Set `RESEND_API_KEY` environment variable
- [ ] Set `FROM_EMAIL` to verified domain
- [ ] Test email delivery

---

## 🔴 PHASE 9F: LEGAL & COMPLIANCE
**Priority:** P2 - Required before public launch  
**Estimated Time:** 1-2 days  
**Dependencies:** Legal review

### Legal Pages

- [ ] Create Privacy Policy page
- [ ] Create Terms of Service page
- [ ] Create Cookie Policy page
- [ ] Add GDPR compliance features:
  - [ ] Data export functionality
  - [ ] Account deletion functionality
  - [ ] Cookie consent banner

---

## 🟡 PHASE 9G: TESTING & QA
**Priority:** P1 - Required before launch  
**Estimated Time:** 2-3 days  
**Dependencies:** All previous phases

### Testing Checklist

#### Backend Tests
- [ ] Unit tests for all models
- [ ] Unit tests for all utilities
- [ ] Integration tests for all API endpoints
- [ ] Test authentication flow
- [ ] Test data isolation
- [ ] Test SQL injection prevention
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Test DECIMAL precision for currency fields

#### Frontend Tests
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Test authentication flow
- [ ] Test protected routes
- [ ] Test request queueing
- [ ] Test error handling

#### Performance Tests
- [ ] Load testing with k6
- [ ] Database query optimization
- [ ] API response time (<200ms)
- [ ] Frontend bundle size (<500KB)

#### Security Tests
- [ ] OWASP Top 10 vulnerabilities
- [ ] SQL injection attempts
- [ ] XSS attempts
- [ ] CSRF protection
- [ ] Rate limiting verification

---

## 🟢 PHASE 9H: LAUNCH PREPARATION
**Priority:** P0 - Final step before launch  
**Estimated Time:** 1 day  
**Dependencies:** All previous phases

### Pre-Launch Checklist

#### Configuration
- [ ] All environment variables set correctly
- [ ] JWT secret key is strong and unique
- [ ] Database backups enabled
- [ ] Redis persistence enabled
- [ ] CORS configured for production domains only
- [ ] HTTPS enforced
- [ ] Security headers configured

#### Monitoring
- [ ] CloudWatch alarms configured
- [ ] Neon monitoring enabled
- [ ] Cloudflare analytics enabled
- [ ] Error tracking (Sentry) configured
- [ ] Uptime monitoring (UptimeRobot) configured

#### Documentation
- [ ] API documentation updated
- [ ] README updated
- [ ] Deployment guide created
- [ ] Troubleshooting guide created

#### Final Tests
- [ ] Complete user journey test (register → login → use app)
- [ ] Test email delivery
- [ ] Test password reset
- [ ] Test all major features
- [ ] Test on multiple devices/browsers
- [ ] Verify DECIMAL precision on all currency calculations

#### Launch
- [ ] Soft launch to beta users
- [ ] Monitor for errors
- [ ] Gather feedback
- [ ] Fix critical issues
- [ ] Public launch 🚀

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Cloudflare Pages (React Frontend)                 │     │
│  │  - Global CDN                                      │     │
│  │  - Automatic HTTPS                                 │     │
│  │  - DDoS Protection                                 │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS APP RUNNER                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  FastAPI Backend (Python 3.11)                     │     │
│  │  - Region: ap-southeast-2 (Sydney)                 │     │
│  │  - Provisioned Concurrency: 1                      │     │
│  │  - Auto-scaling: 1-5 instances                     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
          │                                    │
          │                                    │
          ▼                                    ▼
┌──────────────────────┐           ┌──────────────────────┐
│  NEON POSTGRESQL     │           │  UPSTASH REDIS       │
│  - Serverless        │           │  - Rate Limiting     │
│  - Sydney Region     │           │  - Token Blacklist   │
│  - Connection Pool   │           │  - Session Cache     │
│  - DECIMAL(19,4)     │           └──────────────────────┘
└──────────────────────┘
```

---

## 🎯 SUCCESS CRITERIA

### Performance
- [ ] API response time <200ms (p95)
- [ ] Database query time <50ms (p95)
- [ ] Frontend load time <2s (p95)
- [ ] Zero cold starts (provisioned concurrency)

### Security
- [ ] **CRITICAL:** All currency fields use DECIMAL(19,4)
- [ ] SQL injection protection verified
- [ ] Rate limiting active on all auth endpoints
- [ ] JWT tokens expire correctly
- [ ] Data isolation enforced

### Reliability
- [ ] 99.9% uptime
- [ ] Automatic failover
- [ ] Database backups daily
- [ ] Zero data loss

### Scalability
- [ ] Auto-scaling to 5 instances
- [ ] Connection pooling optimized
- [ ] CDN caching configured
- [ ] Redis distributed caching

---

## 📚 REFERENCE LINKS

### Services
- **Neon PostgreSQL:** https://neon.tech
- **AWS App Runner:** https://aws.amazon.com/apprunner/
- **Cloudflare Pages:** https://pages.cloudflare.com
- **Upstash Redis:** https://upstash.com
- **Resend Email:** https://resend.com

### Documentation
- **SQLModel:** https://sqlmodel.tiangolo.com
- **FastAPI:** https://fastapi.tiangolo.com
- **React:** https://react.dev
- **PostgreSQL DECIMAL:** https://www.postgresql.org/docs/current/datatype-numeric.html

---

**Document Version:** Revision C  
**Last Updated:** January 2026  
**Architecture:** Serverless Fintech Stack  
**Status:** Ready for Implementation
