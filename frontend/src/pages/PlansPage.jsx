import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  Flame,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import PlanFormModal from '../components/plans/PlanFormModal';
import PlanDetailsModal from '../components/plans/PlanDetailsModal';
import FIRECalculator from '../components/plans/FIRECalculator';


const PLAN_TYPE_INFO = {
  fire: { label: 'FIRE', icon: Flame, color: 'bg-orange-100 text-orange-700', description: 'Financial Independence, Retire Early' },
  lean_fire: { label: 'Lean FIRE', icon: Zap, color: 'bg-green-100 text-green-700', description: 'Minimal expenses approach' },
  fat_fire: { label: 'Fat FIRE', icon: Sparkles, color: 'bg-purple-100 text-purple-700', description: 'Comfortable lifestyle in retirement' },
  coast_fire: { label: 'Coast FIRE', icon: TrendingUp, color: 'bg-blue-100 text-blue-700', description: 'Let investments grow, stop saving' },
  barista_fire: { label: 'Barista FIRE', icon: DollarSign, color: 'bg-yellow-100 text-yellow-700', description: 'Part-time work in retirement' },
  traditional: { label: 'Traditional', icon: Calendar, color: 'bg-gray-100 text-gray-700', description: 'Standard retirement at 65+' },
  custom: { label: 'Custom', icon: Target, color: 'bg-lime-100 text-lime-700', description: 'Custom plan' },
};

const PlanCard = ({ plan, onEdit, onDelete, onView }) => {
  const typeInfo = PLAN_TYPE_INFO[plan.type] || PLAN_TYPE_INFO.custom;
  const Icon = typeInfo.icon;

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      data-testid={`plan-card-${plan.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{plan.name}</h3>
              <Badge variant="secondary" className={`mt-1 ${typeInfo.color}`}>
                {typeInfo.label}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(plan)}>
                <Target className="w-4 h-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(plan)}>
                <Edit className="w-4 h-4 mr-2" /> Edit Plan
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(plan.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {plan.description || typeInfo.description}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Retirement Age</p>
            <p className="text-lg font-bold text-gray-900">{plan.retirement_age}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Target Net Worth</p>
            <p className="text-lg font-bold text-lime-600">
              {plan.target_equity > 0 ? formatCurrency(plan.target_equity) : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Passive Income Goal</p>
            <p className="text-lg font-bold text-gray-900">
              {plan.target_passive_income > 0 ? `${formatCurrency(plan.target_passive_income)}/yr` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Withdrawal Rate</p>
            <p className="text-lg font-bold text-gray-900">{plan.target_withdrawal_rate || 4}%</p>
          </div>
        </div>

        {plan.projected_fire_age && (
          <div className="mt-4 p-3 bg-lime-50 rounded-lg">
            <p className="text-sm text-lime-700">
              <Flame className="w-4 h-4 inline mr-1" />
              Projected FIRE Age: <span className="font-bold">{plan.projected_fire_age}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PlansPage = () => {
  const { currentPortfolio } = usePortfolio();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchPlans = async () => {
    if (!currentPortfolio?.id) return;
    try {
      const data = await api.getPlans(currentPortfolio.id);
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!currentPortfolio?.id) return;
    try {
      const data = await api.getDashboardSummary(currentPortfolio.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchDashboardData();
  }, [currentPortfolio?.id]);

  const handleCreatePlan = async (planData) => {
    try {
      await api.createPlan({
        ...planData,
        portfolio_id: currentPortfolio.id,
      });
      await fetchPlans();
      setShowFormModal(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleUpdatePlan = async (planData) => {
    try {
      await api.updatePlan(selectedPlan.id, planData);
      await fetchPlans();
      setShowFormModal(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.deletePlan(planId);
      await fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setShowFormModal(true);
  };

  const handleView = (plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="plans-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Plans</h1>
          <p className="text-gray-500">Create and manage your FIRE plans and scenarios</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCalculator(true)}
            className="hover:bg-lime-50 hover:border-lime-400"
            data-testid="fire-calculator-btn"
          >
            <Flame className="w-4 h-4 mr-2" />
            FIRE Calculator
          </Button>
          <Button
            onClick={() => {
              setSelectedPlan(null);
              setShowFormModal(true);
            }}
            className="bg-lime-400 text-gray-900 hover:bg-lime-500"
            data-testid="create-plan-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-lime-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Plans</p>
                <p className="text-xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Net Worth</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.net_worth || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Savings</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.monthly_cashflow || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Savings Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {(dashboardData?.savings_rate || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-full bg-lime-100 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-lime-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plans Yet</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              Create your first financial plan to start tracking your path to financial independence.
            </p>
            <Button
              onClick={() => setShowFormModal(true)}
              className="bg-lime-400 text-gray-900 hover:bg-lime-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={handleDeletePlan}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PlanFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        plan={selectedPlan}
        onSubmit={selectedPlan ? handleUpdatePlan : handleCreatePlan}
      />

      <PlanDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        plan={selectedPlan}
        dashboardData={dashboardData}
      />

      <FIRECalculator
        open={showCalculator}
        onOpenChange={setShowCalculator}
        dashboardData={dashboardData}
      />
    </div>
  );
};

export default PlansPage;
