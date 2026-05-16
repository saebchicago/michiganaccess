import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface NerdModeContextType {
  nerdMode: boolean;
  setNerdMode: (v: boolean) => void;
  toggleNerdMode: () => void;
}

const NerdModeContext = createContext<NerdModeContextType>({
  nerdMode: false,
  setNerdMode: () => {},
  toggleNerdMode: () => {},
});

const STORAGE_KEY = "accessmi-nerd-mode";

export function NerdModeProvider({ children }: { children: ReactNode }) {
  const [nerdMode, setNerdModeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(nerdMode));
    } catch {}
  }, [nerdMode]);

  const setNerdMode = (v: boolean) => setNerdModeState(v);
  const toggleNerdMode = () => setNerdModeState((p) => !p);

  return (
    <NerdModeContext.Provider value={{ nerdMode, setNerdMode, toggleNerdMode }}>
      {children}
    </NerdModeContext.Provider>
  );
}

export function useNerdMode() {
  return useContext(NerdModeContext);
}
