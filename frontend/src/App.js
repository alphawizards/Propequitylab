import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { PortfolioProvider } from './context/PortfolioContext';
import MainLayout from './components/layout/MainLayout';
import DashboardNew from './pages/DashboardNew';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
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

// Root redirect component that checks onboarding status
const RootRedirect = () => {
  const { onboardingStatus, loading } = useUser();
  
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
        {/* Root redirect based on onboarding status */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Onboarding wizard */}
        <Route path="/onboarding" element={<OnboardingWizard />} />
        
        {/* Main app routes with sidebar layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardNew />} />
          
          {/* Finances routes */}
          <Route path="/finances" element={<PlaceholderPage title="Current Finances" />} />
          <Route path="/finances/income" element={<PlaceholderPage title="Income Sources" />} />
          <Route path="/finances/spending" element={<PlaceholderPage title="Spending" />} />
          <Route path="/finances/properties" element={<PlaceholderPage title="Properties" />} />
          <Route path="/finances/assets" element={<PlaceholderPage title="Assets" />} />
          <Route path="/finances/liabilities" element={<PlaceholderPage title="Liabilities" />} />
          
          {/* Progress */}
          <Route path="/progress" element={<PlaceholderPage title="Progress Tracking" />} />
          
          {/* Plans */}
          <Route path="/plans" element={<PlaceholderPage title="Financial Plans" />} />
          
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
    <UserProvider>
      <PortfolioProvider>
        <div className="App">
          <AppRoutes />
          <Toaster />
        </div>
      </PortfolioProvider>
    </UserProvider>
  );
}

export default App;
