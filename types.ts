export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export type View = 'dashboard' | 'transactions' | 'reports' | 'budget' | 'settings';

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface Budget {
  category: string;
  amount: number;
}

export interface BudgetStatus {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  progress: number;
}

export interface Settings {
  currency: string;
}
