import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Plus, Trash2, CreditCard, Car, GraduationCap, Wallet, AlertCircle } from 'lucide-react';

const LIABILITY_TYPES = [
  { value: 'car_loan', label: 'Car Loan', icon: Car },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'hecs', label: 'HECS/HELP', icon: GraduationCap },
  { value: 'personal_loan', label: 'Personal Loan', icon: Wallet },
  { value: 'buy_now_pay_later', label: 'Buy Now Pay Later', icon: CreditCard },
  { value: 'other', label: 'Other Debt', icon: AlertCircle },
];

const LiabilitiesStep = ({ data, updateData, onNext, isLoading }) => {
  const [newLiability, setNewLiability] = useState({
    name: '',
    type: 'credit_card',
    original_amount: '',
    current_balance: '',
    interest_rate: '',
    minimum_payment: '',
    payment_frequency: 'monthly',
  });

  const addLiability = () => {
    if (newLiability.name && newLiability.current_balance) {
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
      setNewLiability({
        name: '',
        type: 'credit_card',
        original_amount: '',
        current_balance: '',
        interest_rate: '',
        minimum_payment: '',
        payment_frequency: 'monthly',
      });
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Liabilities</h1>
        <p className="text-gray-600">Add any debts (excluding property loans) to get a complete picture.</p>
      </div>
      
      {/* Liabilities Summary */}
      <Card className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Other Liabilities</p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalLiabilities.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Info about property loans */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Property loans are linked to properties and will be added 
            when you add properties from the dashboard.
          </p>
        </CardContent>
      </Card>
      
      {/* No debt message */}
      {data.liabilities.length === 0 && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <p className="text-green-700 font-medium">No debts? That's great!</p>
            <p className="text-sm text-green-600 mt-1">You can skip this step if you have no non-property debts.</p>
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
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{liability.name}</p>
                      <p className="text-sm text-gray-500">
                        {LIABILITY_TYPES.find(t => t.value === liability.type)?.label || liability.type}
                        {liability.interest_rate > 0 && (
                          <> • {liability.interest_rate}% interest</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-red-600">
                      ${liability.current_balance.toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLiability(liability.id)}
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
          
          <Button
            onClick={addLiability}
            variant="outline"
            className="w-full hover:bg-lime-50 hover:border-lime-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Liability
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

export default LiabilitiesStep;
