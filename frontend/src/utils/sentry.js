/**
 * Sentry Error Tracking Configuration
 * Monitors errors and performance in production
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  const environment = process.env.NODE_ENV;

  // Only initialize if DSN is provided
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [
        new BrowserTracing(),
      ],

      // Performance Monitoring - Capture 10% of transactions
      tracesSampleRate: 0.1,

      // Environment
      environment,

      // Release tracking
      release: `propequitylab@${process.env.REACT_APP_VERSION || '1.0.0'}`,

      // Only enable in production
      enabled: environment === 'production',

      // Ignore common non-critical errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',

        // Random plugins/extensions
        'fb_xd_fragment',

        // ResizeObserver errors (non-critical)
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',

        // Network errors
        'Network request failed',
        'NetworkError when attempting to fetch resource',

        // Non-Error promise rejections
        'Non-Error promise rejection captured',
      ],

      // Filter out breadcrumbs from console.log in development
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === 'console' && environment === 'development') {
          return null;
        }
        return breadcrumb;
      },

      // Add custom context to all events
      beforeSend(event, hint) {
        // Remove cookies for privacy
        if (event.request) {
          delete event.request.cookies;
        }

        // Don't send 401 authentication errors to Sentry
        if (event.exception?.values?.[0]?.value?.includes("401")) {
          return null;
        }

        // Add user information if available
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            event.user = {
              id: user.id,
              email: user.email,
            };
          } catch (e) {
            // Ignore parse errors
          }
        }

        return event;
      },
    });

    console.log('[Sentry] Error tracking initialized');
  } else {
    console.log('[Sentry] No DSN provided, error tracking disabled');
  }
};

/**
 * Manually capture an error
 */
export const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message, category = 'custom', level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now(),
  });
};

export default {
  initSentry,
  captureError,
  setUserContext,
  addBreadcrumb,
};
