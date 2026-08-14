-- 1. community_events: base table keeps deny-all direct reads. The curated view
--    (no contact_phone / contact_email) runs as its owner so public listings work
--    without opening the base table.
CREATE OR REPLACE VIEW public.community_events_public AS
  SELECT id, title, description, event_type, event_date, start_time, end_time,
         location_name, address, city, county, state, zip, organizer, is_free,
         registration_required, registration_url, website, tags, is_active,
         created_at, updated_at
  FROM public.community_events
  WHERE is_active = true;

ALTER VIEW public.community_events_public SET (security_invoker = false);
GRANT SELECT ON public.community_events_public TO anon, authenticated;

-- 2. partnership_submissions: reads stay denied; validate the PII anonymous
--    visitors may write. NOT VALID so pre-existing rows are not rejected while
--    every new insert/update is checked.
ALTER TABLE public.partnership_submissions
  ADD CONSTRAINT partnership_contact_name_len
    CHECK (contact_name IS NULL OR char_length(btrim(contact_name)) BETWEEN 2 AND 120) NOT VALID,
  ADD CONSTRAINT partnership_contact_email_format
    CHECK (contact_email IS NULL OR (char_length(contact_email) <= 254
      AND contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')) NOT VALID,
  ADD CONSTRAINT partnership_phone_format
    CHECK (phone IS NULL OR (char_length(phone) <= 25 AND phone ~ '^[0-9+()\-. x]+$')) NOT VALID;
