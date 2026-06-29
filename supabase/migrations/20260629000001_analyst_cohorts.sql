-- Analyst cohort snapshots for cross-device sharing (UC8 Phase 2).
-- Privacy: no user accounts. share_id is an unlisted UUID link (like an unlisted doc).
-- No PII stored. Criteria JSON only.

CREATE TABLE public.analyst_cohorts (
  share_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  criteria jsonb NOT NULL,
  enabled jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_count integer NOT NULL DEFAULT 0 CHECK (result_count >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT analyst_cohorts_name_len CHECK (char_length(name) BETWEEN 1 AND 120),
  CONSTRAINT analyst_cohorts_criteria_object CHECK (jsonb_typeof(criteria) = 'object'),
  CONSTRAINT analyst_cohorts_enabled_object CHECK (jsonb_typeof(enabled) = 'object')
);

CREATE INDEX idx_analyst_cohorts_created ON public.analyst_cohorts (created_at DESC);

ALTER TABLE public.analyst_cohorts ENABLE ROW LEVEL SECURITY;

-- Anonymous publish (validated payload size)
CREATE POLICY "Anyone can publish analyst cohort"
  ON public.analyst_cohorts FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND result_count >= 0
    AND pg_column_size(criteria) <= 8192
    AND pg_column_size(enabled) <= 4096
  );

-- No direct table reads (use RPC below)
CREATE POLICY "Deny direct reads on analyst cohorts"
  ON public.analyst_cohorts FOR SELECT
  USING (false);

CREATE POLICY "Deny updates on analyst cohorts"
  ON public.analyst_cohorts FOR UPDATE
  USING (false);

CREATE POLICY "Deny deletes on analyst cohorts"
  ON public.analyst_cohorts FOR DELETE
  USING (false);

-- Fetch a single cohort by unlisted share_id
CREATE OR REPLACE FUNCTION public.get_analyst_cohort(p_share_id uuid)
RETURNS TABLE (
  share_id uuid,
  name text,
  criteria jsonb,
  enabled jsonb,
  result_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.share_id,
    c.name,
    c.criteria,
    c.enabled,
    c.result_count,
    c.created_at,
    c.updated_at
  FROM public.analyst_cohorts c
  WHERE c.share_id = p_share_id
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_analyst_cohort(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_analyst_cohort(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_analyst_cohort(uuid) TO authenticated;

COMMENT ON TABLE public.analyst_cohorts IS
  'Unlisted shareable analyst cohort snapshots. Retrieved only via get_analyst_cohort(share_id).';