import { useState, useEffect, useCallback } from 'react';
import type { Transaction, MonthlySummary, Budget, BudgetStatus } from '../types';
import { TransactionType } from '../types';

export const useFinanceData = (userId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const getStorageKey = useCallback((key: string) => {
    if (!userId) return null;
    return `${key}_${userId}`;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setBudgets([]);
      return;
    }
    try {
      const transactionsKey = getStorageKey('transactions');
      const budgetsKey = getStorageKey('budgets');

      if(transactionsKey) {
        const storedTransactions = localStorage.getItem(transactionsKey);
        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        } else {
          setTransactions([]);
        }
      }

      if(budgetsKey) {
        const storedBudgets = localStorage.getItem(budgetsKey);
        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        } else {
          setBudgets([]);
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, [userId, getStorageKey]);

  useEffect(() => {
    if (!userId) return;
    try {
      const transactionsKey = getStorageKey('transactions');
      const budgetsKey = getStorageKey('budgets');
      if (transactionsKey) localStorage.setItem(transactionsKey, JSON.stringify(transactions));
      if (budgetsKey) localStorage.setItem(budgetsKey, JSON.stringify(budgets));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [transactions, budgets, userId, getStorageKey]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().toISOString() + Math.random(),
    };
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const deleteUserData = (userIdToDelete: string) => {
    try {
      localStorage.removeItem(`transactions_${userIdToDelete}`);
      localStorage.removeItem(`budgets_${userIdToDelete}`);
      localStorage.removeItem(`settings_${userIdToDelete}`);
    } catch (error) {
       console.error("Failed to delete user data from localStorage", error);
    }
  };

  const setBudget = (category: string, amount: number) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.category === category);
      if (existing) {
        return prev.map(b => b.category === category ? { ...b, amount } : b);
      }
      return [...prev, { category, amount }];
    });
  };

  const deleteBudget = (category: string) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
  };

  const getMonthlySummary = useCallback<(month: string) => MonthlySummary>((month: string) => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(month));
    
    const totalIncome = monthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [transactions]);

  const getCategoryWiseExpenses = useCallback((month: string) => {
    const monthExpenses = transactions.filter(t => t.date.startsWith(month) && t.type === TransactionType.EXPENSE);
    
    const categoryData = monthExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const getMonthlyComparisonData = useCallback((currentMonth: string) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonthSummary = getMonthlySummary(currentMonth);
    const prevMonthSummary = getMonthlySummary(prevMonth);

    return [
      { name: 'Previous Month', expenses: prevMonthSummary.totalExpenses, income: prevMonthSummary.totalIncome },
      { name: 'Current Month', expenses: currentMonthSummary.totalExpenses, income: currentMonthSummary.totalIncome },
    ];
  }, [transactions, getMonthlySummary]);

  const getAllMonths = useCallback(() => {
    const months = new Set(transactions.map(t => t.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [transactions]);
  
  const getBudgetStatus = useCallback((month: string): BudgetStatus[] => {
    const monthExpenses = transactions.filter(t => t.date.startsWith(month) && t.type === TransactionType.EXPENSE);
    
    return budgets.map(budget => {
      const spent = monthExpenses
        .filter(e => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const remaining = budget.amount - spent;
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining,
        progress,
      };
    }).sort((a, b) => b.progress - a.progress);
  }, [transactions, budgets]);

  return {
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
    deleteUserData,
  };
};