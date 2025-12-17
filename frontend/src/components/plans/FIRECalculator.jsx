import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Flame,
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const formatCurrency = (value) => {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const FIRECalculator = ({ open, onOpenChange, dashboardData }) => {
  const [inputs, setInputs] = useState({
    currentAge: 35,
    currentNetWorth: dashboardData?.net_worth || 0,
    annualIncome: (dashboardData?.monthly_income || 0) * 12,
    annualExpenses: (dashboardData?.monthly_expenses || 0) * 12,
    targetRetirementAge: 55,
    expectedReturn: 7,
    inflationRate: 2.5,
    withdrawalRate: 4,
    safeWithdrawalMultiplier: 25, // 1 / 0.04 = 25
  });

  // Update inputs when dashboard data changes
  React.useEffect(() => {
    if (dashboardData) {
      setInputs(prev => ({
        ...prev,
        currentNetWorth: dashboardData.net_worth || 0,
        annualIncome: (dashboardData.monthly_income || 0) * 12,
        annualExpenses: (dashboardData.monthly_expenses || 0) * 12,
      }));
    }
  }, [dashboardData]);

  const updateInput = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculate FIRE metrics
  const calculations = useMemo(() => {
    const {
      currentAge,
      currentNetWorth,
      annualIncome,
      annualExpenses,
      targetRetirementAge,
      expectedReturn,
      inflationRate,
      withdrawalRate,
    } = inputs;

    const annualSavings = annualIncome - annualExpenses;
    const savingsRate = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;
    const realReturn = (expectedReturn - inflationRate) / 100;
    const nominalReturn = expectedReturn / 100;

    // FIRE Number calculation (annual expenses / withdrawal rate)
    const fireNumber = annualExpenses * (100 / withdrawalRate);

    // Years to FIRE calculation using compound growth
    let yearsToFire = null;
    let fireAge = null;
    let netWorth = currentNetWorth;

    if (annualSavings > 0 && fireNumber > 0) {
      for (let year = 0; year <= 100; year++) {
        if (netWorth >= fireNumber) {
          yearsToFire = year;
          fireAge = currentAge + year;
          break;
        }
        netWorth = netWorth * (1 + nominalReturn) + annualSavings;
      }
    }

    // Coast FIRE Number - amount needed now to let it grow to FIRE number
    const yearsToTarget = targetRetirementAge - currentAge;
    const coastFireNumber = yearsToTarget > 0
      ? fireNumber / Math.pow(1 + nominalReturn, yearsToTarget)
      : fireNumber;

    // Lean FIRE (50% of normal expenses)
    const leanFireNumber = fireNumber * 0.5;

    // Fat FIRE (150% of normal expenses)
    const fatFireNumber = fireNumber * 1.5;

    // Generate projection data
    const projectionData = [];
    netWorth = currentNetWorth;

    for (let year = 0; year <= Math.max(yearsToTarget, 30); year++) {
      const age = currentAge + year;
      projectionData.push({
        year,
        age,
        netWorth,
        fireNumber,
        coastFire: coastFireNumber,
      });
      netWorth = netWorth * (1 + nominalReturn) + annualSavings;
    }

    // Monthly breakdown
    const monthlySavings = annualSavings / 12;
    const monthlyExpenses = annualExpenses / 12;
    const monthlyPassiveIncome = currentNetWorth * (withdrawalRate / 100) / 12;

    return {
      fireNumber,
      leanFireNumber,
      fatFireNumber,
      coastFireNumber,
      yearsToFire,
      fireAge,
      annualSavings,
      savingsRate,
      monthlySavings,
      monthlyExpenses,
      monthlyPassiveIncome,
      projectionData,
      progressPercent: fireNumber > 0 ? Math.min(100, (currentNetWorth / fireNumber) * 100) : 0,
    };
  }, [inputs]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="fire-calculator-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            FIRE Calculator
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="inputs" className="flex items-center gap-1">
              <Calculator className="w-4 h-4" /> Inputs
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1">
              <Target className="w-4 h-4" /> Results
            </TabsTrigger>
            <TabsTrigger value="projection" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Projection
            </TabsTrigger>
          </TabsList>

          {/* Inputs Tab */}
          <TabsContent value="inputs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Personal Info</h3>
                
                <div className="space-y-2">
                  <Label>Current Age: {inputs.currentAge}</Label>
                  <Slider
                    value={[inputs.currentAge]}
                    onValueChange={([value]) => updateInput('currentAge', value)}
                    min={18}
                    max={70}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Retirement Age: {inputs.targetRetirementAge}</Label>
                  <Slider
                    value={[inputs.targetRetirementAge]}
                    onValueChange={([value]) => updateInput('targetRetirementAge', value)}
                    min={30}
                    max={75}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentNetWorth">Current Net Worth ($)</Label>
                  <Input
                    id="currentNetWorth"
                    type="number"
                    value={inputs.currentNetWorth}
                    onChange={(e) => updateInput('currentNetWorth', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Income & Expenses</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income ($)</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={inputs.annualIncome}
                    onChange={(e) => updateInput('annualIncome', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualExpenses">Annual Expenses ($)</Label>
                  <Input
                    id="annualExpenses"
                    type="number"
                    value={inputs.annualExpenses}
                    onChange={(e) => updateInput('annualExpenses', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Expected Return: {inputs.expectedReturn}%</Label>
                <Slider
                  value={[inputs.expectedReturn]}
                  onValueChange={([value]) => updateInput('expectedReturn', value)}
                  min={1}
                  max={15}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <Label>Inflation Rate: {inputs.inflationRate}%</Label>
                <Slider
                  value={[inputs.inflationRate]}
                  onValueChange={([value]) => updateInput('inflationRate', value)}
                  min={0}
                  max={10}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <Label>Withdrawal Rate: {inputs.withdrawalRate}%</Label>
                <Slider
                  value={[inputs.withdrawalRate]}
                  onValueChange={([value]) => updateInput('withdrawalRate', value)}
                  min={2}
                  max={8}
                  step={0.5}
                />
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* Main FIRE Number */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-orange-100 mb-2">Your FIRE Number</p>
                  <p className="text-5xl font-bold mb-2">
                    {formatCurrency(calculations.fireNumber)}
                  </p>
                  <p className="text-orange-100">
                    Based on {inputs.withdrawalRate}% withdrawal rate
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FIRE Variations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Lean FIRE</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculations.leanFireNumber)}
                  </p>
                  <p className="text-xs text-gray-400">50% expenses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Coast FIRE</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculations.coastFireNumber)}
                  </p>
                  <p className="text-xs text-gray-400">Stop saving, let grow</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Fat FIRE</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(calculations.fatFireNumber)}
                  </p>
                  <p className="text-xs text-gray-400">150% expenses</p>
                </CardContent>
              </Card>
            </div>

            {/* Time to FIRE */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Years to FIRE</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {calculations.yearsToFire !== null ? calculations.yearsToFire : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-500">FIRE Age</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {calculations.fireAge !== null ? calculations.fireAge : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-500">Savings Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {calculations.savingsRate.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-lime-500" />
                      <span className="text-sm text-gray-500">Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-lime-600">
                      {calculations.progressPercent.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Breakdown */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Savings</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(calculations.monthlySavings)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Expenses</p>
                    <p className="text-xl font-bold text-red-500">
                      {formatCurrency(calculations.monthlyExpenses)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Passive Income (Current)</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(calculations.monthlyPassiveIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projection Tab */}
          <TabsContent value="projection">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Wealth Projection to FIRE</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={calculations.projectionData}>
                    <defs>
                      <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="age" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value), name === 'netWorth' ? 'Net Worth' : name]}
                      labelFormatter={(label) => `Age: ${label}`}
                    />
                    <ReferenceLine 
                      y={calculations.fireNumber} 
                      stroke="#f97316" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{ value: `FIRE: ${formatCurrency(calculations.fireNumber)}`, fill: '#f97316', fontSize: 12 }}
                    />
                    {calculations.yearsToFire && (
                      <ReferenceLine 
                        x={inputs.currentAge + calculations.yearsToFire} 
                        stroke="#22c55e" 
                        strokeDasharray="5 5"
                        label={{ value: 'FIRE!', fill: '#22c55e', fontSize: 12, position: 'top' }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      name="Net Worth"
                      stroke="#84cc16"
                      strokeWidth={3}
                      fill="url(#colorWealth)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FIRECalculator;
