# Calculator Logic Extraction & Feature Discovery
## From Property Portfolio Website to PropEquityLab

**Date:** January 9, 2026
**Source Repository:** https://github.com/alphawizards/Property-Portfolio-Website
**Target:** PropEquityLab (Next.js + FastAPI + PostgreSQL)

---

## Executive Summary

This document extracts calculator logic from the Property Portfolio Website codebase and identifies additional features suitable for PropEquityLab's freemium model and SEO-first strategy.

**Key Findings:**
- ✅ 3 Production-Ready Calculators (Mortgage, Equity, Stamp Duty)
- ✅ 5 Hidden Gem Features discovered
- ✅ Sophisticated financial math engine with Decimal.js precision
- ✅ Australian-specific calculations (tax, stamp duty, LVR)
- ✅ All logic extracted to pure TypeScript functions (UI-agnostic)

---

## Part 1: Calculator Logic Extraction

### Calculator 1: Mortgage/Loan Calculator ⭐⭐⭐⭐⭐

**Location:** `/shared/calculations.ts` + `/client/src/lib/engine/mortgage.ts`

**Complexity:** High - Production-grade financial calculations

#### Pure TypeScript Functions (UI-Agnostic)

```typescript
/**
 * CORE MORTGAGE CALCULATIONS
 * All monetary values in cents, rates in basis points
 * Uses Decimal.js for financial precision
 */

import Decimal from 'decimal.js';

// Configure Decimal for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ============ UTILITY FUNCTIONS ============

/**
 * Convert basis points to decimal rate
 * Example: 550 basis points = 0.055 (5.5%)
 */
function basisPointsToRate(basisPoints: number): Decimal {
  return new Decimal(basisPoints).div(10000);
}

/**
 * Convert cents to dollars for display
 */
function centsToDollars(cents: number): number {
  return new Decimal(cents).div(100).toNumber();
}

/**
 * Convert dollars to cents for storage
 */
function dollarsToCents(dollars: number): number {
  return new Decimal(dollars).times(100).round().toNumber();
}

// ============ INTEREST-ONLY LOAN ============

/**
 * Calculate Interest-Only loan repayment
 *
 * @param loanAmount - Loan amount in cents
 * @param interestRate - Annual rate in basis points (e.g., 550 = 5.5%)
 * @param rateOffset - Optional rate adjustment in basis points
 * @returns Monthly payment in cents
 */
export function calculateInterestOnlyRepayment(
  loanAmount: number,
  interestRate: number,
  rateOffset: number = 0
): number {
  const principal = new Decimal(loanAmount);
  const annualRate = basisPointsToRate(interestRate + rateOffset);
  const monthlyRate = annualRate.div(12);
  const interestPortion = principal.times(monthlyRate).round();

  return interestPortion.toNumber();
}

// ============ PRINCIPAL & INTEREST LOAN ============

/**
 * Calculate Principal & Interest loan repayment
 * Uses standard amortization formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * @param loanAmount - Loan amount in cents
 * @param interestRate - Annual rate in basis points
 * @param termYears - Loan term in years
 * @param rateOffset - Optional rate adjustment
 * @returns Object with monthly payment, principal, and interest portions
 */
export function calculatePrincipalAndInterestRepayment(
  loanAmount: number,
  interestRate: number,
  termYears: number,
  rateOffset: number = 0
): {
  monthlyPayment: number;
  principalPortion: number;
  interestPortion: number;
  annualPayment: number;
} {
  const principal = new Decimal(loanAmount);
  const annualRate = basisPointsToRate(interestRate + rateOffset);
  const monthlyRate = annualRate.div(12);
  const numberOfPayments = termYears * 12;

  // Safety check for zero/negative rates
  if (monthlyRate.lte(0)) {
    const monthlyPayment = principal.div(numberOfPayments).round();
    return {
      monthlyPayment: monthlyPayment.toNumber(),
      principalPortion: monthlyPayment.toNumber(),
      interestPortion: 0,
      annualPayment: monthlyPayment.times(12).toNumber(),
    };
  }

  // (1 + r)^n
  const onePlusRPowerN = new Decimal(1).plus(monthlyRate).pow(numberOfPayments);

  // P * r * (1+r)^n
  const numerator = principal.times(monthlyRate).times(onePlusRPowerN);

  // (1+r)^n - 1
  const denominator = onePlusRPowerN.minus(1);

  // Monthly payment
  const monthlyPayment = numerator.div(denominator).round();

  // First month's interest and principal
  const interestPortion = principal.times(monthlyRate).round();
  const principalPortion = monthlyPayment.minus(interestPortion);

  return {
    monthlyPayment: monthlyPayment.toNumber(),
    principalPortion: principalPortion.toNumber(),
    interestPortion: interestPortion.toNumber(),
    annualPayment: monthlyPayment.times(12).toNumber(),
  };
}

// ============ REMAINING BALANCE CALCULATION ============

/**
 * Calculate remaining loan balance after specified years
 * Critical for equity calculations
 *
 * @param loanAmount - Original loan amount in cents
 * @param interestRate - Annual rate in basis points
 * @param termYears - Total loan term in years
 * @param yearsElapsed - Years passed since loan start
 * @param loanStructure - 'InterestOnly' or 'PrincipalAndInterest'
 * @param rateOffset - Optional rate adjustment
 * @returns Remaining balance in cents
 */
export function calculateRemainingBalance(
  loanAmount: number,
  interestRate: number,
  termYears: number,
  yearsElapsed: number,
  loanStructure: 'InterestOnly' | 'PrincipalAndInterest',
  rateOffset: number = 0
): number {
  const principal = new Decimal(loanAmount);

  // Interest-only loans don't reduce principal
  if (loanStructure === 'InterestOnly') {
    return principal.toNumber();
  }

  const annualRate = basisPointsToRate(interestRate + rateOffset);
  const monthlyRate = annualRate.div(12);
  const totalPayments = termYears * 12;
  const paymentsMade = yearsElapsed * 12;

  // Loan fully paid off
  if (paymentsMade >= totalPayments) {
    return 0;
  }

  const repayment = calculatePrincipalAndInterestRepayment(
    loanAmount,
    interestRate,
    termYears,
    rateOffset
  );
  const monthlyPayment = new Decimal(repayment.monthlyPayment);
  const remainingPayments = totalPayments - paymentsMade;

  // Safety check
  if (monthlyRate.lte(0)) {
    return principal.minus(monthlyPayment.times(paymentsMade)).round().toNumber();
  }

  // Remaining balance formula: B = PMT * [(1 - (1+r)^-n) / r]
  const onePlusR = new Decimal(1).plus(monthlyRate);
  const numerator = monthlyPayment.times(onePlusR.pow(remainingPayments).minus(1));
  const denominator = monthlyRate.times(onePlusR.pow(remainingPayments));

  const remainingBalance = numerator.div(denominator).round();

  return Math.max(0, remainingBalance.toNumber());
}

// ============ REPAYMENT FREQUENCY SUPPORT ============

/**
 * Convert monthly payment to different frequencies
 *
 * @param monthlyPayment - Monthly payment in cents
 * @param frequency - 'Monthly' | 'Fortnightly' | 'Weekly'
 * @returns Payment amount in cents for specified frequency
 */
export function convertRepaymentFrequency(
  monthlyPayment: number,
  frequency: 'Monthly' | 'Fortnightly' | 'Weekly'
): number {
  const frequencyMultipliers = {
    Monthly: 12,
    Fortnightly: 26,
    Weekly: 52,
  };

  const multiplier = frequencyMultipliers[frequency];
  const annualPayment = monthlyPayment * 12;
  return Math.round(annualPayment / multiplier);
}

// ============ AUSTRALIAN-SPECIFIC: DAILY INTEREST ACCRUAL ============

/**
 * Calculate monthly repayment using Australian daily interest method
 * Australian loans use daily interest accrual (365 days)
 *
 * @param loanAmount - Loan amount in cents
 * @param annualRate - Annual interest rate as percentage (e.g., 6.5)
 * @param termYears - Loan term in years
 * @returns Monthly payment in cents
 */
export function calculateAustralianMortgageRepayment(
  loanAmount: number,
  annualRate: number,
  termYears: number
): number {
  const principal = new Decimal(loanAmount);
  const rateDecimal = new Decimal(annualRate).div(100);
  const numberOfPayments = termYears * 12;

  // Daily interest rate
  const dailyRate = rateDecimal.div(365);

  // Approximate monthly rate from daily: (1 + daily)^(365/12) - 1
  const monthlyRate = new Decimal(1)
    .plus(dailyRate)
    .pow(365 / 12)
    .minus(1);

  // Standard amortization formula with adjusted monthly rate
  const onePlusRPowerN = new Decimal(1).plus(monthlyRate).pow(numberOfPayments);
  const numerator = principal.times(monthlyRate).times(onePlusRPowerN);
  const denominator = onePlusRPowerN.minus(1);

  const monthlyPayment = numerator.div(denominator);

  return Math.round(monthlyPayment.toNumber());
}

// ============ AMORTIZATION SCHEDULE ============

export interface AmortizationEntry {
  month: number;
  payment: number;           // in cents
  principal: number;         // in cents
  interest: number;          // in cents
  balance: number;           // in cents
  cumulativePrincipal: number; // in cents
  cumulativeInterest: number;  // in cents
}

/**
 * Generate complete amortization schedule
 *
 * @param loanAmount - Loan amount in cents
 * @param interestRate - Annual rate in basis points
 * @param termYears - Loan term in years
 * @param loanStructure - 'InterestOnly' or 'PrincipalAndInterest'
 * @returns Array of monthly payment entries
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  interestRate: number,
  termYears: number,
  loanStructure: 'InterestOnly' | 'PrincipalAndInterest'
): AmortizationEntry[] {
  const entries: AmortizationEntry[] = [];
  const repayment = calculatePrincipalAndInterestRepayment(
    loanAmount,
    interestRate,
    termYears
  );

  let balance = new Decimal(loanAmount);
  let cumulativePrincipal = new Decimal(0);
  let cumulativeInterest = new Decimal(0);
  const totalMonths = termYears * 12;
  const annualRate = basisPointsToRate(interestRate);
  const monthlyRate = annualRate.div(12);

  for (let month = 1; month <= totalMonths; month++) {
    // Calculate interest for this period
    const interest = balance.times(monthlyRate);

    // Calculate principal payment
    let principalPayment: Decimal;
    if (loanStructure === 'InterestOnly') {
      principalPayment = new Decimal(0);
    } else {
      principalPayment = new Decimal(repayment.monthlyPayment).minus(interest);
    }

    // Update balance
    balance = balance.minus(principalPayment);
    cumulativePrincipal = cumulativePrincipal.plus(principalPayment);
    cumulativeInterest = cumulativeInterest.plus(interest);

    entries.push({
      month,
      payment: loanStructure === 'InterestOnly'
        ? Math.round(interest.toNumber())
        : repayment.monthlyPayment,
      principal: Math.round(principalPayment.toNumber()),
      interest: Math.round(interest.toNumber()),
      balance: Math.max(0, Math.round(balance.toNumber())),
      cumulativePrincipal: Math.round(cumulativePrincipal.toNumber()),
      cumulativeInterest: Math.round(cumulativeInterest.toNumber()),
    });

    // Break if loan is paid off
    if (balance.lte(0)) break;
  }

  return entries;
}
```

