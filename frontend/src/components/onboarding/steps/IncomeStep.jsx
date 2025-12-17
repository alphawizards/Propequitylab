import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Plus, Trash2, DollarSign, Briefcase, Home, TrendingUp } from 'lucide-react';

const INCOME_TYPES = [
  { value: 'salary', label: 'Salary/Wages', icon: Briefcase },
  { value: 'rental', label: 'Rental Income', icon: Home },
  { value: 'business', label: 'Business Income', icon: TrendingUp },
  { value: 'dividend', label: 'Dividends', icon: DollarSign },
  { value: 'pension', label: 'Pension', icon: DollarSign },
  { value: 'other', label: 'Other', icon: DollarSign },
];

const IncomeStep = ({ data, updateData, onNext, isLoading }) => {
  const [newIncome, setNewIncome] = useState({
    name: '',
    type: 'salary',
    amount: '',
    frequency: 'annual',
    growth_rate: 3,
    owner: 'you',
  });

  const addIncome = () => {
    if (newIncome.name && newIncome.amount) {
      updateData({
        income_sources: [
          ...data.income_sources,
          { ...newIncome, id: Date.now(), amount: parseFloat(newIncome.amount) },
        ],
      });
      setNewIncome({
        name: '',
        type: 'salary',
        amount: '',
        frequency: 'annual',
        growth_rate: 3,
        owner: 'you',
      });
    }
  };

  const removeIncome = (id) => {
    updateData({
      income_sources: data.income_sources.filter((i) => i.id !== id),
    });
  };

  const totalAnnualIncome = data.income_sources.reduce((sum, income) => {
    const multiplier = {
      weekly: 52,
      fortnightly: 26,
      monthly: 12,
      annual: 1,
    }[income.frequency] || 1;
    return sum + income.amount * multiplier;
  }, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Income</h1>
        <p className="text-gray-600">Add all your income sources to get accurate projections.</p>
      </div>
      
      {/* Income Summary */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-lime-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Annual Income</p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalAnnualIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Existing Income Sources */}
      {data.income_sources.length > 0 && (
        <div className="space-y-3 mb-6">
          {data.income_sources.map((income) => {
            const TypeIcon = INCOME_TYPES.find((t) => t.value === income.type)?.icon || DollarSign;
            return (
              <Card key={income.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{income.name}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {income.type} • {income.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-gray-900">
                      ${income.amount.toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIncome(income.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
      
      {/* Add New Income */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Income Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Income Name</Label>
              <Input
                value={newIncome.name}
                onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                placeholder="e.g., Primary Job"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newIncome.type}
                onValueChange={(v) => setNewIncome({ ...newIncome, type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                placeholder="120000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={newIncome.frequency}
                onValueChange={(v) => setNewIncome({ ...newIncome, frequency: v })}
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
            <div>
              <Label>Growth Rate (%)</Label>
              <Input
                type="number"
                step="0.5"
                value={newIncome.growth_rate}
                onChange={(e) => setNewIncome({ ...newIncome, growth_rate: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button
            onClick={addIncome}
            variant="outline"
            className="w-full hover:bg-lime-50 hover:border-lime-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => onNext()} className="text-gray-500">
          Skip for now
        </Button>
        <Button 
          onClick={onNext}
          className="bg-lime-400 text-gray-900 hover:bg-lime-500 px-8"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default IncomeStep;
