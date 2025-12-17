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
import { Wallet, TrendingUp, Receipt } from 'lucide-react';

const ASSET_TYPES = [
  { value: 'super', label: 'Superannuation' },
  { value: 'shares', label: 'Shares' },
  { value: 'etf', label: 'ETF' },
  { value: 'managed_fund', label: 'Managed Fund' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'cash', label: 'Cash/Savings' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'term_deposit', label: 'Term Deposit' },
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
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

const TAX_ENVIRONMENT_OPTIONS = [
  { value: 'taxable', label: 'Taxable' },
  { value: 'tax_deferred', label: 'Tax Deferred (Super)' },
  { value: 'tax_free', label: 'Tax Free' },
];

const defaultFormData = {
  name: '',
  type: 'cash',
  owner: 'you',
  institution: '',
  current_value: '',
  purchase_value: '',
  purchase_date: '',
  ticker: '',
  units: '',
  expected_return: '7',
  tax_environment: 'taxable',
  contribution_amount: '',
  contribution_frequency: 'monthly',
  employer_contribution: '',
  contribution_growth_rate: '3',
  notes: '',
};

const AssetFormModal = ({ isOpen, onClose, onSubmit, asset, editMode }) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (asset && editMode) {
      setFormData({
        name: asset.name || '',
        type: asset.type || 'cash',
        owner: asset.owner || 'you',
        institution: asset.institution || '',
        current_value: asset.current_value || '',
        purchase_value: asset.purchase_value || '',
        purchase_date: asset.purchase_date || '',
        ticker: asset.ticker || '',
        units: asset.units || '',
        expected_return: asset.expected_return || '7',
        tax_environment: asset.tax_environment || 'taxable',
        contribution_amount: asset.contributions?.amount || '',
        contribution_frequency: asset.contributions?.frequency || 'monthly',
        employer_contribution: asset.contributions?.employer_contribution || '',
        contribution_growth_rate: asset.contributions?.growth_rate || '3',
        notes: asset.notes || '',
      });
    } else {
      setFormData(defaultFormData);
    }
    setActiveTab('basic');
  }, [asset, editMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.current_value) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const assetData = {
        name: formData.name,
        type: formData.type,
        owner: formData.owner,
        institution: formData.institution,
        current_value: parseFloat(formData.current_value) || 0,
        purchase_value: parseFloat(formData.purchase_value) || parseFloat(formData.current_value) || 0,
        purchase_date: formData.purchase_date || null,
        ticker: formData.ticker || null,
        units: parseFloat(formData.units) || 0,
        expected_return: parseFloat(formData.expected_return) || 7,
        tax_environment: formData.tax_environment,
        contributions: {
          amount: parseFloat(formData.contribution_amount) || 0,
          frequency: formData.contribution_frequency,
          employer_contribution: parseFloat(formData.employer_contribution) || 0,
          growth_rate: parseFloat(formData.contribution_growth_rate) || 3,
        },
        notes: formData.notes,
      };
      
      await onSubmit(assetData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showTickerFields = ['shares', 'etf', 'crypto'].includes(formData.type);
  const showSuperFields = formData.type === 'super';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode ? 'Edit Asset' : 'Add New Asset'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="value" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Value & Contributions
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth & Tax
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Asset Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Vanguard ETF, ANZ Savings"
                />
              </div>
              
              <div>
                <Label>Asset Type *</Label>
                <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(type => (
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
                <Label>Institution / Platform</Label>
                <Input
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  placeholder="e.g., CommSec, Stake, AustralianSuper"
                />
              </div>

              {showTickerFields && (
                <>
                  <div>
                    <Label>Ticker Symbol</Label>
                    <Input
                      value={formData.ticker}
                      onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
                      placeholder="e.g., VAS, BTC"
                    />
                  </div>
                  <div>
                    <Label>Number of Units</Label>
                    <Input
                      type="number"
                      value={formData.units}
                      onChange={(e) => handleChange('units', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Value & Contributions Tab */}
          <TabsContent value="value" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Value ($) *</Label>
                <Input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => handleChange('current_value', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label>Purchase Value ($)</Label>
                <Input
                  type="number"
                  value={formData.purchase_value}
                  onChange={(e) => handleChange('purchase_value', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleChange('purchase_date', e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-4">Regular Contributions</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contribution Amount ($)</Label>
                  <Input
                    type="number"
                    value={formData.contribution_amount}
                    onChange={(e) => handleChange('contribution_amount', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Frequency</Label>
                  <Select 
                    value={formData.contribution_frequency} 
                    onValueChange={(v) => handleChange('contribution_frequency', v)}
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

                {showSuperFields && (
                  <div>
                    <Label>Employer Contribution ($)</Label>
                    <Input
                      type="number"
                      value={formData.employer_contribution}
                      onChange={(e) => handleChange('employer_contribution', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                )}
                
                <div>
                  <Label>Contribution Growth Rate (%)</Label>
                  <Input
                    type="number"
                    value={formData.contribution_growth_rate}
                    onChange={(e) => handleChange('contribution_growth_rate', e.target.value)}
                    placeholder="3"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Growth & Tax Tab */}
          <TabsContent value="growth" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expected Annual Return (%)</Label>
                <Input
                  type="number"
                  value={formData.expected_return}
                  onChange={(e) => handleChange('expected_return', e.target.value)}
                  placeholder="7"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Historical average for diversified portfolio is 7-10%
                </p>
              </div>
              
              <div>
                <Label>Tax Environment</Label>
                <Select 
                  value={formData.tax_environment} 
                  onValueChange={(v) => handleChange('tax_environment', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_ENVIRONMENT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label>Notes</Label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional notes about this asset..."
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
            disabled={isSubmitting || !formData.name || !formData.current_value}
            className="bg-lime-400 text-gray-900 hover:bg-lime-500"
          >
            {isSubmitting ? 'Saving...' : (editMode ? 'Update Asset' : 'Add Asset')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFormModal;
