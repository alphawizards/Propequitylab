/**
 * Projections Chart Component
 * Displays multi-year property/portfolio projections using Recharts
 */

import React from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

const formatCurrency = (value) => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
};

const formatPercentage = (value) => `${value.toFixed(1)}%`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg border border-gray-700">
                <p className="font-semibold mb-2">Year {label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.name.includes('LVR')
                            ? formatPercentage(entry.value)
                            : formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * Equity & Value Chart
 * Shows property value growth and equity accumulation
 */
export const EquityValueChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map((d) => ({
        year: d.year,
        'Property Value': parseFloat(d.property_value),
        'Total Debt': parseFloat(d.total_debt),
        'Equity': parseFloat(d.equity),
    }));

    return (
        <div className="w-full h-80">
            <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="year"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="Property Value"
                        fill="#10B981"
                        fillOpacity={0.3}
                        stroke="#10B981"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="Equity"
                        fill="#84CC16"
                        fillOpacity={0.5}
                        stroke="#84CC16"
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="Total Debt"
                        stroke="#EF4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Cashflow Chart
 * Shows rental income, expenses, and net cashflow over time
 */
export const CashflowProjectionChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map((d) => ({
        year: d.year,
        'Rental Income': parseFloat(d.rental_income),
        'Expenses': parseFloat(d.expenses),
        'Loan Repayments': parseFloat(d.loan_repayments),
        'Net Cashflow': parseFloat(d.net_cashflow),
    }));

    return (
        <div className="w-full h-80">
            <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="year"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Rental Income" fill="#10B981" />
                    <Bar dataKey="Expenses" fill="#F59E0B" />
                    <Bar dataKey="Loan Repayments" fill="#6366F1" />
                    <Line
                        type="monotone"
                        dataKey="Net Cashflow"
                        stroke="#84CC16"
                        strokeWidth={3}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * LVR Chart
 * Shows Loan-to-Value Ratio declining over time
 */
export const LVRChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map((d) => ({
        year: d.year,
        'LVR': parseFloat(d.lvr),
    }));

    return (
        <div className="w-full h-64">
            <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="year"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={(v) => `${v}%`}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="LVR"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                        stroke="#8B5CF6"
                        strokeWidth={2}
                    />
                    {/* 80% LVR reference line */}
                    <Line
                        dataKey={() => 80}
                        stroke="#EF4444"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        name="80% LVR Threshold"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Portfolio Summary Chart
 * Shows aggregated portfolio metrics
 */
export const PortfolioSummaryChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map((d) => ({
        year: d.year,
        'Total Value': parseFloat(d.total_value || d.property_value),
        'Total Equity': parseFloat(d.total_equity || d.equity),
        'Net Cashflow': parseFloat(d.total_net_cashflow || d.net_cashflow),
    }));

    return (
        <div className="w-full h-80">
            <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="year"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={formatCurrency}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="Total Value"
                        fill="#10B981"
                        fillOpacity={0.2}
                        stroke="#10B981"
                        strokeWidth={2}
                    />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="Total Equity"
                        fill="#84CC16"
                        fillOpacity={0.4}
                        stroke="#84CC16"
                        strokeWidth={2}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="Net Cashflow"
                        stroke="#FBBF24"
                        strokeWidth={2}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default {
    EquityValueChart,
    CashflowProjectionChart,
    LVRChart,
    PortfolioSummaryChart,
};
