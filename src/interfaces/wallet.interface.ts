import { TransactionType, WalletType } from '../generated/prisma/client';

export interface IWallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  expense: number;
  income: number;
  initBalance: number;
  incomeCount: number;
  expenseCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateWallet {
  name: string;
  type: WalletType;
  balance?: number;
  color: string;
  income?: number;
  expense?: number;
  initBalance: number;
  incomeCount: number;
  expenseCount: number;
  userId: string;
}

export interface IUpdateWallet {
  name?: string;
  type?: WalletType;
  balance?: number;
  color?: string;
  income?: number;
  expense?: number;
  initBalance?: number;
  incomeCount?: number;
  expenseCount?: number;
}

export interface IUpdateWalletBalance {
  amount: number;
  type: TransactionType;
}

export interface IWalletFilters {
  name?: string;
  type?: WalletType;
  userId?: string;
  minBalance?: number;
  maxBalance?: number;
  page?: number;
  limit?: number;
  orderBy?: 'name' | 'balance' | 'incomeCount' | 'expenseCount' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface IWalletSelect {
  id?: string;
  userId?: string;
}

export interface IWalletStatFilters {
  id?: string;
  userId?: string;
}

export interface WallletStat {
  balance: number;
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
}