import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

const ScenarioSelector = ({ onScenarioChange }) => {
  const [selectedScenario, setSelectedScenario] = useState('baseline');

  const scenarios = [
    {
      id: 'baseline',
      label: 'Baseline Projection',
      description: 'Standard 7% growth with current savings rate'
    },
    {
      id: 'early_retire',
      label: 'Early Retirement',
      description: 'Stop work at age 50, high withdrawal rate'
    },
    {
      id: 'property_growth',
      label: 'Aggressive Property',
      description: 'Add 2 investment properties over next 5 years'
    },
    {
      id: 'conservative',
      label: 'Conservative',
      description: 'Low risk strategy, 4% growth, high savings'
    },
  ];

  const handleChange = (value) => {
    setSelectedScenario(value);
    onScenarioChange?.(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Projection Scenarios</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedScenario} onValueChange={handleChange}>
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`
                  relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer
                  transition-all hover:bg-gray-50
                  ${selectedScenario === scenario.id
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-200'
                  }
                `}
              >
                <RadioGroupItem value={scenario.id} id={scenario.id} className="mt-0.5" />
                <Label htmlFor={scenario.id} className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">{scenario.label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{scenario.description}</div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ScenarioSelector;
