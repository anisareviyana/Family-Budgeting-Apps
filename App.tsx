import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Budget from './components/Budget';
import SettingsPage from './components/Settings';
import AddTransactionModal from './components/AddTransactionModal';
import { useFinanceData } from './hooks/useFinanceData';
import { PlusCircle } from './components/ui/Icons';
import type { View, Transaction, Settings } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      return (storedTheme === 'dark' || storedTheme === 'light') ? storedTheme : 'light';
    }
    return 'light';
  });
  
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedSettings = window.localStorage.getItem('settings');
        if (storedSettings) {
            try {
                return JSON.parse(storedSettings);
            } catch (e) {
                console.error("Failed to parse settings from localStorage", e);
            }
        }
    }
    return { currency: 'USD' };
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    transactions,
    addTransaction,
    deleteTransaction,
    getMonthlySummary,
    getCategoryWiseExpenses,
    getMonthlyComparisonData,
    getAllMonths,
    budgets,
    setBudget,
    deleteBudget,
    getBudgetStatus,
  } = useFinanceData();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const renderView = () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const budgetStatus = getBudgetStatus(currentMonth);
    const currency = settings.currency;

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            summary={getMonthlySummary(currentMonth)}
            categoryExpenses={getCategoryWiseExpenses(currentMonth)}
            monthlyComparison={getMonthlyComparisonData(currentMonth)}
            budgetStatus={budgetStatus}
            currency={currency}
          />
        );
      case 'transactions':
        return (
          <Transactions 
            transactions={transactions} 
            deleteTransaction={deleteTransaction}
            currency={currency}
          />
        );
      case 'budget':
        return (
          <Budget 
            budgetStatus={budgetStatus}
            setBudget={setBudget}
            deleteBudget={deleteBudget}
            budgets={budgets}
            currency={currency}
          />
        );
      case 'reports':
        return (
          <Reports 
            getAllMonths={getAllMonths}
            getMonthlySummary={getMonthlySummary}
            getCategoryWiseExpenses={getCategoryWiseExpenses}
            currency={currency}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        );
      default:
        return <Dashboard 
                  summary={getMonthlySummary(currentMonth)}
                  categoryExpenses={getCategoryWiseExpenses(currentMonth)}
                  monthlyComparison={getMonthlyComparisonData(currentMonth)}
                  budgetStatus={budgetStatus}
                  currency={currency}
               />;
    }
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    setIsModalOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {renderView()}
      </main>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-110"
        aria-label="Add new transaction"
      >
        <PlusCircle className="h-8 w-8" />
      </button>
      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </div>
  );
};

export default App;
