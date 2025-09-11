import React from 'react';
import type { RecurringTransaction } from '../types';
import { TransactionType } from '../types';
import Card from './ui/Card';
import { Trash, Edit, Repeat } from './ui/Icons';
import { formatCurrency } from '../utils/formatting';

interface RecurringTransactionsPageProps {
  recurringTransactions: RecurringTransaction[];
  onDelete: (id: string) => void;
  onEdit: (recTransaction: RecurringTransaction) => void;
  onAdd: () => void;
  currency: string;
}

const RecurringTransactionsPage: React.FC<RecurringTransactionsPageProps> = ({ recurringTransactions, onDelete, onEdit, onAdd, currency }) => {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold">Recurring Transactions</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage transactions that repeat automatically.</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition flex items-center space-x-2"
        >
          <Repeat className="h-5 w-5" />
          <span>Add New Rule</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b dark:border-gray-700">
            <tr>
              <th className="p-2">Description</th>
              <th className="p-2">Category</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2">Frequency</th>
              <th className="p-2">Next Due Date</th>
              <th className="p-2">End Date</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recurringTransactions.length > 0 ? (
              recurringTransactions.map(rt => (
                <tr key={rt.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3">{rt.description}</td>
                  <td className="p-3"><span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700">{rt.category}</span></td>
                  <td className={`p-3 text-right font-medium ${rt.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>
                    {rt.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(rt.amount, currency)}
                  </td>
                  <td className="p-3 capitalize">{rt.frequency}</td>
                  <td className="p-3">{rt.nextDueDate}</td>
                  <td className="p-3">{rt.endDate || 'Never'}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <button onClick={() => onEdit(rt)} className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400" aria-label="Edit recurring transaction">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => onDelete(rt.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400" aria-label="Delete recurring transaction">
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">No recurring transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecurringTransactionsPage;
