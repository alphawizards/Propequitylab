# Phase 0: Local Development Setup Guide

**Status:** 📋 Ready to Execute
**Date:** 2026-01-11
**Estimated Time:** 30-60 minutes

---

## 🎯 Goal

Get the PropEquityLab backend running locally so you can:
1. Test API endpoints
2. Develop new features
3. Run database migrations
4. Debug issues before deployment

---

## ✅ Prerequisites

### Required Software

1. **Python 3.11+** ✅ (You have 3.11.9)
2. **PostgreSQL 15+** ❓ (Need to install or use Neon.tech)
3. **Git** ✅ (Already installed)

---

## 🔧 Setup Steps

### Step 1: Database Setup

You have **two options**:

#### Option A: Use Neon.tech (Recommended - Free & Easy)

1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project called "propequitylab-dev"
4. Copy the connection string (looks like: `postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb`)
5. Update `backend/.env` file:
   ```bash
   DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb
   ```

**Advantages:**
- ✅ No local installation required
- ✅ Free tier (512 MB storage, plenty for development)
- ✅ Automatic backups
- ✅ Can access from anywhere

#### Option B: Local PostgreSQL

1. Download PostgreSQL 15: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your postgres password
4. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE propequitylab;
   \q
   ```
5. Update `backend/.env` file:
   ```bash
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/propequitylab
   ```

**Advantages:**
- ✅ Full control
- ✅ Works offline
- ✅ Faster (no network latency)

---

### Step 2: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Expected packages:**
- fastapi
- uvicorn
- sqlmodel
- psycopg2-binary
- python-jose
- passlib
- python-multipart
- slowapi
- python-dotenv
- alembic

---

### Step 3: Run Database Migrations

The backend already has **all Phase 1-3 models defined** in `models/financials.py`. We just need to create the database tables.

```bash
# Generate migration (if not already done)
cd backend
alembic revision --autogenerate -m "Add financial models for property forecasting"

# Apply migration
alembic upgrade head
```

**Expected output:**
```
INFO  [alembic.runtime.migration] Running upgrade -> xxxxx, Add financial models
INFO  [alembic.runtime.migration] Creating tables: loans, property_valuations, ...
```

**Tables that will be created (13 new tables):**
1. `loans`
2. `extra_repayments`
3. `lump_sum_payments`
4. `interest_rate_forecasts`
5. `property_valuations`
6. `growth_rate_periods`
7. `rental_income`
8. `expense_logs`
9. `depreciation_schedules`
10. `capital_expenditures`
11. `property_usage_periods`
12. `property_ownerships`
13. `property_drafts`

---

### Step 4: Start the Backend Server

```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Will watch for changes in these directories: ['C:\\Users\\...\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Starting up PropEquityLab API (Serverless Fintech Stack)...
INFO:     ✅ Database tables verified/created
INFO:     Application startup complete.
```

---

### Step 5: Test the API

Open a new terminal and test endpoints:

#### Test 1: Health Check
```bash
curl http://localhost:8000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "stack": "PostgreSQL + App Runner"
}
```

#### Test 2: Register a User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"SecurePass123!\",\"name\":\"Test User\"}"
```

**Expected response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

