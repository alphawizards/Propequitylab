# PropEquityLab Marketing Plan — SEO + Free Tools Funnel

## Context

PropEquityLab is an Australian property investment portfolio management platform (propequitylab.com). The product is functional but has zero marketing infrastructure — GA4/FB Pixel are stubbed but inactive, no sitemap exists, the landing page lacks SEO tags, and there's no email capture. One public calculator (mortgage) has excellent SEO that serves as the template for expansion. The goal is to get the first 50-100 users via organic channels, then build consistent traffic — all on a $50-200/month budget with maximum automation.

**Strategy:** Build free public calculator tools as SEO entry points → drive traffic from Australian property communities → capture emails → convert to signups. Automate social content from calculator data.

**Target audience:** Primary — multi-property investors (2-5+ properties). Secondary — aspiring investors researching their first purchase.

---

## Tool Stack

| Category | Tool | Cost | Purpose |
|----------|------|------|---------|
| Analytics | Google Analytics 4 | Free | Traffic, conversions |
| Analytics | Microsoft Clarity | Free | Heatmaps, session recordings |
| Email | Mailerlite | Free (up to 1,000 subs) | Email capture and nurture |
| Social scheduling | Buffer | Free (3 channels, 10 posts/queue) | Auto-schedule content |
| AI content | Claude API | ~$20/mo | Generate social posts |
| OG images | Canva free tier | Free | Social sharing images |
| SEO monitoring | Google Search Console | Free | Index status, search queries |

**Total: $0-$20/month in Phases 1-3, scaling to $50-$70 in Phase 4+**

---

## Phase 1: Foundation (Week 1-2) — ~15 hours, $0

### 1A. Technical SEO Fixes

**Activate GA4:**
- File: `frontend/public/index.html`
- Create GA4 property at analytics.google.com
- Replace `G-XXXXXXXXXX` with actual measurement ID, uncomment script block
- Set up events: `sign_up`, `calculator_use`, `email_capture`
- Consider: install `react-ga4` npm package for SPA page-view tracking

**Activate Facebook Pixel:**
- File: `frontend/public/index.html`
- Create pixel at business.facebook.com, replace `YOUR_PIXEL_ID`, uncomment
- Builds retargeting audience from day 1 (even without paid ads)
- Integrate with cookie banner consent

**Create sitemap.xml:**
- File: `frontend/public/sitemap.xml`
- Include all public routes: `/`, `/calculators/mortgage`, `/calculators/stamp-duty` (when built), `/calculators/equity`, `/calculators/rental-income`, `/legal/privacy`, `/legal/terms`
- robots.txt already references it

**Set up Google Search Console:**
- Verify propequitylab.com via Cloudflare DNS TXT record
- Submit sitemap.xml
- Request indexing for all public pages

**Install Microsoft Clarity:**
- File: `frontend/public/index.html`
- Add Clarity script (free heatmaps and session recordings)

**Create OG images:**
- Create `frontend/public/images/og/` directory
- Template: PropEquityLab logo + tagline + emerald brand color (1200x630px)
- Per-page variants: home, mortgage, stamp-duty, equity, rental

### 1B. Landing Page SEO + Improvements

**File: `frontend/src/pages/LandingPage.jsx`**

**Add Helmet SEO tags** (follow MortgageCalculatorPage.jsx pattern exactly):
- Title: "PropEquityLab | Free Australian Property Investment Portfolio Tracker"
- Meta description, OG tags, Twitter cards, canonical URL
- JSON-LD: Organization + WebApplication structured data

**Add email capture section:**
- New component between Trust/Benefits and Footer
- Simple email input + "Get property investing tips" CTA
- POST to Mailerlite API
- Fire GA4 `email_capture` event

**Add social proof section:**
- "Built by an Australian property investor"
- Feature stats: "4 free calculators | Portfolio tracking | Growth projections"
- Security badges: "Data encrypted | No credit card required"

**Add calculator links:**
- New "Free Tools" section linking to all calculators
- Add "Free Tools" nav link in header

### 1C. Brand Social Account Setup

- [ ] Twitter/X: @PropEquityLab
- [ ] Facebook Page: PropEquityLab
- [ ] LinkedIn Company Page: PropEquityLab
- [ ] Reddit: Use personal account (age it 1-2 weeks before any links)

**Success metrics:** GA4 receiving data, Search Console verified, sitemap submitted, landing page OG rendering in social share previews, email capture live

---

## Phase 2: Content Assets (Week 3-6) — ~45 hours, $0

### Calculator Build Order

Build all 3 following the exact architecture of MortgageCalculatorPage.jsx:
- Core logic: `frontend/src/lib/calculators/core/{name}.js`
- Hook: `frontend/src/lib/calculators/hooks/use{Name}Calculator.js`
- Components: `frontend/src/components/calculators/{Name}Calculator/`
- Page: `frontend/src/pages/calculators/{Name}CalculatorPage.jsx`
- Route: Register in `frontend/src/App.js`

