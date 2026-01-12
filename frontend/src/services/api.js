/**
 * API Client - Axios with Token Refresh Interceptor
 * Handles 401 Unauthorized errors with automatic token refresh and request retry queue
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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

// ============================================================================
// Portfolio API Functions
// ============================================================================

/**
 * Get all portfolios for current user
 * @returns {Promise<Array>} List of portfolios
 */
export const getPortfolios = async () => {
  const response = await apiClient.get('/portfolios');
  return response.data;
};

/**
 * Get a specific portfolio by ID
 * @param {string} id - Portfolio ID
 * @returns {Promise<object>} Portfolio data
 */
export const getPortfolio = async (id) => {
  const response = await apiClient.get(`/portfolios/${id}`);
  return response.data;
};

/**
 * Create a new portfolio
 * @param {object} data - Portfolio data { name, type }
 * @returns {Promise<object>} Created portfolio
 */
export const createPortfolio = async (data) => {
  const response = await apiClient.post('/portfolios', data);
  return response.data;
};

/**
 * Get portfolio summary/dashboard data
 * @param {string} id - Portfolio ID
 * @returns {Promise<object>} Portfolio summary
 */
export const getPortfolioSummary = async (id) => {
  const response = await apiClient.get(`/portfolios/${id}/summary`);
  return response.data;
};

// ============================================================================
// Onboarding API Functions
// ============================================================================

/**
 * Get onboarding status
 * @returns {Promise<object>} Onboarding status { completed, current_step, user }
 */
export const getOnboardingStatus = async () => {
  const response = await apiClient.get('/onboarding/status');
  return response.data;
};

/**
 * Complete onboarding
 * @returns {Promise<object>} Updated status
 */
export const completeOnboarding = async () => {
  const response = await apiClient.post('/onboarding/complete');
  return response.data;
};

/**
 * Skip onboarding
 * @returns {Promise<object>} Updated status
 */
export const skipOnboarding = async () => {
  const response = await apiClient.post('/onboarding/skip');
  return response.data;
};

/**
 * Reset onboarding
 * @returns {Promise<object>} Updated status
 */
export const resetOnboarding = async () => {
  const response = await apiClient.post('/onboarding/reset');
  return response.data;
};

// ============================================================================
// Dashboard API Functions
// ============================================================================

/**
 * Get dashboard summary data
 * @returns {Promise<object>} Dashboard summary
 */
export const getDashboardSummary = async () => {
  const response = await apiClient.get('/dashboard/summary');
  return response.data;
};

/**
 * Get net worth history for a portfolio
 * @param {string} portfolioId - Portfolio ID (optional)
 * @param {number} limit - Number of snapshots to return (default 12)
 * @returns {Promise<Array>} Net worth history snapshots
 */
export const getNetWorthHistory = async (portfolioId, limit = 12) => {
  const params = new URLSearchParams();
  if (portfolioId) params.append('portfolio_id', portfolioId);
  if (limit) params.append('limit', limit);

  const response = await apiClient.get(`/dashboard/net-worth-history?${params.toString()}`);
  return response.data;
};

// ============================================================================
// Projections API Functions (Phase 4)
// ============================================================================

/**
 * Get property projections
 * @param {string} propertyId - Property ID
 * @param {object} options - Optional parameters
 * @param {number} options.years - Number of years to project (default 10)
 * @param {number} options.expenseGrowthOverride - Override expense growth rate
 * @param {number} options.interestRateOffset - Interest rate adjustment for stress test
 * @returns {Promise<object>} Property projections data
 */
export const getPropertyProjections = async (propertyId, options = {}) => {
  const params = new URLSearchParams();
  if (options.years) params.append('years', options.years);
  if (options.expenseGrowthOverride) params.append('expense_growth_override', options.expenseGrowthOverride);
  if (options.interestRateOffset) params.append('interest_rate_offset', options.interestRateOffset);

  const response = await apiClient.get(`/projections/${propertyId}?${params.toString()}`);
  return response.data;
};

/**
 * Get portfolio projections
 * @param {string} portfolioId - Portfolio ID
 * @param {object} options - Optional parameters
 * @returns {Promise<object>} Portfolio projections data
 */
