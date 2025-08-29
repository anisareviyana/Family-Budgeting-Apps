import React from 'react';
import type { View } from '../types';
import { Sun, Moon, ChartPie, Rows, FileText, PiggyBank, Target, Settings } from './ui/Icons';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, theme, toggleTheme }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <PiggyBank className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">FinTrack</h1>
          </div>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <NavButton 
              label="Dashboard" 
              icon={<ChartPie className="h-5 w-5" />}
              isActive={currentView === 'dashboard'} 
              onClick={() => setCurrentView('dashboard')} 
            />
            <NavButton 
              label="Transactions" 
              icon={<Rows className="h-5 w-5" />}
              isActive={currentView === 'transactions'} 
              onClick={() => setCurrentView('transactions')} 
            />
            <NavButton 
              label="Budget" 
              icon={<Target className="h-5 w-5" />}
              isActive={currentView === 'budget'} 
              onClick={() => setCurrentView('budget')} 
            />
            <NavButton 
              label="Reports" 
              icon={<FileText className="h-5 w-5" />}
              isActive={currentView === 'reports'} 
              onClick={() => setCurrentView('reports')} 
            />
             <NavButton 
              label="Settings" 
              icon={<Settings className="h-5 w-5" />}
              isActive={currentView === 'settings'} 
              onClick={() => setCurrentView('settings')} 
            />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
