-- Community feedback table for structured issue flagging
-- Separate from page_feedback (quick thumbs up/down) to keep data clean
-- Privacy: no IP, no user agent, optional opt-in email only

CREATE TABLE public.community_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'data_accuracy',
    'broken_link',
    'accessibility',
    'neutrality_concern',
    'suggestion',
    'other'
  )),
  element_reference text,
  description text NOT NULL,
  suggested_correction text,
  source_reference text,
  contact_opt_in boolean NOT NULL DEFAULT false,
  contact_email text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved', 'archived')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (anonymous or opt-in contact)
CREATE POLICY "Anyone can submit community feedback"
  ON public.community_feedback FOR INSERT
  WITH CHECK (
    length(description) >= 10
    AND length(description) <= 2000
    AND (element_reference IS NULL OR length(element_reference) <= 500)
    AND (suggested_correction IS NULL OR length(suggested_correction) <= 2000)
    AND (source_reference IS NULL OR length(source_reference) <= 500)
    AND (
      contact_opt_in = false
      OR (contact_opt_in = true AND contact_email IS NOT NULL AND contact_email ~* '^[^@]+@[^@]+\.[^@]+$')
    )
  );

-- Deny all reads (only service role via edge function)
CREATE POLICY "Deny reads on community feedback"
  ON public.community_feedback FOR SELECT
  USING (false);

-- Deny updates from public
CREATE POLICY "Deny updates on community feedback"
  ON public.community_feedback FOR UPDATE
  USING (false);

-- Deny deletes from public
CREATE POLICY "Deny deletes on community feedback"
  ON public.community_feedback FOR DELETE
  USING (false);

-- Index for aggregation
CREATE INDEX idx_community_feedback_page_category ON public.community_feedback (page_path, category);
CREATE INDEX idx_community_feedback_status ON public.community_feedback (status) WHERE status = 'new';

COMMENT ON TABLE public.community_feedback IS 'Structured community feedback for data corrections, broken links, accessibility, and suggestions. Privacy-first: no PII unless opt-in.';
