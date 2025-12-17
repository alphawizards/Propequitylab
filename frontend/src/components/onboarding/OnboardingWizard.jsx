import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { usePortfolio } from '../../context/PortfolioContext';
import api from '../../services/api';
import WelcomeStep from './steps/WelcomeStep';
import AboutYouStep from './steps/AboutYouStep';
import IncomeStep from './steps/IncomeStep';
import SpendingStep from './steps/SpendingStep';
import AssetsStep from './steps/AssetsStep';
import LiabilitiesStep from './steps/LiabilitiesStep';
import GoalsStep from './steps/GoalsStep';
import SummaryStep from './steps/SummaryStep';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { ArrowLeft, X } from 'lucide-react';

const STEPS = [
  { id: 0, name: 'Welcome', component: WelcomeStep },
  { id: 1, name: 'About You', component: AboutYouStep },
  { id: 2, name: 'Income', component: IncomeStep },
  { id: 3, name: 'Spending', component: SpendingStep },
  { id: 4, name: 'Assets', component: AssetsStep },
  { id: 5, name: 'Liabilities', component: LiabilitiesStep },
  { id: 6, name: 'Goals', component: GoalsStep },
  { id: 7, name: 'Summary', component: SummaryStep },
];

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { user, updateUser, completeOnboarding, skipOnboarding } = useUser();
  const { currentPortfolio, createPortfolio } = usePortfolio();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    // About You
    name: user?.name || '',
    date_of_birth: user?.date_of_birth || '',
    planning_type: 'individual',
    country: 'Australia',
    state: 'NSW',
    partner_name: '',
    partner_dob: '',
    // Income
    income_sources: [],
    // Spending
    expenses: [],
    annual_spending: 60000,
    // Assets
    properties: [],
    other_assets: [],
    // Liabilities
    liabilities: [],
    // Goals
    retirement_age: 60,
    target_equity: 5000000,
    target_passive_income: 150000,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Ensure portfolio exists
  useEffect(() => {
    const ensurePortfolio = async () => {
      if (!currentPortfolio) {
        try {
          await createPortfolio('My Portfolio', 'actual');
        } catch (error) {
          console.error('Failed to create portfolio:', error);
        }
      }
    };
    ensurePortfolio();
  }, [currentPortfolio, createPortfolio]);

  const updateWizardData = (data) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      // Save step data to backend
      await api.saveOnboardingStep(currentStep, { data: wizardData });
      
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to save step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = async () => {
    await skipOnboarding();
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save all data
      if (currentPortfolio?.id) {
        // Save income sources
        for (const income of wizardData.income_sources) {
          await api.createIncomeSource({
            ...income,
            portfolio_id: currentPortfolio.id,
          });
        }
        
        // Save expenses
        for (const expense of wizardData.expenses) {
          await api.createExpense({
            ...expense,
            portfolio_id: currentPortfolio.id,
          });
        }
        
        // Save other assets
        for (const asset of wizardData.other_assets) {
          await api.createAsset({
            ...asset,
            portfolio_id: currentPortfolio.id,
          });
        }
        
        // Save liabilities
        for (const liability of wizardData.liabilities) {
          await api.createLiability({
            ...liability,
            portfolio_id: currentPortfolio.id,
          });
        }
        
        // Update portfolio goals
        await api.updatePortfolio(currentPortfolio.id, {
          goal_settings: {
            retirement_age: wizardData.retirement_age,
            equity_target: wizardData.target_equity,
            passive_income_target: wizardData.target_passive_income,
          },
        });
      }
      
      // Mark onboarding complete
      await completeOnboarding();
      updateUser({ name: wizardData.name, onboarding_completed: true });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep > 0 && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <path d="M8 8L20 20L8 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32 8L20 20L32 32" stroke="#1a1f36" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">Zapiio</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {currentStep > 0 && (
          <div className="max-w-4xl mx-auto mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {STEPS.slice(1).map((step, index) => (
                <span
                  key={step.id}
                  className={`text-xs ${
                    index + 1 <= currentStep ? 'text-lime-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {step.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>
      
      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <CurrentStepComponent
          data={wizardData}
          updateData={updateWizardData}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          onComplete={handleComplete}
          isLoading={isLoading}
          portfolioId={currentPortfolio?.id}
        />
      </main>
    </div>
  );
};

export default OnboardingWizard;
