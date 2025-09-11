import { useState, useEffect, useCallback } from 'react';
import type { Transaction, MonthlySummary, Budget, BudgetStatus, RecurringTransaction } from '../types';
import { TransactionType } from '../types';
import {
  dbGetTransactions,
  dbAddTransaction,
  dbDeleteTransaction,
  dbUpdateTransaction,
  dbGetBudgets,
  dbSetBudget,
  dbDeleteBudget,
  dbDeleteUserData as dbDeleteAllUserData,
  dbGetRecurringTransactions,
  dbAddRecurringTransaction,
  dbUpdateRecurringTransaction,
  dbDeleteRecurringTransaction
} from '../utils/db';

export const useFinanceData = (userId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!userId) {
        setTransactions([]);
        setBudgets([]);
        setRecurringTransactions([]);
        return;
      }
      try {
        let userTransactions = await dbGetTransactions(userId);
        const userBudgets = await dbGetBudgets(userId);
        let userRecurring = await dbGetRecurringTransactions(userId);
        
        // Generate any missed transactions
        const { generated, updatedRules } = await generateMissedTransactions(userRecurring, userId);
        
        if (generated.length > 0) {
          userTransactions = [...userTransactions, ...generated].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          userRecurring = updatedRules;
        }

        setTransactions(userTransactions);
        setBudgets(userBudgets);
        setRecurringTransactions(userRecurring);

      } catch (error) {
        console.error("Failed to load data from IndexedDB", error);
      }
    }
    loadData();
  }, [userId]);

  const generateMissedTransactions = async (
    rules: RecurringTransaction[],
    userId: string
  ): Promise<{ generated: Transaction[], updatedRules: RecurringTransaction[] }> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const generated: Transaction[] = [];
    const updatedRules = [...rules];
    let hasChanges = false;

    for (let i = 0; i < updatedRules.length; i++) {
        let rule = { ...updatedRules[i] };
        let nextDueDate = new Date(rule.nextDueDate + 'T00:00:00');
        const endDate = rule.endDate ? new Date(rule.endDate + 'T00:00:00') : null;

        while (nextDueDate <= today && (!endDate || nextDueDate <= endDate)) {
            hasChanges = true;
            // Generate a transaction for this due date
            const newTransaction: Transaction = {
                id: new Date().toISOString() + Math.random(),
                date: nextDueDate.toISOString().split('T')[0],
                description: rule.description,
                amount: rule.amount,
                type: rule.type,
                category: rule.category,
                recurringTransactionId: rule.id,
            };
            await dbAddTransaction(newTransaction, userId);
            generated.push(newTransaction);

            // Calculate the *next* due date
            switch (rule.frequency) {
                case 'daily': nextDueDate.setDate(nextDueDate.getDate() + 1); break;
                case 'weekly': nextDueDate.setDate(nextDueDate.getDate() + 7); break;
                case 'monthly': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
                case 'yearly': nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); break;
            }
        }
        
        // Update the rule with the new nextDueDate
        const newNextDueDateString = nextDueDate.toISOString().split('T')[0];
        if (rule.nextDueDate !== newNextDueDateString) {
            rule.nextDueDate = newNextDueDateString;
            await dbUpdateRecurringTransaction(rule, userId);
            updatedRules[i] = rule;
        }
    }
    return { generated, updatedRules: hasChanges ? await dbGetRecurringTransactions(userId) : rules };
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!userId) return;
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().toISOString() + Math.random(),
    };
    await dbAddTransaction(newTransaction, userId);
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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

  const addRecurringTransaction = async (recTransaction: Omit<RecurringTransaction, 'id'>) => {
    if (!userId) return;
    const newRecTransaction: RecurringTransaction = {
      ...recTransaction,
      id: new Date().toISOString() + Math.random(),
    };
    await dbAddRecurringTransaction(newRecTransaction, userId);
    setRecurringTransactions(await dbGetRecurringTransactions(userId));
    // Trigger a check to generate transactions if start date is in the past
    const { generated } = await generateMissedTransactions([newRecTransaction], userId);
    if (generated.length > 0) {
      setTransactions(await dbGetTransactions(userId));
    }
  };

  const updateRecurringTransaction = async (recTransaction: RecurringTransaction) => {
    if (!userId) return;
    await dbUpdateRecurringTransaction(recTransaction, userId);
    const updatedRules = await dbGetRecurringTransactions(userId);
    setRecurringTransactions(updatedRules);
    // Trigger a check to generate transactions
    const { generated } = await generateMissedTransactions(updatedRules, userId);
    if (generated.length > 0) {
      setTransactions(await dbGetTransactions(userId));
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    if (!userId) return;
    await dbDeleteRecurringTransaction(id);
    setRecurringTransactions(prev => prev.filter(rt => rt.id !== id));
  };


  const deleteUserData = async (userIdToDelete: string) => {
    await dbDeleteAllUserData(userIdToDelete);
  };

  const setBudget = async (category: string, amount: number) => {
    if (!userId) return;
    await dbSetBudget({ category, amount }, userId);
    setBudgets(await dbGetBudgets(userId));
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
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
  };
};