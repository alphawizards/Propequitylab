# UptimeRobot Monitoring Setup Guide

**Date:** January 9, 2026
**Status:** Ready to Configure
**Priority:** HIGH (Critical for production uptime monitoring)
**Time:** 20 minutes

---

## 🎯 Overview

UptimeRobot monitors your application 24/7 and alerts you immediately if it goes down. This is essential for production applications.

**What UptimeRobot Does:**
- ✅ Checks if your website is online every 5 minutes
- ✅ Sends instant alerts (email, SMS, Slack) when site goes down
- ✅ Tracks uptime percentage (99.9% target)
- ✅ Provides public status page
- ✅ Records downtime incidents

---

## 📋 Step 1: Create UptimeRobot Account (3 minutes)

1. Go to: https://uptimerobot.com
2. Click "Free Sign Up"
3. Create account with your email
4. Verify email address
5. Log in to dashboard

**Free Tier Includes:**
- 50 monitors
- 5-minute check intervals
- Email/SMS/Slack alerts
- Public status pages
- Unlimited alerts

---

## 📋 Step 2: Create Frontend Monitor (5 minutes)

### 2.1 Add Monitor

1. Click "Add New Monitor" (green button)
2. Configure monitor:

**Monitor Type:** HTTP(s)

**Friendly Name:** `PropEquityLab - Frontend`

**URL:** `https://propequitylab.com`

**Monitoring Interval:** `5 minutes` (free tier)

**Monitor Timeout:** `30 seconds`

**Alert Contacts:** (Add your email - see Step 4)

### 2.2 Advanced Settings

**HTTP Method:** `GET`

**Expected Status Code:** `200`

**Keyword Monitoring:**
- Enable: `Yes`
- Keyword Type: `exists`
- Keyword Value: `PropEquityLab` or `Propequitylab`
  (This verifies page content is loading, not just returning 200)

**SSL Certificate Expiration:** Enable notification

**Click "Create Monitor"**

---

## 📋 Step 3: Create Backend API Monitor (5 minutes)

### 3.1 Add Monitor

1. Click "Add New Monitor" again
2. Configure monitor:

**Monitor Type:** HTTP(s)

**Friendly Name:** `PropEquityLab - Backend API`

**URL:** `https://[your-aws-app-runner-url]/health`
(Replace with your actual AWS App Runner URL)

**Monitoring Interval:** `5 minutes`

**Monitor Timeout:** `30 seconds`

**Alert Contacts:** (Same email as frontend)

### 3.2 Advanced Settings

**HTTP Method:** `GET`

**Expected Status Code:** `200`

**Response Body Contains:**
```json
"status": "healthy"
```

**Click "Create Monitor"**

---

## 📋 Step 4: Configure Alert Contacts (3 minutes)

### 4.1 Add Email Alert

1. Go to "My Settings" → "Alert Contacts"
2. Click "Add Alert Contact"
3. Configure:

**Alert Contact Type:** `E-mail`

**Friendly Name:** `Primary Email`

**Email Address:** Your email

**Click "Create Alert Contact"**

### 4.2 Add SMS Alert (Optional, Recommended)

1. Click "Add Alert Contact" again
2. Configure:

**Alert Contact Type:** `SMS`

**Friendly Name:** `Primary Phone`

**Phone Number:** Your phone (with country code)

**Note:** Free tier includes SMS alerts

**Click "Create Alert Contact"**

### 4.3 Add Slack Alert (Optional)

If you use Slack:

1. Click "Add Alert Contact"
2. Select "Slack"
3. Follow Slack OAuth flow
4. Select channel: `#alerts` or `#production`
5. Save

---

## 📋 Step 5: Create Public Status Page (4 minutes)

### 5.1 Create Page

1. Go to "Public Status Pages"
2. Click "Add New Status Page"
3. Configure:

**Friendly Name:** `PropEquityLab Status`

**Monitors to Show:**
- ✅ PropEquityLab - Frontend
- ✅ PropEquityLab - Backend API

**Custom Domain:** (Optional)
- Add CNAME: `status.propequitylab.com` → UptimeRobot URL

**Design:**
- Logo: Upload PropEquityLab logo
- Theme: Light or Dark
- Show uptime percentages: Yes
- Show response times: Yes

**Click "Create Status Page"**

### 5.2 Get Status Page URL

You'll receive a URL like:
```
https://stats.uptimerobot.com/xxxxxxx
```

Share this with users for transparency!

---

## 📋 Step 6: Configure Alert Thresholds (2 minutes)

### 6.1 Downtime Alert Settings

1. Go to each monitor's settings
2. Configure:

**Alert Down After:** `1 check` (5 minutes)
(Alerts you immediately when site goes down)

**Alert Up After:** `1 check`
(Alerts you when site comes back up)

**Alert Reminder:** `Every 10 minutes`
(Reminds you every 10 min if site still down)

### 6.2 Performance Alert (Optional)

1. Enable "Response Time Alert"
2. Set threshold: `> 3000ms` (3 seconds)
3. This alerts if site is slow but not down

---

