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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DollarSign, TrendingUp } from 'lucide-react';

const INCOME_TYPES = [
  { value: 'salary', label: 'Salary' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'dividend', label: 'Dividends' },
  { value: 'business', label: 'Business Income' },
  { value: 'pension', label: 'Pension' },
  { value: 'other', label: 'Other' },
];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const OWNERS = [
  { value: 'you', label: 'You' },
  { value: 'partner', label: 'Partner' },
  { value: 'joint', label: 'Joint' },
];

const IncomeFormModal = ({ open, onOpenChange, income, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'salary',
    owner: 'you',
    amount: '',
    frequency: 'annual',
    growth_rate: 3.0,
    end_age: '',
    is_taxable: true,
  });

  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (income) {
      setFormData({
        name: income.name || '',
        type: income.type || 'salary',
        owner: income.owner || 'you',
        amount: income.amount || '',
        frequency: income.frequency || 'annual',
        growth_rate: income.growth_rate || 3.0,
        end_age: income.end_age || '',
        is_taxable: income.is_taxable !== false,
      });
    } else {
      setFormData({
        name: '',
        type: 'salary',
        owner: 'you',
        amount: '',
        frequency: 'annual',
        growth_rate: 3.0,
        end_age: '',
        is_taxable: true,
      });
    }
    setActiveTab('basic');
  }, [income, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      growth_rate: parseFloat(formData.growth_rate) || 0,
      end_age: formData.end_age ? parseInt(formData.end_age) : null,
    });
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="income-form-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            {income ? 'Edit Income Source' : 'Add Income Source'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Basic
              </TabsTrigger>
              <TabsTrigger value="growth" className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Growth & Tax
              </TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Income Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Primary Salary"
                  required
                  data-testid="income-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => updateField('type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Owner</Label>
                  <Select value={formData.owner} onValueChange={(v) => updateField('owner', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OWNERS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    placeholder="100000"
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

            {/* Growth & Tax Tab */}
            <TabsContent value="growth" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="growth_rate">Annual Growth Rate (%)</Label>
                <Input
                  id="growth_rate"
                  type="number"
                  value={formData.growth_rate}
                  onChange={(e) => updateField('growth_rate', e.target.value)}
                  placeholder="3.0"
                  step="0.1"
                />
                <p className="text-xs text-gray-500">Expected annual increase in this income</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_age">Income Until Age (optional)</Label>
                <Input
                  id="end_age"
                  type="number"
                  value={formData.end_age}
                  onChange={(e) => updateField('end_age', e.target.value)}
                  placeholder="65"
                  min="0"
                  max="120"
                />
                <p className="text-xs text-gray-500">Leave blank for ongoing income</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Taxable Income</Label>
                  <p className="text-xs text-gray-500">Subject to income tax</p>
                </div>
                <Switch
                  checked={formData.is_taxable}
                  onCheckedChange={(checked) => updateField('is_taxable', checked)}
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
              data-testid="submit-income-btn"
            >
              {income ? 'Update Income' : 'Add Income'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncomeFormModal;
