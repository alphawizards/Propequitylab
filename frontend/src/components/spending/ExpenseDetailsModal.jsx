import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Receipt,
  TrendingUp,
  Calendar,
  PiggyBank,
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

const CATEGORY_INFO = {
  housing: { label: 'Housing', icon: Home, color: 'bg-blue-100 text-blue-700' },
  food: { label: 'Food', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  transport: { label: 'Transport', icon: Car, color: 'bg-purple-100 text-purple-700' },
  utilities: { label: 'Utilities', icon: Zap, color: 'bg-yellow-100 text-yellow-700' },
  insurance: { label: 'Insurance', icon: Shield, color: 'bg-green-100 text-green-700' },
  entertainment: { label: 'Entertainment', icon: Film, color: 'bg-pink-100 text-pink-700' },
  health: { label: 'Health', icon: Heart, color: 'bg-red-100 text-red-700' },
  education: { label: 'Education', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
  personal: { label: 'Personal', icon: User, color: 'bg-teal-100 text-teal-700' },
  subscriptions: { label: 'Subscriptions', icon: CreditCard, color: 'bg-cyan-100 text-cyan-700' },
  debt_repayment: { label: 'Debt', icon: Wallet, color: 'bg-gray-100 text-gray-700' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const ExpenseDetailsModal = ({ open, onOpenChange, expense }) => {
  if (!expense) return null;

  const categoryInfo = CATEGORY_INFO[expense.category] || CATEGORY_INFO.other;
  const Icon = categoryInfo.icon;

  // Calculate values
  const toAnnual = (amount, frequency) => {
    const multipliers = { weekly: 52, fortnightly: 26, monthly: 12, annual: 1 };
    return amount * (multipliers[frequency] || 1);
  };

  const annualAmount = toAnnual(expense.amount, expense.frequency);
  const monthlyAmount = annualAmount / 12;
  const retirementMonthly = monthlyAmount * (expense.retirement_percentage / 100);
  const retirementAnnual = retirementMonthly * 12;

  // Project future values with inflation
  const projectExpense = (years) => {
    return annualAmount * Math.pow(1 + expense.inflation_rate / 100, years);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="expense-details-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryInfo.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span>{expense.name}</span>
              <Badge className={`ml-3 ${categoryInfo.color}`}>{categoryInfo.label}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Expense Overview */}
          <Card className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-red-100 dark:text-red-200 text-sm">Annual</p>
                  <p className="text-3xl font-bold">{formatCurrency(annualAmount)}</p>
                </div>
                <div>
                  <p className="text-red-100 dark:text-red-200 text-sm">Monthly</p>
                  <p className="text-3xl font-bold">{formatCurrency(monthlyAmount)}</p>
                </div>
                <div>
                  <p className="text-red-100 dark:text-red-200 text-sm">Inflation</p>
                  <p className="text-3xl font-bold">+{expense.inflation_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retirement Planning */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-purple-500" />
                Retirement Planning
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Retirement Percentage</span>
                    <span className="font-medium">{expense.retirement_percentage}%</span>
                  </div>
                  <Progress value={expense.retirement_percentage} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <p className="text-xs text-gray-500">Retirement Monthly</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(retirementMonthly)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <p className="text-xs text-gray-500">Retirement Annual</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(retirementAnnual)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Frequency</span>
                </div>
                <p className="text-lg font-semibold capitalize">{expense.frequency}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Tax Deductible</span>
                </div>
                <p className="text-lg font-semibold">{expense.is_tax_deductible ? 'Yes' : 'No'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Future Projections */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Future Projections (with {expense.inflation_rate}% inflation)
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">5 Years</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(projectExpense(5))}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">10 Years</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(projectExpense(10))}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">15 Years</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(projectExpense(15))}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">20 Years</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(projectExpense(20))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailsModal;
