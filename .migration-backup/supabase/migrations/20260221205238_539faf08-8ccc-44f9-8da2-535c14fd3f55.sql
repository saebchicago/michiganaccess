
-- Create table for community resource submissions
CREATE TABLE public.resource_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'health_services',
  description TEXT NOT NULL,
  services_offered TEXT[] DEFAULT '{}'::TEXT[],
  address TEXT,
  city TEXT,
  county TEXT,
  phone TEXT,
  website TEXT,
  is_free BOOLEAN DEFAULT false,
  walk_in_available BOOLEAN DEFAULT false,
  languages TEXT[] DEFAULT '{English}'::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.resource_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit resource requests"
ON public.resource_submissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Deny public reads"
ON public.resource_submissions FOR SELECT
USING (false);

CREATE POLICY "Deny public updates"
ON public.resource_submissions FOR UPDATE
USING (false);

CREATE POLICY "Deny public deletes"
ON public.resource_submissions FOR DELETE
USING (false);
