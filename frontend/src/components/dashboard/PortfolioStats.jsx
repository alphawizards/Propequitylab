import React from 'react';

const StatCard = ({ value, label, bgColor, textColor = 'text-gray-900' }) => (
  <div className={`${bgColor} rounded-xl p-5 flex-1 min-w-[140px]`}>
    <div className={`text-3xl font-bold ${textColor} mb-1`}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const PortfolioStats = ({ summary, lastUpdated }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Current Portfolio</h2>
        <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
      </div>
      
      <div className="flex gap-4 flex-wrap">
        <StatCard
          value={summary.properties}
          label="Properties"
          bgColor="bg-blue-100"
        />
        <StatCard
          value={summary.totalValue.toFixed(2)}
          label="Total Value $m"
          bgColor="bg-green-100"
        />
        <StatCard
          value={summary.debt.toFixed(1)}
          label="Debt $m"
          bgColor="bg-gray-100"
        />
        <StatCard
          value={summary.equity.toFixed(2)}
          label="Equity $m"
          bgColor="bg-yellow-100"
        />
        <StatCard
          value={summary.goalReached}
          label="Goal Reached"
          bgColor="bg-red-100"
        />
      </div>
    </div>
  );
};

export default PortfolioStats;
