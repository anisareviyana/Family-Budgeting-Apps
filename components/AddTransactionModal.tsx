
import React, { useState, useEffect } from 'react';
import { TransactionType } from '../types';
import type { Transaction } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

interface AddTransactionModalProps {
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<string[]>(EXPENSE_CATEGORIES);

  useEffect(() => {
    if (type === TransactionType.EXPENSE) {
      setCategories(EXPENSE_CATEGORIES);
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategories(INCOME_CATEGORIES);
      setCategory(INCOME_CATEGORIES[0]);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category || !date) {
      alert("Please fill all fields.");
      return;
    }
    onAddTransaction({
      amount: parseFloat(amount),
      description,
      category,
      date,
      type
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Transaction</h2>
          
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`w-1/2 py-2 rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'dark:text-gray-300'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`w-1/2 py-2 rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'dark:text-gray-300'}`}
            >
              Income
            </button>
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Coffee, Salary"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
