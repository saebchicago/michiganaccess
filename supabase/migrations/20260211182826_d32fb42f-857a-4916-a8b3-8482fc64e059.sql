
-- Create community_resources table for SDOH services
CREATE TABLE public.community_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_name TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- food, housing, transportation, mental_health
  organization TEXT,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'MI',
  zip TEXT,
  phone TEXT,
  website TEXT,
  hours TEXT,
  eligibility_notes TEXT,
  languages TEXT[] DEFAULT '{English}'::text[],
  is_free BOOLEAN DEFAULT false,
  accepts_insurance BOOLEAN DEFAULT false,
  walk_in_available BOOLEAN DEFAULT false,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  services_offered TEXT[] DEFAULT '{}'::text[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_resources ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Community resources are publicly readable"
ON public.community_resources
FOR SELECT
USING (true);

-- Index for type and county filtering
CREATE INDEX idx_community_resources_type ON public.community_resources(resource_type);
CREATE INDEX idx_community_resources_county ON public.community_resources(county);
