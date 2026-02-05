import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { NetWorthChart, AssetAllocationChart, CashflowChart } from '../components/charts';
import KPICard from '../components/dashboard/KPICard';
import PortfolioSnapshotWidget from '../components/dashboard/PortfolioSnapshotWidget';
import PropertyCashflowsWidget from '../components/dashboard/PropertyCashflowsWidget';
import BorrowingWidget from '../components/dashboard/BorrowingWidget';
import { formatCurrency } from '../utils/formatCurrency';
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


const DashboardNew = () => {
  const navigate = useNavigate();
  const { currentPortfolio, createPortfolio, summary } = usePortfolio();
  const { user, onboardingStatus } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [properties, setProperties] = useState([]);
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

  const fetchProperties = async () => {
    try {
      const props = await api.getProperties(currentPortfolio?.id);
      // Compute cashflow for each property: rental income - expenses - loan payments
      const propsWithCashflow = props.map(p => {
        const monthlyRent = p.rental_details?.income
          ? (p.rental_details.frequency === 'weekly' ? p.rental_details.income * 52 / 12 : p.rental_details.income)
          : 0;
        const monthlyExpenses = p.expenses
          ? Object.values(p.expenses).reduce((sum, v) => sum + (Number(v) || 0), 0) / 12
          : 0;
        const loanAmount = p.loan_details?.amount || 0;
        const interestRate = (p.loan_details?.interest_rate || 6) / 100;
        const monthlyLoanPayment = loanAmount > 0 ? (loanAmount * interestRate / 12) : 0;
        const cashflow = monthlyRent - monthlyExpenses - monthlyLoanPayment;
        return { ...p, cashflow };
      });
      setProperties(propsWithCashflow);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
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
      fetchProperties();
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
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to PropEquityLab</h2>
          <p className="text-gray-600 mb-6">
            Get started by creating your first portfolio to track your property investments and financial goals.
          </p>
          <Button
            onClick={() => createPortfolio('My Portfolio', 'actual')}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
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
      <Card className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-emerald-100 mt-1">Here's your financial snapshot</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-200">Net Worth</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(data.net_worth)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Assets"
          value={formatCurrency(data.total_assets)}
          icon={PiggyBank}
          variant="green"
          trend="up"
          trendValue="+5.2% this month"
        />
        <KPICard
          title="Total Liabilities"
          value={formatCurrency(data.total_liabilities)}
          icon={CreditCard}
          variant="purple"
        />
        <KPICard
          title="Monthly Cashflow"
          value={formatCurrency(data.monthly_cashflow)}
          icon={DollarSign}
          variant={data.monthly_cashflow >= 0 ? "blue" : "yellow"}
        />
        <KPICard
          title="Properties"
          value={data.properties_count.toString()}
          icon={Home}
          variant="blue"
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
                { label: 'Properties', value: Number(data.asset_breakdown?.properties) || 0, color: 'bg-blue-500' },
                { label: 'Superannuation', value: Number(data.asset_breakdown?.super) || 0, color: 'bg-purple-500' },
                { label: 'Shares/ETFs', value: (Number(data.asset_breakdown?.shares) || 0) + (Number(data.asset_breakdown?.etf) || 0), color: 'bg-green-500' },
                { label: 'Cash', value: Number(data.asset_breakdown?.cash) || 0, color: 'bg-yellow-500' },
                { label: 'Other', value: Number(data.asset_breakdown?.other) || 0, color: 'bg-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(item.value)}</span>
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
                { label: 'Property Loans', value: Number(data.liability_breakdown?.property_loans) || 0, color: 'bg-blue-500' },
                { label: 'Car Loans', value: Number(data.liability_breakdown?.car_loans) || 0, color: 'bg-orange-500' },
                { label: 'Credit Cards', value: Number(data.liability_breakdown?.credit_cards) || 0, color: 'bg-red-500' },
                { label: 'HECS/HELP', value: Number(data.liability_breakdown?.hecs) || 0, color: 'bg-purple-500' },
                { label: 'Other', value: Number(data.liability_breakdown?.other) || 0, color: 'bg-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(item.value)}</span>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial History</h3>
            <Button
              onClick={handleCreateSnapshot}
              disabled={snapshotLoading || !currentPortfolio?.id}
              variant="outline"
              size="sm"
              className="hover:bg-emerald-50 hover:border-emerald-400"
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

      {/* Bottom Widgets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PortfolioSnapshotWidget
          data={{
            net_worth: data.net_worth,
            liquid_assets: (data.asset_breakdown?.cash || 0) + (data.asset_breakdown?.shares || 0) + (data.asset_breakdown?.etf || 0),
            property_equity: (data.asset_breakdown?.properties || 0) - (data.liability_breakdown?.property_loans || 0),
            investments: (data.asset_breakdown?.shares || 0) + (data.asset_breakdown?.etf || 0),
            super: data.asset_breakdown?.super || 0,
          }}
        />
        <PropertyCashflowsWidget
          properties={properties}
        />
        <BorrowingWidget
          data={{
            lvr: data.total_assets > 0 ? ((data.liability_breakdown?.property_loans || 0) / (data.asset_breakdown?.properties || 1)) * 100 : 0,
            borrowing_capacity: 800000,
            used_capacity: data.liability_breakdown?.property_loans || 0,
          }}
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
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:border-emerald-400"
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
