import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

const ForecastTable = ({ data, viewType, onYearSelect, selectedYear }) => {
  const formatCurrency = (value, inMillions = true) => {
    if (inMillions) {
      return `$${value.toFixed(2)}m`;
    }
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 mt-6">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Portfolio Forecast</h3>
        <p className="text-sm text-gray-500">Click on a year to view detailed projections</p>
      </div>
      
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Year</TableHead>
              {viewType === 'equity' ? (
                <>
                  <TableHead className="font-semibold text-gray-700 text-right">Total Value</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Debt</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Equity</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Gross Yield</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Net Yield</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="font-semibold text-gray-700 text-right">Rental Income</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Expenses</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Loan Payments</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Net Cashflow</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row.year}
                className={`cursor-pointer transition-colors hover:bg-lime-50 ${
                  selectedYear === row.year ? 'bg-lime-100' : ''
                }`}
                onClick={() => onYearSelect(row.year)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className={selectedYear === row.year ? 'text-lime-700' : 'text-gray-900'}>
                      {row.fiscalYear}
                    </span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 text-xs bg-lime-400 text-gray-900 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </TableCell>
                {viewType === 'equity' ? (
                  <>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatCurrency(row.totalValue)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatCurrency(row.debt)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(row.equity)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {row.grossYield}%
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {row.netYield}%
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(row.rentalIncome, false)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatCurrency(row.expenses, false)}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {formatCurrency(row.loanPayments, false)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      row.cashflow >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {formatCurrency(row.cashflow, false)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ForecastTable;
