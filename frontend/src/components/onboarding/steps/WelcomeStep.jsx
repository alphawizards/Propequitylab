import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Rocket, Play, Clock } from 'lucide-react';

const WelcomeStep = ({ onNext, onSkip }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-lime-100 flex items-center justify-center mx-auto mb-8">
        <Rocket className="w-12 h-12 text-lime-600" />
      </div>
      
      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Let's build your financial future!
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        We'll guide you through setting up your property portfolio and financial goals.
        This will help us create accurate projections for your wealth journey.
      </p>
      
      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card 
          className="cursor-pointer hover:border-lime-400 hover:shadow-lg transition-all group"
          onClick={onNext}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-lime-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-lime-200 transition-colors">
              <Play className="w-8 h-8 text-lime-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Guided Setup</h3>
            <p className="text-gray-600 mb-4">
              Step-by-step walkthrough to set up your complete financial profile.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>5-10 minutes</span>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all group"
          onClick={onSkip}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
              <Rocket className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Start</h3>
            <p className="text-gray-600 mb-4">
              Jump straight to the dashboard and add details later.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Instant</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Features Preview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4">What we'll cover:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '👤', label: 'Your Profile' },
            { icon: '💰', label: 'Income' },
            { icon: '🏠', label: 'Properties' },
            { icon: '📊', label: 'Goals' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
