import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Home,
  Utensils,
  Car,
  Zap,
  Shield,
  Film,
  Heart,
  GraduationCap,
  User,
  CreditCard,
  Wallet,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const CATEGORY_INFO = {
  housing: { label: 'Housing', icon: Home, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  food: { label: 'Food', icon: Utensils, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  transport: { label: 'Transport', icon: Car, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  utilities: { label: 'Utilities', icon: Zap, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  insurance: { label: 'Insurance', icon: Shield, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  entertainment: { label: 'Entertainment', icon: Film, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
  health: { label: 'Health', icon: Heart, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  education: { label: 'Education', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
  personal: { label: 'Personal', icon: User, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
  subscriptions: { label: 'Subscriptions', icon: CreditCard, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
  debt_repayment: { label: 'Debt', icon: Wallet, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};


const formatFrequency = (freq) => {
  const labels = { weekly: '/wk', fortnightly: '/fn', monthly: '/mo', annual: '/yr' };
  return labels[freq] || '';
};

const ExpenseCard = ({ expense, onEdit, onDelete, onView }) => {
  const categoryInfo = CATEGORY_INFO[expense.category] || CATEGORY_INFO.other;
  const Icon = categoryInfo.icon;

  // Calculate monthly amount
  const toMonthly = (amount, frequency) => {
    const multipliers = { weekly: 4.33, fortnightly: 2.17, monthly: 1, annual: 1 / 12 };
    return amount * (multipliers[frequency] || 1);
  };

  const monthlyAmount = toMonthly(expense.amount, expense.frequency);
  const retirementAmount = monthlyAmount * (expense.retirement_percentage / 100);

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      data-testid={`expense-card-${expense.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryInfo.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{expense.name}</h3>
              <Badge variant="secondary" className={`mt-1 ${categoryInfo.color}`}>
                {categoryInfo.label}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(expense)}>
                <Eye className="w-4 h-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(expense)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              {formatCurrency(expense.amount)}{formatFrequency(expense.frequency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Monthly</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(monthlyAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">In Retirement</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              {formatCurrency(retirementAmount)} ({expense.retirement_percentage}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Inflation</span>
            <span className="text-orange-600 dark:text-orange-400">
              +{expense.inflation_rate}%/yr
            </span>
          </div>
        </div>

        {expense.is_tax_deductible && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Tax Deductible
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;
