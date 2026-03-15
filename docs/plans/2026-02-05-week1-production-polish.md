# Week 1 Production Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete Cookie Banner, Footer Integration, and Sentry verification for production readiness.

**Architecture:** Add CookieBanner component that shows on first visit, integrate existing Footer component into layouts, verify Sentry is properly configured for both frontend and backend.

**Tech Stack:** React, localStorage, shadcn/ui components, Sentry SDK

---

## Task 1: Cookie Banner Component

**Files:**
- Create: `frontend/src/components/CookieBanner.jsx`
- Modify: `frontend/src/App.js` (add CookieBanner)

### Step 1: Create the CookieBanner component

Create file `frontend/src/components/CookieBanner.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'propequitylab_cookie_consent';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <p>
            We use cookies to enhance your experience. By continuing to use this site, you agree to our{' '}
            <Link to="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="bg-lime-400 text-gray-900 hover:bg-lime-500"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
```

### Step 2: Add CookieBanner to App.js

Modify `frontend/src/App.js`:

Add import at top (after other imports around line 34):
```jsx
import CookieBanner from './components/CookieBanner';
```

Add `<CookieBanner />` inside the App function's return, just before `</BrowserRouter>` (around line 198):
```jsx
                    <Toaster />
                    <CookieBanner />
                  </div>
```

### Step 3: Verify the banner appears

Run: `cd frontend && npm start`

Expected:
1. Open http://localhost:3000 in incognito window
2. Cookie banner appears at bottom after 500ms delay
3. Click "Accept" - banner disappears
4. Refresh page - banner does NOT reappear
5. Clear localStorage, refresh - banner appears again

### Step 4: Commit

```bash
git add frontend/src/components/CookieBanner.jsx frontend/src/App.js
git commit -m "feat: add cookie consent banner with localStorage persistence"
```

---

## Task 2: Footer Integration - MainLayout

**Files:**
- Modify: `frontend/src/components/layout/MainLayout.jsx`

### Step 1: Add Footer import and component

Modify `frontend/src/components/layout/MainLayout.jsx`:

Add import at top (line 3):
```jsx
import Footer from './Footer';
```

The current MainLayout structure needs Footer added. Replace the entire component:

```jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ title = 'Dashboard', subtitle, rightPanel }) => {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* 1. Sidebar (Fixed Left) */}
      <div className="w-[260px] flex-shrink-0 border-r border-border bg-card z-20 hidden md:block">
        <Sidebar />
      </div>

      {/* 2. Main Content Area (Fluid Center) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Header (Sticky Top) */}
        <Header title={title} subtitle={subtitle} />

        {/* Scrollable Content + Footer */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-6">
              <div className="max-w-5xl mx-auto w-full">
                <Outlet />
              </div>
            </div>
            <Footer />
          </div>
        </main>
      </div>

      {/* 3. Right Panel (Fixed Right - Optional) */}
      {rightPanel && (
        <div className="w-80 flex-shrink-0 border-l border-border bg-card z-10 hidden xl:flex flex-col overflow-y-auto">
          {rightPanel}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
```

### Step 2: Verify Footer appears in authenticated pages

Run: `cd frontend && npm start`

Expected:
1. Log in to app
2. Navigate to /finances/income
3. Scroll to bottom - Footer should be visible
4. Navigate to /settings - Footer should be visible
5. Footer links to Privacy Policy and Terms work

### Step 3: Commit

```bash
git add frontend/src/components/layout/MainLayout.jsx
git commit -m "feat: integrate Footer into MainLayout for authenticated pages"
```

---

## Task 3: Footer Integration - Login Page

**Files:**
- Modify: `frontend/src/pages/Login.jsx`

### Step 1: Read current Login.jsx structure

The Login page is a standalone page (not using MainLayout). We need to add a minimal footer.

### Step 2: Add Footer to Login page

Modify `frontend/src/pages/Login.jsx`:

Add import at top:
```jsx
import { Link } from 'react-router-dom';
```

Find the closing `</div>` of the main container (the one with `min-h-screen flex`).

Add before the final closing `</div>` but after the form section:

```jsx
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center text-sm text-gray-500">
        <Link to="/legal/privacy" className="hover:text-gray-700">Privacy Policy</Link>
        <span className="mx-2">|</span>
        <Link to="/legal/terms" className="hover:text-gray-700">Terms of Service</Link>
      </div>
```

### Step 3: Verify Footer on Login page

Run: `cd frontend && npm start`

Expected:
1. Navigate to /login
2. Footer links visible at bottom
3. Click "Privacy Policy" - navigates correctly
4. Click "Terms of Service" - navigates correctly

