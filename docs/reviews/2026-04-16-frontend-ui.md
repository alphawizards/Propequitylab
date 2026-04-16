# Frontend UI Engineering Review — 2026-04-16

Reviewed by: automated agent audit  
Stack: React 19, shadcn/ui, Tailwind CSS 3.4, CRACO, Clerk auth  
Scope: `frontend/src/` — all pages, contexts, components, services

---

## Critical Issues

### 1. Dead Page: `Dashboard.jsx` is orphaned but still bundled

**File:** `frontend/src/pages/Dashboard.jsx`

`Dashboard.jsx` is a legacy prototype that imports from `../data/mockData` and works entirely off hardcoded mock state (`mockPortfolio`, `mockProperties`). It is never routed in `App.js` — `DashboardNew` replaced it — but it is never deleted either. Because CRA/CRACO compiles every file reachable from `index.js` via the module graph AND `App.js` still imports nothing from it, you may think it is tree-shaken. It is not: `mockData.js` is also alive in the bundle as a side-effectful module because `Dashboard.jsx` has a static import chain to it. The file also imports `Navbar`, `AddPropertyModal`, `MembersModal`, `PortfolioHeader`, `PortfolioStats`, `ProjectionControls`, `ProjectionChart`, and `ForecastTable` — all of which enter the bundle.

**Action required:** Delete `frontend/src/pages/Dashboard.jsx` and `frontend/src/data/mockData.js`. Verify that `AddPropertyModal` and `MembersModal` in `frontend/src/components/modals/` have no other importers, then delete those too if they are exclusively used by the dead page.

---

### 2. Inconsistent toast libraries — two systems in use simultaneously

**Files:** `frontend/src/pages/Settings.jsx` (line 20), vs every other page

`Settings.jsx` imports `toast` from `'sonner'` directly. Every other page (`DashboardNew`, `IncomePage`, `SpendingPage`, `LoanManager`, `WelcomeModal`) uses the project's own `useToast` hook from `'../hooks/use-toast'`, which is backed by the Radix-based `<Toaster>` component already mounted in `App.js`.

This means the app has two active toast renderers. In `Settings.jsx` toasts will silently do nothing unless a Sonner `<Toaster>` is also mounted (it is not in `App.js`). The user sees no feedback on settings save, data export, or account deletion — exactly the flows where they need it most.

**Action required:** Replace `import { toast } from 'sonner'` in `Settings.jsx` with `import { useToast } from '../hooks/use-toast'` and switch all calls to `const { toast } = useToast()`.

---

### 3. `refreshSummary` in `PortfolioContext` has no error handling and is not `useCallback`-wrapped

**File:** `frontend/src/context/PortfolioContext.jsx` lines 79–85

```js
const refreshSummary = async () => {
  if (!getToken) return;
  if (currentPortfolio?.id) {
    const data = await api.getPortfolioSummary(currentPortfolio.id);
    setSummary(data);
  }
};
```

Two problems:
1. No `try/catch`. An API failure here is an unhandled promise rejection that silently kills the summary state without any user feedback. This is called directly after every mutation in `PropertiesPage`, `AssetsPage`, and `LiabilitiesPage`.
2. The function is recreated on every render because it is not wrapped in `useCallback`. Every consumer that includes it in a `useEffect` dependency array will re-trigger unnecessarily. Currently none of them do (they call it fire-and-forget), but this is a latent footgun.

**Action required:** Wrap in `useCallback([currentPortfolio?.id, getToken])` and add a `try/catch` that at minimum logs the error. A silent swallow is acceptable here since it's a background refresh, but the unhandled rejection is not.

---

## High Issues

### 4. No lazy loading on any page-level component except `WelcomeModal`

**File:** `frontend/src/App.js` lines 13–33

All 13 protected page components are statically imported at the top of `App.js`. Only `WelcomeModal` is lazy-loaded. This means the initial JS bundle includes every page — `ProjectionsPage`, `ScenarioDashboardPage`, `PlansPage`, `ProgressPage`, `Settings`, `OnboardingWizard`, etc. — even for a user who just landed on `/dashboard`.

Given the stack includes CRACO (CRA-based), route-level code splitting via `React.lazy` is trivial and already demonstrated in the file.

