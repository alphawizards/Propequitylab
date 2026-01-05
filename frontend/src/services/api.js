import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API_BASE = `${BACKEND_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request queueing for refresh token race condition prevention
let isRefreshing = false;
let failedRequestsQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedRequestsQueue = [];
};

// Add request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Refresh the access token
        const response = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('accessToken', newAccessToken);

        // Update authorization header
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const api = {
  // Authentication
  register: (data) => axios.post(`${BACKEND_URL}/api/auth/register`, data).then(res => res.data),
  login: (email, password) => axios.post(`${BACKEND_URL}/api/auth/login`, { email, password }).then(res => res.data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => axios.post(`${BACKEND_URL}/api/auth/refresh`, { refresh_token: refreshToken }).then(res => res.data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  requestPasswordReset: (email) => axios.post(`${BACKEND_URL}/api/auth/request-password-reset`, { email }).then(res => res.data),
  resetPassword: (resetToken, newPassword) => axios.post(`${BACKEND_URL}/api/auth/reset-password`, { reset_token: resetToken, new_password: newPassword }).then(res => res.data),
  verifyEmail: (token) => axios.get(`${BACKEND_URL}/api/auth/verify-email`, { params: { token } }).then(res => res.data),
  resendVerification: (email) => axios.post(`${BACKEND_URL}/api/auth/resend-verification`, { email }).then(res => res.data),

  // Health
  healthCheck: () => apiClient.get('/health'),

  // Onboarding
  getOnboardingStatus: () => apiClient.get('/onboarding/status'),
  saveOnboardingStep: (step, data) => apiClient.put(`/onboarding/step/${step}`, { step, data }),
  completeOnboarding: () => apiClient.post('/onboarding/complete'),
  skipOnboarding: () => apiClient.post('/onboarding/skip'),
  resetOnboarding: () => apiClient.post('/onboarding/reset'),

  // Dashboard
  getDashboardSummary: (portfolioId) => 
    apiClient.get('/dashboard/summary', { params: { portfolio_id: portfolioId } }),
  getNetWorthHistory: (portfolioId, limit = 12) => 
    apiClient.get('/dashboard/net-worth-history', { params: { portfolio_id: portfolioId, limit } }),
  createSnapshot: (portfolioId) => apiClient.post('/dashboard/snapshot', null, { params: { portfolio_id: portfolioId } }),

  // Portfolios
  getPortfolios: () => apiClient.get('/portfolios'),
  createPortfolio: (data) => apiClient.post('/portfolios', data),
  getPortfolio: (id) => apiClient.get(`/portfolios/${id}`),
  updatePortfolio: (id, data) => apiClient.put(`/portfolios/${id}`, data),
  deletePortfolio: (id) => apiClient.delete(`/portfolios/${id}`),
  getPortfolioSummary: (id) => apiClient.get(`/portfolios/${id}/summary`),

  // Properties
  getProperties: (portfolioId) => apiClient.get(`/properties/portfolio/${portfolioId}`),
  createProperty: (data) => apiClient.post('/properties', data),
  getProperty: (id) => apiClient.get(`/properties/${id}`),
  updateProperty: (id, data) => apiClient.put(`/properties/${id}`, data),
  deleteProperty: (id) => apiClient.delete(`/properties/${id}`),

  // Income
  getIncomeSources: (portfolioId) => apiClient.get(`/income/portfolio/${portfolioId}`),
  createIncomeSource: (data) => apiClient.post('/income', data),
  updateIncomeSource: (id, data) => apiClient.put(`/income/${id}`, data),
  deleteIncomeSource: (id) => apiClient.delete(`/income/${id}`),

  // Expenses
  getExpenseCategories: () => apiClient.get('/expenses/categories'),
  getExpenses: (portfolioId) => apiClient.get(`/expenses/portfolio/${portfolioId}`),
  createExpense: (data) => apiClient.post('/expenses', data),
  updateExpense: (id, data) => apiClient.put(`/expenses/${id}`, data),
  deleteExpense: (id) => apiClient.delete(`/expenses/${id}`),

  // Assets
  getAssetTypes: () => apiClient.get('/assets/types'),
  getAssets: (portfolioId) => apiClient.get(`/assets/portfolio/${portfolioId}`),
  createAsset: (data) => apiClient.post('/assets', data),
  getAsset: (id) => apiClient.get(`/assets/${id}`),
  updateAsset: (id, data) => apiClient.put(`/assets/${id}`, data),
  deleteAsset: (id) => apiClient.delete(`/assets/${id}`),

  // Liabilities
  getLiabilityTypes: () => apiClient.get('/liabilities/types'),
  getLiabilities: (portfolioId) => apiClient.get(`/liabilities/portfolio/${portfolioId}`),
  createLiability: (data) => apiClient.post('/liabilities', data),
  getLiability: (id) => apiClient.get(`/liabilities/${id}`),
  updateLiability: (id, data) => apiClient.put(`/liabilities/${id}`, data),
  deleteLiability: (id) => apiClient.delete(`/liabilities/${id}`),

  // Plans
  getPlanTypes: () => apiClient.get('/plans/types'),
  getPlans: (portfolioId) => apiClient.get(`/plans/portfolio/${portfolioId}`),
  createPlan: (data) => apiClient.post('/plans', data),
  getPlan: (id) => apiClient.get(`/plans/${id}`),
  updatePlan: (id, data) => apiClient.put(`/plans/${id}`, data),
  deletePlan: (id) => apiClient.delete(`/plans/${id}`),
  
  // Projections
  calculateProjection: (data) => apiClient.post('/plans/project', data),
  getPlanProjections: (planId, portfolioId) => 
    apiClient.get(`/plans/${planId}/projections`, { params: { portfolio_id: portfolioId } }),
};

export default api;
