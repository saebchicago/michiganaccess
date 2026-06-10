-- Facility provenance + nullable coordinates
--
-- Adds source-of-truth tracking to public.facilities so every row can be
-- traced back to the upstream verified extract (CMS Hospital General
-- Information, HRSA Health Center Service Delivery Sites). Drops the
-- NOT NULL constraint on latitude/longitude because CMS hospital records
-- do not carry coordinates; geocoding is a follow-up that should not
-- block the verified row count from landing.
--
-- Pairs with scripts/load-facilities-to-supabase.mjs (the seed loader)
-- and src/data/verifiedHealthFacilities.json (the extract).

ALTER TABLE public.facilities
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE public.facilities
  ALTER COLUMN latitude DROP NOT NULL,
  ALTER COLUMN longitude DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS facilities_source_uniq
  ON public.facilities (source, source_id)
  WHERE source IS NOT NULL;

CREATE INDEX IF NOT EXISTS facilities_county_type_idx
  ON public.facilities (county, facility_type);

COMMENT ON COLUMN public.facilities.source IS
  'Provenance tag for verified rows: CMS_HOSPITAL_GENERAL_INFO | HRSA_HEALTH_CENTER_SITES. NULL on hand-curated rows.';
COMMENT ON COLUMN public.facilities.source_id IS
  'Upstream-side unique identifier (CCN for CMS hospitals, NPI for HRSA sites, BHCMIS+address+name fallback when NPI missing).';
COMMENT ON COLUMN public.facilities.source_url IS
  'Canonical URL of the upstream dataset for re-verification.';
COMMENT ON COLUMN public.facilities.verified_at IS
  'When the row was last loaded from the verified extract (set by scripts/load-facilities-to-supabase.mjs).';
