import { useState, useCallback } from "react";

const KEY = "accessmi-equity-lens";

export function useEquityLens() {
  const [isOn, setIsOn] = useState(() => {
    try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
  });

  const toggle = useCallback(() => {
    setIsOn((prev) => {
      const next = !prev;
      try { localStorage.setItem(KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  return { isEquityLensOn: isOn, toggleEquityLens: toggle };
}
