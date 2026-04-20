import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

const BorrowingWidget = ({ data }) => {
  const lvr = data?.lvr || 0;
  const borrowingCapacity = data?.borrowing_capacity || 0;
  const usedCapacity = data?.used_capacity || 0;
  const capacityPercent = borrowingCapacity > 0 ? (usedCapacity / borrowingCapacity) * 100 : 0;

  // Determine LVR risk level
  const getLVRRiskLevel = (lvr) => {
    if (lvr > 80) return { text: 'High risk', color: 'text-terra' };
    if (lvr > 60) return { text: 'Moderate', color: 'text-gold' };
    return { text: 'Low risk', color: 'text-sage' };
  };

  const riskLevel = getLVRRiskLevel(lvr);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Borrowing & Leverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* LVR Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Loan-to-Value Ratio</span>
              <span className="text-sm font-semibold text-foreground">{lvr.toFixed(1)}%</span>
            </div>
            <Progress
              value={Math.min(lvr, 100)}
              className="h-2"
              indicatorClassName={lvr > 80 ? "bg-terra" : lvr > 60 ? "bg-gold" : "bg-sage"}
            />
            <p className={`text-xs mt-1 ${riskLevel.color}`}>
              {riskLevel.text}
            </p>
          </div>

          {/* Capacity Section */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Borrowing Capacity</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Add properties and income to calculate your available borrowing capacity.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BorrowingWidget;
