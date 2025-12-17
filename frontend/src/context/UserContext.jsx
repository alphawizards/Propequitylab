import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Dev Mode: Hardcoded user ID matching backend
const DEV_USER_ID = 'dev-user-01';

const defaultUser = {
  id: DEV_USER_ID,
  email: 'dev@zapiio.local',
  name: 'Dev User',
  date_of_birth: '1990-01-15',
  planning_type: 'individual',
  country: 'Australia',
  state: 'NSW',
  currency: 'AUD',
  onboarding_completed: false,
  onboarding_step: 0,
};

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUser);
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState({
    completed: false,
    currentStep: 0,
  });

  // Fetch onboarding status on mount
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
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
  }, []);

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

  const value = {
    user,
    userId: DEV_USER_ID,
    loading,
    onboardingStatus,
    updateUser,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    isDevMode: true,
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
