import React, { lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import DashboardNew from './pages/DashboardNew';
import PropertiesPage from './pages/PropertiesPage';
import AssetsPage from './pages/AssetsPage';
import LiabilitiesPage from './pages/LiabilitiesPage';
import PlansPage from './pages/PlansPage';
import ProgressPage from './pages/ProgressPage';
import IncomePage from './pages/IncomePage';
import SpendingPage from './pages/SpendingPage';
import Settings from './pages/Settings';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import { MortgageCalculatorPage } from './pages/calculators/MortgageCalculatorPage';
import ProjectionsPage from './pages/ProjectionsPage';
import ScenarioDashboardPage from './pages/ScenarioDashboardPage';
import { Toaster } from './components/ui/toaster';
import * as Sentry from '@sentry/react';
import ErrorFallback from './components/ErrorBoundary';

// Lazy load WelcomeModal to reduce initial bundle size
const WelcomeModal = lazy(() => import('./components/onboarding/WelcomeModal'));

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
    <Suspense fallback={null}>
      <WelcomeModal
        isOpen={shouldShowWelcome}
        onClose={markWelcomeSeen}
        onComplete={markWelcomeSeen}
      />
    </Suspense>
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
          <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if not completed
  if (!onboardingStatus.completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
        <HelmetProvider>
          <AuthProvider>
            <UserProvider>
              <PortfolioProvider>
                <div className="App">
                  <AppRoutes />
                  <WelcomeModalWrapper />
                  <Toaster />
                </div>
              </PortfolioProvider>
            </UserProvider>
          </AuthProvider>
        </HelmetProvider>
      </Sentry.ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;

