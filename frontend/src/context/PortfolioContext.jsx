import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const { loading: authLoading, isAuthenticated, isTokenReady } = useAuth();

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

  // Gate on isTokenReady (set by AuthContext after setClerkTokenGetter wired)
  // to guarantee the Axios interceptor has a token before the first fetch fires.
  useEffect(() => {
    if (!authLoading && isAuthenticated && isTokenReady) {
      fetchPortfolios();
    } else if (!authLoading && !isAuthenticated) {
      setPortfoliosLoading(false);
    }
  }, [authLoading, isAuthenticated, isTokenReady, fetchPortfolios]);

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
    if (!isTokenReady) {
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
  }, [isTokenReady]);

  const selectPortfolio = useCallback((portfolio) => {
    setCurrentPortfolio(portfolio);
  }, []);

  const refreshSummary = useCallback(async () => {
    if (!isTokenReady) return;
    if (currentPortfolio?.id) {
      try {
        const data = await api.getPortfolioSummary(currentPortfolio.id);
        setSummary(data);
      } catch (error) {
        console.error('Failed to refresh portfolio summary:', error);
      }
    }
  }, [isTokenReady, currentPortfolio?.id]);

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
