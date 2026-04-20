/**
 * WelcomeModal - First-time user welcome dialog
 *
 * Displays a welcome message for new users with options to:
 * - Load demo data for a quick start
 * - Start fresh with the onboarding wizard
 *
 * This component is lazy-loaded to reduce initial bundle size.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Rocket, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../hooks/use-toast';

const WelcomeModal = ({ isOpen, onClose, onComplete }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadDemoData = async () => {
    setIsLoading(true);
    try {
      await api.seedSampleData();
      toast({
        title: 'Demo data loaded!',
        description: 'Your portfolio has been populated with sample data.',
      });
      onComplete?.();
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to load demo data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load demo data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFresh = () => {
    onClose();
    navigate('/onboarding');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 mb-4 w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-sage-600" />
          </div>
          <DialogTitle className="text-2xl font-semibold text-[#111111]">
            Welcome to PropEquityLab!
          </DialogTitle>
          <DialogDescription className="text-base mt-2 text-[#6B7280]">
            Your journey to financial independence starts here. Track your property portfolio,
            plan your FIRE strategy, and visualize your path to wealth.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <p className="text-sm text-[#6B7280]">
            How would you like to get started?
          </p>

          {/* Quick Start Option */}
          <div
            className="p-4 border border-sage-200 rounded-xl bg-sage-50 hover:border-sage-400 transition-colors duration-150 cursor-pointer"
            onClick={!isLoading ? handleLoadDemoData : undefined}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-sage-100 rounded-lg">
                <Rocket className="w-6 h-6 text-sage-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#111111]">Quick Start with Demo Data</h3>
                <p className="text-sm text-[#6B7280] mt-1">
                  Load sample properties, income, and expenses to explore the platform instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Start Fresh Option */}
          <div
            className="p-4 border border-border rounded-xl hover:border-border/80 transition-colors duration-150 cursor-pointer"
            onClick={!isLoading ? handleStartFresh : undefined}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-muted rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#111111]">Start Fresh</h3>
                <p className="text-sm text-[#6B7280] mt-1">
                  Begin with an empty portfolio and enter your own financial data.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleStartFresh}
            disabled={isLoading}
            className="w-full sm:w-auto border-border hover:bg-muted"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Start Fresh
          </Button>
          <Button
            onClick={handleLoadDemoData}
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] transition-all duration-150"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading Demo Data...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Load Demo Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
