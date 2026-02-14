
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'health_fair',
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location_name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'MI',
  zip TEXT,
  organizer TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  is_free BOOLEAN DEFAULT true,
  registration_required BOOLEAN DEFAULT false,
  registration_url TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community events are publicly readable"
ON public.community_events FOR SELECT USING (true);

CREATE POLICY "Deny all inserts"
ON public.community_events FOR INSERT WITH CHECK (false);

CREATE POLICY "Deny all updates"
ON public.community_events FOR UPDATE USING (false);

CREATE POLICY "Deny all deletes"
ON public.community_events FOR DELETE USING (false);

CREATE TRIGGER update_community_events_updated_at
BEFORE UPDATE ON public.community_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed sample events
INSERT INTO public.community_events (title, description, event_type, event_date, start_time, end_time, location_name, address, city, county, organizer, is_free, registration_required, tags) VALUES
('Free Blood Pressure Screening', 'Walk-in blood pressure checks and heart health education for all ages.', 'screening', '2026-03-01', '09:00', '14:00', 'Washtenaw County Health Dept', '555 Towner St', 'Ypsilanti', 'Washtenaw', 'Washtenaw County Health Department', true, false, ARRAY['heart health','screening','walk-in']),
('Community Health Fair', 'Annual health fair with free screenings, immunizations, and wellness resources.', 'health_fair', '2026-03-15', '10:00', '16:00', 'Cobo Center', '1 Washington Blvd', 'Detroit', 'Wayne', 'Detroit Health Department', true, false, ARRAY['health fair','immunizations','screenings']),
('Diabetes Support Group', 'Monthly peer support group for those living with Type 1 or Type 2 diabetes.', 'support_group', '2026-03-08', '18:00', '19:30', 'Sparrow Hospital', '1215 E Michigan Ave', 'Lansing', 'Ingham', 'Sparrow Health System', true, false, ARRAY['diabetes','support group','chronic disease']),
('Mental Health First Aid Training', 'Learn to identify, understand, and respond to signs of mental illness. Certification provided.', 'workshop', '2026-03-22', '08:30', '17:00', 'Kent County Community Center', '500 S Division Ave', 'Grand Rapids', 'Kent', 'NAMI Michigan', true, true, ARRAY['mental health','training','certification']),
('Maternal & Infant Health Fair', 'Resources for expectant and new mothers, including prenatal screenings and car seat checks.', 'health_fair', '2026-04-05', '10:00', '14:00', 'Genesee Health Plan', '2171 S Linden Rd', 'Flint', 'Genesee', 'Genesee County Health Department', true, false, ARRAY['maternal health','prenatal','infant health']),
('Cancer Screening Day', 'Free mammograms, skin checks, and colorectal screening kits available.', 'screening', '2026-04-12', '08:00', '15:00', 'Beaumont Hospital', '3601 W 13 Mile Rd', 'Royal Oak', 'Oakland', 'Beaumont Health', true, true, ARRAY['cancer screening','mammogram','preventive care']),
('Grief & Loss Support Circle', 'A safe space for those experiencing loss. Facilitated by licensed counselors.', 'support_group', '2026-03-10', '19:00', '20:30', 'St. Joseph Mercy Hospital', '5301 McAuley Dr', 'Ypsilanti', 'Washtenaw', 'Trinity Health', true, false, ARRAY['grief','mental health','support group']),
('Youth Wellness Festival', 'Interactive wellness activities for ages 10-18 including fitness, nutrition, and mindfulness.', 'health_fair', '2026-04-19', '11:00', '15:00', 'Kalamazoo YMCA', '1001 W Maple St', 'Kalamazoo', 'Kalamazoo', 'Kalamazoo County Health Dept', true, false, ARRAY['youth','wellness','fitness','nutrition']),
('Substance Use Recovery Workshop', 'Resources and peer support for individuals and families impacted by substance use disorders.', 'workshop', '2026-03-29', '10:00', '13:00', 'Bay County Community Center', '800 Kennedy Dr', 'Bay City', 'Bay', 'Bay County Health Department', true, false, ARRAY['substance use','recovery','families']),
('Senior Vision & Hearing Screening', 'Free vision and hearing tests for adults 60+. No appointment needed.', 'screening', '2026-04-08', '09:00', '12:00', 'Traverse City Senior Center', '801 E Front St', 'Traverse City', 'Grand Traverse', 'Grand Traverse County', true, false, ARRAY['senior health','vision','hearing','screening']);
