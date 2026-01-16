import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Flame,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

const PLAN_TYPE_INFO = {
  fire: { label: 'FIRE', color: 'bg-orange-100 text-orange-700' },
  lean_fire: { label: 'Lean FIRE', color: 'bg-green-100 text-green-700' },
  fat_fire: { label: 'Fat FIRE', color: 'bg-purple-100 text-purple-700' },
  coast_fire: { label: 'Coast FIRE', color: 'bg-blue-100 text-blue-700' },
  barista_fire: { label: 'Barista FIRE', color: 'bg-yellow-100 text-yellow-700' },
  traditional: { label: 'Traditional', color: 'bg-gray-100 text-gray-700' },
  custom: { label: 'Custom', color: 'bg-lime-100 text-lime-700' },
};

const PlanDetailsModal = ({ open, onOpenChange, plan, dashboardData }) => {
  // Calculate projections
  const projections = useMemo(() => {
    if (!plan || !dashboardData) return null;

    const currentNetWorth = dashboardData.net_worth || 0;
    const monthlySavings = dashboardData.monthly_cashflow || 0;
    const annualSavings = monthlySavings * 12;
    const growthRate = 0.07; // Assume 7% annual growth
    const inflationRate = (plan.inflation_rate || 2.5) / 100;
    const targetNetWorth = plan.target_equity || 0;
    const currentAge = 35; // Default, should come from user profile
    const retirementAge = plan.retirement_age || 55;
    const yearsToRetirement = retirementAge - currentAge;

    // Generate projection data
    const data = [];
    let netWorth = currentNetWorth;
    let fireAchievedYear = null;

    for (let year = 0; year <= yearsToRetirement + 10; year++) {
      const age = currentAge + year;
      const isRetired = age >= retirementAge;

      if (!isRetired) {
        // Growing phase
        netWorth = netWorth * (1 + growthRate) + annualSavings;
      } else {
        // Drawdown phase
        const withdrawal = netWorth * ((plan.target_withdrawal_rate || 4) / 100);
        netWorth = netWorth * (1 + growthRate - inflationRate) - withdrawal;
      }

      if (targetNetWorth > 0 && netWorth >= targetNetWorth && !fireAchievedYear) {
        fireAchievedYear = year;
      }

      data.push({
        year: new Date().getFullYear() + year,
        age,
        netWorth: Math.max(0, netWorth),
        target: targetNetWorth,
        phase: isRetired ? 'Retirement' : 'Accumulation',
      });
    }

    // Calculate years to FIRE
    let yearsToFire = null;
    if (targetNetWorth > 0 && annualSavings > 0) {
      netWorth = currentNetWorth;
      for (let i = 0; i <= 100; i++) {
        if (netWorth >= targetNetWorth) {
          yearsToFire = i;
          break;
        }
        netWorth = netWorth * (1 + growthRate) + annualSavings;
      }
    }

    const fireAge = yearsToFire !== null ? currentAge + yearsToFire : null;
    const progressPercent = targetNetWorth > 0
      ? Math.min(100, (currentNetWorth / targetNetWorth) * 100)
      : 0;

    return {
      data,
      yearsToFire,
      fireAge,
      progressPercent,
      currentNetWorth,
      targetNetWorth,
      annualSavings,
      monthlySavings,
    };
  }, [plan, dashboardData]);

  if (!plan) return null;

  const typeInfo = PLAN_TYPE_INFO[plan.type] || PLAN_TYPE_INFO.custom;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="plan-details-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <span>{plan.name}</span>
              <Badge className={`ml-3 ${typeInfo.color}`}>{typeInfo.label}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          {projections && (
            <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Current Net Worth</p>
                    <p className="text-2xl font-bold text-lime-400">
                      {formatCurrency(projections.currentNetWorth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Target Net Worth</p>
                    <p className="text-2xl font-bold">
                      {projections.targetNetWorth > 0
                        ? formatCurrency(projections.targetNetWorth)
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Years to FIRE</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {projections.yearsToFire !== null
                        ? `${projections.yearsToFire} years (age ${projections.fireAge})`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {projections.targetNetWorth > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress to FIRE</span>
                      <span className="text-white font-medium">
                        {projections.progressPercent.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={projections.progressPercent} className="h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Retirement Age</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{plan.retirement_age}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Withdrawal Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{plan.target_withdrawal_rate || 4}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Monthly Savings</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(projections?.monthlySavings || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Life Expectancy</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{plan.life_expectancy}</p>
              </CardContent>
            </Card>
          </div>

          {/* Projection Chart */}
          {projections && projections.data.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Net Worth Projection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={projections.data}>
                    <defs>
                      <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
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
                      formatter={(value, name) => [formatCurrency(value), name]}
                      labelFormatter={(label) => `Age: ${label}`}
                    />
                    {projections.targetNetWorth > 0 && (
                      <ReferenceLine
                        y={projections.targetNetWorth}
                        stroke="#f97316"
                        strokeDasharray="5 5"
                        label={{ value: 'Target', fill: '#f97316', fontSize: 12 }}
                      />
                    )}
                    <ReferenceLine
                      x={plan.retirement_age}
                      stroke="#8b5cf6"
                      strokeDasharray="5 5"
                      label={{ value: 'Retire', fill: '#8b5cf6', fontSize: 12, position: 'top' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      name="Net Worth"
                      stroke="#84cc16"
                      strokeWidth={2}
                      fill="url(#colorNetWorth)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Plan Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Withdrawal Strategy
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Strategy Type</span>
                    <span className="font-medium capitalize">
                      {plan.withdrawal_strategy?.type || 'Percentage'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-medium">{plan.withdrawal_strategy?.rate || 4}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adjust for Inflation</span>
                    <span>
                      {plan.withdrawal_strategy?.adjust_for_inflation ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Age Pension (Australia)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Include Pension</span>
                    <span>
                      {plan.social_security?.include_age_pension ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </span>
                  </div>
                  {plan.social_security?.include_age_pension && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start Age</span>
                        <span className="font-medium">{plan.social_security.start_age}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Annual Amount</span>
                        <span className="font-medium">
                          {formatCurrency(plan.social_security.estimated_amount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {plan.description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{plan.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanDetailsModal;
