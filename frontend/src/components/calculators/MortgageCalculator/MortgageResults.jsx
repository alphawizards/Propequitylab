/**
 * MortgageResults Component
 * Displays calculated mortgage results
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, Calculator as CalcIcon } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/calculators/core/decimal-utils';

export function MortgageResults({ results, isValid }) {
  if (!isValid) {
    return (
      <Alert className="border-gold-200 bg-gold-50">
        <AlertCircle className="h-4 w-4 text-gold-600" />
        <AlertDescription className="text-gold-800">
          Please enter valid loan details to see your repayment estimate
        </AlertDescription>
      </Alert>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <CalcIcon className="w-8 h-8 mr-3" />
        <p>Enter loan details to calculate</p>
      </div>
    );
  }

  const {
    loanAmount,
    lvr,
    monthlyRepayment,
    principalPortion,
    interestPortion,
    totalInterest,
    totalRepayments,
    requiresLMI,
    estimatedLMI,
  } = results;

  return (
    <div className="space-y-6">
      {/* Monthly Repayment - Hero */}
      <div className="text-center p-6 bg-ocean-50 rounded-lg border border-ocean-200">
        <p className="text-sm text-ocean-600 font-medium mb-1">Monthly Repayment</p>
        <p className="text-4xl font-bold text-ocean-900">{formatCurrency(monthlyRepayment)}</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-ocean-700">
          <div className="flex items-center">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>Principal: {formatCurrency(principalPortion)}</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Interest: {formatCurrency(interestPortion)}</span>
          </div>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Loan Summary</h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Loan Amount</span>
            <span className="font-semibold">{formatCurrency(loanAmount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Loan-to-Value Ratio (LVR)</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{lvr.toFixed(2)}%</span>
              {lvr > 80 && (
                <Badge variant="destructive" className="text-xs">
                  High LVR
                </Badge>
              )}
              {lvr <= 80 && (
                <Badge variant="outline" className="text-xs border-sage-600 text-sage-600">
                  Good LVR
                </Badge>
              )}
            </div>
          </div>

          {requiresLMI && estimatedLMI && (
            <>
              <Separator />
              <Alert className="border-gold-200 bg-gold-50">
                <AlertCircle className="h-4 w-4 text-gold-600" />
                <AlertDescription className="text-gold-800 text-sm">
                  <div className="space-y-1">
                    <p className="font-semibold">Lenders Mortgage Insurance (LMI) Required</p>
                    <p>Estimated LMI: {formatCurrency(estimatedLMI)}</p>
                    <p className="text-xs">
                      LMI is typically required when your LVR exceeds 80%. This protects the
                      lender if you default on your loan.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Total Cost Over Loan Term */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Total Cost Over Loan Term</h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Interest</span>
            <span className="font-semibold text-terra-600">{formatCurrency(totalInterest)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Repayments</span>
            <span className="font-semibold">{formatCurrency(totalRepayments)}</span>
          </div>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Interest as % of loan</span>
            <span>{((totalInterest / loanAmount) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Tips */}
      <div className="bg-muted rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Ways to Reduce Your Repayments</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Increase your deposit to lower your LVR and avoid LMI</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Make extra repayments to reduce interest over time</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use an offset account to reduce interest charged</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Shop around for better interest rates (even 0.25% makes a difference)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
