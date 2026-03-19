import React from 'react';
import { cn } from '../../lib/utils';

const KPICard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
  trend,
  trendValue
}) => {
  const accentColors = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-violet-600',
    yellow: 'text-amber-600',
    red: 'text-red-500',
  };

  const bgAccentColors = {
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    purple: 'bg-violet-50',
    yellow: 'bg-amber-50',
    red: 'bg-red-50',
  };

  return (
    <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-card p-6 hover:shadow-card-hover transition-all duration-150 hover:-translate-y-px">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">{title}</p>
          <p className="text-2xl font-semibold tabular-nums text-[#111111]">{value}</p>
          {subtext && (
            <p className="text-xs text-[#6B7280] mt-1">{subtext}</p>
          )}
          {trend && trendValue && (
            <div className={cn(
              "flex items-center gap-1 mt-3 text-xs font-medium",
              trend === 'up' ? 'text-emerald-600' : 'text-red-500'
            )}>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bgAccentColors[variant])}>
            <Icon className={cn("w-5 h-5", accentColors[variant])} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
