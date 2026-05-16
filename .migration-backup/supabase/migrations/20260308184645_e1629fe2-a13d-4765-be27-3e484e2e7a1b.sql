
-- Fix SECURITY DEFINER view issue: recreate as SECURITY INVOKER (default)
DROP VIEW IF EXISTS public.community_events_public;
CREATE VIEW public.community_events_public 
WITH (security_invoker = true) AS
SELECT id, title, description, event_type, event_date, start_time, end_time,
       location_name, address, city, county, state, zip,
       organizer, is_free, registration_required, registration_url, website,
       tags, is_active, created_at, updated_at
FROM public.community_events;
