-- Data Supremacy Release: food access, broadband, transit, maternal health, EJ, compound index
-- Migration: 2026-03-21

-- Food Access Tracts (USDA Food Access Research Atlas)
CREATE TABLE IF NOT EXISTS public.food_access_tracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  census_tract_id TEXT NOT NULL UNIQUE,
  county TEXT NOT NULL,
  state_fips TEXT DEFAULT '26',
  county_fips TEXT NOT NULL,
  tract_fips TEXT NOT NULL,
  population INTEGER,
  low_income BOOLEAN DEFAULT false,
  low_access_1mi BOOLEAN DEFAULT false,
  low_access_10mi BOOLEAN DEFAULT false,
  low_access_half BOOLEAN DEFAULT false,
  la_kids_1mi INTEGER,
  la_seniors_1mi INTEGER,
  la_no_car_1mi INTEGER,
  snap_count INTEGER,
  pct_snap NUMERIC(5,2),
  median_family_income INTEGER,
  food_desert_flag BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'USDA Food Access Research Atlas',
  data_year INTEGER DEFAULT 2023,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.food_access_tracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_access_read" ON public.food_access_tracts FOR SELECT USING (true);
CREATE INDEX idx_food_county ON public.food_access_tracts(county);
CREATE INDEX idx_food_desert ON public.food_access_tracts(food_desert_flag);

-- SNAP Retailers (USDA SNAP Retailer Locator)
CREATE TABLE IF NOT EXISTS public.snap_retailers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL,
  store_type TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT,
  state TEXT DEFAULT 'MI',
  zip TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  authorization_date DATE,
  end_date DATE,
  source TEXT DEFAULT 'USDA SNAP Retailer Locator',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.snap_retailers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snap_read" ON public.snap_retailers FOR SELECT USING (true);
CREATE INDEX idx_snap_county ON public.snap_retailers(county);
CREATE INDEX idx_snap_geo ON public.snap_retailers(latitude, longitude);

-- Broadband Access (FCC Broadband Data Collection)
CREATE TABLE IF NOT EXISTS public.broadband_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  census_tract_id TEXT NOT NULL UNIQUE,
  county TEXT NOT NULL,
  county_fips TEXT NOT NULL,
  total_locations INTEGER,
  served_locations INTEGER,
  underserved_locations INTEGER,
  unserved_locations INTEGER,
  pct_served NUMERIC(5,2),
  pct_underserved NUMERIC(5,2),
  pct_unserved NUMERIC(5,2),
  max_download_speed INTEGER,
  provider_count INTEGER,
  fiber_available BOOLEAN DEFAULT false,
  bead_eligible BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'FCC Broadband Data Collection',
  data_vintage TEXT DEFAULT '2025-H2',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.broadband_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broadband_read" ON public.broadband_access FOR SELECT USING (true);
CREATE INDEX idx_bb_county ON public.broadband_access(county);

-- Transit Stops (GTFS)
CREATE TABLE IF NOT EXISTS public.transit_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency TEXT NOT NULL,
  stop_id TEXT NOT NULL,
  stop_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  wheelchair_boarding INTEGER DEFAULT 0,
  routes_served TEXT[],
  county TEXT,
  city TEXT,
  source TEXT DEFAULT 'GTFS',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency, stop_id)
);
ALTER TABLE public.transit_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transit_read" ON public.transit_stops FOR SELECT USING (true);
CREATE INDEX idx_transit_geo ON public.transit_stops(latitude, longitude);
CREATE INDEX idx_transit_agency ON public.transit_stops(agency);

-- Maternal & Infant Health (MDHHS + March of Dimes)
CREATE TABLE IF NOT EXISTS public.maternal_infant_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  county TEXT NOT NULL UNIQUE,
  infant_mortality_rate NUMERIC(5,2),
  infant_mortality_rate_black NUMERIC(5,2),
  infant_mortality_rate_white NUMERIC(5,2),
  preterm_birth_rate NUMERIC(5,2),
  low_birth_weight_rate NUMERIC(5,2),
  prenatal_care_first_trimester NUMERIC(5,2),
  teen_birth_rate NUMERIC(5,2),
  birthing_hospitals INTEGER,
  ob_gyn_per_10k NUMERIC(5,2),
  midwives_per_10k NUMERIC(5,2),
  maternal_mortality_notes TEXT,
  source TEXT DEFAULT 'MDHHS Vital Records + March of Dimes PeriStats',
  data_years TEXT DEFAULT '2019-2023',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.maternal_infant_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maternal_read" ON public.maternal_infant_health FOR SELECT USING (true);

-- Environmental Justice (EPA EJScreen v2.3 archived)
CREATE TABLE IF NOT EXISTS public.ej_screen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_group_id TEXT NOT NULL UNIQUE,
  census_tract_id TEXT NOT NULL,
  county TEXT NOT NULL,
  county_fips TEXT NOT NULL,
  pct_minority NUMERIC(5,2),
  pct_low_income NUMERIC(5,2),
  demographic_index NUMERIC(5,2),
  pm25_concentration NUMERIC(6,2),
  ozone_concentration NUMERIC(6,3),
  diesel_pm NUMERIC(6,2),
  air_toxics_cancer_risk NUMERIC(8,2),
  traffic_proximity NUMERIC(10,2),
  lead_paint_indicator NUMERIC(5,2),
  superfund_proximity NUMERIC(10,2),
  rmp_facility_proximity NUMERIC(10,2),
  hazardous_waste_proximity NUMERIC(10,2),
  wastewater_discharge NUMERIC(10,2),
  ej_index_pm25 INTEGER,
  ej_index_ozone INTEGER,
  ej_index_diesel INTEGER,
  ej_index_lead INTEGER,
  ej_index_superfund INTEGER,
  supplemental_index_pm25 INTEGER,
  source TEXT DEFAULT 'EPA EJScreen v2.3 (archived 2024)',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ej_screen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ej_read" ON public.ej_screen FOR SELECT USING (true);
CREATE INDEX idx_ej_tract ON public.ej_screen(census_tract_id);
CREATE INDEX idx_ej_county ON public.ej_screen(county);

-- Compound Access Deficit Index
CREATE TABLE IF NOT EXISTS public.compound_access_index (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  census_tract_id TEXT NOT NULL UNIQUE,
  county TEXT NOT NULL,
  food_desert_score NUMERIC(5,2) DEFAULT 0,
  broadband_desert_score NUMERIC(5,2) DEFAULT 0,
  transit_desert_score NUMERIC(5,2) DEFAULT 0,
  healthcare_hpsa_score NUMERIC(5,2) DEFAULT 0,
  svi_score NUMERIC(5,2) DEFAULT 0,
  ej_burden_score NUMERIC(5,2) DEFAULT 0,
  energy_burden_score NUMERIC(5,2) DEFAULT 0,
  compound_deficit_index NUMERIC(5,2) DEFAULT 0,
  deficit_tier TEXT,
  population INTEGER,
  source TEXT DEFAULT 'Access Michigan Compound Index v1',
  calculated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.compound_access_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compound_read" ON public.compound_access_index FOR SELECT USING (true);
CREATE INDEX idx_compound_county ON public.compound_access_index(county);
CREATE INDEX idx_compound_tier ON public.compound_access_index(deficit_tier);
