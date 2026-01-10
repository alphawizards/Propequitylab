import React from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import ScenarioSelector from './ScenarioSelector';
import QuickSettings from './QuickSettings';

const DashboardRightPanel = ({ onScenarioChange, onSettingsChange, onExport }) => {
  return (
    <div className="flex flex-col h-full p-6 space-y-6 bg-white">
      {/* Scenario Selector */}
      <ScenarioSelector onScenarioChange={onScenarioChange} />

      {/* Quick Settings */}
      <QuickSettings onSettingsChange={onSettingsChange} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export Button */}
      <Button
        onClick={onExport}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        Export PDF Report
      </Button>
    </div>
  );
};

export default DashboardRightPanel;
