import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useUser } from '../context/UserContext';
import CreatePortfolioDialog from '../components/portfolios/CreatePortfolioDialog';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { NetWorthChart, AssetAllocationChart, CashflowChart } from '../components/charts';
import KPICard from '../components/dashboard/KPICard';
import PortfolioSnapshotWidget from '../components/dashboard/PortfolioSnapshotWidget';
import PropertyCashflowsWidget from '../components/dashboard/PropertyCashflowsWidget';
import BorrowingWidget from '../components/dashboard/BorrowingWidget';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
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
  Sparkles,
  Loader2,
} from 'lucide-react';

const SkeletonLine = ({ className = '' }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="rounded-[1.5rem] bg-muted h-32 animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-[1rem] border border-border p-6 space-y-3">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-8 w-32" />
          <SkeletonLine className="h-3 w-20" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-[1rem] border border-border p-6 h-64">
        <SkeletonLine className="h-full w-full" />
      </div>
      <div className="rounded-[1rem] border border-border p-6 h-64">
        <SkeletonLine className="h-full w-full" />
      </div>
    </div>
  </div>
);

const DashboardNew = () => {
  const navigate = useNavigate();
  const { currentPortfolio, createPortfolio, fetchPortfolios } = usePortfolio();
  const { user } = useUser();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const computeCashflow = (props) => props.map(p => {
    const rentFreqToAnnual = { weekly: 52, fortnightly: 26, monthly: 12 };
    const monthlyRent = p.rental_details?.income
      ? Number(p.rental_details.income) * (rentFreqToAnnual[p.rental_details.frequency] ?? 12) / 12
      : 0;
    const monthlyExpenses = p.expenses
      ? Object.values(p.expenses).reduce((sum, v) => sum + (Number(v) || 0), 0) / 12
      : 0;
    const loanAmount = Number(p.loan_details?.amount) || 0;
    const interestRate = (Number(p.loan_details?.interest_rate) || 6) / 100;
    const monthlyLoanPayment = loanAmount > 0 ? (loanAmount * interestRate / 12) : 0;
    return { ...p, cashflow: monthlyRent - monthlyExpenses - monthlyLoanPayment };
  });

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      const [data, history, props] = await Promise.all([
        api.getDashboardSummary(currentPortfolio?.id),
        api.getNetWorthHistory(currentPortfolio?.id, 12),
        api.getProperties(currentPortfolio?.id),
      ]);
      setDashboardData(data);
      setDataVersion(v => v + 1);
      setNetWorthHistory(history);
      setProperties(computeCashflow(props));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({ title: 'Failed to load dashboard', description: 'Please try refreshing.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = () => setShowDemoConfirm(true);

  const executeDemoLoad = async () => {
    setShowDemoConfirm(false);
    setDemoLoading(true);
    try {
      await api.loadDemoData();
      await fetchPortfolios();
      toast({ title: 'Demo data loaded!', description: 'Your portfolio has been populated with sample data.' });
      setRefreshTrigger(v => v + 1);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load demo data.',
        variant: 'destructive',
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!currentPortfolio?.id) return;
    setSnapshotLoading(true);
    try {
      await api.createSnapshot(currentPortfolio.id);
      const history = await api.getNetWorthHistory(currentPortfolio?.id, 12);
      setNetWorthHistory(history);
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    } finally {
      setSnapshotLoading(false);
    }
  };

  useEffect(() => {
    if (currentPortfolio?.id) {
      fetchAllDashboardData();
    } else {
      setLoading(false);
    }
  }, [currentPortfolio?.id, refreshTrigger]);

  if (!currentPortfolio && !loading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-sage-soft flex items-center justify-center mx-auto mb-6">
              <Building className="w-10 h-10 text-sage" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Welcome to PropEquityLab</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Create your first portfolio to start tracking property investments and financial goals.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </Button>
          </div>
        </div>
        <CreatePortfolioDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={async (name, type) => {
            await createPortfolio(name, type);
            toast({ title: 'Portfolio created', description: 'Your portfolio is ready to go.' });
          }}
          onError={(error) => {
            const status = error.response?.status;
            const description =
              status === 401 ? 'Please sign in again.' :
              status === 500 ? 'Server error. Please try again later.' :
              'Something went wrong. Please try again.';
            toast({ title: 'Failed to create portfolio', description, variant: 'destructive' });
          }}
        />
      </>
    );
  }

  if (loading) return <DashboardSkeleton />;

  const data = dashboardData || {
    net_worth: 0, total_assets: 0, total_liabilities: 0,
    monthly_income: 0, monthly_expenses: 0, monthly_cashflow: 0,
    savings_rate: 0, properties_count: 0, asset_breakdown: {}, liability_breakdown: {},
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  // Asset progress bar color mapping → Haven palette
  const assetColors = {
    properties: 'bg-ocean', super: 'bg-plum', shares: 'bg-sage',
    etf: 'bg-sage', cash: 'bg-gold', other: 'bg-muted-foreground',
  };
  const liabilityColors = {
    property_loans: 'bg-ocean', car_loans: 'bg-gold',
    credit_cards: 'bg-terra', hecs: 'bg-plum', other: 'bg-muted-foreground',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-[1.5rem] bg-primary text-primary-foreground p-8 lg:p-10 shadow-haven">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium tracking-wide uppercase mb-2">Dashboard</p>
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
            <p className="text-primary-foreground/80 mt-2 text-base">Here is your financial snapshot</p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-primary-foreground/70 text-xs font-medium tracking-wide uppercase mb-1">Net Worth</p>
            <p className="text-4xl lg:text-5xl font-semibold tracking-tight tabular-nums">{formatCurrency(data.net_worth)}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title="Total Assets"      value={formatCurrency(data.total_assets)}     icon={PiggyBank}  variant="green" />
        <KPICard title="Total Liabilities" value={formatCurrency(data.total_liabilities)} icon={CreditCard} variant="purple" />
        <KPICard title="Monthly Cashflow"  value={formatCurrency(data.monthly_cashflow)}  icon={DollarSign} variant={data.monthly_cashflow >= 0 ? 'blue' : 'yellow'} />
        <KPICard title="Properties"        value={data.properties_count.toString()}       icon={Home}       variant="blue" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Financial History</h3>
            <Button
              onClick={handleCreateSnapshot}
              disabled={snapshotLoading || !currentPortfolio?.id}
              variant="outline"
              size="sm"
              className="transition-all duration-300 active:scale-[0.98]"
            >
              {snapshotLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
              Snapshot
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <NetWorthChart data={netWorthHistory} loading={loading} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Asset Allocation</h3>
          <AssetAllocationChart key={`assets-${dataVersion}`} breakdown={data.asset_breakdown} loading={false} />
        </div>
      </div>

      {/* Asset & Liability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-sage" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Assets</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Properties',  key: 'properties',  value: Number(data.asset_breakdown?.properties) || 0 },
              { label: 'Super',       key: 'super',       value: Number(data.asset_breakdown?.super) || 0 },
              { label: 'Shares/ETFs', key: 'shares',      value: (Number(data.asset_breakdown?.shares) || 0) + (Number(data.asset_breakdown?.etf) || 0) },
              { label: 'Cash',        key: 'cash',        value: Number(data.asset_breakdown?.cash) || 0 },
              { label: 'Other',       key: 'other',       value: Number(data.asset_breakdown?.other) || 0 },
            ].filter(item => item.value > 0).map((item) => {
              const total = Object.values(data.asset_breakdown || {}).reduce((s, v) => s + (Number(v) || 0), 0);
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground tabular-nums">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${assetColors[item.key] || 'bg-muted-foreground'} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-terra" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Liabilities</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Property Loans', key: 'property_loans', value: Number(data.liability_breakdown?.property_loans) || 0 },
              { label: 'Car Loans',       key: 'car_loans',      value: Number(data.liability_breakdown?.car_loans) || 0 },
              { label: 'Credit Cards',    key: 'credit_cards',   value: Number(data.liability_breakdown?.credit_cards) || 0 },
              { label: 'HECS/HELP',       key: 'hecs',           value: Number(data.liability_breakdown?.hecs) || 0 },
              { label: 'Other',           key: 'other',          value: Number(data.liability_breakdown?.other) || 0 },
            ].filter(item => item.value > 0).map((item) => {
              const total = Object.values(data.liability_breakdown || {}).reduce((s, v) => s + (Number(v) || 0), 0);
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground tabular-nums">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${liabilityColors[item.key] || 'bg-muted-foreground'} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.values(data.liability_breakdown || {}).every(v => Number(v) === 0) && (
              <p className="text-sm text-muted-foreground text-center py-6">No liabilities recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-4">
          <PortfolioSnapshotWidget data={{
            net_worth: data.net_worth,
            liquid_assets: (Number(data.asset_breakdown?.cash) || 0) + (Number(data.asset_breakdown?.shares) || 0) + (Number(data.asset_breakdown?.etf) || 0),
            property_equity: (Number(data.asset_breakdown?.properties) || 0) - (Number(data.liability_breakdown?.property_loans) || 0),
            investments: (Number(data.asset_breakdown?.shares) || 0) + (Number(data.asset_breakdown?.etf) || 0),
            super: Number(data.asset_breakdown?.super) || 0,
          }} />
        </div>
        <div className="lg:col-span-3">
          <PropertyCashflowsWidget properties={properties} />
        </div>
        <div className="lg:col-span-3">
          <BorrowingWidget data={{
            lvr: data.total_assets > 0 ? ((Number(data.liability_breakdown?.property_loans) || 0) / (Number(data.asset_breakdown?.properties) || 1)) * 100 : 0,
            used_capacity: Number(data.liability_breakdown?.property_loans) || 0,
          }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Property', icon: Home,      href: '/finances/properties' },
            { label: 'Add Income',   icon: DollarSign, href: '/finances/income' },
            { label: 'Add Asset',    icon: PiggyBank,  href: '/finances/assets' },
            { label: 'Create Plan',  icon: TrendingUp, href: '/plans' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="group flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted hover:border-border/80 transition-all duration-150 active:scale-[0.98] text-left"
            >
              <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-sage transition-colors" />
              <span className="text-sm font-medium text-foreground">{action.label}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-sage ml-auto transition-all group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Demo data confirm dialog */}
      <AlertDialog open={showDemoConfirm} onOpenChange={setShowDemoConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing data?</AlertDialogTitle>
            <AlertDialogDescription>
              Loading demo data will <strong>permanently delete</strong> all your current properties,
              assets, liabilities, income, expenses, and plans, then replace them with sample data.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDemoLoad} className="bg-terra hover:bg-terra/90 text-primary-foreground">
              Yes, replace with demo data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demo Data card */}
      <div className="rounded-xl border border-dashed border-border bg-muted/40 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Load Sample Data</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Populate your portfolio with a demo property, car, ETF, super, liabilities, income, and expenses — great for exploring the app.
          </p>
        </div>
        <Button
          onClick={handleLoadDemo}
          disabled={demoLoading}
          variant="outline"
          size="sm"
          className="shrink-0 border-sage text-sage hover:bg-sage-soft hover:border-sage transition-all duration-150 active:scale-[0.98]"
        >
          {demoLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />Load Demo Data</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DashboardNew;
