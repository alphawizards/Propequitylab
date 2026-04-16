import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

const UserContext = createContext(null);

// Key for localStorage to track welcome modal state
const WELCOME_SEEN_KEY = 'propequitylab_welcome_seen';

// Safe localStorage helpers — Cloudflare Pages sandboxes can deny storage access
const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently swallow storage errors in sandboxed environments
  }
};

const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently swallow storage errors in sandboxed environments
  }
};

export const UserProvider = ({ children }) => {
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  // Access Clerk's getToken directly so we can verify the token bridge is wired
  // before firing the onboarding fetch.  This prevents the race condition where
  // isAuthenticated flips to true but clerkTokenGetter is still null in api.js.
  const { getToken } = useClerkAuth();

  // profileExtras holds mutable profile fields (name, country, state, currency, etc.)
  // fetched from the backend. Auth identity always comes from AuthContext.
  const [profileExtras, setProfileExtras] = useState({});
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState({
    completed: false,
    currentStep: 0,
  });

  // Safe localStorage init — won't crash in Cloudflare Pages sandboxed iframes
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    return safeGetItem(WELCOME_SEEN_KEY) === 'true';
  });

  // Guard against re-fetching when deps change multiple times during hydration
  const fetchedRef = useRef(false);

  // Derive user by merging auth identity with mutable profile extras.
  // authUser is the single source of truth for id/email/is_verified.
  const user = authUser ? { ...authUser, ...profileExtras } : null;

  // Fetch onboarding status ONLY when:
  //   1. Clerk has finished hydrating (authLoading === false)
  //   2. The user is actually authenticated (isAuthenticated === true)
  //   3. authUser is populated (Clerk user object is ready)
  //   4. getToken is available (the Clerk token bridge is live in api.js)
  //
  // This eliminates the race condition where the fetch fires before the Bearer
  // token is wired into the Axios interceptor, causing a 401 that previously
  // kept onboardingStatus.completed === false and looped forever.
  useEffect(() => {
    // Reset the fetch guard whenever auth state changes so a re-login fetches fresh data
    fetchedRef.current = false;
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      // Wait for Clerk to fully initialise
      if (authLoading) return;

      // Not signed in — nothing to fetch
      if (!isAuthenticated || !authUser) {
        setLoading(false);
        return;
      }

      // Don't fire until Clerk's getToken is wired up (avoids the 401 race)
      if (!getToken) return;

      // Prevent duplicate fetches within the same auth session
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      setLoading(true);
      try {
        const response = await api.getOnboardingStatus();
        setOnboardingStatus({
          completed: response.completed,
          currentStep: response.current_step,
        });
        if (response.user) {
          setProfileExtras(prev => ({ ...prev, ...response.user }));
        }
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
        // On failure, assume onboarding is complete so we do NOT redirect to
        // /onboarding and loop forever.  The worst case is the user sees the
        // dashboard even if they genuinely haven't finished onboarding — far
        // better than an infinite redirect loop.
        setOnboardingStatus({ completed: true, currentStep: 8 });
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [isAuthenticated, authLoading, authUser, getToken]);

  const updateUser = (updates) => {
    setProfileExtras(prev => ({ ...prev, ...updates }));
  };

  const completeOnboarding = async () => {
    try {
      await api.completeOnboarding();
      setOnboardingStatus({ completed: true, currentStep: 8 });
      setProfileExtras(prev => ({ ...prev, onboarding_completed: true }));
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const skipOnboarding = async () => {
    try {
      await api.skipOnboarding();
      setOnboardingStatus({ completed: true, currentStep: -1 });
      setProfileExtras(prev => ({ ...prev, onboarding_completed: true }));
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await api.resetOnboarding();
      setOnboardingStatus({ completed: false, currentStep: 0 });
      setProfileExtras(prev => ({ ...prev, onboarding_completed: false, onboarding_step: 0 }));
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  };

  const markWelcomeSeen = () => {
    safeSetItem(WELCOME_SEEN_KEY, 'true');
    setHasSeenWelcome(true);
  };

  const resetWelcome = () => {
    safeRemoveItem(WELCOME_SEEN_KEY);
    setHasSeenWelcome(false);
  };

  const value = useMemo(() => ({
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
  }), [user, loading, authLoading, onboardingStatus, updateUser, completeOnboarding, skipOnboarding, resetOnboarding, hasSeenWelcome, markWelcomeSeen, resetWelcome]);
  // note: `user` is derived from authUser + profileExtras, so changes to either will re-compute it and re-run useMemo

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
