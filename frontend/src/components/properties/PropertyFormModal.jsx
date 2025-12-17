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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Home, DollarSign, Key, TrendingUp, Receipt } from 'lucide-react';

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' },
];

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'unit', label: 'Unit' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' },
];

const LOAN_TYPES = [
  { value: 'interest_only', label: 'Interest Only' },
  { value: 'principal_interest', label: 'Principal & Interest' },
];

const defaultFormData = {
  // Property Details
  address: '',
  suburb: '',
  state: 'NSW',
  postcode: '',
  property_type: 'house',
  bedrooms: 3,
  bathrooms: 2,
  car_spaces: 1,
  land_size: '',
  building_size: '',
  year_built: '',
  
  // Purchase
  purchase_price: '',
  purchase_date: '',
  stamp_duty: '',
  purchase_costs: '',
  current_value: '',
  
  // Loan
  loan_amount: '',
  interest_rate: '6.25',
  loan_type: 'interest_only',
  loan_term: '30',
  lender: '',
  offset_balance: '',
  
  // Rental
  is_rented: true,
  rental_income: '',
  rental_frequency: 'weekly',
  vacancy_rate: '2',
  
  // Expenses
  strata: '',
  council_rates: '',
  water_rates: '',
  insurance: '',
  maintenance: '',
  property_management: '',
  land_tax: '',
  
  // Growth
  capital_growth_rate: '5',
  rental_growth_rate: '3',
};

