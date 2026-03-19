import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { formatCurrency } from '../../utils/formatCurrency';


const PortfolioSnapshotWidget = ({ data }) => {
  const items = [
    { label: 'Total Net Worth', value: data?.net_worth || 0, color: 'text-[#111111] font-semibold' },
    { label: 'Liquid Assets', value: data?.liquid_assets || 0, color: 'text-emerald-600' },
    { label: 'Property Equity', value: data?.property_equity || 0, color: 'text-blue-600' },
    { label: 'Investment Portfolio', value: data?.investments || 0, color: 'text-purple-600' },
    { label: 'Superannuation', value: data?.super || 0, color: 'text-orange-600' },
  ];

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Portfolio Snapshot</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">{item.label}</span>
                <span className={`text-sm font-semibold tabular-nums ${item.color}`}>
                  {formatCurrency(item.value)}
                </span>
              </div>
              {idx === 0 && <div className="border-t border-[#EAEAEA] my-1" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSnapshotWidget;
