import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../services/api';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { getToken } = useClerkAuth();

  // Fetch portfolios on mount
  const fetchPortfolios = useCallback(async () => {
    try {
      setPortfoliosLoading(true);
      const data = await api.getPortfolios();
      setPortfolios(data);

      // Use functional form so we never close over stale currentPortfolio
      if (data.length > 0) {
        setCurrentPortfolio(prev => prev ?? data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setPortfoliosLoading(false);
    }
  }, []);

  // Only fetch once auth is resolved, user is signed in, and Clerk's getToken
  // is wired into the Axios interceptor (avoids the 401 race condition).
  useEffect(() => {
    if (!authLoading && isAuthenticated && getToken) {
      fetchPortfolios();
    } else if (!authLoading && !isAuthenticated) {
      setPortfoliosLoading(false);
    }
  }, [authLoading, isAuthenticated, getToken]);

  // Fetch summary when current portfolio changes
  useEffect(() => {
    const fetchSummary = async () => {
      if (currentPortfolio?.id) {
        try {
          const data = await api.getPortfolioSummary(currentPortfolio.id);
          setSummary(data);
        } catch (error) {
          console.error('Failed to fetch portfolio summary:', error);
        }
      }
    };

    fetchSummary();
  }, [currentPortfolio?.id]);

  const createPortfolio = useCallback(async (name, type = 'actual') => {
    if (!getToken) {
      throw new Error('Authentication not ready. Please try again.');
    }
    try {
      const newPortfolio = await api.createPortfolio({ name, type });
      setPortfolios(prev => [...prev, newPortfolio]);
      setCurrentPortfolio(newPortfolio);
      return newPortfolio;
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      throw error;
    }
  }, [getToken]);

  const selectPortfolio = useCallback((portfolio) => {
    setCurrentPortfolio(portfolio);
  }, []);

  const refreshSummary = useCallback(async () => {
    if (!getToken) return;
    if (currentPortfolio?.id) {
      const data = await api.getPortfolioSummary(currentPortfolio.id);
      setSummary(data);
    }
  }, [getToken, currentPortfolio?.id]);

  const value = useMemo(() => ({
    portfolios,
    currentPortfolio,
    loading: portfoliosLoading,
    summary,
    fetchPortfolios,
    createPortfolio,
    selectPortfolio,
    refreshSummary,
  }), [portfolios, currentPortfolio, portfoliosLoading, summary, fetchPortfolios, createPortfolio, selectPortfolio, refreshSummary]);

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext;