**Action required:** Lazy-load all protected page components. Auth pages (`Login`, `Register`, etc.) can remain eager since they are small and needed immediately for unauthenticated users.

```js
const DashboardNew = lazy(() => import('./pages/DashboardNew'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
// ... etc
```

Wrap the `<Routes>` block in a `<Suspense>` with a skeleton or spinner fallback.

---

### 5. No validation in `PropertyFormModal` — silent bad data submission

**File:** `frontend/src/components/properties/PropertyFormModal.jsx`

The form uses raw `useState` with a `handleChange` dispatcher. There is no schema validation (no Zod, no manual checks) before `handleSubmit` fires. The submit handler calls `parseFloat(formData.purchase_price) || 0` — so a user who leaves `purchase_price` blank submits a property with `purchase_price: 0`. Same applies to `loan_amount`, `interest_rate`, `current_value`, and `rental_income`. These values go into `DECIMAL(19,4)` backend columns and will corrupt financial calculations silently.

The project has `react-hook-form` and `zod` in the stack — `form.jsx` is already in `src/components/ui/`. No page or component actually uses them.

**Action required:** Migrate `PropertyFormModal` to React Hook Form + Zod. Required fields: `address`, `purchase_price` (positive number), `current_value` (positive number), `interest_rate` (0–30 range). The tabbed form layout is compatible with RHF's `register` pattern.

---

### 6. `DashboardNew` — three independent `useEffect`/fetch calls fire in sequence, no coordination

**File:** `frontend/src/pages/DashboardNew.jsx` lines 87–178

`fetchDashboardData`, `fetchNetWorthHistory`, and `fetchProperties` are three separate async functions each with their own loading state, fired from a single `useEffect`. `historyLoading` and general `loading` are separate booleans with no unified state. The skeleton is shown only while `loading` is true, but `historyLoading` and `properties` can still be mid-flight when the skeleton disappears, causing charts to flash empty then populate.

Additionally, `fetchProperties` in `DashboardNew` duplicates the cashflow calculation logic inline (lines 115–125) rather than delegating to a utility. The same calculation is not present in `PropertiesPage`, which means the two pages can show different cashflow figures for the same property.

**Action required (two separate fixes):**
- Combine the three fetches into a single `Promise.all` call so loading states are unified.
- Extract the cashflow calculation to `frontend/src/lib/cashflow.js` and use it in both `DashboardNew` and wherever else it appears.

---

### 7. Mobile navigation is absent — `MainLayout` hides sidebar on mobile with no replacement

**File:** `frontend/src/components/layout/MainLayout.jsx` line 11

```jsx
<div className="w-[260px] flex-shrink-0 ... hidden md:block">
  <Sidebar />
</div>
```

The sidebar is `hidden md:block`. There is no hamburger menu, drawer, or bottom tab bar for screens below `md` (768px). On mobile the entire navigation disappears. The `Header` component presumably exists but was not confirmed to contain a mobile menu trigger from the lines read.

**Action required:** Audit `Header.jsx` for a mobile menu trigger. If absent, add a sheet/drawer-based mobile nav using `Sheet` from `src/components/ui/sheet` (already available in the shadcn/ui set).

---

## Medium Issues

### 8. Dark mode is incomplete — most page components have zero `dark:` variants

The `ThemeContext` correctly toggles the `dark` class on `<html>`. Tailwind's `darkMode: 'class'` strategy is confirmed to be in use. However, the `dark:` variant count across pages is revealing:

- `IncomePage.jsx`: 22 occurrences (partial)
- `SpendingPage.jsx`: 23 occurrences (partial)
- `ProgressPage.jsx`: 3 occurrences (minimal)
- `Dashboard.jsx`: 1 occurrence (dead file, irrelevant)
- `DashboardNew.jsx`: 0 occurrences
- `PropertiesPage.jsx`: 0 occurrences
- `PlansPage.jsx`: 0 occurrences
- `ProjectionsPage.jsx`: 0 occurrences
- `Settings.jsx`: 0 occurrences
- `AssetsPage.jsx`: 0 occurrences
- `LiabilitiesPage.jsx`: 0 occurrences

`DashboardNew` contains hardcoded Tailwind classes like `text-zinc-900`, `bg-slate-200`, `text-zinc-500`, `text-emerald-200` with no dark-mode counterparts. The theme toggle in the UI does nothing useful for 80% of the app.

