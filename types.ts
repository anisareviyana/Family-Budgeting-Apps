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
  recurringTransactionId?: string;
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  startDate: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  frequency: Frequency;
  endDate?: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
}

export type View = 'dashboard' | 'transactions' | 'reports' | 'budget' | 'profile' | 'recurring';

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

export interface User {
  email: string;
  name: string;
  passwordHash: string;
  phone?: string;
  profilePicture?: string; // base64 data URL
  lastLogin?: string; // ISO string
}