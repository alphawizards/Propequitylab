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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { CreditCard, Receipt, Target } from 'lucide-react';

const LIABILITY_TYPES = [
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'hecs', label: 'HECS/HELP' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'margin_loan', label: 'Margin Loan' },
  { value: 'buy_now_pay_later', label: 'Buy Now Pay Later' },
  { value: 'other', label: 'Other' },
];

const OWNER_OPTIONS = [
  { value: 'you', label: 'You' },
  { value: 'partner', label: 'Partner' },
  { value: 'joint', label: 'Joint' },
];

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
];

const PAYOFF_STRATEGIES = [
  { value: 'minimum', label: 'Minimum Payments' },
  { value: 'aggressive', label: 'Aggressive Payoff' },
  { value: 'custom', label: 'Custom Plan' },
];

const defaultFormData = {
  name: '',
  type: 'personal_loan',
  owner: 'you',
  lender: '',
  original_amount: '',
  current_balance: '',
  interest_rate: '',
  is_tax_deductible: false,
  minimum_payment: '',
  payment_frequency: 'monthly',
  extra_payment: '',
  payoff_strategy: 'minimum',
  target_payoff_date: '',
  is_indexed: false,
  repayment_threshold: '',
  notes: '',
};

const LiabilityFormModal = ({ isOpen, onClose, onSubmit, liability, editMode }) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (liability && editMode) {
      setFormData({
        name: liability.name || '',
        type: liability.type || 'personal_loan',
        owner: liability.owner || 'you',
        lender: liability.lender || '',
        original_amount: liability.original_amount || '',
        current_balance: liability.current_balance || '',
        interest_rate: liability.interest_rate || '',
        is_tax_deductible: liability.is_tax_deductible || false,
        minimum_payment: liability.minimum_payment || '',
        payment_frequency: liability.payment_frequency || 'monthly',
        extra_payment: liability.extra_payment || '',
        payoff_strategy: liability.payoff_strategy || 'minimum',
        target_payoff_date: liability.target_payoff_date || '',
        is_indexed: liability.is_indexed || false,
        repayment_threshold: liability.repayment_threshold || '',
        notes: liability.notes || '',
      });
    } else {
      setFormData(defaultFormData);
    }
    setActiveTab('basic');
  }, [liability, editMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.current_balance) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const liabilityData = {
        name: formData.name,
        type: formData.type,
        owner: formData.owner,
        lender: formData.lender,
        original_amount: parseFloat(formData.original_amount) || parseFloat(formData.current_balance) || 0,
        current_balance: parseFloat(formData.current_balance) || 0,
        interest_rate: parseFloat(formData.interest_rate) || 0,
        is_tax_deductible: formData.is_tax_deductible,
        minimum_payment: parseFloat(formData.minimum_payment) || 0,
        payment_frequency: formData.payment_frequency,
        extra_payment: parseFloat(formData.extra_payment) || 0,
        payoff_strategy: formData.payoff_strategy,
        target_payoff_date: formData.target_payoff_date || null,
        is_indexed: formData.is_indexed,
        repayment_threshold: parseFloat(formData.repayment_threshold) || 0,
        notes: formData.notes,
      };
      
      await onSubmit(liabilityData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHecs = formData.type === 'hecs';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode ? 'Edit Liability' : 'Add New Liability'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="balance" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Balance & Interest
            </TabsTrigger>
            <TabsTrigger value="repayment" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Repayment
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Liability Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Toyota Corolla Loan, Visa Card"
                />
              </div>
              
              <div>
                <Label>Liability Type *</Label>
                <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIABILITY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Owner</Label>
                <Select value={formData.owner} onValueChange={(v) => handleChange('owner', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {OWNER_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label>Lender / Institution</Label>
                <Input
                  value={formData.lender}
                  onChange={(e) => handleChange('lender', e.target.value)}
                  placeholder="e.g., ANZ, Afterpay, ATO"
                />
              </div>
            </div>
          </TabsContent>

          {/* Balance & Interest Tab */}
          <TabsContent value="balance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Original Amount ($)</Label>
                <Input
                  type="number"
                  value={formData.original_amount}
                  onChange={(e) => handleChange('original_amount', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label>Current Balance ($) *</Label>
                <Input
                  type="number"
                  value={formData.current_balance}
                  onChange={(e) => handleChange('current_balance', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label>Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) => handleChange('interest_rate', e.target.value)}
                  placeholder="0"
                />
                {isHecs && (
                  <p className="text-xs text-gray-500 mt-1">
                    HECS is indexed to CPI, not interest rate
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.is_tax_deductible}
                  onCheckedChange={(v) => handleChange('is_tax_deductible', v)}
                />
                <Label>Tax Deductible</Label>
              </div>

              {isHecs && (
                <>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.is_indexed}
                      onCheckedChange={(v) => handleChange('is_indexed', v)}
                    />
                    <Label>Indexed to Inflation</Label>
                  </div>
                  
                  <div>
                    <Label>Repayment Threshold ($)</Label>
                    <Input
                      type="number"
                      value={formData.repayment_threshold}
                      onChange={(e) => handleChange('repayment_threshold', e.target.value)}
                      placeholder="54435"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Income threshold for compulsory repayments (2024: $54,435)
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Repayment Tab */}
          <TabsContent value="repayment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Payment ($)</Label>
                <Input
                  type="number"
                  value={formData.minimum_payment}
                  onChange={(e) => handleChange('minimum_payment', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label>Payment Frequency</Label>
                <Select 
                  value={formData.payment_frequency} 
                  onValueChange={(v) => handleChange('payment_frequency', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Extra Payment ($)</Label>
                <Input
                  type="number"
                  value={formData.extra_payment}
                  onChange={(e) => handleChange('extra_payment', e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional amount above minimum payment
                </p>
              </div>
              
              <div>
                <Label>Payoff Strategy</Label>
                <Select 
                  value={formData.payoff_strategy} 
                  onValueChange={(v) => handleChange('payoff_strategy', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYOFF_STRATEGIES.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Target Payoff Date</Label>
                <Input
                  type="date"
                  value={formData.target_payoff_date}
                  onChange={(e) => handleChange('target_payoff_date', e.target.value)}
                />
              </div>
              
              <div className="col-span-2">
                <Label>Notes</Label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional notes about this liability..."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.current_balance}
            className="bg-lime-400 text-gray-900 hover:bg-lime-500"
          >
            {isSubmitting ? 'Saving...' : (editMode ? 'Update Liability' : 'Add Liability')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiabilityFormModal;
