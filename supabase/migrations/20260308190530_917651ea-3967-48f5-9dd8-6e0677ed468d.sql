-- 1. Add explicit deny-all SELECT on contact_messages for safety
CREATE POLICY "Deny public reads on contact_messages"
  ON public.contact_messages
  AS RESTRICTIVE
  FOR SELECT
  TO public
  USING (false);

-- 2. Remove the overly permissive public SELECT on community_events
DROP POLICY IF EXISTS "Anyone can view active events" ON public.community_events;
DROP POLICY IF EXISTS "Public can view active events" ON public.community_events;

-- Re-create a restrictive SELECT that denies direct table reads from anon
CREATE POLICY "Deny direct public reads on community_events"
  ON public.community_events
  AS RESTRICTIVE
  FOR SELECT
  TO anon
  USING (false);

-- Grant SELECT on the safe view (no PII) to anon
GRANT SELECT ON public.community_events_public TO anon;