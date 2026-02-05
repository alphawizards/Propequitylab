import React from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import ScenarioSelector from './ScenarioSelector';
import QuickSettings from './QuickSettings';

const DashboardRightPanel = ({ onScenarioChange, onSettingsChange, onExport }) => {
  return (
    <div className="flex flex-col h-full p-6 space-y-6 bg-background border-l border-border">
      {/* Scenario Selector */}
      <ScenarioSelector onScenarioChange={onScenarioChange} />

      {/* Quick Settings */}
      <QuickSettings onSettingsChange={onSettingsChange} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export Button */}
      <Button
        onClick={onExport}
        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900"
      >
        <Download className="w-4 h-4 mr-2" />
        Export PDF Report
      </Button>
    </div>
  );
};

export default DashboardRightPanel;
