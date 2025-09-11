import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import { Trash } from './ui/Icons';
import type { Budget, BudgetStatus } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { formatCurrency } from '../utils/formatting';

interface BudgetProps {
  budgetStatus: BudgetStatus[];
  setBudget: (category: string, amount: number) => void;
  deleteBudget: (category: string) => void;
  budgets: Budget[];
  currency: string;
}

const getProgressBarColor = (progress: number) => {
  if (progress >= 100) return 'bg-red-500';
  if (progress > 80) return 'bg-yellow-500';
  return 'bg-primary-500';
};

const Budget: React.FC<BudgetProps> = ({ budgetStatus, setBudget, deleteBudget, budgets, currency }) => {
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const availableCategories = useMemo(() => {
    const budgetedCategories = budgets.map(b => b.category);
    return EXPENSE_CATEGORIES.filter(c => !budgetedCategories.includes(c));
  }, [budgets]);
  
  useEffect(() => {
    if (availableCategories.length > 0 && !newBudgetCategory) {
      setNewBudgetCategory(availableCategories[0]);
    }
  }, [availableCategories, newBudgetCategory]);

  const currencySymbol = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(1).find(part => part.type === 'currency')?.value || currency;
    } catch {
      return '$';
    }
  }, [currency]);


  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBudgetAmount);
    if (newBudgetCategory && amount > 0) {
      setBudget(newBudgetCategory, amount);
      setNewBudgetAmount('');
      // Find the next available category to select
      const currentIndex = availableCategories.findIndex(c => c === newBudgetCategory);
      const nextCategory = availableCategories[currentIndex + 1] || availableCategories[0] || '';
      setNewBudgetCategory(nextCategory);
    } else {
        alert("Please enter a valid positive amount.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Set New Budget</h2>
        <form onSubmit={handleSetBudget} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              id="category"
              value={newBudgetCategory}
              onChange={e => setNewBudgetCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={availableCategories.length === 0}
            >
              {availableCategories.length > 0 ? (
                availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              ) : (
                <option disabled>All categories have budgets</option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Budget</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">{currencySymbol}</span>
                </div>
                <input
                    id="amount"
                    type="number"
                    value={newBudgetAmount}
                    onChange={e => setNewBudgetAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="block w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                />
            </div>
          </div>
          <button type="submit" disabled={availableCategories.length === 0} className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">Set Budget</button>
        </form>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">Current Budgets</h2>
        {budgetStatus.length > 0 ? (
          <div className="space-y-6">
            {budgetStatus.map(status => (
              <div key={status.category} className="border-b dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{status.category}</h3>
                  <button onClick={() => deleteBudget(status.category)} className="text-gray-400 hover:text-red-500 p-1" aria-label={`Delete ${status.category} budget`}>
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center mb-1 text-sm text-gray-600 dark:text-gray-300">
                  <span>{formatCurrency(status.spent, currency)} of {formatCurrency(status.budget, currency)}</span>
                  <span className={`font-medium ${status.remaining < 0 ? 'text-red-500' : ''}`}>
                    {formatCurrency(Math.abs(status.remaining), currency)} {status.remaining < 0 ? 'over' : 'left'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                    <div 
                      className={`${getProgressBarColor(status.progress)} h-4 rounded-full transition-all duration-500`}
                      style={{ width: `${status.progress > 100 ? 100 : status.progress}%` }}
                    ></div>
                </div>
                 {status.progress >= 100 && (
                    <p className="text-red-500 text-sm mt-1 font-medium">Warning: You've exceeded your budget for {status.category}!</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">You haven't set any budgets yet. Use the form above to get started.</p>
        )}
      </Card>
    </div>
  );
};

export default Budget;