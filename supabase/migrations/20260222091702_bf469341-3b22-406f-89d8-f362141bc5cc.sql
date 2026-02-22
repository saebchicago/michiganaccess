
-- Anonymized search analytics table (no PII)
CREATE TABLE public.search_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_term text NOT NULL,
  search_source text NOT NULL DEFAULT 'hero',
  result_count integer DEFAULT 0,
  had_correction boolean DEFAULT false,
  corrected_to text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can log searches"
ON public.search_analytics FOR INSERT
WITH CHECK (true);

-- Deny public reads (admin only via service role)
CREATE POLICY "Deny public reads on search_analytics"
ON public.search_analytics FOR SELECT
USING (false);

-- Deny updates/deletes
CREATE POLICY "Deny updates on search_analytics"
ON public.search_analytics FOR UPDATE
USING (false);

CREATE POLICY "Deny deletes on search_analytics"
ON public.search_analytics FOR DELETE
USING (false);

-- Index for analysis queries
CREATE INDEX idx_search_analytics_term ON public.search_analytics(search_term);
CREATE INDEX idx_search_analytics_created ON public.search_analytics(created_at DESC);
