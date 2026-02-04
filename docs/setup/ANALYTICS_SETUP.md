# Analytics Setup Guide

**Date:** January 9, 2026
**Status:** Code Ready - Needs Configuration
**Priority:** MEDIUM (Optional for soft launch, recommended for growth tracking)

---

## ✅ What's Been Implemented

PropEquityLab has a complete analytics tracking system ready to use:

### Files Implemented:
1. **`frontend/src/lib/analytics.js`** - Full analytics tracking module
2. **`frontend/public/index.html`** - Analytics script placeholders (GA4 & Facebook Pixel)
3. **Calculator components** - Analytics tracking hooks ready

### Features Available:
- ✅ Calculator usage tracking
- ✅ Calculator view tracking
- ✅ Calculation save tracking
- ✅ Share event tracking
- ✅ Export event tracking
- ✅ Sign-up conversion tracking
- ✅ Premium upgrade tracking
- ✅ Google Analytics 4 support
- ✅ Facebook Pixel support
- ✅ Privacy-focused (no PII in analytics)

---

## 🎯 Analytics Strategy

### Why Analytics Matter:
- **User behavior insights** - See which calculators are most popular
- **Conversion tracking** - Measure sign-ups from calculator usage
- **Marketing ROI** - Track which channels bring engaged users
- **Product decisions** - Data-driven feature prioritization
- **Growth metrics** - Monitor user acquisition and retention

### What to Track (Already Implemented):
1. **Calculator Events:**
   - Which calculators users view
   - How often calculations are performed
   - What loan amounts/LVRs users input (anonymized ranges)
   - Save and share actions

2. **Conversion Events:**
   - Sign-ups from calculator CTAs
   - Premium upgrade conversions
   - Newsletter subscriptions

3. **User Flow:**
   - Landing pages
   - Navigation patterns
   - Time on calculators
   - Exit pages

---

## 📊 Option 1: Google Analytics 4 (Recommended)

### Why GA4:
- **Free** for unlimited users
- **Comprehensive** user journey tracking
- **Integrates** with Google Search Console
- **Industry standard** for web analytics

### Setup Steps (15 minutes):

#### 1. Create GA4 Account

1. Go to: https://analytics.google.com
2. Click "Start measuring"
3. Account name: **PropEquityLab**
4. Property name: **PropEquityLab Website**
5. Time zone: **Australia/Sydney**
6. Currency: **AUD**
7. Business category: **Finance**
8. Business size: **Small**

#### 2. Create Data Stream

1. Select platform: **Web**
2. Website URL: `https://propequitylab.com`
3. Stream name: **PropEquityLab Production**
4. Enhanced measurement: **Enable all** (recommended)
   - Page views ✅
   - Scrolls ✅
   - Outbound clicks ✅
   - Site search ✅
   - Form interactions ✅
   - File downloads ✅

5. Click "Create stream"

#### 3. Get Measurement ID

You'll receive a **Measurement ID** like: `G-XXXXXXXXXX`

Copy this ID - you'll need it next.

#### 4. Add to Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Select project: **propequitylab**
3. Settings → Environment Variables
4. Add variable:
   - **Name:** `REACT_APP_GA_MEASUREMENT_ID`
   - **Value:** Your G-XXXXXXXXXX ID
   - **Type:** Production (and Preview if testing)
5. Save

#### 5. Uncomment Analytics Code

Edit `frontend/public/index.html` and uncomment the Google Analytics section:

```html
<!-- BEFORE: -->
<!-- Uncomment and replace G-XXXXXXXXXX with your actual GA4 ID
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
...
-->

<!-- AFTER: -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123XYZ');
</script>
```

Replace `G-ABC123XYZ` with your actual Measurement ID.

#### 6. Deploy and Verify

1. Commit and push changes
2. Wait for deployment
3. Visit your site
4. Open GA4 dashboard → Reports → Realtime
5. You should see yourself as an active user within 30 seconds

---

## 📱 Option 2: Facebook Pixel (Optional)

### Why Facebook Pixel:
- **Retargeting** - Show ads to calculator users
- **Lookalike audiences** - Find similar users
- **Conversion tracking** - Measure ad ROI
- **Free** to set up

### When to Use:
- Planning to run Facebook/Instagram ads
- Want to retarget users who used calculators
- Need conversion tracking for ads

### Setup Steps (10 minutes):

#### 1. Create Facebook Pixel

1. Go to: https://business.facebook.com/events_manager
2. Click "Connect Data Sources" → "Web"
3. Click "Facebook Pixel" → "Connect"
4. Pixel name: **PropEquityLab**
5. Website URL: `https://propequitylab.com`
6. Click "Continue"

#### 2. Get Pixel ID

You'll receive a **Pixel ID** (numbers only): `1234567890123456`

Copy this ID.

#### 3. Add to Environment Variables

1. Cloudflare Pages → Settings → Environment Variables
2. Add variable:
   - **Name:** `REACT_APP_FB_PIXEL_ID`
   - **Value:** Your Pixel ID (numbers only)
   - **Type:** Production
3. Save

#### 4. Uncomment Facebook Pixel Code

Edit `frontend/public/index.html` and uncomment the Facebook Pixel section:

```html
<!-- BEFORE: -->
<!-- Uncomment and replace YOUR_PIXEL_ID with your actual Pixel ID
<script>
  !function(f,b,e,v,n,t,s)
  ...
-->

<!-- AFTER: -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1234567890123456');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=1234567890123456&ev=PageView&noscript=1"
/></noscript>
```

