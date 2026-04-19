import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  User,
  DollarSign,
  CreditCard,
  PiggyBank,
  Target,
  CheckCircle,
  AlertCircle,
  Rocket,
  Pencil,
} from 'lucide-react';

const SummaryStep = ({ data, onComplete, isLoading, goToStep }) => {
  // Calculate totals
  const totalAnnualIncome = data.income_sources.reduce((sum, income) => {
    const multiplier = { weekly: 52, fortnightly: 26, monthly: 12, annual: 1 }[income.frequency] || 1;
    return sum + income.amount * multiplier;
  }, 0);

  const totalAnnualExpenses = data.expenses.reduce((sum, expense) => {
    const multiplier = { weekly: 52, fortnightly: 26, monthly: 12, annual: 1 }[expense.frequency] || 1;
    return sum + expense.amount * multiplier;
  }, 0);

  const totalAssets = data.other_assets.reduce((sum, asset) => sum + asset.current_value, 0);
  const totalLiabilities = data.liabilities.reduce((sum, l) => sum + l.current_balance, 0);
  const savingsRate = totalAnnualIncome > 0 
    ? ((totalAnnualIncome - totalAnnualExpenses) / totalAnnualIncome * 100).toFixed(1)
    : 0;

  const sections = [
    {
      title: 'Personal Details',
      icon: User,
      color: 'bg-ocean/10 text-ocean',
      items: [
        { label: 'Name', value: data.name || 'Not set' },
        { label: 'Planning Type', value: data.planning_type === 'couple' ? 'Couple' : 'Individual' },
        { label: 'Location', value: `${data.state}, ${data.country}` },
      ],
      complete: !!data.name,
    },
    {
      title: 'Income',
      icon: DollarSign,
      color: 'bg-sage/10 text-sage',
      items: [
        { label: 'Income Sources', value: data.income_sources.length.toString() },
        { label: 'Annual Income', value: `$${totalAnnualIncome.toLocaleString()}` },
      ],
      complete: data.income_sources.length > 0,
    },
    {
      title: 'Spending',
      icon: CreditCard,
      color: 'bg-terra/10 text-terra',
      items: [
        { label: 'Expense Categories', value: data.expenses.length.toString() },
        { label: 'Annual Expenses', value: `$${totalAnnualExpenses.toLocaleString()}` },
        { label: 'Savings Rate', value: `${savingsRate}%` },
      ],
      complete: data.expenses.length > 0,
    },
    {
      title: 'Assets',
      icon: PiggyBank,
      color: 'bg-plum/10 text-plum',
      items: [
        { label: 'Asset Accounts', value: data.other_assets.length.toString() },
        { label: 'Total Value', value: `$${totalAssets.toLocaleString()}` },
      ],
      complete: data.other_assets.length > 0,
    },
    {
      title: 'Liabilities',
      icon: CreditCard,
      color: 'bg-gold/10 text-gold',
      items: [
        { label: 'Debt Accounts', value: data.liabilities.length.toString() },
        { label: 'Total Debt', value: `$${totalLiabilities.toLocaleString()}` },
      ],
      complete: true, // Can be 0
    },
    {
      title: 'Goals',
      icon: Target,
      color: 'bg-sage/10 text-sage',
      items: [
        { label: 'Retirement Age', value: data.retirement_age.toString() },
        { label: 'Target Net Worth', value: `$${(data.target_equity / 1000000).toFixed(1)}M` },
        { label: 'Target Income', value: `$${(data.target_passive_income / 1000).toFixed(0)}K/year` },
      ],
      complete: true,
    },
  ];

  const completedSections = sections.filter(s => s.complete).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-[#111111] mb-2">You're All Set!</h1>
        <p className="text-[#6B7280]">Here's a summary of your financial profile.</p>
      </div>
      
      {/* Progress indicator */}
      <Card className="mb-6 bg-gradient-to-r from-sage/5 to-sage/10 border-sage/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-primary" />
              <span className="font-medium text-[#111111]">
                {completedSections} of {sections.length} sections completed
              </span>
            </div>
            <span className="text-sm text-[#6B7280]">
              You can always add more later
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <div className="space-y-4 mb-8">
        {sections.map((section, index) => (
          <Card key={section.title}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.color}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#111111]">{section.title}</h3>
                    <div className="flex items-center gap-2">
                      {section.complete ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gold" />
                      )}
                      {goToStep && (
                        <button
                          onClick={() => goToStep(index + 1)}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item) => (
                      <div key={item.label}>
                        <p className="text-xs text-[#6B7280]">{item.label}</p>
                        <p className="text-sm font-medium text-[#111111]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Net Worth Preview */}
      <Card className="mb-8 bg-gradient-to-br from-foreground/90 to-foreground/80 text-background border-0">
        <CardContent className="p-6">
          <h3 className="text-sm text-background/60 mb-2">Current Net Worth (estimated)</h3>
          <p className="text-4xl font-semibold tabular-nums text-primary">
            ${(totalAssets - totalLiabilities).toLocaleString()}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-background/20">
            <div>
              <p className="text-sm text-background/60">Assets</p>
              <p className="text-xl font-semibold text-sage">${totalAssets.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-background/60">Liabilities</p>
              <p className="text-xl font-semibold text-terra">${totalLiabilities.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button 
          onClick={onComplete}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};

export default SummaryStep;
