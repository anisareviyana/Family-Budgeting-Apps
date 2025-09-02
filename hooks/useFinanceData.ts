import { useState, useEffect, useCallback } from 'react';
import type { Transaction, MonthlySummary, Budget, BudgetStatus } from '../types';
import { TransactionType } from '../types';
import {
  dbGetTransactions,
  dbAddTransaction,
  dbDeleteTransaction,
  dbUpdateTransaction,
  dbGetBudgets,
  dbSetBudget,
  dbDeleteBudget,
  dbDeleteUserData as dbDeleteAllUserData
} from '../utils/db';

export const useFinanceData = (userId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!userId) {
        setTransactions([]);
        setBudgets([]);
        return;
      }
      try {
        const userTransactions = await dbGetTransactions(userId);
        const userBudgets = await dbGetBudgets(userId);
        setTransactions(userTransactions);
        setBudgets(userBudgets);
      } catch (error) {
        console.error("Failed to load data from IndexedDB", error);
      }
    }
    loadData();
  }, [userId]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!userId) return;
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().toISOString() + Math.random(),
    };
    await dbAddTransaction(newTransaction, userId);
    const userTransactions = await dbGetTransactions(userId);
    setTransactions(userTransactions);
  };

  const deleteTransaction = async (id: string) => {
    if (!userId) return;
    await dbDeleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const updateTransaction = async (transaction: Transaction) => {
    if (!userId) return;
    await dbUpdateTransaction(transaction, userId);
    setTransactions(prev => prev.map(t => (t.id === transaction.id ? transaction : t)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteUserData = async (userIdToDelete: string) => {
    await dbDeleteAllUserData(userIdToDelete);
  };

  const setBudget = async (category: string, amount: number) => {
    if (!userId) return;
    await dbSetBudget({ category, amount }, userId);
    const userBudgets = await dbGetBudgets(userId);
    setBudgets(userBudgets);
  };

  const deleteBudget = async (category: string) => {
    if (!userId) return;
    await dbDeleteBudget(category, userId);
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
    updateTransaction,
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