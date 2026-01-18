/**
 * API Client - Axios with Token Refresh Interceptor
 * Handles 401 Unauthorized errors with automatic token refresh and request retry queue
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error if refresh failed
 * @param {string|null} token - New token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not a retry, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry auth endpoints
      if (originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Start token refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Update auth header for retry
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;

        // Process queued requests with new token
        processQueue(null, access_token);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - clear tokens and redirect to login
        processQueue(refreshError, null);

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Redirect to login page
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Auth API Functions
// ============================================================================

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
 */
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  const { access_token, refresh_token, user } = response.data;

  // Store tokens
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);

  // Set default auth header
  apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;

  return response.data;
};

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
 */
export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  const { access_token, refresh_token } = response.data;

  // Store tokens
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);

  // Set default auth header
  apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;

  return response.data;
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Ignore logout errors - we'll clear tokens anyway
    console.warn('Logout request failed:', error.message);
  } finally {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Remove auth header
    delete apiClient.defaults.headers.common.Authorization;
  }
};

/**
 * Get current user profile
 * @returns {Promise<object>} User profile data
 */
export const getProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<{message: string}>}
 */
export const requestPasswordReset = async (email) => {
  const response = await apiClient.post('/auth/request-password-reset', { email });
  return response.data;
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise<{message: string}>}
 */
export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

/**
 * Verify email with token
 * @param {string} token - Verification token from email
 * @returns {Promise<{message: string}>}
 */
export const verifyEmail = async (token) => {
  const response = await apiClient.get(`/auth/verify-email?token=${token}`);
  return response.data;
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<{message: string}>}
 */
export const resendVerification = async (email) => {
  const response = await apiClient.post('/auth/resend-verification', { email });
  return response.data;
};

// ============================================================================
// GDPR API Functions
// ============================================================================

/**
 * Export all user data (GDPR Right to Data Portability)
 * @returns {Promise<Blob>} JSON file with all user data
 */
export const exportUserData = async () => {
  const response = await apiClient.get('/gdpr/export-data', {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get summary of stored data (GDPR Right of Access)
 * @returns {Promise<object>} Summary of data categories and counts
 */
export const getDataSummary = async () => {
  const response = await apiClient.get('/gdpr/data-summary');
  return response.data;
};

/**
 * Delete user account (GDPR Right to Erasure)
 * @param {string} password - User password for verification
 * @returns {Promise<{message: string, deletion_date: string}>}
 */
export const deleteAccount = async (password) => {
  const response = await apiClient.delete('/gdpr/delete-account', {
    data: { password },
  });
  return response.data;
};

/**
 * Update user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{message: string}>}
 */
export const updatePassword = async (currentPassword, newPassword) => {
  const response = await apiClient.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};

/**
 * Update user profile
 * @param {object} profileData - Profile data to update
 * @returns {Promise<object>} Updated user data
 */
export const updateProfile = async (profileData) => {
  const response = await apiClient.put('/auth/profile', profileData);
  return response.data;
};

// Default export
export default apiClient;
