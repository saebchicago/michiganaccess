import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { type MetricKey, MICHIGAN_COUNTIES, MICHIGAN_ZIPS, type CountyData, type ZipCodeData } from "@/data/granular/michigan-data";

interface DashboardState {
  metric: MetricKey;
    showZips: boolean;
      showComparison: boolean;
        showTrends: boolean;
          annotations: boolean;
            selectedType: "county" | "zip" | null;
              selectedId: string | null; // fips for county, zip for zip
              }

              function encodeSnapshot(state: DashboardState): string {
                const compact = {
                    m: state.metric,
                        z: state.showZips ? 1 : 0,
                            c: state.showComparison ? 1 : 0,
                                t: state.showTrends ? 1 : 0,
                                    a: state.annotations ? 1 : 0,
                                        st: state.selectedType || "",
                                            si: state.selectedId || "",
                                              };
                                                return btoa(JSON.stringify(compact));
                                                }

                                                function decodeSnapshot(encoded: string): DashboardState | null {
                                                  try {
                                                      const compact = JSON.parse(atob(encoded));
                                                          return {
                                                                metric: compact.m as MetricKey,
                                                                      showZips: compact.z === 1,
                                                                            showComparison: compact.c === 1,
                                                                                  showTrends: compact.t === 1,
                                                                                        annotations: compact.a === 1,
                                                                                              selectedType: compact.st || null,
                                                                                                    selectedId: compact.si || null,
                                                                                                        };
                                                                                                          } catch {
                                                                                                              return null;
                                                                                                                }
                                                                                                                }

                                                                                                                export function resolveSelection(
                                                                                                                  type: "county" | "zip" | null,
                                                                                                                    id: string | null
                                                                                                                    ): { data: CountyData | ZipCodeData; type: "county" | "zip" } | null {
                                                                                                                      if (!type || !id) return null;
                                                                                                                        if (type === "county") {
                                                                                                                            const data = MICHIGAN_COUNTIES.find((c) => c.fips === id);
                                                                                                                                return data ? { data, type } : null;
                                                                                                                                  } else {
                                                                                                                                      const data = MICHIGAN_ZIPS.find((z) => z.zip === id);
                                                                                                                                          return data ? { data, type } : null;
                                                                                                                                            }
                                                                                                                                            }

                                                                                                                                            interface UseShareSnapshotArgs {
                                                                                                                                              metric: MetricKey;
                                                                                                                                                showZips: boolean;
                                                                                                                                                  showComparison: boolean;
                                                                                                                                                    showTrends: boolean;
                                                                                                                                                      annotations: boolean;
                                                                                                                                                        selectedType: "county" | "zip" | null;
                                                                                                                                                          selectedId: string | null;
                                                                                                                                                            onRestore: (state: DashboardState) => void;
                                                                                                                                                            }

                                                                                                                                                            export function useShareSnapshot({
                                                                                                                                                              metric,
                                                                                                                                                                showZips,
                                                                                                                                                                  showComparison,
                                                                                                                                                                    showTrends,
                                                                                                                                                                      annotations,
                                                                                                                                                                        selectedType,
                                                                                                                                                                          selectedId,
                                                                                                                                                                            onRestore,
                                                                                                                                                                            }: UseShareSnapshotArgs) {
                                                                                                                                                                              const [searchParams, setSearchParams] = useSearchParams();

                                                                                                                                                                                // Restore from URL on mount
                                                                                                                                                                                  useEffect(() => {
                                                                                                                                                                                      const snap = searchParams.get("snap");
                                                                                                                                                                                          if (snap) {
                                                                                                                                                                                                const state = decodeSnapshot(snap);
                                                                                                                                                                                                      if (state) {
                                                                                                                                                                                                              onRestore(state);
                                                                                                                                                                                                                      // Clean the URL after restoring
                                                                                                                                                                                                                              setSearchParams({}, { replace: true });
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                            // Only run on mount
                                                                                                                                                                                                                                                // eslint-disable-next-line react-hooks/exhaustive-deps
                                                                                                                                                                                                                                                  }, []);

                                                                                                                                                                                                                                                    const generateShareUrl = useCallback(() => {
                                                                                                                                                                                                                                                        const state: DashboardState = {
                                                                                                                                                                                                                                                              metric,
                                                                                                                                                                                                                                                                    showZips,
                                                                                                                                                                                                                                                                          showComparison,
                                                                                                                                                                                                                                                                                showTrends,
                                                                                                                                                                                                                                                                                      annotations,
                                                                                                                                                                                                                                                                                            selectedType,
                                                                                                                                                                                                                                                                                                  selectedId,
                                                                                                                                                                                                                                                                                                      };
                                                                                                                                                                                                                                                                                                          const encoded = encodeSnapshot(state);
                                                                                                                                                                                                                                                                                                              const url = `${window.location.origin}${window.location.pathname}?snap=${encoded}`;
                                                                                                                                                                                                                                                                                                                  return url;
                                                                                                                                                                                                                                                                                                                    }, [metric, showZips, showComparison, showTrends, annotations, selectedType, selectedId]);

                                                                                                                                                                                                                                                                                                                      const copyShareUrl = useCallback(async () => {
                                                                                                                                                                                                                                                                                                                          const url = generateShareUrl();
                                                                                                                                                                                                                                                                                                                              try {
                                                                                                                                                                                                                                                                                                                                    await navigator.clipboard.writeText(url);
                                                                                                                                                                                                                                                                                                                                          return true;
                                                                                                                                                                                                                                                                                                                                              } catch {
                                                                                                                                                                                                                                                                                                                                                    // Fallback
                                                                                                                                                                                                                                                                                                                                                          const input = document.createElement("input");
                                                                                                                                                                                                                                                                                                                                                                input.value = url;
                                                                                                                                                                                                                                                                                                                                                                      document.body.appendChild(input);
                                                                                                                                                                                                                                                                                                                                                                            input.select();
                                                                                                                                                                                                                                                                                                                                                                                  document.execCommand("copy");
                                                                                                                                                                                                                                                                                                                                                                                        document.body.removeChild(input);
                                                                                                                                                                                                                                                                                                                                                                                              return true;
                                                                                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                                                                                    }, [generateShareUrl]);

                                                                                                                                                                                                                                                                                                                                                                                                      return { generateShareUrl, copyShareUrl };
                                                                                                                                                                                                                                                                                                                                                                                                      }