import { TransactionType } from '../generated/prisma/client';

export interface ITransaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  description?: string | null;
  date: Date;
  time: string;
  userId: string;
  walletId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTransaction {
  type: TransactionType;
  title: string;
  amount: number;
  description?: string;
  date: any;
  time: string;
  year: number;
  month: number;
  day: number;
  userId: string;
  walletId: string;
}

export interface IUpdateTransaction {
  type?: TransactionType;
  title?: string;
  amount?: number;
  description?: string;
  date?: any;
  time?: string;
}

export interface ITransactionFilters {
  type?: TransactionType;
  title?: string;
  userId?: string;
  walletId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  // year?: number;
  // month?: number;
  // day?: number;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  orderBy?: 'date' | 'amount' | 'title' | 'createdAt';
  order?: 'asc' | 'desc';
}