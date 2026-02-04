# PropEquityLab Build & Run Instructions

This file tells Ralph how to build, test, and run the PropEquityLab project.

## System Requirements

- **Python**: 3.11+
- **Node.js**: 18+ (for frontend)
- **PostgreSQL**: 15+ (via Neon.tech cloud database)
- **Git**: For version control
- **OS**: Windows (Git Bash), macOS, or Linux

## Environment Setup

### Backend (.env configuration)

The backend requires a `.env` file in the `backend/` directory:

```bash
# Database (Neon.tech PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_H4mfION2YCyj@ep-still-credit-a7zrg3xk-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require

# JWT Authentication
JWT_SECRET=RBmWOkobVZk_f1iusFPUPJT0BCXAs9nopZIG-FLUlUY
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_PASSWORD_RESET=false

# Rate Limiting
RATE_LIMIT_PER_MINUTE=1000
RATE_LIMIT_LOGIN_PER_HOUR=50

# Environment
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

**✅ File Status**: Already configured and working

## Build Commands

### Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations (if needed)
# Note: Tables auto-create on first run via server startup
# alembic upgrade head  # Only if using Alembic migrations

# Verify test users (marks them as email-verified)
python verify_test_users.py

# Seed sample data
python seed_free_user_data.py        # Free tier user
python seed_premium_user_data.py    # Premium tier user (TODO)
python seed_pro_user_data.py        # Pro tier user (TODO)
```

### Frontend Setup

```bash
cd frontend

# Install Node.js dependencies
npm install

# Build for production
npm run build

# Or start development server
npm start  # Runs on http://localhost:3000
```

## Run Commands

### Start Backend Server

```bash
cd backend
uvicorn server:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
✓ Database tables created successfully
✅ Database tables verified/created
```

**Health Check:**
```bash
curl http://localhost:8000/api/health
# Expected: {"status":"healthy","stack":"PostgreSQL + App Runner"}
```

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Start Frontend (Development)

```bash
cd frontend
npm start
```

Runs on: http://localhost:3000

### Run Both (Full Stack)

**Option 1: Separate Terminals**
```bash
# Terminal 1: Backend
cd backend && uvicorn server:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm start
```

**Option 2: Background Backend**
```bash
# Start backend in background
cd backend
uvicorn server:app --reload --port 8000 &

# Start frontend
cd frontend
npm start
```

## Test Commands

### Backend Tests

```bash
cd backend

# Run all tests (if pytest is set up)
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=. --cov-report=html
```

**Note**: Test suite may not be fully implemented yet.

### Frontend Tests

```bash
cd frontend

# Run Jest tests
npm test

# Run with coverage
npm test -- --coverage
```

## Database Operations

### Connect to Database

The project uses **Neon.tech** (cloud PostgreSQL). Connection details are in `.env`.

```bash
# Using psql (if installed)
psql $DATABASE_URL

# Or use Neon.tech web console
# URL: https://console.neon.tech
```

### Run Migrations

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

**Current Status**: Tables auto-create on server startup. Migrations may not be actively used.

### Seed/Reset Database

```bash
cd backend

# Verify test users
python verify_test_users.py

# Seed Free user data
python seed_free_user_data.py

# Seed Premium user data (TODO: create this file)
python seed_premium_user_data.py

# Seed Pro user data (TODO: create this file)
python seed_pro_user_data.py
```

## Useful Scripts

### Check Server Status

```bash
# Backend health
curl http://localhost:8000/api/health

# Check running processes
ps aux | grep uvicorn
ps aux | grep node
```

### View Logs

```bash
# Backend logs (if running in foreground)
# Logs are printed to terminal

# Frontend logs
cd frontend
npm start  # Logs appear in terminal
```

### Login as Test User

```bash
# Login via API
cd backend
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"free@test.propequitylab.com","password":"TestPass123!"}'

# Response includes access_token and user info
```

**Test Users:**
- Free: `free@test.propequitylab.com` / `TestPass123!`
- Premium: `premium@test.propequitylab.com` / `TestPass123!`
- Pro: `pro@test.propequitylab.com` / `TestPass123!`

## Development Workflow

### Making Changes

1. **Backend changes:**
   - Edit files in `backend/`
   - Server auto-reloads with `--reload` flag
   - Test endpoints with curl or Swagger UI

2. **Frontend changes:**
   - Edit files in `frontend/src/`
   - React hot-reloads automatically
   - View changes in browser

3. **Database schema changes:**
   - Update model in `backend/models/`
   - Create migration: `alembic revision --autogenerate`
   - Apply: `alembic upgrade head`

### Common Issues

**Issue: Backend won't start**
- Check if port 8000 is in use: `lsof -i :8000` (Mac/Linux) or `netstat -ano | findstr :8000` (Windows)
- Check DATABASE_URL in .env is correct
- Ensure Python dependencies installed

**Issue: Frontend won't build**
- Delete `node_modules` and run `npm install` again
- Clear cache: `npm cache clean --force`
- Check Node.js version: `node --version` (should be 18+)

**Issue: API returns 500 errors**
- Check backend terminal for error messages
- Verify database connection works
- Check if UUIDs are being generated properly

**Issue: Rate limit exceeded**
- Wait 15 minutes for reset
- Or temporarily increase in `.env`: `RATE_LIMIT_PER_MINUTE=10000`

## Deployment (Production)

### Backend (AWS App Runner)

```bash
# Backend is configured for AWS App Runner
# Deployment happens via git push to main branch
# See AWS App Runner console for deployment status
```

### Frontend (AWS S3/CloudFront)

```bash
cd frontend
npm run build

# Build creates optimized production files in build/
# Deploy to S3 bucket and CloudFront distribution
```

## Important Notes for Ralph

- **Backend server must be running** for seed scripts to work via API
- **Use direct database scripts** (like `seed_free_user_data.py`) to avoid API rate limits
- **Check logs** in terminal output when debugging issues
- **Double API prefix**: Current endpoints are `/api/api/...` due to router config
- **Email verification**: Disabled in development (.env)
- **All test users**: Password is `TestPass123!`
- **Database**: Cloud-hosted on Neon.tech, always available

## Success Indicators

You'll know everything is working when:
- ✅ `curl http://localhost:8000/api/health` returns `{"status":"healthy"}`
- ✅ Swagger docs load at http://localhost:8000/docs
- ✅ Frontend loads at http://localhost:3000
- ✅ Can login as test users
- ✅ Sample data visible in database/API
- ✅ No 500 errors in API responses
