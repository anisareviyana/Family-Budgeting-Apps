
import React, { useState } from 'react';
import Card from './ui/Card';
import CategoryPieChart from './CategoryPieChart';
import type { MonthlySummary } from '../types';
import { ArrowDown, ArrowUp, Scale } from './ui/Icons';
import { formatCurrency } from '../utils/formatting';

interface ReportsProps {
  getAllMonths: () => string[];
  getMonthlySummary: (month: string) => MonthlySummary;
  getCategoryWiseExpenses: (month: string) => { name: string; value: number }[];
  currency: string;
}

const Reports: React.FC<ReportsProps> = ({ getAllMonths, getMonthlySummary, getCategoryWiseExpenses, currency }) => {
  const allMonths = getAllMonths();
  const [selectedMonth, setSelectedMonth] = useState<string>(allMonths[0] || '');

  const summary = getMonthlySummary(selectedMonth);
  const categoryExpenses = getCategoryWiseExpenses(selectedMonth);

  if (allMonths.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <h2 className="text-2xl font-bold mb-2">No Reports Available</h2>
          <p>Start by adding some transactions to generate reports.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="mt-2 sm:mt-0 w-full sm:w-auto px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {allMonths.map(month => (
            <option key={month} value={month}>
              {new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <h3 className="text-xl font-semibold mb-4">Summary for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <ArrowUp className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="font-bold text-lg">{formatCurrency(summary.totalIncome, currency)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <ArrowDown className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="font-bold text-lg">{formatCurrency(summary.totalExpenses, currency)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Scale className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Final Balance</p>
              <p className="font-bold text-lg">{formatCurrency(summary.balance, currency)}</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <h3 className="text-xl font-semibold mb-4">Expense Breakdown by Category</h3>
        {categoryExpenses.length > 0 ? (
          <CategoryPieChart data={categoryExpenses} currency={currency} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">No expense data for this month.</div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
