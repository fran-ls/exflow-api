import { Transaction } from "../generated/prisma/client";
import { IPaginationMeta } from "./common.interface";

export interface DashboardStat {
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export interface TransactionByDay {
  day: string;
  items: Transaction[];
  meta: IPaginationMeta;
  totals: Totals;
}

interface Totals {
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
}