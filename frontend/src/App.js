import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
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
import { Toaster } from './components/ui/toaster';
import * as Sentry from '@sentry/react';
import ErrorFallback from './components/ErrorBoundary';

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Legal routes */}
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms" element={<TermsOfService />} />

        {/* Root redirect based on auth and onboarding status */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Protected routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        } />
        
        {/* Main app routes with sidebar layout - all protected */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardNew />} />
          
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
      </Sentry.ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
