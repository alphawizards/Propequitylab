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
import { formatCurrencyMillions, formatCurrencyFull } from '../../utils/formatCurrency';

const ForecastTable = ({ data, viewType, onYearSelect, selectedYear }) => {
  // Use formatCurrencyMillions for equity view, formatCurrencyFull for cashflow view
  const formatValue = (value, inMillions = true) => {
    return inMillions ? formatCurrencyMillions(value) : formatCurrencyFull(value);
  };


  return (
    <div className="bg-card rounded-2xl border border-border mt-6">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Portfolio Forecast</h3>
        <p className="text-sm text-muted-foreground">Click on a year to view detailed projections</p>
      </div>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted">
            <TableRow>
              <TableHead className="font-semibold text-foreground">Year</TableHead>
              {viewType === 'equity' ? (
                <>
                  <TableHead className="font-semibold text-foreground text-right">Total Value</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Debt</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Equity</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Gross Yield</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Net Yield</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="font-semibold text-foreground text-right">Rental Income</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Expenses</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Loan Payments</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Net Cashflow</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row.year}
                className={`cursor-pointer transition-colors hover:bg-sage/5 ${selectedYear === row.year ? 'bg-sage/10' : ''
                  }`}
                onClick={() => onYearSelect(row.year)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className={selectedYear === row.year ? 'text-primary' : 'text-foreground'}>
                      {row.fiscalYear}
                    </span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </TableCell>
                {viewType === 'equity' ? (
                  <>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatValue(row.totalValue)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatValue(row.debt)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sage">
                      {formatValue(row.equity)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.grossYield}%
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.netYield}%
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-right text-sage">
                      {formatValue(row.rentalIncome, false)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatValue(row.expenses, false)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatValue(row.loanPayments, false)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${row.cashflow >= 0 ? 'text-sage' : 'text-destructive'
                      }`}>
                      {formatValue(row.cashflow, false)}
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
