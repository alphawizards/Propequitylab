import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Receipt, PiggyBank } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Housing' },
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'personal', label: 'Personal' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'debt_repayment', label: 'Debt Repayment' },
  { value: 'other', label: 'Other' },
];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const ExpenseFormModal = ({ open, onOpenChange, expense, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    amount: '',
    frequency: 'monthly',
    inflation_rate: 2.5,
    retirement_percentage: 100,
    is_tax_deductible: false,
  });

  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name || '',
        category: expense.category || 'other',
        amount: expense.amount || '',
        frequency: expense.frequency || 'monthly',
        inflation_rate: expense.inflation_rate || 2.5,
        retirement_percentage: expense.retirement_percentage || 100,
        is_tax_deductible: expense.is_tax_deductible || false,
      });
    } else {
      setFormData({
        name: '',
        category: 'other',
        amount: '',
        frequency: 'monthly',
        inflation_rate: 2.5,
        retirement_percentage: 100,
        is_tax_deductible: false,
      });
    }
    setActiveTab('basic');
  }, [expense, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      inflation_rate: parseFloat(formData.inflation_rate) || 2.5,
      retirement_percentage: parseFloat(formData.retirement_percentage) || 100,
    });
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="expense-form-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-500" />
            {expense ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Receipt className="w-4 h-4" /> Basic
              </TabsTrigger>
              <TabsTrigger value="retirement" className="flex items-center gap-1">
                <PiggyBank className="w-4 h-4" /> Retirement
              </TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expense Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Rent, Groceries"
                  required
                  data-testid="expense-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    placeholder="500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(v) => updateField('frequency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Retirement Tab */}
            <TabsContent value="retirement" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Retirement Percentage: {formData.retirement_percentage}%</Label>
                  <p className="text-xs text-gray-500 mb-2">How much of this expense will remain in retirement?</p>
                  <Slider
                    value={[formData.retirement_percentage]}
                    onValueChange={([value]) => updateField('retirement_percentage', value)}
                    min={0}
                    max={150}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0% (Gone)</span>
                    <span>100% (Same)</span>
                    <span>150% (More)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inflation_rate">Inflation Rate (%)</Label>
                <Input
                  id="inflation_rate"
                  type="number"
                  value={formData.inflation_rate}
                  onChange={(e) => updateField('inflation_rate', e.target.value)}
                  placeholder="2.5"
                  step="0.1"
                />
                <p className="text-xs text-gray-500">Expected annual increase due to inflation</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Tax Deductible</Label>
                  <p className="text-xs text-gray-500">Can claim as a tax deduction</p>
                </div>
                <Switch
                  checked={formData.is_tax_deductible}
                  onCheckedChange={(checked) => updateField('is_tax_deductible', checked)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-lime-400 text-gray-900 hover:bg-lime-500"
              data-testid="submit-expense-btn"
            >
              {expense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormModal;
