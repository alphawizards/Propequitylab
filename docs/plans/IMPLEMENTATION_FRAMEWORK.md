# PropEquityLab Implementation Framework

**Date:** January 9, 2026
**Status:** Production-Ready Implementation Guide
**Scope:** Full-Stack Calculator Integration + Public Content Platform

---

## Executive Summary

This framework provides a systematic approach to implementing PropEquityLab as a **public content platform** with integrated financial calculators. Based on your 71% completion status for private dashboard and targeting 100% production-ready public platform.

**Current State:**
- Backend: 95% complete (FastAPI + PostgreSQL + JWT Auth)
- Frontend: 71% complete (React 19 + React Router v7 + Tailwind + Shadcn/UI)
- Calculators: 0% (extraction complete, integration pending)
- Content: 0% (SEO strategy defined, execution pending)

**Target State:**
- Production-ready public content platform
- 3 live calculators driving organic traffic
- Freemium membership tiers
- SEO-optimized educational content

---

## Implementation Strategy

### Approach: Incremental Parallel Execution

We'll use a **3-track parallel approach** to maximize velocity:

1. **Track 1: Calculator Integration** (High Priority, Quick Wins)
2. **Track 2: Infrastructure Deployment** (Foundation)
3. **Track 3: Content Strategy** (SEO Growth)

Each track runs in parallel but has clear dependencies and integration points.

---

## Track 1: Calculator Integration (Weeks 1-4)

### Phase 1.1: Foundation Setup (Week 1)

#### Day 1-2: Project Structure
```bash
# Create calculator module structure
frontend/
├── src/
│   ├── lib/
│   │   ├── calculators/
│   │   │   ├── core/              # Pure calculation logic
│   │   │   │   ├── mortgage.ts
│   │   │   │   ├── equity.ts
│   │   │   │   ├── stampDuty.ts
│   │   │   │   ├── decimal-utils.ts
│   │   │   │   └── types.ts
│   │   │   ├── hooks/             # React hooks for calculator state
│   │   │   │   ├── useMortgageCalculator.ts
│   │   │   │   ├── useEquityCalculator.ts
│   │   │   │   └── useStampDutyCalculator.ts
│   │   │   └── validators/        # Input validation
│   │   │       ├── mortgageValidation.ts
│   │   │       └── currencyValidation.ts
│   ├── components/
│   │   ├── calculators/
│   │   │   ├── MortgageCalculator/
│   │   │   │   ├── MortgageCalculator.tsx
│   │   │   │   ├── MortgageInputs.tsx
│   │   │   │   ├── MortgageResults.tsx
│   │   │   │   ├── AmortizationSchedule.tsx
│   │   │   │   └── MortgageChart.tsx
│   │   │   ├── shared/
│   │   │   │   ├── CalculatorCard.tsx
│   │   │   │   ├── CurrencyInput.tsx
│   │   │   │   ├── PercentageInput.tsx
│   │   │   │   └── ResultsDisplay.tsx
│   ├── pages/
│   │   ├── calculators/
│   │   │   ├── MortgageCalculatorPage.tsx
│   │   │   ├── EquityCalculatorPage.tsx
│   │   │   └── StampDutyCalculatorPage.tsx
```

**Tasks:**
- [ ] Install Decimal.js: `npm install decimal.js @types/decimal.js`
- [ ] Copy extracted calculator logic from `CALCULATOR_EXTRACTION_GUIDE.md`
- [ ] Create type definitions for all calculator inputs/outputs
- [ ] Set up validation schemas using Zod

**Code Example - Type Definitions:**
```typescript
// frontend/src/lib/calculators/core/types.ts
import { Decimal } from 'decimal.js';

export interface MortgageInputs {
  purchasePrice: number;        // in cents
  deposit: number;              // in cents
  interestRate: number;         // in basis points (e.g., 625 = 6.25%)
  loanTermYears: number;
  repaymentType: 'principal-interest' | 'interest-only';
  interestOnlyPeriodYears?: number;
  offsetAccountBalance?: number; // in cents
}

export interface MortgageResults {
  loanAmount: number;            // in cents
  lvr: number;                   // percentage (e.g., 80.5)
  monthlyRepayment: number;      // in cents
  principalPortion: number;      // in cents (month 1)
  interestPortion: number;       // in cents (month 1)
  totalInterest: number;         // in cents (over loan term)
  totalRepayments: number;       // in cents (over loan term)
  requiresLMI: boolean;
  estimatedLMI?: number;         // in cents
}

export interface EquityInputs {
  propertyValue: number;         // in cents
  loanBalance: number;           // in cents
  maxLVR?: number;               // percentage (default 80)
}

export interface EquityResults {
  propertyValue: number;
  loanBalance: number;
  totalEquity: number;           // in cents
  usableEquity: number;          // in cents
  currentLVR: number;            // percentage
  maxBorrowingCapacity: number;  // in cents
}

export interface StampDutyInputs {
  purchasePrice: number;         // in cents
  state: AustralianState;
  isFirstHomeBuyer: boolean;
  propertyType: 'residential' | 'investment' | 'vacant-land';
}

export type AustralianState =
  | 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';

export interface StampDutyResults {
  stampDuty: number;             // in cents
  transferFee: number;           // in cents
  totalCosts: number;            // in cents
  concessionApplied: boolean;
  concessionAmount?: number;     // in cents
  breakdown: {
    description: string;
    amount: number;
  }[];
}

// Utility types for display formatting
export interface FormattedCurrency {
  raw: number;                   // in cents
  display: string;               // e.g., "$450,000.00"
  abbreviated?: string;          // e.g., "$450K"
}

export interface FormattedPercentage {
  raw: number;                   // decimal (e.g., 0.0625)
  display: string;               // e.g., "6.25%"
  basisPoints: number;           // e.g., 625
}
```

