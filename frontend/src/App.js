import React, { lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import { Toaster } from './components/ui/toaster';
import * as Sentry from '@sentry/react';
import ErrorFallback from './components/ErrorBoundary';
import CookieBanner from './components/CookieBanner';

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing REACT_APP_CLERK_PUBLISHABLE_KEY environment variable");
}

// Lazy-loaded page components — split into separate chunks
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const DashboardNew = lazy(() => import('./pages/DashboardNew'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const LiabilitiesPage = lazy(() => import('./pages/LiabilitiesPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const IncomePage = lazy(() => import('./pages/IncomePage'));
const SpendingPage = lazy(() => import('./pages/SpendingPage'));
const Settings = lazy(() => import('./pages/Settings'));
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'));
const MortgageCalculatorPage = lazy(() => import('./pages/calculators/MortgageCalculatorPage').then(m => ({ default: m.MortgageCalculatorPage })));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProjectionsPage = lazy(() => import('./pages/ProjectionsPage'));
const ScenarioDashboardPage = lazy(() => import('./pages/ScenarioDashboardPage'));
const WelcomeModal = lazy(() => import('./components/onboarding/WelcomeModal'));

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

// Placeholder pages - will be implemented in later phases
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">Coming soon in the next phase</p>
    </div>
  </div>
);

// Welcome Modal wrapper - shows for new users who haven't seen it yet
const WelcomeModalWrapper = () => {
  const { isAuthenticated } = useAuth();
  const { hasSeenWelcome, markWelcomeSeen, onboardingStatus } = useUser();

  // Show welcome modal for authenticated users who:
  // 1. Haven't seen the welcome modal yet
  // 2. Haven't completed onboarding
  const shouldShowWelcome = isAuthenticated && !hasSeenWelcome && !onboardingStatus.completed;

  if (!shouldShowWelcome) return null;

  return (
    <WelcomeModal
      isOpen={shouldShowWelcome}
      onClose={markWelcomeSeen}
      onComplete={markWelcomeSeen}
    />
  );
};

// Root redirect component that checks authentication and onboarding status
const RootRedirect = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { onboardingStatus, loading: userLoading } = useUser();

  const loading = authLoading || userLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Redirect to onboarding if not completed
  if (!onboardingStatus.completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
    <Routes>
      {/* Public routes */}
      <Route path="/login/*" element={<Login />} />
      <Route path="/register/*" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Legal routes */}
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/terms" element={<TermsOfService />} />

      {/* Public Calculator Routes - NO AUTHENTICATION REQUIRED */}
      <Route path="/calculators/mortgage" element={<MortgageCalculatorPage />} />

      {/* Legal Pages - Public */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />

      {/* Root redirect based on auth and onboarding status */}
      <Route path="/" element={<RootRedirect />} />

      {/* Protected routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingWizard />
        </ProtectedRoute>
      } />

      {/* Dashboard route with right panel */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardNew />} />
      </Route>

      {/* Other app routes with standard layout - all protected */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>

        {/* Finances routes */}
        <Route path="/finances" element={<Navigate to="/finances/income" replace />} />
        <Route path="/finances/income" element={<IncomePage />} />
        <Route path="/finances/spending" element={<SpendingPage />} />
        <Route path="/finances/properties" element={<PropertiesPage />} />
        <Route path="/finances/assets" element={<AssetsPage />} />
        <Route path="/finances/liabilities" element={<LiabilitiesPage />} />

        {/* Progress */}
        <Route path="/progress" element={<ProgressPage />} />

        {/* Plans */}
        <Route path="/plans" element={<PlansPage />} />

        {/* Projections - Property Portfolio Forecasting */}
        <Route path="/projections" element={<ProjectionsPage />} />

        {/* Scenario Dashboard - View individual scenario */}
        <Route path="/scenarios/:scenarioId/dashboard" element={<ScenarioDashboardPage />} />

        {/* Settings & Help */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<PlaceholderPage title="Help Center" />} />
      </Route>
    </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
            <HelmetProvider>
              <AuthProvider>
                <UserProvider>
                  <PortfolioProvider>
                    <div className="App">
                      <AppRoutes />
                      <Suspense fallback={null}><WelcomeModalWrapper /></Suspense>
                      <Toaster />
                      <CookieBanner />
                    </div>
                  </PortfolioProvider>
                </UserProvider>
              </AuthProvider>
            </HelmetProvider>
          </Sentry.ErrorBoundary>
        </ClerkProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
