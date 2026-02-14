
-- Partnership submissions table
CREATE TABLE public.partnership_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  organization_type TEXT NOT NULL DEFAULT 'nonprofit',
  description TEXT NOT NULL,
  services_offered TEXT[] DEFAULT '{}',
  website TEXT,
  phone TEXT,
  city TEXT,
  county TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT
);

ALTER TABLE public.partnership_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a partnership application
CREATE POLICY "Anyone can submit partnership applications"
ON public.partnership_submissions
FOR INSERT
WITH CHECK (true);

-- No public reads of submissions (admin only via service role)
CREATE POLICY "Deny public reads of submissions"
ON public.partnership_submissions
FOR SELECT
USING (false);

CREATE POLICY "Deny public updates"
ON public.partnership_submissions
FOR UPDATE
USING (false);

CREATE POLICY "Deny public deletes"
ON public.partnership_submissions
FOR DELETE
USING (false);