## 📊 What to Monitor

### Frontend Health Checks:
- ✅ Homepage loads (`/`)
- ✅ Login page loads (`/login`)
- ✅ Calculator page loads (`/calculators/mortgage`)
- ✅ Privacy policy loads (`/privacy-policy`)

### Backend API Health Checks:
- ✅ Health endpoint (`/health`)
- ✅ API root (`/api/v1`)
- ✅ Authentication endpoint (`/api/v1/auth/me`) - with valid token

---

## 🔔 Alert Configuration Examples

### Recommended Alert Setup:

**For Downtime:**
```
Subject: 🚨 PropEquityLab is DOWN
Body:
The [MonitorName] is down!
URL: [MonitorURL]
Started: [AlertDateTime]
Reason: [AlertDetails]

Action Required:
1. Check AWS App Runner status
2. Check Cloudflare Pages status
3. Review recent deployments
```

**For Recovery:**
```
Subject: ✅ PropEquityLab is BACK UP
Body:
The [MonitorName] is back up!
Downtime: [AlertDuration]
```

---

## 📈 Understanding Uptime Metrics

### Target Uptime: 99.9% (Industry Standard)

**99.9% uptime = 43.8 minutes of downtime per month**

| Uptime % | Downtime per Month | Downtime per Year |
|----------|-------------------|-------------------|
| 99.0%    | 7.2 hours         | 3.65 days         |
| 99.5%    | 3.6 hours         | 1.83 days         |
| 99.9%    | 43.8 minutes      | 8.76 hours        |
| 99.99%   | 4.3 minutes       | 52.6 minutes      |

**Your Goal:** Maintain 99.9%+ uptime

---

## 🚨 Incident Response Playbook

### When You Get Downtime Alert:

**Step 1: Verify (30 seconds)**
- Open browser, visit site yourself
- Check from different device/network

**Step 2: Check Status (1 minute)**
- GitHub Actions: https://github.com/alphawizards/Propequitylab/actions
- AWS App Runner: Check service status
- Cloudflare Pages: Check deployment status

**Step 3: Identify Issue (2 minutes)**
Common causes:
- ❌ Recent deployment failed
- ❌ AWS App Runner crashed
- ❌ Database connection lost
- ❌ Cloudflare outage
- ❌ SSL certificate expired

**Step 4: Fix (varies)**
- Rollback deployment if recent change
- Restart AWS App Runner service
- Check database connection
- Review error logs

**Step 5: Verify Recovery (1 minute)**
- Check UptimeRobot shows "Up"
- Test site functionality
- Review logs for errors

**Step 6: Post-Mortem (15 minutes)**
- Document what happened
- Add monitoring to prevent recurrence
- Update runbook

---

## 📊 Dashboard & Reporting

### View Uptime Statistics:

1. Go to UptimeRobot dashboard
2. See metrics:
   - Current status (Up/Down)
   - Uptime % (last 24h, 7d, 30d, 90d)
   - Average response time
   - Incident count
   - Last downtime event

### Weekly Report Email:

1. Go to Settings → Weekly Reports
2. Enable: `Yes`
3. Day: `Monday`
4. Includes:
   - Uptime summary for all monitors
   - Response time trends
   - Incident log

---

## ✅ Success Criteria

UptimeRobot is properly configured when:

- ✅ Both monitors showing "Up" status
- ✅ Test alert received (trigger by pausing monitor)
- ✅ Public status page accessible
- ✅ Response times < 1000ms average
- ✅ No false alerts (adjust sensitivity if needed)

---

## 🔧 Maintenance Tasks

### Daily (Automated):
- UptimeRobot checks site every 5 minutes
- You do nothing unless alert received

### Weekly:
- Review uptime % (should be > 99.5%)
- Check for slow response time trends
- Review incident log

### Monthly:
- Update alert contacts if needed
- Add new monitors for new features
- Review and optimize alert thresholds

---

## 💰 Cost Considerations

### Free Tier (Sufficient for Launch):
- $0/month
- 50 monitors (you need 2)
- 5-minute intervals
- Email/SMS alerts
- Good for: Early stage, < 10K users

### Paid Plan (Consider Later):
- $7/month (Pro)
- 1-minute intervals
- More monitors
- Advanced analytics
- Good for: Growth stage, > 10K users

**Recommendation:** Start with free tier, upgrade at 5K+ users

---

## 🔗 Useful Links

- **UptimeRobot Dashboard:** https://uptimerobot.com/dashboard
- **Status Page:** https://stats.uptimerobot.com/[your-page]
- **Mobile App:** Available on iOS/Android
- **API Docs:** https://uptimerobot.com/api (for custom integrations)

---

## 📝 Next Steps

After UptimeRobot is configured:

1. ✅ Test alerts (pause monitor, verify email received)
2. ✅ Share status page URL with team
3. ✅ Add status page link to footer
4. ✅ Document incident response process
5. ✅ Set calendar reminder to review metrics weekly

---

**Status:** Ready to configure
**Time to Complete:** 20 minutes
**Impact:** Critical for production monitoring
