import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '../../utils/formatCurrency';
import { getChartColors } from '../../lib/chartColors';

const ASSET_COLOR_KEYS = {
  properties: 'ocean',
  super:      'plum',
  shares:     'sage',
  etf:        'sageSoft',
  crypto:     'gold',
  cash:       'goldSoft',
  bonds:      'ocean',
  other:      'ink3',
};

const LABELS = {
  properties: 'Properties',
  super:      'Superannuation',
  shares:     'Shares',
  etf:        'ETFs',
  crypto:     'Crypto',
  cash:       'Cash',
  bonds:      'Bonds',
  other:      'Other',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-card text-card-foreground p-3 rounded-lg shadow-lg border border-border">
      <p className="font-semibold text-foreground">{data.name}</p>
      <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
      <p className="text-sm text-muted-foreground">{(data.percentage || 0).toFixed(1)}%</p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AssetAllocationChart = ({ breakdown = {}, loading = false }) => {
  const C = getChartColors();
  const total = Object.values(breakdown).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const chartData = Object.entries(breakdown)
    .filter(([_, value]) => Number(value) > 0)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value: Number(value),
      color: C[ASSET_COLOR_KEYS[key]] || C.ink3,
      percentage: total > 0 ? (Number(value) / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  if (loading) {
    return (
      <Card data-testid="asset-allocation-loading">
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length || total === 0) {
    return (
      <Card data-testid="asset-allocation-empty">
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <p>No assets to display. Add assets to see your allocation.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="asset-allocation-chart">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              innerRadius={60}
              fill={C.plum}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ color: C.ink }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AssetAllocationChart;
