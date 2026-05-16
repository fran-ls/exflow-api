-- DropIndex
DROP INDEX "daily_stats_day_idx";

-- DropIndex
DROP INDEX "daily_stats_day_key";

-- DropIndex
DROP INDEX "monthly_stats_month_idx";

-- DropIndex
DROP INDEX "monthly_stats_month_key";

-- DropIndex
DROP INDEX "yearly_stats_year_idx";

-- DropIndex
DROP INDEX "yearly_stats_year_key";

-- CreateIndex
CREATE INDEX "daily_stats_user_id_day_idx" ON "daily_stats"("user_id", "day");

-- CreateIndex
CREATE INDEX "monthly_stats_user_id_month_idx" ON "monthly_stats"("user_id", "month");

-- CreateIndex
CREATE INDEX "yearly_stats_user_id_year_idx" ON "yearly_stats"("user_id", "year");