#### Day 3-4: Core Calculator Logic
Copy and integrate the pure TypeScript functions from `CALCULATOR_EXTRACTION_GUIDE.md`:

```typescript
// frontend/src/lib/calculators/core/mortgage.ts
import { Decimal } from 'decimal.js';
import { basisPointsToRate, centsToDecimal } from './decimal-utils';
import type { MortgageInputs, MortgageResults } from './types';

/**
 * Calculate monthly mortgage repayment (Principal & Interest)
 * Uses Australian standard calculation: M = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculatePrincipalAndInterestRepayment(
  loanAmount: number,        // in cents
  interestRate: number,      // in basis points
  termYears: number,
  offsetBalance: number = 0  // in cents
): {
  monthlyPayment: number;
  principalPortion: number;
  interestPortion: number;
  annualPayment: number;
} {
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
  loanAmount: number,        // in cents
  interestRate: number,      // in basis points
  offsetBalance: number = 0  // in cents
): {
  monthlyPayment: number;
  annualPayment: number;
} {
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
 * Main mortgage calculator function
 */
export function calculateMortgage(inputs: MortgageInputs): MortgageResults {
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
  let monthlyRepayment: number;
  let principalPortion: number;
  let interestPortion: number;
  let totalInterest: number;

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
 * Estimate Lenders Mortgage Insurance (LMI)
 * Note: This is a simplified estimation. Actual LMI varies by lender.
 */
function calculateLMI(loanAmount: number, lvr: number): number {
  if (lvr <= 80) return 0;

  // Simplified LMI calculation (actual rates vary significantly)
  // Typical range: 1-4% of loan amount depending on LVR
  let lmiRate: number;

  if (lvr <= 85) lmiRate = 0.01;
  else if (lvr <= 90) lmiRate = 0.02;
  else if (lvr <= 95) lmiRate = 0.03;
  else lmiRate = 0.04;

  return Math.round(loanAmount * lmiRate);
}

/**
 * Generate full amortization schedule
 */
export interface AmortizationScheduleItem {
  month: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  closingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export function generateAmortizationSchedule(
  loanAmount: number,
  interestRate: number,
  termYears: number,
  offsetBalance: number = 0
): AmortizationScheduleItem[] {
  const schedule: AmortizationScheduleItem[] = [];
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
```

```typescript
// frontend/src/lib/calculators/core/decimal-utils.ts
import { Decimal } from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9e15,
  toExpPos: 9e15,
});

/**
 * Convert basis points to decimal rate
 * Example: 625 basis points = 6.25% = 0.0625
 */
export function basisPointsToRate(basisPoints: number): Decimal {
  return new Decimal(basisPoints).div(10000);
}

/**
 * Convert decimal rate to basis points
 * Example: 0.0625 = 6.25% = 625 basis points
 */
export function rateToBasisPoints(rate: number): number {
  return new Decimal(rate).times(10000).round().toNumber();
}

/**
 * Convert cents to Decimal (for calculations)
 */
export function centsToDecimal(cents: number): Decimal {
  return new Decimal(cents);
}

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return new Decimal(dollars).times(100).round().toNumber();
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return new Decimal(cents).div(100).toNumber();
}

/**
 * Format cents as currency string
 */
export function formatCurrency(cents: number): string {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format cents as abbreviated currency (e.g., "$450K")
 */
export function formatCurrencyAbbreviated(cents: number): string {
  const dollars = centsToDollars(cents);

  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(2)}M`;
  } else if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(0)}K`;
  }

  return formatCurrency(cents);
}

/**
 * Format basis points as percentage
 */
export function formatPercentage(basisPoints: number, decimals: number = 2): string {
  const rate = basisPointsToRate(basisPoints);
  return `${rate.times(100).toFixed(decimals)}%`;
}

/**
 * Parse user input (dollar string) to cents
 * Handles: "$450,000", "450000", "450,000.50"
 */
export function parseCurrencyInput(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) return null;

  return dollarsToCents(parsed);
}

/**
 * Parse percentage input to basis points
 * Handles: "6.25%", "6.25", "0.0625"
 */
export function parsePercentageInput(input: string): number | null {
  const cleaned = input.replace(/[%\s]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) return null;

  // If value is < 1, assume it's decimal (0.0625)
  // If value is >= 1, assume it's percentage (6.25)
  const rate = parsed < 1 ? parsed : parsed / 100;

  return rateToBasisPoints(rate);
}
```

#### Day 5-7: React Integration & UI Components

