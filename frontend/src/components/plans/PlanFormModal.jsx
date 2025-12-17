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
import { Textarea } from '../ui/textarea';
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
import { Flame, Target, Settings, Calculator } from 'lucide-react';

const PLAN_TYPES = [
  { value: 'fire', label: 'FIRE - Financial Independence, Retire Early' },
  { value: 'lean_fire', label: 'Lean FIRE - Minimal Expenses' },
  { value: 'fat_fire', label: 'Fat FIRE - Comfortable Lifestyle' },
  { value: 'coast_fire', label: 'Coast FIRE - Stop Saving, Let Grow' },
  { value: 'barista_fire', label: 'Barista FIRE - Part-time Work' },
  { value: 'traditional', label: 'Traditional - Retire at 65+' },
  { value: 'custom', label: 'Custom Plan' },
];

const PlanFormModal = ({ open, onOpenChange, plan, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'fire',
    retirement_age: 55,
    life_expectancy: 95,
    target_equity: 0,
    target_passive_income: 0,
    target_withdrawal_rate: 4.0,
    withdrawal_strategy: {
      type: 'percentage',
      rate: 4.0,
      adjust_for_inflation: true,
    },
    social_security: {
      include_age_pension: true,
      start_age: 67,
      estimated_amount: 28000,
      partner_amount: 0,
    },
    simulation_years: 50,
    inflation_rate: 2.5,
    use_monte_carlo: false,
  });

  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        type: plan.type || 'fire',
        retirement_age: plan.retirement_age || 55,
        life_expectancy: plan.life_expectancy || 95,
        target_equity: plan.target_equity || 0,
        target_passive_income: plan.target_passive_income || 0,
        target_withdrawal_rate: plan.target_withdrawal_rate || 4.0,
        withdrawal_strategy: plan.withdrawal_strategy || {
          type: 'percentage',
          rate: 4.0,
          adjust_for_inflation: true,
        },
        social_security: plan.social_security || {
          include_age_pension: true,
          start_age: 67,
          estimated_amount: 28000,
          partner_amount: 0,
        },
        simulation_years: plan.simulation_years || 50,
        inflation_rate: plan.inflation_rate || 2.5,
        use_monte_carlo: plan.use_monte_carlo || false,
      });
    } else {
      // Reset form for new plan
      setFormData({
        name: '',
        description: '',
        type: 'fire',
        retirement_age: 55,
        life_expectancy: 95,
        target_equity: 0,
        target_passive_income: 0,
        target_withdrawal_rate: 4.0,
        withdrawal_strategy: {
          type: 'percentage',
          rate: 4.0,
          adjust_for_inflation: true,
        },
        social_security: {
          include_age_pension: true,
          start_age: 67,
          estimated_amount: 28000,
          partner_amount: 0,
        },
        simulation_years: 50,
        inflation_rate: 2.5,
        use_monte_carlo: false,
      });
    }
    setActiveTab('basic');
  }, [plan, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="plan-form-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            {plan ? 'Edit Plan' : 'Create New Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Target className="w-4 h-4" /> Basic
              </TabsTrigger>
              <TabsTrigger value="targets" className="flex items-center gap-1">
                <Calculator className="w-4 h-4" /> Targets
              </TabsTrigger>
              <TabsTrigger value="withdrawal" className="flex items-center gap-1">
                <Flame className="w-4 h-4" /> Withdrawal
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                <Settings className="w-4 h-4" /> Advanced
              </TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="My FIRE Plan"
                  required
                  data-testid="plan-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Plan Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateField('type', value)}
                >
                  <SelectTrigger data-testid="plan-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your financial goals..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Retirement Age: {formData.retirement_age}</Label>
                  <Slider
                    value={[formData.retirement_age]}
                    onValueChange={([value]) => updateField('retirement_age', value)}
                    min={30}
                    max={75}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30</span>
                    <span>75</span>
                  </div>
                </div>

                <div>
                  <Label>Life Expectancy: {formData.life_expectancy}</Label>
                  <Slider
                    value={[formData.life_expectancy]}
                    onValueChange={([value]) => updateField('life_expectancy', value)}
                    min={70}
                    max={110}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>70</span>
                    <span>110</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Targets Tab */}
            <TabsContent value="targets" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target_equity">Target Net Worth ($)</Label>
                <Input
                  id="target_equity"
                  type="number"
                  value={formData.target_equity}
                  onChange={(e) => updateField('target_equity', parseFloat(e.target.value) || 0)}
                  placeholder="2000000"
                />
                <p className="text-xs text-gray-500">Your target net worth at retirement</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_passive_income">Target Annual Passive Income ($)</Label>
                <Input
                  id="target_passive_income"
                  type="number"
                  value={formData.target_passive_income}
                  onChange={(e) => updateField('target_passive_income', parseFloat(e.target.value) || 0)}
                  placeholder="80000"
                />
                <p className="text-xs text-gray-500">Annual income you need in retirement</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_withdrawal_rate">Target Withdrawal Rate (%)</Label>
                <Input
                  id="target_withdrawal_rate"
                  type="number"
                  step="0.1"
                  value={formData.target_withdrawal_rate}
                  onChange={(e) => updateField('target_withdrawal_rate', parseFloat(e.target.value) || 4.0)}
                  placeholder="4.0"
                />
                <p className="text-xs text-gray-500">The 4% rule is a common starting point</p>
              </div>
            </TabsContent>

            {/* Withdrawal Tab */}
            <TabsContent value="withdrawal" className="space-y-4">
              <div className="space-y-2">
                <Label>Withdrawal Strategy</Label>
                <Select
                  value={formData.withdrawal_strategy.type}
                  onValueChange={(value) => updateNestedField('withdrawal_strategy', 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (e.g., 4% rule)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="variable">Variable (adjust with market)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Adjust for Inflation</Label>
                  <p className="text-xs text-gray-500">Increase withdrawals with inflation</p>
                </div>
                <Switch
                  checked={formData.withdrawal_strategy.adjust_for_inflation}
                  onCheckedChange={(checked) =>
                    updateNestedField('withdrawal_strategy', 'adjust_for_inflation', checked)
                  }
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Age Pension (Australia)</h4>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Include Age Pension</Label>
                    <p className="text-xs text-gray-500">Factor in government pension</p>
                  </div>
                  <Switch
                    checked={formData.social_security.include_age_pension}
                    onCheckedChange={(checked) =>
                      updateNestedField('social_security', 'include_age_pension', checked)
                    }
                  />
                </div>

                {formData.social_security.include_age_pension && (
                  <>
                    <div className="space-y-2 mb-4">
                      <Label>Pension Start Age</Label>
                      <Input
                        type="number"
                        value={formData.social_security.start_age}
                        onChange={(e) =>
                          updateNestedField('social_security', 'start_age', parseInt(e.target.value) || 67)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Annual Amount ($)</Label>
                      <Input
                        type="number"
                        value={formData.social_security.estimated_amount}
                        onChange={(e) =>
                          updateNestedField('social_security', 'estimated_amount', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="simulation_years">Simulation Years</Label>
                <Input
                  id="simulation_years"
                  type="number"
                  value={formData.simulation_years}
                  onChange={(e) => updateField('simulation_years', parseInt(e.target.value) || 50)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inflation_rate">Assumed Inflation Rate (%)</Label>
                <Input
                  id="inflation_rate"
                  type="number"
                  step="0.1"
                  value={formData.inflation_rate}
                  onChange={(e) => updateField('inflation_rate', parseFloat(e.target.value) || 2.5)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Monte Carlo Simulation</Label>
                  <p className="text-xs text-gray-500">Run probability-based projections</p>
                </div>
                <Switch
                  checked={formData.use_monte_carlo}
                  onCheckedChange={(checked) => updateField('use_monte_carlo', checked)}
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
              data-testid="submit-plan-btn"
            >
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormModal;
