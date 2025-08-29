import React from 'react';
import Card from './ui/Card';
import CategoryPieChart from './CategoryPieChart';
import MonthlyComparisonBarChart from './MonthlyComparisonBarChart';
import type { MonthlySummary, BudgetStatus } from '../types';
import { ArrowUp, ArrowDown, Scale } from './ui/Icons';
import { formatCurrency } from '../utils/formatting';

interface DashboardProps {
  summary: MonthlySummary;
  categoryExpenses: { name: string; value: number }[];
  monthlyComparison: { name: string; income: number; expenses: number }[];
  budgetStatus: BudgetStatus[];
  currency: string;
}

const SummaryCard: React.FC<{ title: string; amount: number; icon: React.ReactNode, currency: string }> = ({ title, amount, icon, currency }) => (
  <Card>
    <div className="flex items-center space-x-4">
      <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(amount, currency)}</p>
      </div>
    </div>
  </Card>
);

const getProgressBarColor = (progress: number) => {
  if (progress >= 100) return 'bg-red-500';
  if (progress > 80) return 'bg-yellow-500';
  return 'bg-primary-500';
};

const Dashboard: React.FC<DashboardProps> = ({ summary, categoryExpenses, monthlyComparison, budgetStatus, currency }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Monthly Dashboard ({new Date(summary.month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })})</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Income" amount={summary.totalIncome} icon={<ArrowUp className="h-6 w-6" />} currency={currency}/>
        <SummaryCard title="Total Expenses" amount={summary.totalExpenses} icon={<ArrowDown className="h-6 w-6" />} currency={currency} />
        <SummaryCard title="Balance" amount={summary.balance} icon={<Scale className="h-6 w-6" />} currency={currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
          {categoryExpenses.length > 0 ? (
            <CategoryPieChart data={categoryExpenses} currency={currency} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">No expense data for this month.</div>
          )}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-4">This Month vs. Last Month</h3>
          {monthlyComparison.some(d => d.income > 0 || d.expenses > 0) ? (
            <MonthlyComparisonBarChart data={monthlyComparison} currency={currency} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">Not enough data for comparison.</div>
          )}
        </Card>
      </div>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
        {budgetStatus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {budgetStatus.map(status => (
              <div key={status.category}>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="font-medium">{status.category}</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatCurrency(status.spent, currency)} / {formatCurrency(status.budget, currency)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`${getProgressBarColor(status.progress)} h-2.5 rounded-full`} 
                    style={{ width: `${status.progress > 100 ? 100 : status.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">No budgets set. Go to the Budget page to add one.</div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
