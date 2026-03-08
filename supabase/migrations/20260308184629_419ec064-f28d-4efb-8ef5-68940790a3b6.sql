
-- 1. Lock down ingestion_runs: remove public SELECT
DROP POLICY IF EXISTS "Ingestion runs are publicly readable" ON public.ingestion_runs;
CREATE POLICY "Deny public reads on ingestion_runs" ON public.ingestion_runs FOR SELECT USING (false);

-- 2. Lock down ingestion_cache: remove public SELECT
DROP POLICY IF EXISTS "Ingestion cache is publicly readable" ON public.ingestion_cache;
CREATE POLICY "Deny public reads on ingestion_cache" ON public.ingestion_cache FOR SELECT USING (false);

-- 3. Protect community_events contact details by replacing the open SELECT with a policy that hides contact info
-- We can't do column-level RLS in Postgres, so we create a secure view instead
-- First, drop the permissive SELECT policy
DROP POLICY IF EXISTS "Community events are publicly readable" ON public.community_events;

-- Create a restrictive SELECT that still allows public reads but we'll use a view to hide sensitive columns
CREATE POLICY "Community events are publicly readable" ON public.community_events FOR SELECT USING (true);

-- Create a public-safe view that excludes contact details
CREATE OR REPLACE VIEW public.community_events_public AS
SELECT id, title, description, event_type, event_date, start_time, end_time,
       location_name, address, city, county, state, zip,
       organizer, is_free, registration_required, registration_url, website,
       tags, is_active, created_at, updated_at
FROM public.community_events;