export const getPortfolioProjections = async (portfolioId, options = {}) => {
  const params = new URLSearchParams();
  if (options.years) params.append('years', options.years);
  if (options.expenseGrowthOverride) params.append('expense_growth_override', options.expenseGrowthOverride);
  if (options.interestRateOffset) params.append('interest_rate_offset', options.interestRateOffset);

  const response = await apiClient.get(`/projections/portfolio/${portfolioId}?${params.toString()}`);
  return response.data;
};

/**
 * Get property projection summary
 * @param {string} propertyId - Property ID
 * @returns {Promise<object>} Property summary
 */
export const getPropertyProjectionSummary = async (propertyId) => {
  const response = await apiClient.get(`/projections/property/${propertyId}/summary`);
  return response.data;
};

// ============================================================================
// Loans API Functions (Phase 4)
// ============================================================================

/**
 * Get all loans for a property
 * @param {string} propertyId - Property ID
 * @returns {Promise<Array>} List of loans
 */
export const getPropertyLoans = async (propertyId) => {
  const response = await apiClient.get(`/loans/property/${propertyId}`);
  return response.data;
};

/**
 * Get a single loan by ID
 * @param {number} loanId - Loan ID
 * @returns {Promise<object>} Loan data
 */
export const getLoan = async (loanId) => {
  const response = await apiClient.get(`/loans/${loanId}`);
  return response.data;
};

/**
 * Create a new loan
 * @param {object} loanData - Loan data
 * @returns {Promise<object>} Created loan
 */
export const createLoan = async (loanData) => {
  const response = await apiClient.post('/loans', loanData);
  return response.data;
};

/**
 * Update a loan
 * @param {number} loanId - Loan ID
 * @param {object} loanData - Updated loan data
 * @returns {Promise<object>} Updated loan
 */
export const updateLoan = async (loanId, loanData) => {
  const response = await apiClient.put(`/loans/${loanId}`, loanData);
  return response.data;
};

/**
 * Delete a loan
 * @param {number} loanId - Loan ID
 * @returns {Promise<object>} Deletion confirmation
 */
export const deleteLoan = async (loanId) => {
  const response = await apiClient.delete(`/loans/${loanId}`);
  return response.data;
};

// ============================================================================
// Valuations API Functions (Phase 4)
// ============================================================================

/**
 * Get all valuations for a property
 * @param {string} propertyId - Property ID
 * @returns {Promise<Array>} List of valuations
 */
export const getPropertyValuations = async (propertyId) => {
  const response = await apiClient.get(`/valuations/property/${propertyId}`);
  return response.data;
};

/**
 * Create a new valuation
 * @param {object} valuationData - Valuation data
 * @returns {Promise<object>} Created valuation
 */
export const createValuation = async (valuationData) => {
  const response = await apiClient.post('/valuations', valuationData);
  return response.data;
};

/**
 * Delete a valuation
 * @param {number} valuationId - Valuation ID
 * @returns {Promise<object>} Deletion confirmation
 */
export const deleteValuation = async (valuationId) => {
  const response = await apiClient.delete(`/valuations/${valuationId}`);
  return response.data;
};

/**
 * Get latest valuation for a property
 * @param {string} propertyId - Property ID
 * @returns {Promise<object>} Latest valuation
 */
export const getLatestValuation = async (propertyId) => {
  const response = await apiClient.get(`/valuations/property/${propertyId}/latest`);
  return response.data;
};

// Default export with all methods
const api = {
  // Auth
  login,
  register,
  logout,
  getProfile,
  // Portfolios
  getPortfolios,
  getPortfolio,
  createPortfolio,
  getPortfolioSummary,
  // Onboarding
  getOnboardingStatus,
  completeOnboarding,
  skipOnboarding,
  resetOnboarding,
  // Dashboard
  getDashboardSummary,
  getNetWorthHistory,
  // Projections (Phase 4)
  getPropertyProjections,
  getPortfolioProjections,
  getPropertyProjectionSummary,
  // Loans (Phase 4)
  getPropertyLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  // Valuations (Phase 4)
  getPropertyValuations,
  createValuation,
  deleteValuation,
  getLatestValuation,
};

export default api;


