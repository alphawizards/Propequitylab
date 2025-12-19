import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import {
  Plus,
  Search,
  Receipt,
  TrendingDown,
  PiggyBank,
  Tag,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import ExpenseCard from '../components/spending/ExpenseCard';
import ExpenseFormModal from '../components/spending/ExpenseFormModal';
import ExpenseDetailsModal from '../components/spending/ExpenseDetailsModal';

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Housing' },
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'personal', label: 'Personal' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'debt_repayment', label: 'Debt Repayment' },
  { value: 'other', label: 'Other' },
];

const SpendingPage = () => {
  const { currentPortfolio } = usePortfolio();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    if (!currentPortfolio?.id) return;
    setLoading(true);
    try {
      const data = await api.getExpenses(currentPortfolio.id);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [currentPortfolio?.id]);

  const handleCreate = async (data) => {
    try {
      await api.createExpense({
        ...data,
        portfolio_id: currentPortfolio.id,
      });
      await fetchExpenses();
      setShowFormModal(false);
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await api.updateExpense(selectedExpense.id, data);
      await fetchExpenses();
      setShowFormModal(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.deleteExpense(id);
      await fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowFormModal(true);
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate summaries
  const toMonthly = (amount, frequency) => {
    const multipliers = { weekly: 4.33, fortnightly: 2.17, monthly: 1, annual: 1/12 };
    return amount * (multipliers[frequency] || 1);
  };

  const totalMonthly = expenses.reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0);
  const totalAnnual = totalMonthly * 12;
  const retirementMonthly = expenses.reduce((sum, e) => {
    const monthly = toMonthly(e.amount, e.frequency);
    return sum + (monthly * (e.retirement_percentage / 100));
  }, 0);
  const uniqueCategories = [...new Set(expenses.map(e => e.category))].length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="spending-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spending</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your expenses and plan for retirement</p>
        </div>
        <Button
          onClick={() => {
            setSelectedExpense(null);
            setShowFormModal(true);
          }}
          className="bg-lime-400 text-gray-900 hover:bg-lime-500"
          data-testid="add-expense-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Annual Expenses</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAnnual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Expenses</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonthly)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Retirement Monthly</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(retirementMonthly)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{uniqueCategories}</p>
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
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Grid */}
      {filteredExpenses.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Expenses</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Track your spending to understand your expenses and plan for retirement.
            </p>
            <Button
              onClick={() => setShowFormModal(true)}
              className="bg-lime-400 text-gray-900 hover:bg-lime-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ExpenseFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        expense={selectedExpense}
        onSubmit={selectedExpense ? handleUpdate : handleCreate}
      />

      <ExpenseDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        expense={selectedExpense}
      />
    </div>
  );
};

export default SpendingPage;
