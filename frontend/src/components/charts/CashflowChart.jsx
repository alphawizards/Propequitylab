import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const formatCurrency = (value) => {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const CashflowChart = ({ income = 0, expenses = 0, loading = false }) => {
  // Create monthly data for the chart (simplified view)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  // Generate last 6 months of data (simulated for now)
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    return {
      month: months[monthIndex],
      income: income * (0.95 + Math.random() * 0.1), // Small variation
      expenses: expenses * (0.9 + Math.random() * 0.2),
    };
  });

  // Use actual current month data
  if (chartData.length > 0) {
    chartData[chartData.length - 1] = {
      month: months[currentMonth],
      income: income,
      expenses: expenses,
    };
  }

  if (loading) {
    return (
      <Card data-testid="cashflow-chart-loading">
        <CardHeader>
          <CardTitle>Monthly Cashflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const cashflow = income - expenses;

  return (
    <Card data-testid="cashflow-chart">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monthly Cashflow</CardTitle>
        <div className={`text-lg font-bold ${cashflow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {cashflow >= 0 ? '+' : ''}{formatCurrency(cashflow)}/mo
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Bar 
              dataKey="income" 
              name="Income" 
              fill="#22c55e" 
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
            <Bar 
              dataKey="expenses" 
              name="Expenses" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CashflowChart;