```typescript
// frontend/src/lib/calculators/hooks/useMortgageCalculator.ts
import { useState, useMemo, useCallback } from 'react';
import { calculateMortgage, generateAmortizationSchedule } from '../core/mortgage';
import { dollarsToCents, rateToBasisPoints } from '../core/decimal-utils';
import type { MortgageInputs, MortgageResults } from '../core/types';

interface UseMortgageCalculatorReturn {
  inputs: MortgageInputs;
  results: MortgageResults | null;
  schedule: ReturnType<typeof generateAmortizationSchedule>;
  updateInput: (key: keyof MortgageInputs, value: any) => void;
  resetCalculator: () => void;
  isValid: boolean;
  errors: Partial<Record<keyof MortgageInputs, string>>;
}

const DEFAULT_INPUTS: MortgageInputs = {
  purchasePrice: dollarsToCents(650000),  // $650,000
  deposit: dollarsToCents(130000),        // $130,000 (20%)
  interestRate: rateToBasisPoints(0.0625), // 6.25%
  loanTermYears: 30,
  repaymentType: 'principal-interest',
  offsetAccountBalance: 0,
};

export function useMortgageCalculator(): UseMortgageCalculatorReturn {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULT_INPUTS);
  const [errors, setErrors] = useState<Partial<Record<keyof MortgageInputs, string>>>({});

  // Validate inputs
  const isValid = useMemo(() => {
    const newErrors: typeof errors = {};

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
    if (!isValid || !results) return [];

    return generateAmortizationSchedule(
      results.loanAmount,
      inputs.interestRate,
      inputs.loanTermYears,
      inputs.offsetAccountBalance
    );
  }, [inputs, results, isValid]);

  const updateInput = useCallback((key: keyof MortgageInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetCalculator = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setErrors({});
  }, []);

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
```

```tsx
// frontend/src/components/calculators/MortgageCalculator/MortgageCalculator.tsx
import React from 'react';
import { useMortgageCalculator } from '@/lib/calculators/hooks/useMortgageCalculator';
import { MortgageInputs } from './MortgageInputs';
import { MortgageResults } from './MortgageResults';
import { AmortizationSchedule } from './AmortizationSchedule';
import { MortgageChart } from './MortgageChart';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Table } from 'lucide-react';

export function MortgageCalculator() {
  const calculator = useMortgageCalculator();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">
          Mortgage Calculator
        </h1>
        <p className="text-lg text-gray-600">
          Calculate your monthly repayments, total interest, and view detailed amortization schedules
        </p>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Inputs */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Loan Details</h2>
          </div>
          <MortgageInputs calculator={calculator} />
        </Card>

        {/* Right Column: Results */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Repayment Summary</h2>
          </div>
          <MortgageResults results={calculator.results} isValid={calculator.isValid} />
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      {calculator.isValid && calculator.results && (
        <Card className="p-6">
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">
                <TrendingUp className="w-4 h-4 mr-2" />
                Visual Analysis
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Table className="w-4 h-4 mr-2" />
                Amortization Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-6">
              <MortgageChart
                results={calculator.results}
                schedule={calculator.schedule}
              />
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <AmortizationSchedule schedule={calculator.schedule} />
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {/* SEO Content Below Calculator */}
      <div className="prose max-w-none">
        <h2>How to Use the Mortgage Calculator</h2>
        <p>
          Our mortgage calculator helps you estimate your monthly repayments based on Australian lending standards.
          Simply enter your purchase price, deposit amount, interest rate, and loan term to see detailed projections.
        </p>

        <h3>Understanding Your Results</h3>
        <ul>
          <li><strong>Monthly Repayment:</strong> The amount you'll pay each month including principal and interest</li>
          <li><strong>Total Interest:</strong> The total interest paid over the life of the loan</li>
          <li><strong>LVR (Loan-to-Value Ratio):</strong> Your loan amount as a percentage of property value</li>
          <li><strong>LMI (Lenders Mortgage Insurance):</strong> Required if your LVR exceeds 80%</li>
        </ul>

        <h3>What Affects Your Mortgage Repayments?</h3>
        <p>
          Several factors influence your monthly mortgage payments:
        </p>
        <ol>
          <li><strong>Loan Amount:</strong> The amount you borrow after your deposit</li>
          <li><strong>Interest Rate:</strong> Current market rates typically range from 5-7% in Australia</li>
          <li><strong>Loan Term:</strong> Most mortgages are 25-30 years, longer terms mean lower monthly payments but more total interest</li>
          <li><strong>Repayment Type:</strong> Principal & Interest vs Interest-Only periods</li>
        </ol>
      </div>
    </div>
  );
}
```

---

### Phase 1.2: Backend Integration (Week 2)

#### Backend Calculator History API

