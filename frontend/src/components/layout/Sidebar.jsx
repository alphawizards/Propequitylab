import React, { useState } from 'react';
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
  ArrowRight,
  LineChart,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePortfolio } from '../../context/PortfolioContext';

const NAV_ITEMS = [
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
  {
    title: 'Projections',
    icon: LineChart,
    href: '/projections',
  },
];

const BOTTOM_ITEMS = [
  { title: 'Settings', icon: Settings, href: '/settings' },
  { title: 'Help Center', icon: HelpCircle, href: '/help' },
];

// Defined outside Sidebar so the component reference is stable across parent renders
const NavItem = ({ item, isChild = false, onNavigate }) => {
  const location = useLocation();
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
          } else if (onNavigate) {
            onNavigate();
          }
        }}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          isChild ? 'ml-6' : '',
          isActive && !hasChildren
            ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600'
            : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'
        )}
      >
        <item.icon className={cn('w-5 h-5', isActive && !hasChildren ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400')} />
        <span className="flex-1">{item.title}</span>
        {hasChildren && (
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen ? 'rotate-180' : '')} />
        )}
      </NavLink>

      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <NavItem key={child.href} item={child} isChild onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarContent = ({ onNavigate }) => {
  const { currentPortfolio } = usePortfolio();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-[#EAEAEA] dark:border-gray-800">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L20 20L8 32" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M32 8L20 20L32 32" stroke="#111111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xl font-semibold text-[#111111] dark:text-white">PropEquityLab</span>
        </div>
      </div>

      {/* Portfolio Selector */}
      <div className="p-4 border-b border-[#EAEAEA] dark:border-gray-800">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-gray-800 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-150">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Home className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[#111111] dark:text-white">
                {currentPortfolio?.name || 'No Portfolio'}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-gray-400 capitalize">
                {currentPortfolio?.type || 'Create one'}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* View Projections Button */}
      <div className="px-4 pb-4">
        <NavLink
          to="/projections"
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-150"
        >
          <ArrowRight className="w-5 h-5" />
          <span>View Projections</span>
        </NavLink>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-[#EAEAEA] dark:border-gray-800 space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white transition-colors duration-150"
          >
            <item.icon className="w-5 h-5 text-gray-400" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar — hidden below md */}
      <aside className="hidden md:flex w-[260px] bg-white dark:bg-gray-900 border-r border-[#EAEAEA] dark:border-gray-700 flex-col h-screen fixed left-0 top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar — visible below md */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-gray-900 border-b border-[#EAEAEA] dark:border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L20 20L8 32" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M32 8L20 20L32 32" stroke="#111111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-semibold text-[#111111] dark:text-white">PropEquityLab</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden fixed top-0 left-0 z-50 h-full w-[280px] bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-gray-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </div>
    </>
  );
};

export default Sidebar;
