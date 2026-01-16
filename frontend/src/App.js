import React from 'react';
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
import DashboardNew from './pages/DashboardNew';
import PropertiesPage from './pages/PropertiesPage';
import AssetsPage from './pages/AssetsPage';
import LiabilitiesPage from './pages/LiabilitiesPage';
import PlansPage from './pages/PlansPage';
import ProgressPage from './pages/ProgressPage';
import IncomePage from './pages/IncomePage';
import SpendingPage from './pages/SpendingPage';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import { MortgageCalculatorPage } from './pages/calculators/MortgageCalculatorPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ProjectionsPage from './pages/ProjectionsPage';
import ScenarioDashboardPage from './pages/ScenarioDashboardPage';
import { Toaster } from './components/ui/toaster';

// Placeholder pages - will be implemented in later phases
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">Coming soon in the next phase</p>
    </div>
  </div>
);

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
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="/help" element={<PlaceholderPage title="Help Center" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <PortfolioProvider>
              <div className="App">
                <AppRoutes />
                <Toaster />
              </div>
            </PortfolioProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
