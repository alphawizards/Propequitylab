# Day 3 Todo List: Monitoring & Analytics Setup

**Date:** 2026-01-09  
**Phase:** 9E - Monitoring & Analytics  
**Estimated Time:** 2-3 hours  
**Priority:** MEDIUM (Recommended but optional - can be done post-launch)

---

## 🎯 Overview

Day 3 focuses on setting up monitoring and analytics infrastructure to track errors, uptime, and user behavior. This is recommended before launch but can be added post-launch if needed.

**Goal:** Implement comprehensive monitoring to catch issues early and understand user behavior.

---

## ✅ Prerequisites

Before starting Day 3:
- ✅ Day 1 complete (Email service)
- ✅ Day 2 complete (Security hardening + Legal pages)
- ✅ Changes pushed to GitHub
- ✅ Deployment successful
- ✅ Security testing passed

---

## 📋 Task 1: Sentry Error Tracking (45 minutes)

### **1.1 Create Sentry Account** (5 min)

**Steps:**
1. Go to https://sentry.io
2. Sign up for free account (100k events/month free)
3. Create new project: "Propequitylab"
4. Select platform: "React" (for frontend)
5. Note the DSN (Data Source Name)

**Output:**
- Sentry account created
- Project created
- DSN obtained (e.g., `https://xxxxx@sentry.io/xxxxx`)

---

### **1.2 Install Sentry in Frontend** (15 min)

**File:** `frontend/package.json`

**Steps:**
1. Add Sentry packages:
```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

2. Create Sentry configuration file:

**File:** `frontend/src/utils/sentry.js`
```javascript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Environment
      environment: process.env.NODE_ENV,
      
      // Release tracking
      release: `propequitylab@${process.env.REACT_APP_VERSION || '1.0.0'}`,
      
      // Don't send errors in development
      enabled: process.env.NODE_ENV === 'production',
      
      // Ignore common errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    });
  }
};
```

3. Initialize Sentry in `frontend/src/index.js`:

**File:** `frontend/src/index.js`
```javascript
import { initSentry } from './utils/sentry';

// Initialize Sentry before React
initSentry();

// ... rest of your code
```

4. Add environment variable to `.env`:

**File:** `frontend/.env`
```
REACT_APP_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
REACT_APP_VERSION=1.0.0
```

5. Add to Cloudflare Pages environment variables:
   - Go to Cloudflare Pages dashboard
   - Settings → Environment variables
   - Add `REACT_APP_SENTRY_DSN`

**Output:**
- ✅ Sentry installed in frontend
- ✅ Configuration created
- ✅ Environment variables set

---

### **1.3 Install Sentry in Backend** (15 min)

**File:** `backend/requirements.txt`

**Steps:**
1. Add Sentry package:
```
sentry-sdk[fastapi]>=1.40.0
```

2. Create Sentry configuration:

**File:** `backend/utils/sentry.py`
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
import os

def init_sentry():
    """Initialize Sentry error tracking"""
    sentry_dsn = os.getenv("SENTRY_DSN")
    environment = os.getenv("ENVIRONMENT", "production")
    
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            # Performance Monitoring
            traces_sample_rate=0.1,  # 10% of transactions
            
            # Environment
            environment=environment,
            
            # Release tracking
            release=f"propequitylab@{os.getenv('VERSION', '1.0.0')}",
            
            # Send PII (Personally Identifiable Information)
            send_default_pii=False,  # Don't send user data
            
            # Ignore health check endpoints
            ignore_errors=[
                "HealthCheckError",
            ],
        )
        print(f"✓ Sentry initialized for {environment}")
    else:
        print("⚠️  SENTRY_DSN not set. Error tracking disabled.")
```

3. Initialize in `backend/server.py`:

**File:** `backend/server.py`
```python
from utils.sentry import init_sentry

# Initialize Sentry before creating FastAPI app
init_sentry()

# ... rest of your code
```

4. Add environment variable to AWS App Runner:
   - Go to AWS App Runner console
   - Select your service
   - Configuration → Environment variables
   - Add `SENTRY_DSN`
   - Add `ENVIRONMENT=production`
   - Add `VERSION=1.0.0`

**Output:**
- ✅ Sentry installed in backend
- ✅ Configuration created
- ✅ Environment variables set

