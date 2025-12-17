import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Plus, Trash2, PiggyBank, TrendingUp, Coins, Wallet, Building, Landmark } from 'lucide-react';

const ASSET_TYPES = [
  { value: 'super', label: 'Superannuation', icon: Landmark },
  { value: 'shares', label: 'Shares', icon: TrendingUp },
  { value: 'etf', label: 'ETFs', icon: TrendingUp },
  { value: 'crypto', label: 'Cryptocurrency', icon: Coins },
  { value: 'cash', label: 'Cash/Savings', icon: Wallet },
  { value: 'bonds', label: 'Bonds', icon: Building },
  { value: 'managed_fund', label: 'Managed Fund', icon: PiggyBank },
  { value: 'other', label: 'Other', icon: PiggyBank },
];

const AssetsStep = ({ data, updateData, onNext, isLoading }) => {
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'super',
    current_value: '',
    expected_return: 7,
    contribution_amount: '',
    contribution_frequency: 'monthly',
  });

  const addAsset = () => {
    if (newAsset.name && newAsset.current_value) {
      updateData({
        other_assets: [
          ...data.other_assets,
          {
            ...newAsset,
            id: Date.now(),
            current_value: parseFloat(newAsset.current_value),
            contributions: {
              amount: parseFloat(newAsset.contribution_amount) || 0,
              frequency: newAsset.contribution_frequency,
            },
          },
        ],
      });
      setNewAsset({
        name: '',
        type: 'super',
        current_value: '',
        expected_return: 7,
        contribution_amount: '',
        contribution_frequency: 'monthly',
      });
    }
  };

  const removeAsset = (id) => {
    updateData({
      other_assets: data.other_assets.filter((a) => a.id !== id),
    });
  };

  const totalAssets = data.other_assets.reduce((sum, asset) => sum + asset.current_value, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Assets</h1>
        <p className="text-gray-600">Add your non-property assets like super, shares, and savings.</p>
      </div>
      
      {/* Assets Summary */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Other Assets</p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalAssets.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <PiggyBank className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Info about properties */}
      <Card className="mb-6 border-lime-200 bg-lime-50">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Properties can be added later from the dashboard. 
            This section is for non-property assets like superannuation, shares, and savings.
          </p>
        </CardContent>
      </Card>
      
      {/* Existing Assets */}
      {data.other_assets.length > 0 && (
        <div className="space-y-3 mb-6">
          {data.other_assets.map((asset) => {
            const TypeIcon = ASSET_TYPES.find((t) => t.value === asset.type)?.icon || PiggyBank;
            return (
              <Card key={asset.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {ASSET_TYPES.find(t => t.value === asset.type)?.label || asset.type}
                        {asset.contributions?.amount > 0 && (
                          <> • +${asset.contributions.amount}/{asset.contributions.frequency}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-gray-900">
                      ${asset.current_value.toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAsset(asset.id)}
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
      
      {/* Add New Asset */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Asset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Asset Name</Label>
              <Input
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                placeholder="e.g., My Super"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newAsset.type}
                onValueChange={(v) => setNewAsset({ ...newAsset, type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((type) => (
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
              <Label>Current Value ($)</Label>
              <Input
                type="number"
                value={newAsset.current_value}
                onChange={(e) => setNewAsset({ ...newAsset, current_value: e.target.value })}
                placeholder="50000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Expected Return (% p.a.)</Label>
              <Input
                type="number"
                step="0.5"
                value={newAsset.expected_return}
                onChange={(e) => setNewAsset({ ...newAsset, expected_return: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Regular Contribution ($)</Label>
              <Input
                type="number"
                value={newAsset.contribution_amount}
                onChange={(e) => setNewAsset({ ...newAsset, contribution_amount: e.target.value })}
                placeholder="500"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Contribution Frequency</Label>
              <Select
                value={newAsset.contribution_frequency}
                onValueChange={(v) => setNewAsset({ ...newAsset, contribution_frequency: v })}
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
          </div>
          
          <Button
            onClick={addAsset}
            variant="outline"
            className="w-full hover:bg-lime-50 hover:border-lime-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
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

export default AssetsStep;
