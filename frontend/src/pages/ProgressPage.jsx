import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatCurrency } from '../utils/formatCurrency';
import {
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-lg border border-border">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const ProgressPage = () => {
  const { currentPortfolio } = usePortfolio();
  const [loading, setLoading] = useState(true);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [projectionData, setProjectionData] = useState(null);
  const [projectionLoading, setProjectionLoading] = useState(false);

  const fetchData = async () => {
    if (!currentPortfolio?.id) return;
    setLoading(true);
    try {
      const [history, dashboard] = await Promise.all([
        api.getNetWorthHistory(currentPortfolio.id, 24),
        api.getDashboardSummary(currentPortfolio.id),
      ]);
      setNetWorthHistory(history.reverse());
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjection = async () => {
    if (!dashboardData) return;
    setProjectionLoading(true);
    try {
      const result = await api.calculateProjection({
        current_net_worth: dashboardData.net_worth || 0,
        annual_savings: (dashboardData.monthly_cashflow || 0) * 12,
        expected_return: 7.0,
        inflation_rate: 2.5,
        withdrawal_rate: 4.0,
        current_age: 35,
        retirement_age: 55,
        life_expectancy: 90,
      });
      setProjectionData(result);
    } catch (error) {
      console.error('Failed to calculate projection:', error);
    } finally {
      setProjectionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPortfolio?.id]);

  useEffect(() => {
    if (dashboardData && !projectionData) {
      fetchProjection();
    }
  }, [dashboardData]);

  // Calculate growth metrics
  const calculateGrowth = () => {
    if (!netWorthHistory || netWorthHistory.length < 2) {
      return {
        monthlyChange: 0,
        monthlyPercent: 0,
        totalChange: 0,
        totalPercent: 0
      };
    }

    const latest = netWorthHistory[netWorthHistory.length - 1]?.net_worth || 0;
    const previous = netWorthHistory[netWorthHistory.length - 2]?.net_worth || 0;
    const first = netWorthHistory[0]?.net_worth || 0;

    return {
      monthlyChange: latest - previous,
      monthlyPercent: previous > 0 ? ((latest - previous) / previous) * 100 : 0,
      totalChange: latest - first,
      totalPercent: first > 0 ? ((latest - first) / first) * 100 : 0,
    };
  };

  const growth = calculateGrowth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="progress-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress Tracking</h1>
          <p className="text-muted-foreground">Monitor your financial journey over time</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchData}
            className="hover:bg-lime-50 hover:border-lime-400"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-lime-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Net Worth</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.net_worth || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${growth.monthlyChange >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {growth.monthlyChange >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Change</p>
                <p className={`text-xl font-bold ${growth.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {growth.monthlyChange >= 0 ? '+' : ''}{formatCurrency(growth.monthlyChange)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Growth</p>
                <p className={`text-xl font-bold ${growth.totalChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {growth.totalPercent >= 0 ? '+' : ''}{growth.totalPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FIRE Progress</p>
                <p className="text-xl font-bold text-orange-600">
                  {projectionData && projectionData.years_to_fire !== null
                    ? `${projectionData.years_to_fire} yrs`
                    : 'Calculating...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="history">Historical Net Worth</TabsTrigger>
          <TabsTrigger value="projection">Future Projection</TabsTrigger>
          <TabsTrigger value="breakdown">Yearly Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth History</CardTitle>
            </CardHeader>
            <CardContent>
              {netWorthHistory.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>No historical data yet. Take snapshots regularly to track your progress.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={netWorthHistory}>
                    <defs>
                      <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="net_worth"
                      name="Net Worth"
                      stroke="#84cc16"
                      strokeWidth={3}
                      fill="url(#colorNetWorth)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projection">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Future Projection</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProjection}
                disabled={projectionLoading}
              >
                {projectionLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Recalculate
              </Button>
            </CardHeader>
            <CardContent>
              {projectionLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : projectionData ? (
                <>
                  {/* FIRE Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">FIRE Number</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(projectionData.fire_number)}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">FIRE Age</p>
                      <p className="text-lg font-bold text-orange-600">
                        {projectionData.fire_age || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Success Probability</p>
                      <p className="text-lg font-bold text-green-600">
                        {projectionData.success_probability}%
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Final Net Worth</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(projectionData.final_net_worth)}
                      </p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={projectionData.projections}>
                      <defs>
                        <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="age"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: 'hsl(var(--foreground))' }}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={formatCurrency}
                      />
                      <Tooltip
                        formatter={(value, name) => [formatCurrency(value), name]}
                        labelFormatter={(label) => `Age: ${label}`}
                      />
                      {projectionData.fire_number > 0 && (
                        <ReferenceLine
                          y={projectionData.fire_number}
                          stroke="#f97316"
                          strokeDasharray="5 5"
                          label={{ value: 'FIRE Target', fill: '#f97316', fontSize: 12 }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="net_worth"
                        name="Net Worth"
                        stroke="#84cc16"
                        strokeWidth={3}
                        fill="url(#colorProjection)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <p>Unable to calculate projection. Please add financial data first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {projectionData?.projections ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Year</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Age</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Net Worth</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Savings</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Returns</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Withdrawals</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Phase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectionData.projections.slice(0, 30).map((row) => (
                        <tr key={row.year} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{row.year}</td>
                          <td className="py-3 px-4">{row.age}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(row.net_worth)}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600">
                            {row.annual_savings > 0 ? `+${formatCurrency(row.annual_savings)}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-blue-600">
                            +{formatCurrency(row.investment_returns)}
                          </td>
                          <td className="py-3 px-4 text-right text-red-500">
                            {row.withdrawals > 0 ? `-${formatCurrency(row.withdrawals)}` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${row.phase === 'accumulation'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                              }`}>
                              {row.phase}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-500">
                  <p>Calculate a projection to see yearly breakdown.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
