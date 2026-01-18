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

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<{message: string}>}
 */
export const requestPasswordReset = async (email) => {
  const response = await apiClient.post('/auth/request-password-reset', { email });
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
 * Get a specific portfolio by ID
 * @param {string} id - Portfolio ID
 * @returns {Promise<object>} Portfolio data
 */
export const getPortfolio = async (id) => {
  const response = await apiClient.get(`/portfolios/${id}`);
  return response.data;
};

/**
 * Verify email with token
 * @param {string} token - Verification token from email
 * @returns {Promise<{message: string}>}
 */
export const verifyEmail = async (token) => {
  const response = await apiClient.get(`/auth/verify-email?token=${token}`);
 * Create a new portfolio
 * @param {object} data - Portfolio data { name, type }
 * @returns {Promise<object>} Created portfolio
 */
export const createPortfolio = async (data) => {
  const response = await apiClient.post('/portfolios', data);
  return response.data;
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<{message: string}>}
 */
export const resendVerification = async (email) => {
  const response = await apiClient.post('/auth/resend-verification', { email });
 * Get portfolio summary/dashboard data
 * @param {string} id - Portfolio ID
 * @returns {Promise<object>} Portfolio summary
 */
export const getPortfolioSummary = async (id) => {
  const response = await apiClient.get(`/portfolios/${id}/summary`);
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
// Property API Functions
// ============================================================================

/**
 * Get all properties in a portfolio
 * @param {string} portfolioId - Portfolio ID
 * @returns {Promise<Array>} List of properties
 */
export const getProperties = async (portfolioId) => {
  const response = await apiClient.get(`/properties/portfolio/${portfolioId}`);
  return response.data;
};

/**
 * Get a specific property by ID
 * @param {string} id - Property ID
 * @returns {Promise<object>} Property data
 */
export const getProperty = async (id) => {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data;
};

/**
 * Create a new property
 * @param {object} data - Property data
 * @returns {Promise<object>} Created property
 */
export const createProperty = async (data) => {
  const response = await apiClient.post('/properties', data);
  return response.data;
};

/**
 * Update a property
 * @param {string} id - Property ID
 * @param {object} data - Updated property data
 * @returns {Promise<object>} Updated property
 */
export const updateProperty = async (id, data) => {
  const response = await apiClient.put(`/properties/${id}`, data);
  return response.data;
};

/**
 * Get summary of stored data (GDPR Right of Access)
 * @returns {Promise<object>} Summary of data categories and counts
 */
export const getDataSummary = async () => {
  const response = await apiClient.get('/gdpr/data-summary');
 * Delete a property
 * @param {string} id - Property ID
 * @returns {Promise<object>} Deletion confirmation
 */
export const deleteProperty = async (id) => {
  const response = await apiClient.delete(`/properties/${id}`);
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
 * Delete user account (GDPR Right to Erasure)
 * @param {string} password - User password for verification
 * @returns {Promise<{message: string, deletion_date: string}>}
 */
export const deleteAccount = async (password) => {
  const response = await apiClient.delete('/gdpr/delete-account', {
    data: { password },
  });
 * Complete onboarding
 * @returns {Promise<object>} Updated status
 */
export const completeOnboarding = async () => {
  const response = await apiClient.post('/onboarding/complete');
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
 * Skip onboarding
 * @returns {Promise<object>} Updated status
 */
export const skipOnboarding = async () => {
  const response = await apiClient.post('/onboarding/skip');
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
 * @param {string} portfolioId - Portfolio ID (optional)
 * @returns {Promise<object>} Dashboard summary
 */
export const getDashboardSummary = async (portfolioId) => {
  const params = new URLSearchParams();
  if (portfolioId) params.append('portfolio_id', portfolioId);

  const response = await apiClient.get(`/dashboard/summary?${params.toString()}`);
  return response.data;
};

/**
 * Create a net worth snapshot for a portfolio
 * @param {string} portfolioId - Portfolio ID
 * @returns {Promise<object>} Snapshot creation confirmation
 */
export const createSnapshot = async (portfolioId) => {
  const response = await apiClient.post('/dashboard/snapshot', { portfolio_id: portfolioId });
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
  if (options.assetGrowthOverride) params.append('asset_growth_override', options.assetGrowthOverride);

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
  if (options.assetGrowthOverride) params.append('asset_growth_override', options.assetGrowthOverride);

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
  getNet_worth_history: getNetWorthHistory,
  getNetWorthHistory,
  createSnapshot,
  // Properties
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
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
  // Missing Onboarding & Entity Creation methods
  saveOnboardingStep: async (step, payload) => {
    const completePayload = { step, ...payload };
    const response = await apiClient.put(`/onboarding/step/${step}`, completePayload);
    return response.data;
  },
  createIncomeSource: async (data) => {
    const response = await apiClient.post('/income', data);
    return response.data;
  },
  createExpense: async (data) => {
    const response = await apiClient.post('/expenses', data);
    return response.data;
  },
  createAsset: async (data) => {
    const response = await apiClient.post('/assets', data);
    return response.data;
  },
  createLiability: async (data) => {
    const response = await apiClient.post('/liabilities', data);
    return response.data;
  },

  // Assets CRUD
  getAssets: async (portfolioId) => {
    const response = await apiClient.get(`/assets/portfolio/${portfolioId}`);
    return response.data;
  },
  updateAsset: async (id, data) => {
    const response = await apiClient.put(`/assets/${id}`, data);
    return response.data;
  },
  deleteAsset: async (id) => {
    const response = await apiClient.delete(`/assets/${id}`);
    return response.data;
  },

  // Income CRUD
  getIncomeSources: async (portfolioId) => {
    const response = await apiClient.get(`/income/portfolio/${portfolioId}`);
    return response.data;
  },
  updateIncomeSource: async (id, data) => {
    const response = await apiClient.put(`/income/${id}`, data);
    return response.data;
  },
  deleteIncomeSource: async (id) => {
    const response = await apiClient.delete(`/income/${id}`);
    return response.data;
  },

  // Expenses CRUD
  getExpenses: async (portfolioId) => {
    const response = await apiClient.get(`/expenses/portfolio/${portfolioId}`);
    return response.data;
  },
  updateExpense: async (id, data) => {
    const response = await apiClient.put(`/expenses/${id}`, data);
    return response.data;
  },
  deleteExpense: async (id) => {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  },

  // Liabilities CRUD
  getLiabilities: async (portfolioId) => {
    const response = await apiClient.get(`/liabilities/portfolio/${portfolioId}`);
    return response.data;
  },
  updateLiability: async (id, data) => {
    const response = await apiClient.put(`/liabilities/${id}`, data);
    return response.data;
  },
  deleteLiability: async (id) => {
    const response = await apiClient.delete(`/liabilities/${id}`);
    return response.data;
  },
  updatePortfolio: async (id, data) => {
    const response = await apiClient.put(`/portfolios/${id}`, data);
    return response.data;
  },

  // Loan Extra Repayments & Lump Sum Payments (Phase 3)
  addExtraRepayment: async (loanId, data) => {
    // data: { amount, frequency, start_date, end_date? }
    const response = await apiClient.post(`/loans/${loanId}/extra-repayment`, null, { params: data });
    return response.data;
  },
  addLumpSumPayment: async (loanId, data) => {
    // data: { amount, payment_date, description? }
    const response = await apiClient.post(`/loans/${loanId}/lump-sum`, null, { params: data });
    return response.data;
  },

  // ========================================
  // Scenario Management (Pro Feature)
  // ========================================

  /**
   * Create a new scenario from a portfolio (deep copy)
   * @param {string} portfolioId - Source portfolio ID
   * @param {string} scenarioName - Name for the scenario
   * @param {string} scenarioDescription - Optional description
   */
  createScenario: async (portfolioId, scenarioName, scenarioDescription = null) => {
    const params = { scenario_name: scenarioName };
    if (scenarioDescription) params.scenario_description = scenarioDescription;
    const response = await apiClient.post(`/scenarios/create/${portfolioId}`, null, { params });
    return response.data;
  },

  /**
   * List all scenarios for a portfolio
   * @param {string} portfolioId - Source portfolio ID
   */
  listScenarios: async (portfolioId) => {
    const response = await apiClient.get(`/scenarios/portfolio/${portfolioId}`);
    return response.data;
  },

  /**
   * Get a single scenario by ID
   * @param {string} scenarioId - Scenario portfolio ID
   */
  getScenario: async (scenarioId) => {
    const response = await apiClient.get(`/scenarios/${scenarioId}`);
    return response.data;
  },

  /**
   * Update scenario metadata
   * @param {string} scenarioId - Scenario portfolio ID
   * @param {object} data - { scenario_name?, scenario_description? }
   */
  updateScenario: async (scenarioId, data) => {
    const response = await apiClient.put(`/scenarios/${scenarioId}`, null, { params: data });
    return response.data;
  },

  /**
   * Delete a scenario
   * @param {string} scenarioId - Scenario portfolio ID
   */
  deleteScenario: async (scenarioId) => {
    const response = await apiClient.delete(`/scenarios/${scenarioId}`);
    return response.data;
  },

  /**
   * Compare scenario to its source portfolio
   * @param {string} scenarioId - Scenario portfolio ID
   * @returns {object} - { actual, scenario, differences }
   */
  compareScenario: async (scenarioId) => {
    const response = await apiClient.get(`/scenarios/${scenarioId}/compare`);
    return response.data;
  },
};

export default api;


