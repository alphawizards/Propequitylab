/**
 * MortgageCalculator Component
 * Main container component for mortgage calculator
 */

import React from 'react';
import { useMortgageCalculator } from '@/lib/calculators/hooks/useMortgageCalculator';
import { MortgageInputs } from './MortgageInputs';
import { MortgageResults } from './MortgageResults';
import { AmortizationSchedule } from './AmortizationSchedule';
import { MortgageChart } from './MortgageChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <CardTitle>Loan Details</CardTitle>
            </div>
            <CardDescription>
              Enter your loan information to calculate repayments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MortgageInputs calculator={calculator} />
          </CardContent>
        </Card>

        {/* Right Column: Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <CardTitle>Repayment Summary</CardTitle>
            </div>
            <CardDescription>
              Your estimated mortgage costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MortgageResults results={calculator.results} isValid={calculator.isValid} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      {calculator.isValid && calculator.results && (
        <Card>
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
