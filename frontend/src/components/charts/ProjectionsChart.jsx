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
import { formatCurrency, formatPercentage } from '../../utils/formatCurrency';
import { getChartColors } from '../../lib/chartColors';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-lg border border-border">
            <p className="font-semibold text-foreground mb-2">Year {label}</p>
            {payload.map((entry, index) => (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {entry.name}: {entry.name.includes('LVR')
                        ? formatPercentage(entry.value)
                        : formatCurrency(entry.value)}
                </p>
            ))}
        </div>
    );
};

export const EquityValueChart = ({ data }) => {
    const C = getChartColors();
    if (!data || data.length === 0) return null;

    const chartData = data.map((d) => ({
        year: d.year,
        'Property Value': parseFloat(d.property_value),
        'Total Debt':     parseFloat(d.total_debt),
        'Equity':         parseFloat(d.equity),
    }));

    return (
        <div className="w-full h-96">
            <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                    <XAxis dataKey="year" stroke={C.ink3} tick={{ fill: C.ink3 }} />
                    <YAxis stroke={C.ink3} tick={{ fill: C.ink3 }} tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="Property Value"
                        fill={C.sage}
                        fillOpacity={0.3}
                        stroke={C.sage}
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="Equity"
                        fill={C.gold}
                        fillOpacity={0.5}
                        stroke={C.gold}
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="Total Debt"
                        stroke={C.terra}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const CashflowProjectionChart = ({ data }) => {
    const C = getChartColors();
    if (!data || data.length === 0) return null;

    const chartData = data.map((d) => ({
        year: d.year,
        'Rental Income':   parseFloat(d.rental_income),
        'Expenses':        parseFloat(d.expenses),
        'Loan Repayments': parseFloat(d.loan_repayments),
        'Net Cashflow':    parseFloat(d.net_cashflow),
    }));

    return (
        <div className="w-full h-96">
            <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                    <XAxis dataKey="year" stroke={C.ink3} tick={{ fill: C.ink3 }} />
                    <YAxis stroke={C.ink3} tick={{ fill: C.ink3 }} tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Rental Income"   fill={C.sage} />
                    <Bar dataKey="Expenses"        fill={C.gold} />
                    <Bar dataKey="Loan Repayments" fill={C.plum} />
                    <Line
                        type="monotone"
                        dataKey="Net Cashflow"
                        stroke={C.sageSoft}
                        strokeWidth={3}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const LVRChart = ({ data }) => {
    const C = getChartColors();
    if (!data || data.length === 0) return null;

    const chartData = data.map((d) => ({
        year: d.year,
        'LVR': parseFloat(d.lvr),
    }));

    return (
        <div className="w-full h-80">
            <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                    <XAxis dataKey="year" stroke={C.ink3} tick={{ fill: C.ink3 }} />
                    <YAxis
                        stroke={C.ink3}
                        tick={{ fill: C.ink3 }}
                        tickFormatter={(v) => `${v}%`}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="LVR"
                        fill={C.plum}
                        fillOpacity={0.3}
                        stroke={C.plum}
                        strokeWidth={2}
                    />
                    <Line
                        dataKey={() => 80}
                        stroke={C.terra}
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        name="80% LVR Threshold"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const PortfolioSummaryChart = ({ data }) => {
    const C = getChartColors();
    if (!data || data.length === 0) return null;

    const chartData = data.map((d) => ({
        year: d.year,
        'Total Value':  parseFloat(d.total_value || d.property_value),
        'Total Equity': parseFloat(d.total_equity || d.equity),
        'Net Cashflow': parseFloat(d.total_net_cashflow || d.net_cashflow),
    }));

    return (
        <div className="w-full h-96">
            <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                    <XAxis dataKey="year" stroke={C.ink3} tick={{ fill: C.ink3 }} />
                    <YAxis
                        yAxisId="left"
                        stroke={C.ink3}
                        tick={{ fill: C.ink3 }}
                        tickFormatter={formatCurrency}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke={C.ink3}
                        tick={{ fill: C.ink3 }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="Total Value"
                        fill={C.sage}
                        fillOpacity={0.2}
                        stroke={C.sage}
                        strokeWidth={2}
                    />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="Total Equity"
                        fill={C.gold}
                        fillOpacity={0.4}
                        stroke={C.gold}
                        strokeWidth={2}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="Net Cashflow"
                        stroke={C.ocean}
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
