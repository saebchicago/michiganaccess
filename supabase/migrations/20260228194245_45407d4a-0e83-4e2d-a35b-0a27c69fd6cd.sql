ALTER TABLE public.community_resources
  ADD COLUMN IF NOT EXISTS is_open_now boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_24_7 boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS on_bus_line boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_id_required boolean DEFAULT false;