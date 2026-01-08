/**
 * MortgageInputs Component
 * Input form for mortgage calculator
 */

import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, DollarSign, Percent, Calendar } from 'lucide-react';
import {
  centsToDollars,
  dollarsToCents,
  formatCurrency,
  formatPercentage,
  parseCurrencyInput,
  parsePercentageInput,
  basisPointsToRate,
  rateToBasisPoints,
} from '@/lib/calculators/core/decimal-utils';

export function MortgageInputs({ calculator }) {
  const { inputs, updateInput, resetCalculator, errors } = calculator;

  // Local state for formatted display values
  const [purchasePriceDisplay, setPurchasePriceDisplay] = useState(
    centsToDollars(inputs.purchasePrice).toString()
  );
  const [depositDisplay, setDepositDisplay] = useState(
    centsToDollars(inputs.deposit).toString()
  );
  const [interestRateDisplay, setInterestRateDisplay] = useState(
    (basisPointsToRate(inputs.interestRate).toNumber() * 100).toFixed(2)
  );
  const [offsetDisplay, setOffsetDisplay] = useState(
    centsToDollars(inputs.offsetAccountBalance || 0).toString()
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle purchase price input
  const handlePurchasePriceChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPurchasePriceDisplay(value);
  }, []);

  const handlePurchasePriceBlur = useCallback(() => {
    const parsed = parseCurrencyInput(purchasePriceDisplay);
    if (parsed !== null) {
      updateInput('purchasePrice', parsed);
      setPurchasePriceDisplay(centsToDollars(parsed).toString());
    }
  }, [purchasePriceDisplay, updateInput]);

  // Handle deposit input
  const handleDepositChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setDepositDisplay(value);
  }, []);

  const handleDepositBlur = useCallback(() => {
    const parsed = parseCurrencyInput(depositDisplay);
    if (parsed !== null) {
      updateInput('deposit', parsed);
      setDepositDisplay(centsToDollars(parsed).toString());
    }
  }, [depositDisplay, updateInput]);

  // Handle interest rate input
  const handleInterestRateChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInterestRateDisplay(value);
  }, []);

  const handleInterestRateBlur = useCallback(() => {
    const parsed = parseFloat(interestRateDisplay);
    if (!isNaN(parsed)) {
      const basisPoints = rateToBasisPoints(parsed / 100);
      updateInput('interestRate', basisPoints);
      setInterestRateDisplay((basisPointsToRate(basisPoints).toNumber() * 100).toFixed(2));
    }
  }, [interestRateDisplay, updateInput]);

  // Handle offset account input
  const handleOffsetChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setOffsetDisplay(value);
  }, []);

  const handleOffsetBlur = useCallback(() => {
    const parsed = parseCurrencyInput(offsetDisplay);
    if (parsed !== null) {
      updateInput('offsetAccountBalance', parsed);
      setOffsetDisplay(centsToDollars(parsed).toString());
    }
  }, [offsetDisplay, updateInput]);

  // Calculate LVR for display
  const loanAmount = inputs.purchasePrice - inputs.deposit;
  const lvr = inputs.purchasePrice > 0 ? (loanAmount / inputs.purchasePrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Purchase Price */}
      <div className="space-y-2">
        <Label htmlFor="purchasePrice">Purchase Price</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            id="purchasePrice"
            type="text"
            value={purchasePriceDisplay}
            onChange={handlePurchasePriceChange}
            onBlur={handlePurchasePriceBlur}
            className="pl-9"
            placeholder="650,000"
          />
        </div>
        {errors.purchasePrice && (
          <p className="text-sm text-red-600">{errors.purchasePrice}</p>
        )}
      </div>

      {/* Deposit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="deposit">Deposit</Label>
          <span className="text-sm text-gray-600">
            {lvr.toFixed(1)}% LVR
          </span>
        </div>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            id="deposit"
            type="text"
            value={depositDisplay}
            onChange={handleDepositChange}
            onBlur={handleDepositBlur}
            className="pl-9"
            placeholder="130,000"
          />
        </div>
        {errors.deposit && (
          <p className="text-sm text-red-600">{errors.deposit}</p>
        )}

        {/* Deposit Slider */}
        <div className="pt-2">
          <Slider
            value={[inputs.deposit]}
            onValueChange={(value) => {
              updateInput('deposit', value[0]);
              setDepositDisplay(centsToDollars(value[0]).toString());
            }}
            max={inputs.purchasePrice}
            min={0}
            step={dollarsToCents(5000)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>{formatCurrency(inputs.purchasePrice)}</span>
          </div>
        </div>
      </div>

      {/* Interest Rate */}
      <div className="space-y-2">
        <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
        <div className="relative">
          <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            id="interestRate"
            type="text"
            value={interestRateDisplay}
            onChange={handleInterestRateChange}
            onBlur={handleInterestRateBlur}
            className="pl-9"
            placeholder="6.25"
          />
        </div>
        {errors.interestRate && (
          <p className="text-sm text-red-600">{errors.interestRate}</p>
        )}
      </div>

      {/* Loan Term */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="loanTerm">Loan Term</Label>
          <span className="text-sm font-medium">{inputs.loanTermYears} years</span>
        </div>
        <Slider
          value={[inputs.loanTermYears]}
          onValueChange={(value) => updateInput('loanTermYears', value[0])}
          max={40}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1 year</span>
          <span>40 years</span>
        </div>
        {errors.loanTermYears && (
          <p className="text-sm text-red-600">{errors.loanTermYears}</p>
        )}
      </div>

      {/* Repayment Type */}
      <div className="space-y-3">
        <Label>Repayment Type</Label>
        <RadioGroup
          value={inputs.repaymentType}
          onValueChange={(value) => updateInput('repaymentType', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="principal-interest" id="pi" />
            <Label htmlFor="pi" className="font-normal">
              Principal & Interest
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="interest-only" id="io" />
            <Label htmlFor="io" className="font-normal">
              Interest Only
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Advanced Options Toggle */}
      <div className="flex items-center space-x-2 pt-2 border-t">
        <Switch
          checked={showAdvanced}
          onCheckedChange={setShowAdvanced}
          id="advanced"
        />
        <Label htmlFor="advanced" className="font-normal cursor-pointer">
          Show Advanced Options
        </Label>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-6 pt-2">
          {/* Interest Only Period */}
          {inputs.repaymentType === 'interest-only' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ioPeriod">Interest Only Period</Label>
                <span className="text-sm font-medium">
                  {inputs.interestOnlyPeriodYears || 0} years
                </span>
              </div>
              <Slider
                value={[inputs.interestOnlyPeriodYears || 0]}
                onValueChange={(value) => updateInput('interestOnlyPeriodYears', value[0])}
                max={inputs.loanTermYears}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 years</span>
                <span>{inputs.loanTermYears} years</span>
              </div>
              {errors.interestOnlyPeriodYears && (
                <p className="text-sm text-red-600">{errors.interestOnlyPeriodYears}</p>
              )}
            </div>
          )}

          {/* Offset Account */}
          <div className="space-y-2">
            <Label htmlFor="offset">Offset Account Balance</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="offset"
                type="text"
                value={offsetDisplay}
                onChange={handleOffsetChange}
                onBlur={handleOffsetBlur}
                className="pl-9"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500">
              Offset accounts reduce the interest charged on your loan
            </p>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={resetCalculator}
        className="w-full"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset Calculator
      </Button>
    </div>
  );
}
