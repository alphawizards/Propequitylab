import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { Plus, Trash2, CreditCard, Home, Car, Utensils, Heart, Tv, GraduationCap } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Housing', icon: Home },
  { value: 'food', label: 'Food & Dining', icon: Utensils },
  { value: 'transport', label: 'Transport', icon: Car },
  { value: 'utilities', label: 'Utilities', icon: Home },
  { value: 'insurance', label: 'Insurance', icon: Heart },
  { value: 'entertainment', label: 'Entertainment', icon: Tv },
  { value: 'health', label: 'Health', icon: Heart },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'personal', label: 'Personal', icon: CreditCard },
  { value: 'other', label: 'Other', icon: CreditCard },
];

const SpendingStep = ({ data, updateData, onNext, isLoading }) => {
  const [addError, setAddError] = useState('');
  const [newExpense, setNewExpense] = useState({
    name: '',
    category: 'housing',
    amount: '',
    frequency: 'monthly',
    retirement_percentage: 100,
  });

  const addExpense = () => {
    if (!newExpense.name.trim()) { setAddError('Name is required'); return; }
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) { setAddError('Amount must be greater than 0'); return; }
    setAddError('');
    updateData({
      expenses: [
        ...data.expenses,
        { ...newExpense, id: Date.now(), amount: parseFloat(newExpense.amount) },
      ],
    });
    setNewExpense({ name: '', category: 'housing', amount: '', frequency: 'monthly', retirement_percentage: 100 });
  };

  const removeExpense = (id) => {
    updateData({
      expenses: data.expenses.filter((e) => e.id !== id),
    });
  };

  const totalAnnualExpenses = data.expenses.reduce((sum, expense) => {
    const multiplier = {
      weekly: 52,
      fortnightly: 26,
      monthly: 12,
      annual: 1,
    }[expense.frequency] || 1;
    return sum + expense.amount * multiplier;
  }, 0);

  // Quick add presets
  const quickAddPresets = [
    { name: 'Rent/Mortgage', category: 'housing', amount: 2000, frequency: 'monthly' },
    { name: 'Groceries', category: 'food', amount: 800, frequency: 'monthly' },
    { name: 'Car Expenses', category: 'transport', amount: 400, frequency: 'monthly' },
    { name: 'Utilities', category: 'utilities', amount: 300, frequency: 'monthly' },
  ];

  const handleQuickAdd = (preset) => {
    updateData({
      expenses: [
        ...data.expenses,
        { ...preset, id: Date.now(), retirement_percentage: 100 },
      ],
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Your Spending</h1>
        <p className="text-muted-foreground">Track your expenses to understand your savings rate.</p>
      </div>
      
      {/* Spending Summary */}
      <Card className="mb-6 bg-gradient-to-r from-terra-50 to-gold-50 border-terra-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Annual Spending</p>
              <p className="text-3xl font-semibold tabular-nums text-foreground">
                ${totalAnnualExpenses.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-terra-100 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-terra-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Add */}
      {data.expenses.length === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Add Common Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickAddPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:bg-sage-50 hover:border-sage-500"
                  onClick={() => handleQuickAdd(preset)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">${preset.amount}/{preset.frequency}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Existing Expenses */}
      {data.expenses.length > 0 && (
        <div className="space-y-3 mb-6">
          {data.expenses.map((expense) => {
            const CategoryIcon = EXPENSE_CATEGORIES.find((c) => c.value === expense.category)?.icon || CreditCard;
            return (
              <Card key={expense.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {expense.category} • {expense.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-foreground">
                      ${expense.amount.toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExpense(expense.id)}
                      className="text-terra-500 hover:text-terra-700 hover:bg-terra-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Add New Expense */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expense Name</Label>
              <Input
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                placeholder="e.g., Internet"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newExpense.category}
                onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="100"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={newExpense.frequency}
                onValueChange={(v) => setNewExpense({ ...newExpense, frequency: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {addError && <p className="text-xs text-terra-600">{addError}</p>}
          <Button
            onClick={addExpense}
            variant="outline"
            className="w-full hover:bg-sage-50 hover:border-sage-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => onNext()} className="text-muted-foreground">
          Skip for now
        </Button>
        <Button
          onClick={onNext}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default SpendingStep;
