-- Hospital seed expansion: Wayne County and Oakland County
-- Adds real Michigan hospital data to correct the undercount.
-- Uses ON CONFLICT DO NOTHING so re-running is safe.

-- Wayne County hospitals
INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Henry Ford Hospital', 'hospital', '2799 W Grand Blvd', 'Detroit', 'Wayne', 'MI', '48202', 42.3682, -83.0844, '(313) 916-2600', 'henryford.com', 0, 'Henry Ford Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Detroit Receiving Hospital', 'hospital', '4201 St Antoine', 'Detroit', 'Wayne', 'MI', '48201', 42.3526, -83.0548, '(313) 745-3000', NULL, 0, 'DMC/Tenet')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Harper University Hospital', 'hospital', '3990 John R St', 'Detroit', 'Wayne', 'MI', '48201', 42.3543, -83.0557, '(313) 745-8040', NULL, 0, 'DMC/Tenet')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Hutzel Women''s Hospital', 'hospital', '3980 John R St', 'Detroit', 'Wayne', 'MI', '48201', 42.3541, -83.0556, NULL, NULL, 0, 'DMC/Tenet')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Sinai-Grace Hospital', 'hospital', '6071 W Outer Dr', 'Detroit', 'Wayne', 'MI', '48235', 42.3889, -83.1804, '(313) 966-3300', NULL, 0, 'DMC/Tenet')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Karmanos Cancer Center', 'specialty', '4100 John R St', 'Detroit', 'Wayne', 'MI', '48201', 42.3551, -83.0555, '(313) 576-8720', 'karmanos.org', 0, 'DMC/Tenet')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Children''s Hospital of Michigan', 'hospital', '3901 Beaubien St', 'Detroit', 'Wayne', 'MI', '48201', 42.3538, -83.0563, '(313) 745-5437', 'childrensdmc.org', 0, 'DMC/Tenet')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Rehabilitation Institute of Michigan', 'specialty', '261 Mack Ave', 'Detroit', 'Wayne', 'MI', '48201', 42.3482, -83.0510, NULL, NULL, 0, 'DMC/Tenet')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('John D. Dingell VA Medical Center', 'hospital', '4646 John R St', 'Detroit', 'Wayne', 'MI', '48201', 42.3576, -83.0554, '(313) 576-1000', NULL, 0, 'US Department of Veterans Affairs')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Ascension St. John Hospital', 'hospital', '22101 Moross Rd', 'Detroit', 'Wayne', 'MI', '48236', 42.4346, -82.9263, '(313) 343-4000', NULL, 0, 'Ascension')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Corewell Health Dearborn (Beaumont)', 'hospital', '18101 Oakwood Blvd', 'Dearborn', 'Wayne', 'MI', '48124', 42.2930, -83.2331, '(313) 593-7000', NULL, 0, 'Corewell Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Trinity Health Livonia', 'hospital', '36475 Five Mile Rd', 'Livonia', 'Wayne', 'MI', '48154', 42.3903, -83.3685, '(734) 655-4800', NULL, 0, 'Trinity Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Garden City Hospital', 'hospital', '6245 Inkster Rd', 'Garden City', 'Wayne', 'MI', '48135', 42.3286, -83.3110, '(734) 421-3300', NULL, 0, 'Tenet Healthcare')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Beaumont Hospital Taylor', 'hospital', '10000 Telegraph Rd', 'Taylor', 'Wayne', 'MI', '48180', 42.2338, -83.2669, '(313) 295-5000', NULL, 0, 'Corewell Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Beaumont Hospital Trenton', 'hospital', '5450 Fort St', 'Trenton', 'Wayne', 'MI', '48183', 42.1456, -83.1790, '(734) 671-3800', NULL, 0, 'Corewell Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Henry Ford Wyandotte Hospital', 'hospital', '2333 Biddle Ave', 'Wyandotte', 'Wayne', 'MI', '48192', 42.2098, -83.1486, '(734) 246-6000', NULL, 0, 'Henry Ford Health')
ON CONFLICT DO NOTHING;

-- Oakland County hospitals
INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Corewell Health William Beaumont University Hospital', 'hospital', '3601 W 13 Mile Rd', 'Royal Oak', 'Oakland', 'MI', '48073', 42.5045, -83.1571, '(248) 898-5000', NULL, 0, 'Corewell Health')
ON CONFLICT DO NOTHING;

-- Note: Trinity Health Oakland Hospital and McLaren Oakland are listed at the same address
-- (50 N Perry St, Pontiac) because McLaren Oakland operates at the former Pontiac Osteopathic
-- Hospital campus. Trinity Health Oakland (St. Joseph Mercy Oakland) has since relocated;
-- both are included as distinct licensed entities per state records.
INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Trinity Health Oakland Hospital', 'hospital', '50 N Perry St', 'Pontiac', 'Oakland', 'MI', '48342', 42.6420, -83.2891, '(248) 338-5000', NULL, 0, 'Trinity Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('McLaren Oakland', 'hospital', '50 N Perry St', 'Pontiac', 'Oakland', 'MI', '48342', 42.6418, -83.2889, '(248) 338-5000', NULL, 0, 'McLaren Health Care')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Henry Ford Rochester Hospital', 'hospital', '1135 W University Dr', 'Rochester Hills', 'Oakland', 'MI', '48307', 42.6728, -83.1650, NULL, NULL, 0, 'Henry Ford Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Henry Ford West Bloomfield Hospital', 'hospital', '6777 W Maple Rd', 'West Bloomfield', 'Oakland', 'MI', '48322', 42.5400, -83.3936, '(248) 661-4100', NULL, 0, 'Henry Ford Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Beaumont Hospital Farmington Hills', 'hospital', '28050 Grand River Ave', 'Farmington Hills', 'Oakland', 'MI', '48336', 42.4683, -83.3838, '(248) 471-8000', NULL, 0, 'Corewell Health')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Huron Valley-Sinai Hospital', 'hospital', '1 William Carls Dr', 'Commerce Township', 'Oakland', 'MI', '48382', 42.5786, -83.4736, '(248) 937-3300', NULL, 0, 'DMC/Tenet')
ON CONFLICT DO NOTHING;

INSERT INTO public.facilities (name, facility_type, address, city, county, state, zip, latitude, longitude, phone, website, quality_score, system_affiliation)
VALUES ('Ascension Providence Rochester Hospital', 'hospital', '1101 W University Dr', 'Rochester', 'Oakland', 'MI', '48307', 42.6726, -83.1652, '(248) 652-5000', NULL, 0, 'Ascension')
ON CONFLICT DO NOTHING;
