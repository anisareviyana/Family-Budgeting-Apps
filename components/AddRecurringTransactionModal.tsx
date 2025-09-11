import React, { useState, useEffect, useMemo } from 'react';
import { TransactionType, Frequency } from '../types';
import type { RecurringTransaction } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

interface AddRecurringTransactionModalProps {
  onClose: () => void;
  onSaveRecurringTransaction: (recTransaction: Omit<RecurringTransaction, 'id'> | RecurringTransaction) => void;
  recurringTransactionToEdit?: RecurringTransaction | null;
  currency: string;
}

const AddRecurringTransactionModal: React.FC<AddRecurringTransactionModalProps> = ({ onClose, onSaveRecurringTransaction, recurringTransactionToEdit, currency }) => {
  const isEditMode = !!recurringTransactionToEdit;

  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [categories, setCategories] = useState<string[]>(EXPENSE_CATEGORIES);

  const currencySymbol = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(1).find(part => part.type === 'currency')?.value || currency;
    } catch {
      return '$';
    }
  }, [currency]);

  useEffect(() => {
    if (isEditMode && recurringTransactionToEdit) {
      setType(recurringTransactionToEdit.type);
      setAmount(String(recurringTransactionToEdit.amount));
      setDescription(recurringTransactionToEdit.description);
      setCategory(recurringTransactionToEdit.category);
      setStartDate(recurringTransactionToEdit.startDate);
      setEndDate(recurringTransactionToEdit.endDate || '');
      setFrequency(recurringTransactionToEdit.frequency);
    } else {
      // Reset form for "Add" mode
      setType(TransactionType.EXPENSE);
      setAmount('');
      setDescription('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setFrequency('monthly');
    }
  }, [recurringTransactionToEdit, isEditMode]);

  useEffect(() => {
    const newCategories = type === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    setCategories(newCategories);
    
    if (!newCategories.includes(category)) {
      setCategory(newCategories[0]);
    }
  }, [type, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category || !startDate || !frequency) {
      alert("Please fill all required fields.");
      return;
    }

    if (endDate && startDate > endDate) {
      alert("End date cannot be before the start date.");
      return;
    }

    const recTransactionData = {
      amount: parseFloat(amount),
      description,
      category,
      startDate,
      endDate: endDate || undefined,
      frequency,
      type,
      nextDueDate: startDate, // The first transaction is due on the start date
    };

    if (isEditMode && recurringTransactionToEdit) {
      // Preserve nextDueDate if start date hasn't changed to avoid re-running past transactions
      const finalData = { 
        ...recTransactionData, 
        id: recurringTransactionToEdit.id,
        nextDueDate: recurringTransactionToEdit.startDate === startDate ? recurringTransactionToEdit.nextDueDate : startDate
      };
      onSaveRecurringTransaction(finalData);
    } else {
      onSaveRecurringTransaction(recTransactionData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{isEditMode ? 'Edit Recurring Rule' : 'Add Recurring Rule'}</h2>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-1/2 py-2 rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'dark:text-gray-300'}`}>Expense</button>
              <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-1/2 py-2 rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'dark:text-gray-300'}`}>Income</button>
            </div>
            
            <div>
              <label htmlFor="rec-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
               <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">{currencySymbol}</span>
                  </div>
                  <input id="rec-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="block w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
              </div>
            </div>

            <div>
              <label htmlFor="rec-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <input id="rec-description" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Monthly Rent" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
            </div>
            
            <div>
              <label htmlFor="rec-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select id="rec-category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="rec-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
              <select id="rec-frequency" value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="rec-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input id="rec-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
              </div>
              <div>
                <label htmlFor="rec-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date (Optional)</label>
                <input id="rec-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition">{isEditMode ? 'Save Changes' : 'Add Rule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecurringTransactionModal;