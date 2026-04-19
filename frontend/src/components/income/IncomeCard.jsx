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
  salary: { label: 'Salary', icon: Briefcase, color: 'bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean' },
  rental: { label: 'Rental', icon: Home, color: 'bg-sage/10 text-sage dark:bg-sage/20 dark:text-sage' },
  dividend: { label: 'Dividend', icon: TrendingUp, color: 'bg-plum/10 text-plum dark:bg-plum/20 dark:text-plum' },
  business: { label: 'Business', icon: Building, color: 'bg-gold/10 text-gold dark:bg-gold/20 dark:text-gold' },
  pension: { label: 'Pension', icon: Wallet, color: 'bg-sage/10 text-sage dark:bg-sage/20 dark:text-sage' },
  other: { label: 'Other', icon: DollarSign, color: 'bg-muted text-muted-foreground' },
};

const OWNER_LABELS = {
  you: 'You',
  partner: 'Partner',
  joint: 'Joint',
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
    const multipliers = { weekly: 4.33, fortnightly: 2.17, monthly: 1, annual: 1 / 12 };
    return amount * (multipliers[frequency] || 1);
  };

  const monthlyAmount = toMonthly(income.amount, income.frequency);

  return (
    <Card
      className="hover:shadow-card-hover transition-all duration-150 hover:-translate-y-px cursor-pointer group"
      data-testid={`income-card-${income.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111111] dark:text-white">{income.name}</h3>
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
              <DropdownMenuItem onClick={() => onDelete(income.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280] dark:text-muted-foreground">Amount</span>
            <span className="font-semibold text-lg tabular-nums text-[#111111] dark:text-white">
              {formatCurrency(income.amount)}{formatFrequency(income.frequency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280] dark:text-muted-foreground">Monthly</span>
            <span className="text-foreground dark:text-foreground">
              {formatCurrency(monthlyAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280] dark:text-muted-foreground">Growth Rate</span>
            <span className="text-sage font-medium">
              +{income.growth_rate}%/yr
            </span>
          </div>
          {income.end_age && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B7280] dark:text-muted-foreground">Until Age</span>
              <span className="text-foreground">{income.end_age}</span>
            </div>
          )}
        </div>

        {income.is_taxable && (
          <div className="mt-4 pt-3 border-t border-border">
            <Badge variant="secondary" className="bg-gold/10 text-gold">
              Taxable Income
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeCard;
