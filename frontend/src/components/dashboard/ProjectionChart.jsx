import React, { useMemo } from 'react';

const ProjectionChart = ({ data, viewType, chartType }) => {
  const maxValue = useMemo(() => {
    if (viewType === 'equity') {
      return Math.max(...data.map(d => d.totalValue)) * 1.1;
    }
    return Math.max(...data.map(d => Math.abs(d.cashflow || 0))) * 1.2;
  }, [data, viewType]);

  const minValue = useMemo(() => {
    if (viewType === 'cashflow') {
      return Math.min(...data.map(d => d.cashflow || 0)) * 1.1;
    }
    return 0;
  }, [data, viewType]);

  const getYAxisLabels = () => {
    const labels = [];
    const range = maxValue - minValue;
    for (let i = 4; i >= 0; i--) {
      const value = minValue + (range * i) / 4;
      if (viewType === 'equity') {
        labels.push(`$${value.toFixed(0)}M`);
      } else {
        labels.push(`$${(value / 1000).toFixed(0)}K`);
      }
    }
    return labels;
  };

  const getPathData = (values, color) => {
    const width = 900;
    const height = 280;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding;
    
    const points = values.map((value, index) => {
      const x = padding + (index / (values.length - 1)) * graphWidth;
      const y = height - padding - ((value - minValue) / (maxValue - minValue)) * graphHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const equityValues = data.map(d => d.equity);
  const debtValues = data.map(d => d.debt);
  const totalValues = data.map(d => d.totalValue);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="relative">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500">
          {getYAxisLabels().map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        
        {/* Chart Area */}
        <div className="ml-14">
          <svg viewBox="0 0 900 320" className="w-full h-64">
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="40"
                y1={40 + i * 56}
                x2="860"
                y2={40 + i * 56}
                stroke="#f0f0f0"
                strokeDasharray="4,4"
              />
            ))}
            
            {viewType === 'equity' ? (
              <>
                {/* Area fill for equity */}
                <defs>
                  <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#BFFF00" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#BFFF00" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="debtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                {/* Total Value Line (dashed) */}
                <path
                  d={getPathData(totalValues)}
                  fill="none"
                  stroke="#BFFF00"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
                
                {/* Equity Line */}
                <path
                  d={getPathData(equityValues)}
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="3"
                />
                
                {/* Debt Line */}
                <path
                  d={getPathData(debtValues)}
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              </>
            ) : (
              <>
                {/* Cashflow bars or line */}
                <path
                  d={getPathData(data.map(d => d.cashflow || 0))}
                  fill="none"
                  stroke="#BFFF00"
                  strokeWidth="3"
                />
              </>
            )}
          </svg>
          
          {/* X-Axis Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-10">
            {data.filter((_, i) => i % Math.ceil(data.length / 8) === 0).map((d, i) => (
              <span key={i}>{d.fiscalYear}</span>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 ml-14">
          {viewType === 'equity' ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span className="text-xs text-gray-600">Equity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-400 border-dashed"></div>
                <span className="text-xs text-gray-600">Debt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-lime-400 border-dashed"></div>
                <span className="text-xs text-gray-600">Total Value</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-lime-400"></div>
              <span className="text-xs text-gray-600">Annual Cashflow</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectionChart;
