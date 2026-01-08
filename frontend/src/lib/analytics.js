/**
 * Analytics tracking for calculators and user actions
 * Supports Google Analytics 4 and Facebook Pixel
 */

/**
 * Track calculator usage event
 */
export const trackCalculatorEvent = (calculatorType, action, data = {}) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'calculator',
      event_label: calculatorType,
      calculator_type: calculatorType,
      ...data,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_type: 'calculator',
      content_name: calculatorType,
      ...data,
    });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', action, { calculatorType, data });
  }
};

/**
 * Track when user views a calculator
 */
export const trackCalculatorView = (calculatorType) => {
  trackCalculatorEvent(calculatorType, 'calculator_viewed');
};

/**
 * Track when user performs a calculation
 */
export const trackCalculatorUsage = (calculatorType, inputs, results) => {
  trackCalculatorEvent(calculatorType, 'calculation_performed', {
    // Send sanitized/aggregated data only (no PII)
    loan_amount_range: getLoanAmountRange(results.loanAmount),
    lvr_range: getLVRRange(results.lvr),
    repayment_type: inputs.repaymentType,
  });
};

/**
 * Track when user saves a calculation (logged-in users)
 */
export const trackCalculatorSave = (calculatorType) => {
  trackCalculatorEvent(calculatorType, 'calculation_saved');
};

/**
 * Track when user shares a calculation
 */
export const trackCalculatorShare = (calculatorType, platform) => {
  trackCalculatorEvent(calculatorType, 'calculation_shared', {
    share_platform: platform,
  });
};

/**
 * Track when user exports data (CSV, PDF, etc.)
 */
export const trackCalculatorExport = (calculatorType, exportType) => {
  trackCalculatorEvent(calculatorType, 'calculation_exported', {
    export_type: exportType,
  });
};

/**
 * Track conversion to registration from calculator
 */
export const trackSignupConversion = (source = 'calculator') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: source,
    });
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: source,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Sign up conversion:', source);
  }
};

/**
 * Track upgrade to premium
 */
export const trackPremiumUpgrade = (plan, price) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `premium_${Date.now()}`,
      value: price,
      currency: 'AUD',
      items: [
        {
          item_name: plan,
          item_category: 'subscription',
          price: price,
        },
      ],
    });
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: price,
      currency: 'AUD',
      content_type: 'product',
      content_name: plan,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Premium upgrade:', plan, price);
  }
};

/**
 * Helper: Get loan amount range for analytics (no PII)
 */
function getLoanAmountRange(loanAmountCents) {
  const amount = loanAmountCents / 100; // Convert cents to dollars

  if (amount < 100000) return 'under_100k';
  if (amount < 250000) return '100k_250k';
  if (amount < 500000) return '250k_500k';
  if (amount < 750000) return '500k_750k';
  if (amount < 1000000) return '750k_1m';
  return 'over_1m';
}

/**
 * Helper: Get LVR range for analytics
 */
function getLVRRange(lvr) {
  if (lvr <= 60) return 'very_low'; // <= 60%
  if (lvr <= 80) return 'low'; // 60-80%
  if (lvr <= 90) return 'medium'; // 80-90%
  if (lvr <= 95) return 'high'; // 90-95%
  return 'very_high'; // > 95%
}

export default {
  trackCalculatorView,
  trackCalculatorUsage,
  trackCalculatorSave,
  trackCalculatorShare,
  trackCalculatorExport,
  trackSignupConversion,
  trackPremiumUpgrade,
};
