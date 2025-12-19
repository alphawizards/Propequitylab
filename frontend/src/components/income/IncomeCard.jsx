import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Briefcase,
  Home,
  TrendingUp,
  Building,
  Wallet,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const INCOME_TYPE_INFO = {
  salary: { label: 'Salary', icon: Briefcase, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  rental: { label: 'Rental', icon: Home, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  dividend: { label: 'Dividend', icon: TrendingUp, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  business: { label: 'Business', icon: Building, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  pension: { label: 'Pension', icon: Wallet, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
  other: { label: 'Other', icon: DollarSign, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

const OWNER_LABELS = {
  you: 'You',
  partner: 'Partner',
  joint: 'Joint',
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatFrequency = (freq) => {
  const labels = { weekly: '/wk', fortnightly: '/fn', monthly: '/mo', annual: '/yr' };
  return labels[freq] || '';
};

const IncomeCard = ({ income, onEdit, onDelete, onView }) => {
  const typeInfo = INCOME_TYPE_INFO[income.type] || INCOME_TYPE_INFO.other;
  const Icon = typeInfo.icon;

  // Calculate monthly amount
  const toMonthly = (amount, frequency) => {
    const multipliers = { weekly: 4.33, fortnightly: 2.17, monthly: 1, annual: 1/12 };
    return amount * (multipliers[frequency] || 1);
  };

  const monthlyAmount = toMonthly(income.amount, income.frequency);

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      data-testid={`income-card-${income.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{income.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={typeInfo.color}>
                  {typeInfo.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {OWNER_LABELS[income.owner] || income.owner}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(income)}>
                <Eye className="w-4 h-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(income)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(income.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              {formatCurrency(income.amount)}{formatFrequency(income.frequency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Monthly</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(monthlyAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Growth Rate</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              +{income.growth_rate}%/yr
            </span>
          </div>
          {income.end_age && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Until Age</span>
              <span className="text-gray-700 dark:text-gray-300">{income.end_age}</span>
            </div>
          )}
        </div>

        {income.is_taxable && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              Taxable Income
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeCard;
