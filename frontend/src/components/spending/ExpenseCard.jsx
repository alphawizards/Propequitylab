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
  housing: { label: 'Housing', icon: Home, color: 'bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean' },
  food: { label: 'Food', icon: Utensils, color: 'bg-gold/10 text-gold dark:bg-gold/20 dark:text-gold' },
  transport: { label: 'Transport', icon: Car, color: 'bg-plum/10 text-plum dark:bg-plum/20 dark:text-plum' },
  utilities: { label: 'Utilities', icon: Zap, color: 'bg-gold/10 text-gold dark:bg-gold/20 dark:text-gold' },
  insurance: { label: 'Insurance', icon: Shield, color: 'bg-sage/10 text-sage dark:bg-sage/20 dark:text-sage' },
  entertainment: { label: 'Entertainment', icon: Film, color: 'bg-plum/10 text-plum dark:bg-plum/20 dark:text-plum' },
  health: { label: 'Health', icon: Heart, color: 'bg-terra/10 text-terra dark:bg-terra/20 dark:text-terra' },
  education: { label: 'Education', icon: GraduationCap, color: 'bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean' },
  personal: { label: 'Personal', icon: User, color: 'bg-sage/10 text-sage dark:bg-sage/20 dark:text-sage' },
  subscriptions: { label: 'Subscriptions', icon: CreditCard, color: 'bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean' },
  debt_repayment: { label: 'Debt', icon: Wallet, color: 'bg-muted text-muted-foreground' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'bg-muted text-muted-foreground' },
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
      className="hover:shadow-card-hover transition-all duration-150 hover:-translate-y-px cursor-pointer group"
      data-testid={`expense-card-${expense.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryInfo.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111111] dark:text-white">{expense.name}</h3>
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
              <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold text-lg tabular-nums text-[#111111] dark:text-white">
              {formatCurrency(expense.amount)}{formatFrequency(expense.frequency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monthly</span>
            <span className="text-foreground">
              {formatCurrency(monthlyAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">In Retirement</span>
            <span className="text-plum font-medium">
              {formatCurrency(retirementAmount)} ({expense.retirement_percentage}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Inflation</span>
            <span className="text-gold">
              +{expense.inflation_rate}%/yr
            </span>
          </div>
        </div>

        {expense.is_tax_deductible && (
          <div className="mt-4 pt-3 border-t border-border">
            <Badge variant="secondary" className="bg-sage/10 text-sage dark:bg-sage/20 dark:text-sage">
              Tax Deductible
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;
