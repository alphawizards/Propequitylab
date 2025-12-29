import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

const api = {
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
  calculateSuperProjection: (data) => apiClient.post('/assets/project-super', data),

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