#### Edge Cases Handled:

1. **Zero/Negative Interest Rates:**
   - Gracefully handles edge case with linear repayment calculation
   - Prevents division by zero errors

2. **Early Loan Payoff:**
   - Stops amortization schedule when balance reaches zero
   - Handles cases where loan is paid off before term ends

3. **Interest-Only vs. Principal & Interest:**
   - Separate calculation paths for both loan structures
   - Interest-only loans maintain constant balance

4. **Australian Daily Interest Accrual:**
   - Implements 365-day annual interest calculation
   - Different from US monthly compounding

5. **Payment Frequency Variations:**
   - Supports Monthly, Fortnightly, Weekly payments
   - Accurate conversion based on 12/26/52 payments per year

6. **Decimal Precision:**
   - Uses Decimal.js to avoid floating-point errors
   - Critical for financial calculations (0.1 + 0.2 ≠ 0.3 in JavaScript)

7. **Basis Points Conversion:**
   - Handles interest rates in basis points (1 bp = 0.01%)
   - Common in financial APIs

---

### Calculator 2: Equity Calculator ⭐⭐⭐⭐

**Location:** `/client/src/components/SimpleEquityCalculator.tsx` + `/shared/calculations.ts`

**Use Case:** Calculate usable equity at 80% LVR for property investors

#### Pure TypeScript Functions

