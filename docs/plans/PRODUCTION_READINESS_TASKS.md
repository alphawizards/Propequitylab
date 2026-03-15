# PropEquityLab - Production Readiness Task List

> **Generated:** 2026-02-05
> **Current Status:** Backend Production-Ready | Frontend Auth & UI Polish Pending

---

## Executive Summary

Based on analysis of the uploaded task list and existing documentation, PropEquityLab's backend is **production-ready** with enterprise-grade authentication, security, and GDPR compliance. The remaining work focuses on:
1. **Technical Tasks** - Frontend polish, testing, and deployment
2. **Process Tasks** - Privacy standards, operational procedures, and user onboarding
3. **Launch Tasks** - Alpha testing, marketing, and phased rollout

---

## Phase 1: Critical Technical Tasks (Week 1-2)

> **🎯 Goal:** Achieve feature freeze and production-stable code

### Week 1 - Core Functionality
- [ ] **Finalize 10-step property wizard and test for errors**
  - Validate all wizard steps complete correctly
  - Test edge cases (empty fields, invalid inputs)
  - Verify data persists to database correctly

- [ ] **Settings Page with GDPR UI** (from existing blockers)
  - Data export button
  - Account deletion modal
  - Profile settings
  - Password change

- [ ] **Cookie Banner Implementation**
  - Shows on first visit
  - Stores consent in localStorage
  - Links to Privacy Policy

- [ ] **Set up Sentry Error Monitoring** (follow `SENTRY_SETUP_GUIDE.md`)
  - Create Sentry account and projects
  - Add environment variables
  - Test error tracking

### Week 2 - Legal & Privacy
- [ ] **Draft and embed Privacy Policy with "Newspaper Test" transparency**
  - Apply "Newspaper Test" principle (would you be comfortable if this was on the front page?)
  - Review and finalise `frontend/src/pages/legal/PrivacyPolicy.jsx`
  - Ensure Australian Privacy Principles compliance

- [ ] **Finalize "Newspaper Test" Privacy Standards**
  - Document data collection practices
  - Make data usage crystal clear to users
  - Add user-friendly explanations

---

## Phase 2: UI/UX Polish (Week 2-3)

> **🎯 Goal:** Month 1 - Achieve Feature Freeze and Polish UI

- [ ] **Light/Dark Mode Consistency**
  - Fix any remaining hardcoded dark colours
  - Ensure all components respect theme switching

- [ ] **Footer Integration**
  - Add Footer to MainLayout
  - Add Footer to Login/Register pages
  - Add Footer to legal pages

- [ ] **Mobile Responsiveness Audit**
  - Test all pages on mobile viewports
  - Fix any layout issues

- [ ] **Accessibility Compliance**
  - Keyboard navigation
  - Screen reader compatibility
  - WCAG 2.1 AA compliance

---

## Phase 3: Operational Setup (Week 3-4)

> **🎯 Goal:** Establish low-maintenance support and onboarding systems

### User Onboarding
- [ ] **Audit "Say/Do Ratio" for Onboarding**
  - Map what we promise vs. what we deliver
  - Ensure onboarding sets correct expectations
  - Remove any overpromising language

- [ ] **Set up automated welcome email sequence**
  - Welcome email (immediate)
  - Day 2: Quick tips
  - Day 7: Check-in / first property prompt

### Support & Operations
- [ ] **Establish "Low-Maintenance" Support System**
  - Set up help centre / FAQ
  - Define support response SLAs
  - Create canned responses for common questions
  - Implement in-app feedback mechanism

- [ ] **Set 24-Hour "Waiting Period" for Feature Requests**
  - Document the policy: "We'll acknowledge within 24hrs, but won't commit to timelines"
  - Implement feature request intake form
  - Set up triage process

---

## Phase 4: Alpha Testing (Week 4)

> **🎯 Goal:** Validate with real users before soft launch

- [ ] **Secure 2 Alpha testers and record walkthrough**
  - Identify trusted inner circle users
  - Schedule recorded sessions
  - Document feedback and issues

- [ ] **Define "Circle of Competence" Boundaries**
  - What PropEquityLab DOES well
  - What PropEquityLab DOES NOT do
  - Document boundaries for marketing/support

- [ ] **Post-Launch "Patience" Check**
  - Define success metrics for alpha
  - Set realistic expectations
  - Plan gradual rollout cadence

---

## Phase 5: Soft Launch (Month 2)

> **🎯 Goal:** Soft launch to Inner Circle (5-10 users)

- [ ] **Month 2 - Soft launch to Inner Circle (5-10 users)**
  - Deploy to production environment
  - Monitor Sentry for errors
  - Gather structured feedback

- [ ] **Weekly Roadmap Transparency Update**
  - Set up public roadmap (notion/linear/trello)
  - Commit to weekly status updates
  - Share wins and blockers with early users

- [ ] **Schedule "Inversion" Exercise**
  - "What could kill PropEquityLab?" brainstorm
  - Pre-mortem analysis
  - Risk mitigation plan

---

## Phase 6: Growth Preparation (Month 3)

> **🎯 Goal:** Refine Simulation Engine and prep marketing assets

- [ ] **Month 3 - Refine Simulation Engine and prep marketing assets**
  - Polish property simulation calculations
  - Create demo data sets
  - Screenshot/video assets for marketing

- [ ] **Prepare marketing landing page**
  - Clear value proposition
  - Demo video
  - Sign-up flow

---

## Ongoing / Recurring Tasks

These items should become regular habits:

| Task | Cadence | Owner |
|------|---------|-------|
| Weekly Roadmap Transparency Update | Weekly | Product |
| Sentry error review | Daily | Engineering |
| Support queue triage | Daily | Support |
| Feature request review | Weekly | Product |
| "Patience" check-in | Bi-weekly | Founders |

---

## Testing Checklist (Before Each Deployment)

From `PRODUCTION_BLOCKERS_COMPLETE.md`:

### Authentication Flow
- [ ] Register new user → Email verification message shown
- [ ] Click verification link → Success, can login
- [ ] Login with verified account → Dashboard access
- [ ] Logout → Tokens cleared
- [ ] Protected route access without auth → Redirect to login
- [ ] Token refresh on 401 → Seamless re-authentication
- [ ] Forgot password → Reset email sent
- [ ] Reset password with valid token → Success

### Legal & GDPR
- [ ] View Privacy Policy page → Content displays
- [ ] View Terms of Service page → Content displays
- [ ] Footer appears on all pages → Legal links work
- [ ] Download data export → JSON file with all data
- [ ] Delete account → Password confirmation required

---

## Progress Summary

| Phase | Status | Target |
|-------|--------|--------|
| Backend Production | ✅ Complete | Done |
| Frontend Auth | ✅ Complete | Done |
| Legal Pages | ✅ Complete | Done |
| Settings Page | ⏳ Pending | Week 1 |
| Property Wizard | ⏳ Pending | Week 1 |
| Alpha Testing | ⏳ Pending | Week 4 |
| Soft Launch | ⏳ Pending | Month 2 |
| Marketing Prep | ⏳ Pending | Month 3 |

---

*This task list was generated by consolidating items from the project management tool with existing production blocker documentation.*
