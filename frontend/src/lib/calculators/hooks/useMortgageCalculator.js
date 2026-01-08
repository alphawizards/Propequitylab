/**
 * useMortgageCalculator Hook
 * Manages state and validation for mortgage calculator
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateMortgage, generateAmortizationSchedule } from '../core/mortgage';
import { dollarsToCents, rateToBasisPoints } from '../core/decimal-utils';
import { trackCalculatorView, trackCalculatorUsage } from '../../analytics';



const DEFAULT_INPUTS = {
  purchasePrice: dollarsToCents(650000),  // $650,000
  deposit: dollarsToCents(130000),        // $130,000 (20%)
  interestRate: rateToBasisPoints(0.0625), // 6.25%
  loanTermYears: 30,
  repaymentType: 'principal-interest',
  offsetAccountBalance: 0,
};

export function useMortgageCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [errors, setErrors] = useState({});

  // Validate inputs
  const isValid = useMemo(() => {
    const newErrors = {};

    if (inputs.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than $0';
    }

    if (inputs.deposit < 0 || inputs.deposit >= inputs.purchasePrice) {
      newErrors.deposit = 'Deposit must be between $0 and purchase price';
    }

    if (inputs.interestRate < 0 || inputs.interestRate > 2000) {
      newErrors.interestRate = 'Interest rate must be between 0% and 20%';
    }

    if (inputs.loanTermYears < 1 || inputs.loanTermYears > 40) {
      newErrors.loanTermYears = 'Loan term must be between 1 and 40 years';
    }

    if (
      inputs.interestOnlyPeriodYears &&
      (inputs.interestOnlyPeriodYears < 0 || inputs.interestOnlyPeriodYears > inputs.loanTermYears)
    ) {
      newErrors.interestOnlyPeriodYears = 'IO period must be less than loan term';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [inputs]);

  // Calculate results
  const results = useMemo(() => {
    if (!isValid) return null;
    return calculateMortgage(inputs);
  }, [inputs, isValid]);

  // Generate amortization schedule
  const schedule = useMemo(() => {
    if (!isValid || !results || inputs.repaymentType === 'interest-only') return [];

    return generateAmortizationSchedule(
      results.loanAmount,
      inputs.interestRate,
      inputs.loanTermYears,
      inputs.offsetAccountBalance
    );
  }, [inputs, results, isValid]);

  const updateInput = useCallback((key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetCalculator = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setErrors({});
  }, []);

  // Track calculator view on mount
  useEffect(() => {
    trackCalculatorView('mortgage');
  }, []);

  // Track calculation usage when results change
  useEffect(() => {
    if (isValid && results) {
      trackCalculatorUsage('mortgage', inputs, results);
    }
  }, [isValid, results]);

  return {
    inputs,
    results,
    schedule,
    updateInput,
    resetCalculator,
    isValid,
    errors,
  };
}
