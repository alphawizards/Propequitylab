import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { formatCurrency } from '../../utils/formatCurrency';
import { Pencil, CreditCard, Receipt, Target, Calendar, Percent } from 'lucide-react';

const LiabilityDetailsModal = ({ isOpen, onClose, liability, onEdit }) => {
  if (!liability) return null;

  const paidOff = liability.original_amount - liability.current_balance;
  const paidPercent = liability.original_amount > 0
    ? ((paidOff / liability.original_amount) * 100).toFixed(1)
    : 0;

  const getLiabilityIcon = (type) => {
    const icons = {
      car_loan: '🚗',
      credit_card: '💳',
      hecs: '🎓',
      personal_loan: '💰',
      margin_loan: '📈',
      buy_now_pay_later: '🛝',
      other: '💸',
    };
    return icons[type] || '💸';
  };

  const getLiabilityLabel = (type) => {
    const labels = {
      car_loan: 'Car Loan',
      credit_card: 'Credit Card',
      hecs: 'HECS/HELP',
      personal_loan: 'Personal Loan',
      margin_loan: 'Margin Loan',
      buy_now_pay_later: 'Buy Now Pay Later',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getStrategyLabel = (strategy) => {
    const labels = {
      minimum: 'Minimum Payments',
      aggressive: 'Aggressive Payoff',
      custom: 'Custom Plan',
    };
    return labels[strategy] || strategy;
  };

  // Calculate monthly payment
  const monthlyPayment = (liability.minimum_payment + (liability.extra_payment || 0)) * ({
    weekly: 52 / 12,
    fortnightly: 26 / 12,
    monthly: 1,
  }[liability.payment_frequency] || 1);

  // Estimate months to payoff (simple calculation)
  const monthsToPayoff = monthlyPayment > 0 && liability.current_balance > 0
    ? Math.ceil(liability.current_balance / monthlyPayment)
    : 0;

  // Annual interest cost
  const annualInterest = (liability.current_balance * (liability.interest_rate / 100));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getLiabilityIcon(liability.type)}</span>
              <div>
                <DialogTitle className="text-xl">{liability.name}</DialogTitle>
                <p className="text-sm text-gray-500">{getLiabilityLabel(liability.type)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(liability.current_balance)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(paidOff)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Interest Rate</p>
                <p className="text-xl font-bold text-orange-600">
                  {liability.interest_rate}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Monthly Payment</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(monthlyPayment)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payoff Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Payoff Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-green-600">{paidPercent}% paid off</span>
                </div>
                <Progress value={parseFloat(paidPercent)} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{formatCurrency(paidOff)} paid</span>
                  <span className="text-gray-500">{formatCurrency(liability.current_balance)} remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liability Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Liability Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{getLiabilityLabel(liability.type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium capitalize">
                  {liability.owner === 'you' ? 'You' : liability.owner === 'partner' ? 'Partner' : 'Joint'}
                </p>
              </div>
              {liability.lender && (
                <div>
                  <p className="text-sm text-gray-500">Lender</p>
                  <p className="font-medium">{liability.lender}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Original Amount</p>
                <p className="font-medium">{formatCurrency(liability.original_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax Deductible</p>
                <Badge variant={liability.is_tax_deductible ? "default" : "outline"}>
                  {liability.is_tax_deductible ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Annual Interest Cost</p>
                <p className="font-medium text-orange-600">{formatCurrency(annualInterest)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Repayment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Repayment Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Minimum Payment</p>
                <p className="font-medium">
                  {formatCurrency(liability.minimum_payment)} / {liability.payment_frequency}
                </p>
              </div>
              {liability.extra_payment > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Extra Payment</p>
                  <p className="font-medium text-green-600">
                    +{formatCurrency(liability.extra_payment)} / {liability.payment_frequency}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Strategy</p>
                <Badge variant="outline">{getStrategyLabel(liability.payoff_strategy)}</Badge>
              </div>
              {monthsToPayoff > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Est. Payoff Time</p>
                  <p className="font-medium">
                    {monthsToPayoff > 12
                      ? `${Math.floor(monthsToPayoff / 12)} years ${monthsToPayoff % 12} months`
                      : `${monthsToPayoff} months`
                    }
                  </p>
                </div>
              )}
              {liability.target_payoff_date && (
                <div>
                  <p className="text-sm text-gray-500">Target Payoff Date</p>
                  <p className="font-medium">
                    {new Date(liability.target_payoff_date).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HECS-specific details */}
          {liability.type === 'hecs' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  🎓 HECS/HELP Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Indexed to Inflation</p>
                  <Badge variant={liability.is_indexed ? "default" : "outline"}>
                    {liability.is_indexed ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {liability.repayment_threshold > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Repayment Threshold</p>
                    <p className="font-medium">{formatCurrency(liability.repayment_threshold)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {liability.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{liability.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiabilityDetailsModal;