**Action required:** Either commit to dark mode and audit every page, or remove the theme toggle from the UI until it is complete. Half-implemented dark mode is worse than none — it erodes trust in the toggle control.

---

### 9. `UserContext` duplicates user state that already lives in `AuthContext`

**Files:** `frontend/src/context/AuthContext.jsx`, `frontend/src/context/UserContext.jsx`

`AuthContext` derives a `user` object from Clerk and exposes it. `UserContext` then initialises its own `user` state from `authUser` (line 43) and keeps it in sync via a `useEffect` (lines 59–63). Components then access `user` from both contexts — `Settings.jsx` does `const { user: authUser } = useAuth()` and `const { user: userContextUser } = useUser()` simultaneously.

This is duplicated mutable state. Any mutation via `updateUser()` in `UserContext` only updates the local copy; `AuthContext`'s `user` stays stale. The source of truth is split across two contexts.

**Action required:** Remove `user` and `userId` from `UserContext`'s value object. Consumers that need user identity should call `useAuth()`. `UserContext` should own only what it uniquely provides: `onboardingStatus`, `hasSeenWelcome`, and the onboarding action functions.

---

### 10. `PortfolioContext.fetchPortfolios` is in `useCallback` with an empty dependency array but uses `setCurrentPortfolio` implicitly

**File:** `frontend/src/context/PortfolioContext.jsx` lines 17–33

`fetchPortfolios` is wrapped in `useCallback([])` — no dependencies. This is correct for a stable reference. However the `useEffect` on line 36 that calls `fetchPortfolios()` lists `getToken` in its deps but does NOT list `fetchPortfolios`. If `fetchPortfolios` ever gains a real dependency, this will silently cause stale closure bugs. The empty dep array on the `useCallback` also means if `getToken` changes after mount (e.g. token refresh), `fetchPortfolios` does not observe it — it would call the API with whatever `api.getPortfolios()` resolves at that point (fine because auth is handled in the axios interceptor, not in the function itself, but the coupling is implicit).

This is low risk today but should be documented or tightened.

---

### 11. `PropertiesPage` error state on fetch is swallowed silently

**File:** `frontend/src/pages/PropertiesPage.jsx` lines 42–54

```js
} catch (error) {
  console.error('Failed to fetch properties:', error);
}
```

No `error` state is set, no toast is shown. If the API returns a 500 or 401, the user sees an empty property list with no explanation. Same pattern appears in `ProjectionsPage`'s `fetchProperties` (line 66).

**Action required:** Set an `error` state and render an inline error banner (following the pattern already used in `DashboardNew` which shows a toast). `PropertiesPage` is the primary data entry surface — silent failure here is a significant UX problem.

---

### 12. `Sidebar` defines `NavItem` as a component inside the render function

**File:** `frontend/src/components/layout/Sidebar.jsx` line 65

`NavItem` is declared with `const NavItem = ({ item, isChild }) => { ... }` inside the `Sidebar` component body. This means React creates a new component type on every render of `Sidebar`, causing all `NavItem` instances to unmount and remount rather than reconcile. It also initialises `const [isOpen, setIsOpen] = React.useState(isActive)` inside that inner component — state that is reset on every parent re-render.

**Action required:** Hoist `NavItem` outside of `Sidebar` to module scope. Pass `location.pathname` as a prop if needed.

---

### 13. `PlaceholderPage` defined in `App.js` instead of a proper component file

**File:** `frontend/src/App.js` lines 48–55

The `/help` route renders a `PlaceholderPage` defined inline in `App.js`. This adds noise to the router file and will be forgotten when the real Help page is built. It is also not accessible — it has no `<title>`, no `role`, no landmark structure.

**Action required:** Either remove the `/help` route entirely until it is implemented, or move `PlaceholderPage` to `src/components/PlaceholderPage.jsx` with a proper `<Helmet>` title.

---

## Low / Informational

### 14. `AUSTRALIAN_STATES` is defined twice

`frontend/src/components/properties/PropertyFormModal.jsx` defines `AUSTRALIAN_STATES`. `frontend/src/pages/Settings.jsx` defines `australianStates` as a local array (same 8 values, different naming convention). Neither references the other.

**Action required:** Extract to `frontend/src/lib/australianStates.js` and import in both files.

