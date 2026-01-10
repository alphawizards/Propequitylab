/**
 * Projections Page
 * Displays property portfolio financial projections with charts and scenario controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import {
    EquityValueChart,
    CashflowProjectionChart,
    LVRChart,
    PortfolioSummaryChart,
} from '../components/charts/ProjectionsChart';
import {
    TrendingUp,
    Building,
    DollarSign,
    Percent,
    Calendar,
    AlertTriangle,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Home,
} from 'lucide-react';

const formatCurrency = (value) => {
    if (!value) return '$0';
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
};

const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${parseFloat(value).toFixed(1)}%`;
};

const ProjectionsPage = () => {
    const { currentPortfolio } = usePortfolio();
    const [properties, setProperties] = useState([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState('portfolio');
    const [projections, setProjections] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Scenario controls
    const [years, setYears] = useState(10);
    const [interestRateOffset, setInterestRateOffset] = useState(0);
    const [expenseGrowthOverride, setExpenseGrowthOverride] = useState(null);
    const [showScenarioControls, setShowScenarioControls] = useState(false);

    // Fetch properties for dropdown
    const fetchProperties = useCallback(async () => {
        if (!currentPortfolio?.id) return;

        try {
            const data = await api.getProperties(currentPortfolio.id);
            setProperties(data);
        } catch (err) {
            console.error('Failed to fetch properties:', err);
        }
    }, [currentPortfolio?.id]);

    // Fetch projections
    const fetchProjections = useCallback(async () => {
        if (!currentPortfolio?.id) return;

        setLoading(true);
        setError(null);

        try {
            const options = {
                years,
                interestRateOffset: interestRateOffset || undefined,
                expenseGrowthOverride: expenseGrowthOverride || undefined,
            };

            let data;
            if (selectedPropertyId === 'portfolio') {
                data = await api.getPortfolioProjections(currentPortfolio.id, options);
            } else {
                data = await api.getPropertyProjections(selectedPropertyId, options);
            }

            setProjections(data);
        } catch (err) {
            console.error('Failed to fetch projections:', err);
            setError('Failed to load projections. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [currentPortfolio?.id, selectedPropertyId, years, interestRateOffset, expenseGrowthOverride]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    useEffect(() => {
        fetchProjections();
    }, [fetchProjections]);

    // Get current year's data
    const getCurrentYearData = () => {
        if (!projections) return null;

        const data = projections.totals || projections.projections;
        return data?.[0] || null;
    };

    // Get final year's data
    const getFinalYearData = () => {
        if (!projections) return null;

        const data = projections.totals || projections.projections;
        return data?.[data.length - 1] || null;
    };

    const currentData = getCurrentYearData();
    const finalData = getFinalYearData();
    const projectionData = projections?.totals || projections?.projections || [];

    if (!currentPortfolio) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Please create a portfolio first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Projections</h1>
                    <p className="text-gray-500">
                        {years}-year forecast for your property portfolio
                    </p>
                </div>
                <Button
                    onClick={fetchProjections}
                    disabled={loading}
                    className="bg-lime-400 text-gray-900 hover:bg-lime-500"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Property Selector & Scenario Controls */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Property Selector */}
                        <div className="flex-1 min-w-[200px]">
                            <Label className="text-sm text-gray-500">View Projections For</Label>
                            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="portfolio">
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4" />
                                            Entire Portfolio
                                        </div>
                                    </SelectItem>
                                    {properties.map((prop) => (
                                        <SelectItem key={prop.id} value={prop.id}>
                                            <div className="flex items-center gap-2">
                                                <Home className="w-4 h-4" />
                                                {prop.address}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Years Selector */}
                        <div className="w-32">
                            <Label className="text-sm text-gray-500">Years</Label>
                            <Select value={String(years)} onValueChange={(v) => setYears(parseInt(v))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 years</SelectItem>
                                    <SelectItem value="10">10 years</SelectItem>
                                    <SelectItem value="20">20 years</SelectItem>
                                    <SelectItem value="30">30 years</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Scenario Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowScenarioControls(!showScenarioControls)}
                            className="gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Scenarios
                            {showScenarioControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Scenario Controls */}
                    {showScenarioControls && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-gray-500">
                                    Interest Rate Adjustment (stress test)
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        type="number"
                                        value={interestRateOffset}
                                        onChange={(e) => setInterestRateOffset(parseFloat(e.target.value) || 0)}
                                        step="0.5"
                                        min="-5"
                                        max="10"
                                        className="w-24"
                                    />
                                    <span className="text-gray-500">% points</span>
                                    {interestRateOffset > 0 && (
                                        <span className="text-amber-600 text-sm">+{interestRateOffset}% from current</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">
                                    Expense Growth Override
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        type="number"
                                        value={expenseGrowthOverride || ''}
                                        onChange={(e) => setExpenseGrowthOverride(parseFloat(e.target.value) || null)}
                                        placeholder="Default"
                                        step="0.5"
                                        min="0"
                                        max="15"
                                        className="w-24"
                                    />
                                    <span className="text-gray-500">% per year</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-700">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            {currentData && finalData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Current Value</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(currentData.property_value)}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        → {formatCurrency(finalData.property_value)} in {years}y
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Current Equity</p>
                                    <p className="text-2xl font-bold text-lime-600">
                                        {formatCurrency(currentData.equity)}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        → {formatCurrency(finalData.equity)} in {years}y
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-lime-100 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-lime-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Current LVR</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatPercentage(currentData.lvr)}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        → {formatPercentage(finalData.lvr)} in {years}y
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Percent className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Net Cashflow (Year 1)</p>
                                    <p className={`text-2xl font-bold ${parseFloat(currentData.net_cashflow) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(currentData.net_cashflow)}
                                    </p>
                                    <p className="text-sm text-gray-500">per year</p>
                                </div>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${parseFloat(currentData.net_cashflow) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <Calendar className={`w-6 h-6 ${parseFloat(currentData.net_cashflow) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : projectionData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Equity & Value Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Property Value & Equity Growth</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EquityValueChart data={projectionData} />
                        </CardContent>
                    </Card>

                    {/* Cashflow Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Annual Cashflow Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CashflowProjectionChart data={projectionData} />
                        </CardContent>
                    </Card>

                    {/* LVR Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Loan-to-Value Ratio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LVRChart data={projectionData} />
                        </CardContent>
                    </Card>

                    {/* Summary Chart for Portfolio View */}
                    {selectedPropertyId === 'portfolio' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Portfolio Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PortfolioSummaryChart data={projectionData} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (
                <Card className="p-12">
                    <div className="text-center">
                        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No projection data available
                        </h3>
                        <p className="text-gray-500">
                            Add properties with loan and rental details to see projections
                        </p>
                    </div>
                </Card>
            )}

            {/* Projection Data Table */}
            {projectionData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Year-by-Year Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2 text-gray-500">Year</th>
                                        <th className="text-right py-3 px-2 text-gray-500">Value</th>
                                        <th className="text-right py-3 px-2 text-gray-500">Debt</th>
                                        <th className="text-right py-3 px-2 text-gray-500">Equity</th>
                                        <th className="text-right py-3 px-2 text-gray-500">LVR</th>
                                        <th className="text-right py-3 px-2 text-gray-500">Rent</th>
                                        <th className="text-right py-3 px-2 text-gray-500">Expenses</th>
                                        <th className="text-right py-3 px-2 text-gray-500">Cashflow</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectionData.map((row, index) => (
                                        <tr key={row.year} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                            <td className="py-2 px-2 font-medium">{row.year}</td>
                                            <td className="py-2 px-2 text-right">{formatCurrency(row.property_value)}</td>
                                            <td className="py-2 px-2 text-right">{formatCurrency(row.total_debt)}</td>
                                            <td className="py-2 px-2 text-right text-green-600">{formatCurrency(row.equity)}</td>
                                            <td className="py-2 px-2 text-right">{formatPercentage(row.lvr)}</td>
                                            <td className="py-2 px-2 text-right">{formatCurrency(row.rental_income)}</td>
                                            <td className="py-2 px-2 text-right">{formatCurrency(row.expenses)}</td>
                                            <td className={`py-2 px-2 text-right font-medium ${parseFloat(row.net_cashflow) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(row.net_cashflow)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProjectionsPage;
