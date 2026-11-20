-- Replace always-true access rules with real predicates.

-- Reference catalogs: expose only active rows
DROP POLICY IF EXISTS "Financial programs are publicly readable" ON public.financial_programs;
CREATE POLICY "Financial programs are publicly readable" ON public.financial_programs
  FOR SELECT TO anon, authenticated USING (is_active IS TRUE);

DROP POLICY IF EXISTS "Community resources are publicly readable" ON public.community_resources;
CREATE POLICY "Community resources are publicly readable" ON public.community_resources
  FOR SELECT TO anon, authenticated USING (is_active IS TRUE);

DROP POLICY IF EXISTS "public read" ON public.dataset_registry;
CREATE POLICY "Active datasets are publicly readable" ON public.dataset_registry
  FOR SELECT TO anon, authenticated USING (is_active IS TRUE);

-- Generated content is not read by the public site; staff only
DROP POLICY IF EXISTS "Generated content is publicly readable" ON public.generated_content;
CREATE POLICY "Staff can read generated content" ON public.generated_content
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- Anonymous submission forms: validate shape and force moderation state
DROP POLICY IF EXISTS "Anyone can submit reports" ON public.community_reports;
CREATE POLICY "Anyone can submit reports" ON public.community_reports
  FOR INSERT TO anon, authenticated WITH CHECK (
    status = 'pending'
    AND category IN ('data_error','missing_resource','outage','pollution','safety','general')
    AND char_length(btrim(description)) BETWEEN 1 AND 2000
    AND (county IS NULL OR char_length(county) <= 60)
    AND (zipcode IS NULL OR zipcode ~ '^[0-9]{5}$')
    AND (place_slug IS NULL OR char_length(place_slug) <= 120)
  );

DROP POLICY IF EXISTS "Anyone can submit partnership applications" ON public.partnership_submissions;
CREATE POLICY "Anyone can submit partnership applications" ON public.partnership_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (
    status = 'pending' AND reviewed_at IS NULL AND reviewer_notes IS NULL
    AND char_length(btrim(organization_name)) BETWEEN 1 AND 200
    AND char_length(organization_type) <= 60
    AND char_length(btrim(description)) BETWEEN 1 AND 5000
    AND (website IS NULL OR char_length(website) <= 500)
    AND (city IS NULL OR char_length(city) <= 100)
    AND (county IS NULL OR char_length(county) <= 60)
    AND (services_offered IS NULL OR cardinality(services_offered) <= 50)
  );

DROP POLICY IF EXISTS "Anyone can submit resource requests" ON public.resource_submissions;
CREATE POLICY "Anyone can submit resource requests" ON public.resource_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (
    status = 'pending' AND reviewed_at IS NULL
    AND char_length(btrim(organization_name)) BETWEEN 1 AND 200
    AND char_length(btrim(contact_name)) BETWEEN 1 AND 120
    AND char_length(contact_email) <= 254 AND contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(resource_type) <= 60
    AND char_length(btrim(description)) BETWEEN 1 AND 5000
    AND (address IS NULL OR char_length(address) <= 300)
    AND (city IS NULL OR char_length(city) <= 100)
    AND (county IS NULL OR char_length(county) <= 60)
    AND (phone IS NULL OR char_length(phone) <= 25)
    AND (website IS NULL OR char_length(website) <= 500)
    AND (services_offered IS NULL OR cardinality(services_offered) <= 50)
    AND (languages IS NULL OR cardinality(languages) <= 30)
  );

DROP POLICY IF EXISTS "Anyone can submit ratings" ON public.resource_ratings;
CREATE POLICY "Anyone can submit ratings" ON public.resource_ratings
  FOR INSERT TO anon, authenticated WITH CHECK (
    rating BETWEEN 1 AND 5
    AND char_length(resource_type) <= 60
    AND (comment IS NULL OR char_length(comment) <= 1000)
    AND (county IS NULL OR char_length(county) <= 60)
  );

DROP POLICY IF EXISTS "Anyone can submit appeal outcomes" ON public.appeal_outcomes;
CREATE POLICY "Anyone can submit appeal outcomes" ON public.appeal_outcomes
  FOR INSERT TO anon, authenticated WITH CHECK (
    outcome IN ('won','lost','partial','pending')
    AND char_length(appeal_type) <= 40
    AND (estimated_savings IS NULL OR estimated_savings BETWEEN 0 AND 10000000)
    AND (carrier IS NULL OR char_length(carrier) <= 120)
    AND (county IS NULL OR char_length(county) <= 60)
    AND (denial_reason IS NULL OR char_length(denial_reason) <= 500)
  );

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.page_feedback;
CREATE POLICY "Anyone can submit feedback" ON public.page_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (
    left(page_path, 1) = '/' AND char_length(page_path) <= 300
    AND (comment IS NULL OR char_length(comment) <= 1200)
  );

DROP POLICY IF EXISTS "Anyone can log searches" ON public.search_analytics;
CREATE POLICY "Anyone can log searches" ON public.search_analytics
  FOR INSERT TO anon, authenticated WITH CHECK (
    char_length(search_term) BETWEEN 2 AND 120
    AND search_source IN ('hero','command-palette')
    AND (result_count IS NULL OR result_count >= 0)
    AND (corrected_to IS NULL OR char_length(corrected_to) <= 120)
  );

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 250
    AND char_length(email) <= 254 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(btrim(subject)) BETWEEN 1 AND 300
    AND char_length(btrim(message)) BETWEEN 1 AND 5000
  );