import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const formatCurrency = (value) => {
  if (!value) return '$0';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const PortfolioSnapshotWidget = ({ data }) => {
  const items = [
    { label: 'Total Net Worth', value: data?.net_worth || 0, color: 'text-gray-900 font-semibold' },
    { label: 'Liquid Assets', value: data?.liquid_assets || 0, color: 'text-green-600' },
    { label: 'Property Equity', value: data?.property_equity || 0, color: 'text-blue-600' },
    { label: 'Investment Portfolio', value: data?.investments || 0, color: 'text-purple-600' },
    { label: 'Superannuation', value: data?.super || 0, color: 'text-orange-600' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Portfolio Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className={`text-sm font-semibold ${item.color}`}>
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSnapshotWidget;