---

### 15. `TooltipProvider` is instantiated per-tooltip in `PropertyFormModal`

**File:** `frontend/src/components/properties/PropertyFormModal.jsx` — `LabelWithTooltip` component

`<TooltipProvider>` wraps each individual `<Tooltip>` inside `LabelWithTooltip`. Radix's `TooltipProvider` is designed to be mounted once near the root, not per-instance. Having it per-tooltip creates redundant React context providers and can cause tooltip delay inconsistencies.

**Action required:** Add `<TooltipProvider>` once to `MainLayout` or `App.js` and remove it from `LabelWithTooltip`.

---

### 16. `PortfolioContext` fetches summary separately from portfolios, with no error handling on `fetchSummary`

**File:** `frontend/src/context/PortfolioContext.jsx` lines 45–58

The `fetchSummary` `useEffect` has no `try/catch`. An error silently leaves `summary` as `null`, and downstream components that rely on `summary` will render empty/zero states with no indication of failure.

---

### 17. `App.js` has duplicate legal page routes

**File:** `frontend/src/App.js` lines 121–130

`/legal/privacy` and `/legal/terms` are registered at lines 121–122, then `/privacy-policy` and `/terms-of-service` register the same components again at lines 128–130. Four routes for two pages. Pick one URL scheme and redirect the other.

---

### 18. `WelcomeModalWrapper` always re-evaluates `shouldShowWelcome` on every render

**File:** `frontend/src/App.js` lines 58–78

`WelcomeModalWrapper` is rendered unconditionally inside `App` and subscribes to both `useAuth` and `useUser`. Every context update anywhere in the tree causes this wrapper to re-run. It is cheap today but unnecessary — it could be rendered inside a route that only mounts post-authentication, or memoised with `React.memo` and stable selector values.

---

### 19. 32 `console.error` / `console.log` calls left in production page components

**Files:** 10 page files, 32 total occurrences

These are visible in production browser DevTools and leak internal API error shapes to end users. They should be routed through Sentry (already configured) or removed. At minimum, replace `console.error('Failed to fetch...', error)` with `Sentry.captureException(error)` where a silent failure is acceptable.

---

### 20. `ThemeContext` does not guard against `localStorage` access in SSR/sandbox context

**File:** `frontend/src/context/ThemeContext.jsx` lines 6–17

`localStorage.getItem('theme')` is called synchronously in the `useState` initialiser without a `try/catch`. `UserContext` correctly uses safe wrappers (`safeGetItem`, `safeSetItem`) because it was already burnt by Cloudflare Pages sandboxing. `ThemeContext` has the same exposure but no guard. In a Cloudflare Pages iframe sandbox, this will throw and break the entire context tree.

**Action required:** Wrap the `localStorage` access in the `useState` initialiser with the same `try/catch` pattern used in `UserContext`.

---

## Component Improvements

### `KPICard` — verify it accepts all required props defensively

`KPICard` is used across `DashboardNew` and `PropertiesPage`. No source was read in full but it receives `icon`, `variant`, `title`, and `value`. Confirm it handles `undefined` for `value` (can happen when `dashboardData` is null and the fallback object is used) without rendering `$NaN` or `$undefined`.

### `PropertyFormModal` tab state resets to `'details'` on every open/close

Line 156: `setActiveTab('details')` fires unconditionally in the `useEffect` that syncs form data. This means if a user tabs to "Expenses", closes the modal accidentally, and reopens it to resume, they are dropped back to tab 1. Consider persisting the last-active tab across opens or only resetting when switching from edit to create mode.

### `ScenarioDashboardPage` — not reviewed

`frontend/src/pages/ScenarioDashboardPage.jsx` was not read during this audit. Given it is the most recently added page and routes to `/:scenarioId/dashboard`, it warrants a dedicated review for: loading/error states, data isolation (does it pass `scenarioId` correctly to all API calls), and whether scenario data leaks across portfolio switches.

### `ProtectedRoute` — confirm it handles the Clerk hydration window correctly

The `ProtectedRoute` component was not read directly. Given that `AuthContext.loading` is `!isLoaded` (Clerk's hydration flag), confirm that `ProtectedRoute` returns a loading spinner (not a redirect to `/login`) while `loading === true`. A premature redirect during hydration would log out all users on every hard refresh.
