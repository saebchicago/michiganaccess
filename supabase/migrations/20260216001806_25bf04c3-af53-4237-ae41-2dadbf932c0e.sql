
-- Anonymous appeal outcome tracking (no PHI)
CREATE TABLE public.appeal_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  county TEXT,
  appeal_type TEXT NOT NULL DEFAULT 'internal',
  carrier TEXT,
  denial_reason TEXT,
  outcome TEXT NOT NULL DEFAULT 'pending',
  estimated_savings NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appeal_outcomes ENABLE ROW LEVEL SECURITY;

-- Public read for aggregated stats
CREATE POLICY "Appeal outcomes are publicly readable"
  ON public.appeal_outcomes FOR SELECT
  USING (true);

-- Anyone can anonymously report an outcome
CREATE POLICY "Anyone can submit appeal outcomes"
  ON public.appeal_outcomes FOR INSERT
  WITH CHECK (true);

-- No updates or deletes
CREATE POLICY "Deny updates on appeal outcomes"
  ON public.appeal_outcomes FOR UPDATE
  USING (false);

CREATE POLICY "Deny deletes on appeal outcomes"
  ON public.appeal_outcomes FOR DELETE
  USING (false);