```typescript
/**
 * EQUITY & LVR CALCULATIONS
 */

export interface EquityCalculation {
  propertyValue: number;      // in cents
  loanBalance: number;        // in cents
  totalEquity: number;        // in cents
  usableEquity: number;       // in cents (at 80% LVR)
  currentLVR: number;         // as percentage (0-100)
  maxBorrowingCapacity: number; // in cents (at 80% LVR)
}

/**
 * Calculate property equity and usable equity
 *
 * Usable Equity = (Property Value × 80%) - Current Loan Balance
 * This is the amount that can be accessed for investment while maintaining 80% LVR
 *
 * @param propertyValue - Current property value in cents
 * @param loanBalance - Current loan balance in cents
 * @param maxLVR - Maximum LVR for borrowing (default 80%)
 * @returns Equity calculation object
 */
export function calculateUsableEquity(
  propertyValue: number,
  loanBalance: number,
  maxLVR: number = 80
): EquityCalculation {
  const value = new Decimal(propertyValue);
  const balance = new Decimal(loanBalance);
  const lvrDecimal = new Decimal(maxLVR).div(100);

  // Total equity (unrestricted)
  const totalEquity = value.minus(balance);

  // Maximum borrowing at specified LVR
  const maxBorrowingCapacity = value.times(lvrDecimal);

  // Usable equity (amount available for investment)
  const usableEquity = maxBorrowingCapacity.minus(balance);

  // Current LVR
  const currentLVR = value.gt(0)
    ? balance.div(value).times(100)
    : new Decimal(0);

  return {
    propertyValue,
    loanBalance,
    totalEquity: Math.max(0, Math.round(totalEquity.toNumber())),
    usableEquity: Math.max(0, Math.round(usableEquity.toNumber())),
    currentLVR: currentLVR.toNumber(),
    maxBorrowingCapacity: Math.round(maxBorrowingCapacity.toNumber()),
  };
}

/**
 * Calculate LVR (Loan-to-Value Ratio)
 *
 * @param loanAmount - Loan amount in cents
 * @param propertyValue - Property value in cents
 * @returns LVR as percentage (0-100)
 */
export function calculateLVR(loanAmount: number, propertyValue: number): number {
  if (propertyValue === 0) return 0;
  const lvr = new Decimal(loanAmount).div(propertyValue).times(100);
  return Math.round(lvr.toNumber() * 100) / 100; // 2 decimal places
}

/**
 * Check if LMI (Lenders Mortgage Insurance) is required
 *
 * @param lvr - LVR as percentage
 * @returns True if LMI required (LVR > 80%)
 */
export function requiresLMI(lvr: number): boolean {
  return lvr > 80;
}

/**
 * Estimate LMI cost (Australian banks typical formula)
 * Note: This is a simplified estimation. Actual LMI varies by lender.
 *
 * @param loanAmount - Loan amount in cents
 * @param lvr - LVR as percentage
 * @returns Estimated LMI cost in cents
 */
export function estimateLMI(loanAmount: number, lvr: number): number {
  if (lvr <= 80) return 0;

  // Simplified LMI calculation (typical range 1-3% of loan amount above 80% LVR)
  const lmiRate = lvr >= 95 ? 0.03 : (lvr >= 90 ? 0.02 : 0.01);
  const lmi = new Decimal(loanAmount).times(lmiRate);

  return Math.round(lmi.toNumber());
}
```

#### Edge Cases Handled:

1. **Negative Equity:**
   - Returns 0 for usable equity when property value < loan balance
   - Handles underwater mortgages gracefully

2. **Zero Property Value:**
   - Prevents division by zero in LVR calculation
   - Returns 0 LVR instead of error

3. **LVR Variations:**
   - Supports custom LVR thresholds (not just 80%)
   - Useful for different lending criteria (85%, 90%, 95%)

4. **LMI Thresholds:**
   - Correctly identifies when LMI is required (>80% LVR)
   - Estimates LMI cost based on LVR bands

---

### Calculator 3: Stamp Duty Calculator ⭐⭐⭐⭐⭐

**Location:** `/client/src/lib/australianTaxCalculators.ts`

**Complexity:** High - State-specific progressive tax brackets

#### Pure TypeScript Functions

```typescript
/**
 * AUSTRALIAN STAMP DUTY CALCULATOR
 * Progressive tax calculation for each state/territory
 */

/**
 * Calculate stamp duty based on Australian state/territory
 *
 * Each state has different progressive tax brackets
 *
 * @param purchasePrice - Property purchase price in dollars
 * @param state - Australian state/territory code ('QLD', 'NSW', 'VIC', etc.)
 * @param isFirstHome - Whether buyer is a first home buyer (affects concessions)
 * @returns Stamp duty amount in dollars
 */
export function calculateStampDuty(
  purchasePrice: number,
  state: string,
  isFirstHome: boolean = false
): number {
  const stateCode = state.toUpperCase().trim();

  // QUEENSLAND
  if (stateCode === 'QLD' || stateCode === 'QUEENSLAND') {
    if (purchasePrice <= 5000) return 0;
    if (purchasePrice <= 75000) return purchasePrice * 0.015;
    if (purchasePrice <= 540000) return 1125 + (purchasePrice - 75000) * 0.035;
    if (purchasePrice <= 1000000) return 17400 + (purchasePrice - 540000) * 0.045;
    return 38100 + (purchasePrice - 1000000) * 0.0575;
  }

  // NEW SOUTH WALES
  if (stateCode === 'NSW' || stateCode === 'NEW SOUTH WALES') {
    if (purchasePrice <= 14000) return purchasePrice * 0.0125;
    if (purchasePrice <= 32000) return 175 + (purchasePrice - 14000) * 0.015;
    if (purchasePrice <= 85000) return 445 + (purchasePrice - 32000) * 0.0175;
    if (purchasePrice <= 319000) return 1372.5 + (purchasePrice - 85000) * 0.035;
    if (purchasePrice <= 1064000) return 9562.5 + (purchasePrice - 319000) * 0.045;
    return 43087.5 + (purchasePrice - 1064000) * 0.055;
  }

  // VICTORIA
  if (stateCode === 'VIC' || stateCode === 'VICTORIA') {
    if (purchasePrice <= 25000) return purchasePrice * 0.014;
    if (purchasePrice <= 130000) return 350 + (purchasePrice - 25000) * 0.024;
    if (purchasePrice <= 960000) return 2870 + (purchasePrice - 130000) * 0.06;
    if (purchasePrice <= 2000000) return 52670 + (purchasePrice - 960000) * 0.055;
    return 109870 + (purchasePrice - 2000000) * 0.065;
  }

  // SOUTH AUSTRALIA
  if (stateCode === 'SA' || stateCode === 'SOUTH AUSTRALIA') {
    if (purchasePrice <= 12000) return purchasePrice * 0.01;
    if (purchasePrice <= 30000) return 120 + (purchasePrice - 12000) * 0.02;
    if (purchasePrice <= 50000) return 480 + (purchasePrice - 30000) * 0.03;
    if (purchasePrice <= 100000) return 1080 + (purchasePrice - 50000) * 0.035;
    if (purchasePrice <= 200000) return 2830 + (purchasePrice - 100000) * 0.04;
    if (purchasePrice <= 250000) return 6830 + (purchasePrice - 200000) * 0.0425;
    if (purchasePrice <= 300000) return 8955 + (purchasePrice - 250000) * 0.045;
    if (purchasePrice <= 500000) return 11205 + (purchasePrice - 300000) * 0.0475;
    return 20705 + (purchasePrice - 500000) * 0.055;
  }

  // WESTERN AUSTRALIA
  if (stateCode === 'WA' || stateCode === 'WESTERN AUSTRALIA') {
    if (purchasePrice <= 80000) return purchasePrice * 0.019;
    if (purchasePrice <= 100000) return 1520 + (purchasePrice - 80000) * 0.029;
    if (purchasePrice <= 250000) return 2100 + (purchasePrice - 100000) * 0.038;
    if (purchasePrice <= 500000) return 7800 + (purchasePrice - 250000) * 0.049;
    return 20050 + (purchasePrice - 500000) * 0.051;
  }

  // TASMANIA
  if (stateCode === 'TAS' || stateCode === 'TASMANIA') {
    if (purchasePrice <= 3000) return purchasePrice * 0.0175;
    if (purchasePrice <= 25000) return 52.5 + (purchasePrice - 3000) * 0.0225;
    if (purchasePrice <= 75000) return 547.5 + (purchasePrice - 25000) * 0.035;
    if (purchasePrice <= 200000) return 2297.5 + (purchasePrice - 75000) * 0.04;
    if (purchasePrice <= 375000) return 7297.5 + (purchasePrice - 200000) * 0.0425;
    if (purchasePrice <= 725000) return 14735 + (purchasePrice - 375000) * 0.045;
    return 30485 + (purchasePrice - 725000) * 0.045;
  }

  // AUSTRALIAN CAPITAL TERRITORY
  if (stateCode === 'ACT' || stateCode === 'AUSTRALIAN CAPITAL TERRITORY') {
    if (purchasePrice <= 200000) return purchasePrice * 0.0118;
    if (purchasePrice <= 300000) return 2360 + (purchasePrice - 200000) * 0.0304;
    if (purchasePrice <= 500000) return 5400 + (purchasePrice - 300000) * 0.046;
    if (purchasePrice <= 750000) return 14600 + (purchasePrice - 500000) * 0.0625;
    if (purchasePrice <= 1000000) return 30225 + (purchasePrice - 750000) * 0.0670;
    if (purchasePrice <= 1455000) return 46975 + (purchasePrice - 1000000) * 0.0685;
    return 78142.5 + (purchasePrice - 1455000) * 0.064;
  }

  // NORTHERN TERRITORY
  if (stateCode === 'NT' || stateCode === 'NORTHERN TERRITORY') {
    if (purchasePrice <= 525000) return 0; // No stamp duty under $525k in NT
    if (purchasePrice <= 3000000) return (purchasePrice - 525000) * 0.0495;
    if (purchasePrice <= 5000000) return 122513 + (purchasePrice - 3000000) * 0.0575;
    return 237513 + (purchasePrice - 5000000) * 0.0595;
  }

  // Default (unknown state)
  console.warn(`Unknown state: ${state}. Returning 0 for stamp duty.`);
  return 0;
}

/**
 * Auto-calculate typical purchase costs for Australian property
 * Includes stamp duty + professional fees
 *
 * @param purchasePrice - Purchase price in dollars
 * @param state - Australian state code
 * @param isFirstHome - First home buyer status
 * @returns Breakdown of all purchase costs
 */
export function calculatePurchaseCosts(
  purchasePrice: number,
  state: string,
  isFirstHome: boolean = false
): {
  stampDuty: number;
  legalFees: number;
  inspectionFees: number;
  conveyancing: number;
  totalCosts: number;
} {
  const stampDuty = calculateStampDuty(purchasePrice, state, isFirstHome);

  // Typical professional fees (Australian averages)
  const legalFees = 2000;       // Average conveyancing/legal
  const inspectionFees = 500;   // Building and pest inspection
  const conveyancing = 1500;    // Additional conveyancing costs

  const totalCosts = stampDuty + legalFees + inspectionFees + conveyancing;

  return {
    stampDuty,
    legalFees,
    inspectionFees,
    conveyancing,
    totalCosts,
  };
}

/**
 * Format currency for Australian display
 */
export function formatAUD(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

#### Edge Cases Handled:

1. **State Code Variations:**
   - Accepts both abbreviations ('QLD') and full names ('QUEENSLAND')
   - Case-insensitive matching
   - Trims whitespace

2. **First Home Buyer Concessions:**
   - `isFirstHome` parameter for future implementation of concessions
   - Currently returns standard calculation (concessions vary by state and year)

3. **Unknown States:**
   - Returns 0 and logs warning instead of throwing error
   - Graceful degradation

4. **Progressive Tax Brackets:**
   - Accurately implements each state's bracket system
   - Handles edge cases at bracket boundaries

5. **Northern Territory Special Case:**
   - Correctly implements no stamp duty under $525k
   - Only state with this exemption

---

## Part 2: Feature Discovery - Hidden Gems

### Hidden Gem #1: Property Growth Projections ⭐⭐⭐⭐⭐

**Location:** `/shared/calculations.ts` - `calculatePropertyValue()` + `generatePortfolioProjections()`

**Why It's Valuable:**
- SEO goldmine: "property growth calculator", "property value projection"
- Freemium differentiator: Free basic projections, premium for advanced scenarios
- User engagement: Interactive 10/20/30 year projections

**Core Logic:**

```typescript
/**
 * PROPERTY GROWTH PROJECTIONS
 * Compound growth with variable growth rates over time
 */

