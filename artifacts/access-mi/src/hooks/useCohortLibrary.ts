/**
 * Client-side cohort library (UC8 Phase 1 persistence).
 * Saved in localStorage until Supabase workspace tables ship.
 */

import { useCallback, useState, useEffect } from "react";
import type { CohortCriteria } from "@/utils/cohortFilter";

export const COHORT_LIBRARY_KEY = "accessmi_cohort_library_v1";
export const MAX_SAVED_COHORTS = 20;

export interface SavedCohort {
  id: string;
  name: string;
  criteria: CohortCriteria;
  enabled: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
  resultCount: number;
  notes?: string;
}

export function loadCohortLibrary(): SavedCohort[] {
  try {
    const raw = localStorage.getItem(COHORT_LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCohort[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistCohortLibrary(cohorts: SavedCohort[]): void {
  localStorage.setItem(COHORT_LIBRARY_KEY, JSON.stringify(cohorts));
}

export function saveCohortToLibrary(
  entry: Omit<SavedCohort, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
): SavedCohort {
  const library = loadCohortLibrary();
  const now = new Date().toISOString();
  const id = entry.id ?? `cohort-${Date.now()}`;

  const existingIdx = library.findIndex((c) => c.id === id);
  const saved: SavedCohort = {
    id,
    name: entry.name,
    criteria: entry.criteria,
    enabled: entry.enabled,
    resultCount: entry.resultCount,
    notes: entry.notes,
    createdAt: existingIdx >= 0 ? library[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    library[existingIdx] = saved;
  } else {
    library.unshift(saved);
    if (library.length > MAX_SAVED_COHORTS) library.length = MAX_SAVED_COHORTS;
  }

  persistCohortLibrary(library);
  return saved;
}

export function deleteCohortFromLibrary(id: string): void {
  const library = loadCohortLibrary().filter((c) => c.id !== id);
  persistCohortLibrary(library);
}

export function useCohortLibrary() {
  const [cohorts, setCohorts] = useState<SavedCohort[]>([]);

  useEffect(() => {
    setCohorts(loadCohortLibrary());
  }, []);

  const refresh = useCallback(() => {
    setCohorts(loadCohortLibrary());
  }, []);

  const save = useCallback(
    (
      entry: Omit<SavedCohort, "id" | "createdAt" | "updatedAt"> & {
        id?: string;
      },
    ) => {
      const saved = saveCohortToLibrary(entry);
      refresh();
      return saved;
    },
    [refresh],
  );

  const remove = useCallback(
    (id: string) => {
      deleteCohortFromLibrary(id);
      refresh();
    },
    [refresh],
  );

  return { cohorts, save, remove, refresh };
}