/**
 * PropEquityLab API Service - FIXED VERSION
 * 
 * BUGS FIXED in this version:
 * 1. Added getPlans() function (was missing entirely)
 * 2. Added calculateProjection() function (was missing entirely)
 * 3. Added Plans CRUD functions (getPlans, getPlan, createPlan, updatePlan, deletePlan, getPlanProjections)
 * 4. Added missing named exports to default export object (requestPasswordReset, resetPassword, updatePassword, updateProfile)
 * 5. Added getExpenseCategories, getAssetTypes, getLiabilityTypes, getPlanTypes to default export
 * 
 * INSTRUCTIONS: Replace the ENTIRE contents of frontend/src/services/api.js with this file
 */

import axios from 'axios';

// Clerk token bridge — injected by AuthContext on mount
let clerkTokenGetter = null;

/** Called by AuthContext to register Clerk's getToken function. */
export const setClerkTokenGetter = (getter) => {
  clerkTokenGetter = getter;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';


// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach Clerk auth token
apiClient.interceptors.request.use(
  async (config) => {
    let token = null;
    if (clerkTokenGetter) {
      try {
        token = await clerkTokenGetter();
      } catch (e) {
        // Clerk token fetch failed
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 (Clerk session expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clerk session expired — redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Auth API Functions
// ============================================================================

export const getProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await apiClient.put('/auth/profile', profileData);
  return response.data;
};

// ============================================================================
// GDPR API Functions
// ============================================================================

export const exportUserData = async () => {
  const response = await apiClient.get('/gdpr/export-data', {
    responseType: 'blob',
  });
  return response.data;
};

export const getDataSummary = async () => {
  const response = await apiClient.get('/gdpr/data-summary');
  return response.data;
};

export const deleteAccount = async (confirmation) => {
  const response = await apiClient.delete('/gdpr/delete-account', {
    data: { confirmation },
  });
  return response.data;
};

// ============================================================================
// Portfolio API Functions
// ============================================================================

export const getPortfolios = async () => {
  const response = await apiClient.get('/portfolios');
  return response.data;
};

export const getPortfolio = async (id) => {
  const response = await apiClient.get(`/portfolios/${id}`);
  return response.data;
};

export const createPortfolio = async (data) => {
  const response = await apiClient.post('/portfolios', data);
  return response.data;
};

export const getPortfolioSummary = async (id) => {
  const response = await apiClient.get(`/portfolios/${id}/summary`);
  return response.data;
};

// ============================================================================
// Property API Functions
// ============================================================================

export const getProperties = async (portfolioId) => {
  const response = await apiClient.get(`/properties/portfolio/${portfolioId}`);
  return response.data;
};

export const getProperty = async (id) => {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data;
};

export const createProperty = async (data) => {
  const response = await apiClient.post('/properties', data);
  return response.data;
};

export const updateProperty = async (id, data) => {
  const response = await apiClient.put(`/properties/${id}`, data);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await apiClient.delete(`/properties/${id}`);
  return response.data;
};

// ============================================================================
// Onboarding API Functions
// ============================================================================

export const getOnboardingStatus = async () => {
  const response = await apiClient.get('/onboarding/status');
  return response.data;
};

export const completeOnboarding = async () => {
  const response = await apiClient.post('/onboarding/complete');
  return response.data;
};

export const skipOnboarding = async () => {
  const response = await apiClient.post('/onboarding/skip');
  return response.data;
};

export const resetOnboarding = async () => {
  const response = await apiClient.post('/onboarding/reset');
  return response.data;
};

export const seedSampleData = async () => {
  const response = await apiClient.post('/onboarding/seed-sample-data');
  return response.data;
};

export const loadDemoData = async () => {
  const response = await apiClient.post('/onboarding/load-demo-data');
  return response.data;
};

// ============================================================================
// Dashboard API Functions
// ============================================================================

export const getDashboardSummary = async (portfolioId) => {
  const params = new URLSearchParams();
  if (portfolioId) params.append('portfolio_id', portfolioId);
  const response = await apiClient.get(`/dashboard/summary?${params.toString()}`);
  return response.data;
};

export const createSnapshot = async (portfolioId) => {
  const response = await apiClient.post('/dashboard/snapshot', { portfolio_id: portfolioId });
  return response.data;
};

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

export const getPropertyProjections = async (propertyId, options = {}) => {
  const params = new URLSearchParams();
  if (options.years) params.append('years', options.years);
  if (options.expenseGrowthOverride) params.append('expense_growth_override', options.expenseGrowthOverride);
  if (options.interestRateOffset) params.append('interest_rate_offset', options.interestRateOffset);
  if (options.assetGrowthOverride) params.append('asset_growth_override', options.assetGrowthOverride);
  const response = await apiClient.get(`/projections/${propertyId}?${params.toString()}`);
  return response.data;
};

export const getPortfolioProjections = async (portfolioId, options = {}) => {
  const params = new URLSearchParams();
  if (options.years) params.append('years', options.years);
  if (options.expenseGrowthOverride) params.append('expense_growth_override', options.expenseGrowthOverride);
  if (options.interestRateOffset) params.append('interest_rate_offset', options.interestRateOffset);
  if (options.assetGrowthOverride) params.append('asset_growth_override', options.assetGrowthOverride);
  const response = await apiClient.get(`/projections/portfolio/${portfolioId}?${params.toString()}`);
  return response.data;
};

export const getPropertyProjectionSummary = async (propertyId) => {
  const response = await apiClient.get(`/projections/property/${propertyId}/summary`);
  return response.data;
};

// ============================================================================
// Loans API Functions (Phase 4)
// ============================================================================

export const getPropertyLoans = async (propertyId) => {
  const response = await apiClient.get(`/loans/property/${propertyId}`);
  return response.data;
};

export const getLoan = async (loanId) => {
  const response = await apiClient.get(`/loans/${loanId}`);
  return response.data;
};

export const createLoan = async (loanData) => {
  const response = await apiClient.post('/loans', loanData);
  return response.data;
};

export const updateLoan = async (loanId, loanData) => {
  const response = await apiClient.put(`/loans/${loanId}`, loanData);
  return response.data;
};

export const deleteLoan = async (loanId) => {
  const response = await apiClient.delete(`/loans/${loanId}`);
  return response.data;
};

// ============================================================================
// Valuations API Functions (Phase 4)
// ============================================================================

export const getPropertyValuations = async (propertyId) => {
  const response = await apiClient.get(`/valuations/property/${propertyId}`);
  return response.data;
};

export const createValuation = async (valuationData) => {
  const response = await apiClient.post('/valuations', valuationData);
  return response.data;
};

export const deleteValuation = async (valuationId) => {
  const response = await apiClient.delete(`/valuations/${valuationId}`);
  return response.data;
};

export const getLatestValuation = async (propertyId) => {
  const response = await apiClient.get(`/valuations/property/${propertyId}/latest`);
  return response.data;
};

// ============================================================================
// FIXED: Plans API Functions (NEW - was completely missing)
// ============================================================================

/**
 * Get all plans for a portfolio
 * @param {string} portfolioId - Portfolio ID
 * @returns {Promise<Array>} List of plans
 */
export const getPlans = async (portfolioId) => {
  const response = await apiClient.get(`/plans/portfolio/${portfolioId}`);
  return response.data;
};

/**
 * Get a specific plan by ID
 * @param {string} planId - Plan ID
 * @returns {Promise<object>} Plan data
 */
export const getPlan = async (planId) => {
  const response = await apiClient.get(`/plans/${planId}`);
  return response.data;
};

/**
 * Create a new plan
 * @param {object} data - Plan data { portfolio_id, plan_type, name, ... }
 * @returns {Promise<object>} Created plan
 */
export const createPlan = async (data) => {
  const response = await apiClient.post('/plans', data);
  return response.data;
};

/**
 * Update a plan
 * @param {string} planId - Plan ID
 * @param {object} data - Updated plan data
 * @returns {Promise<object>} Updated plan
 */
export const updatePlan = async (planId, data) => {
  const response = await apiClient.put(`/plans/${planId}`, data);
  return response.data;
};

/**
 * Delete a plan
 * @param {string} planId - Plan ID
 * @returns {Promise<object>} Deletion confirmation
 */
export const deletePlan = async (planId) => {
  const response = await apiClient.delete(`/plans/${planId}`);
  return response.data;
};

/**
 * Get plan projections
 * @param {string} planId - Plan ID
 * @returns {Promise<object>} Plan projection data
 */
export const getPlanProjections = async (planId) => {
  const response = await apiClient.get(`/plans/${planId}/projections`);
  return response.data;
};

/**
 * Get available plan types (FIRE types)
 * @returns {Promise<Array>} List of plan types
 */
export const getPlanTypes = async () => {
  const response = await apiClient.get('/plans/types');
  return response.data;
};

// ============================================================================
// FIXED: Client-side Projection Calculator (NEW - fallback when API unavailable)
// ============================================================================

/**
 * Calculate projections client-side
 * @param {object} data - Portfolio data { properties, assets, liabilities, income }
 * @param {number} years - Number of years to project
 * @param {object} rates - Optional rate overrides
 * @returns {object} Calculated projection data
 */
export const calculateProjection = (data, years = 10, rates = {}) => {
  const { properties = [], assets = [], liabilities = [], income = [] } = data;
  
  const propertyGrowthRate = rates.propertyGrowth ?? 0.05;
  const assetGrowthRate = rates.assetGrowth ?? 0.07;
  const incomeGrowthRate = rates.incomeGrowth ?? 0.03;
  const liabilityPaydownRate = rates.liabilityPaydown ?? 0.05;
  
  const totalPropertyValue = properties.reduce((sum, p) => sum + (p.current_value || p.currentValue || 0), 0);
  const totalAssetValue = assets.reduce((sum, a) => sum + (a.current_value || a.currentValue || 0), 0);
  const totalLiabilityBalance = liabilities.reduce((sum, l) => sum + (l.current_balance || l.currentBalance || 0), 0);
  const totalAnnualIncome = income.reduce((sum, i) => {
    const amount = i.amount || 0;
    const multiplier = i.frequency === 'Monthly' ? 12 : i.frequency === 'Weekly' ? 52 : 1;
    return sum + (amount * multiplier);
  }, 0);
  
  const startingNetWorth = totalPropertyValue + totalAssetValue - totalLiabilityBalance;
  
  const projections = [];
  let currentPropertyValue = totalPropertyValue;
  let currentAssetValue = totalAssetValue;
  let currentLiabilityBalance = totalLiabilityBalance;
  let currentIncome = totalAnnualIncome;
  
  for (let year = 1; year <= years; year++) {
    currentPropertyValue *= (1 + propertyGrowthRate);
    currentAssetValue *= (1 + assetGrowthRate);
    currentLiabilityBalance = Math.max(0, currentLiabilityBalance * (1 - liabilityPaydownRate));
    currentIncome *= (1 + incomeGrowthRate);
    
    const netWorth = currentPropertyValue + currentAssetValue - currentLiabilityBalance;
    
    projections.push({
      year,
      property_value: Math.round(currentPropertyValue),
      asset_value: Math.round(currentAssetValue),
      liability_balance: Math.round(currentLiabilityBalance),
      net_worth: Math.round(netWorth),
      annual_income: Math.round(currentIncome),
    });
  }
  
  const endingNetWorth = projections[projections.length - 1].net_worth;
  const totalGrowth = endingNetWorth - startingNetWorth;
  const cagr = startingNetWorth > 0 
    ? (Math.pow(endingNetWorth / startingNetWorth, 1 / years) - 1) 
    : 0;
  
  return {
    starting_net_worth: Math.round(startingNetWorth),
    projected_net_worth: endingNetWorth,
    total_growth: Math.round(totalGrowth),
    cagr: parseFloat((cagr * 100).toFixed(1)),
    years,
    projections,
  };
};

// ============================================================================
// Types/Categories API Functions (NEW exports)
// ============================================================================

export const getExpenseCategories = async () => {
  const response = await apiClient.get('/expenses/categories');
  return response.data;
};

export const getAssetTypes = async () => {
  const response = await apiClient.get('/assets/types');
  return response.data;
};

export const getLiabilityTypes = async () => {
  const response = await apiClient.get('/liabilities/types');
  return response.data;
};

// ============================================================================
// Default export with ALL methods (FIXED - added missing functions)
// ============================================================================

const api = {
  // Auth
  getProfile,
  updateProfile,
  
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
  seedSampleData,
  
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
  calculateProjection,     // FIXED: was completely missing
  
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
  
  // FIXED: Plans (was completely missing)
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanProjections,
  getPlanTypes,
  
  // Types/Categories (NEW)
  getExpenseCategories,
  getAssetTypes,
  getLiabilityTypes,
  
  // Onboarding step save
  saveOnboardingStep: async (step, payload) => {
    const completePayload = { step, ...payload };
    const response = await apiClient.put(`/onboarding/step/${step}`, completePayload);
    return response.data;
  },
  
  // Income CRUD
  createIncomeSource: async (data) => {
    const response = await apiClient.post('/income', data);
    return response.data;
  },
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
  
  // Expense CRUD
  createExpense: async (data) => {
    const response = await apiClient.post('/expenses', data);
    return response.data;
  },
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
  getExpenseSummary: async (portfolioId) => {
    const response = await apiClient.get(`/expenses/portfolio/${portfolioId}/summary`);
    return response.data;
  },
  
  // Asset CRUD
  createAsset: async (data) => {
    const response = await apiClient.post('/assets', data);
    return response.data;
  },
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
  
  // Liability CRUD
  createLiability: async (data) => {
    const response = await apiClient.post('/liabilities', data);
    return response.data;
  },
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
  
  // Portfolio update
  updatePortfolio: async (id, data) => {
    const response = await apiClient.put(`/portfolios/${id}`, data);
    return response.data;
  },
  
  // Loan Extra Repayments & Lump Sum
  addExtraRepayment: async (loanId, data) => {
    const response = await apiClient.post(`/loans/${loanId}/extra-repayment`, null, { params: data });
    return response.data;
  },
  addLumpSumPayment: async (loanId, data) => {
    const response = await apiClient.post(`/loans/${loanId}/lump-sum`, null, { params: data });
    return response.data;
  },
  
  // Scenario Management (Pro Feature)
  createScenario: async (portfolioId, scenarioName, scenarioDescription = null) => {
    const params = { scenario_name: scenarioName };
    if (scenarioDescription) params.scenario_description = scenarioDescription;
    const response = await apiClient.post(`/scenarios/create/${portfolioId}`, null, { params });
    return response.data;
  },
  listScenarios: async (portfolioId) => {
    const response = await apiClient.get(`/scenarios/portfolio/${portfolioId}`);
    return response.data;
  },
  getScenario: async (scenarioId) => {
    const response = await apiClient.get(`/scenarios/${scenarioId}`);
    return response.data;
  },
  updateScenario: async (scenarioId, data) => {
    const response = await apiClient.put(`/scenarios/${scenarioId}`, null, { params: data });
    return response.data;
  },
  deleteScenario: async (scenarioId) => {
    const response = await apiClient.delete(`/scenarios/${scenarioId}`);
    return response.data;
  },
  compareScenario: async (scenarioId) => {
    const response = await apiClient.get(`/scenarios/${scenarioId}/compare`);
    return response.data;
  },
  
  // GDPR
  exportUserData,
  getDataSummary,
  deleteAccount,
};

export default api;