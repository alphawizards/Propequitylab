import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { NetWorthChart, AssetAllocationChart, CashflowChart } from '../components/charts';
import {
  Home,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  PiggyBank,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Camera,
} from 'lucide-react';

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-500'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DashboardNew = () => {
  const navigate = useNavigate();
  const { currentPortfolio, createPortfolio, summary } = usePortfolio();
  const { user, onboardingStatus } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getDashboardSummary(currentPortfolio?.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetWorthHistory = async () => {
    try {
      const history = await api.getNetWorthHistory(currentPortfolio?.id, 12);
      setNetWorthHistory(history);
    } catch (error) {
      console.error('Failed to fetch net worth history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!currentPortfolio?.id) return;
    setSnapshotLoading(true);
    try {
      await api.createSnapshot(currentPortfolio.id);
      await fetchNetWorthHistory();
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    } finally {
      setSnapshotLoading(false);
    }
  };

  useEffect(() => {
    if (currentPortfolio?.id) {
      fetchDashboardData();
      fetchNetWorthHistory();
    } else {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, [currentPortfolio?.id]);

  // Show create portfolio prompt if no portfolio exists
  if (!currentPortfolio && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-lime-100 flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-lime-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Zapiio</h2>
          <p className="text-gray-600 mb-6">
            Get started by creating your first portfolio to track your property investments and financial goals.
          </p>
          <Button
            onClick={() => createPortfolio('My Portfolio', 'actual')}
            className="bg-lime-400 text-gray-900 hover:bg-lime-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
      </div>
    );
  }

  const data = dashboardData || {
    net_worth: 0,
    total_assets: 0,
    total_liabilities: 0,
    monthly_income: 0,
    monthly_expenses: 0,
    monthly_cashflow: 0,
    savings_rate: 0,
    properties_count: 0,
    asset_breakdown: {},
    liability_breakdown: {},
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-gray-300 mt-1">Here's your financial snapshot</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Net Worth</p>
              <p className="text-3xl font-bold text-lime-400">{formatCurrency(data.net_worth)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={formatCurrency(data.total_assets)}
          icon={PiggyBank}
          color="bg-green-100 text-green-600"
          trend="up"
          trendValue="+5.2% this month"
        />
        <StatCard
          title="Total Liabilities"
          value={formatCurrency(data.total_liabilities)}
          icon={CreditCard}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          title="Monthly Cashflow"
          value={formatCurrency(data.monthly_cashflow)}
          icon={DollarSign}
          color={data.monthly_cashflow >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
        />
        <StatCard
          title="Properties"
          value={data.properties_count.toString()}
          icon={Home}
          color="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Asset & Liability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Assets Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Properties', value: data.asset_breakdown?.properties || 0, color: 'bg-blue-500' },
                { label: 'Superannuation', value: data.asset_breakdown?.super || 0, color: 'bg-purple-500' },
                { label: 'Shares/ETFs', value: (data.asset_breakdown?.shares || 0) + (data.asset_breakdown?.etf || 0), color: 'bg-green-500' },
                { label: 'Cash', value: data.asset_breakdown?.cash || 0, color: 'bg-yellow-500' },
                { label: 'Other', value: data.asset_breakdown?.other || 0, color: 'bg-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Liabilities Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Liabilities Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Property Loans', value: data.liability_breakdown?.property_loans || 0, color: 'bg-blue-500' },
                { label: 'Car Loans', value: data.liability_breakdown?.car_loans || 0, color: 'bg-orange-500' },
                { label: 'Credit Cards', value: data.liability_breakdown?.credit_cards || 0, color: 'bg-red-500' },
                { label: 'HECS/HELP', value: data.liability_breakdown?.hecs || 0, color: 'bg-purple-500' },
                { label: 'Other', value: data.liability_breakdown?.other || 0, color: 'bg-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Worth Over Time Chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial History</h3>
            <Button
              onClick={handleCreateSnapshot}
              disabled={snapshotLoading || !currentPortfolio?.id}
              variant="outline"
              size="sm"
              className="hover:bg-lime-50 hover:border-lime-400"
              data-testid="create-snapshot-btn"
            >
              {snapshotLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              Take Snapshot
            </Button>
          </div>
          <NetWorthChart data={netWorthHistory} loading={historyLoading} />
        </div>

        {/* Asset Allocation Pie Chart */}
        <AssetAllocationChart 
          breakdown={data.asset_breakdown} 
          loading={loading} 
        />

        {/* Cashflow Chart */}
        <CashflowChart 
          income={data.monthly_income} 
          expenses={data.monthly_expenses}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <Card data-testid="quick-actions-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Add Property', icon: Home, href: '/finances/properties' },
              { label: 'Add Income', icon: DollarSign, href: '/finances/income' },
              { label: 'Add Asset', icon: PiggyBank, href: '/finances/assets' },
              { label: 'Create Plan', icon: TrendingUp, href: '/plans' },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-lime-50 hover:border-lime-400"
                onClick={() => navigate(action.href)}
                data-testid={`quick-action-${action.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <action.icon className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardNew;
