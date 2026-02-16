
-- Feedback table for "Was this helpful?" widget
CREATE TABLE public.page_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  is_helpful boolean NOT NULL,
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.page_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Deny reads on feedback"
  ON public.page_feedback FOR SELECT
  USING (false);

CREATE POLICY "Deny updates on feedback"
  ON public.page_feedback FOR UPDATE
  USING (false);

CREATE POLICY "Deny deletes on feedback"
  ON public.page_feedback FOR DELETE
  USING (false);
