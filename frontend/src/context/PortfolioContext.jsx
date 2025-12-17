import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  // Fetch portfolios on mount
  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPortfolios();
      setPortfolios(data);
      
      // Set first portfolio as current if none selected
      if (data.length > 0 && !currentPortfolio) {
        setCurrentPortfolio(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPortfolio]);

  useEffect(() => {
    fetchPortfolios();
  }, []);

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
    loading,
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