const PropertyFormModal = ({ isOpen, onClose, onSubmit, property, editMode }) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (property && editMode) {
      setFormData({
        address: property.address || '',
        suburb: property.suburb || '',
        state: property.state || 'NSW',
        postcode: property.postcode || '',
        property_type: property.property_type || 'house',
        bedrooms: property.bedrooms || 3,
        bathrooms: property.bathrooms || 2,
        car_spaces: property.car_spaces || 1,
        land_size: property.land_size || '',
        building_size: property.building_size || '',
        year_built: property.year_built || '',
        purchase_price: property.purchase_price || '',
        purchase_date: property.purchase_date || '',
        stamp_duty: property.stamp_duty || '',
        purchase_costs: property.purchase_costs || '',
        current_value: property.current_value || '',
        loan_amount: property.loan_details?.amount || '',
        interest_rate: property.loan_details?.interest_rate || '6.25',
        loan_type: property.loan_details?.loan_type || 'interest_only',
        loan_term: property.loan_details?.loan_term || '30',
        lender: property.loan_details?.lender || '',
        offset_balance: property.loan_details?.offset_balance || '',
        is_rented: property.rental_details?.is_rented ?? true,
        rental_income: property.rental_details?.income || '',
        rental_frequency: property.rental_details?.frequency || 'weekly',
        vacancy_rate: property.rental_details?.vacancy_rate || '2',
        strata: property.expenses?.strata || '',
        council_rates: property.expenses?.council_rates || '',
        water_rates: property.expenses?.water_rates || '',
        insurance: property.expenses?.insurance || '',
        maintenance: property.expenses?.maintenance || '',
        property_management: property.expenses?.property_management || '',
        land_tax: property.expenses?.land_tax || '',
        capital_growth_rate: property.growth_assumptions?.capital_growth_rate || '5',
        rental_growth_rate: property.growth_assumptions?.rental_growth_rate || '3',
      });
    } else {
      setFormData(defaultFormData);
    }
    setActiveTab('details');
  }, [property, editMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const propertyData = {
        address: formData.address,
        suburb: formData.suburb,
        state: formData.state,
        postcode: formData.postcode,
        property_type: formData.property_type,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        car_spaces: parseInt(formData.car_spaces),
        land_size: parseFloat(formData.land_size) || 0,
        building_size: parseFloat(formData.building_size) || 0,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        purchase_date: formData.purchase_date,
        stamp_duty: parseFloat(formData.stamp_duty) || 0,
        purchase_costs: parseFloat(formData.purchase_costs) || 0,
        current_value: parseFloat(formData.current_value) || parseFloat(formData.purchase_price) || 0,
        loan_details: {
          amount: parseFloat(formData.loan_amount) || 0,
          interest_rate: parseFloat(formData.interest_rate) || 6.25,
          loan_type: formData.loan_type,
          loan_term: parseInt(formData.loan_term) || 30,
          lender: formData.lender,
          offset_balance: parseFloat(formData.offset_balance) || 0,
        },
        rental_details: {
          is_rented: formData.is_rented,
          income: parseFloat(formData.rental_income) || 0,
          frequency: formData.rental_frequency,
          vacancy_rate: parseFloat(formData.vacancy_rate) || 2,
        },
        expenses: {
          strata: parseFloat(formData.strata) || 0,
          council_rates: parseFloat(formData.council_rates) || 0,
          water_rates: parseFloat(formData.water_rates) || 0,
          insurance: parseFloat(formData.insurance) || 0,
          maintenance: parseFloat(formData.maintenance) || 0,
          property_management: parseFloat(formData.property_management) || 0,
          land_tax: parseFloat(formData.land_tax) || 0,
        },
        growth_assumptions: {
          capital_growth_rate: parseFloat(formData.capital_growth_rate) || 5,
          rental_growth_rate: parseFloat(formData.rental_growth_rate) || 3,
        },
      };
      
      await onSubmit(propertyData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Home className="w-5 h-5 text-lime-600" />
            {editMode ? 'Edit Property' : 'Add New Property'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="details" className="text-xs">
              <Home className="w-4 h-4 mr-1" />
              Details
            </TabsTrigger>
            <TabsTrigger value="purchase" className="text-xs">
              <DollarSign className="w-4 h-4 mr-1" />
              Purchase
            </TabsTrigger>
            <TabsTrigger value="loan" className="text-xs">
              <Key className="w-4 h-4 mr-1" />
              Loan
            </TabsTrigger>
            <TabsTrigger value="rental" className="text-xs">
              <Receipt className="w-4 h-4 mr-1" />
              Rental
            </TabsTrigger>
            <TabsTrigger value="growth" className="text-xs">
              <TrendingUp className="w-4 h-4 mr-1" />
              Growth
            </TabsTrigger>
          </TabsList>
          
          {/* Property Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Street Address *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g., 42 Harbour Street"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Suburb *</Label>
                  <Input
                    value={formData.suburb}
                    onChange={(e) => handleChange('suburb', e.target.value)}
                    placeholder="e.g., Sydney"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUSTRALIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Postcode *</Label>
                  <Input
                    value={formData.postcode}
                    onChange={(e) => handleChange('postcode', e.target.value)}
                    placeholder="2000"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Property Type</Label>
                  <Select value={formData.property_type} onValueChange={(v) => handleChange('property_type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bedrooms</Label>
                  <Select value={formData.bedrooms.toString()} onValueChange={(v) => handleChange('bedrooms', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Select value={formData.bathrooms.toString()} onValueChange={(v) => handleChange('bathrooms', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Car Spaces</Label>
                  <Select value={formData.car_spaces.toString()} onValueChange={(v) => handleChange('car_spaces', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4,5,6].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Land Size (m²)</Label>
                  <Input
                    type="number"
                    value={formData.land_size}
                    onChange={(e) => handleChange('land_size', e.target.value)}
                    placeholder="450"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Building Size (m²)</Label>
                  <Input
                    type="number"
                    value={formData.building_size}
                    onChange={(e) => handleChange('building_size', e.target.value)}
                    placeholder="180"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Year Built</Label>
                  <Input
                    type="number"
                    value={formData.year_built}
                    onChange={(e) => handleChange('year_built', e.target.value)}
                    placeholder="2010"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Purchase Tab */}
          <TabsContent value="purchase" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase Price ($) *</Label>
                <Input
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => handleChange('purchase_price', e.target.value)}
                  placeholder="850000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Purchase Date *</Label>
                <Input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleChange('purchase_date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Stamp Duty ($)</Label>
                <Input
                  type="number"
                  value={formData.stamp_duty}
                  onChange={(e) => handleChange('stamp_duty', e.target.value)}
                  placeholder="35000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Other Purchase Costs ($)</Label>
                <Input
                  type="number"
                  value={formData.purchase_costs}
                  onChange={(e) => handleChange('purchase_costs', e.target.value)}
                  placeholder="5000"
                  className="mt-1"
                />
              </div>
            </div>
            
            <Card className="bg-lime-50 border-lime-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Current Valuation</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Current Market Value ($)</Label>
                  <Input
                    type="number"
                    value={formData.current_value}
                    onChange={(e) => handleChange('current_value', e.target.value)}
                    placeholder="Leave blank to use purchase price"
                    className="mt-1 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to use purchase price as current value
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Loan Tab */}
          <TabsContent value="loan" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loan Amount ($)</Label>
                <Input
                  type="number"
                  value={formData.loan_amount}
                  onChange={(e) => handleChange('loan_amount', e.target.value)}
                  placeholder="680000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) => handleChange('interest_rate', e.target.value)}
                  placeholder="6.25"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Loan Type</Label>
                <Select value={formData.loan_type} onValueChange={(v) => handleChange('loan_type', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOAN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Loan Term (Years)</Label>
                <Select value={formData.loan_term} onValueChange={(v) => handleChange('loan_term', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5,10,15,20,25,30].map(n => <SelectItem key={n} value={n.toString()}>{n} years</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lender</Label>
                <Input
                  value={formData.lender}
                  onChange={(e) => handleChange('lender', e.target.value)}
                  placeholder="e.g., Commonwealth Bank"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Offset Account Balance ($)</Label>
                <Input
                  type="number"
                  value={formData.offset_balance}
                  onChange={(e) => handleChange('offset_balance', e.target.value)}
                  placeholder="25000"
                  className="mt-1"
                />
              </div>
            </div>
            
            {/* LVR Indicator */}
            {formData.purchase_price && formData.loan_amount && (
              <Card className={`${
                (parseFloat(formData.loan_amount) / parseFloat(formData.current_value || formData.purchase_price) * 100) > 80
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">
                    Loan to Value Ratio (LVR): {
                      ((parseFloat(formData.loan_amount) / parseFloat(formData.current_value || formData.purchase_price)) * 100).toFixed(1)
                    }%
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Rental Tab */}
          <TabsContent value="rental" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Is this property rented?</Label>
                <p className="text-sm text-gray-500">Toggle on if the property has tenants</p>
              </div>
              <Switch
                checked={formData.is_rented}
                onCheckedChange={(checked) => handleChange('is_rented', checked)}
              />
            </div>
            
            {formData.is_rented && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Rental Income ($)</Label>
                    <Input
                      type="number"
                      value={formData.rental_income}
                      onChange={(e) => handleChange('rental_income', e.target.value)}
                      placeholder="650"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={formData.rental_frequency} onValueChange={(v) => handleChange('rental_frequency', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="fortnightly">Fortnightly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vacancy Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.vacancy_rate}
                      onChange={(e) => handleChange('vacancy_rate', e.target.value)}
                      placeholder="2"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Annual Expenses ($)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Strata/Body Corp</Label>
                        <Input
                          type="number"
                          value={formData.strata}
                          onChange={(e) => handleChange('strata', e.target.value)}
                          placeholder="3000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Council Rates</Label>
                        <Input
                          type="number"
                          value={formData.council_rates}
                          onChange={(e) => handleChange('council_rates', e.target.value)}
                          placeholder="2000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Water Rates</Label>
                        <Input
                          type="number"
                          value={formData.water_rates}
                          onChange={(e) => handleChange('water_rates', e.target.value)}
                          placeholder="800"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Insurance</Label>
                        <Input
                          type="number"
                          value={formData.insurance}
                          onChange={(e) => handleChange('insurance', e.target.value)}
                          placeholder="1500"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Maintenance</Label>
                        <Input
                          type="number"
                          value={formData.maintenance}
                          onChange={(e) => handleChange('maintenance', e.target.value)}
                          placeholder="2000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Property Management</Label>
                        <Input
                          type="number"
                          value={formData.property_management}
                          onChange={(e) => handleChange('property_management', e.target.value)}
                          placeholder="3000"
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm">Land Tax</Label>
                        <Input
                          type="number"
                          value={formData.land_tax}
                          onChange={(e) => handleChange('land_tax', e.target.value)}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          {/* Growth Tab */}
          <TabsContent value="growth" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Growth Assumptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Capital Growth Rate (% p.a.)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.capital_growth_rate}
                      onChange={(e) => handleChange('capital_growth_rate', e.target.value)}
                      placeholder="5"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Historical average for Australian property is 5-7%
                    </p>
                  </div>
                  <div>
                    <Label>Rental Growth Rate (% p.a.)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.rental_growth_rate}
                      onChange={(e) => handleChange('rental_growth_rate', e.target.value)}
                      placeholder="3"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Typically 2-4% annually
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-lime-400 text-gray-900 hover:bg-lime-500"
            disabled={isSubmitting || !formData.address || !formData.suburb || !formData.purchase_price}
          >
            {isSubmitting ? 'Saving...' : editMode ? 'Update Property' : 'Add Property'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormModal;