---

### **1.4 Test Sentry** (10 min)

**Steps:**
1. Deploy changes to production
2. Trigger a test error in frontend:
   - Open browser console
   - Run: `throw new Error("Sentry test error - frontend")`
3. Trigger a test error in backend:
   - Create endpoint: `/api/test-sentry`
   - Visit the endpoint
4. Check Sentry dashboard for errors

**Output:**
- ✅ Frontend errors appear in Sentry
- ✅ Backend errors appear in Sentry
- ✅ Error details are captured

**Checklist:**
- [ ] Sentry account created
- [ ] Frontend Sentry installed
- [ ] Backend Sentry installed
- [ ] Environment variables set
- [ ] Test errors captured

---

## 📋 Task 2: Uptime Monitoring (30 minutes)

### **2.1 Choose Monitoring Service** (5 min)

**Options:**

| Service | Free Tier | Checks | Recommended |
|---------|-----------|--------|-------------|
| **UptimeRobot** | 50 monitors, 5-min checks | HTTP, Keyword | ✅ Yes |
| **Pingdom** | 1 monitor, 1-min checks | HTTP | Good |
| **Better Uptime** | 10 monitors, 3-min checks | HTTP, Keyword | Good |
| **Uptime.com** | 1 monitor, 1-min checks | HTTP | Basic |

**Recommendation:** UptimeRobot (generous free tier)

---

### **2.2 Set Up UptimeRobot** (15 min)

**Steps:**
1. Go to https://uptimerobot.com
2. Sign up for free account
3. Click "Add New Monitor"

**Monitor 1: Frontend**
- Monitor Type: HTTP(s)
- Friendly Name: Propequitylab Frontend
- URL: `https://propequitylab.pages.dev`
- Monitoring Interval: 5 minutes
- Alert Contacts: Your email

**Monitor 2: Backend Health Check**
- Monitor Type: HTTP(s)
- Friendly Name: Propequitylab API Health
- URL: `https://your-backend-url.com/api/health`
- Monitoring Interval: 5 minutes
- Alert Contacts: Your email
- Keyword: `healthy` (checks response contains "healthy")

**Monitor 3: Backend Authentication**
- Monitor Type: HTTP(s)
- Friendly Name: Propequitylab API Auth
- URL: `https://your-backend-url.com/api/auth/health` (if exists)
- Monitoring Interval: 5 minutes
- Alert Contacts: Your email

4. Set up alert channels:
   - Email (default)
   - Slack (optional)
   - Discord (optional)

**Output:**
- ✅ 2-3 monitors created
- ✅ Email alerts configured
- ✅ Monitoring active

---

### **2.3 Create Status Page** (10 min)

**Steps:**
1. In UptimeRobot, go to "Status Pages"
2. Click "Add Status Page"
3. Configure:
   - Name: "Propequitylab Status"
   - Monitors: Select all monitors
   - Custom Domain: (optional) status.propequitylab.com
   - Design: Choose theme
4. Make public
5. Get status page URL

**Output:**
- ✅ Public status page created
- ✅ URL: `https://stats.uptimerobot.com/xxxxx`

**Optional:** Add status page link to footer of your app

---

**Checklist:**
- [ ] Monitoring service selected
- [ ] Frontend monitor created
- [ ] Backend monitor created
- [ ] Email alerts configured
- [ ] Status page created

---

## 📋 Task 3: Privacy-Friendly Analytics (45 minutes) **OPTIONAL**

### **3.1 Choose Analytics Service** (5 min)

**Options:**

| Service | Privacy | Free Tier | Recommended |
|---------|---------|-----------|-------------|
| **Plausible** | ✅ GDPR-compliant | 10k pageviews/month | ✅ Yes |
| **Umami** | ✅ Self-hosted | Unlimited (self-hosted) | Good |
| **Fathom** | ✅ GDPR-compliant | 14-day trial | Paid |
| **Simple Analytics** | ✅ GDPR-compliant | 14-day trial | Paid |

**Recommendation:** Plausible (privacy-first, no cookies, GDPR-compliant)

**Note:** This is optional. You can skip analytics entirely or add it post-launch.

---

### **3.2 Set Up Plausible** (20 min)

