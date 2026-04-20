import React from 'react';

const StatCard = ({ value, label, bgColor, textColor = 'text-foreground' }) => (
  <div className={`${bgColor} rounded-xl p-5 flex-1 min-w-[140px]`}>
    <div className={`text-3xl font-bold ${textColor} mb-1`}>{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const PortfolioStats = ({ summary, lastUpdated }) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Current Portfolio</h2>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <StatCard
          value={summary.properties}
          label="Properties"
          bgColor="bg-ocean/10"
        />
        <StatCard
          value={summary.totalValue.toFixed(2)}
          label="Total Value $m"
          bgColor="bg-sage/10"
        />
        <StatCard
          value={summary.debt.toFixed(1)}
          label="Debt $m"
          bgColor="bg-muted"
        />
        <StatCard
          value={summary.equity.toFixed(2)}
          label="Equity $m"
          bgColor="bg-gold/10"
        />
        <StatCard
          value={summary.goalReached}
          label="Goal Reached"
          bgColor="bg-terra/10"
        />
      </div>
    </div>
  );
};

export default PortfolioStats;
