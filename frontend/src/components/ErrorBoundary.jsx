import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const ErrorFallback = ({ error }) => {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 mb-8">
          We've been notified of this error and will look into it. Please try reloading the page.
        </p>

        {isDev && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-xs font-semibold text-red-900 mb-2">Error Details (dev only):</p>
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>

          <Button
            onClick={() => (window.location.href = '/dashboard')}
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        {isDev && (
          <p className="text-xs text-gray-500 mt-6">
            This error has been logged to Sentry for monitoring
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
