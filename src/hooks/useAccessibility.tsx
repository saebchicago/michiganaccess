import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface AccessibilityContextType {
  a11yMode: boolean;
    toggleA11yMode: () => void;
    }

    const AccessibilityContext = createContext<AccessibilityContextType>({
      a11yMode: false,
        toggleA11yMode: () => {},
        });

        const A11Y_KEY = "accessmi-a11y-mode";

        export function AccessibilityProvider({ children }: { children: ReactNode }) {
          const [a11yMode, setA11yMode] = useState(() => localStorage.getItem(A11Y_KEY) === "1");

            const toggleA11yMode = useCallback(() => {
                setA11yMode((prev) => {
                      const next = !prev;
                            localStorage.setItem(A11Y_KEY, next ? "1" : "0");
                                  return next;
                                      });
                                        }, []);

                                          useEffect(() => {
                                              if (a11yMode) {
                                                    document.documentElement.classList.add("a11y-mode");
                                                        } else {
                                                              document.documentElement.classList.remove("a11y-mode");
                                                                  }
                                                                    }, [a11yMode]);

                                                                      return (
                                                                          <AccessibilityContext.Provider value={{ a11yMode, toggleA11yMode }}>
                                                                                {children}
                                                                                    </AccessibilityContext.Provider>
                                                                                      );
                                                                                      }

                                                                                      export function useAccessibility() {
                                                                                        return useContext(AccessibilityContext);
                                                                                        }