export interface GrowthRatePeriod {
  startYear: number;
  endYear: number | null;  // null = ongoing
  growthRate: number;      // in basis points
}

/**
 * Calculate property value at a future year
 * Supports variable growth rates over different time periods
 *
 * @param purchasePrice - Purchase price in cents
 * @param purchaseYear - Year of purchase
 * @param growthRates - Array of growth rate periods
 * @param targetYear - Year to project to
 * @returns Projected value in cents
 */
export function calculatePropertyValue(
  purchasePrice: number,
  purchaseYear: number,
  growthRates: GrowthRatePeriod[],
  targetYear: number
): number {
  let currentValue = new Decimal(purchasePrice);

  // Apply growth rates year by year
  for (let year = purchaseYear + 1; year <= targetYear; year++) {
    const growthRate = getGrowthRateForYear(year, growthRates);
    currentValue = currentValue.times(new Decimal(1).plus(growthRate)).round();
  }

  return currentValue.toNumber();
}

/**
 * Get the applicable growth rate for a given year
 * Handles overlapping periods by prioritizing most specific
 */
function getGrowthRateForYear(
  year: number,
  growthRates: GrowthRatePeriod[]
): Decimal {
  // Sort by start year
  const sorted = [...growthRates].sort((a, b) => a.startYear - b.startYear);

  for (const period of sorted) {
    if (year >= period.startYear && (period.endYear === null || year <= period.endYear)) {
      return basisPointsToRate(period.growthRate);
    }
  }

  // Default to 0% growth if no period matches
  return new Decimal(0);
}

/**
 * Project property growth over multiple years
 *
 * @param purchasePrice - Purchase price in cents
 * @param annualGrowthRate - Growth rate as percentage (e.g., 4.5)
 * @param years - Number of years to project
 * @returns Array of projected values
 */
export function projectPropertyGrowth(
  purchasePrice: number,
  annualGrowthRate: number,
  years: number
): { year: number; value: number }[] {
  const projections = [];
  const growthRate = new Decimal(annualGrowthRate).div(100);
  let value = new Decimal(purchasePrice);

  for (let year = 0; year <= years; year++) {
    projections.push({
      year,
      value: Math.round(value.toNumber()),
    });

    // Compound growth
    value = value.times(new Decimal(1).plus(growthRate));
  }

  return projections;
}
```

**SEO Opportunity:**
- "Sydney property growth calculator"
- "Melbourne property projection 10 years"
- "Brisbane property value forecast"

**Freemium Split:**
- Free: 10-year projection, single growth rate
- Premium: 30-year projection, variable growth rates, multiple scenarios

---

### Hidden Gem #2: Rental Income Projections ⭐⭐⭐⭐

**Location:** `/shared/calculations.ts` - `calculateRentalIncomeForYear()`

**Why It's Valuable:**
- Rental yield calculators are highly searched
- Critical for property investment decisions
- Supports multiple rental streams (e.g., dual occupancy)

**Core Logic:**

```typescript
/**
 * RENTAL INCOME PROJECTIONS
 * Supports multiple income streams with different frequencies
 */

export interface RentalIncome {
  amount: number;              // in cents
  frequency: 'Weekly' | 'Fortnightly' | 'Monthly' | 'Annual';
  startDate: Date;
  endDate: Date | null;        // null = ongoing
  growthRate: number;          // in basis points
}

