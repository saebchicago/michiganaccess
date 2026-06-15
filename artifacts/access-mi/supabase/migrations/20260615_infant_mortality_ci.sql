-- Migration: Add confidence interval columns to maternal_infant_health
-- and set a DEFAULT on data_years so suppressed-county rows still carry vintage.
--
-- Run with service-role key:
--   supabase db push  OR
--   psql $DATABASE_URL -f supabase/migrations/20260615_infant_mortality_ci.sql
--
-- Why nullable was proposed (and why we rejected it):
--   The seed script (seed-maternal-health.ts) does not set data_years, so any
--   upsert without an explicit value would fail a NOT NULL constraint. The
--   proposed fix was to make the column nullable. Owner ruling: do NOT make it
--   nullable. A suppressed county (infant_mortality_rate = null) still has a
--   known data vintage (2019-2023). The correct fix is to add a column DEFAULT
--   so that rows seeded without an explicit data_years value carry the vintage
--   automatically. The seed script should also be updated to set data_years
--   explicitly to "2019-2023" for MDHHS five-year average data.
--
-- CI column naming rationale:
--   "ci" alone is ambiguous (95% vs 90%? half-width vs bounds?).
--   Using explicit _lower and _upper bound columns matches the MetricValue
--   contract in src/types/data-layers.ts (ci_lower, ci_upper).

-- 1. Add default to data_years so existing NOT NULL constraint is safe when
--    seed script omits the field.
ALTER TABLE maternal_infant_health
  ALTER COLUMN data_years SET DEFAULT '2019-2023';

-- 2. Add confidence interval bound columns (MDHHS publishes 95% CI per county).
--    Nullable: suppressed counties have no CI because the rate itself is null.
ALTER TABLE maternal_infant_health
  ADD COLUMN IF NOT EXISTS infant_mortality_rate_ci_lower  numeric(6,2),
  ADD COLUMN IF NOT EXISTS infant_mortality_rate_ci_upper  numeric(6,2);

COMMENT ON COLUMN maternal_infant_health.infant_mortality_rate_ci_lower
  IS 'MDHHS 95% confidence interval lower bound for infant_mortality_rate. Null when rate is suppressed.';

COMMENT ON COLUMN maternal_infant_health.infant_mortality_rate_ci_upper
  IS 'MDHHS 95% confidence interval upper bound for infant_mortality_rate. Null when rate is suppressed.';

-- 3. After running this migration, update the Supabase TypeScript types:
--    npx supabase gen types typescript --project-id <id> > src/integrations/supabase/types.ts
--    Then remove the `unknown` cast workaround in src/lib/data-layers.ts once
--    maternal_infant_health appears in the generated types.
