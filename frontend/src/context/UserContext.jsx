import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

// Key for localStorage to track welcome modal state
const WELCOME_SEEN_KEY = 'propequitylab_welcome_seen';

export const UserProvider = ({ children }) => {
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState({
    completed: false,
    currentStep: 0,
  });
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    // Check localStorage on initial load
    return localStorage.getItem(WELCOME_SEEN_KEY) === 'true';
  });

  // Update user when authUser changes
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // Fetch onboarding status when authenticated
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!isAuthenticated || authLoading) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getOnboardingStatus();
        setOnboardingStatus({
          completed: response.completed,
          currentStep: response.current_step,
        });
        if (response.user) {
          setUser(prev => ({ ...prev, ...response.user }));
        }
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [isAuthenticated, authLoading]);

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const completeOnboarding = async () => {
    try {
      await api.completeOnboarding();
      setOnboardingStatus({ completed: true, currentStep: 8 });
      setUser(prev => ({ ...prev, onboarding_completed: true }));
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const skipOnboarding = async () => {
    try {
      await api.skipOnboarding();
      setOnboardingStatus({ completed: true, currentStep: -1 });
      setUser(prev => ({ ...prev, onboarding_completed: true }));
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await api.resetOnboarding();
      setOnboardingStatus({ completed: false, currentStep: 0 });
      setUser(prev => ({ ...prev, onboarding_completed: false, onboarding_step: 0 }));
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  };

  const markWelcomeSeen = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setHasSeenWelcome(true);
  };

  const resetWelcome = () => {
    localStorage.removeItem(WELCOME_SEEN_KEY);
    setHasSeenWelcome(false);
  };

  const value = {
    user,
    userId: user?.id,
    loading: loading || authLoading,
    onboardingStatus,
    updateUser,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    hasSeenWelcome,
    markWelcomeSeen,
    resetWelcome,
    isDevMode: false,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