**Steps:**
1. Go to https://plausible.io
2. Sign up for free trial (10k pageviews/month)
3. Add website: `propequitylab.pages.dev`
4. Get tracking script

**File:** `frontend/public/index.html`

Add before `</head>`:
```html
<script defer data-domain="propequitylab.pages.dev" src="https://plausible.io/js/script.js"></script>
```

**Or use React component:**

**File:** `frontend/src/components/PlausibleAnalytics.jsx`
```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PlausibleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.plausible && process.env.NODE_ENV === 'production') {
      window.plausible('pageview');
    }
  }, [location]);

  return null;
};

export default PlausibleAnalytics;
```

Add to `App.js`:
```javascript
import PlausibleAnalytics from './components/PlausibleAnalytics';

function App() {
  return (
    <>
      <PlausibleAnalytics />
      {/* rest of your app */}
    </>
  );
}
```

5. Deploy and verify tracking works

**Output:**
- ✅ Plausible account created
- ✅ Tracking script added
- ✅ Pageviews being tracked

---

### **3.3 Configure Goals** (20 min)

**Steps:**
1. In Plausible dashboard, go to Settings → Goals
2. Add custom events:

**Goal 1: User Registration**
- Goal: Custom Event
- Event Name: `signup`

**Goal 2: Email Verified**
- Goal: Custom Event
- Event Name: `email_verified`

**Goal 3: First Property Added**
- Goal: Custom Event
- Event Name: `property_added`

**Goal 4: FIRE Plan Created**
- Goal: Custom Event
- Event Name: `fire_plan_created`

3. Add tracking to frontend:

**File:** `frontend/src/pages/Register.jsx`
```javascript
// After successful registration
if (window.plausible) {
  window.plausible('signup');
}
```

**File:** `frontend/src/pages/PropertiesPage.jsx`
```javascript
// After adding first property
if (window.plausible) {
  window.plausible('property_added');
}
```

**Output:**
- ✅ Custom goals configured
- ✅ Event tracking added to key actions

**Checklist:**
- [ ] Analytics service selected
- [ ] Tracking script added
- [ ] Goals configured
- [ ] Event tracking implemented

---

## 📋 Task 4: Structured Logging (30 minutes)

### **4.1 Configure Backend Logging** (20 min)

**File:** `backend/utils/logger.py`

```python
import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add extra fields
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "duration"):
            log_data["duration_ms"] = record.duration
            
        # Add exception info
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)

def setup_logging(environment: str = "production"):
    """Configure structured logging"""
    
    # Create logger
    logger = logging.getLogger("propequitylab")
    logger.setLevel(logging.INFO if environment == "production" else logging.DEBUG)
    
    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    
    # Use JSON formatter in production, simple formatter in development
    if environment == "production":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
    
    logger.addHandler(handler)
    
    return logger

# Create logger instance
logger = setup_logging()
```

**File:** `backend/server.py`

Add request logging middleware:
```python
import time
from utils.logger import logger

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request started: {request.method} {request.url.path}",
        extra={
            "request_id": request.headers.get("X-Request-ID", "unknown"),
            "method": request.method,
            "path": request.url.path,
        }
    )
    
    # Process request
    response = await call_next(request)
    
    # Log response
    duration = (time.time() - start_time) * 1000  # ms
    logger.info(
        f"Request completed: {request.method} {request.url.path} - {response.status_code}",
        extra={
            "request_id": request.headers.get("X-Request-ID", "unknown"),
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration": duration,
        }
    )
    
    return response
```

**Output:**
- ✅ Structured logging configured
- ✅ JSON logs in production
- ✅ Request/response logging

---

### **4.2 View Logs in AWS** (10 min)

**Steps:**
1. Go to AWS App Runner console
2. Select your service
3. Click "Logs" tab
4. View CloudWatch logs
5. Set up log retention (recommended: 7-30 days)

**Optional:** Set up CloudWatch Insights queries for common patterns

**Output:**
- ✅ Logs viewable in AWS CloudWatch
- ✅ Log retention configured

**Checklist:**
- [ ] Structured logging configured
- [ ] Request logging added
- [ ] Logs viewable in AWS CloudWatch

---

## 📋 Task 5: Health Check Endpoints (15 minutes)

### **5.1 Enhance Health Check** (15 min)

