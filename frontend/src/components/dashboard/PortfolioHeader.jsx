import React from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { Button } from '../ui/button';

const PortfolioHeader = ({ portfolio, onAddProperty, onViewMembers }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">{portfolio.name}</h1>
        <button className="flex items-center gap-1 px-3 py-1 bg-lime-400 text-gray-900 text-sm font-medium rounded-full hover:bg-lime-500 transition-colors">
          {portfolio.type}
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onAddProperty}
          className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-lime-400 hover:bg-lime-50"
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          onClick={onViewMembers}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-lime-400 hover:bg-lime-50"
        >
          <Users className="w-4 h-4" />
          Members
        </Button>
      </div>
    </div>
  );
};

export default PortfolioHeader;
