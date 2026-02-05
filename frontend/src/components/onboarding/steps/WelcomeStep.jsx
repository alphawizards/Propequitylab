import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Rocket, Play, Clock, User, Coins, Home, TrendingUp } from 'lucide-react';

const WelcomeStep = ({ onNext, onSkip }) => {
  const steps = [
    { icon: User, label: 'Profile', active: true },
    { icon: Coins, label: 'Income', active: false },
    { icon: Home, label: 'Properties', active: false },
    { icon: TrendingUp, label: 'Goals', active: false },
  ];

  return (
    <div className="text-center max-w-3xl mx-auto">
      {/* Background gradient decoration for light mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-lime-200/30 via-lime-100/20 to-transparent rounded-full blur-3xl pointer-events-none dark:hidden" />
      
      {/* Dark mode leaf icon */}
      <div className="hidden dark:block mb-6">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto text-lime-400">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
        </svg>
      </div>
      
      {/* Title */}
      <h1 className="text-4xl font-bold text-foreground mb-4">
        <span className="dark:hidden">Let's build your financial future</span>
        <span className="hidden dark:inline">Let's build your financial future!</span>
      </h1>
      <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
        We'll help you create accurate projections for your wealth journey by setting up your property portfolio and goals.
      </p>
      
      {/* Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Guided Setup Card */}
        <Card 
          className="cursor-pointer transition-all duration-300 bg-card text-card-foreground border-0 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)] hover:shadow-[6px_6px_0px_0px_rgba(163,230,53,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 dark:shadow-none dark:border-2 dark:border-lime-500/50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900"
          onClick={onNext}
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-lime-400 flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-900 fill-gray-900" />
            </div>
            <h3 className="text-xl font-semibold text-lime-500 mb-2 dark:text-lime-400">Guided Setup</h3>
            <p className="text-muted-foreground mb-4">
              Step-by-step walkthrough to set up your complete financial profile.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>5-10 minutes</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Start Card */}
        <Card 
          className="cursor-pointer transition-all duration-300 bg-card text-card-foreground border-0 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)] hover:shadow-[6px_6px_0px_0px_rgba(163,230,53,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 dark:shadow-none dark:border dark:border-gray-700 dark:bg-gray-800/50"
          onClick={onSkip}
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-lime-400 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Quick Start</h3>
            <p className="text-muted-foreground mb-4">
              Jump straight to the dashboard and add details later.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Instant</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Steps Preview - Light Mode */}
      <div className="dark:hidden">
        <div className="flex items-center justify-center gap-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                  step.active ? 'bg-lime-100 text-lime-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-sm ${step.active ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 h-px bg-gray-200 mb-6" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Steps Preview - Dark Mode */}
      <div className="hidden dark:block">
        <div className="inline-flex items-center gap-1 p-1.5 bg-gray-800 rounded-full border border-gray-700">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                step.active 
                  ? 'bg-lime-400 text-gray-900' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <step.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
