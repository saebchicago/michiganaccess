
-- Table to cache ingested external dataset rows
CREATE TABLE public.ingestion_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id text NOT NULL,
  source_id text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ingested_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(dataset_id, source_id)
);

-- Index for fast dataset lookups
CREATE INDEX idx_ingestion_cache_dataset ON public.ingestion_cache(dataset_id);

-- Table to track ingestion run metadata
CREATE TABLE public.ingestion_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id text NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone,
  status text NOT NULL DEFAULT 'running',
  records_fetched integer DEFAULT 0,
  records_upserted integer DEFAULT 0,
  error_message text
);

CREATE INDEX idx_ingestion_runs_dataset ON public.ingestion_runs(dataset_id, started_at DESC);

-- RLS: publicly readable, no public writes
ALTER TABLE public.ingestion_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ingestion cache is publicly readable" ON public.ingestion_cache FOR SELECT USING (true);
CREATE POLICY "Deny public inserts on ingestion_cache" ON public.ingestion_cache FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public updates on ingestion_cache" ON public.ingestion_cache FOR UPDATE USING (false);
CREATE POLICY "Deny public deletes on ingestion_cache" ON public.ingestion_cache FOR DELETE USING (false);

CREATE POLICY "Ingestion runs are publicly readable" ON public.ingestion_runs FOR SELECT USING (true);
CREATE POLICY "Deny public inserts on ingestion_runs" ON public.ingestion_runs FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public updates on ingestion_runs" ON public.ingestion_runs FOR UPDATE USING (false);
CREATE POLICY "Deny public deletes on ingestion_runs" ON public.ingestion_runs FOR DELETE USING (false);
