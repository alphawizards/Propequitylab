import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { formatCurrency } from '../../utils/formatCurrency';


const PortfolioSnapshotWidget = ({ data }) => {
  const items = [
    { label: 'Total Net Worth', value: data?.net_worth || 0, color: 'text-foreground font-semibold' },
    { label: 'Liquid Assets', value: data?.liquid_assets || 0, color: 'text-sage' },
    { label: 'Property Equity', value: data?.property_equity || 0, color: 'text-ocean' },
    { label: 'Investment Portfolio', value: data?.investments || 0, color: 'text-plum' },
    { label: 'Superannuation', value: data?.super || 0, color: 'text-gold' },
  ];

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Portfolio Snapshot</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-semibold tabular-nums ${item.color}`}>
                  {formatCurrency(item.value)}
                </span>
              </div>
              {idx === 0 && <div className="border-t border-border my-1" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSnapshotWidget;
