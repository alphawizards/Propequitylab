import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const COOKIE_CONSENT_KEY = 'propequitylab_cookie_consent';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let consent = null;
    try {
      consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (e) {
      console.warn('localStorage unavailable:', e);
    }
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
        accepted: true,
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      // Silently fail - banner will just show again next time
      console.warn('localStorage unavailable:', e);
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
        accepted: false,
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      // Silently fail - banner will just show again next time
      console.warn('localStorage unavailable:', e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <p>
            We use cookies to enhance your experience. By continuing to use this site, you agree to our{' '}
            <Link to="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept} className="bg-lime-400 text-gray-900 hover:bg-lime-500">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
