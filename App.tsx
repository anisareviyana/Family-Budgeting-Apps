import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Budget from './components/Budget';
import ProfilePage from './components/ProfilePage';
import Auth from './components/Auth';
import AddTransactionModal from './components/AddTransactionModal';
import { useFinanceData } from './hooks/useFinanceData';
import { PlusCircle } from './components/ui/Icons';
import type { View, Transaction, Settings, User } from './types';

const App: React.FC = () => {
    
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem('currentUser'));
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  });
  
  const currentUser = users.find(u => u.email === currentUserEmail) || null;
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
          const storedTheme = window.localStorage.getItem(`theme_${currentUserEmail}`);
          return (storedTheme === 'dark' || storedTheme === 'light') ? storedTheme : 'light';
      }
      return 'light';
  });
  
  const getSettingsKey = (userId: string | null) => userId ? `settings_${userId}` : null;
  
  const [settings, setSettings] = useState<Settings>(() => {
    const settingsKey = getSettingsKey(currentUserEmail);
    if (settingsKey) {
        const storedSettings = localStorage.getItem(settingsKey);
        if (storedSettings) return JSON.parse(storedSettings);
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
    deleteUserData
  } = useFinanceData(currentUserEmail);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    if(currentUserEmail) {
        localStorage.setItem(`theme_${currentUserEmail}`, theme);
    }
  }, [theme, currentUserEmail]);
  
  useEffect(() => {
    const settingsKey = getSettingsKey(currentUserEmail);
    if(settingsKey) {
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    }
  }, [settings, currentUserEmail]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };
  
  const updateUser = useCallback((updatedUser: User) => {
    const newUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  }, [users]);
  
  const handleLoginSuccess = (email: string) => {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      setUsers(allUsers);
      
      setCurrentUserEmail(email);
      localStorage.setItem('currentUser', email);
      
      const userTheme = localStorage.getItem(`theme_${email}`);
      setTheme(userTheme === 'dark' ? 'dark' : 'light');

      const settingsKey = getSettingsKey(email);
      const storedSettings = settingsKey ? localStorage.getItem(settingsKey) : null;
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings({ currency: 'USD' });
      }
      setCurrentView('dashboard');
  };

  const handleLogout = () => {
      setCurrentUserEmail(null);
      localStorage.removeItem('currentUser');
      setCurrentView('dashboard');
  };
  
  const handleDeleteAccount = () => {
    if (!currentUserEmail) return;
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible and all your data will be lost.')) {
        deleteUserData(currentUserEmail);
        const newUsers = users.filter(u => u.email !== currentUserEmail);
        setUsers(newUsers);
        localStorage.setItem('users', JSON.stringify(newUsers));
        handleLogout();
    }
  };

  const renderView = () => {
    if (!currentUser) return null;

    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const budgetStatus = getBudgetStatus(currentMonth);
    const currency = settings.currency;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard summary={getMonthlySummary(currentMonth)} categoryExpenses={getCategoryWiseExpenses(currentMonth)} monthlyComparison={getMonthlyComparisonData(currentMonth)} budgetStatus={budgetStatus} currency={currency} />;
      case 'transactions':
        return <Transactions transactions={transactions} deleteTransaction={deleteTransaction} currency={currency} />;
      case 'budget':
        return <Budget budgetStatus={budgetStatus} setBudget={setBudget} deleteBudget={deleteBudget} budgets={budgets} currency={currency} />;
      case 'reports':
        return <Reports getAllMonths={getAllMonths} getMonthlySummary={getMonthlySummary} getCategoryWiseExpenses={getCategoryWiseExpenses} currency={currency} />;
      case 'profile':
        return <ProfilePage user={currentUser} onUpdateUser={updateUser} theme={theme} onToggleTheme={toggleTheme} settings={settings} onSettingsChange={handleSettingsChange} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />;
      default:
        return <Dashboard summary={getMonthlySummary(currentMonth)} categoryExpenses={getCategoryWiseExpenses(currentMonth)} monthlyComparison={getMonthlyComparisonData(currentMonth)} budgetStatus={budgetStatus} currency={currency} />;
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
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {!currentUser ? (
          <Auth onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {renderView()}
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
          </>
        )}
      </main>
    </div>
  );
};

export default App;