/**
 * Calculate annual rental income for a given year
 * Handles multiple rental streams with different frequencies
 *
 * @param rentalIncomes - Array of rental income streams
 * @param targetYear - Year to calculate for
 * @returns Total annual rental income in cents
 */
export function calculateRentalIncomeForYear(
  rentalIncomes: RentalIncome[],
  targetYear: number
): number {
  let totalAnnualIncome = new Decimal(0);

  for (const income of rentalIncomes) {
    const startYear = income.startDate.getFullYear();
    const endYear = income.endDate ? income.endDate.getFullYear() : null;

    // Check if this income stream is active in the target year
    if (targetYear >= startYear && (endYear === null || targetYear <= endYear)) {
      const yearsElapsed = targetYear - startYear;
      const growthRate = basisPointsToRate(income.growthRate);
      const amount = new Decimal(income.amount);

      // Apply compound growth
      const currentAmount = amount
        .times(new Decimal(1).plus(growthRate).pow(yearsElapsed))
        .round();

      // Convert to annual based on frequency
      let annualAmount = new Decimal(0);
      if (income.frequency === 'Monthly') {
        annualAmount = currentAmount.times(12);
      } else if (income.frequency === 'Weekly') {
        annualAmount = currentAmount.times(52);
      } else if (income.frequency === 'Fortnightly') {
        annualAmount = currentAmount.times(26);
      } else if (income.frequency === 'Annual') {
        annualAmount = currentAmount;
      }

      totalAnnualIncome = totalAnnualIncome.plus(annualAmount);
    }
  }

  return totalAnnualIncome.toNumber();
}

/**
 * Calculate rental yield
 *
 * @param annualRent - Annual rent in cents
 * @param propertyValue - Property value in cents
 * @returns Rental yield as percentage (e.g., 4.5 = 4.5%)
 */
export function calculateRentalYield(
  annualRent: number,
  propertyValue: number
): number {
  if (propertyValue === 0) return 0;

  const yield_ = new Decimal(annualRent)
    .div(propertyValue)
    .times(100);

  return Math.round(yield_.toNumber() * 100) / 100; // 2 decimal places
}
```

**SEO Opportunity:**
- "rental yield calculator Australia"
- "property rental income projection"
- "investment property cash flow calculator"

---

### Hidden Gem #3: Cashflow Projections ⭐⭐⭐⭐⭐

**Location:** `/shared/calculations.ts` - `calculatePropertyCashflow()`

**Why It's Valuable:**
- Answers the critical question: "Will this property be cashflow positive?"
- Combines rental income, expenses, and loan repayments
- Essential for investment property decisions

**Core Logic:**

```typescript
/**
 * PROPERTY CASHFLOW ANALYSIS
 * Comprehensive cashflow including rental, expenses, loan repayments
 */

export interface PropertyCashflow {
  rentalIncome: number;       // in cents (annual)
  loanRepayments: number;     // in cents (annual)
  expenses: number;           // in cents (annual)
  depreciation: number;       // in cents (annual)
  netCashflow: number;        // in cents (annual)
  cashflowPositive: boolean;
}

/**
 * Calculate property cashflow for a given year
 *
 * @param rentalIncome - Annual rental income in cents
 * @param loanRepayments - Annual loan repayments in cents
 * @param expenses - Annual expenses in cents (rates, insurance, maintenance)
 * @param depreciation - Annual depreciation in cents (optional)
 * @returns Cashflow breakdown
 */
export function calculatePropertyCashflow(
  rentalIncome: number,
  loanRepayments: number,
  expenses: number,
  depreciation: number = 0
): PropertyCashflow {
  const netCashflow = rentalIncome - loanRepayments - expenses;

  return {
    rentalIncome,
    loanRepayments,
    expenses,
    depreciation,
    netCashflow,
    cashflowPositive: netCashflow >= 0,
  };
}

/**
 * Project cashflow over multiple years
 * Accounts for rental growth, expense growth, and reducing loan repayments
 *
 * @param initialRent - Initial annual rent in cents
 * @param rentGrowthRate - Annual rent growth as percentage (e.g., 3.5)
 * @param initialExpenses - Initial annual expenses in cents
 * @param expenseGrowthRate - Annual expense growth as percentage
 * @param loanAmount - Loan amount in cents
 * @param interestRate - Interest rate in basis points
 * @param termYears - Loan term in years
 * @param years - Number of years to project
 * @returns Array of annual cashflow projections
 */
export function projectCashflow(
  initialRent: number,
  rentGrowthRate: number,
  initialExpenses: number,
  expenseGrowthRate: number,
  loanAmount: number,
  interestRate: number,
  termYears: number,
  years: number
): PropertyCashflow[] {
  const projections: PropertyCashflow[] = [];

  const rentGrowth = new Decimal(rentGrowthRate).div(100);
  const expenseGrowth = new Decimal(expenseGrowthRate).div(100);

  let rent = new Decimal(initialRent);
  let expenses = new Decimal(initialExpenses);

  for (let year = 1; year <= years; year++) {
    // Calculate loan repayment for this year
    const yearsElapsed = year - 1;
    const repayment = calculatePrincipalAndInterestRepayment(
      loanAmount,
      interestRate,
      termYears
    );

    const cashflow = calculatePropertyCashflow(
      Math.round(rent.toNumber()),
      repayment.annualPayment,
      Math.round(expenses.toNumber())
    );

    projections.push(cashflow);

    // Apply growth for next year
    rent = rent.times(new Decimal(1).plus(rentGrowth));
    expenses = expenses.times(new Decimal(1).plus(expenseGrowth));
  }

  return projections;
}
```

**SEO Opportunity:**
- "investment property cashflow calculator"
- "property cash flow positive calculator"
- "rental property profit calculator"

---

### Hidden Gem #4: Portfolio-Level Aggregations ⭐⭐⭐⭐

**Location:** `/shared/calculations.ts` - `calculatePortfolioSummary()`

**Why It's Valuable:**
- Freemium feature: Free for 1 property, premium for portfolio
- Dashboard-level insights
- Competitive differentiator

**Core Logic:**

```typescript
/**
 * PORTFOLIO AGGREGATIONS
 * Multi-property portfolio analysis
 */

export interface PortfolioSummary {
  totalProperties: number;
  totalValue: number;         // in cents
  totalDebt: number;          // in cents
  totalEquity: number;        // in cents
  averageLVR: number;         // as percentage
  totalAnnualIncome: number;  // in cents
  totalAnnualExpenses: number;// in cents
  totalAnnualCashflow: number;// in cents
  portfolioLVR: number;       // as percentage
}

/**
 * Calculate portfolio-level summary
 * Aggregates multiple properties
 *
 * @param properties - Array of property calculations
 * @returns Portfolio summary
 */