```python
# backend/app/models/calculator_history.py
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import validator
import json

class CalculatorHistory(SQLModel, table=True):
    """Store user calculator history for logged-in users"""
    __tablename__ = "calculator_history"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    # Calculator metadata
    calculator_type: str = Field(index=True)  # 'mortgage', 'equity', 'stamp-duty'
    calculation_name: Optional[str] = None    # User-defined name

    # Input/Output storage (JSONB for flexibility)
    inputs: Dict[str, Any] = Field(sa_column_kwargs={"type_": "JSONB"})
    results: Dict[str, Any] = Field(sa_column_kwargs={"type_": "JSONB"})

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="calculator_history")

    class Config:
        arbitrary_types_allowed = True

    @validator("calculator_type")
    def validate_calculator_type(cls, v):
        allowed = ["mortgage", "equity", "stamp-duty", "rental-income", "cashflow"]
        if v not in allowed:
            raise ValueError(f"calculator_type must be one of {allowed}")
        return v


# backend/app/api/v1/calculators.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from typing import List, Dict, Any
from app.models.calculator_history import CalculatorHistory
from app.models.user import User
from app.core.deps import get_current_user, get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel

router = APIRouter(prefix="/calculators", tags=["calculators"])


class SaveCalculationRequest(BaseModel):
    calculator_type: str
    calculation_name: str
    inputs: Dict[str, Any]
    results: Dict[str, Any]


class CalculationResponse(BaseModel):
    id: int
    calculator_type: str
    calculation_name: str
    inputs: Dict[str, Any]
    results: Dict[str, Any]
    created_at: str
    updated_at: str


@router.post("/save", response_model=CalculationResponse)
async def save_calculation(
    request: SaveCalculationRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Save a calculator calculation for logged-in user"""

    calculation = CalculatorHistory(
        user_id=current_user.id,
        calculator_type=request.calculator_type,
        calculation_name=request.calculation_name,
        inputs=request.inputs,
        results=request.results,
    )

    session.add(calculation)
    await session.commit()
    await session.refresh(calculation)

    return CalculationResponse(
        id=calculation.id,
        calculator_type=calculation.calculator_type,
        calculation_name=calculation.calculation_name,
        inputs=calculation.inputs,
        results=calculation.results,
        created_at=calculation.created_at.isoformat(),
        updated_at=calculation.updated_at.isoformat(),
    )


@router.get("/history", response_model=List[CalculationResponse])
async def get_calculation_history(
    calculator_type: str = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve user's saved calculations"""

    query = select(CalculatorHistory).where(
        CalculatorHistory.user_id == current_user.id
    )

    if calculator_type:
        query = query.where(CalculatorHistory.calculator_type == calculator_type)

    query = query.order_by(CalculatorHistory.created_at.desc())

    result = await session.execute(query)
    calculations = result.scalars().all()

    return [
        CalculationResponse(
            id=calc.id,
            calculator_type=calc.calculator_type,
            calculation_name=calc.calculation_name,
            inputs=calc.inputs,
            results=calc.results,
            created_at=calc.created_at.isoformat(),
            updated_at=calc.updated_at.isoformat(),
        )
        for calc in calculations
    ]


@router.delete("/history/{calculation_id}")
async def delete_calculation(
    calculation_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a saved calculation"""

    query = select(CalculatorHistory).where(
        CalculatorHistory.id == calculation_id,
        CalculatorHistory.user_id == current_user.id,
    )

    result = await session.execute(query)
    calculation = result.scalar_one_or_none()

    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found",
        )

    await session.delete(calculation)
    await session.commit()

    return {"message": "Calculation deleted successfully"}


# Add router to main app
# backend/app/main.py
from app.api.v1.calculators import router as calculators_router

app.include_router(calculators_router, prefix="/api/v1")
```

---

### Phase 1.3: SEO Optimization (Week 3)

#### SEO-Optimized Calculator Pages

