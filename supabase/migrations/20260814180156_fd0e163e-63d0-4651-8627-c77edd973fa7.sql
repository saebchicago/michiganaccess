-- Revert to an invoker-rights view (satisfies the security-definer-view linter)
-- and enforce the contact-field protection where it belongs: on the base table,
-- via a row policy limited to approved events plus column-level privileges that
-- exclude contact_phone / contact_email.
ALTER VIEW public.community_events_public SET (security_invoker = true);

DROP POLICY IF EXISTS "Deny direct public reads on community_events" ON public.community_events;
DROP POLICY IF EXISTS "Deny direct authenticated reads on community_events" ON public.community_events;

CREATE POLICY "Approved community events are publicly readable"
  ON public.community_events
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Column-level SELECT: no contact_phone / contact_email for public roles.
REVOKE SELECT ON public.community_events FROM anon, authenticated;
GRANT SELECT (
  id, title, description, event_type, event_date, start_time, end_time,
  location_name, address, city, county, state, zip, organizer, is_free,
  registration_required, registration_url, website, tags, is_active,
  created_at, updated_at
) ON public.community_events TO anon, authenticated;
GRANT ALL ON public.community_events TO service_role;
