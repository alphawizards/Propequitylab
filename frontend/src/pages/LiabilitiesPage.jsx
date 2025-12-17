import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import LiabilityCard from '../components/liabilities/LiabilityCard';
import LiabilityFormModal from '../components/liabilities/LiabilityFormModal';
import LiabilityDetailsModal from '../components/liabilities/LiabilityDetailsModal';
import {
  Plus,
  Search,
  CreditCard,
  TrendingDown,
  Receipt,
  Percent,
  Filter,
} from 'lucide-react';

const LiabilitiesPage = () => {
  const { currentPortfolio, refreshSummary } = usePortfolio();
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLiability, setSelectedLiability] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const fetchLiabilities = useCallback(async () => {
    if (!currentPortfolio?.id) return;
    
    try {
      setLoading(true);
      const data = await api.getLiabilities(currentPortfolio.id);
      setLiabilities(data);
    } catch (error) {
      console.error('Failed to fetch liabilities:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPortfolio?.id]);

  useEffect(() => {
    fetchLiabilities();
  }, [fetchLiabilities]);

  const handleAddLiability = () => {
    setSelectedLiability(null);
    setEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditLiability = (liability) => {
    setSelectedLiability(liability);
    setEditMode(true);
    setIsFormOpen(true);
    setIsDetailsOpen(false);
  };

  const handleViewLiability = (liability) => {
    setSelectedLiability(liability);
    setIsDetailsOpen(true);
  };

  const handleDeleteLiability = async (liabilityId) => {
    if (!window.confirm('Are you sure you want to delete this liability?')) return;
    
    try {
      await api.deleteLiability(liabilityId);
      setLiabilities(prev => prev.filter(l => l.id !== liabilityId));
      refreshSummary();
    } catch (error) {
      console.error('Failed to delete liability:', error);
    }
  };

  const handleFormSubmit = async (liabilityData) => {
    try {
      if (editMode && selectedLiability) {
        const updated = await api.updateLiability(selectedLiability.id, liabilityData);
        setLiabilities(prev => prev.map(l => l.id === selectedLiability.id ? updated : l));
      } else {
        const newLiability = await api.createLiability({
          ...liabilityData,
          portfolio_id: currentPortfolio.id,
        });
        setLiabilities(prev => [...prev, newLiability]);
      }
      setIsFormOpen(false);
      refreshSummary();
    } catch (error) {
      console.error('Failed to save liability:', error);
    }
  };

  // Calculate totals
  const totals = liabilities.reduce((acc, liability) => {
    const monthlyPayment = (liability.minimum_payment + (liability.extra_payment || 0)) * ({
      weekly: 52/12,
      fortnightly: 26/12,
      monthly: 1,
    }[liability.payment_frequency] || 1);
    
    const annualInterest = liability.current_balance * (liability.interest_rate / 100);
    
    return {
      totalBalance: acc.totalBalance + (liability.current_balance || 0),
      totalOriginal: acc.totalOriginal + (liability.original_amount || 0),
      monthlyPayments: acc.monthlyPayments + monthlyPayment,
      annualInterest: acc.annualInterest + annualInterest,
      avgRate: acc.avgRate + (liability.interest_rate || 0),
    };
  }, { totalBalance: 0, totalOriginal: 0, monthlyPayments: 0, annualInterest: 0, avgRate: 0 });

  const avgInterestRate = liabilities.length > 0 ? (totals.avgRate / liabilities.length).toFixed(1) : 0;
  const totalPaid = totals.totalOriginal - totals.totalBalance;

  const filteredLiabilities = liabilities.filter(liability =>
    liability.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    liability.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    liability.lender?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Liabilities</h1>
          <p className="text-gray-500">Manage your debts and loans</p>
        </div>
        <Button
          onClick={handleAddLiability}
          className="bg-lime-400 text-gray-900 hover:bg-lime-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Liability
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Debt</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(totals.totalBalance / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Paid Off</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(totalPaid / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totals.monthlyPayments.toFixed(0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Interest Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {avgInterestRate}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-orange-600" />
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
            placeholder="Search by name, type, or lender..."
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

      {/* Liabilities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : filteredLiabilities.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No liabilities found' : 'No liabilities yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Track your debts to understand your full financial picture'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddLiability}
                className="bg-lime-400 text-gray-900 hover:bg-lime-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Liability
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLiabilities.map((liability) => (
            <LiabilityCard
              key={liability.id}
              liability={liability}
              onView={() => handleViewLiability(liability)}
              onEdit={() => handleEditLiability(liability)}
              onDelete={() => handleDeleteLiability(liability.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <LiabilityFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        liability={selectedLiability}
        editMode={editMode}
      />

      <LiabilityDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        liability={selectedLiability}
        onEdit={() => handleEditLiability(selectedLiability)}
      />
    </div>
  );
};

export default LiabilitiesPage;