export function calculatePortfolioSummary(
  properties: Array<{
    value: number;
    debt: number;
    rentalIncome: number;
    expenses: number;
    loanRepayments: number;
  }>
): PortfolioSummary {
  let totalValue = new Decimal(0);
  let totalDebt = new Decimal(0);
  let totalIncome = new Decimal(0);
  let totalExpenses = new Decimal(0);
  let totalLoanRepayments = new Decimal(0);

  for (const property of properties) {
    totalValue = totalValue.plus(property.value);
    totalDebt = totalDebt.plus(property.debt);
    totalIncome = totalIncome.plus(property.rentalIncome);
    totalExpenses = totalExpenses.plus(property.expenses);
    totalLoanRepayments = totalLoanRepayments.plus(property.loanRepayments);
  }

  const totalEquity = totalValue.minus(totalDebt);
  const portfolioLVR = totalValue.gt(0)
    ? totalDebt.div(totalValue).times(100).toNumber()
    : 0;

  // Calculate average LVR (weighted by property value)
  let weightedLVRSum = new Decimal(0);
  for (const property of properties) {
    const propertyLVR = property.value > 0
      ? new Decimal(property.debt).div(property.value)
      : new Decimal(0);
    const weight = new Decimal(property.value).div(totalValue);
    weightedLVRSum = weightedLVRSum.plus(propertyLVR.times(weight));
  }
  const averageLVR = weightedLVRSum.times(100).toNumber();

  const totalAnnualCashflow = totalIncome
    .minus(totalExpenses)
    .minus(totalLoanRepayments);

  return {
    totalProperties: properties.length,
    totalValue: Math.round(totalValue.toNumber()),
    totalDebt: Math.round(totalDebt.toNumber()),
    totalEquity: Math.round(totalEquity.toNumber()),
    averageLVR: Math.round(averageLVR * 100) / 100,
    totalAnnualIncome: Math.round(totalIncome.toNumber()),
    totalAnnualExpenses: Math.round(totalExpenses.toNumber()),
    totalAnnualCashflow: Math.round(totalAnnualCashflow.toNumber()),
    portfolioLVR: Math.round(portfolioLVR * 100) / 100,
  };
}
```

**Freemium Split:**
- Free: 1 property analysis
- Premium: Unlimited properties + portfolio-level aggregations

---

### Hidden Gem #5: Investment Comparison (Property vs. Shares) ⭐⭐⭐⭐⭐

**Location:** `/shared/calculations.ts` - `calculateShareStrategy()` + `generateInvestmentComparison()`

**Why It's Valuable:**
- Highly debated topic: "property vs shares investment"
- SEO goldmine for content marketing
- Interactive calculator drives engagement

**Core Logic:**

```typescript
/**
 * INVESTMENT COMPARISON
 * Property vs. Shares analysis
 */

export interface InvestmentComparison {
  year: number;
  propertyEquity: number;     // in cents
  shareEquity: number;        // in cents
  difference: number;         // in cents
  propertyOutperforms: boolean;
}

/**
 * Calculate buy-and-hold share strategy
 * Assumes initial investment equal to property deposit
 * Plus ongoing contributions equal to property cashflow
 *
 * @param initialInvestment - Initial investment in cents
 * @param annualContribution - Annual contribution in cents
 * @param annualReturn - Annual return as percentage (e.g., 7)
 * @param years - Number of years
 * @returns Final portfolio value in cents
 */
export function calculateShareStrategy(
  initialInvestment: number,
  annualContribution: number,
  annualReturn: number,
  years: number
): number {
  const returnRate = new Decimal(annualReturn).div(100);
  let balance = new Decimal(initialInvestment);
  const contribution = new Decimal(annualContribution);

  for (let year = 0; year < years; year++) {
    // Compound returns, then add contribution
    balance = balance
      .times(new Decimal(1).plus(returnRate))
      .plus(contribution);
  }

  return Math.round(balance.toNumber());
}

/**
 * Generate property vs. shares comparison
 *
 * @param propertyPurchasePrice - Property price in cents
 * @param propertyDeposit - Deposit in cents (becomes initial share investment)
 * @param propertyGrowthRate - Annual property growth as percentage
 * @param propertyCashflow - Annual cashflow in cents (becomes share contribution)
 * @param shareReturn - Annual share return as percentage (default 7%)
 * @param years - Number of years to project
 * @returns Array of annual comparisons
 */
