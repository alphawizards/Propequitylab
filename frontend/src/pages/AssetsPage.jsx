import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import AssetCard from '../components/assets/AssetCard';
import AssetFormModal from '../components/assets/AssetFormModal';
import AssetDetailsModal from '../components/assets/AssetDetailsModal';
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  PiggyBank,
  BarChart3,
  Filter,
} from 'lucide-react';

const AssetsPage = () => {
  const { currentPortfolio, refreshSummary } = usePortfolio();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const fetchAssets = useCallback(async () => {
    if (!currentPortfolio?.id) return;
    
    try {
      setLoading(true);
      const data = await api.getAssets(currentPortfolio.id);
      setAssets(data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPortfolio?.id]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setEditMode(true);
    setIsFormOpen(true);
    setIsDetailsOpen(false);
  };

  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
    setIsDetailsOpen(true);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      await api.deleteAsset(assetId);
      setAssets(prev => prev.filter(a => a.id !== assetId));
      refreshSummary();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const handleFormSubmit = async (assetData) => {
    try {
      if (editMode && selectedAsset) {
        const updated = await api.updateAsset(selectedAsset.id, assetData);
        setAssets(prev => prev.map(a => a.id === selectedAsset.id ? updated : a));
      } else {
        const newAsset = await api.createAsset({
          ...assetData,
          portfolio_id: currentPortfolio.id,
        });
        setAssets(prev => [...prev, newAsset]);
      }
      setIsFormOpen(false);
      refreshSummary();
    } catch (error) {
      console.error('Failed to save asset:', error);
    }
  };

  // Calculate totals
  const totals = assets.reduce((acc, asset) => {
    const annualContrib = asset.contributions?.amount 
      ? asset.contributions.amount * ({
          weekly: 52,
          fortnightly: 26,
          monthly: 12,
          quarterly: 4,
          annual: 1,
        }[asset.contributions?.frequency] || 12)
      : 0;
    
    return {
      totalValue: acc.totalValue + (asset.current_value || 0),
      totalGain: acc.totalGain + ((asset.current_value || 0) - (asset.purchase_value || 0)),
      annualContributions: acc.annualContributions + annualContrib,
      avgReturn: acc.avgReturn + (asset.expected_return || 0),
    };
  }, { totalValue: 0, totalGain: 0, annualContributions: 0, avgReturn: 0 });

  const avgExpectedReturn = assets.length > 0 ? (totals.avgReturn / assets.length).toFixed(1) : 0;

  const filteredAssets = assets.filter(asset =>
    asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.institution?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentPortfolio) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please create a portfolio first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-500">Manage your investment assets</p>
        </div>
        <Button
          onClick={handleAddAsset}
          className="bg-lime-400 text-gray-900 hover:bg-lime-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totals.totalValue / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totals.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totals.totalGain >= 0 ? '+' : ''}${(totals.totalGain / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Annual Contributions</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totals.annualContributions.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Expected Return</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgExpectedReturn}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, type, or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No assets found' : 'No assets yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Add your first asset to start tracking your wealth'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddAsset}
                className="bg-lime-400 text-gray-900 hover:bg-lime-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onView={() => handleViewAsset(asset)}
              onEdit={() => handleEditAsset(asset)}
              onDelete={() => handleDeleteAsset(asset.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AssetFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        asset={selectedAsset}
        editMode={editMode}
      />

      <AssetDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        asset={selectedAsset}
        onEdit={() => handleEditAsset(selectedAsset)}
      />
    </div>
  );
};

export default AssetsPage;