```tsx
// frontend/src/pages/calculators/MortgageCalculatorPage.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MortgageCalculator } from '@/components/calculators/MortgageCalculator/MortgageCalculator';

export function MortgageCalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Mortgage Calculator Australia",
    "description": "Free Australian mortgage calculator. Calculate monthly repayments, total interest, and view detailed amortization schedules for home loans.",
    "url": "https://propequitylab.com/calculators/mortgage",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "AUD"
    },
    "featureList": [
      "Calculate monthly mortgage repayments",
      "View amortization schedules",
      "Compare principal vs interest",
      "Estimate LMI costs",
      "Offset account impact analysis"
    ]
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Mortgage Calculator Australia | Free Home Loan Calculator 2026</title>
        <meta
          name="description"
          content="Calculate your Australian mortgage repayments with our free calculator. Get accurate estimates for monthly payments, total interest, LMI, and view detailed amortization schedules."
        />
        <meta
          name="keywords"
          content="mortgage calculator, home loan calculator, mortgage repayment calculator, loan calculator australia, mortgage calculator australia, home loan repayments"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://propequitylab.com/calculators/mortgage" />
        <meta property="og:title" content="Mortgage Calculator Australia | Free Home Loan Calculator" />
        <meta
          property="og:description"
          content="Calculate your Australian mortgage repayments with our free calculator. Get accurate monthly payment estimates and detailed amortization schedules."
        />
        <meta property="og:image" content="https://propequitylab.com/images/og-mortgage-calculator.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://propequitylab.com/calculators/mortgage" />
        <meta property="twitter:title" content="Mortgage Calculator Australia | Free Home Loan Calculator" />
        <meta
          property="twitter:description"
          content="Calculate your Australian mortgage repayments with our free calculator. Get accurate monthly payment estimates."
        />
        <meta property="twitter:image" content="https://propequitylab.com/images/twitter-mortgage-calculator.png" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://propequitylab.com/calculators/mortgage" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <MortgageCalculator />

        {/* Rich SEO Content Below Calculator */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <article className="prose lg:prose-xl">
            <h2>Understanding Mortgage Calculators in Australia</h2>
            <p>
              A mortgage calculator is an essential tool for anyone looking to buy property in Australia.
              Whether you're a first home buyer or an experienced investor, understanding your potential
              repayments is crucial for financial planning.
            </p>

            <h3>How Australian Mortgage Calculations Work</h3>
            <p>
              Australian home loans typically use a reducing balance calculation method, where interest
              is calculated daily on the outstanding loan balance. This means as you pay down your loan,
              the interest portion of your repayment decreases while the principal portion increases.
            </p>

            <h3>Key Terms Explained</h3>
            <dl>
              <dt><strong>Principal:</strong></dt>
              <dd>The original amount you borrow from the lender.</dd>

              <dt><strong>Interest Rate:</strong></dt>
              <dd>The annual percentage charged by the lender, typically expressed as a comparison rate in Australia.</dd>

              <dt><strong>LVR (Loan-to-Value Ratio):</strong></dt>
              <dd>Your loan amount divided by the property value, expressed as a percentage.</dd>

              <dt><strong>LMI (Lenders Mortgage Insurance):</strong></dt>
              <dd>Insurance required when your LVR exceeds 80%, protecting the lender if you default.</dd>

              <dt><strong>Offset Account:</strong></dt>
              <dd>A transaction account linked to your mortgage that reduces the interest charged.</dd>
            </dl>

            <h3>Typical Australian Mortgage Rates (2026)</h3>
            <p>
              As of January 2026, Australian mortgage rates typically range from:
            </p>
            <ul>
              <li><strong>Variable rates:</strong> 5.5% - 7.0% p.a.</li>
              <li><strong>Fixed rates (1-5 years):</strong> 5.8% - 6.8% p.a.</li>
              <li><strong>Investment property rates:</strong> Typically 0.2-0.5% higher than owner-occupied</li>
            </ul>

            <h3>Factors That Affect Your Mortgage Repayments</h3>
            <ol>
              <li><strong>Loan Amount:</strong> The more you borrow, the higher your repayments</li>
              <li><strong>Interest Rate:</strong> Even 0.25% can significantly impact total interest paid</li>
              <li><strong>Loan Term:</strong> Longer terms = lower monthly payments but more total interest</li>
              <li><strong>Repayment Frequency:</strong> Fortnightly payments can save thousands in interest</li>
              <li><strong>Offset Accounts:</strong> Reduces interest charged on your loan balance</li>
              <li><strong>Extra Repayments:</strong> Can significantly reduce loan term and total interest</li>
            </ol>

            <h3>Frequently Asked Questions</h3>

            <h4>What's the difference between principal & interest vs interest-only?</h4>
            <p>
              <strong>Principal & Interest (P&I):</strong> Your repayments cover both the loan amount and interest,
              gradually reducing your debt over time. This is the standard repayment method.
            </p>
            <p>
              <strong>Interest-Only (IO):</strong> You only pay the interest for a set period (usually 1-5 years),
              with the loan balance remaining unchanged. After the IO period, repayments increase as you start
              paying off principal. Often used by investors for tax benefits.
            </p>

            <h4>How much deposit do I need?</h4>
            <p>
              Most lenders require a minimum 5-20% deposit:
            </p>
            <ul>
              <li><strong>20%+ deposit:</strong> No LMI required, best interest rates</li>
              <li><strong>10-20% deposit:</strong> LMI required, good interest rates</li>
              <li><strong>5-10% deposit:</strong> Higher LMI, stricter lending criteria</li>
              <li><strong>First Home Buyer schemes:</strong> May allow as low as 5% with government guarantee</li>
            </ul>

            <h4>What is LMI and how much does it cost?</h4>
            <p>
              Lenders Mortgage Insurance (LMI) protects the lender if you default on your loan. It's typically
              required when your LVR exceeds 80%. Costs vary significantly:
            </p>
            <ul>
              <li><strong>85% LVR:</strong> Approximately 1-2% of loan amount</li>
              <li><strong>90% LVR:</strong> Approximately 2-3% of loan amount</li>
              <li><strong>95% LVR:</strong> Approximately 3-6% of loan amount</li>
            </ul>
            <p>
              LMI can be capitalized (added to your loan) or paid upfront. The exact cost depends on your loan
              amount, LVR, and lender.
            </p>

            <h4>Should I choose variable or fixed rates?</h4>
            <p>
              <strong>Variable Rate Pros:</strong>
            </p>
            <ul>
              <li>Benefit from rate decreases</li>
              <li>Flexibility to make extra repayments</li>
              <li>Access to offset accounts and redraw facilities</li>
              <li>No break costs if you refinance or sell</li>
            </ul>

            <p>
              <strong>Fixed Rate Pros:</strong>
            </p>
            <ul>
              <li>Certainty of repayments for 1-5 years</li>
              <li>Protection from rate increases</li>
              <li>Easier budgeting</li>
            </ul>

            <p>
              Many borrowers choose a "split loan" - partially fixed, partially variable - to balance
              certainty with flexibility.
            </p>

            <h3>Tips to Reduce Your Mortgage Repayments</h3>
            <ol>
              <li><strong>Make extra repayments:</strong> Even $100/month extra can save tens of thousands in interest</li>
              <li><strong>Pay fortnightly instead of monthly:</strong> Results in 13 monthly payments per year instead of 12</li>
              <li><strong>Use an offset account:</strong> Reduces interest charged without losing liquidity</li>
              <li><strong>Refinance for better rates:</strong> Shop around every 2-3 years</li>
              <li><strong>Negotiate with your lender:</strong> Many lenders will reduce rates to retain customers</li>
              <li><strong>Reduce your loan term:</strong> If you can afford higher repayments, save significantly on interest</li>
            </ol>

            <h3>Next Steps</h3>
            <p>
              Once you've calculated your estimated repayments:
            </p>
            <ol>
              <li><strong>Check your borrowing power:</strong> Use our <a href="/calculators/borrowing-power">Borrowing Power Calculator</a></li>
              <li><strong>Calculate upfront costs:</strong> Use our <a href="/calculators/stamp-duty">Stamp Duty Calculator</a></li>
              <li><strong>Understand equity:</strong> Use our <a href="/calculators/equity">Equity Calculator</a> for investment planning</li>
              <li><strong>Get pre-approval:</strong> Contact lenders for formal pre-approval based on your calculations</li>
              <li><strong>Consult a mortgage broker:</strong> Professional advice can help find the best rates and structure</li>
            </ol>
          </article>

          {/* Related Calculators */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Related Calculators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/calculators/stamp-duty" className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-blue-600">Stamp Duty Calculator</h4>
                <p className="text-sm text-gray-600 mt-1">Calculate stamp duty for all Australian states</p>
              </a>
              <a href="/calculators/equity" className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-blue-600">Equity Calculator</h4>
                <p className="text-sm text-gray-600 mt-1">Calculate usable equity for investment</p>
              </a>
              <a href="/calculators/rental-income" className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-blue-600">Rental Income Calculator</h4>
                <p className="text-sm text-gray-600 mt-1">Project rental income and expenses</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

---

### Phase 1.4: Testing & Analytics (Week 4)

#### Unit Tests for Calculator Logic

```typescript
// frontend/src/lib/calculators/core/__tests__/mortgage.test.ts
import { describe, it, expect } from 'vitest';
import { calculateMortgage, generateAmortizationSchedule } from '../mortgage';
import { dollarsToCents, rateToBasisPoints } from '../decimal-utils';

