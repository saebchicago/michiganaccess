
CREATE TABLE public.generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  geo text NOT NULL DEFAULT 'Michigan',
  audience text NOT NULL DEFAULT 'resident',
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Generated content is publicly readable" ON public.generated_content FOR SELECT USING (true);
CREATE POLICY "Deny public inserts" ON public.generated_content FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public updates" ON public.generated_content FOR UPDATE USING (false);
CREATE POLICY "Deny public deletes" ON public.generated_content FOR DELETE USING (false);
