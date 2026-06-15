-- Create public.maternal_infant_health
--
-- Source: MaternalInfantHealth interface (src/types/data-layers.ts),
--         seed-maternal-health.ts column set, getMaternalHealth() select("*").
--
-- Natural key: county (seed upserts onConflict: "county").
-- data_years: TEXT NOT NULL. Vintage must travel with the data; no DEFAULT.
--   NOTE: seed-maternal-health.ts does not currently supply data_years.
--   That script must be patched to add data_years to every row before it is
--   used as a loader (separate task). Rows loaded via Lovable Cloud SQL editor
--   or CSV import must include data_years explicitly.
-- infant_mortality_rate: nullable (NULL = suppressed county, not missing table).
-- ci_lower / ci_upper: deferred; land with the type + seed + UI change that uses CI.

CREATE TABLE IF NOT EXISTS public.maternal_infant_health (
    id                           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    county                       text        NOT NULL,
    infant_mortality_rate        numeric     NULL,
    infant_mortality_rate_black  numeric     NULL,
    infant_mortality_rate_white  numeric     NULL,
    preterm_birth_rate           numeric     NULL,
    low_birth_weight_rate        numeric     NULL,
    prenatal_care_first_trimester numeric    NULL,
    teen_birth_rate              numeric     NULL,
    birthing_hospitals           numeric     NULL,
    ob_gyn_per_10k               numeric     NULL,
    midwives_per_10k             numeric     NULL,
    data_years                   text        NOT NULL,
    CONSTRAINT maternal_infant_health_county_key UNIQUE (county)
  );

ALTER TABLE public.maternal_infant_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Maternal infant health is publicly readable"
  ON public.maternal_infant_health
  FOR SELECT
  TO anon, authenticated
  USING (true);