**Each page must have:** Helmet SEO block, JSON-LD structured data, FAQ section with FAQPage schema, email capture CTA, related calculators card, 800-1500 word SEO article below calculator.

#### Calculator 1: Stamp Duty (Week 3-4) — HIGHEST PRIORITY
- All 8 states/territories, first home buyer concessions, investment vs owner-occupied, foreign buyer surcharge
- Target keywords: "stamp duty calculator", "stamp duty calculator NSW/VIC/QLD", "first home buyer stamp duty exemption"
- Highest search volume (~20K+ monthly)

#### Calculator 2: Equity Growth (Week 4-5)
- Current value, outstanding loan, usable equity (80% of value minus loan), multi-property equity, growth projection
- Target keywords: "equity calculator property", "usable equity calculator", "how much equity do I have"
- Directly serves primary audience (multi-property investors)

#### Calculator 3: Rental Yield / Income (Week 5-6)
- Gross yield, net yield, cash flow analysis, expense breakdown (rates, insurance, management, maintenance, vacancy)
- Target keywords: "rental yield calculator", "rental income calculator Australia", "net rental yield calculator"

### Email Capture Integration
- Tool: Mailerlite (free up to 1,000 subscribers)
- Place on: landing page, each calculator page (below results), optionally exit-intent popup
- Tag subscribers by source page for segmentation
- "Email me this calculation" feature on each calculator

### OG Images
- Create per-page OG images using Canva template
- Place in `frontend/public/images/og/`
- Reference in each page's Helmet `og:image`

**Success metrics:** 3 new calculator pages live and indexed, email capture on all public pages, OG images rendering correctly

---

## Phase 3: First 50 Users (Week 4-8) — 3-5 hrs/week, $0

### Reddit Strategy

**Target subreddits (priority order):**
1. **r/AusFinance** (~500K members) — primary. No self-promo posts allowed. Contribute helpfully for 2 weeks, then link calculators contextually in replies.
2. **r/AusProperty** (~50K) — more tolerant of "I built this" posts
3. **r/fiaustralia** (~150K) — property investment is frequent topic

**Rules (critical):**
- Use PERSONAL account, not brand
- 90/10 rule: 90% genuine contributions, 10% tool mentions
- Frame as "I built this for myself, thought others might find it useful"
- If a mod warns you, stop immediately

### Australian Property Forums
- **PropertyChat.com.au** — "Tools & Resources" section, build reputation first
- **Whirlpool.net.au** — Finance subforum, very strict anti-spam, participate for weeks first

### Facebook Groups
- Join 3-5 Australian property investor groups
- Observe 1 week, contribute value, share calculators in self-promo threads when available

### Word-of-Mouth
- "Share this calculation" button on calculator results
- "Email me these results" captures email + is forwardable
- Personal outreach to anyone you know who invests in property

**Success metrics:** 50 registered users, 500+ calculator page views, 10+ email subscribers, active presence in 2+ communities

---

## Phase 4: Automated Content & Social (Week 6-10) — 2-3 hrs/week after setup, $0-20/mo

### Content Calendar

| Day | Type | Example |
|-----|------|---------|
| Mon | Market insight | "Sydney median hit $X. Here's what that means for equity" |
| Tue | Calculator tip | "Did you know stamp duty concessions save $X in [state]?" |
| Wed | Education | "Gross yield vs net yield: why the difference matters" |
| Thu | Quick hack | "Fortnightly payments save $X over 30 years" |
| Fri | Feature / community | "New: Equity calculator live" |

**Cadence:** Twitter 4-5/week, Facebook 2-3/week, LinkedIn 1-2/week

### Automation Workflow
1. Create spreadsheet of calculation scenarios (prices × states)
2. Run through calculator core logic to generate data
3. Feed into Claude API prompt templates to generate post text
4. Batch-schedule via Buffer (free tier: 3 channels, 10 posts/queue)
5. Human review: 10-15 minutes to scan batch

### AI Content Prompt Template Example
```
Generate 5 Twitter posts for Australian property investors about stamp duty.
Each: under 280 chars, include a dollar figure, mention a state, end with
CTA to propequitylab.com/calculators/stamp-duty. Tone: helpful, not salesy.
```

**Success metrics:** Consistent 4-5 posts/week for 4+ weeks, 100 followers across platforms, referral traffic from social in GA4

---

## Phase 5: Scale — Consistent Traffic (Month 3+)

### Email Nurture (Automated via Mailerlite)
- **Welcome sequence:** Day 0 (welcome + quick start), Day 3 (calculator links), Day 7 (3 metrics to track), Day 14 (scenario modelling feature)
- **Ongoing newsletter:** Bi-weekly. Market update + calculator tip + feature updates
- **Segment by source:** Mortgage calc signups → loan optimization content, equity calc → portfolio growth content

