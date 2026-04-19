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
import { getChartColors } from '@/lib/chartColors';

export function MortgageChart({ results, schedule }) {
  const [chartType, setChartType] = useState('area');
  const [viewMode, setViewMode] = useState('cumulative');
  const C = getChartColors();

  const chartData = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];

    const yearlyData = [];
    for (let i = 0; i < schedule.length; i += 12) {
      const yearEnd = schedule[Math.min(i + 11, schedule.length - 1)];
      const year = Math.floor(i / 12) + 1;

      if (viewMode === 'cumulative') {
        yearlyData.push({
          year,
          principal: centsToDollars(yearEnd.cumulativePrincipal),
          interest:  centsToDollars(yearEnd.cumulativeInterest),
          balance:   centsToDollars(yearEnd.closingBalance),
        });
      } else {
        const yearSlice = schedule.slice(i, i + 12);
        yearlyData.push({
          year,
          principal: centsToDollars(yearSlice.reduce((s, x) => s + x.principalPaid, 0)),
          interest:  centsToDollars(yearSlice.reduce((s, x) => s + x.interestPaid, 0)),
          balance:   centsToDollars(yearEnd.closingBalance),
        });
      }
    }
    return yearlyData;
  }, [schedule, viewMode]);

  if (!results || !schedule || schedule.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Enter loan details to see visual breakdown</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <Card className="p-3 shadow-lg">
        <p className="font-semibold mb-2">Year {label}</p>
        <div className="space-y-1 text-sm">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
              <span className="font-mono">
                ${entry.value.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const commonProps = {
    data: chartData,
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
  };
  const xAxisProps = {
    dataKey: 'year',
    label: { value: 'Year', position: 'insideBottom', offset: -5 },
    stroke: C.ink3,
    tick: { fill: C.ink3 },
  };
  const yAxisProps = {
    tickFormatter: (v) => `$${(v / 1000).toFixed(0)}K`,
    stroke: C.ink3,
    tick: { fill: C.ink3 },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="principal" name="Principal" fill={C.sage}  stackId="a" />
            <Bar dataKey="interest"  name="Interest"  fill={C.terra} stackId="a" />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="principal" name="Principal" stroke={C.sage}  strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="interest"  name="Interest"  stroke={C.terra} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="balance"   name="Balance"   stroke={C.ocean} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        );

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="principal" name="Principal" stackId="1" stroke={C.sage}  fill={C.sage}  fillOpacity={0.6} />
            <Area type="monotone" dataKey="interest"  name="Interest"  stackId="1" stroke={C.terra} fill={C.terra} fillOpacity={0.6} />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={chartType === 'area' ? 'default' : 'outline'} onClick={() => setChartType('area')}>
            <AreaChartIcon className="w-4 h-4 mr-1" /> Area
          </Button>
          <Button size="sm" variant={chartType === 'bar'  ? 'default' : 'outline'} onClick={() => setChartType('bar')}>
            <BarChart3 className="w-4 h-4 mr-1" /> Bar
          </Button>
          <Button size="sm" variant={chartType === 'line' ? 'default' : 'outline'} onClick={() => setChartType('line')}>
            <LineChartIcon className="w-4 h-4 mr-1" /> Line
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={viewMode === 'cumulative' ? 'default' : 'outline'} onClick={() => setViewMode('cumulative')}>
            Cumulative
          </Button>
          <Button size="sm" variant={viewMode === 'payment' ? 'default' : 'outline'} onClick={() => setViewMode('payment')}>
            Annual Payments
          </Button>
        </div>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center p-4 bg-sage-soft rounded-lg">
          <p className="text-sm text-sage mb-1">Total Principal</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(results.loanAmount)}</p>
        </div>
        <div className="text-center p-4 bg-terra-soft rounded-lg">
          <p className="text-sm text-terra mb-1">Total Interest</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(results.totalInterest)}</p>
        </div>
        <div className="text-center p-4 bg-ocean-soft rounded-lg">
          <p className="text-sm text-ocean mb-1">Interest/Principal Ratio</p>
          <p className="text-2xl font-bold text-foreground">
            {((results.totalInterest / results.loanAmount) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
