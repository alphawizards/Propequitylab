# Backend 500 Error - Debugging Guide

## Current Status

**Frontend**: ✅ Deployed successfully on Cloudflare Pages
**Backend**: ❌ Login endpoint returning 500 Internal Server Error
**CORS**: ✅ Working correctly (OPTIONS preflight succeeds)

## Error Details

- **Endpoint**: `POST /api/auth/login`
- **Status**: 500 Internal Server Error
- **Frontend URL**: https://propequitylab.com
- **Backend URL**: [Your AWS App Runner URL]

## Root Cause Analysis

The browser shows "Network Error" with CORS violation, but the **actual issue is a 500 Internal Server Error** from the backend. When the backend returns 500, it may not include CORS headers, causing the browser to report it as a CORS error.

## Common Causes (Ordered by Likelihood)

### 1. Missing Environment Variables (MOST LIKELY) ⚠️

The backend requires these critical environment variables:

#### **DATABASE_URL** (Required)
```bash
# Format for Neon.tech:
postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/zapiio?sslmode=require

# If missing or invalid:
# - Error: "DATABASE_URL not set"
# - Error: "connection refused"
# - Error: "password authentication failed"
```

#### **JWT_SECRET_KEY** (Required)
```bash
# Generate secure secret:
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Example:
JWT_SECRET_KEY=xKj9mP2sL5nQ8vR4tY7wZ0aB3cD6eF9gH2iJ5kL8mN1oP4qR7sT0uV3wX6yZ9
```

#### **RESEND_API_KEY** (Optional - for email verification)
```bash
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=PropEquityLab <noreply@propequitylab.com>
```

#### **REDIS_URL** (Optional - for rate limiting)
```bash
# If rate limiting is enabled but Redis is missing:
# Option 1: Disable rate limiting
ENABLE_RATE_LIMITING=false

# Option 2: Add Redis URL (from upstash.com or redis.com)
REDIS_URL=redis://default:password@redis-host:6379
```

#### **CORS_ORIGINS** (Required)
```bash
# Must include your frontend domain
CORS_ORIGINS=https://propequitylab.com,https://www.propequitylab.com
```

### 2. Database Connection Issues

**Symptoms:**
- Error: "connection refused"
- Error: "password authentication failed"
- Error: "SSL connection required"

**Solutions:**

a) **Verify DATABASE_URL format**:
```bash
# Correct format:
postgresql://username:password@host:port/database?sslmode=require

# Common mistakes:
# ❌ Missing sslmode=require for cloud databases
# ❌ Wrong port (5432 for PostgreSQL)
# ❌ Special characters in password not URL-encoded
```

b) **URL-encode special characters in password**:
```python
# If password contains special chars like: p@ss#word!
# Encode it:
import urllib.parse
password = "p@ss#word!"
encoded = urllib.parse.quote(password, safe='')
# Result: p%40ss%23word%21
```

c) **Test connection manually**:
```bash
# Install psql client
# Try connecting:
psql "postgresql://user:password@host:port/database?sslmode=require"
```

### 3. Database Tables Not Created

**Symptoms:**
- Error: "relation 'user' does not exist"
- Error: "column 'password_hash' does not exist"

**Solution:**

The backend auto-creates tables on startup. Check if `create_db_and_tables()` is being called:

```python
# In backend/server.py - should have:
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()  # ← This creates tables
    yield
    # Shutdown
```

If tables aren't created, manually run:
```bash
# From backend directory:
python -c "from utils.database_sql import create_db_and_tables; create_db_and_tables()"
```

### 4. User Account Doesn't Exist

**Symptoms:**
- Login fails even with correct credentials
- Registration works but login doesn't

**Solution:**

Create a test user manually:

```python
# Run in backend directory:
python

from utils.database_sql import get_session, Session
from utils.auth import hash_password
from models.user import User
from datetime import datetime
import uuid

# Create session
session = Session(engine)

# Create user
user = User(
    id=str(uuid.uuid4()),
    email="test@propequitylab.com",
    password_hash=hash_password("TestPassword123!"),
    name="Test User",
    is_verified=True,  # Bypass email verification for dev
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow()
)

session.add(user)
session.commit()
print(f"✓ Created user: {user.email}")
```

### 5. Password Hashing Library Missing

**Symptoms:**
- Error: "No module named 'passlib'"
- Error: "No module named 'bcrypt'"

**Solution:**

```bash
# In requirements.txt, ensure:
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0

# Reinstall:
pip install -r requirements.txt
```

### 6. JWT Token Generation Error

**Symptoms:**
- Error: "No module named 'jose'"
- Error: "'NoneType' object has no attribute 'encode'"

**Solution:**