### Step 4: Commit

```bash
git add frontend/src/pages/Login.jsx
git commit -m "feat: add legal footer links to Login page"
```

---

## Task 4: Footer Integration - Register Page

**Files:**
- Modify: `frontend/src/pages/Register.jsx`

### Step 1: Add Footer to Register page

Apply same pattern as Login page.

Modify `frontend/src/pages/Register.jsx`:

Find the closing of main container and add before final `</div>`:

```jsx
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center text-sm text-gray-500">
        <Link to="/legal/privacy" className="hover:text-gray-700">Privacy Policy</Link>
        <span className="mx-2">|</span>
        <Link to="/legal/terms" className="hover:text-gray-700">Terms of Service</Link>
      </div>
```

### Step 2: Verify Footer on Register page

Expected:
1. Navigate to /register
2. Footer links visible at bottom
3. Links work correctly

### Step 3: Commit

```bash
git add frontend/src/pages/Register.jsx
git commit -m "feat: add legal footer links to Register page"
```

---

## Task 5: Sentry Verification - Frontend

**Files:**
- Read: `frontend/src/utils/sentry.js` (already exists)
- Read: `frontend/src/index.js`
- Modify: `frontend/.env.example` (document required var)

### Step 1: Verify Sentry is initialized in index.js

Read `frontend/src/index.js` and confirm `initSentry()` is called.

### Step 2: Create/update .env.example

Create or update `frontend/.env.example`:

```bash
# Sentry Error Tracking (Required for production)
REACT_APP_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# API URL
REACT_APP_API_URL=http://localhost:8000
```

### Step 3: Document verification steps

The Sentry code is already implemented. Verification requires:
1. Create Sentry account at https://sentry.io
2. Create React project, get DSN
3. Add `REACT_APP_SENTRY_DSN` to Cloudflare Pages environment
4. Deploy and check console for `[Sentry] Error tracking initialized`

### Step 4: Commit

```bash
git add frontend/.env.example
git commit -m "docs: document SENTRY_DSN in env.example"
```

---

## Task 6: Sentry Verification - Backend

**Files:**
- Read: `backend/utils/sentry_config.py` (already exists)
- Modify: `backend/.env.example` (document required var)

### Step 1: Verify backend Sentry config

Read `backend/utils/sentry_config.py` - confirms Sentry SDK is configured.

### Step 2: Create/update backend .env.example

Create or update `backend/.env.example`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-here

# Sentry Error Tracking (Required for production)
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Environment
ENVIRONMENT=development

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=PropEquityLab <noreply@propequitylab.com>

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGINS=http://localhost:3000
```

### Step 3: Commit

```bash
git add backend/.env.example
git commit -m "docs: document all required env vars in backend .env.example"
```

---

## Task 7: Update Production Readiness Task List

**Files:**
- Modify: `docs/plans/PRODUCTION_READINESS_TASKS.md`

### Step 1: Mark completed tasks

Update the task list to reflect:
- [x] Settings Page with GDPR UI - ALREADY DONE (verified exists)
- [x] Cookie Banner Implementation - DONE (this plan)
- [x] Set up Sentry Error Monitoring - Code exists, needs DSN config only
- [x] Footer Integration - DONE (this plan)

### Step 2: Fix inaccuracies

- Change "10-step property wizard" to "8-step onboarding wizard"
- Update Progress Summary table

### Step 3: Commit

```bash
git add docs/plans/PRODUCTION_READINESS_TASKS.md
git commit -m "docs: update production readiness with completed tasks"
```

---

## Summary

| Task | Files | Commits |
|------|-------|---------|
| 1. Cookie Banner | CookieBanner.jsx, App.js | 1 |
| 2. Footer - MainLayout | MainLayout.jsx | 1 |
| 3. Footer - Login | Login.jsx | 1 |
| 4. Footer - Register | Register.jsx | 1 |
| 5. Sentry - Frontend | .env.example | 1 |
| 6. Sentry - Backend | .env.example | 1 |
| 7. Update Task List | PRODUCTION_READINESS_TASKS.md | 1 |

**Total: 7 tasks, 7 commits**

---

## Verification Checklist

After all tasks complete:

- [ ] Cookie banner appears on first visit
- [ ] Cookie banner respects consent (doesn't reappear)
- [ ] Footer visible on authenticated pages (scroll to bottom)
- [ ] Footer visible on Login page
- [ ] Footer visible on Register page
- [ ] Footer links work (Privacy, Terms)
- [ ] Frontend .env.example documents SENTRY_DSN
- [ ] Backend .env.example documents all required vars
- [ ] Production task list updated with accurate status
