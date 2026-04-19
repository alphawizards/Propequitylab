import React from 'react';
import { ChevronDown, User } from 'lucide-react';

const Navbar = ({ user, activeTab, onTabChange }) => {
  return (
    <nav className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L20 20L8 32" style={{ stroke: 'oklch(var(--sage))' }} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 8L20 20L32 32" style={{ stroke: 'oklch(var(--ink))' }} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => onTabChange('scenarios')}
            className={`text-sm font-medium transition-colors duration-150 ${
              activeTab === 'scenarios' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Scenarios
          </button>
          <button
            onClick={() => onTabChange('portfolios')}
            className={`text-sm font-medium transition-colors duration-150 ${
              activeTab === 'portfolios' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Portfolios
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{user?.name || 'User'}</span>
        <div className="w-9 h-9 rounded-full bg-sage-soft flex items-center justify-center border-2 border-sage">
          <User className="w-5 h-5 text-sage" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
