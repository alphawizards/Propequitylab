import React, { useState } from 'react';
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

const AddPropertyModal = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    address: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    propertyType: 'House',
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 1,
    purchasePrice: '',
    purchaseDate: '',
    currentValue: '',
    loanAmount: '',
    interestRate: '6.25',
    loanType: 'Interest Only',
    rentalIncome: '',
    rentalFrequency: 'weekly',
    capitalGrowthRate: '5.0',
    rentalGrowthRate: '3.0'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const newProperty = {
      id: Date.now().toString(),
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      currentValue: parseFloat(formData.currentValue) || parseFloat(formData.purchasePrice) || 0,
      loanAmount: parseFloat(formData.loanAmount) || 0,
      interestRate: parseFloat(formData.interestRate) || 6.25,
      rentalIncome: parseFloat(formData.rentalIncome) || 0,
      capitalGrowthRate: parseFloat(formData.capitalGrowthRate) || 5.0,
      rentalGrowthRate: parseFloat(formData.rentalGrowthRate) || 3.0,
      expenses: {
        strata: 0,
        councilRates: 2000,
        waterRates: 800,
        insurance: 1500,
        maintenance: 2000,
        propertyManagement: parseFloat(formData.rentalIncome) * 52 * 0.08 || 0
      }
    };
    onAdd(newProperty);
    onClose();
    setFormData({
      address: '',
      suburb: '',
      state: 'NSW',
      postcode: '',
      propertyType: 'House',
      bedrooms: 3,
      bathrooms: 2,
      carSpaces: 1,
      purchasePrice: '',
      purchaseDate: '',
      currentValue: '',
      loanAmount: '',
      interestRate: '6.25',
      loanType: 'Interest Only',
      rentalIncome: '',
      rentalFrequency: 'weekly',
      capitalGrowthRate: '5.0',
      rentalGrowthRate: '3.0'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Property</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Property Details</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="income">Income & Growth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Street Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g., 42 Harbour Street"
                />
              </div>
              <div>
                <Label>Suburb</Label>
                <Input
                  value={formData.suburb}
                  onChange={(e) => handleChange('suburb', e.target.value)}
                  placeholder="e.g., Sydney"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>State</Label>
                  <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NSW">NSW</SelectItem>
                      <SelectItem value="VIC">VIC</SelectItem>
                      <SelectItem value="QLD">QLD</SelectItem>
                      <SelectItem value="WA">WA</SelectItem>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="TAS">TAS</SelectItem>
                      <SelectItem value="NT">NT</SelectItem>
                      <SelectItem value="ACT">ACT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Postcode</Label>
                  <Input
                    value={formData.postcode}
                    onChange={(e) => handleChange('postcode', e.target.value)}
                    placeholder="2000"
                  />
                </div>
              </div>
              <div>
                <Label>Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(v) => handleChange('propertyType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Unit">Unit</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Beds</Label>
                  <Select value={formData.bedrooms.toString()} onValueChange={(v) => handleChange('bedrooms', parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Baths</Label>
                  <Select value={formData.bathrooms.toString()} onValueChange={(v) => handleChange('bathrooms', parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cars</Label>
                  <Select value={formData.carSpaces.toString()} onValueChange={(v) => handleChange('carSpaces', parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="finance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase Price ($)</Label>
                <Input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  placeholder="e.g., 850000"
                />
              </div>
              <div>
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange('purchaseDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Current Value ($)</Label>
                <Input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => handleChange('currentValue', e.target.value)}
                  placeholder="Leave blank to use purchase price"
                />
              </div>
              <div>
                <Label>Loan Amount ($)</Label>
                <Input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => handleChange('loanAmount', e.target.value)}
                  placeholder="e.g., 680000"
                />
              </div>
              <div>
                <Label>Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => handleChange('interestRate', e.target.value)}
                  placeholder="6.25"
                />
              </div>
              <div>
                <Label>Loan Type</Label>
                <Select value={formData.loanType} onValueChange={(v) => handleChange('loanType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interest Only">Interest Only</SelectItem>
                    <SelectItem value="Principal & Interest">Principal & Interest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="income" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rental Income ($)</Label>
                <Input
                  type="number"
                  value={formData.rentalIncome}
                  onChange={(e) => handleChange('rentalIncome', e.target.value)}
                  placeholder="e.g., 650"
                />
              </div>
              <div>
                <Label>Rental Frequency</Label>
                <Select value={formData.rentalFrequency} onValueChange={(v) => handleChange('rentalFrequency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capital Growth Rate (% p.a.)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.capitalGrowthRate}
                  onChange={(e) => handleChange('capitalGrowthRate', e.target.value)}
                  placeholder="5.0"
                />
              </div>
              <div>
                <Label>Rental Growth Rate (% p.a.)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.rentalGrowthRate}
                  onChange={(e) => handleChange('rentalGrowthRate', e.target.value)}
                  placeholder="3.0"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-lime-400 text-gray-900 hover:bg-lime-500"
          >
            Add Property
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyModal;
