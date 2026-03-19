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
  RefreshCw,
  Camera,
  ArrowRight,
} from 'lucide-react';

// Skeleton loader component — avoids generic spinner
const SkeletonLine = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="rounded-[1.5rem] bg-gradient-to-r from-slate-200 to-slate-100 h-32 animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-[1rem] border border-slate-200/50 p-6 space-y-3">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-8 w-32" />
          <SkeletonLine className="h-3 w-20" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-[1rem] border border-slate-200/50 p-6 h-64">
        <SkeletonLine className="h-full w-full" />
      </div>
      <div className="rounded-[1rem] border border-slate-200/50 p-6 h-64">
        <SkeletonLine className="h-full w-full" />
      </div>
    </div>
  </div>
);

const DashboardNew = () => {
  const navigate = useNavigate();
  const { currentPortfolio, createPortfolio } = usePortfolio();
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getDashboardSummary(currentPortfolio?.id);
      setDashboardData(data);
      setDataVersion(v => v + 1);
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
      const propsWithCashflow = props.map(p => {
        const monthlyRent = p.rental_details?.income
          ? (p.rental_details.frequency === 'weekly' ? p.rental_details.income * 52 / 12 : Number(p.rental_details.income))
          : 0;
        const monthlyExpenses = p.expenses
          ? Object.values(p.expenses).reduce((sum, v) => sum + (Number(v) || 0), 0) / 12
          : 0;
        const loanAmount = Number(p.loan_details?.amount) || 0;
        const interestRate = (Number(p.loan_details?.interest_rate) || 6) / 100;
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
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Welcome to PropEquityLab</h2>
          <p className="text-zinc-500 mb-6 leading-relaxed">
            Create your first portfolio to start tracking property investments and financial goals.
          </p>
          <Button
            onClick={() => createPortfolio('My Portfolio', 'actual')}
            className="bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
      </div>
    );
  }

  // Loading state — skeleton, not spinner
  if (loading) {
    return <DashboardSkeleton />;
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

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Banner — Asymmetric, not centered */}
      <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-emerald-200 text-sm font-medium tracking-wide uppercase mb-2">Dashboard</p>
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
            <p className="text-emerald-100/80 mt-2 text-base">Here is your financial snapshot</p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-emerald-200 text-xs font-medium tracking-wide uppercase mb-1">Net Worth</p>
            <p className="text-4xl lg:text-5xl font-semibold tracking-tight tabular-nums">{formatCurrency(data.net_worth)}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards — Asymmetric 2+2 grid on large, stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      {/* Charts — Asymmetric layout: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Worth Chart — Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Financial History</h3>
            <Button
              onClick={handleCreateSnapshot}
              disabled={snapshotLoading || !currentPortfolio?.id}
              variant="outline"
              size="sm"
              className="transition-all duration-300 active:scale-[0.98]"
            >
              {snapshotLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              Snapshot
            </Button>
          </div>
          <div className="rounded-xl border border-[#EAEAEA] bg-white p-6 shadow-card">
            <NetWorthChart data={netWorthHistory} loading={historyLoading} />
          </div>
        </div>

        {/* Asset Allocation — 1 column */}
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-6 shadow-card">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280] mb-4">Asset Allocation</h3>
          <AssetAllocationChart
            key={`assets-${dataVersion}`}
            breakdown={data.asset_breakdown}
            loading={false}
          />
        </div>
      </div>

      {/* Asset & Liability Breakdown — Side by side, using spacing not cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Assets</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Properties', value: Number(data.asset_breakdown?.properties) || 0, color: 'bg-blue-500' },
              { label: 'Super', value: Number(data.asset_breakdown?.super) || 0, color: 'bg-violet-500' },
              { label: 'Shares/ETFs', value: (Number(data.asset_breakdown?.shares) || 0) + (Number(data.asset_breakdown?.etf) || 0), color: 'bg-emerald-500' },
              { label: 'Cash', value: Number(data.asset_breakdown?.cash) || 0, color: 'bg-amber-500' },
              { label: 'Other', value: Number(data.asset_breakdown?.other) || 0, color: 'bg-zinc-400' },
            ].filter(item => item.value > 0).map((item, idx) => {
              const total = Object.values(data.asset_breakdown || {}).reduce((s, v) => s + (Number(v) || 0), 0);
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-600">{item.label}</span>
                    <span className="text-sm font-medium text-zinc-900 tabular-nums">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liabilities */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Liabilities</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Property Loans', value: Number(data.liability_breakdown?.property_loans) || 0, color: 'bg-blue-500' },
              { label: 'Car Loans', value: Number(data.liability_breakdown?.car_loans) || 0, color: 'bg-orange-500' },
              { label: 'Credit Cards', value: Number(data.liability_breakdown?.credit_cards) || 0, color: 'bg-red-500' },
              { label: 'HECS/HELP', value: Number(data.liability_breakdown?.hecs) || 0, color: 'bg-violet-500' },
              { label: 'Other', value: Number(data.liability_breakdown?.other) || 0, color: 'bg-zinc-400' },
            ].filter(item => item.value > 0).map((item) => {
              const total = Object.values(data.liability_breakdown || {}).reduce((s, v) => s + (Number(v) || 0), 0);
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-600">{item.label}</span>
                    <span className="text-sm font-medium text-zinc-900 tabular-nums">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.values(data.liability_breakdown || {}).every(v => Number(v) === 0) && (
              <p className="text-sm text-zinc-400 text-center py-6">No liabilities recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Widgets — Asymmetric 70/30 split */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-4">
          <PortfolioSnapshotWidget
            data={{
              net_worth: data.net_worth,
              liquid_assets: (Number(data.asset_breakdown?.cash) || 0) + (Number(data.asset_breakdown?.shares) || 0) + (Number(data.asset_breakdown?.etf) || 0),
              property_equity: (Number(data.asset_breakdown?.properties) || 0) - (Number(data.liability_breakdown?.property_loans) || 0),
              investments: (Number(data.asset_breakdown?.shares) || 0) + (Number(data.asset_breakdown?.etf) || 0),
              super: Number(data.asset_breakdown?.super) || 0,
            }}
          />
        </div>
        <div className="lg:col-span-3">
          <PropertyCashflowsWidget properties={properties} />
        </div>
        <div className="lg:col-span-3">
          <BorrowingWidget
            data={{
              lvr: data.total_assets > 0 ? ((Number(data.liability_breakdown?.property_loans) || 0) / (Number(data.asset_breakdown?.properties) || 1)) * 100 : 0,
              borrowing_capacity: 800000,
              used_capacity: Number(data.liability_breakdown?.property_loans) || 0,
            }}
          />
        </div>
      </div>

      {/* Quick Actions — Horizontal scroll on mobile, grid on desktop */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Property', icon: Home, href: '/finances/properties' },
            { label: 'Add Income', icon: DollarSign, href: '/finances/income' },
            { label: 'Add Asset', icon: PiggyBank, href: '/finances/assets' },
            { label: 'Create Plan', icon: TrendingUp, href: '/plans' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="group flex items-center gap-3 p-4 rounded-lg border border-[#EAEAEA] bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-[0.98] text-left"
            >
              <action.icon className="w-5 h-5 text-[#6B7280] group-hover:text-emerald-600 transition-colors" />
              <span className="text-sm font-medium text-[#111111]">{action.label}</span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 ml-auto transition-all group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