### Blog / Content SEO (Month 3-4)
- Add `/blog` route, Helmet SEO on each post
- Long-tail targets: "how to calculate stamp duty [state]", "is property a good investment 2026", "negative gearing explained"
- Cadence: 2 posts/month, AI-drafted + human-edited (~1-2 hrs/post)

### Paid Ads (Month 4-6, only after organic proves demand)
**Prerequisites:** 500+ organic visits/month, 3-5% email capture rate, all calculators live

**Google Ads** ($50-100/mo): Calculator keywords ("stamp duty calculator NSW"), send to calculator pages. Expected CPC: $0.50-$2.00

**Facebook Retargeting** ($50-100/mo): Target people who used a calculator but didn't sign up. "You calculated your stamp duty. Now track your entire portfolio for free."

**Do NOT run:** Broad awareness campaigns, LinkedIn ads (too expensive), display ads (low conversion)

### KPIs by Phase

| Phase | KPI | Target |
|-------|-----|--------|
| 1 | GA4 active, Search Console verified | Binary |
| 2 | Calculator pages indexed | All 4 |
| 2 | Email subscribers | 10+ |
| 3 | Registered users | 50 |
| 3 | Calculator monthly page views | 500+ |
| 4 | Social followers (all) | 100+ |
| 4 | Weekly posts published | 4-5 |
| 5 | Monthly organic traffic | 1,000+ visits |
| 5 | Email list | 100+ |
| 5 | Monthly registrations | 20+/month |

### Decision Framework
- **Organic growing >20% MoM:** Double down on SEO content
- **Reddit top referral source:** Increase community engagement
- **Social driving signups:** Upgrade Buffer, increase frequency
- **Nothing working after 8 weeks:** Survey existing users, revisit positioning

---

## Key Keyword Targets

| Keyword | Est. Monthly Search (AU) | Target Page |
|---------|--------------------------|-------------|
| stamp duty calculator | 20K+ | /calculators/stamp-duty |
| stamp duty calculator NSW | 8K+ | /calculators/stamp-duty |
| mortgage calculator | 40K+ | /calculators/mortgage |
| rental yield calculator | 2K+ | /calculators/rental-income |
| equity calculator property | 1K+ | /calculators/equity |
| property investment calculator | 1K+ | /calculators/rental-income |
| property portfolio tracker Australia | 200+ | Landing page |

---

## Risk Factors

1. **Reddit bans** — biggest risk. Never use brand account, never cross-post same link, stop if warned
2. **Calculator accuracy** — wrong stamp duty figures spread fast. Triple-check against state revenue office sources. Add disclaimer
3. **Over-automating social** — AI-generated posts that feel robotic hurt more than help. Always human-review
4. **Spreading too thin** — focus ONE channel at a time. Depth > breadth
5. **Mobile experience** — most Reddit/social traffic is mobile. Test all calculators on mobile

---

## Timeline Summary

| Week | Key Actions |
|------|-------------|
| 1 | Activate GA4 + FB Pixel, create sitemap, set up Search Console, create OG images |
| 2 | Landing page SEO + email capture + social proof, set up social accounts |
| 3-4 | Build stamp duty calculator |
| 4-5 | Build equity calculator, start Reddit/forum engagement (no links yet) |
| 5-6 | Build rental yield calculator, first calculator shares in communities |
| 6-8 | Set up Buffer, batch-generate social content, continue community engagement |
| 8-10 | Optimize from data, set up email nurture, refine content calendar |
| Month 3+ | Launch blog, scale what works, consider paid ads |

---

## Critical Files

- `frontend/public/index.html` — activate GA4, FB Pixel, add Clarity
- `frontend/src/pages/LandingPage.jsx` — Helmet SEO, email capture, social proof, calculator links
- `frontend/src/pages/calculators/MortgageCalculatorPage.jsx` — template pattern for all new calculators
- `frontend/src/App.js` — register new calculator routes
- `frontend/public/sitemap.xml` — create new
- `frontend/public/robots.txt` — already correct

---

## Verification

After each phase:
1. **Phase 1:** Run Facebook Sharing Debugger on propequitylab.com — verify OG tags render. Check GA4 real-time view shows data. Confirm sitemap.xml accessible at propequitylab.com/sitemap.xml
2. **Phase 2:** Google "site:propequitylab.com" — all calculator pages should appear within 2-4 weeks. Test email capture flow end-to-end. Share calculator link on Twitter — verify OG card renders
3. **Phase 3:** Check GA4 for sign_up events reaching 50. Review referral traffic sources
4. **Phase 4:** Buffer analytics show consistent posting. GA4 shows social referral traffic
5. **Phase 5:** Google Search Console shows impression growth. Monthly traffic trend in GA4