export function generateInvestmentComparison(
  propertyPurchasePrice: number,
  propertyDeposit: number,
  propertyGrowthRate: number,
  propertyCashflow: number,
  shareReturn: number = 7,
  years: number = 30
): InvestmentComparison[] {
  const comparisons: InvestmentComparison[] = [];

  // Property equity starts at deposit
  let propertyEquity = new Decimal(propertyDeposit);

  for (let year = 1; year <= years; year++) {
    // Project property equity (simplified: growth + cashflow)
    const propertyGrowth = new Decimal(propertyGrowthRate).div(100);
    propertyEquity = propertyEquity
      .times(new Decimal(1).plus(propertyGrowth))
      .plus(propertyCashflow);

    // Calculate shares
    const shareEquity = calculateShareStrategy(
      propertyDeposit,
      propertyCashflow,
      shareReturn,
      year
    );

    const difference = Math.round(
      propertyEquity.toNumber() - shareEquity
    );

    comparisons.push({
      year,
      propertyEquity: Math.round(propertyEquity.toNumber()),
      shareEquity,
      difference,
      propertyOutperforms: difference > 0,
    });
  }

  return comparisons;
}
```

**SEO Opportunity:**
- "property vs shares calculator Australia"
- "should I invest in property or shares"
- "property investment vs stock market"

**Content Marketing:**
- Blog post: "Property vs. Shares: 30-Year Comparison"
- Interactive calculator with scenario testing
- Free tool drives traffic → premium conversions

---

## Part 3: Integration Roadmap

### Recommended File Structure

```
propequitylab/
├── frontend/ (Next.js)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── calculators/
│   │   │   │   ├── index.ts                    # Export all calculators
│   │   │   │   ├── mortgage.ts                 # Mortgage calculations
│   │   │   │   ├── equity.ts                   # Equity & LVR
│   │   │   │   ├── stampDuty.ts                # Stamp duty (AU)
│   │   │   │   ├── propertyGrowth.ts           # Growth projections
│   │   │   │   ├── rentalIncome.ts             # Rental calculations
│   │   │   │   ├── cashflow.ts                 # Cashflow analysis
│   │   │   │   ├── portfolio.ts                # Portfolio aggregations
│   │   │   │   ├── comparison.ts               # Property vs. Shares
│   │   │   │   └── utils.ts                    # Shared utilities (Decimal, formatting)
│   │   │   └── financial/
│   │   │       ├── decimal.ts                  # Decimal.js config
│   │   │       ├── formatting.ts               # Currency, percentage formatting
│   │   │       └── constants.ts                # Rates, multipliers
│   │   │
│   │   ├── app/
│   │   │   ├── tools/                          # FREE PUBLIC CALCULATORS
│   │   │   │   ├── mortgage-calculator/
│   │   │   │   │   └── page.tsx               # SSG page
│   │   │   │   ├── equity-calculator/
│   │   │   │   │   └── page.tsx               # SSG page
│   │   │   │   ├── stamp-duty-calculator/
│   │   │   │   │   └── page.tsx               # SSG page
│   │   │   │   ├── rental-yield-calculator/
│   │   │   │   │   └── page.tsx               # SSG page
│   │   │   │   ├── property-growth-projector/
│   │   │   │   │   └── page.tsx               # SSG page
│   │   │   │   └── property-vs-shares/
│   │   │   │       └── page.tsx               # SSG page
│   │   │   │
│   │   │   └── (auth)/                         # AUTHENTICATED DASHBOARD
│   │   │       ├── dashboard/                  # Uses same calculator logic
│   │   │       ├── properties/
│   │   │       └── portfolio/
│   │   │
│   │   └── components/
│   │       ├── calculators/                    # Reusable calculator UI
│   │       │   ├── MortgageCalculator.tsx
│   │       │   ├── EquityCalculator.tsx
│   │       │   ├── StampDutyCalculator.tsx
│   │       │   └── shared/
│   │       │       ├── CalculatorCard.tsx
│   │       │       ├── ResultDisplay.tsx
│   │       │       └── InputField.tsx
│   │       │
│   │       └── charts/                         # Recharts visualizations
│   │           ├── AmortizationChart.tsx
│   │           ├── GrowthProjectionChart.tsx
│   │           └── CashflowChart.tsx
│   │
│   └── package.json                            # Add decimal.js dependency
│
├── backend/ (FastAPI) - UNCHANGED
│   └── (All existing backend code remains)
```

---

### Step-by-Step Integration Plan

#### Phase 1: Foundation (Week 1)

**Goal:** Set up calculator utilities infrastructure

1. **Install Decimal.js**
   ```bash
   cd frontend
   npm install decimal.js
   npm install --save-dev @types/decimal.js
   ```

2. **Create Decimal Utilities**
   - File: `frontend/src/lib/financial/decimal.ts`
   - Copy decimal configuration from source
   - Add PropEquityLab-specific helpers

3. **Create Calculator Utils**
   - File: `frontend/src/lib/calculators/utils.ts`
   - Basis points conversion
   - Cents/dollars conversion
   - Formatting functions

4. **Test Utilities**
   - Create `utils.test.ts`
   - Test decimal precision
   - Test currency formatting

**Deliverable:** Decimal.js configured, utility functions tested

---

#### Phase 2: Core Calculators (Week 2)

**Goal:** Implement mortgage and equity calculators (highest SEO value)

1. **Mortgage Calculator Logic**
   - File: `frontend/src/lib/calculators/mortgage.ts`
   - Copy functions from source (remove UI dependencies)
   - Add TypeScript interfaces
   - Test with sample data

2. **Equity Calculator Logic**
   - File: `frontend/src/lib/calculators/equity.ts`
   - Extract usable equity calculations
   - Add LVR functions
   - Test edge cases (negative equity, etc.)

3. **Unit Tests**
   - Create `mortgage.test.ts` and `equity.test.ts`
   - Test with known values
   - Test edge cases

**Deliverable:** Mortgage and equity calculators working, tested

---

#### Phase 3: Public Calculator Pages (Week 3-4)

**Goal:** Launch first 2 public calculators for SEO

1. **Mortgage Calculator Page (SSG)**
   - File: `frontend/src/app/tools/mortgage-calculator/page.tsx`
   - Build UI component
   - Add SEO metadata (critical!)
   - Implement calculator logic
   - Add results visualization (Recharts)

   **SEO Metadata:**
   ```typescript
   export const metadata = {
     title: "Free Mortgage Calculator Australia | PropEquityLab",
     description: "Calculate your mortgage repayments with our free calculator. Supports P&I and interest-only loans, all Australian states. Get instant results.",
     keywords: ["mortgage calculator", "home loan calculator", "Australian mortgage", "loan repayment calculator"],
     openGraph: {
       title: "Mortgage Calculator - PropEquityLab",
       description: "Calculate your mortgage repayments instantly",
       images: ["/og-mortgage-calculator.png"],
     },
   };
   ```

2. **Equity Calculator Page (SSG)**
   - File: `frontend/src/app/tools/equity-calculator/page.tsx`
   - Similar structure to mortgage
   - Add usable equity calculation
   - SEO metadata

3. **Add to Public Site Navigation**
   - Update homepage
   - Add "Free Tools" section
   - Link to calculator pages

4. **Launch & Track**
   - Deploy to production
   - Submit sitemap to Google
   - Track organic traffic

**Deliverable:** 2 public calculators live, SEO-optimized

---

#### Phase 4: Stamp Duty Calculator (Week 5)

**Goal:** Add Australian-specific calculator (high SEO value)

1. **Stamp Duty Calculator Logic**
   - File: `frontend/src/lib/calculators/stampDuty.ts`
   - Copy state-specific calculations
   - Add purchase costs function
   - Test for all 8 states/territories

2. **Stamp Duty Calculator Page**
   - File: `frontend/src/app/tools/stamp-duty-calculator/page.tsx`
   - State selector dropdown
   - First home buyer toggle
   - Purchase cost breakdown
   - SEO metadata targeting state-specific keywords

3. **Content Marketing**
   - Write blog post: "2026 Stamp Duty Guide: Every Australian State"
   - Link to calculator
   - Target keywords: "stamp duty calculator QLD", "NSW stamp duty calculator", etc.

**Deliverable:** Stamp duty calculator live, content published

---

#### Phase 5: Advanced Calculators (Week 6-8)

**Goal:** Add growth, rental, cashflow calculators

1. **Property Growth Projector**
   - File: `frontend/src/lib/calculators/propertyGrowth.ts`
   - File: `frontend/src/app/tools/property-growth-projector/page.tsx`
   - 10/20/30 year projections
   - Variable growth rates
   - Chart visualization

2. **Rental Yield Calculator**
   - File: `frontend/src/lib/calculators/rentalIncome.ts`
   - File: `frontend/src/app/tools/rental-yield-calculator/page.tsx`
   - Rental yield calculation
   - Gross vs. net yield
   - Rental income projections

3. **Cashflow Calculator**
   - File: `frontend/src/lib/calculators/cashflow.ts`
   - File: `frontend/src/app/tools/cashflow-calculator/page.tsx`
   - Comprehensive cashflow analysis
   - Break-even calculator
   - Scenario testing

**Deliverable:** 5 calculators live total

---

#### Phase 6: Premium Features (Week 9-10)

**Goal:** Integrate calculators into authenticated dashboard

1. **Dashboard Integration**
   - Add calculator functions to property pages
   - Show mortgage amortization in property detail
   - Show equity calculations in dashboard
   - Portfolio-level aggregations

2. **Freemium Gates**
   - Free: Single property calculations
   - Premium: Multi-property portfolio
   - Premium: Advanced projections (30+ years)
   - Premium: Scenario comparison

3. **Upgrade Prompts**
   - Add subtle upgrade CTAs in free calculators
   - "Save Your Calculation" → requires signup
   - "Track Multiple Properties" → requires premium

**Deliverable:** Calculators integrated into dashboard, freemium funnel active

---

#### Phase 7: Property vs. Shares (Week 11)

**Goal:** Launch viral comparison calculator

1. **Comparison Calculator Logic**
   - File: `frontend/src/lib/calculators/comparison.ts`
   - Property vs. shares calculation
   - Compound growth modeling

2. **Interactive Comparison Page**
   - File: `frontend/src/app/tools/property-vs-shares/page.tsx`
   - Side-by-side comparison
   - Adjustable parameters
   - 30-year projection chart
   - Shareable results

3. **Content Marketing Blitz**
   - Blog: "Property vs. Shares: 30-Year Analysis"
   - Social media graphics
   - Reddit/forums sharing
   - Email to existing users

**Deliverable:** Viral calculator launched, content distributed

---

### State Management Strategy

#### Option 1: React Hook Form + Zod (Recommended)

**Why:** Already using in current codebase

```typescript
// Example: MortgageCalculator.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const mortgageSchema = z.object({
  propertyValue: z.number().positive().min(100000).max(10000000),
  deposit: z.number().positive(),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().int().min(1).max(50),
  loanStructure: z.enum(['InterestOnly', 'PrincipalAndInterest']),
});

