import { WalletType } from '../generated/prisma/client';

export interface IWallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  expense: number;
  income: number;
  initBalance: number;
  transactionCount: number;
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
  transactionCount: number;
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
  transactionCount?: number;
}

export interface IWalletFilters {
  name?: string;
  type?: WalletType;
  userId?: string;
  minBalance?: number;
  maxBalance?: number;
  page?: number;
  limit?: number;
  orderBy?: 'name' | 'balance' | 'transactionCount' | 'createdAt';
  order?: 'asc' | 'desc';
}