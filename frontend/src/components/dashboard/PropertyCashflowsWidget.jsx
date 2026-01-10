import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const formatCurrency = (value) => {
  if (!value) return '$0';
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${Math.abs(value).toFixed(0)}`;
};

const PropertyCashflowsWidget = ({ properties = [] }) => {
  const totalCashflow = properties.reduce((sum, p) => sum + (p.cashflow || 0), 0);
  const isSelfServicing = totalCashflow >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Property Cashflows</CardTitle>
          {properties.length > 0 && (
            <Badge className={isSelfServicing ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}>
              {isSelfServicing ? 'Self-Servicing' : 'Negative'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {properties.length > 0 ? (
            <>
              {properties.slice(0, 4).map((property, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate max-w-[60%]">
                    {property.address || property.name || `Property ${idx + 1}`}
                  </span>
                  <span className={`text-sm font-semibold ${
                    property.cashflow >= 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {property.cashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(property.cashflow))}/mo
                  </span>
                </div>
              ))}
              {properties.length > 4 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  +{properties.length - 4} more properties
                </p>
              )}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Monthly</span>
                <span className={`text-lg font-bold ${
                  totalCashflow >= 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {totalCashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalCashflow))}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No properties added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCashflowsWidget;
