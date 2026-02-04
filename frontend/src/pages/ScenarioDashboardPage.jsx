/**
 * ScenarioDashboardPage - Full dashboard view for a scenario portfolio
 * 
 * Displays all the same charts and widgets as the main dashboard,
 * but for a scenario copy instead of the actual portfolio.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
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
    ArrowLeft,
    Home,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Building,
    PiggyBank,
    CreditCard,
    BarChart3,
    GitCompare,
    Edit2,
    Trash2,
    AlertTriangle,
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

    // Fetch all scenario data
    useEffect(() => {
        if (scenarioId) {
            fetchScenarioData();
        }
    }, [scenarioId]);

    const fetchScenarioData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch scenario details
            const scenarioData = await api.getScenario(scenarioId);
            setScenario(scenarioData);

            // Fetch dashboard summary for the scenario portfolio
            const summary = await api.getDashboardSummary(scenarioId);
            setDashboardData(summary);

            // Fetch properties in this scenario
            const props = await api.getProperties(scenarioId);
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

            // Fetch comparison data
            const compData = await api.compareScenario(scenarioId);
            setComparison(compData);

        } catch (err) {
            console.error('Failed to fetch scenario data:', err);
            if (err.response?.status === 404) {
                setError('Scenario not found');
            } else {
                setError('Failed to load scenario data');
            }
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
            console.error('Failed to delete scenario:', err);
            setError('Failed to delete scenario');
        } finally {
            setDeleting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading scenario...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => navigate('/projections')} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Projections
                        </Button>
                    </CardContent>
                </Card>
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

    // Format difference with color and arrow
    const formatDiff = (value, inverse = false) => {
        if (value === 0) return <span className="text-gray-500">-</span>;
        const isPositive = inverse ? value < 0 : value > 0;
        const formatted = formatCurrency(Math.abs(value));
        return (
            <span className={isPositive ? 'text-emerald-600' : 'text-red-500'}>
                {isPositive ? '↑' : '↓'} {formatted}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Scenario Header */}
            <Card className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white border-0">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/80 hover:text-white hover:bg-white/10 -ml-2"
                                    onClick={() => navigate('/projections')}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                                <span className="px-2 py-0.5 bg-purple-500/30 rounded text-xs font-medium">
                                    SCENARIO
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold">{scenario?.scenario_name || 'Scenario'}</h2>
                            {scenario?.scenario_description && (
                                <p className="text-white/70 mt-1">{scenario.scenario_description}</p>
                            )}
                            <p className="text-white/50 text-sm mt-2">
                                Based on: {scenario?.name?.split(' - ')[0] || 'Portfolio'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/60">Scenario Net Worth</p>
                            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(data.net_worth)}</p>
                            {comparison && (
                                <p className="text-sm mt-1">
                                    vs Actual: {formatDiff(comparison.differences.net_worth)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => setShowComparison(!showComparison)}
                        >
                            <GitCompare className="w-4 h-4 mr-1" />
                            {showComparison ? 'Hide Comparison' : 'Compare to Actual'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => navigate(`/scenarios/${scenarioId}/edit`)}
                        >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit Scenario
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                            onClick={handleDeleteScenario}
                            disabled={deleting}
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Table (collapsible) */}
            {showComparison && comparison && (
                <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GitCompare className="w-5 h-5 text-purple-600" />
                            Comparison: Actual vs Scenario
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 font-medium text-gray-600">Metric</th>
                                        <th className="text-right py-2 font-medium text-gray-600">Actual</th>
                                        <th className="text-right py-2 font-medium text-purple-600">Scenario</th>
                                        <th className="text-right py-2 font-medium text-gray-600">Difference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">Total Value</td>
                                        <td className="text-right">{formatCurrency(comparison.actual.total_value)}</td>
                                        <td className="text-right font-medium">{formatCurrency(comparison.scenario.total_value)}</td>
                                        <td className="text-right">{formatDiff(comparison.differences.total_value)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Total Equity</td>
                                        <td className="text-right">{formatCurrency(comparison.actual.total_equity)}</td>
                                        <td className="text-right font-medium">{formatCurrency(comparison.scenario.total_equity)}</td>
                                        <td className="text-right">{formatDiff(comparison.differences.total_equity)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Total Debt</td>
                                        <td className="text-right">{formatCurrency(comparison.actual.total_debt)}</td>
                                        <td className="text-right font-medium">{formatCurrency(comparison.scenario.total_debt)}</td>
                                        <td className="text-right">{formatDiff(comparison.differences.total_debt, true)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Net Worth</td>
                                        <td className="text-right">{formatCurrency(comparison.actual.net_worth)}</td>
                                        <td className="text-right font-medium">{formatCurrency(comparison.scenario.net_worth)}</td>
                                        <td className="text-right">{formatDiff(comparison.differences.net_worth)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Annual Cashflow</td>
                                        <td className="text-right">{formatCurrency(comparison.actual.annual_cashflow)}</td>
                                        <td className="text-right font-medium">{formatCurrency(comparison.scenario.annual_cashflow)}</td>
                                        <td className="text-right">{formatDiff(comparison.differences.annual_cashflow)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">LVR</td>
                                        <td className="text-right">{comparison.actual.lvr.toFixed(1)}%</td>
                                        <td className="text-right font-medium">{comparison.scenario.lvr.toFixed(1)}%</td>
                                        <td className="text-right">{formatDiff(-comparison.differences.lvr)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Assets"
                    value={formatCurrency(data.total_assets)}
                    icon={PiggyBank}
                    variant="green"
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
                                { label: 'Property Loans', value: Number(data.liability_breakdown?.property_loans) || 0, color: 'bg-blue-500' },
                                { label: 'Car Loans', value: Number(data.liability_breakdown?.car_loans) || 0, color: 'bg-orange-500' },
                                { label: 'Credit Cards', value: Number(data.liability_breakdown?.credit_cards) || 0, color: 'bg-red-500' },
                                { label: 'HECS/HELP', value: Number(data.liability_breakdown?.hecs) || 0, color: 'bg-purple-500' },
                                { label: 'Other', value: Number(data.liability_breakdown?.other) || 0, color: 'bg-gray-500' },
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
        </div>
    );
};

export default ScenarioDashboardPage;
