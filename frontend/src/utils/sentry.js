/**
 * Sentry Error Monitoring Configuration for React
 * Captures frontend errors, performance data, and user sessions
 * Sentry Error Tracking Configuration
 * Monitors errors and performance in production
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENVIRONMENT || "development";

  // Only initialize Sentry in non-development environments
  if (dsn && environment !== "development") {
    Sentry.init({
      dsn,
      environment,

      // Browser tracing - monitors page load and navigation performance
      integrations: [
        new BrowserTracing({
          tracingOrigins: [
            "localhost",
            import.meta.env.VITE_API_URL || "http://localhost:8000",
            /^\//,
          ],
        }),
      ],

      // Performance monitoring - sample 10% of transactions
      tracesSampleRate: 0.1,

      // Enable debug mode in staging
      debug: environment === "staging",

      // Before sending to Sentry, clean sensitive data
      beforeSend(event) {
        // Remove cookies for privacy
        if (event.request) {
          delete event.request.cookies;
        }

        // Don't send 401 authentication errors to Sentry
        if (event.exception?.values?.[0]?.value?.includes("401")) {
          return null;
        }

        return event;
      },
    });

    console.log(`✅ Sentry initialized for environment: ${environment}`);
  } else {
    console.log(`⚠️  Sentry NOT initialized (environment: ${environment})`);
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
