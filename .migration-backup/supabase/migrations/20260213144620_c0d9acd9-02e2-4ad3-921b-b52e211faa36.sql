
-- Explicit deny write policies for all public tables

-- facilities
CREATE POLICY "Deny all inserts" ON public.facilities FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny all updates" ON public.facilities FOR UPDATE USING (false);
CREATE POLICY "Deny all deletes" ON public.facilities FOR DELETE USING (false);

-- providers
CREATE POLICY "Deny all inserts" ON public.providers FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny all updates" ON public.providers FOR UPDATE USING (false);
CREATE POLICY "Deny all deletes" ON public.providers FOR DELETE USING (false);

-- quality_metrics
CREATE POLICY "Deny all inserts" ON public.quality_metrics FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny all updates" ON public.quality_metrics FOR UPDATE USING (false);
CREATE POLICY "Deny all deletes" ON public.quality_metrics FOR DELETE USING (false);

-- financial_programs
CREATE POLICY "Deny all inserts" ON public.financial_programs FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny all updates" ON public.financial_programs FOR UPDATE USING (false);
CREATE POLICY "Deny all deletes" ON public.financial_programs FOR DELETE USING (false);

-- community_resources
CREATE POLICY "Deny all inserts" ON public.community_resources FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny all updates" ON public.community_resources FOR UPDATE USING (false);
CREATE POLICY "Deny all deletes" ON public.community_resources FOR DELETE USING (false);