**File:** `backend/routes/health.py` (new)

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from utils.database_sql import get_session
import os

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "propequitylab-api",
        "version": os.getenv("VERSION", "1.0.0"),
    }

@router.get("/detailed")
async def detailed_health_check(session: Session = Depends(get_session)):
    """Detailed health check with database"""
    checks = {
        "api": "healthy",
        "database": "unknown",
        "email": "unknown",
    }
    
    # Check database
    try:
        session.exec(select(1))
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
    
    # Check email service
    if os.getenv("RESEND_API_KEY"):
        checks["email"] = "configured"
    else:
        checks["email"] = "not configured"
    
    # Overall status
    overall_status = "healthy" if all(
        v in ["healthy", "configured"] for v in checks.values()
    ) else "degraded"
    
    return {
        "status": overall_status,
        "checks": checks,
        "version": os.getenv("VERSION", "1.0.0"),
    }
```

**File:** `backend/server.py`

Add health router:
```python
from routes.health import router as health_router

api_router.include_router(health_router)
```

**Output:**
- ✅ `/api/health` - Basic health check
- ✅ `/api/health/detailed` - Detailed health check

**Checklist:**
- [ ] Health check endpoints created
- [ ] Database check added
- [ ] Email service check added

---

## 📋 Task 6: Documentation & Testing (15 minutes)

### **6.1 Create Monitoring Guide** (10 min)

**File:** `docs/MONITORING_GUIDE.md`

Create a guide documenting:
- Sentry dashboard URL
- UptimeRobot dashboard URL
- Plausible dashboard URL (if used)
- How to view logs in AWS CloudWatch
- How to interpret error alerts
- Common issues and solutions

---

### **6.2 Test All Monitoring** (5 min)

**Checklist:**
- [ ] Trigger test error in Sentry (frontend & backend)
- [ ] Verify uptime monitors are working
- [ ] Check analytics tracking (if implemented)
- [ ] View logs in AWS CloudWatch
- [ ] Test health check endpoints

---

## ✅ Day 3 Completion Checklist

### **Core Tasks (Required for monitoring)**
- [ ] **Task 1:** Sentry error tracking configured
  - [ ] Frontend Sentry installed
  - [ ] Backend Sentry installed
  - [ ] Test errors captured
- [ ] **Task 2:** Uptime monitoring configured
  - [ ] Monitors created
  - [ ] Alerts configured
  - [ ] Status page created
- [ ] **Task 4:** Structured logging configured
  - [ ] JSON logging in production
  - [ ] Request logging added
- [ ] **Task 5:** Health check endpoints created
  - [ ] Basic health check
  - [ ] Detailed health check

### **Optional Tasks**
- [ ] **Task 3:** Analytics configured (Plausible)
  - [ ] Tracking script added
  - [ ] Goals configured
  - [ ] Event tracking implemented

### **Documentation**
- [ ] Monitoring guide created
- [ ] All monitoring tested
- [ ] Dashboard URLs documented

---

## 📊 Expected Outcomes

After completing Day 3, you will have:

1. **Error Tracking**
   - Real-time error notifications
   - Detailed error context and stack traces
   - Performance monitoring

2. **Uptime Monitoring**
   - 24/7 uptime checks
   - Instant downtime alerts
   - Public status page

3. **Structured Logging**
   - JSON logs for easy parsing
   - Request/response logging
   - CloudWatch integration

4. **Health Checks**
   - API health status
   - Database connectivity check
   - Service dependency checks

5. **Analytics** (Optional)
   - Privacy-friendly pageview tracking
   - Custom event tracking
   - User journey insights

---

## 🚀 After Day 3

Once Day 3 is complete:
1. ✅ All monitoring is active
2. ✅ You'll receive alerts for errors and downtime
3. ✅ You can view logs and metrics
4. ✅ Ready for Day 4 (Final testing & soft launch)

---

## 📞 Support

**Sentry:** https://docs.sentry.io  
**UptimeRobot:** https://uptimerobot.com/help  
**Plausible:** https://plausible.io/docs  
**AWS CloudWatch:** https://docs.aws.amazon.com/cloudwatch

---

*Created: 2026-01-09*  
*Day 3: Monitoring & Analytics Setup*  
*Estimated Time: 2-3 hours*