describe('Mortgage Calculator', () => {
  describe('calculateMortgage', () => {
    it('should calculate correct repayments for standard 80% LVR loan', () => {
      const result = calculateMortgage({
        purchasePrice: dollarsToCents(650000),
        deposit: dollarsToCents(130000),
        interestRate: rateToBasisPoints(0.0625), // 6.25%
        loanTermYears: 30,
        repaymentType: 'principal-interest',
      });

      expect(result.loanAmount).toBe(dollarsToCents(520000));
      expect(result.lvr).toBeCloseTo(80, 2);
      expect(result.requiresLMI).toBe(false);
      expect(result.monthlyRepayment).toBeGreaterThan(0);

      // Verify monthly repayment is approximately $3,201 (expected value)
      expect(result.monthlyRepayment).toBeCloseTo(dollarsToCents(3201), -2);
    });

    it('should require LMI for LVR > 80%', () => {
      const result = calculateMortgage({
        purchasePrice: dollarsToCents(650000),
        deposit: dollarsToCents(65000), // 10% deposit = 90% LVR
        interestRate: rateToBasisPoints(0.065),
        loanTermYears: 30,
        repaymentType: 'principal-interest',
      });

      expect(result.lvr).toBeCloseTo(90, 2);
      expect(result.requiresLMI).toBe(true);
      expect(result.estimatedLMI).toBeGreaterThan(0);
    });

    it('should handle interest-only repayments correctly', () => {
      const result = calculateMortgage({
        purchasePrice: dollarsToCents(650000),
        deposit: dollarsToCents(130000),
        interestRate: rateToBasisPoints(0.0625),
        loanTermYears: 30,
        repaymentType: 'interest-only',
        interestOnlyPeriodYears: 5,
      });

      expect(result.principalPortion).toBe(0);
      expect(result.interestPortion).toBe(result.monthlyRepayment);

      // IO repayment should be less than P&I
      expect(result.monthlyRepayment).toBeLessThan(dollarsToCents(3000));
    });

    it('should reduce repayments with offset account', () => {
      const withoutOffset = calculateMortgage({
        purchasePrice: dollarsToCents(650000),
        deposit: dollarsToCents(130000),
        interestRate: rateToBasisPoints(0.0625),
        loanTermYears: 30,
        repaymentType: 'principal-interest',
        offsetAccountBalance: 0,
      });

      const withOffset = calculateMortgage({
        purchasePrice: dollarsToCents(650000),
        deposit: dollarsToCents(130000),
        interestRate: rateToBasisPoints(0.0625),
        loanTermYears: 30,
        repaymentType: 'principal-interest',
        offsetAccountBalance: dollarsToCents(50000),
      });

      expect(withOffset.monthlyRepayment).toBeLessThan(withoutOffset.monthlyRepayment);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('should generate correct number of payments', () => {
      const schedule = generateAmortizationSchedule(
        dollarsToCents(520000),
        rateToBasisPoints(0.0625),
        30,
        0
      );

      expect(schedule).toHaveLength(360); // 30 years * 12 months
    });

    it('should have decreasing interest and increasing principal', () => {
      const schedule = generateAmortizationSchedule(
        dollarsToCents(520000),
        rateToBasisPoints(0.0625),
        30,
        0
      );

      const firstMonth = schedule[0];
      const lastMonth = schedule[schedule.length - 1];

      expect(firstMonth.interestPaid).toBeGreaterThan(lastMonth.interestPaid);
      expect(firstMonth.principalPaid).toBeLessThan(lastMonth.principalPaid);
    });

    it('should have final balance close to zero', () => {
      const schedule = generateAmortizationSchedule(
        dollarsToCents(520000),
        rateToBasisPoints(0.0625),
        30,
        0
      );

      const lastMonth = schedule[schedule.length - 1];
      expect(lastMonth.closingBalance).toBeLessThanOrEqual(100); // Allow 1 cent rounding
    });
  });
});
```

#### Analytics & Conversion Tracking

```typescript
// frontend/src/lib/analytics.ts
interface CalculatorEvent {
  calculator_type: string;
  action: 'viewed' | 'calculated' | 'saved' | 'shared';
  inputs?: Record<string, any>;
  results?: Record<string, any>;
}

export const analytics = {
  // Track calculator usage
  trackCalculatorEvent(event: CalculatorEvent) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: 'calculator',
        event_label: event.calculator_type,
        calculator_type: event.calculator_type,
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_type: 'calculator',
        content_name: event.calculator_type,
      });
    }
  },

  // Track conversion to registration
  trackSignupConversion(source: 'calculator' | 'cta' | 'header') {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'sign_up', {
        method: source,
      });
    }

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'CompleteRegistration', {
        content_name: source,
      });
    }
  },

  // Track upgrade to premium
  trackPremiumUpgrade(plan: string, price: number) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: `premium_${Date.now()}`,
        value: price,
        currency: 'AUD',
        items: [{
          item_name: plan,
          item_category: 'subscription',
          price: price,
        }],
      });
    }

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value: price,
        currency: 'AUD',
        content_type: 'product',
        content_name: plan,
      });
    }
  },
};
```

---

## Track 2: Infrastructure Deployment (Weeks 2-4)

### Phase 2.1: CI/CD Pipeline Setup

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: ap-southeast-2
  ECR_REPOSITORY: propequitylab-backend
  ECS_SERVICE: propequitylab-service
  ECS_CLUSTER: propequitylab-cluster
  ECS_TASK_DEFINITION: .aws/task-definition.json

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio

      - name: Run tests
        run: |
          cd backend
          pytest tests/ --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run tests
        run: |
          cd frontend
          npm run test:ci

      - name: Build
        run: |
          cd frontend
          npm run build

  deploy-backend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ env.ECS_TASK_DEFINITION }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

  deploy-frontend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies and build
        env:
          REACT_APP_API_URL: ${{ secrets.PROD_API_URL }}
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: propequitylab
          directory: frontend/build
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

---

### Phase 2.2: Environment Configuration

```bash
# backend/.env.production
# Database
DATABASE_URL=postgresql://user:password@propequitylab-db.abc123.ap-southeast-2.rds.amazonaws.com:5432/propequitylab

