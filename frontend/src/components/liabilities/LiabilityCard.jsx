import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Percent,
  CreditCard,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const LiabilityCard = ({ liability, onView, onEdit, onDelete }) => {
  const paidOff = liability.original_amount - liability.current_balance;
  const paidPercent = liability.original_amount > 0
    ? ((paidOff / liability.original_amount) * 100).toFixed(0)
    : 0;

  const getLiabilityLabel = (type) => {
    const labels = {
      car_loan: 'Car Loan',
      credit_card: 'Credit Card',
      hecs: 'HECS/HELP',
      personal_loan: 'Personal Loan',
      margin_loan: 'Margin Loan',
      buy_now_pay_later: 'BNPL',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getStrategyBadgeColor = (strategy) => {
    switch (strategy) {
      case 'aggressive':
        return 'bg-red-100 text-red-700';
      case 'custom':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Calculate monthly payment based on frequency
  const monthlyPayment = liability.minimum_payment * ({
    weekly: 52 / 12,
    fortnightly: 26 / 12,
    monthly: 1,
  }[liability.payment_frequency] || 1);

  return (
    <Card className="overflow-hidden hover:shadow-card-hover transition-all duration-150 hover:-translate-y-px group">
      {/* Liability Header */}
      <div className="h-32 bg-slate-50 relative border-b border-[#EAEAEA]">
        <div className="absolute inset-0 flex items-center justify-center">
          <CreditCard className="w-12 h-12 text-slate-200" />
        </div>

        {/* Liability Type Badge */}
        <Badge className="absolute top-3 left-3 bg-white text-gray-700">
          {getLiabilityLabel(liability.type)}
        </Badge>

        {/* Tax Deductible Badge */}
        {liability.is_tax_deductible && (
          <Badge className="absolute top-3 right-12 bg-green-100 text-green-700">
            Tax Deductible
          </Badge>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-4">
        {/* Liability Name */}
        <h3 className="font-semibold text-[#111111] truncate mb-1">{liability.name}</h3>
        {liability.lender && (
          <p className="text-sm text-[#6B7280] mb-3 truncate">{liability.lender}</p>
        )}

        {/* Current Balance */}
        <div className="mb-4">
          <p className="text-2xl font-semibold tabular-nums text-red-500">
            {formatCurrency(liability.current_balance)}
          </p>
          <p className="text-sm text-[#6B7280]">
            of {formatCurrency(liability.original_amount)} original
          </p>
        </div>

        {/* Payoff Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#6B7280]">Paid Off</span>
            <span className="font-medium text-emerald-600">{paidPercent}%</span>
          </div>
          <Progress value={parseFloat(paidPercent)} className="h-2" />
        </div>

        {/* Financials Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <p className="text-xs text-[#6B7280]">Interest Rate</p>
            <p className="font-semibold text-[#111111] tabular-nums flex items-center gap-1">
              <Percent className="w-3 h-3 text-orange-500" />
              {liability.interest_rate}%
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Monthly Payment</p>
            <p className="font-semibold text-[#111111] tabular-nums">
              ${monthlyPayment.toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Owner</p>
            <p className="font-semibold text-[#111111] capitalize">
              {liability.owner === 'you' ? 'You' : liability.owner === 'partner' ? 'Partner' : 'Joint'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Strategy</p>
            <Badge className={`text-xs ${getStrategyBadgeColor(liability.payoff_strategy)}`}>
              {liability.payoff_strategy === 'aggressive' ? 'Aggressive' :
                liability.payoff_strategy === 'custom' ? 'Custom' : 'Minimum'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiabilityCard;
