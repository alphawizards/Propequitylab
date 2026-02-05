import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

const KPICard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'blue', // blue, green, purple, yellow
  trend,
  trendValue
}) => {
  const bgColors = {
    blue: 'bg-pastel-blue',
    green: 'bg-pastel-green',
    purple: 'bg-pastel-purple',
    yellow: 'bg-pastel-yellow',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className={cn("p-6", bgColors[variant])}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
            {trend && trendValue && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                trend === 'up' ? 'text-green-600' : 'text-red-500'
              )}>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm", iconColors[variant])}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
