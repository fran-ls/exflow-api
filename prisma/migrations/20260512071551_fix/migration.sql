/*
  Warnings:

  - You are about to drop the column `transactionCount` on the `daily_stats` table. All the data in the column will be lost.
  - You are about to drop the column `transactionCount` on the `monthly_stats` table. All the data in the column will be lost.
  - You are about to drop the column `transactionCount` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the column `transactionCount` on the `yearly_stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "daily_stats" DROP COLUMN "transactionCount",
ADD COLUMN     "expenseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "incomeCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "monthly_stats" DROP COLUMN "transactionCount",
ADD COLUMN     "expenseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "incomeCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "transactionCount",
ADD COLUMN     "expenseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "incomeCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "yearly_stats" DROP COLUMN "transactionCount",
ADD COLUMN     "expenseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "incomeCount" INTEGER NOT NULL DEFAULT 0;
