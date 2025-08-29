
import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import Card from './ui/Card';
import { Trash } from './ui/Icons';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { formatCurrency } from '../utils/formatting';

interface TransactionsProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => void;
  currency: string;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, deleteTransaction, currency }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const typeMatch = filterType === 'all' || t.type === filterType;
      const categoryMatch = filterCategory === 'all' || t.category === filterCategory;
      const searchMatch = searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && categoryMatch && searchMatch;
    });
  }, [transactions, filterType, filterCategory, searchTerm]);

  const allCategories = ['all', ...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">All Transactions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <input
          type="text"
          placeholder="Search descriptions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Types</option>
          <option value={TransactionType.INCOME}>Income</option>
          <option value={TransactionType.EXPENSE}>Expense</option>
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {allCategories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b dark:border-gray-700">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Description</th>
              <th className="p-2">Category</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(t => (
                <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3"><span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700">{t.category}</span></td>
                  <td className={`p-3 text-right font-medium ${t.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount, currency)}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => deleteTransaction(t.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Transactions;
