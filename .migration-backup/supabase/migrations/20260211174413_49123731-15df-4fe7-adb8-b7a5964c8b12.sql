
-- =============================================================
-- Michigan Health Access Platform — Core Tables
-- All seed data uses REALISTIC Michigan healthcare facilities,
-- systems, and programs. Coordinates are accurate.
-- Data sources cited: CMS, HRSA, Leapfrog, ANCC Magnet, BCBSM
-- =============================================================

-- 1. FACILITIES
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  system_affiliation TEXT,
  facility_type TEXT NOT NULL DEFAULT 'hospital',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'MI',
  zip TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  website TEXT,
  hours TEXT,
  services TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  insurance_accepted TEXT[] DEFAULT '{}',
  digital_capabilities JSONB DEFAULT '{}',
  quality_score INTEGER DEFAULT 0,
  is_magnet BOOLEAN DEFAULT false,
  is_blue_distinction BOOLEAN DEFAULT false,
  leapfrog_grade TEXT,
  joint_commission BOOLEAN DEFAULT false,
  accepting_new_patients BOOLEAN DEFAULT true,
  telehealth_available BOOLEAN DEFAULT false,
  walk_in BOOLEAN DEFAULT false,
  languages TEXT[] DEFAULT '{English}',
  wheelchair_accessible BOOLEAN DEFAULT true,
  public_transit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facilities are publicly readable" ON public.facilities FOR SELECT USING (true);

-- 2. PROVIDERS
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT DEFAULT 'MD',
  specialty TEXT NOT NULL,
  subspecialty TEXT,
  board_certified BOOLEAN DEFAULT true,
  years_experience INTEGER,
  medical_school TEXT,
  languages TEXT[] DEFAULT '{English}',
  accepting_new_patients BOOLEAN DEFAULT true,
  telehealth_available BOOLEAN DEFAULT false,
  patient_rating NUMERIC(2,1),
  gender TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers are publicly readable" ON public.providers FOR SELECT USING (true);

-- 3. QUALITY METRICS
CREATE TABLE public.quality_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC,
  national_average NUMERIC,
  state_average NUMERIC,
  unit TEXT,
  period TEXT,
  data_source TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quality_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quality metrics are publicly readable" ON public.quality_metrics FOR SELECT USING (true);

-- 4. FINANCIAL PROGRAMS
CREATE TABLE public.financial_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL,
  organization TEXT,
  description TEXT,
  eligibility_criteria JSONB DEFAULT '{}',
  fpl_threshold INTEGER,
  services_covered TEXT[] DEFAULT '{}',
  application_url TEXT,
  phone TEXT,
  how_to_apply TEXT,
  coverage_area TEXT DEFAULT 'Statewide',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Financial programs are publicly readable" ON public.financial_programs FOR SELECT USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quality_metrics_updated_at BEFORE UPDATE ON public.quality_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_facilities_location ON public.facilities (latitude, longitude);
CREATE INDEX idx_facilities_type ON public.facilities (facility_type);
CREATE INDEX idx_facilities_county ON public.facilities (county);
CREATE INDEX idx_facilities_quality ON public.facilities (quality_score DESC);
CREATE INDEX idx_providers_facility ON public.providers (facility_id);
CREATE INDEX idx_providers_specialty ON public.providers (specialty);
CREATE INDEX idx_quality_facility ON public.quality_metrics (facility_id);
CREATE INDEX idx_financial_type ON public.financial_programs (program_type);
