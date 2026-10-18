import { DailyStat, MonthlyStat, YearlyStat } from "../generated/prisma/client";

export type DailyStatFilters = Partial<Record<keyof DailyStat, any>>;

export type MonthlyStatFilters = Partial<Record<keyof MonthlyStat, any>>;

export type YearlyStatFilters = Partial<Record<keyof YearlyStat, any>>;