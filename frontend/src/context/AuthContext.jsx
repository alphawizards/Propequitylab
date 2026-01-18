/**
 * AuthContext - Authentication State Management
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check authentication status on mount
   * Validates existing tokens by calling /auth/me
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Validate current session
   */
  const checkAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
      setLoading(false);
      return;
    }

    try {
      // Validate token by fetching user profile
      const userData = await api.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      // Token invalid or expired
      console.error('Auth check failed:', error.message);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<{success: boolean, error?: string, emailVerificationRequired?: boolean}>}
   */
  const register = async (userData) => {
    try {
      const response = await api.register(userData);

      // Backend returns tokens but user is not verified yet
      // Store tokens but don't set authenticated state
      setUser(response.user);
      setIsAuthenticated(false); // Not fully authenticated until email verified

      return {
        success: true,
        emailVerificationRequired: !response.user.is_verified
      };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    await api.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Refresh user data
   * Useful after profile updates
   */
  const refreshUser = async () => {
    try {
      const userData = await api.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to refresh user:', error.message);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * @returns {object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
