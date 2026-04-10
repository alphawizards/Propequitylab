/**
 * AuthContext - Clerk adapter
 *
 * Thin wrapper over Clerk's hooks that preserves the exact same exported
 * interface as the previous JWT-based implementation so all consumer files
 * (ProtectedRoute, RootRedirect, WelcomeModalWrapper, settings pages, etc.)
 * continue to work without modification.
 *
 * Exported interface:
 *   user          - { id, email, name, is_verified } | null
 *   isAuthenticated - boolean
 *   loading       - boolean (true while Clerk is hydrating)
 *   login()       - no-op (Clerk's <SignIn> component handles this)
 *   register()    - no-op (Clerk's <SignUp> component handles this)
 *   logout()      - calls Clerk signOut()
 */

import { createContext, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { setClerkTokenGetter } from '../services/api';
import { setUserContext } from '../utils/sentry';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  const { signOut } = useClerk();

  // Wire Clerk's getToken into the api.js interceptor so every Axios request
  // automatically receives a valid Bearer token without touching localStorage.
  useEffect(() => {
    if (isLoaded && isSignedIn && getToken) {
      setClerkTokenGetter(() => getToken({ template: 'backend' }));

      // Set Sentry user context using the existing setUserContext utility
      if (clerkUser) {
        setUserContext({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
          name: clerkUser.fullName ?? '',
        });
      }
    } else if (isLoaded && !isSignedIn) {
      setClerkTokenGetter(null);
      setUserContext(null);
    }
  }, [isLoaded, isSignedIn, getToken, clerkUser]);

  // Shape user to match the legacy { id, email, name, is_verified } contract
  const user = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        name: clerkUser.fullName ?? '',
        is_verified:
          clerkUser.primaryEmailAddress?.verification?.status === 'verified',
      }
    : null;

  const value = {
    user,
    isAuthenticated: !!isSignedIn,
    loading: !isLoaded,
    // login/register are handled by Clerk's hosted UI components.
    // Kept as no-ops so any legacy call sites do not throw.
    login: async () => {},
    register: async () => {},
    logout: () => signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 *
 * Access authentication state and functions from any component.
 * Must be used within AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
