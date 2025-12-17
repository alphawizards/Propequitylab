import React, { useEffect, useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value?.toFixed(0) || 0}`;
};

const formatCurrencyFull = (value) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

// Chart colors
const ASSET_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#14b8a6', '#ec4899', '#6366f1', '#84cc16'];
const LIABILITY_COLORS = ['#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#6b7280'];
const CASHFLOW_COLORS = { income: '#22c55e', expenses: '#ef4444', savings: '#3b82f6' };

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <Card className="relative overflow-hidden" data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
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

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : formatCurrencyFull(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom pie chart tooltip
const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">{formatCurrencyFull(data.value)}</p>
        <p className="text-sm text-gray-500">{(data.percent * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const DashboardNew = () => {
  const { currentPortfolio, createPortfolio } = usePortfolio();
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dateRange, setDateRange] = useState('12');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardSummary(currentPortfolio?.id);
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentPortfolio?.id]);

  useEffect(() => {
    const fetchNetWorthHistory = async () => {
      if (!currentPortfolio?.id) return;
      
      try {
        setHistoryLoading(true);
        const history = await api.getNetWorthHistory(currentPortfolio.id, parseInt(dateRange));
        setNetWorthHistory(history.reverse()); // Reverse to show oldest first
      } catch (error) {
        console.error('Failed to fetch net worth history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchNetWorthHistory();
  }, [currentPortfolio?.id, dateRange]);

  const handleCreateSnapshot = async () => {
    if (!currentPortfolio?.id) return;
    
    try {
      await api.createSnapshot(currentPortfolio.id);
      const history = await api.getNetWorthHistory(currentPortfolio.id, parseInt(dateRange));
      setNetWorthHistory(history.reverse());
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    }
  };

  // Prepare asset allocation data for pie chart
  const assetAllocationData = useMemo(() => {
    if (!dashboardData?.asset_breakdown) return [];
    
    const breakdown = dashboardData.asset_breakdown;
    return [
      { name: 'Properties', value: breakdown.properties || 0 },
      { name: 'Super', value: breakdown.super || 0 },
      { name: 'Shares', value: breakdown.shares || 0 },
      { name: 'ETFs', value: breakdown.etf || 0 },
      { name: 'Crypto', value: breakdown.crypto || 0 },
      { name: 'Cash', value: breakdown.cash || 0 },
      { name: 'Bonds', value: breakdown.bonds || 0 },
      { name: 'Other', value: breakdown.other || 0 },
    ].filter(item => item.value > 0);
  }, [dashboardData]);

  // Prepare liability breakdown data for pie chart
  const liabilityAllocationData = useMemo(() => {
    if (!dashboardData?.liability_breakdown) return [];
    
    const breakdown = dashboardData.liability_breakdown;
    return [
      { name: 'Property Loans', value: breakdown.property_loans || 0 },
      { name: 'Car Loans', value: breakdown.car_loans || 0 },
      { name: 'Credit Cards', value: breakdown.credit_cards || 0 },
      { name: 'HECS/HELP', value: breakdown.hecs || 0 },
      { name: 'Personal Loans', value: breakdown.personal_loans || 0 },
      { name: 'Other', value: breakdown.other || 0 },
    ].filter(item => item.value > 0);
  }, [dashboardData]);

  // Prepare monthly cashflow data for bar chart
  const cashflowData = useMemo(() => {
    if (!dashboardData) return [];
    
    return [{
      name: 'Monthly',
      income: dashboardData.monthly_income || 0,
      expenses: dashboardData.monthly_expenses || 0,
      savings: dashboardData.monthly_cashflow || 0,
    }];
  }, [dashboardData]);

  // Generate sample historical data if none exists
  const chartNetWorthHistory = useMemo(() => {
    if (netWorthHistory.length > 0) {
      return netWorthHistory.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-AU', { month: 'short', year: '2-digit' }),
        netWorth: item.net_worth,
        assets: item.total_assets,
        liabilities: item.total_liabilities,
      }));
    }
    
    // If no historical data, create a single point from current data
    if (dashboardData) {
      const today = new Date();
      return [{
        date: today.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' }),
        netWorth: dashboardData.net_worth,
        assets: dashboardData.total_assets,
        liabilities: dashboardData.total_liabilities,
      }];
    }
    
    return [];
  }, [netWorthHistory, dashboardData]);

  // Show create portfolio prompt if no portfolio exists
  if (!currentPortfolio && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" data-testid="create-portfolio-prompt">
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
            data-testid="create-portfolio-btn"
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
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Debug indicator - remove after verification */}
      <div className="bg-lime-500 text-white p-2 text-center font-bold rounded">PHASE 5 CHARTS ENABLED v2</div>
      
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0" data-testid="welcome-banner">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-gray-300 mt-1">Here's your financial snapshot</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Net Worth</p>
              <p className="text-3xl font-bold text-lime-400" data-testid="net-worth-value">{formatCurrency(data.net_worth)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
        <StatCard
          title="Total Assets"
          value={formatCurrency(data.total_assets)}
          icon={PiggyBank}
          color="bg-green-100 text-green-600"
          trend={data.total_assets > 0 ? "up" : undefined}
          trendValue={data.total_assets > 0 ? "+5.2% this month" : undefined}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Worth Over Time Chart */}
        <Card className="lg:col-span-2" data-testid="net-worth-chart">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-lime-600" />
                Net Worth Over Time
              </CardTitle>
              <CardDescription>Track your wealth growth over time</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32" data-testid="date-range-selector">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="60">5 years</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateSnapshot}
                className="flex items-center gap-2"
                data-testid="create-snapshot-btn"
              >
                <RefreshCw className="w-4 h-4" />
                Snapshot
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {chartNetWorthHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartNetWorthHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="netWorth"
                    name="Net Worth"
                    stroke="#84cc16"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorNetWorth)"
                  />
                  <Line
                    type="monotone"
                    dataKey="assets"
                    name="Total Assets"
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="liabilities"
                    name="Total Liabilities"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No historical data yet</p>
                  <Button
                    variant="link"
                    onClick={handleCreateSnapshot}
                    className="text-lime-600"
                  >
                    Create your first snapshot
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Allocation Pie Chart */}
        <Card data-testid="asset-allocation-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-green-600" />
              Asset Allocation
            </CardTitle>
            <CardDescription>Breakdown of your total assets</CardDescription>
          </CardHeader>
          <CardContent>
            {assetAllocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PiggyBank className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No assets added yet</p>
                  <p className="text-sm">Add assets to see allocation</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Cashflow Bar Chart */}
        <Card data-testid="cashflow-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Monthly Cashflow
            </CardTitle>
            <CardDescription>Income vs Expenses vs Savings</CardDescription>
          </CardHeader>
          <CardContent>
            {(data.monthly_income > 0 || data.monthly_expenses > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cashflowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis 
                    stroke="#6b7280"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill={CASHFLOW_COLORS.income} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill={CASHFLOW_COLORS.expenses} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" name="Net Savings" fill={CASHFLOW_COLORS.savings} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No income or expenses yet</p>
                  <p className="text-sm">Add income and expenses to see cashflow</p>
                </div>
              </div>
            )}
            
            {/* Savings Rate Indicator */}
            {data.savings_rate > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Savings Rate</span>
                  <span className="text-lg font-bold text-blue-600">{data.savings_rate.toFixed(1)}%</span>
                </div>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(data.savings_rate, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Asset & Liability Breakdown Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Breakdown */}
        <Card data-testid="assets-breakdown">
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
                { label: 'Crypto', value: data.asset_breakdown?.crypto || 0, color: 'bg-orange-500' },
                { label: 'Cash', value: data.asset_breakdown?.cash || 0, color: 'bg-yellow-500' },
                { label: 'Other', value: (data.asset_breakdown?.bonds || 0) + (data.asset_breakdown?.other || 0), color: 'bg-gray-500' },
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
        <Card data-testid="liabilities-breakdown">
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
                { label: 'Personal Loans', value: data.liability_breakdown?.personal_loans || 0, color: 'bg-pink-500' },
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

      {/* Quick Actions */}
      <Card data-testid="quick-actions">
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
                data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
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
