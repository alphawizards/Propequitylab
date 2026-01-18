import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

const QuickSettings = ({ onSettingsChange }) => {
  const [inflation, setInflation] = useState(2.5);
  const [propertyGrowth, setPropertyGrowth] = useState(4.2);

  const handleInflationChange = (value) => {
    setInflation(value[0]);
    onSettingsChange?.({ inflation: value[0], propertyGrowth });
  };

  const handlePropertyGrowthChange = (value) => {
    setPropertyGrowth(value[0]);
    onSettingsChange?.({ inflation, propertyGrowth: value[0] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Inflation Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="inflation" className="text-sm font-medium text-gray-700">
                Annual Inflation
              </Label>
              <span className="text-sm font-semibold text-gray-900">{inflation.toFixed(1)}%</span>
            </div>
            <Slider
              id="inflation"
              min={0}
              max={10}
              step={0.1}
              value={[inflation]}
              onValueChange={handleInflationChange}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0%</span>
              <span className="text-xs text-gray-500">10%</span>
            </div>
          </div>

          {/* Property Growth Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="property-growth" className="text-sm font-medium text-gray-700">
                Property Growth Rate
              </Label>
              <span className="text-sm font-semibold text-gray-900">{propertyGrowth.toFixed(1)}%</span>
            </div>
            <Slider
              id="property-growth"
              min={0}
              max={15}
              step={0.1}
              value={[propertyGrowth]}
              onValueChange={handlePropertyGrowthChange}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0%</span>
              <span className="text-xs text-gray-500">15%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickSettings;
