import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { User, Users } from 'lucide-react';

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

const AboutYouStep = ({ data, updateData, onNext, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's get to know you</h1>
        <p className="text-gray-600">Tell us a bit about yourself to personalize your experience.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Planning Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.planning_type}
              onValueChange={(value) => updateData({ planning_type: value })}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="individual"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  data.planning_type === 'individual'
                    ? 'border-lime-400 bg-lime-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="individual" id="individual" className="sr-only" />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  data.planning_type === 'individual' ? 'bg-lime-400' : 'bg-gray-100'
                }`}>
                  <User className={`w-6 h-6 ${
                    data.planning_type === 'individual' ? 'text-gray-900' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Individual</p>
                  <p className="text-sm text-gray-500">Planning for yourself</p>
                </div>
              </Label>
              
              <Label
                htmlFor="couple"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  data.planning_type === 'couple'
                    ? 'border-lime-400 bg-lime-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="couple" id="couple" className="sr-only" />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  data.planning_type === 'couple' ? 'bg-lime-400' : 'bg-gray-100'
                }`}>
                  <Users className={`w-6 h-6 ${
                    data.planning_type === 'couple' ? 'text-gray-900' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Couple</p>
                  <p className="text-sm text-gray-500">Planning together</p>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={data.date_of_birth}
                  onChange={(e) => updateData({ date_of_birth: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            {data.planning_type === 'couple' && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label htmlFor="partner_name">Partner's Name</Label>
                  <Input
                    id="partner_name"
                    value={data.partner_name}
                    onChange={(e) => updateData({ partner_name: e.target.value })}
                    placeholder="Enter partner's name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="partner_dob">Partner's Date of Birth</Label>
                  <Input
                    id="partner_dob"
                    type="date"
                    value={data.partner_dob}
                    onChange={(e) => updateData({ partner_dob: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Select value={data.country} onValueChange={(v) => updateData({ country: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>State/Territory</Label>
                <Select value={data.state} onValueChange={(v) => updateData({ state: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUSTRALIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-lime-400 text-gray-900 hover:bg-lime-500 px-8"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AboutYouStep;
