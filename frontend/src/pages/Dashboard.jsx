import React, { useState, useMemo, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import PortfolioHeader from '../components/dashboard/PortfolioHeader';
import PortfolioStats from '../components/dashboard/PortfolioStats';
import ProjectionControls from '../components/dashboard/ProjectionControls';
import ProjectionChart from '../components/dashboard/ProjectionChart';
import ForecastTable from '../components/dashboard/ForecastTable';
import AddPropertyModal from '../components/modals/AddPropertyModal';
import MembersModal from '../components/modals/MembersModal';
import {
  mockPortfolio,
  mockProperties,
  generateForecastData,
  generateCashflowData,
  portfolioMembers
} from '../data/mockData';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('portfolios');
  const [viewType, setViewType] = useState('equity');
  const [timeRange, setTimeRange] = useState(30);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [chartType, setChartType] = useState('line');
  const [selectedYear, setSelectedYear] = useState(null);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [properties, setProperties] = useState(mockProperties);
  const [portfolio, setPortfolio] = useState(mockPortfolio);

  // Calculate portfolio summary based on properties
  const portfolioSummary = useMemo(() => {
    const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || 0), 0) / 1000000;
    const totalDebt = properties.reduce((sum, p) => sum + (p.loanAmount || 0), 0) / 1000000;
    const equity = totalValue - totalDebt;

    // Calculate goal year (when equity exceeds certain threshold)
    const targetEquity = 10; // $10m target
    const avgGrowth = 0.052;
    const yearsToGoal = equity > 0 ? Math.ceil(Math.log(targetEquity / equity) / Math.log(1 + avgGrowth)) : 40;
    const goalYear = new Date().getFullYear() + yearsToGoal;

    return {
      properties: properties.length,
      totalValue: totalValue,
      debt: totalDebt,
      equity: equity,
      goalReached: `FY${goalYear}`
    };
  }, [properties]);

  // Generate forecast data based on time range
  const forecastData = useMemo(() => {
    if (viewType === 'equity') {
      return generateForecastData(timeRange);
    }
    return generateCashflowData(timeRange);
  }, [timeRange, viewType]);

  const handleAddProperty = useCallback((newProperty) => {
    setProperties(prev => [...prev, newProperty]);
  }, []);

  const handleYearSelect = useCallback((year) => {
    setSelectedYear(prev => prev === year ? null : year);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <PortfolioHeader
          portfolio={{ ...portfolio, ...portfolioSummary }}
          onAddProperty={() => setIsAddPropertyOpen(true)}
          onViewMembers={() => setIsMembersOpen(true)}
        />

        <PortfolioStats
          summary={portfolioSummary}
          lastUpdated={portfolio.lastUpdated}
        />

        <ProjectionControls
          viewType={viewType}
          onViewTypeChange={setViewType}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          selectedProperty={selectedProperty}
          onPropertyChange={setSelectedProperty}
          properties={properties}
          chartType={chartType}
          onChartTypeChange={setChartType}
        />

        <ProjectionChart
          data={forecastData}
          viewType={viewType}
          chartType={chartType}
        />

        <ForecastTable
          data={forecastData}
          viewType={viewType}
          onYearSelect={handleYearSelect}
          selectedYear={selectedYear}
        />
      </main>

      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        onAdd={handleAddProperty}
      />

      <MembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        members={portfolioMembers}
      />

      {/* Get Started Button */}
      <button className="fixed bottom-6 right-6 bg-lime-400 text-gray-900 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-lime-500 transition-all hover:shadow-xl">
        Get Started
      </button>
    </div>
  );
};

export default Dashboard;
