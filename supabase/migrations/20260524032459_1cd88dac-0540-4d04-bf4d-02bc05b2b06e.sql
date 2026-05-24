-- 1. Remove column-level SELECT on sensitive contact fields for public roles.
-- The community_events_public view (security_invoker) excludes these columns,
-- so the public events listing keeps working; only direct base-table reads of
-- contact_phone / contact_email are blocked.
REVOKE SELECT (contact_phone, contact_email) ON public.community_events FROM anon, authenticated;

-- 2. Belt-and-suspenders: explicit RESTRICTIVE deny for authenticated role on the base table,
-- matching the existing anon-only deny. The permissive public SELECT still allows
-- non-sensitive columns through the view (column GRANTs are checked separately).
DROP POLICY IF EXISTS "Deny direct authenticated reads on community_events" ON public.community_events;
CREATE POLICY "Deny direct authenticated reads on community_events"
  ON public.community_events
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (false);

-- 3. Harden set_updated_at: pin search_path so the trigger function can't be hijacked.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;