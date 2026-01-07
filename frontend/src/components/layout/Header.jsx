import React from 'react';
import { Bell, Search, User, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Header = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 w-64 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
          />
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          data-testid="theme-toggle-btn"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-lime-500 rounded-full"></span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-lime-100 dark:bg-lime-900 flex items-center justify-center border-2 border-lime-400">
            <User className="w-5 h-5 text-lime-700 dark:text-lime-300" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="ml-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
