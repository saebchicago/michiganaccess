-- Collaboration workspace for cloud cohorts (UC8 Phase 2).
-- Version history + comments on unlisted share_id workspaces.
-- No user accounts: author_label is a display name only (no PII).

CREATE TABLE public.analyst_cohort_versions (
  version_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id uuid NOT NULL REFERENCES public.analyst_cohorts (share_id) ON DELETE CASCADE,
  version_number integer NOT NULL CHECK (version_number >= 1),
  criteria jsonb NOT NULL,
  enabled jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_count integer NOT NULL DEFAULT 0 CHECK (result_count >= 0),
  change_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT analyst_cohort_versions_unique_num UNIQUE (share_id, version_number),
  CONSTRAINT analyst_cohort_versions_criteria_object CHECK (jsonb_typeof(criteria) = 'object'),
  CONSTRAINT analyst_cohort_versions_enabled_object CHECK (jsonb_typeof(enabled) = 'object'),
  CONSTRAINT analyst_cohort_versions_note_len CHECK (
    change_note IS NULL OR char_length(change_note) BETWEEN 1 AND 500
  )
);

CREATE INDEX idx_analyst_cohort_versions_share
  ON public.analyst_cohort_versions (share_id, version_number DESC);

CREATE TABLE public.analyst_cohort_comments (
  comment_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id uuid NOT NULL REFERENCES public.analyst_cohorts (share_id) ON DELETE CASCADE,
  author_label text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT analyst_cohort_comments_author_len CHECK (char_length(author_label) BETWEEN 1 AND 40),
  CONSTRAINT analyst_cohort_comments_body_len CHECK (char_length(body) BETWEEN 1 AND 2000)
);

CREATE INDEX idx_analyst_cohort_comments_share
  ON public.analyst_cohort_comments (share_id, created_at DESC);

ALTER TABLE public.analyst_cohort_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_cohort_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can append cohort version"
  ON public.analyst_cohort_versions FOR INSERT
  WITH CHECK (
    result_count >= 0
    AND pg_column_size(criteria) <= 8192
    AND pg_column_size(enabled) <= 4096
  );

CREATE POLICY "Deny direct reads on cohort versions"
  ON public.analyst_cohort_versions FOR SELECT
  USING (false);

CREATE POLICY "Anyone can post cohort comment"
  ON public.analyst_cohort_comments FOR INSERT
  WITH CHECK (
    char_length(author_label) BETWEEN 1 AND 40
    AND char_length(body) BETWEEN 1 AND 2000
  );

CREATE POLICY "Deny direct reads on cohort comments"
  ON public.analyst_cohort_comments FOR SELECT
  USING (false);

-- Seed version 1 when a cohort is first published
CREATE OR REPLACE FUNCTION public.seed_initial_cohort_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.analyst_cohort_versions (
    share_id,
    version_number,
    criteria,
    enabled,
    result_count,
    change_note
  )
  VALUES (
    NEW.share_id,
    1,
    NEW.criteria,
    NEW.enabled,
    NEW.result_count,
    'Initial publish'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER analyst_cohorts_seed_version
  AFTER INSERT ON public.analyst_cohorts
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_initial_cohort_version();

CREATE OR REPLACE FUNCTION public.get_analyst_cohort_workspace(p_share_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'cohort',
    (
      SELECT jsonb_build_object(
        'share_id', c.share_id,
        'name', c.name,
        'criteria', c.criteria,
        'enabled', c.enabled,
        'result_count', c.result_count,
        'created_at', c.created_at,
        'updated_at', c.updated_at
      )
      FROM public.analyst_cohorts c
      WHERE c.share_id = p_share_id
      LIMIT 1
    ),
    'versions',
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'version_id', v.version_id,
            'version_number', v.version_number,
            'criteria', v.criteria,
            'enabled', v.enabled,
            'result_count', v.result_count,
            'change_note', v.change_note,
            'created_at', v.created_at
          )
          ORDER BY v.version_number DESC
        )
        FROM public.analyst_cohort_versions v
        WHERE v.share_id = p_share_id
      ),
      '[]'::jsonb
    ),
    'comments',
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'comment_id', cm.comment_id,
            'author_label', cm.author_label,
            'body', cm.body,
            'created_at', cm.created_at
          )
          ORDER BY cm.created_at ASC
        )
        FROM public.analyst_cohort_comments cm
        WHERE cm.share_id = p_share_id
      ),
      '[]'::jsonb
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.add_analyst_cohort_version(
  p_share_id uuid,
  p_criteria jsonb,
  p_enabled jsonb,
  p_result_count integer,
  p_change_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next integer;
  v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.analyst_cohorts WHERE share_id = p_share_id) THEN
    RAISE EXCEPTION 'Cohort workspace not found';
  END IF;

  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next
  FROM public.analyst_cohort_versions
  WHERE share_id = p_share_id;

  INSERT INTO public.analyst_cohort_versions (
    share_id,
    version_number,
    criteria,
    enabled,
    result_count,
    change_note
  )
  VALUES (
    p_share_id,
    v_next,
    p_criteria,
    p_enabled,
    p_result_count,
    NULLIF(trim(p_change_note), '')
  )
  RETURNING version_id INTO v_id;

  UPDATE public.analyst_cohorts
  SET
    criteria = p_criteria,
    enabled = p_enabled,
    result_count = p_result_count,
    updated_at = now()
  WHERE share_id = p_share_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_analyst_cohort_comment(
  p_share_id uuid,
  p_author_label text,
  p_body text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.analyst_cohorts WHERE share_id = p_share_id) THEN
    RAISE EXCEPTION 'Cohort workspace not found';
  END IF;

  INSERT INTO public.analyst_cohort_comments (share_id, author_label, body)
  VALUES (
    p_share_id,
    trim(p_author_label),
    trim(p_body)
  )
  RETURNING comment_id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_analyst_cohort_workspace(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_analyst_cohort_workspace(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_analyst_cohort_workspace(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.add_analyst_cohort_version(uuid, jsonb, jsonb, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_analyst_cohort_version(uuid, jsonb, jsonb, integer, text) TO anon;
GRANT EXECUTE ON FUNCTION public.add_analyst_cohort_version(uuid, jsonb, jsonb, integer, text) TO authenticated;

REVOKE ALL ON FUNCTION public.add_analyst_cohort_comment(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_analyst_cohort_comment(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.add_analyst_cohort_comment(uuid, text, text) TO authenticated;

COMMENT ON TABLE public.analyst_cohort_versions IS
  'Append-only version history for analyst cohort workspaces.';
COMMENT ON TABLE public.analyst_cohort_comments IS
  'Team comments on analyst cohort workspaces (display name only, no accounts).';