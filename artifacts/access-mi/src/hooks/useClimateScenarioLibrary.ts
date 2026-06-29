/**
 * Local scenario library for climate stress tests (UC2 Phase 1).
 */

import { useCallback, useEffect, useState } from "react";
import type { ClimateScenarioSeverity } from "@/data/climateScenarios";

export const CLIMATE_SCENARIO_LIBRARY_KEY = "accessmi_climate_scenarios_v1";
export const MAX_SAVED_CLIMATE_SCENARIOS = 15;

export interface SavedClimateScenario {
  id: string;
  name: string;
  scenarioId: string;
  severity: ClimateScenarioSeverity;
  counties?: string[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export function loadClimateScenarioLibrary(): SavedClimateScenario[] {
  try {
    const raw = localStorage.getItem(CLIMATE_SCENARIO_LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedClimateScenario[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistLibrary(entries: SavedClimateScenario[]): void {
  localStorage.setItem(CLIMATE_SCENARIO_LIBRARY_KEY, JSON.stringify(entries));
}

export function useClimateScenarioLibrary() {
  const [scenarios, setScenarios] = useState<SavedClimateScenario[]>([]);

  useEffect(() => {
    setScenarios(loadClimateScenarioLibrary());
  }, []);

  const refresh = useCallback(() => {
    setScenarios(loadClimateScenarioLibrary());
  }, []);

  const save = useCallback(
    (
      entry: Omit<SavedClimateScenario, "id" | "createdAt" | "updatedAt"> & {
        id?: string;
      },
    ) => {
      const library = loadClimateScenarioLibrary();
      const now = new Date().toISOString();
      const id = entry.id ?? `climate-${Date.now()}`;
      const existingIdx = library.findIndex((s) => s.id === id);

      const saved: SavedClimateScenario = {
        id,
        name: entry.name,
        scenarioId: entry.scenarioId,
        severity: entry.severity,
        counties: entry.counties,
        notes: entry.notes,
        createdAt: existingIdx >= 0 ? library[existingIdx].createdAt : now,
        updatedAt: now,
      };

      if (existingIdx >= 0) library[existingIdx] = saved;
      else {
        library.unshift(saved);
        if (library.length > MAX_SAVED_CLIMATE_SCENARIOS) library.length = MAX_SAVED_CLIMATE_SCENARIOS;
      }

      persistLibrary(library);
      refresh();
      return saved;
    },
    [refresh],
  );

  const remove = useCallback(
    (id: string) => {
      persistLibrary(loadClimateScenarioLibrary().filter((s) => s.id !== id));
      refresh();
    },
    [refresh],
  );

  return { scenarios, save, remove, refresh };
}