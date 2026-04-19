import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ScenarioListPanel from '../components/scenarios/ScenarioListPanel';
import { formatCurrency, formatPercentage } from '../utils/formatCurrency';
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

const ProjectionsPage = () => {
    const { currentPortfolio } = usePortfolio();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState('portfolio');
    const [projections, setProjections] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [years, setYears] = useState(10);
    const [interestRateOffset, setInterestRateOffset] = useState(0);
    const [expenseGrowthOverride, setExpenseGrowthOverride] = useState(null);
    const [assetGrowthOverride, setAssetGrowthOverride] = useState(null);
    const [showScenarioControls, setShowScenarioControls] = useState(false);

    const fetchProperties = useCallback(async () => {
        if (!currentPortfolio?.id) return;
        try {
            const data = await api.getProperties(currentPortfolio.id);
            setProperties(data);
        } catch (err) {
            console.error('Failed to fetch properties:', err);
            setError(err.response?.data?.detail || 'Failed to load properties.');
        }
    }, [currentPortfolio?.id]);

    const fetchProjections = useCallback(async () => {
        if (!currentPortfolio?.id) return;
        setLoading(true);
        setError(null);
        try {
            const options = {
                years,
                interestRateOffset: interestRateOffset || undefined,
                expenseGrowthOverride: expenseGrowthOverride || undefined,
                assetGrowthOverride: assetGrowthOverride || undefined,
            };
            const data = selectedPropertyId === 'portfolio'
                ? await api.getPortfolioProjections(currentPortfolio.id, options)
                : await api.getPropertyProjections(selectedPropertyId, options);
            setProjections(data);
        } catch (err) {
            console.error('Failed to fetch projections:', err);
            setError('Failed to load projections. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [currentPortfolio?.id, selectedPropertyId, years, interestRateOffset, expenseGrowthOverride, assetGrowthOverride]);

    useEffect(() => { fetchProperties(); }, [fetchProperties]);
    useEffect(() => { fetchProjections(); }, [fetchProjections]);

    const getCurrentYearData = () => {
        const data = projections?.totals || projections?.projections;
        return data?.[0] || null;
    };
    const getFinalYearData = () => {
        const data = projections?.totals || projections?.projections;
        return data?.[data.length - 1] || null;
    };

    const currentData = getCurrentYearData();
    const finalData = getFinalYearData();
    const projectionData = projections?.totals || projections?.projections || [];

    if (!currentPortfolio) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Please create a portfolio first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Scenario Panel */}
            <div className="hidden xl:block fixed right-4 top-24 w-72 z-10">
                <ScenarioListPanel
                    portfolioId={currentPortfolio?.id}
                    userTier="free"
                    onSelectScenario={(scenario) => navigate(`/scenarios/${scenario.id}/dashboard`)}
                    onCompareScenario={(scenario) => navigate(`/scenarios/${scenario.id}/dashboard?compare=true`)}
                />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Financial Projections</h1>
                    <p className="text-muted-foreground">{years}-year forecast for your property portfolio</p>
                </div>
                <Button onClick={fetchProjections} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Controls */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <Label className="text-sm text-muted-foreground">View Projections For</Label>
                            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="portfolio">
                                        <div className="flex items-center gap-2"><Building className="w-4 h-4" />Entire Portfolio</div>
                                    </SelectItem>
                                    {properties.map((prop) => (
                                        <SelectItem key={prop.id} value={prop.id}>
                                            <div className="flex items-center gap-2"><Home className="w-4 h-4" />{prop.address}</div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-32">
                            <Label className="text-sm text-muted-foreground">Years</Label>
                            <Select value={String(years)} onValueChange={(v) => setYears(parseInt(v))}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 years</SelectItem>
                                    <SelectItem value="10">10 years</SelectItem>
                                    <SelectItem value="20">20 years</SelectItem>
                                    <SelectItem value="30">30 years</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button variant="outline" onClick={() => setShowScenarioControls(!showScenarioControls)} className="gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Scenarios
                            {showScenarioControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>

                    {showScenarioControls && (
                        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground">Interest Rate Adjustment (stress test)</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input type="number" value={interestRateOffset} onChange={(e) => setInterestRateOffset(parseFloat(e.target.value) || 0)} step="0.5" min="-5" max="10" className="w-24" />
                                    <span className="text-muted-foreground">% points</span>
                                    {interestRateOffset > 0 && <span className="text-gold text-sm">+{interestRateOffset}% from current</span>}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Expense Growth Override</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input type="number" value={expenseGrowthOverride || ''} onChange={(e) => setExpenseGrowthOverride(parseFloat(e.target.value) || null)} placeholder="Default" step="0.5" min="0" max="15" className="w-24" />
                                    <span className="text-muted-foreground">% per year</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Asset Growth Rate Override</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input type="number" value={assetGrowthOverride || ''} onChange={(e) => setAssetGrowthOverride(parseFloat(e.target.value) || null)} placeholder="Default" step="0.5" min="-10" max="30" className="w-24" />
                                    <span className="text-muted-foreground">% per year</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <Card className="border-terra/30 bg-terra-soft">
                    <CardContent className="p-4">
                        <p className="text-terra">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            {currentData && finalData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Value</p>
                                    <p className="text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(currentData.property_value)}</p>
                                    <p className="text-sm text-sage">→ {formatCurrency(finalData.property_value)} in {years}y</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-sage-soft flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-sage" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Equity</p>
                                    <p className="text-2xl font-semibold tabular-nums text-sage">{formatCurrency(currentData.equity)}</p>
                                    <p className="text-sm text-sage">→ {formatCurrency(finalData.equity)} in {years}y</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-sage-soft flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-sage" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Current LVR</p>
                                    <p className="text-2xl font-semibold tabular-nums text-plum">{formatPercentage(currentData.lvr)}</p>
                                    <p className="text-sm text-sage">→ {formatPercentage(finalData.lvr)} in {years}y</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-plum-soft flex items-center justify-center">
                                    <Percent className="w-6 h-6 text-plum" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Net Cashflow (Year 1)</p>
                                    <p className={`text-2xl font-semibold tabular-nums ${parseFloat(currentData.net_cashflow) >= 0 ? 'text-sage' : 'text-terra'}`}>
                                        {formatCurrency(currentData.net_cashflow)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">per year</p>
                                </div>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${parseFloat(currentData.net_cashflow) >= 0 ? 'bg-sage-soft' : 'bg-terra-soft'}`}>
                                    <Calendar className={`w-6 h-6 ${parseFloat(currentData.net_cashflow) >= 0 ? 'text-sage' : 'text-terra'}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts */}
            {loading ? (
                <div className="space-y-6">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="h-80 bg-muted animate-pulse rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : projectionData.length > 0 ? (
                <div className="space-y-6">
                    <Card><CardHeader><CardTitle className="text-lg">Property Value & Equity Growth</CardTitle></CardHeader><CardContent><EquityValueChart data={projectionData} /></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-lg">Annual Cashflow Breakdown</CardTitle></CardHeader><CardContent><CashflowProjectionChart data={projectionData} /></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-lg">Loan-to-Value Ratio</CardTitle></CardHeader><CardContent><LVRChart data={projectionData} /></CardContent></Card>
                    {selectedPropertyId === 'portfolio' && (
                        <Card><CardHeader><CardTitle className="text-lg">Portfolio Summary</CardTitle></CardHeader><CardContent><PortfolioSummaryChart data={projectionData} /></CardContent></Card>
                    )}
                </div>
            ) : (
                <Card className="p-12">
                    <div className="text-center">
                        <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No projection data available</h3>
                        <p className="text-muted-foreground">Add properties with loan and rental details to see projections</p>
                    </div>
                </Card>
            )}

            {/* Year-by-Year table */}
            {projectionData.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="text-lg">Year-by-Year Breakdown</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        {['Year','Value','Debt','Equity','LVR','Rent','Expenses','Cashflow'].map(h => (
                                            <th key={h} className={`py-3 px-2 text-muted-foreground font-medium ${h === 'Year' ? 'text-left' : 'text-right'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectionData.map((row, index) => (
                                        <tr key={row.year} className={index % 2 === 0 ? 'bg-muted/40' : ''}>
                                            <td className="py-2 px-2 font-medium text-foreground">{row.year}</td>
                                            <td className="py-2 px-2 text-right text-foreground">{formatCurrency(row.property_value)}</td>
                                            <td className="py-2 px-2 text-right text-foreground">{formatCurrency(row.total_debt)}</td>
                                            <td className="py-2 px-2 text-right text-sage">{formatCurrency(row.equity)}</td>
                                            <td className="py-2 px-2 text-right text-foreground">{formatPercentage(row.lvr)}</td>
                                            <td className="py-2 px-2 text-right text-foreground">{formatCurrency(row.rental_income)}</td>
                                            <td className="py-2 px-2 text-right text-foreground">{formatCurrency(row.expenses)}</td>
                                            <td className={`py-2 px-2 text-right font-medium ${parseFloat(row.net_cashflow) >= 0 ? 'text-sage' : 'text-terra'}`}>
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
