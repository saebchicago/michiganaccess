
-- Municipalities table for governance transparency toolkit
CREATE TABLE public.municipalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  county TEXT NOT NULL,
  municipality_type TEXT NOT NULL DEFAULT 'city', -- city, village, township, charter_township
  population INTEGER,
  website TEXT,
  council_agenda_url TEXT,
  council_minutes_url TEXT,
  foia_portal_url TEXT,
  foia_contact_email TEXT,
  foia_policy_url TEXT,
  meeting_schedule TEXT, -- e.g. "1st and 3rd Monday at 7:00 PM"
  meeting_location TEXT,
  property_tax_rate NUMERIC,
  state_avg_tax_rate NUMERIC DEFAULT 42.0,
  safety_response_avg NUMERIC, -- avg minutes
  state_avg_safety_response NUMERIC DEFAULT 7.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

-- Public read, no write
CREATE POLICY "Municipalities are publicly readable" ON public.municipalities FOR SELECT USING (true);
CREATE POLICY "Deny inserts on municipalities" ON public.municipalities FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny updates on municipalities" ON public.municipalities FOR UPDATE USING (false);
CREATE POLICY "Deny deletes on municipalities" ON public.municipalities FOR DELETE USING (false);

-- Index for county lookups
CREATE INDEX idx_municipalities_county ON public.municipalities (county);

-- Trigger for updated_at
CREATE TRIGGER update_municipalities_updated_at
  BEFORE UPDATE ON public.municipalities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
