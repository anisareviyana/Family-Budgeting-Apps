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
import { dbGetAllUsers, dbSaveUser, dbSaveSettings, dbGetSettings, dbDeleteUserData } from './utils/db';

const App: React.FC = () => {
    
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => sessionStorage.getItem('currentUser'));
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentUser = users.find(u => u.email === currentUserEmail) || null;
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [settings, setSettings] = useState<Settings>({ currency: 'IDR' });
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getMonthlySummary,
    getCategoryWiseExpenses,
    getMonthlyComparisonData,
    getAllMonths,
    budgets,
    setBudget,
    deleteBudget,
    getBudgetStatus,
    deleteUserData: deleteFinanceData
  } = useFinanceData(currentUserEmail);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      try {
        const allUsers = await dbGetAllUsers();
        setUsers(allUsers);
        const loggedInUserEmail = sessionStorage.getItem('currentUser');

        if (loggedInUserEmail) {
          const userSettings = await dbGetSettings(loggedInUserEmail);
          if (userSettings) {
            setTheme(userSettings.theme || 'light');
            setSettings({ currency: userSettings.currency || 'IDR' });
          }
        }
      } catch (e) {
        console.error("Failed to bootstrap app", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);
  
  useEffect(() => {
    const savePrefs = async () => {
      if (currentUserEmail) {
        await dbSaveSettings(currentUserEmail, { ...settings, theme });
      }
    };
    if (!isLoading) {
      savePrefs();
    }
  }, [settings, theme, currentUserEmail, isLoading]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };
  
  const updateUser = useCallback(async (updatedUser: User) => {
    await dbSaveUser(updatedUser);
    setUsers(users.map(u => u.email === updatedUser.email ? updatedUser : u));
  }, [users]);
  
  const handleLoginSuccess = async (email: string) => {
      sessionStorage.setItem('currentUser', email);
      setCurrentUserEmail(email);

      const allUsers = await dbGetAllUsers();
      setUsers(allUsers);
      
      const userSettings = await dbGetSettings(email);
      if (userSettings) {
        setTheme(userSettings.theme || 'light');
        setSettings({ currency: userSettings.currency || 'IDR' });
      } else {
        setTheme('light');
        setSettings({ currency: 'IDR' });
        await dbSaveSettings(email, { currency: 'IDR', theme: 'light' });
      }
      
      setCurrentView('dashboard');
  };

  const handleLogout = () => {
      sessionStorage.removeItem('currentUser');
      setCurrentUserEmail(null);
      setCurrentView('dashboard');
  };
  
  const handleDeleteAccount = async () => {
    if (!currentUserEmail) return;
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible and all your data will be lost.')) {
        await deleteFinanceData(currentUserEmail);
        const newUsers = users.filter(u => u.email !== currentUserEmail);
        setUsers(newUsers);
        handleLogout();
    }
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
  };

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'> | Transaction) => {
    if ('id' in transactionData && transactionData.id) {
      updateTransaction(transactionData as Transaction);
    } else {
      addTransaction(transactionData as Omit<Transaction, 'id'>);
    }
    handleCloseModal();
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
        return <Transactions transactions={transactions} deleteTransaction={deleteTransaction} currency={currency} onEditTransaction={handleOpenEditModal} />;
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-primary-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl mt-4 text-gray-700 dark:text-gray-300">Loading Your Financial Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
                onClose={handleCloseModal}
                onSaveTransaction={handleSaveTransaction}
                transactionToEdit={transactionToEdit}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;