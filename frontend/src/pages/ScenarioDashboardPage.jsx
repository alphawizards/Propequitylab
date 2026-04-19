import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
    ArrowLeft, Home, TrendingUp, TrendingDown, DollarSign,
    Building, PiggyBank, CreditCard, GitCompare, Edit2, Trash2, AlertTriangle,
} from 'lucide-react';

const ScenarioDashboardPage = () => {
    const { scenarioId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useUser();

    const [scenario, setScenario] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [properties, setProperties] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showComparison, setShowComparison] = useState(searchParams.get('compare') === 'true');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => { if (scenarioId) fetchScenarioData(); }, [scenarioId]);

    const fetchScenarioData = async () => {
        setLoading(true);
        setError(null);
        try {
            const scenarioData = await api.getScenario(scenarioId);
            setScenario(scenarioData);

            const summary = await api.getDashboardSummary(scenarioId);
            setDashboardData(summary);

            const props = await api.getProperties(scenarioId);
            setProperties(props.map(p => {
                const monthlyRent = p.rental_details?.income
                    ? (p.rental_details.frequency === 'weekly' ? p.rental_details.income * 52 / 12 : p.rental_details.income) : 0;
                const monthlyExpenses = p.expenses
                    ? Object.values(p.expenses).reduce((sum, v) => sum + (Number(v) || 0), 0) / 12 : 0;
                const loanAmount = p.loan_details?.amount || 0;
                const interestRate = (p.loan_details?.interest_rate || 6) / 100;
                return { ...p, cashflow: monthlyRent - monthlyExpenses - (loanAmount > 0 ? loanAmount * interestRate / 12 : 0) };
            }));

            const compData = await api.compareScenario(scenarioId);
            setComparison(compData);
        } catch (err) {
            console.error('Failed to fetch scenario data:', err);
            setError(err.response?.status === 404 ? 'Scenario not found' : 'Failed to load scenario data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteScenario = async () => {
        if (!window.confirm('Delete this scenario? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await api.deleteScenario(scenarioId);
            navigate('/projections');
        } catch (err) {
            setError('Failed to delete scenario');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading scenario...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-terra mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => navigate('/projections')} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />Back to Projections
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const data = dashboardData || {
        net_worth: 0, total_assets: 0, total_liabilities: 0,
        monthly_income: 0, monthly_expenses: 0, monthly_cashflow: 0,
        savings_rate: 0, properties_count: 0, asset_breakdown: {}, liability_breakdown: {},
    };

    const formatDiff = (value, inverse = false) => {
        if (value === 0) return <span className="text-muted-foreground">-</span>;
        const isPositive = inverse ? value < 0 : value > 0;
        return (
            <span className={isPositive ? 'text-sage' : 'text-terra'}>
                {isPositive ? '↑' : '↓'} {formatCurrency(Math.abs(value))}
            </span>
        );
    };

    const assetDots = { properties: 'bg-ocean', super: 'bg-plum', shares: 'bg-sage', cash: 'bg-gold', other: 'bg-muted-foreground' };
    const liabilityDots = { property_loans: 'bg-ocean', car_loans: 'bg-gold', credit_cards: 'bg-terra', hecs: 'bg-plum', other: 'bg-muted-foreground' };

    return (
        <div className="space-y-6">
            {/* Scenario Header */}
            <Card className="bg-gradient-to-r from-plum to-ocean text-primary-foreground border-0">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 -ml-2" onClick={() => navigate('/projections')}>
                                    <ArrowLeft className="w-4 h-4 mr-1" />Back
                                </Button>
                                <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">SCENARIO</span>
                            </div>
                            <h2 className="text-2xl font-bold">{scenario?.scenario_name || 'Scenario'}</h2>
                            {scenario?.scenario_description && <p className="text-primary-foreground/70 mt-1">{scenario.scenario_description}</p>}
                            <p className="text-primary-foreground/50 text-sm mt-2">Based on: {scenario?.name?.split(' - ')[0] || 'Portfolio'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-primary-foreground/60">Scenario Net Worth</p>
                            <p className="text-3xl font-bold text-primary-foreground">{formatCurrency(data.net_worth)}</p>
                            {comparison && <p className="text-sm mt-1">vs Actual: {formatDiff(comparison.differences.net_worth)}</p>}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20" onClick={() => setShowComparison(!showComparison)}>
                            <GitCompare className="w-4 h-4 mr-1" />{showComparison ? 'Hide Comparison' : 'Compare to Actual'}
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20" onClick={() => navigate(`/scenarios/${scenarioId}/edit`)}>
                            <Edit2 className="w-4 h-4 mr-1" />Edit Scenario
                        </Button>
                        <Button variant="outline" size="sm" className="bg-terra/20 border-terra/30 text-primary-foreground hover:bg-terra/30" onClick={handleDeleteScenario} disabled={deleting}>
                            <Trash2 className="w-4 h-4 mr-1" />{deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Table */}
            {showComparison && comparison && (
                <Card className="border-plum/30 bg-plum-soft/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GitCompare className="w-5 h-5 text-plum" />Comparison: Actual vs Scenario
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 font-medium text-muted-foreground">Metric</th>
                                        <th className="text-right py-2 font-medium text-muted-foreground">Actual</th>
                                        <th className="text-right py-2 font-medium text-plum">Scenario</th>
                                        <th className="text-right py-2 font-medium text-muted-foreground">Difference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: 'Total Value',     actual: comparison.actual.total_value,    scenario: comparison.scenario.total_value,    diff: comparison.differences.total_value },
                                        { label: 'Total Equity',    actual: comparison.actual.total_equity,   scenario: comparison.scenario.total_equity,   diff: comparison.differences.total_equity },
                                        { label: 'Total Debt',      actual: comparison.actual.total_debt,     scenario: comparison.scenario.total_debt,     diff: comparison.differences.total_debt, inverse: true },
                                        { label: 'Net Worth',       actual: comparison.actual.net_worth,      scenario: comparison.scenario.net_worth,      diff: comparison.differences.net_worth },
                                        { label: 'Annual Cashflow', actual: comparison.actual.annual_cashflow, scenario: comparison.scenario.annual_cashflow, diff: comparison.differences.annual_cashflow },
                                    ].map(row => (
                                        <tr key={row.label} className="border-b border-border">
                                            <td className="py-2 text-foreground">{row.label}</td>
                                            <td className="text-right text-foreground">{formatCurrency(row.actual)}</td>
                                            <td className="text-right font-medium text-foreground">{formatCurrency(row.scenario)}</td>
                                            <td className="text-right">{formatDiff(row.diff, row.inverse)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="py-2 text-foreground">LVR</td>
                                        <td className="text-right text-foreground">{comparison.actual.lvr.toFixed(1)}%</td>
                                        <td className="text-right font-medium text-foreground">{comparison.scenario.lvr.toFixed(1)}%</td>
                                        <td className="text-right">{formatDiff(-comparison.differences.lvr)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Assets"      value={formatCurrency(data.total_assets)}     icon={PiggyBank}  variant="green" />
                <KPICard title="Total Liabilities" value={formatCurrency(data.total_liabilities)} icon={CreditCard} variant="purple" />
                <KPICard title="Monthly Cashflow"  value={formatCurrency(data.monthly_cashflow)}  icon={DollarSign} variant={data.monthly_cashflow >= 0 ? 'blue' : 'yellow'} />
                <KPICard title="Properties"        value={data.properties_count.toString()}       icon={Home}       variant="blue" />
            </div>

            {/* Asset & Liability Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-sage" />Assets Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: 'Properties',     key: 'properties', value: Number(data.asset_breakdown?.properties) || 0 },
                                { label: 'Superannuation', key: 'super',       value: Number(data.asset_breakdown?.super) || 0 },
                                { label: 'Shares/ETFs',    key: 'shares',      value: (Number(data.asset_breakdown?.shares) || 0) + (Number(data.asset_breakdown?.etf) || 0) },
                                { label: 'Cash',           key: 'cash',        value: Number(data.asset_breakdown?.cash) || 0 },
                                { label: 'Other',          key: 'other',       value: Number(data.asset_breakdown?.other) || 0 },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${assetDots[item.key] || 'bg-muted-foreground'}`} />
                                        <span className="text-sm text-muted-foreground">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-terra" />Liabilities Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: 'Property Loans', key: 'property_loans', value: Number(data.liability_breakdown?.property_loans) || 0 },
                                { label: 'Car Loans',      key: 'car_loans',      value: Number(data.liability_breakdown?.car_loans) || 0 },
                                { label: 'Credit Cards',   key: 'credit_cards',   value: Number(data.liability_breakdown?.credit_cards) || 0 },
                                { label: 'HECS/HELP',      key: 'hecs',           value: Number(data.liability_breakdown?.hecs) || 0 },
                                { label: 'Other',          key: 'other',          value: Number(data.liability_breakdown?.other) || 0 },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${liabilityDots[item.key] || 'bg-muted-foreground'}`} />
                                        <span className="text-sm text-muted-foreground">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AssetAllocationChart breakdown={data.asset_breakdown} loading={loading} />
                <CashflowChart income={data.monthly_income} expenses={data.monthly_expenses} loading={loading} />
            </div>

            {/* Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PortfolioSnapshotWidget data={{
                    net_worth: data.net_worth,
                    liquid_assets: (data.asset_breakdown?.cash || 0) + (data.asset_breakdown?.shares || 0) + (data.asset_breakdown?.etf || 0),
                    property_equity: (data.asset_breakdown?.properties || 0) - (data.liability_breakdown?.property_loans || 0),
                    investments: (data.asset_breakdown?.shares || 0) + (data.asset_breakdown?.etf || 0),
                    super: data.asset_breakdown?.super || 0,
                }} />
                <PropertyCashflowsWidget properties={properties} />
                <BorrowingWidget data={{
                    lvr: data.total_assets > 0 ? ((data.liability_breakdown?.property_loans || 0) / (data.asset_breakdown?.properties || 1)) * 100 : 0,
                    borrowing_capacity: 800000,
                    used_capacity: data.liability_breakdown?.property_loans || 0,
                }} />
            </div>
        </div>
    );
};

export default ScenarioDashboardPage;