# Redis
REDIS_URL=redis://propequitylab-redis.abc123.cache.amazonaws.com:6379

# JWT
JWT_SECRET=<your-production-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (AWS SES)
SMTP_HOST=email-smtp.ap-southeast-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=<ses-smtp-user>
SMTP_PASSWORD=<ses-smtp-password>
FROM_EMAIL=noreply@propequitylab.com

# CORS
CORS_ORIGINS=["https://propequitylab.com", "https://www.propequitylab.com"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_BURST=10

# Sentry
SENTRY_DSN=<your-sentry-dsn>
ENVIRONMENT=production
```

```bash
# frontend/.env.production
REACT_APP_API_URL=https://api.propequitylab.com
REACT_APP_ENVIRONMENT=production
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
REACT_APP_FB_PIXEL_ID=XXXXXXXXXXXX
REACT_APP_SENTRY_DSN=<your-sentry-dsn>
```

---

## Track 3: Content Strategy (Weeks 3-12)

### Phase 3.1: Content Calendar & SEO Strategy

```markdown
# Content Production Calendar - Q1 2026

## Week 1-2: Foundation Content (High Priority)
1. **Calculator Landing Pages** (3 articles)
   - Mortgage Calculator Guide
   - Equity Calculator Guide
   - Stamp Duty Calculator Guide

## Week 3-4: First Home Buyers (High Volume Keywords)
2. **First Home Buyer Series** (5 articles)
   - First Home Buyer Guide Australia 2026
   - How Much Deposit Do I Need?
   - First Home Owner Grant by State
   - Stamp Duty Concessions for First Home Buyers
   - Best Suburbs for First Home Buyers (by city)

## Week 5-6: Mortgage & Loan Guides
3. **Mortgage Education** (5 articles)
   - Fixed vs Variable Home Loans: Which is Better?
   - What is an Offset Account and Should You Get One?
   - Interest-Only vs Principal & Interest Loans
   - How to Reduce Your Mortgage Faster
   - Refinancing Your Home Loan: Complete Guide

## Week 7-8: Investment Property
4. **Property Investment Series** (5 articles)
   - Beginner's Guide to Investment Property
   - Negative Gearing Explained
   - How to Calculate Rental Yield
   - Using Equity to Buy Investment Property
   - Tax Deductions for Investment Properties

## Week 9-10: State-Specific Guides
5. **State Guides** (8 articles, high SEO value)
   - NSW Stamp Duty Calculator & Guide
   - VIC Stamp Duty Calculator & Guide
   - QLD Stamp Duty Calculator & Guide
   - (Continue for all 8 states/territories)

## Week 11-12: Advanced Topics
6. **Advanced Investment Strategies** (5 articles)
   - Property Portfolio Strategy
   - Cross-Collateralization: Pros & Cons
   - SMSF Property Investment Guide
   - Rentvesting: Complete Guide
   - Property Development for Beginners
```

---

## Success Metrics & KPIs

### Calculator Performance Metrics

```typescript
// Track these metrics weekly
const calculatorKPIs = {
  // Traffic Metrics
  monthlyVisitors: 0,           // Target: 30,000 by Month 3
  organicSearchTraffic: 0,      // Target: 60% of total traffic
  bounceRate: 0,                // Target: < 40%
  avgTimeOnPage: 0,             // Target: > 3 minutes

  // Engagement Metrics
  calculationsPerformed: 0,      // Target: 50,000/month
  returnVisitors: 0,             // Target: 20%
  socialShares: 0,               // Target: 500/month

  // Conversion Metrics
  signupConversionRate: 0,       // Target: 2% (600 signups/month at 30K visitors)
  premiumConversionRate: 0,      // Target: 5% of signups (30/month)
  mrr: 0,                        // Target: $1,470/month (30 * $49)

  // SEO Metrics
  keywordRankings: {
    'mortgage calculator': 0,    // Target: Top 10
    'home loan calculator': 0,   // Target: Top 10
    'stamp duty calculator': 0,  // Target: Top 5
  },
  backlinks: 0,                  // Target: 50+ quality backlinks
  domainAuthority: 0,            // Target: 40+
};
```

---

## Risk Mitigation

### Common Implementation Pitfalls

1. **Over-Engineering Calculators**
   - **Risk:** Spending months building features users don't need
   - **Mitigation:** Launch MVP with 3 calculators, iterate based on analytics
   - **Timeline:** Week 1-4 for MVP, not Month 1-6

2. **SEO Content Without Distribution**
   - **Risk:** Creating 200 articles that nobody reads
   - **Mitigation:** Backlink outreach, guest posting, Reddit/forums, social media
   - **Action:** Dedicate 30% of time to distribution, not just creation

3. **Infrastructure Complexity**
   - **Risk:** Over-architecting deployment for pre-scale traffic
   - **Mitigation:** Start simple (single EC2 + RDS), scale when needed
   - **Timeline:** Production deployment in 2 weeks, not 2 months

4. **Perfectionism Paralysis**
   - **Risk:** Never launching because "it's not perfect"
   - **Mitigation:** Set hard launch deadline, iterate post-launch
   - **Action:** Launch date = 4 weeks from start, non-negotiable

---

## Next Steps: Immediate Actions

### This Week (Week 1)
- [ ] Review and approve this implementation framework
- [ ] Set up project tracking (GitHub Projects or similar)
- [ ] Install Decimal.js in frontend: `npm install decimal.js`
- [ ] Copy mortgage calculator logic from extraction guide
- [ ] Create basic calculator UI component
- [ ] Set up analytics tracking (GA4 + Facebook Pixel)

### Next Week (Week 2)
- [ ] Complete mortgage calculator page with SEO
- [ ] Deploy to staging environment for testing
- [ ] Begin equity calculator implementation
- [ ] Write first 3 SEO articles for calculator landing pages
- [ ] Set up CI/CD pipeline

### Week 3-4
- [ ] Launch all 3 calculators to production
- [ ] Deploy infrastructure (AWS + Cloudflare)
- [ ] Begin content marketing (10 articles published)
- [ ] Start backlink outreach campaign

---

## Questions Before Starting?

1. Do you want to start with mortgage calculator first? (Recommended)
2. Should I create the full mortgage calculator component code now?
3. Do you need help setting up AWS infrastructure?
4. Should I create a GitHub Projects board for tracking?

This framework gives you a clear, actionable roadmap from 71% → 100% production-ready public platform with SEO-driven growth.
