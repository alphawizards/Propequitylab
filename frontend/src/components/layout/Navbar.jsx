import React from 'react';
import { ChevronDown, User } from 'lucide-react';

const Navbar = ({ user, activeTab, onTabChange }) => {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L20 20L8 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 8L20 20L32 32" stroke="#1a1f36" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onTabChange('scenarios')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'scenarios'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Scenarios
          </button>
          <button
            onClick={() => onTabChange('portfolios')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'portfolios'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Portfolios
          </button>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.name || 'User'}</span>
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border-2 border-lime-400">
          <User className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