Ensure `JWT_SECRET_KEY` is set and `python-jose` is installed:

```bash
pip install python-jose[cryptography]
```

### 7. Email Verification Blocking Login

**Symptoms:**
- Error: "Email not verified. Please check your email for the verification link."
- Registration works but login fails

**Solution:**

#### Option 1: Disable email verification temporarily
```bash
ENABLE_EMAIL_VERIFICATION=false
```

#### Option 2: Use dev account bypass
```bash
# Create user with @propequitylab.com email
# These accounts bypass email verification
test@propequitylab.com
```

#### Option 3: Manually verify user in database
```sql
UPDATE "user"
SET is_verified = true
WHERE email = 'user@example.com';
```

### 8. Rate Limiting Issues

**Symptoms:**
- Error: "Connection refused" (Redis)
- Error: "No module named 'redis'"

**Solution:**

Disable rate limiting if Redis is not configured:

```bash
ENABLE_RATE_LIMITING=false
```

Or install Redis client:
```bash
pip install redis
```

## How to Debug Using AWS App Runner Logs

### Step 1: Access Application Logs (NOT System Logs)

1. Go to AWS Console → App Runner
2. Select your service
3. Click **Logs** tab
4. Select **Application logs** (not System logs)
5. Look for recent errors around your login attempt timestamp

### Step 2: Look for These Error Patterns

**Database Connection Errors:**
```
✗ Database connection test failed: connection refused
✗ Failed to create database tables: password authentication failed
```

**Missing Environment Variables:**
```
⚠️  DATABASE_URL not set. Using default PostgreSQL connection.
KeyError: 'JWT_SECRET_KEY'
```

**Import Errors:**
```
ModuleNotFoundError: No module named 'passlib'
ModuleNotFoundError: No module named 'jose'
```

**Authentication Errors:**
```
ERROR: relation "user" does not exist
ERROR: column "password_hash" does not exist
```

### Step 3: Test Endpoints Individually

**Health Check (should work):**
```bash
curl https://your-backend.awsapprunner.com/api/health
```

**Register (create test account):**
```bash
curl -X POST https://your-backend.awsapprunner.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@propequitylab.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

**Login (should now work):**
```bash
curl -X POST https://your-backend.awsapprunner.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@propequitylab.com",
    "password": "TestPassword123!"
  }'
```

## Quick Fix Checklist

Run through this checklist in AWS App Runner environment variables:

- [ ] `DATABASE_URL` is set and contains valid Neon.tech connection string
- [ ] `DATABASE_URL` includes `?sslmode=require` at the end
- [ ] `JWT_SECRET_KEY` is set (min 32 characters)
- [ ] `CORS_ORIGINS` includes `https://propequitylab.com`
- [ ] `ENABLE_EMAIL_VERIFICATION` is set to `false` (for testing)
- [ ] `ENABLE_RATE_LIMITING` is set to `false` (if no Redis)
- [ ] All dependencies in `requirements.txt` are installed
- [ ] Database tables were created on startup
- [ ] At least one test user exists in database

## Expected Successful Login Response

When everything is working, the login endpoint should return:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@propequitylab.com",
    "name": "Test User",
    "is_verified": true,
    "onboarding_completed": false
  }
}
```

## Testing After Fix

1. **Test Health Endpoint:**
```bash
curl https://your-backend.awsapprunner.com/api/health
# Expected: {"status": "healthy", "database": "connected"}
```

2. **Register Test User:**
```bash
curl -X POST https://your-backend.awsapprunner.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@propequitylab.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

3. **Login with Test User:**
```bash
curl -X POST https://your-backend.awsapprunner.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@propequitylab.com",
    "password": "TestPassword123!"
  }'
```

4. **Test from Frontend:**
   - Go to https://propequitylab.com/login
   - Enter credentials
   - Should successfully login and redirect to dashboard

## Environment Variables Reference

Copy this template to AWS App Runner:

```bash
# CRITICAL - Required for backend to work
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET_KEY=your-64-char-secure-random-string-here
CORS_ORIGINS=https://propequitylab.com,https://www.propequitylab.com

# Email (optional - can disable for testing)
ENABLE_EMAIL_VERIFICATION=false
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=PropEquityLab <noreply@propequitylab.com>
FRONTEND_URL=https://propequitylab.com

# Rate Limiting (disable if no Redis)
ENABLE_RATE_LIMITING=false

# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
```

## Need More Help?

If the error persists after checking all the above:

1. **Copy the full error stack trace** from AWS App Runner application logs
2. **Share the logs** showing the exact error when login is attempted
3. **Verify environment variables** are properly set in AWS App Runner

The error logs will show the exact line number and error message that's causing the 500 error.
