import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const { loading: authLoading, isAuthenticated } = useAuth();

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

  // Only fetch once auth is resolved and user is signed in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPortfolios();
    } else if (!authLoading && !isAuthenticated) {
      setPortfoliosLoading(false);
    }
  }, [authLoading, isAuthenticated]);

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

  const createPortfolio = async (name, type = 'actual') => {
    try {
      const newPortfolio = await api.createPortfolio({ name, type });
      setPortfolios(prev => [...prev, newPortfolio]);
      setCurrentPortfolio(newPortfolio);
      return newPortfolio;
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      throw error;
    }
  };

  const selectPortfolio = (portfolio) => {
    setCurrentPortfolio(portfolio);
  };

  const refreshSummary = async () => {
    if (currentPortfolio?.id) {
      const data = await api.getPortfolioSummary(currentPortfolio.id);
      setSummary(data);
    }
  };

  const value = {
    portfolios,
    currentPortfolio,
    loading: portfoliosLoading,
    summary,
    fetchPortfolios,
    createPortfolio,
    selectPortfolio,
    refreshSummary,
  };

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
