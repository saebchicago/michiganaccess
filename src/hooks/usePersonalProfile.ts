/**
 * usePersonalProfile — client-only personal profile stored in localStorage.
 * No PHI or claims data. No server-side storage.
 * Users can clear at any time.
 */
import { useState, useEffect, useCallback } from "react";

export interface PersonalProfile {
  id?: string;
  primaryZip?: string;
  coverageType?: "medicaid" | "medicare" | "private" | "uninsured" | "unknown";
  mobility?: "drives" | "no_car" | "limited";
  utilities?: string[];
  housingStatus?: "stable" | "at_risk" | "homeless";
  incomeBand?: "low" | "moderate" | "higher" | "unknown";
  favoritePlaces?: string[];
}

const STORAGE_KEY = "mi-access-personal-profile";

function loadProfile(): PersonalProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function usePersonalProfile() {
  const [profile, setProfileState] = useState<PersonalProfile>(loadProfile);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  const updateProfile = useCallback((partial: Partial<PersonalProfile>) => {
    setProfileState((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { profile, updateProfile, clearProfile };
}
