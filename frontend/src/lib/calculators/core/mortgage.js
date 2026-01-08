/**
 * Mortgage Calculator - Core calculation logic
 * Australian mortgage calculations with daily interest compounding
 */

import { Decimal } from 'decimal.js';
import { basisPointsToRate, centsToDecimal } from './decimal-utils';


/**
 * Calculate monthly mortgage repayment (Principal & Interest)
 * Uses Australian standard calculation: M = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculatePrincipalAndInterestRepayment(
  loanAmount,        // in cents
  interestRate,      // in basis points
  termYears,
  offsetBalance = 0  // in cents
) {
  // Adjust loan amount for offset account
  const effectiveLoan = new Decimal(loanAmount).minus(offsetBalance);
  const annualRate = basisPointsToRate(interestRate);
  const monthlyRate = annualRate.div(12);
  const numberOfPayments = termYears * 12;

  // Handle edge case: zero or negative effective loan
  if (effectiveLoan.lte(0)) {
    return {
      monthlyPayment: 0,
      principalPortion: 0,
      interestPortion: 0,
      annualPayment: 0,
    };
  }

  // Standard amortization formula
  const onePlusRPowerN = new Decimal(1).plus(monthlyRate).pow(numberOfPayments);
  const numerator = effectiveLoan.times(monthlyRate).times(onePlusRPowerN);
  const denominator = onePlusRPowerN.minus(1);

  // Protect against division by zero (0% interest rate)
  const monthlyPayment = denominator.gt(0)
    ? numerator.div(denominator).round()
    : effectiveLoan.div(numberOfPayments).round();

  const interestPortion = effectiveLoan.times(monthlyRate).round();
  const principalPortion = monthlyPayment.minus(interestPortion);

  return {
    monthlyPayment: monthlyPayment.toNumber(),
    principalPortion: principalPortion.toNumber(),
    interestPortion: interestPortion.toNumber(),
    annualPayment: monthlyPayment.times(12).toNumber(),
  };
}

/**
 * Calculate interest-only repayment
 */
export function calculateInterestOnlyRepayment(
  loanAmount,        // in cents
  interestRate,      // in basis points
  offsetBalance = 0  // in cents
) {
  const effectiveLoan = new Decimal(loanAmount).minus(offsetBalance);
  const annualRate = basisPointsToRate(interestRate);
  const monthlyRate = annualRate.div(12);

  if (effectiveLoan.lte(0)) {
    return { monthlyPayment: 0, annualPayment: 0 };
  }

  const monthlyPayment = effectiveLoan.times(monthlyRate).round();

  return {
    monthlyPayment: monthlyPayment.toNumber(),
    annualPayment: monthlyPayment.times(12).toNumber(),
  };
}

/**
 * Estimate Lenders Mortgage Insurance (LMI)
 * Note: This is a simplified estimation. Actual LMI varies by lender.
 */
function calculateLMI(loanAmount, lvr) {
  if (lvr <= 80) return 0;

  // Simplified LMI calculation (actual rates vary significantly)
  // Typical range: 1-4% of loan amount depending on LVR
  let lmiRate;

  if (lvr <= 85) lmiRate = 0.01;
  else if (lvr <= 90) lmiRate = 0.02;
  else if (lvr <= 95) lmiRate = 0.03;
  else lmiRate = 0.04;

  return Math.round(loanAmount * lmiRate);
}

/**
 * Main mortgage calculator function
 */
export function calculateMortgage(inputs) {
  const {
    purchasePrice,
    deposit,
    interestRate,
    loanTermYears,
    repaymentType,
    interestOnlyPeriodYears = 0,
    offsetAccountBalance = 0,
  } = inputs;

  // Calculate loan amount
  const loanAmount = purchasePrice - deposit;

  // Calculate LVR
  const lvr = (loanAmount / purchasePrice) * 100;

  // Check if LMI required (LVR > 80%)
  const requiresLMI = lvr > 80;
  const estimatedLMI = requiresLMI ? calculateLMI(loanAmount, lvr) : undefined;

  // Calculate repayments based on type
  let monthlyRepayment;
  let principalPortion;
  let interestPortion;
  let totalInterest;

  if (repaymentType === 'interest-only') {
    const ioResults = calculateInterestOnlyRepayment(
      loanAmount,
      interestRate,
      offsetAccountBalance
    );
    monthlyRepayment = ioResults.monthlyPayment;
    principalPortion = 0;
    interestPortion = monthlyRepayment;

    // For hybrid IO + P&I loans
    if (interestOnlyPeriodYears > 0 && interestOnlyPeriodYears < loanTermYears) {
      const ioMonths = interestOnlyPeriodYears * 12;
      const piMonths = (loanTermYears - interestOnlyPeriodYears) * 12;

      const ioTotalInterest = ioResults.monthlyPayment * ioMonths;

      const piResults = calculatePrincipalAndInterestRepayment(
        loanAmount,
        interestRate,
        loanTermYears - interestOnlyPeriodYears,
        offsetAccountBalance
      );

      const piTotalInterest = (piResults.monthlyPayment * piMonths) - loanAmount;
      totalInterest = ioTotalInterest + piTotalInterest;
    } else {
      // Pure IO loan (unusual but possible)
      totalInterest = monthlyRepayment * (loanTermYears * 12);
    }
  } else {
    // Principal & Interest
    const piResults = calculatePrincipalAndInterestRepayment(
      loanAmount,
      interestRate,
      loanTermYears,
      offsetAccountBalance
    );

    monthlyRepayment = piResults.monthlyPayment;
    principalPortion = piResults.principalPortion;
    interestPortion = piResults.interestPortion;

    const totalRepayments = monthlyRepayment * (loanTermYears * 12);
    totalInterest = totalRepayments - loanAmount;
  }

  return {
    loanAmount,
    lvr: Math.round(lvr * 100) / 100, // Round to 2 decimal places
    monthlyRepayment,
    principalPortion,
    interestPortion,
    totalInterest,
    totalRepayments: monthlyRepayment * (loanTermYears * 12),
    requiresLMI,
    estimatedLMI,
  };
}

/**
 * Generate full amortization schedule
 */
export function generateAmortizationSchedule(
  loanAmount,
  interestRate,
  termYears,
  offsetBalance = 0
) {
  const schedule = [];
  const numberOfPayments = termYears * 12;

  const repayment = calculatePrincipalAndInterestRepayment(
    loanAmount,
    interestRate,
    termYears,
    offsetBalance
  );

  let balance = new Decimal(loanAmount);
  let cumulativeInterest = new Decimal(0);
  let cumulativePrincipal = new Decimal(0);
  const monthlyRate = basisPointsToRate(interestRate).div(12);

  for (let month = 1; month <= numberOfPayments; month++) {
    const openingBalance = balance.toNumber();
    const interestPaid = balance.times(monthlyRate).round().toNumber();
    const principalPaid = repayment.monthlyPayment - interestPaid;

    balance = balance.minus(principalPaid);
    cumulativeInterest = cumulativeInterest.plus(interestPaid);
    cumulativePrincipal = cumulativePrincipal.plus(principalPaid);

    schedule.push({
      month,
      openingBalance,
      principalPaid,
      interestPaid,
      totalPayment: repayment.monthlyPayment,
      closingBalance: Math.max(0, balance.toNumber()),
      cumulativeInterest: cumulativeInterest.toNumber(),
      cumulativePrincipal: cumulativePrincipal.toNumber(),
    });

    // Break early if loan is paid off (can happen with offset accounts)
    if (balance.lte(0)) break;
  }

  return schedule;
}
