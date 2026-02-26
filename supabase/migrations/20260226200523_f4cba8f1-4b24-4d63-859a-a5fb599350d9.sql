
-- Allow anonymous event submissions for moderation
DROP POLICY IF EXISTS "Deny all inserts" ON public.community_events;
CREATE POLICY "Anyone can submit events for moderation"
  ON public.community_events
  FOR INSERT
  WITH CHECK (true);
