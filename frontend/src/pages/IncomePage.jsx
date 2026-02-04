import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Briefcase,
  Users,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import IncomeCard from '../components/income/IncomeCard';
import IncomeFormModal from '../components/income/IncomeFormModal';
import IncomeDetailsModal from '../components/income/IncomeDetailsModal';


const IncomePage = () => {
  const { currentPortfolio } = usePortfolio();
  const { toast } = useToast();
  const [incomeSources, setIncomeSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);

  const fetchIncomeSources = useCallback(async () => {
    if (!currentPortfolio?.id) return;
    setLoading(true);
    try {
      const data = await api.getIncomeSources(currentPortfolio.id);
      setIncomeSources(data);
    } catch (error) {
      console.error('Failed to fetch income sources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load income sources. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPortfolio?.id, toast]);

  useEffect(() => {
    fetchIncomeSources();
  }, [fetchIncomeSources]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await api.createIncomeSource({
        ...data,
        portfolio_id: currentPortfolio.id,
      });
      await fetchIncomeSources();
      setShowFormModal(false);
      toast({
        title: 'Success',
        description: 'Income source added successfully.',
      });
    } catch (error) {
      console.error('Failed to create income source:', error);
      toast({
        title: 'Error',
        description: 'Failed to add income source. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await api.updateIncomeSource(selectedIncome.id, data);
      await fetchIncomeSources();
      setShowFormModal(false);
      setSelectedIncome(null);
      toast({
        title: 'Success',
        description: 'Income source updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update income source:', error);
      toast({
        title: 'Error',
        description: 'Failed to update income source. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income source?')) return;
    try {
      await api.deleteIncomeSource(id);
      await fetchIncomeSources();
      toast({
        title: 'Success',
        description: 'Income source deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete income source:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete income source. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (income) => {
    setSelectedIncome(income);
    setShowFormModal(true);
  };

  const handleView = (income) => {
    setSelectedIncome(income);
    setShowDetailsModal(true);
  };

  // Filter income sources
  const filteredSources = incomeSources.filter((source) => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || source.type === filterType;
    const matchesOwner = filterOwner === 'all' || source.owner === filterOwner;
    return matchesSearch && matchesType && matchesOwner;
  });

  // Calculate summaries
  const toMonthly = (amount, frequency) => {
    const multipliers = { weekly: 4.33, fortnightly: 2.17, monthly: 1, annual: 1 / 12 };
    return amount * (multipliers[frequency] || 1);
  };

  const totalMonthly = incomeSources.reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0);
  const totalAnnual = totalMonthly * 12;
  const avgGrowthRate = incomeSources.length > 0
    ? incomeSources.reduce((sum, s) => sum + s.growth_rate, 0) / incomeSources.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="income-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income Sources</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your income streams and projections</p>
        </div>
        <Button
          onClick={() => {
            setSelectedIncome(null);
            setShowFormModal(true);
          }}
          className="bg-lime-400 text-gray-900 hover:bg-lime-500"
          data-testid="add-income-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Income Source
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Annual Income</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAnnual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonthly)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Growth Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{avgGrowthRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Income Sources</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{incomeSources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search income sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="salary">Salary</SelectItem>
            <SelectItem value="rental">Rental</SelectItem>
            <SelectItem value="dividend">Dividend</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="pension">Pension</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            <SelectItem value="you">You</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="joint">Joint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Income Grid */}
      {filteredSources.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Income Sources</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Add your income sources to track your earnings and project future growth.
            </p>
            <Button
              onClick={() => setShowFormModal(true)}
              className="bg-lime-400 text-gray-900 hover:bg-lime-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Income
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map((income) => (
            <IncomeCard
              key={income.id}
              income={income}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <IncomeFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        income={selectedIncome}
        onSubmit={selectedIncome ? handleUpdate : handleCreate}
      />

      <IncomeDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        income={selectedIncome}
      />
    </div>
  );
};

export default IncomePage;
