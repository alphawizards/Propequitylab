import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { mockUser } from './data/mockData';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (userData) => {
    setUser({ ...mockUser, ...userData });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
