# Monitoring & Observability Setup Guide

This guide outlines the steps to configure production monitoring for PropEquityLab.

---

## 1. Sentry (Error & Performance Tracking)

### Step 1: Create Projects
1. Log in to [Sentry](https://sentry.io).
2. Create two new projects:
   - `propequitylab-frontend` (React)
   - `propequitylab-backend` (FastAPI)

### Step 2: Configure DSNs in GitHub Secrets
Add the following secrets to your GitHub repository:
- `REACT_APP_SENTRY_DSN`: The client key (DSN) for the frontend project.
- `SENTRY_DSN`: The client key (DSN) for the backend project.

---

## 2. UptimeRobot (Availability Monitoring)

Add the following monitors in [UptimeRobot](https://uptimerobot.com):

### Monitor 1: Backend Health
- **Type:** HTTP(s)
- **Friendly Name:** PropEquityLab - Backend API
- **URL:** `https://h3nhfwgxgf.ap-southeast-2.awsapprunner.com/api/health`
- **Interval:** 5 minutes
- **Monitoring Method:** HEAD (to minimize load/bandwidth)

### Monitor 2: Frontend Home
- **Type:** Keyword (Optional) or HTTP(s)
- **Friendly Name:** PropEquityLab - Frontend
- **URL:** `https://propequitylab.com`
- **Interval:** 5 minutes

---

## 3. GitHub Secrets Summary

Ensure all the following secrets are correctly set for the `main` branch deployment:

| Secret Name | Purpose | Example / Note |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon.tech Connection String | Required for Backend |
| `JWT_SECRET` | Auth Token Secret | Required for Backend |
| `CORS_ORIGINS` | Allowed Domains | `https://propequitylab.com,https://propequitylab.pages.dev` |
| `SENTRY_DSN` | Backend Error Tracking | From Sentry Backend Project |
| `REACT_APP_SENTRY_DSN` | Frontend Error Tracking | From Sentry Frontend Project |
| `RESEND_API_KEY` | Email Service | Required for Email Utility |

---

## 4. Verification

Once deployed, verify:
1. **Logs:** Check AWS CloudWatch logs for the message: `Sentry initialized`.
2. **Dashboard:** Visit the frontend and check the browser console for: `[Sentry] Error tracking initialized`.
3. **Trigger Test Error:** 
   - Backend: Hit a non-existent endpoint or a known error route (if implemented).
   - Frontend: `throw new Error("Sentry Test Error")` in `index.js` temporary console check.
