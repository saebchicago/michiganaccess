/**
 * Cloud publish/load for analyst cohorts (UC8 Phase 2).
 * Requires Supabase migration analyst_cohorts + get_analyst_cohort RPC.
 */

import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import type { CohortCriteria } from "@/utils/cohortFilter";

export interface CloudCohortSnapshot {
  shareId: string;
  name: string;
  criteria: CohortCriteria;
  enabled: Record<string, boolean>;
  resultCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublishCohortInput {
  name: string;
  criteria: CohortCriteria;
  enabled: Record<string, boolean>;
  resultCount: number;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidShareId(id: string): boolean {
  return UUID_RE.test(id);
}

export function cohortShareUrl(shareId: string): string {
  const base =
    typeof window !== "undefined" ? window.location.origin : "https://accessmi.org";
  return `${base}/cohort-builder?share=${shareId}`;
}

export async function publishCohortToCloud(
  input: PublishCohortInput,
): Promise<CloudCohortSnapshot> {
  if (!supabaseConfigured) {
    throw new Error("Cloud sync unavailable: Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("analyst_cohorts")
    .insert({
      name: input.name.trim().slice(0, 120),
      criteria: input.criteria as unknown as import("@/integrations/supabase/types").Json,
      enabled: input.enabled as unknown as import("@/integrations/supabase/types").Json,
      result_count: input.resultCount,
    })
    .select("share_id, name, criteria, enabled, result_count, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to publish cohort");
  }

  const row = data;

  return {
    shareId: row.share_id,
    name: row.name,
    criteria: row.criteria as unknown as CohortCriteria,
    enabled: row.enabled as unknown as Record<string, boolean>,
    resultCount: row.result_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadCohortFromCloud(
  shareId: string,
): Promise<CloudCohortSnapshot | null> {
  if (!supabaseConfigured || !isValidShareId(shareId)) return null;

  const { data, error } = await supabase.rpc("get_analyst_cohort", {
    p_share_id: shareId,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const row = data[0];

  return {
    shareId: row.share_id,
    name: row.name,
    criteria: row.criteria as unknown as CohortCriteria,
    enabled: row.enabled as unknown as Record<string, boolean>,
    resultCount: row.result_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}