import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { PortfolioProvider } from './context/PortfolioContext';
import MainLayout from './components/layout/MainLayout';
import DashboardNew from './pages/DashboardNew';
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

function App() {
  return (
    <UserProvider>
      <PortfolioProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
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
              
              {/* Onboarding - will be implemented in Phase 2 */}
              <Route path="/onboarding" element={<PlaceholderPage title="Onboarding Wizard" />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </PortfolioProvider>
    </UserProvider>
  );
}

export default App;
