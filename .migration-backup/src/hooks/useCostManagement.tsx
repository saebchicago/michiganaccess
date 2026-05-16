// Cost Management Context - toggles the entire site between
// 'Live AI Mode' (for testing new features) and 'Static Mode'
// (for low-cost production hosting using the Intelligence Bank).

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type CostMode = "static" | "live";

interface CostManagementContextValue {
  mode: CostMode;
    setMode: (mode: CostMode) => void;
      toggleMode: () => void;
        isStatic: boolean;
          isLive: boolean;
          }

          const CostManagementContext = createContext<CostManagementContextValue>({
            mode: "static",
              setMode: () => {},
                toggleMode: () => {},
                  isStatic: true,
                    isLive: false,
                    });

                    export function CostManagementProvider({ children }: { children: ReactNode }) {
                      const [mode, setMode] = useState<CostMode>("static");

                        const toggleMode = useCallback(() => {
                            setMode((prev) => (prev === "static" ? "live" : "static"));
                              }, []);

                                return (
                                    <CostManagementContext.Provider
                                          value={{
                                                  mode,
                                                          setMode,
                                                                  toggleMode,
                                                                          isStatic: mode === "static",
                                                                                  isLive: mode === "live",
                                                                                        }}
                                                                                            >
                                                                                                  {children}
                                                                                                      </CostManagementContext.Provider>
                                                                                                        );
                                                                                                        }

                                                                                                        export function useCostManagement() {
                                                                                                          return useContext(CostManagementContext);
                                                                                                          }