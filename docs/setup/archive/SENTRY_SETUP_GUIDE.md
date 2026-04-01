# Sentry Error Monitoring Setup Guide

Complete guide to configure Sentry error monitoring for Zapiio (Production Blocker #3)

## Table of Contents
1. [Create Sentry Account & Projects](#1-create-sentry-account--projects)
2. [Backend Setup (FastAPI)](#2-backend-setup-fastapi)
3. [Frontend Setup (React)](#3-frontend-setup-react)
4. [Environment Variables](#4-environment-variables)
5. [Testing](#5-testing)
6. [Production Deployment](#6-production-deployment)
7. [Monitoring & Alerts](#7-monitoring--alerts)

---

## 1. Create Sentry Account & Projects

### Step 1.1: Create Free Sentry Account
1. Go to https://sentry.io/signup/
2. Sign up with your email or GitHub account
3. Choose the **Free** plan (includes 5,000 errors/month)

### Step 1.2: Create Backend Project
1. Click **"Create Project"**
2. Select platform: **Python**
3. Set alert frequency: **Alert on every new issue**
4. Project name: `zapiio-backend`
5. Click **"Create Project"**
6. **Copy the DSN** (looks like: `https://xxxxx@o123456.ingest.sentry.io/123456`)
   - Save this as `SENTRY_DSN` for backend

### Step 1.3: Create Frontend Project
1. Click **"Projects"** in sidebar → **"Create Project"**
2. Select platform: **React**
3. Set alert frequency: **Alert on every new issue**
4. Project name: `zapiio-frontend`
5. Click **"Create Project"**
6. **Copy the DSN**
   - Save this as `VITE_SENTRY_DSN` for frontend

---

## 2. Backend Setup (FastAPI)

### Step 2.1: Install Sentry SDK

```bash
cd backend
pip install "sentry-sdk[fastapi]==2.0.0"
```

Add to `backend/requirements.txt`:
```
sentry-sdk[fastapi]==2.0.0
```

### Step 2.2: Create Sentry Configuration

Create `backend/utils/sentry_config.py`:

```python
"""
Sentry Error Monitoring Configuration for FastAPI
"""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
import os


def init_sentry():
    """Initialize Sentry error monitoring"""
    sentry_dsn = os.getenv("SENTRY_DSN")
    environment = os.getenv("ENVIRONMENT", "development")

    # Only initialize Sentry in non-development environments
    if sentry_dsn and environment != "development":
        sentry_sdk.init(
            dsn=sentry_dsn,
            environment=environment,

            # FastAPI integration - auto-captures API errors
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],

            # Performance monitoring - sample 10% of transactions
            traces_sample_rate=0.1,

            # GDPR compliance - don't send PII automatically
            send_default_pii=False,

            # Attach stack traces to all messages
            attach_stacktrace=True,

            # Release tracking (optional - use git commit hash)
            # release=os.getenv("GIT_COMMIT_SHA", "unknown"),
        )

        print(f"✅ Sentry initialized for environment: {environment}")
    else:
        print(f"⚠️  Sentry NOT initialized (environment: {environment})")
```

### Step 2.3: Initialize in Server

Update `backend/server.py`:

```python
from contextlib import asynccontextmanager
from utils.sentry_config import init_sentry

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting up Zapiio API...")

    # Initialize Sentry first
    init_sentry()

    # Initialize PostgreSQL Tables
    create_db_and_tables()
    logger.info("✅ Database tables verified/created")

    yield

    logger.info("Shutting down...")
```

### Step 2.4: Create Structured Logger (Optional but Recommended)

Create `backend/utils/logger.py`:

```python
"""
Structured Logging Utility
Replaces print() statements with proper logging that integrates with Sentry
"""

import logging
import json
from typing import Any, Dict


class StructuredLogger:
    """Logger that outputs structured JSON for better monitoring"""

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def _format_extra(self, extra: Dict[str, Any]) -> str:
        """Format extra context as JSON"""
        try:
            return json.dumps(extra, default=str)
        except:
            return str(extra)

    def info(self, message: str, **extra):
        """Log info message with optional context"""
        if extra:
            message = f"{message} | {self._format_extra(extra)}"
        self.logger.info(message)

    def error(self, message: str, exc_info=None, **extra):
        """Log error message with optional context"""
        if extra:
            message = f"{message} | {self._format_extra(extra)}"
        self.logger.error(message, exc_info=exc_info)

    def warning(self, message: str, **extra):
        """Log warning message with optional context"""
        if extra:
            message = f"{message} | {self._format_extra(extra)}"
        self.logger.warning(message)

    def debug(self, message: str, **extra):
        """Log debug message with optional context"""
        if extra:
            message = f"{message} | {self._format_extra(extra)}"
        self.logger.debug(message)


def get_logger(name: str) -> StructuredLogger:
    """Get a structured logger instance"""
    return StructuredLogger(name)
```

**Usage in routes:**
```python
from utils.logger import get_logger

logger = get_logger(__name__)

# Replace print() statements:
# Before: print(f"User {user.id} logged in")
# After:
logger.info("User logged in", user_id=user.id, email=user.email)

# Error logging with context:
try:
    result = process_payment(amount)
except Exception as e:
    logger.error("Payment processing failed",
                 error=str(e),
                 amount=amount,
                 user_id=current_user.id,
                 exc_info=True)
    raise
```

---

## 3. Frontend Setup (React)

### Step 3.1: Install Sentry SDK

```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

Or with yarn:
```bash
yarn add @sentry/react @sentry/tracing
```

### Step 3.2: Create Sentry Configuration

Create `frontend/src/utils/sentry.js`:

```javascript
/**
 * Sentry Error Monitoring Configuration for React
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENVIRONMENT || "development";

  // Only initialize Sentry in non-development environments
  if (dsn && environment !== "development") {
    Sentry.init({
      dsn,
      environment,

      // Browser tracing - monitors page load and navigation performance
      integrations: [
        new BrowserTracing({
          tracingOrigins: [
            "localhost",
            import.meta.env.VITE_API_URL,
            /^\//,
          ],
        }),
      ],

      // Performance monitoring - sample 10% of transactions
      tracesSampleRate: 0.1,

      // Enable debug mode in staging
      debug: environment === "staging",

      // Before sending to Sentry, clean sensitive data
      beforeSend(event) {
        // Remove sensitive data from error context
        if (event.request) {
          delete event.request.cookies;
        }

        // Don't send authentication errors to Sentry
        if (event.exception?.values?.[0]?.value?.includes("401")) {
          return null;
        }

        return event;
      },
    });

    console.log(`✅ Sentry initialized for environment: ${environment}`);
  } else {
    console.log(`⚠️  Sentry NOT initialized (environment: ${environment})`);
  }
};
```

### Step 3.3: Initialize in App Entry Point

Update `frontend/src/main.jsx`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initSentry } from './utils/sentry';

// Initialize Sentry BEFORE rendering the app
initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 3.4: Create Error Boundary Component

Create `frontend/src/components/ErrorBoundary.jsx`:

```javascript
import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const ErrorFallback = ({ error, resetError }) => {
  const isDev = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 mb-8">
          We've been notified of this error and will look into it. Please try reloading the page.
        </p>

        {isDev && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>

          <Button
            onClick={() => (window.location.href = '/dashboard')}
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
```

### Step 3.5: Wrap App with Error Boundary

Update `frontend/src/App.js`:

```javascript
import * as Sentry from '@sentry/react';
import ErrorFallback from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider>
      <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
        <AuthProvider>
          <UserProvider>
            <PortfolioProvider>
              <div className="App">
                <AppRoutes />
                <Toaster />
              </div>
            </PortfolioProvider>
          </UserProvider>
        </AuthProvider>
      </Sentry.ErrorBoundary>
    </ThemeProvider>
  );
}
```

### Step 3.6: Create Error Handler Utility

Create `frontend/src/utils/errorHandler.js`:

```javascript
/**
 * Centralized Error Handling Utility
 * Use this to log errors to Sentry with context
 */

import * as Sentry from '@sentry/react';

/**
 * Log an error to Sentry with context
 * @param {Error} error - The error object
 * @param {Object} context - Additional context (user action, data, etc.)
 */
export const logError = (error, context = {}) => {
  // In development, also log to console
  if (import.meta.env.DEV) {
    console.error('Error:', error);
    console.error('Context:', context);
  }

  // Send to Sentry
  Sentry.captureException(error, {
    extra: context,
    level: 'error',
  });
};

/**
 * Log a warning to Sentry
 * @param {string} message - Warning message
 * @param {Object} context - Additional context
 */
export const logWarning = (message, context = {}) => {
  if (import.meta.env.DEV) {
    console.warn('Warning:', message, context);
  }

  Sentry.captureMessage(message, {
    level: 'warning',
    extra: context,
  });
};

/**
 * Set user context for error tracking
 * Call this after user logs in
 * @param {Object} user - User object
 */
export const setUserContext = (user) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    // Don't send sensitive data
  });
};

/**
 * Clear user context on logout
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};
```

**Usage in components:**
```javascript
import { logError, setUserContext } from '../utils/errorHandler';

// In API calls:
try {
  const result = await api.createProperty(data);
} catch (error) {
  logError(error, {
    action: 'create_property',
    propertyData: data,
    userId: currentUser.id,
  });
  toast.error('Failed to create property');
}

// After login:
setUserContext(user);

// On logout:
clearUserContext();
```

---

## 4. Environment Variables

### Backend `.env`
Add to `backend/.env`:

```bash
# Sentry Configuration
SENTRY_DSN=https://YOUR_BACKEND_DSN@o123456.ingest.sentry.io/123456
ENVIRONMENT=production  # Options: development, staging, production

# Optional: Release tracking
GIT_COMMIT_SHA=<commit-hash>
```

### Frontend `.env`
Add to `frontend/.env` (and `.env.production`):

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://YOUR_FRONTEND_DSN@o123456.ingest.sentry.io/123456
VITE_ENVIRONMENT=production  # Options: development, staging, production
```

**Important:** Add `.env` to `.gitignore` to avoid committing secrets!

---

## 5. Testing

### Test Backend Error Tracking

1. Add a test endpoint to `backend/server.py`:
```python
@app.get("/test-sentry")
async def test_sentry():
    """Test endpoint to verify Sentry is working"""
    raise Exception("Test exception - Sentry is working!")
```

2. Start the backend:
```bash
cd backend
ENVIRONMENT=production uvicorn server:app --reload
```

3. Visit `http://localhost:8000/test-sentry`
4. Check Sentry dashboard - you should see the error!

### Test Frontend Error Tracking

1. Add a test button to any page:
```javascript
<button onClick={() => {
  throw new Error("Test error - Sentry is working!");
}}>
  Test Sentry
</button>
```

2. Start the frontend:
```bash
cd frontend
VITE_ENVIRONMENT=production npm run dev
```

3. Click the button
4. Check Sentry dashboard - you should see the error!

### Verify Error Boundary

1. Create a component that crashes:
```javascript
const CrashComponent = () => {
  throw new Error("This component crashed!");
  return <div>You won't see this</div>;
};
```

2. Add it to your app
3. Verify the Error Boundary shows the fallback UI
4. Check Sentry for the error

---

## 6. Production Deployment

### Backend Deployment Checklist
- [ ] `SENTRY_DSN` environment variable set in production
- [ ] `ENVIRONMENT=production` set
- [ ] `send_default_pii=False` (GDPR compliance)
- [ ] Error monitoring verified with test errors
- [ ] Structured logging implemented

### Frontend Deployment Checklist
- [ ] `VITE_SENTRY_DSN` environment variable set
- [ ] `VITE_ENVIRONMENT=production` set
- [ ] Error Boundary wraps entire app
- [ ] User context tracking on login/logout
- [ ] Sensitive data scrubbed in `beforeSend`

### Environment-Specific Configuration

**Development:**
- Sentry: Disabled
- Logging: Console only

**Staging:**
- Sentry: Enabled with `debug: true`
- Logging: Full verbosity

**Production:**
- Sentry: Enabled
- Logging: Errors and warnings only
- Sample rates: 10% (to control quota)

---

## 7. Monitoring & Alerts

### Configure Sentry Alerts

1. Go to **Settings** → **Alerts**
2. Create alert rule:
   - Name: "New Error Alert"
   - Conditions: "A new issue is created"
   - Actions: "Send email to team@zapiio.com"

3. Create performance alert:
   - Name: "Slow API Responses"
   - Conditions: "Transaction duration is above 2s"
   - Actions: "Send email to devops@zapiio.com"

### Set Up Uptime Monitoring

Use external service like **UptimeRobot** (free):

1. Go to https://uptimerobot.com/
2. Add monitor:
   - Type: HTTPS
   - URL: `https://api.zapiio.com/api/health`
   - Interval: 5 minutes
3. Configure alerts via email/Slack

### Health Check Endpoint

The `/api/health` endpoint already exists in `backend/server.py`:

```python
@api_router.get("/health")
async def health_check(session: Session = Depends(get_session)):
    try:
        # Check database connectivity
        session.exec(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
            "version": "2.0.0",
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unhealthy")
```

---

## 8. Best Practices

### ✅ DO:
- Initialize Sentry BEFORE app startup
- Use structured logging with context
- Set user context on login
- Clear user context on logout
- Scrub sensitive data in `beforeSend`
- Test error tracking in staging first
- Monitor Sentry quota usage
- Set appropriate sample rates (10%)

### ❌ DON'T:
- Send PII (personally identifiable information)
- Log passwords, tokens, or API keys
- Enable Sentry in development (noisy)
- Ignore Sentry quota limits
- Log expected errors (like 404s)
- Send duplicate errors

---

## 9. Troubleshooting

### "Sentry not capturing errors"
- Check `SENTRY_DSN` is correct
- Verify `ENVIRONMENT` is not "development"
- Ensure Sentry is initialized before app starts
- Check browser console for Sentry init messages

### "Too many errors logged"
- Increase `tracesSampleRate` (lower = fewer events)
- Filter out expected errors in `beforeSend`
- Check for error loops (infinite retries)

### "Quota exceeded"
- Reduce sample rates
- Filter out noisy errors
- Upgrade to paid plan if needed (Dev plan: 50k errors/month for $26/mo)

---

## 10. Support & Resources

- **Sentry Docs:** https://docs.sentry.io/
- **React Integration:** https://docs.sentry.io/platforms/javascript/guides/react/
- **FastAPI Integration:** https://docs.sentry.io/platforms/python/guides/fastapi/
- **Sentry Support:** support@sentry.io

---

**You're all set!** 🎉 Sentry is now configured for both backend and frontend. Errors will be automatically tracked, and you'll be notified when issues occur in production.