Replace `1234567890123456` with your actual Pixel ID.

#### 5. Verify Installation

1. Install "Facebook Pixel Helper" Chrome extension
2. Visit your website
3. Extension icon should turn blue with "1" badge
4. Click to see: "Pixel ABC loaded correctly"

---

## 📈 Key Metrics to Monitor

### Week 1-2 (Soft Launch):
1. **Calculator Views** - Which calculators are most popular?
2. **Calculation Completion Rate** - % who complete calculations
3. **Time on Calculator** - Average session duration
4. **Sign-up Conversion Rate** - % who register after using calculators
5. **Traffic Sources** - Where are users coming from?

### Week 3-4 (Growth):
1. **User Retention** - Are users coming back?
2. **Calculator Sequence** - Which calculators do users try next?
3. **Premium Conversion** - % who upgrade after sign-up
4. **Share Rate** - How often users share calculations
5. **Export Rate** - How often users export data (PDF/CSV)

### Monthly:
1. **Active Users** - Monthly active user count
2. **User Acquisition Cost** - If running ads
3. **Lifetime Value** - Revenue per user
4. **Churn Rate** - % of users who stop using
5. **Net Promoter Score** - Would users recommend? (survey)

---

## 🔍 Custom Events Being Tracked

The `frontend/src/lib/analytics.js` file tracks these custom events:

### Calculator Events:
```javascript
trackCalculatorView('mortgage');           // User views calculator
trackCalculatorUsage('mortgage', {...});   // User performs calculation
trackCalculatorSave('mortgage');           // User saves calculation
trackCalculatorShare('mortgage', 'email'); // User shares calculation
trackCalculatorExport('mortgage', 'pdf');  // User exports data
```

### Conversion Events:
```javascript
trackSignupConversion('calculator');       // User signs up
trackPremiumUpgrade('premium-monthly', 9.99); // User upgrades
```

### Privacy Protection:
All tracked data is **anonymized**:
- ❌ No exact loan amounts (only ranges: "500k-750k")
- ❌ No personal information
- ❌ No email addresses in analytics
- ❌ No property addresses
- ✅ Only aggregated behavior data

---

## 📊 GA4 Dashboard Setup (Recommended)

### Create Custom Reports:

#### 1. Calculator Performance Report

1. GA4 → Explore → Blank
2. Name: **Calculator Performance**
3. Dimensions:
   - Event name
   - Page path
   - Calculator type (custom)
4. Metrics:
   - Event count
   - Users
   - Sessions
   - Average engagement time

#### 2. Conversion Funnel Report

1. GA4 → Explore → Funnel exploration
2. Name: **Calculator to Sign-up Funnel**
3. Steps:
   - Page view (calculator)
   - Calculation performed
   - Sign-up button clicked
   - Registration completed

#### 3. User Acquisition Report

1. GA4 → Reports → Acquisition → User acquisition
2. Add secondary dimension: **Landing page**
3. Filter to calculator pages
4. See which sources bring engaged users

---

## 🎯 Success Criteria

Analytics is properly configured when:

- ✅ Real-time events visible in GA4 dashboard
- ✅ Custom calculator events appearing
- ✅ User IDs tracked for logged-in users
- ✅ Conversion events firing correctly
- ✅ No PII visible in reports
- ✅ Facebook Pixel Helper shows green (if using FB)

---

## 🚨 Common Issues & Solutions

### Issue: Events not appearing in GA4
**Solution:**
1. Check browser console for errors
2. Verify Measurement ID is correct
3. Disable ad blockers (they block analytics)
4. Wait 24-48 hours for full data processing

### Issue: Too many events (hitting limits)
**Solution:**
1. Reduce sample rate in `analytics.js`
2. Filter out less important events
3. Upgrade to GA4 360 if needed (unlikely at your scale)

### Issue: Facebook Pixel not firing
**Solution:**
1. Check Pixel ID is correct (numbers only, no spaces)
2. Use Facebook Pixel Helper to debug
3. Check browser console for fbq errors
4. Verify Pixel is "Active" in Events Manager

---

## 💰 Cost Considerations

### Google Analytics 4:
- **Free** for up to 10 million events/month
- **Your usage:** ~50K events/month (well within limit)
- **Cost:** $0/month

### Facebook Pixel:
- **Free** to install and use
- **Ad spend:** Only if you run ads (optional)
- **Cost:** $0/month (just tracking)

---

## 📝 Next Steps

After analytics is configured:

1. ✅ Verify events in GA4 Realtime (test all calculators)
2. ✅ Set up custom reports in GA4
3. ✅ Create conversion goals (sign-up, premium upgrade)
4. ✅ Set up weekly email reports
5. ✅ Document baseline metrics (Week 1 benchmarks)
6. ✅ Share dashboard access with team

---

## 🔗 Useful Links

- **GA4 Dashboard:** https://analytics.google.com
- **GA4 Setup Guide:** https://support.google.com/analytics/answer/9304153
- **Facebook Events Manager:** https://business.facebook.com/events_manager
- **GA4 Reports Gallery:** https://analytics.google.com/analytics/gallery/

---

**Status:** ✅ Code ready, optional for soft launch
**Time to Complete:** ~20 minutes (GA4) or ~30 minutes (GA4 + FB Pixel)
**Impact:** Medium (valuable for growth, not critical for launch)
