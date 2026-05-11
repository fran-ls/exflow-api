import { TransactionType } from "../generated/prisma/enums";

export interface IYearlyStat {
  id: string;
  year: number;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateYearlyStat {
  year: number;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
  userId: string;
}

export interface IUpdateYearlyStat {
  year?: number;
  income?: number;
  expense: number;
  balance?: number;
  transactionCount?: number;
}

export interface IUpdateBalance {
  year: number;
  type: TransactionType;
  amount: number;
  userId: string
}

export interface IYearlyStatFilters {
  year?: number;
  userId?: string;
  page?: number;
  limit?: number;
  orderBy?: 'year' | 'transactionCount' | 'createdAt';
  order?: 'asc' | 'desc';
}