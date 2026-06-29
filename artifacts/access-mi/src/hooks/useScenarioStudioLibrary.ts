/**
 * Local library for saved scenario studio comparisons (UC9 Phase 1).
 */

import { useCallback, useEffect, useState } from "react";
import type { ScenarioSlot } from "@/utils/scenarioStudioModel";

export const SCENARIO_STUDIO_LIBRARY_KEY = "accessmi_scenario_studio_v1";
export const MAX_SAVED_STUDIO_SCENARIOS = 12;

export interface SavedStudioComparison {
  id: string;
  name: string;
  slotA: ScenarioSlot;
  slotB: ScenarioSlot;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export function loadScenarioStudioLibrary(): SavedStudioComparison[] {
  try {
    const raw = localStorage.getItem(SCENARIO_STUDIO_LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedStudioComparison[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(entries: SavedStudioComparison[]): void {
  localStorage.setItem(SCENARIO_STUDIO_LIBRARY_KEY, JSON.stringify(entries));
}

export function useScenarioStudioLibrary() {
  const [comparisons, setComparisons] = useState<SavedStudioComparison[]>([]);

  useEffect(() => {
    setComparisons(loadScenarioStudioLibrary());
  }, []);

  const refresh = useCallback(() => {
    setComparisons(loadScenarioStudioLibrary());
  }, []);

  const save = useCallback(
    (
      entry: Omit<SavedStudioComparison, "id" | "createdAt" | "updatedAt"> & {
        id?: string;
      },
    ) => {
      const library = loadScenarioStudioLibrary();
      const now = new Date().toISOString();
      const id = entry.id ?? `studio-${Date.now()}`;
      const idx = library.findIndex((s) => s.id === id);

      const saved: SavedStudioComparison = {
        id,
        name: entry.name,
        slotA: entry.slotA,
        slotB: entry.slotB,
        notes: entry.notes,
        createdAt: idx >= 0 ? library[idx].createdAt : now,
        updatedAt: now,
      };

      if (idx >= 0) library[idx] = saved;
      else {
        library.unshift(saved);
        if (library.length > MAX_SAVED_STUDIO_SCENARIOS) library.length = MAX_SAVED_STUDIO_SCENARIOS;
      }

      persist(library);
      refresh();
      return saved;
    },
    [refresh],
  );

  const remove = useCallback(
    (id: string) => {
      persist(loadScenarioStudioLibrary().filter((s) => s.id !== id));
      refresh();
    },
    [refresh],
  );

  return { comparisons, save, remove, refresh };
}