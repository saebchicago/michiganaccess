DROP POLICY IF EXISTS "Reports are publicly readable" ON public.community_reports;
DROP POLICY IF EXISTS "Appeal outcomes are publicly readable" ON public.appeal_outcomes;

REVOKE SELECT ON public.community_reports FROM anon;
REVOKE SELECT ON public.appeal_outcomes FROM anon;
GRANT SELECT ON public.community_reports TO authenticated;
GRANT SELECT ON public.appeal_outcomes TO authenticated;

CREATE POLICY "Staff can read community reports"
ON public.community_reports FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can read appeal outcomes"
ON public.appeal_outcomes FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.community_report_counts(_county text DEFAULT NULL, _place_slug text DEFAULT NULL)
RETURNS TABLE (category text, report_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.category, count(*)::bigint
  FROM public.community_reports r
  WHERE (_county IS NULL OR r.county = _county)
    AND (_place_slug IS NULL OR r.place_slug = _place_slug)
  GROUP BY r.category
$$;

CREATE OR REPLACE FUNCTION public.appeal_outcome_summary()
RETURNS TABLE (total_outcomes bigint, wins bigint, total_saved numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*)::bigint,
    count(*) FILTER (WHERE a.outcome = 'won')::bigint,
    coalesce(sum(a.estimated_savings) FILTER (WHERE a.outcome = 'won'), 0)
  FROM public.appeal_outcomes a
$$;

REVOKE ALL ON FUNCTION public.community_report_counts(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.appeal_outcome_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_report_counts(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.appeal_outcome_summary() TO anon, authenticated, service_role;