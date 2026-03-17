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
  };

  const bgAccentColors = {
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    purple: 'bg-violet-50',
    yellow: 'bg-amber-50',
  };

  return (
    <div className="rounded-[1rem] border border-slate-200/50 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 font-mono tracking-tight">{value}</p>
          {subtext && (
            <p className="text-xs text-zinc-400 mt-1">{subtext}</p>
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
          <div className={cn("w-10 h-10 rounded-[0.75rem] flex items-center justify-center", bgAccentColors[variant])}>
            <Icon className={cn("w-5 h-5", accentColors[variant])} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
