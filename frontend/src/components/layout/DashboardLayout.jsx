import React from 'react';
import MainLayout from './MainLayout';
import DashboardRightPanel from '../dashboard/DashboardRightPanel';

/**
 * Dashboard-specific layout wrapper that includes the right panel
 * with Projection Scenarios and Quick Settings
 */
const DashboardLayout = () => {
    const handleScenarioChange = (scenario) => {
        console.log('Scenario changed:', scenario);
        // TODO: Implement scenario switching logic
    };

    const handleSettingsChange = (settings) => {
        console.log('Settings changed:', settings);
        // TODO: Implement settings update logic
    };

    const handleExport = () => {
        console.log('Export PDF clicked');
        // TODO: Implement PDF export
        alert('PDF export coming soon!');
    };

    return (
        <MainLayout
            rightPanel={
                <DashboardRightPanel
                    onScenarioChange={handleScenarioChange}
                    onSettingsChange={handleSettingsChange}
                    onExport={handleExport}
                />
            }
        />
    );
};

export default DashboardLayout;
