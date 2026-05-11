import { Transaction } from "../generated/prisma/client";
import { IPaginationMeta } from "./common.interface";

export interface DashboardStat {
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
}

export interface TransactionByDay {
  day: string;
  items: Transaction[];
  meta: IPaginationMeta;
}