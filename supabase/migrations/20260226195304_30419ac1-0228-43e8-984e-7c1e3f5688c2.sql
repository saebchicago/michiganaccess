
-- Phase 5A: Resource Ratings (anonymous, INSERT-only)
CREATE TABLE public.resource_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL,
  resource_type text NOT NULL DEFAULT 'community_resource',
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  county text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit ratings" ON public.resource_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Ratings are publicly readable" ON public.resource_ratings FOR SELECT USING (true);
CREATE POLICY "Deny updates on ratings" ON public.resource_ratings FOR UPDATE USING (false);
CREATE POLICY "Deny deletes on ratings" ON public.resource_ratings FOR DELETE USING (false);

-- Phase 5B: Community Reports (anonymous, INSERT-only, read aggregates via edge function)
CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL,
  county text,
  zipcode text,
  place_slug text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit reports" ON public.community_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Reports are publicly readable" ON public.community_reports FOR SELECT USING (true);
CREATE POLICY "Deny updates on reports" ON public.community_reports FOR UPDATE USING (false);
CREATE POLICY "Deny deletes on reports" ON public.community_reports FOR DELETE USING (false);
