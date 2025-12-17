import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Target,
  Home,
  DollarSign,
  CreditCard,
  PiggyBank,
  Settings,
  HelpCircle,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePortfolio } from '../../context/PortfolioContext';

const Sidebar = () => {
  const location = useLocation();
  const { currentPortfolio, portfolios } = usePortfolio();

  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Current Finances',
      icon: Wallet,
      href: '/finances',
      children: [
        { title: 'Income', href: '/finances/income', icon: DollarSign },
        { title: 'Spending', href: '/finances/spending', icon: CreditCard },
        { title: 'Properties', href: '/finances/properties', icon: Home },
        { title: 'Assets', href: '/finances/assets', icon: PiggyBank },
        { title: 'Liabilities', href: '/finances/liabilities', icon: CreditCard },
      ],
    },
    {
      title: 'Progress',
      icon: TrendingUp,
      href: '/progress',
    },
    {
      title: 'Plans',
      icon: Target,
      href: '/plans',
    },
  ];

  const bottomItems = [
    { title: 'Settings', icon: Settings, href: '/settings' },
    { title: 'Help Center', icon: HelpCircle, href: '/help' },
  ];

  const NavItem = ({ item, isChild = false }) => {
    const isActive = location.pathname === item.href || 
      (item.children && item.children.some(child => location.pathname === child.href));
    const hasChildren = item.children && item.children.length > 0;
    const [isOpen, setIsOpen] = React.useState(isActive);

    return (
      <div>
        <NavLink
          to={hasChildren ? '#' : item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            isChild ? 'ml-6' : '',
            isActive && !hasChildren
              ? 'bg-lime-400/20 text-lime-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <item.icon className={cn('w-5 h-5', isActive && !hasChildren ? 'text-lime-600' : '')} />
          <span className="flex-1">{item.title}</span>
          {hasChildren && (
            <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen ? 'rotate-180' : '')} />
          )}
        </NavLink>
        
        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <NavItem key={child.href} item={child} isChild />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L20 20L8 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 8L20 20L32 32" stroke="#1a1f36" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold text-gray-900">Zapiio</span>
        </div>
      </div>

      {/* Portfolio Selector */}
      <div className="p-4 border-b border-gray-100">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
              <Home className="w-4 h-4 text-gray-900" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {currentPortfolio?.name || 'No Portfolio'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {currentPortfolio?.type || 'Create one'}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
        
        {/* New Plan Button */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-lime-700 hover:bg-lime-50 transition-colors mt-4">
          <Plus className="w-5 h-5" />
          <span>New Plan</span>
        </button>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
        
        {/* Dev Mode Indicator */}
        <div className="mt-4 px-3 py-2 bg-amber-50 rounded-lg">
          <p className="text-xs font-medium text-amber-700">Dev Mode</p>
          <p className="text-xs text-amber-600">Auth disabled</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
