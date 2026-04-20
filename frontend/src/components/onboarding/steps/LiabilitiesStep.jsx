import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Plus, Trash2, CreditCard, Car, GraduationCap, Wallet, AlertCircle, Home, TrendingUp, Building } from 'lucide-react';

const LIABILITY_TYPES = [
  { value: 'mortgage', label: 'Mortgage (PPOR)', icon: Home },
  { value: 'investment_loan', label: 'Investment Property Loan', icon: Building },
  { value: 'car_loan', label: 'Car Loan', icon: Car },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'hecs', label: 'HECS/HELP', icon: GraduationCap },
  { value: 'personal_loan', label: 'Personal Loan', icon: Wallet },
  { value: 'margin_loan', label: 'Margin Loan', icon: TrendingUp },
  { value: 'buy_now_pay_later', label: 'Buy Now Pay Later', icon: CreditCard },
  { value: 'other', label: 'Other Debt', icon: AlertCircle },
];

const LiabilitiesStep = ({ data, updateData, onNext, isLoading }) => {
  const [addError, setAddError] = useState('');
  const [newLiability, setNewLiability] = useState({
    name: '',
    type: 'mortgage',
    original_amount: '',
    current_balance: '',
    interest_rate: '',
    minimum_payment: '',
    payment_frequency: 'monthly',
  });

  const addLiability = () => {
    if (!newLiability.name.trim()) { setAddError('Name is required'); return; }
    if (!newLiability.current_balance || parseFloat(newLiability.current_balance) <= 0) { setAddError('Current balance must be greater than 0'); return; }
    setAddError('');
    updateData({
      liabilities: [
        ...data.liabilities,
        {
          ...newLiability,
          id: Date.now(),
          original_amount: parseFloat(newLiability.original_amount) || parseFloat(newLiability.current_balance),
          current_balance: parseFloat(newLiability.current_balance),
          interest_rate: parseFloat(newLiability.interest_rate) || 0,
          minimum_payment: parseFloat(newLiability.minimum_payment) || 0,
        },
      ],
    });
    setNewLiability({ name: '', type: 'mortgage', original_amount: '', current_balance: '', interest_rate: '', minimum_payment: '', payment_frequency: 'monthly' });
  };

  const removeLiability = (id) => {
    updateData({
      liabilities: data.liabilities.filter((l) => l.id !== id),
    });
  };

  const totalLiabilities = data.liabilities.reduce((sum, l) => sum + l.current_balance, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Your Liabilities</h1>
        <p className="text-muted-foreground">Add your personal debts. Investment property loans will be linked when you add properties.</p>
      </div>
      
      {/* Liabilities Summary */}
      <Card className="mb-6 bg-gradient-to-r from-terra-50 to-terra-50 border-terra-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Other Liabilities</p>
              <p className="text-3xl font-semibold tabular-nums text-foreground">
                ${totalLiabilities.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-terra-100 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-terra-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info about property loans */}
      <Card className="mb-6 border-ocean-200 bg-ocean-50">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> Investment property loans are linked to each property and will be captured when you add properties from the dashboard.
          </p>
        </CardContent>
      </Card>
      
      {/* No debt message */}
      {data.liabilities.length === 0 && (
        <Card className="mb-6 border-sage-200 bg-sage-50">
          <CardContent className="p-6 text-center">
            <p className="text-sage-700 font-medium">No debts? That's great!</p>
            <p className="text-sm text-sage-600 mt-1">You can skip this step if you have no non-property debts.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Existing Liabilities */}
      {data.liabilities.length > 0 && (
        <div className="space-y-3 mb-6">
          {data.liabilities.map((liability) => {
            const TypeIcon = LIABILITY_TYPES.find((t) => t.value === liability.type)?.icon || CreditCard;
            return (
              <Card key={liability.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-terra-100 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-terra-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{liability.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {LIABILITY_TYPES.find(t => t.value === liability.type)?.label || liability.type}
                        {liability.interest_rate > 0 && (
                          <> • {liability.interest_rate}% interest</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-terra-600">
                      ${liability.current_balance.toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLiability(liability.id)}
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
      
      {/* Add New Liability */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Liability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Liability Name</Label>
              <Input
                value={newLiability.name}
                onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                placeholder="e.g., Car Loan - Toyota"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newLiability.type}
                onValueChange={(v) => setNewLiability({ ...newLiability, type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIABILITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current Balance ($)</Label>
              <Input
                type="number"
                value={newLiability.current_balance}
                onChange={(e) => setNewLiability({ ...newLiability, current_balance: e.target.value })}
                placeholder="15000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Interest Rate (% p.a.)</Label>
              <Input
                type="number"
                step="0.1"
                value={newLiability.interest_rate}
                onChange={(e) => setNewLiability({ ...newLiability, interest_rate: e.target.value })}
                placeholder="7.5"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Payment ($)</Label>
              <Input
                type="number"
                value={newLiability.minimum_payment}
                onChange={(e) => setNewLiability({ ...newLiability, minimum_payment: e.target.value })}
                placeholder="300"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Payment Frequency</Label>
              <Select
                value={newLiability.payment_frequency}
                onValueChange={(v) => setNewLiability({ ...newLiability, payment_frequency: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {addError && <p className="text-xs text-terra-600">{addError}</p>}
          <Button
            onClick={addLiability}
            variant="outline"
            className="w-full hover:bg-sage-50 hover:border-sage-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Liability
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

export default LiabilitiesStep;
