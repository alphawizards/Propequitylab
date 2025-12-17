import React from 'react';
import { BarChart3, LineChart, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ProjectionControls = ({
  viewType,
  onViewTypeChange,
  timeRange,
  onTimeRangeChange,
  selectedProperty,
  onPropertyChange,
  properties,
  chartType,
  onChartTypeChange
}) => {
  const timeRanges = [10, 20, 30, 50];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* View Type Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-gray-200 p-1">
            <button
              onClick={() => onViewTypeChange('equity')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                viewType === 'equity'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Equity
            </button>
            <button
              onClick={() => onViewTypeChange('cashflow')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                viewType === 'cashflow'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Cashflow
            </button>
          </div>
          
          {/* Time Range Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                  timeRange === range
                    ? 'bg-lime-400 border-lime-400 text-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {range} Years
              </button>
            ))}
          </div>
        </div>
        
        {/* Property Filter & Chart Toggle */}
        <div className="flex items-center gap-3">
          <Select value={selectedProperty} onValueChange={onPropertyChange}>
            <SelectTrigger className="w-[180px] rounded-lg">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((prop) => (
                <SelectItem key={prop.id} value={prop.id}>
                  {prop.suburb}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => onChartTypeChange('line')}
              className={`p-2 rounded transition-colors ${
                chartType === 'line' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChartTypeChange('bar')}
              className={`p-2 rounded transition-colors ${
                chartType === 'bar' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="bg-lime-100 rounded-xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-lime-400 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-800">
            VIEW DETAILED PROJECTIONS: Choose a future year to update the projections and insights below.
          </span>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProjectionControls;