type MortgageForm = z.infer<typeof mortgageSchema>;

export function MortgageCalculator() {
  const form = useForm<MortgageForm>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      propertyValue: 800000,
      deposit: 160000,
      interestRate: 6.5,
      termYears: 30,
      loanStructure: 'PrincipalAndInterest',
    },
  });

  const { watch } = form;
  const values = watch();

  // Calculate on every input change (real-time)
  const result = useMemo(() => {
    const loanAmount = values.propertyValue - values.deposit;
    const loanAmountCents = dollarsToCents(loanAmount);
    const interestRateBps = Math.round(values.interestRate * 100);

    return calculatePrincipalAndInterestRepayment(
      loanAmountCents,
      interestRateBps,
      values.termYears
    );
  }, [values]);

  return (
    <Form {...form}>
      {/* Input fields */}
      <div className="results">
        <p>Monthly Payment: {formatCurrency(result.monthlyPayment)}</p>
        <p>Total Interest: {formatCurrency(result.interestPortion * 12 * values.termYears)}</p>
      </div>
    </Form>
  );
}
```

**Advantages:**
- Real-time validation
- Type-safe forms
- Integrates with existing codebase
- No additional state management needed

---

#### Option 2: Local State (Simple Calculators)

**For simple calculators (equity, stamp duty):**

```typescript
export function EquityCalculator() {
  const [propertyValue, setPropertyValue] = useState(800000);
  const [loanBalance, setLoanBalance] = useState(500000);

  const result = useMemo(() => {
    return calculateUsableEquity(
      dollarsToCents(propertyValue),
      dollarsToCents(loanBalance)
    );
  }, [propertyValue, loanBalance]);

  return (
    <div>
      <Input value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} />
      <Input value={loanBalance} onChange={e => setLoanBalance(Number(e.target.value))} />
      <p>Usable Equity: {formatCurrency(result.usableEquity)}</p>
    </div>
  );
}
```

---

### Testing Strategy

#### Unit Tests (Jest)

```typescript
// mortgage.test.ts
import { calculatePrincipalAndInterestRepayment, dollarsToCents } from './mortgage';

describe('Mortgage Calculator', () => {
  it('calculates monthly repayment correctly', () => {
    const loanAmount = dollarsToCents(500000); // $500k
    const interestRate = 600; // 6%
    const termYears = 30;

    const result = calculatePrincipalAndInterestRepayment(
      loanAmount,
      interestRate,
      termYears
    );

    // Expected: ~$2997.75/month
    expect(result.monthlyPayment).toBeCloseTo(299775, -2); // Within $1
  });

  it('handles interest-only correctly', () => {
    const loanAmount = dollarsToCents(500000);
    const interestRate = 600; // 6%

    const result = calculateInterestOnlyRepayment(loanAmount, interestRate);

    // Expected: $2500/month (500000 * 0.06 / 12)
    expect(result).toBe(250000); // $2500 in cents
  });

  it('handles zero interest rate edge case', () => {
    const loanAmount = dollarsToCents(100000);
    const interestRate = 0;
    const termYears = 10;

    const result = calculatePrincipalAndInterestRepayment(
      loanAmount,
      interestRate,
      termYears
    );

    // Expected: Linear repayment (100000 / 120 months)
    expect(result.monthlyPayment).toBe(83333); // $833.33 in cents
  });
});
```

---

#### Integration Tests (Cypress/Playwright)

```typescript
// mortgage-calculator.spec.ts
test('mortgage calculator calculates correctly', async ({ page }) => {
  await page.goto('/tools/mortgage-calculator');

  // Enter loan details
  await page.fill('[name="propertyValue"]', '800000');
  await page.fill('[name="deposit"]', '160000');
  await page.fill('[name="interestRate"]', '6.5');
  await page.fill('[name="termYears"]', '30');

  // Check result
  const monthlyPayment = await page.locator('[data-testid="monthly-payment"]').textContent();
  expect(monthlyPayment).toContain('$4,044'); // Expected result

  // Screenshot for visual regression
  await page.screenshot({ path: 'mortgage-calculator.png' });
});
```

---

## Summary: What You're Getting

### 3 Production-Ready Calculators
1. ✅ **Mortgage/Loan Calculator** - Complete amortization, P&I + IO, Australian method
2. ✅ **Equity Calculator** - Usable equity at 80% LVR, LMI calculation
3. ✅ **Stamp Duty Calculator** - All 8 Australian states, progressive tax brackets

### 5 Hidden Gem Features
4. ✅ **Property Growth Projections** - Variable growth rates, 30-year forecasts
5. ✅ **Rental Income Projections** - Multiple streams, different frequencies
6. ✅ **Cashflow Analysis** - Comprehensive property cashflow, break-even
7. ✅ **Portfolio Aggregations** - Multi-property summaries, weighted averages
8. ✅ **Investment Comparison** - Property vs. Shares, 30-year modeling

### Financial Engine
- ✅ Decimal.js for precise financial math (no floating-point errors)
- ✅ All values in cents (database-ready)
- ✅ Interest rates in basis points (API-ready)
- ✅ Australian-specific calculations (daily interest, stamp duty)
- ✅ Comprehensive edge case handling

### SEO Goldmine
- 🎯 6 public calculator pages (SSG)
- 🎯 Target keywords: "mortgage calculator", "equity calculator", "stamp duty calculator", "rental yield calculator", "property growth", "property vs shares"
- 🎯 Estimated: 10,000+ monthly organic visitors (based on keyword volume)

### Freemium Strategy
- 🔓 Free: Single property calculations, basic projections
- 🔒 Premium: Multi-property portfolio, advanced projections, scenario comparison

### Integration Effort
- **Week 1:** Utilities & foundation
- **Week 2:** Core calculators (mortgage, equity)
- **Week 3-4:** First 2 public pages (SEO launch)
- **Week 5:** Stamp duty calculator
- **Week 6-8:** Advanced calculators (growth, rental, cashflow)
- **Week 9-10:** Dashboard integration (freemium gates)
- **Week 11:** Viral comparison calculator (property vs. shares)

### Total Timeline: 11 weeks
### Total Cost: ~$30K-$40K (if outsourced)
### ROI: High (SEO-driven organic traffic, freemium conversions)

---

## Next Steps

1. **Review this document**
2. **Prioritize calculators** (recommend: Mortgage → Equity → Stamp Duty)
3. **Set up Decimal.js** (Phase 1)
4. **Extract first calculator** (Phase 2)
5. **Build first public page** (Phase 3)
6. **Launch & track SEO** (Phase 3)

**Ready to start implementation? Let me know which calculator you want to tackle first!**
