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
    if (lvr > 80) return { text: 'High risk', color: 'text-red-600' };
    if (lvr > 60) return { text: 'Moderate', color: 'text-yellow-600' };
    return { text: 'Low risk', color: 'text-green-600' };
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
              <span className="text-sm text-gray-600">Loan-to-Value Ratio</span>
              <span className="text-sm font-semibold text-gray-900">{lvr.toFixed(1)}%</span>
            </div>
            <Progress
              value={Math.min(lvr, 100)}
              className="h-2"
              indicatorClassName={lvr > 80 ? "bg-red-500" : lvr > 60 ? "bg-yellow-500" : "bg-green-500"}
            />
            <p className={`text-xs mt-1 ${riskLevel.color}`}>
              {riskLevel.text}
            </p>
          </div>

          {/* Capacity Section */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Capacity Used</span>
              <span className="text-sm font-semibold text-gray-900">{capacityPercent.toFixed(0)}%</span>
            </div>
            <Progress
              value={Math.min(capacityPercent, 100)}
              className="h-2"
              indicatorClassName="bg-blue-500"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">
                Used: ${(usedCapacity / 1000).toFixed(0)}K
              </span>
              <span className="text-xs text-gray-500">
                Total: ${(borrowingCapacity / 1000).toFixed(0)}K
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BorrowingWidget;
