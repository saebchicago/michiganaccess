/**
 * Collaboration workspace for cloud cohorts (UC8 Phase 2).
 * Version history and comments via Supabase RPCs.
 */

import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import type { CohortCriteria } from "@/utils/cohortFilter";

export interface CohortVersionSnapshot {
  versionId: string;
  versionNumber: number;
  criteria: CohortCriteria;
  enabled: Record<string, boolean>;
  resultCount: number;
  changeNote: string | null;
  createdAt: string;
}

export interface CohortComment {
  commentId: string;
  authorLabel: string;
  body: string;
  createdAt: string;
}

export interface CohortWorkspace {
  shareId: string;
  name: string;
  criteria: CohortCriteria;
  enabled: Record<string, boolean>;
  resultCount: number;
  createdAt: string;
  updatedAt: string;
  versions: CohortVersionSnapshot[];
  comments: CohortComment[];
}

export interface SaveVersionInput {
  shareId: string;
  criteria: CohortCriteria;
  enabled: Record<string, boolean>;
  resultCount: number;
  changeNote?: string;
}

export interface AddCommentInput {
  shareId: string;
  authorLabel: string;
  body: string;
}

function mapWorkspace(raw: Record<string, unknown>): CohortWorkspace | null {
  const cohort = raw.cohort as Record<string, unknown> | null;
  if (!cohort) return null;

  const versions = Array.isArray(raw.versions) ? raw.versions : [];
  const comments = Array.isArray(raw.comments) ? raw.comments : [];

  return {
    shareId: String(cohort.share_id),
    name: String(cohort.name),
    criteria: cohort.criteria as CohortCriteria,
    enabled: cohort.enabled as Record<string, boolean>,
    resultCount: Number(cohort.result_count),
    createdAt: String(cohort.created_at),
    updatedAt: String(cohort.updated_at),
    versions: versions.map((v: Record<string, unknown>) => ({
      versionId: String(v.version_id),
      versionNumber: Number(v.version_number),
      criteria: v.criteria as CohortCriteria,
      enabled: v.enabled as Record<string, boolean>,
      resultCount: Number(v.result_count),
      changeNote: v.change_note != null ? String(v.change_note) : null,
      createdAt: String(v.created_at),
    })),
    comments: comments.map((c: Record<string, unknown>) => ({
      commentId: String(c.comment_id),
      authorLabel: String(c.author_label),
      body: String(c.body),
      createdAt: String(c.created_at),
    })),
  };
}

export async function loadCohortWorkspace(
  shareId: string,
): Promise<CohortWorkspace | null> {
  if (!supabaseConfigured) return null;

  const { data, error } = await supabase.rpc("get_analyst_cohort_workspace", {
    p_share_id: shareId,
  });

  if (error || !data || typeof data !== "object") return null;
  return mapWorkspace(data as Record<string, unknown>);
}

export async function saveCohortVersion(
  input: SaveVersionInput,
): Promise<string | null> {
  if (!supabaseConfigured) {
    throw new Error("Workspace sync unavailable: Supabase is not configured.");
  }

  const { data, error } = await supabase.rpc("add_analyst_cohort_version", {
    p_share_id: input.shareId,
    p_criteria: input.criteria as unknown as import("@/integrations/supabase/types").Json,
    p_enabled: input.enabled as unknown as import("@/integrations/supabase/types").Json,
    p_result_count: input.resultCount,
    p_change_note: input.changeNote?.trim() || null,
  });

  if (error) throw new Error(error.message);
  return data != null ? String(data) : null;
}

export async function addCohortComment(
  input: AddCommentInput,
): Promise<string | null> {
  if (!supabaseConfigured) {
    throw new Error("Workspace sync unavailable: Supabase is not configured.");
  }

  const author = input.authorLabel.trim().slice(0, 40);
  const body = input.body.trim().slice(0, 2000);
  if (!author || !body) {
    throw new Error("Author label and comment are required.");
  }

  const { data, error } = await supabase.rpc("add_analyst_cohort_comment", {
    p_share_id: input.shareId,
    p_author_label: author,
    p_body: body,
  });

  if (error) throw new Error(error.message);
  return data != null ? String(data) : null;
}