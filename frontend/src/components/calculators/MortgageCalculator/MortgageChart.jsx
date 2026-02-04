/**
 * MortgageChart Component
 * Visual breakdown of principal vs interest over time using Recharts
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from 'lucide-react';
import { formatCurrency, centsToDollars } from '@/lib/calculators/core/decimal-utils';

export function MortgageChart({ results, schedule }) {
  const [chartType, setChartType] = useState('area'); // 'area', 'bar', 'line'
  const [viewMode, setViewMode] = useState('cumulative'); // 'cumulative' or 'payment'

  // Transform schedule data for charts
  const chartData = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];

    // Group by year for better visualization
    const yearlyData = [];
    for (let i = 0; i < schedule.length; i += 12) {
      const yearEnd = schedule[Math.min(i + 11, schedule.length - 1)];
      const year = Math.floor(i / 12) + 1;

      if (viewMode === 'cumulative') {
        yearlyData.push({
          year,
          principal: centsToDollars(yearEnd.cumulativePrincipal),
          interest: centsToDollars(yearEnd.cumulativeInterest),
          balance: centsToDollars(yearEnd.closingBalance),
        });
      } else {
        // Sum payments for the year
        const yearSlice = schedule.slice(i, i + 12);
        const principalSum = yearSlice.reduce((sum, item) => sum + item.principalPaid, 0);
        const interestSum = yearSlice.reduce((sum, item) => sum + item.interestPaid, 0);

        yearlyData.push({
          year,
          principal: centsToDollars(principalSum),
          interest: centsToDollars(interestSum),
          balance: centsToDollars(yearEnd.closingBalance),
        });
      }
    }

    return yearlyData;
  }, [schedule, viewMode]);

  if (!results || !schedule || schedule.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Enter loan details to see visual breakdown</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 shadow-lg">
          <p className="font-semibold mb-2">Year {label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span style={{ color: entry.color }} className="font-medium">
                  {entry.name}:
                </span>
                <span className="font-mono">
                  ${entry.value.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const xAxisProps = {
      dataKey: 'year',
      label: { value: 'Year', position: 'insideBottom', offset: -5 },
    };

    const yAxisProps = {
      tickFormatter: (value) => `$${(value / 1000).toFixed(0)}K`,
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="principal" name="Principal" fill="#10b981" stackId="a" />
            <Bar dataKey="interest" name="Interest" fill="#ef4444" stackId="a" />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="principal"
              name="Principal"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="interest"
              name="Interest"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
            />
          </LineChart>
        );

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="principal"
              name="Principal"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="interest"
              name="Interest"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={chartType === 'area' ? 'default' : 'outline'}
            onClick={() => setChartType('area')}
          >
            <AreaChartIcon className="w-4 h-4 mr-1" />
            Area
          </Button>
          <Button
            size="sm"
            variant={chartType === 'bar' ? 'default' : 'outline'}
            onClick={() => setChartType('bar')}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Bar
          </Button>
          <Button
            size="sm"
            variant={chartType === 'line' ? 'default' : 'outline'}
            onClick={() => setChartType('line')}
          >
            <LineChartIcon className="w-4 h-4 mr-1" />
            Line
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'cumulative' ? 'default' : 'outline'}
            onClick={() => setViewMode('cumulative')}
          >
            Cumulative
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'payment' ? 'default' : 'outline'}
            onClick={() => setViewMode('payment')}
          >
            Annual Payments
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 mb-1">Total Principal</p>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(results.loanAmount)}
          </p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700 mb-1">Total Interest</p>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(results.totalInterest)}
          </p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Interest/Principal Ratio</p>
          <p className="text-2xl font-bold text-blue-900">
            {((results.totalInterest / results.loanAmount) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
