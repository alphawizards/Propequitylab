# Task: PropEquityLab MVP Launch Execution

- [ ] Phase 9D: User Onboarding Improvements [High Priority] <!-- id: 0 -->
    - [ ] **Frontend**: Implement `WelcomeModal` Component <!-- id: 1 -->
        - [ ] Create `frontend/src/components/onboarding/WelcomeModal.jsx` using `Dialog` from Shadcn/UI <!-- id: 2 -->
        - [ ] **Optimization**: Lazy load `WelcomeModal` (`React.lazy`) to reduce initial bundle size for existing users <!-- id: 3 -->
        - [ ] Integrate into `frontend/src/App.jsx` or `DashboardPage` wrapped in `Suspense` <!-- id: 4 -->
        - [ ] State Management: Update `AuthContext` to handle "seen welcome" state <!-- id: 5 -->
    - [ ] **Backend**: Implement Sample Data Seeding <!-- id: 6 -->
        - [ ] Create endpoint `POST /api/users/seed-sample-data` in `backend/routes/users.py` <!-- id: 7 -->
        - [ ] Logic: Generate dummy Portfolio, Properties, Income, Expenses for the current user <!-- id: 8 -->
        - [ ] **Verification**: Test with `curl` or Swagger UI <!-- id: 9 -->
    - [ ] **Integration**: "Quick Start" Flow <!-- id: 10 -->
        - [ ] Add "Load Demo Data" button to `WelcomeModal` calling the seed endpoint <!-- id: 11 -->
        - [ ] **UX**: Use `useTransition` or specific loading state for the "Load Demo Data" action to maintain UI responsiveness <!-- id: 12 -->
        - [ ] Add "Start Fresh" button redirecting to `/onboarding` <!-- id: 13 -->
    - [ ] **UX**: Contextual Tooltips <!-- id: 14 -->
        - [ ] Identify complex fields (e.g., LVR, Growth Rate) in `PropertyFormModal` <!-- id: 15 -->
        - [ ] Implement `TooltipProvider` and `Tooltip` components from `ui/tooltip` <!-- id: 16 -->

- [ ] Phase 9E: Monitoring & Analytics [Medium Priority] <!-- id: 17 -->
    - [ ] **Frontend**: Sentry Finalization <!-- id: 18 -->
        - [ ] Review `frontend/src/utils/sentry.js` for proper DSN environment variable usage (`REACT_APP_SENTRY_DSN`) <!-- id: 19 -->
        - [ ] Create an Error Boundary component `frontend/src/components/ErrorBoundary.jsx` wrapping the main App <!-- id: 20 -->
        - [ ] **Optimization**: Ensure Error Boundary catches render errors without crashing the entire app <!-- id: 21 -->
    - [ ] **Backend**: Health & Performance <!-- id: 22 -->
        - [ ] Ensure `GET /health` returns DB connection status <!-- id: 23 -->
        - [ ] **Verification**: Add `tests/integration/test_health_monitor.py` <!-- id: 24 -->
    - [ ] **Performance Audit** <!-- id: 25 -->
        - [ ] Run Lighthouse on Dashboard to check for LCP/CLS regressions <!-- id: 26 -->

- [ ] Phase 9F: Quality Assurance & Polish [Medium Priority] <!-- id: 27 -->
    - [ ] **Legal Pages Verification** <!-- id: 28 -->
        - [ ] Audit `frontend/src/pages/PrivacyPolicy.jsx` againt GDPR requirements (Review only) <!-- id: 29 -->
        - [ ] Ensure links in `Footer.jsx` point correctly to `/privacy-policy` and `/terms-of-service` <!-- id: 30 -->
    - [ ] **Day 4 Checklist Execution** <!-- id: 31 -->
        - [ ] **Manual Test**: Run through "New User Journey" completely on Staging <!-- id: 32 -->
        - [ ] **Responsive Check**: Verify Dashboard layout on Mobile (375px) width <!-- id: 33 -->
        - [ ] **Error Handling**: Verify graceful degradation when API is down (503 response) <!-- id: 34 -->

- [ ] Launch Preparation [Critical] <!-- id: 35 -->
    - [ ] **Security Hardening** <!-- id: 36 -->
        - [ ] Verify `BACKEND_CORS_ORIGINS` in AWS environment matches Cloudflare domain <!-- id: 37 -->
        - [ ] Check `RateLimit` middleware configuration in `backend/main.py` <!-- id: 38 -->
    - [ ] **Final Deployment** <!-- id: 39 -->
        - [ ] Merge `develop` to `main` branch <!-- id: 40 -->
        - [ ] Validate Cloudflare Pages build success <!-- id: 41 -->
        - [ ] Validate AWS App Runner health check <!-- id: 42 -->
