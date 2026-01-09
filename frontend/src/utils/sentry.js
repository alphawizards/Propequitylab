/**
 * Sentry Error Tracking Configuration
 * Monitors errors and performance in production
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  // Only initialize if DSN is provided
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

      // Environment
      environment: process.env.NODE_ENV,

      // Release tracking (helps identify which version has bugs)
      release: `propequitylab@${process.env.REACT_APP_VERSION || '1.0.0'}`,

      // Only enable in production
      enabled: process.env.NODE_ENV === 'production',

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
        if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'development') {
          return null;
        }
        return breadcrumb;
      },

      // Add custom context to all events
      beforeSend(event, hint) {
        // Add user information if available
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            event.user = {
              id: user.id,
              email: user.email,
              // Don't send sensitive data
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
