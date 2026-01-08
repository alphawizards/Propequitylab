/**
 * AmortizationSchedule Component
 * Displays month-by-month loan repayment breakdown
 */

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculators/core/decimal-utils';

export function AmortizationSchedule({ schedule }) {
  const [displayMode, setDisplayMode] = useState('yearly'); // 'monthly' or 'yearly'

  if (!schedule || schedule.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No amortization schedule available for interest-only loans</p>
      </div>
    );
  }

  // Aggregate by year for yearly view
  const yearlySchedule = displayMode === 'yearly'
    ? schedule.reduce((acc, item, index) => {
        const yearIndex = Math.floor(index / 12);
        if (!acc[yearIndex]) {
          acc[yearIndex] = {
            year: yearIndex + 1,
            openingBalance: item.openingBalance,
            principalPaid: 0,
            interestPaid: 0,
            totalPayment: 0,
            closingBalance: item.closingBalance,
          };
        }
        acc[yearIndex].principalPaid += item.principalPaid;
        acc[yearIndex].interestPaid += item.interestPaid;
        acc[yearIndex].totalPayment += item.totalPayment;
        acc[yearIndex].closingBalance = item.closingBalance;
        return acc;
      }, [])
    : null;

  const downloadCSV = () => {
    const headers = ['Month', 'Opening Balance', 'Principal', 'Interest', 'Total Payment', 'Closing Balance', 'Cumulative Interest', 'Cumulative Principal'];
    const rows = schedule.map(item => [
      item.month,
      (item.openingBalance / 100).toFixed(2),
      (item.principalPaid / 100).toFixed(2),
      (item.interestPaid / 100).toFixed(2),
      (item.totalPayment / 100).toFixed(2),
      (item.closingBalance / 100).toFixed(2),
      (item.cumulativeInterest / 100).toFixed(2),
      (item.cumulativePrincipal / 100).toFixed(2),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mortgage-amortization-schedule.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Amortization Schedule</h3>
          <Badge variant="outline">
            {schedule.length} months
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={displayMode === 'yearly' ? 'default' : 'outline'}
            onClick={() => setDisplayMode('yearly')}
          >
            Yearly
          </Button>
          <Button
            size="sm"
            variant={displayMode === 'monthly' ? 'default' : 'outline'}
            onClick={() => setDisplayMode('monthly')}
          >
            Monthly
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadCSV}
          >
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-16">{displayMode === 'yearly' ? 'Year' : 'Month'}</TableHead>
              <TableHead className="text-right">Opening Balance</TableHead>
              <TableHead className="text-right">Principal</TableHead>
              <TableHead className="text-right">Interest</TableHead>
              <TableHead className="text-right">Payment</TableHead>
              <TableHead className="text-right">Closing Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayMode === 'yearly' ? (
              yearlySchedule.map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-medium">{row.year}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(Math.round(row.openingBalance))}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-green-600">
                    {formatCurrency(Math.round(row.principalPaid))}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatCurrency(Math.round(row.interestPaid))}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatCurrency(Math.round(row.totalPayment))}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(Math.round(row.closingBalance))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              schedule.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(row.openingBalance)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-green-600">
                    {formatCurrency(row.principalPaid)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatCurrency(row.interestPaid)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatCurrency(row.totalPayment)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(row.closingBalance)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600">Total Principal</p>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(schedule[schedule.length - 1]?.cumulativePrincipal || 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Interest</p>
          <p className="text-lg font-semibold text-red-600">
            {formatCurrency(schedule[schedule.length - 1]?.cumulativeInterest || 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-lg font-semibold">
            {formatCurrency(
              (schedule[schedule.length - 1]?.cumulativePrincipal || 0) +
              (schedule[schedule.length - 1]?.cumulativeInterest || 0)
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Payments Made</p>
          <p className="text-lg font-semibold">
            {schedule.length} months
          </p>
        </div>
      </div>
    </div>
  );
}
