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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getProfile } from '../services/api';
import { setUserContext } from '../utils/sentry';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 *
 * Provides authentication state and functions to the entire app.
 * Handles JWT token management, user state, and authentication flows.
 *
 * Critical Security Features:
 * - Token validation on app load via GET /api/auth/me
 * - Automatic token refresh via api.js interceptor
 * - Secure token storage in localStorage
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize authentication state on app load
   *
   * CRITICAL SECURITY: This checks for a stored token and validates it
   * by calling GET /api/auth/me. This prevents invalid/expired tokens
   * from being trusted.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token is valid by fetching user profile
        const userData = await getProfile();
        setUser(userData);
        setIsAuthenticated(true);
        // Set user context for Sentry error tracking
        setUserContext(userData);
      } catch (error) {
        // Token invalid or expired - clear it
        console.warn('Token validation failed:', error.message);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user with email and password
   *
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
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const data = await apiLogin(email, password);

      setUser(data.user);
      setIsAuthenticated(true);
      // Set user context for Sentry error tracking
      setUserContext(data.user);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);

      // Extract user-friendly error message
      let message = 'Invalid email or password';

      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, error: message };
    } finally {
      setLoading(false);
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
   *
   * @param {object} userData - User registration data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      const data = await apiRegister(userData);

      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);

      // Extract user-friendly error message
      let message = 'Registration failed. Please try again.';

      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, error: message };
    } finally {
      setLoading(false);
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
   *
   * CRITICAL SECURITY: Always clear state even if API call fails.
   * This ensures user is logged out locally even if backend logout fails.
   */
  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
      // Clear user context in Sentry
      setUserContext(null);
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
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 *
 * Access authentication state and functions from any component.
 * Must be used within AuthProvider.
 *
 * @returns {object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
