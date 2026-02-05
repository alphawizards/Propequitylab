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
      // Navigate to dashboard to see the demo data
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
          <div className="mx-auto sm:mx-0 mb-4 w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-lime-600" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Welcome to PropEquityLab!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Your journey to financial independence starts here. Track your property portfolio,
            plan your FIRE strategy, and visualize your path to wealth.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            How would you like to get started?
          </p>

          {/* Quick Start Option */}
          <div
            className="p-4 border-2 border-lime-200 rounded-lg bg-lime-50 hover:border-lime-400 transition-colors cursor-pointer"
            onClick={!isLoading ? handleLoadDemoData : undefined}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-lime-200 rounded-lg">
                <Rocket className="w-6 h-6 text-lime-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Quick Start with Demo Data</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Load sample properties, income, and expenses to explore the platform instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Start Fresh Option */}
          <div
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
            onClick={!isLoading ? handleStartFresh : undefined}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Start Fresh</h3>
                <p className="text-sm text-muted-foreground mt-1">
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
            className="w-full sm:w-auto"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Start Fresh
          </Button>
          <Button
            onClick={handleLoadDemoData}
            disabled={isLoading}
            className="w-full sm:w-auto bg-lime-400 text-gray-900 hover:bg-lime-500"
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
