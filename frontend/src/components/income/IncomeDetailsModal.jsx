import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Briefcase,
  Home,
  Building,
  Wallet,
} from 'lucide-react';

const INCOME_TYPE_INFO = {
  salary: { label: 'Salary', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
  rental: { label: 'Rental', icon: Home, color: 'bg-green-100 text-green-700' },
  dividend: { label: 'Dividend', icon: TrendingUp, color: 'bg-purple-100 text-purple-700' },
  business: { label: 'Business', icon: Building, color: 'bg-orange-100 text-orange-700' },
  pension: { label: 'Pension', icon: Wallet, color: 'bg-teal-100 text-teal-700' },
  other: { label: 'Other', icon: DollarSign, color: 'bg-gray-100 text-gray-700' },
};


const IncomeDetailsModal = ({ open, onOpenChange, income }) => {
  if (!income) return null;

  const typeInfo = INCOME_TYPE_INFO[income.type] || INCOME_TYPE_INFO.other;
  const Icon = typeInfo.icon;

  // Calculate projections
  const toAnnual = (amount, frequency) => {
    const multipliers = { weekly: 52, fortnightly: 26, monthly: 12, annual: 1 };
    return amount * (multipliers[frequency] || 1);
  };

  const annualAmount = toAnnual(income.amount, income.frequency);
  const monthlyAmount = annualAmount / 12;

  // Project future values
  const projectIncome = (years) => {
    return annualAmount * Math.pow(1 + income.growth_rate / 100, years);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="income-details-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span>{income.name}</span>
              <Badge className={`ml-3 ${typeInfo.color}`}>{typeInfo.label}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Income Overview */}
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-green-100 dark:text-green-200 text-sm">Annual</p>
                  <p className="text-3xl font-bold">{formatCurrency(annualAmount)}</p>
                </div>
                <div>
                  <p className="text-green-100 dark:text-green-200 text-sm">Monthly</p>
                  <p className="text-3xl font-bold">{formatCurrency(monthlyAmount)}</p>
                </div>
                <div>
                  <p className="text-green-100 dark:text-green-200 text-sm">Growth Rate</p>
                  <p className="text-3xl font-bold">+{income.growth_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Owner</span>
                </div>
                <p className="text-lg font-semibold capitalize dark:text-white">{income.owner}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Frequency</span>
                </div>
                <p className="text-lg font-semibold capitalize dark:text-white">{income.frequency}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Taxable</span>
                </div>
                <p className="text-lg font-semibold dark:text-white">{income.is_taxable ? 'Yes' : 'No'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Until Age</span>
                </div>
                <p className="text-lg font-semibold dark:text-white">{income.end_age || 'Ongoing'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Future Projections */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Future Projections</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">5 Years</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(projectIncome(5))}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">10 Years</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(projectIncome(10))}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">15 Years</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(projectIncome(15))}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">20 Years</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(projectIncome(20))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncomeDetailsModal;