#### Test 3: Get User Profile
```bash
# Save the access_token from above
ACCESS_TOKEN="your-access-token-here"

curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected response:**
```json
{
  "id": "...",
  "email": "test@example.com",
  "name": "Test User",
  "onboarding_completed": false,
  "created_at": "2026-01-11T..."
}
```

#### Test 4: Create a Portfolio
```bash
curl -X POST http://localhost:8000/api/portfolios \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"My First Portfolio\",\"type\":\"personal\"}"
```

---

### Step 6: Access API Documentation

FastAPI automatically generates interactive API docs:

1. **Swagger UI:** http://localhost:8000/docs
2. **ReDoc:** http://localhost:8000/redoc

You can test all API endpoints directly from the browser!

---

## 🔍 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'X'"

**Solution:** Install missing package
```bash
pip install X
```

### Error: "Connection refused" or "Could not connect to database"

**Solution:** Check your DATABASE_URL in `.env`
```bash
# Test connection manually
python -c "from utils.database_sql import test_connection; test_connection()"
```

### Error: "Table already exists"

**Solution:** Database tables were created but migration failed. Reset:
```bash
alembic downgrade base
alembic upgrade head
```

### Error: "JWT token expired"

**Solution:** Get a new token by logging in again

### Port 8000 already in use

**Solution:** Use a different port
```bash
uvicorn server:app --reload --port 8001
```

Or find and kill the process using port 8000:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

---

## 📊 Verify All Endpoints

Once the server is running, verify all 56 endpoints are accessible:

### Auth Endpoints (7)
- ✅ POST `/api/auth/register`
- ✅ POST `/api/auth/login`
- ✅ POST `/api/auth/refresh`
- ✅ POST `/api/auth/logout`
- ✅ GET `/api/auth/me`
- ✅ POST `/api/auth/password-reset`
- ✅ POST `/api/auth/password-reset/confirm`

### Portfolio Endpoints (5)
- ✅ GET `/api/portfolios`
- ✅ GET `/api/portfolios/{id}`
- ✅ POST `/api/portfolios`
- ✅ PUT `/api/portfolios/{id}`
- ✅ DELETE `/api/portfolios/{id}`

### Property Endpoints (5)
- ✅ GET `/api/properties`
- ✅ GET `/api/properties/{id}`
- ✅ POST `/api/properties`
- ✅ PUT `/api/properties/{id}`
- ✅ DELETE `/api/properties/{id}`

### Income Endpoints (5)
- ✅ GET `/api/income`
- ✅ GET `/api/income/{id}`
- ✅ POST `/api/income`
- ✅ PUT `/api/income/{id}`
- ✅ DELETE `/api/income/{id}`

### Expense Endpoints (5)
- ✅ GET `/api/expenses`
- ✅ GET `/api/expenses/{id}`
- ✅ POST `/api/expenses`
- ✅ PUT `/api/expenses/{id}`
- ✅ DELETE `/api/expenses/{id}`

### Asset Endpoints (5)
- ✅ GET `/api/assets`
- ✅ GET `/api/assets/{id}`
- ✅ POST `/api/assets`
- ✅ PUT `/api/assets/{id}`
- ✅ DELETE `/api/assets/{id}`

### Liability Endpoints (5)
- ✅ GET `/api/liabilities`
- ✅ GET `/api/liabilities/{id}`
- ✅ POST `/api/liabilities`
- ✅ PUT `/api/liabilities/{id}`
- ✅ DELETE `/api/liabilities/{id}`

### Plan Endpoints (5)
- ✅ GET `/api/plans`
- ✅ GET `/api/plans/{id}`
- ✅ POST `/api/plans`
- ✅ PUT `/api/plans/{id}`
- ✅ DELETE `/api/plans/{id}`

### Onboarding Endpoints (4)
- ✅ GET `/api/onboarding/status`
- ✅ POST `/api/onboarding/complete`
- ✅ POST `/api/onboarding/skip`
- ✅ POST `/api/onboarding/reset`

### Dashboard Endpoints (1)
- ✅ GET `/api/dashboard/summary`

### **Phase 1-3 Endpoints (Already Implemented!)**

### Loan Endpoints (5)
- ✅ GET `/api/loans/property/{property_id}`
- ✅ GET `/api/loans/{id}`
- ✅ POST `/api/loans`
- ✅ PUT `/api/loans/{id}`
- ✅ DELETE `/api/loans/{id}`

### Valuation Endpoints (4)
- ✅ GET `/api/valuations/property/{property_id}`
- ✅ GET `/api/valuations/property/{property_id}/latest`
- ✅ POST `/api/valuations`
- ✅ DELETE `/api/valuations/{id}`

### Projection Endpoints (3)
- ✅ GET `/api/projections/{property_id}`
- ✅ GET `/api/projections/portfolio/{portfolio_id}`
- ✅ GET `/api/projections/property/{property_id}/summary`

**Total:** 59 endpoints (3 more than expected!)

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ Server starts without errors
2. ✅ `/api/health` returns `{"status": "healthy"}`
3. ✅ Can register a new user
4. ✅ Can login and get tokens
5. ✅ Can access protected endpoints with token
6. ✅ Swagger UI shows all endpoints at http://localhost:8000/docs
7. ✅ Database has 13+ tables created

---

## 🚀 Next Steps

Once local backend is running:

1. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The frontend is configured to connect to `http://localhost:8000/api` automatically.

2. **Test the full stack:**
   - Register a user
   - Create a portfolio
   - Add a property
   - Create a loan for the property
   - View projections

3. **Check production deployment:**
   - Verify AWS App Runner service status
   - Test production API endpoints
   - Check CloudWatch logs for errors

---

## 📋 Environment Variables Reference

All environment variables are documented in [backend/.env.example](../backend/.env.example).

**Critical variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (must be secure!)
- `CORS_ORIGINS` - Allowed frontend origins
- `ENVIRONMENT` - development/staging/production

**Optional variables:**
- Email settings (for password reset)
- AWS credentials (for S3 uploads)
- Rate limiting configuration
- Feature flags

---

## 🔐 Security Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use different JWT_SECRET for production** - Generate a new one
3. **Restrict CORS_ORIGINS in production** - Only allow your frontend domain
4. **Use HTTPS in production** - HTTP is only for local development
5. **Enable email verification in production** - Set `ENABLE_EMAIL_VERIFICATION=true`

---

## 📞 Getting Help

If you encounter issues:

1. **Check the logs** - The uvicorn output will show errors
2. **Check the database** - Use a tool like pgAdmin or DBeaver
3. **Test individual components:**
   ```bash
   # Test database connection
   python -c "from utils.database_sql import test_connection; test_connection()"

   # Test JWT token generation
   python -c "from utils.auth import create_access_token; print(create_access_token({'user_id': '123'}))"
   ```
4. **Check GitHub Actions** - See if production deployment succeeded
5. **Review the Phase 0 Diagnosis** - See [PHASE_0_DIAGNOSIS.md](PHASE_0_DIAGNOSIS.md)

---

*Setup guide created: 2026-01-11*
*Last updated: 2026-01-11*
