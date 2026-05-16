// Performance Monitor - Lighthouse-style health check for the dev console.
// Measures INP (Interaction to Next Paint), LCP, CLS, and flags slow queries.
// Enforces strict AccessMI performance budget: CLS < 0.05, INP < 150ms, LCP < 1.2s, Heap < 35MB.

import { useState, useEffect, useCallback, useRef } from "react";

export interface PerfMetric {
  name: string;
    value: number;
      rating: "good" | "needs-improvement" | "poor";
        threshold: number;
          unit: string;
          }

          export interface PerfSnapshot {
            timestamp: number;
              zipCode: string | null;
                metrics: PerfMetric[];
                  overallScore: number;
                    warnings: string[];
                    }

                    function rateMetric(value: number, good: number, poor: number): "good" | "needs-improvement" | "poor" {
                      if (value <= good) return "good";
                        if (value <= poor) return "needs-improvement";
                          return "poor";
                          }

                          // Strict performance budget thresholds
                          const BUDGET = {
                            INP: { good: 150, poor: 300 },
                              CLS: { good: 0.05, poor: 0.15 },
                                LCP: { good: 1200, poor: 2500 },
                                  FCP: { good: 1000, poor: 1800 },
                                    HEAP: { good: 35, poor: 70 },
                                    } as const;

                                    const LIGHTHOUSE_WARNING_THRESHOLD = 85;

                                    export function usePerformanceMonitor() {
                                      const [snapshots, setSnapshots] = useState<PerfSnapshot[]>([]);
                                        const [isMonitoring, setIsMonitoring] = useState(false);
                                          const interactionTimings = useRef<number[]>([]);
                                            const layoutShifts = useRef<number>(0);
                                              const lcpValue = useRef<number>(0);
                                                const hasWarnedRef = useRef(false);

                                                  // Track INP via Event Timing API
                                                    useEffect(() => {
                                                        if (!isMonitoring) return;
                                                            const observer = new PerformanceObserver((list) => {
                                                                  for (const entry of list.getEntries()) {
                                                                          if (entry.entryType === "event") {
                                                                                    interactionTimings.current.push((entry as PerformanceEventTiming).duration);
                                                                                            }
                                                                                                    if (entry.entryType === "layout-shift" && !(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
                                                                                                              layoutShifts.current += (entry as unknown as { value: number }).value;
                                                                                                                      }
                                                                                                                              if (entry.entryType === "largest-contentful-paint") {
                                                                                                                                        lcpValue.current = entry.startTime;
                                                                                                                                                }
                                                                                                                                                      }
                                                                                                                                                          });
                                                                                                                                                              try {
                                                                                                                                                                    observer.observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
                                                                                                                                                                          observer.observe({ type: "layout-shift", buffered: true });
                                                                                                                                                                                observer.observe({ type: "largest-contentful-paint", buffered: true });
                                                                                                                                                                                    } catch {
                                                                                                                                                                                          // Not all browsers support all entry types
                                                                                                                                                                                              }
                                                                                                                                                                                                  return () => observer.disconnect();
                                                                                                                                                                                                    }, [isMonitoring]);

                                                                                                                                                                                                      const captureSnapshot = useCallback((zipCode: string | null) => {
                                                                                                                                                                                                          const timings = interactionTimings.current;
                                                                                                                                                                                                              const p98INP = timings.length > 0
                                                                                                                                                                                                                    ? timings.sort((a, b) => a - b)[Math.floor(timings.length * 0.98)] ?? 0
                                                                                                                                                                                                                          : 0;
                                                                                                                                                                                                                              const cls = layoutShifts.current;
                                                                                                                                                                                                                                  const lcp = lcpValue.current;
                                                                                                                                                                                                                                      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
                                                                                                                                                                                                                                          const heapMB = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
                                                                                                                                                                                                                                                ? Math.round((performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1024 / 1024)
                                                                                                                                                                                                                                                      : 0;

                                                                                                                                                                                                                                                          const metrics: PerfMetric[] = [
                                                                                                                                                                                                                                                                { name: "INP (p98)", value: Math.round(p98INP), rating: rateMetric(p98INP, BUDGET.INP.good, BUDGET.INP.poor), threshold: BUDGET.INP.good, unit: "ms" },
                                                                                                                                                                                                                                                                      { name: "CLS", value: Math.round(cls * 1000) / 1000, rating: rateMetric(cls, BUDGET.CLS.good, BUDGET.CLS.poor), threshold: BUDGET.CLS.good, unit: "" },
                                                                                                                                                                                                                                                                            { name: "LCP", value: Math.round(lcp), rating: rateMetric(lcp, BUDGET.LCP.good, BUDGET.LCP.poor), threshold: BUDGET.LCP.good, unit: "ms" },
                                                                                                                                                                                                                                                                                  { name: "FCP", value: Math.round(fcp), rating: rateMetric(fcp, BUDGET.FCP.good, BUDGET.FCP.poor), threshold: BUDGET.FCP.good, unit: "ms" },
                                                                                                                                                                                                                                                                                      ];

                                                                                                                                                                                                                                                                                          if (heapMB > 0) {
                                                                                                                                                                                                                                                                                                metrics.push({ name: "Heap", value: heapMB, rating: rateMetric(heapMB, BUDGET.HEAP.good, BUDGET.HEAP.poor), threshold: BUDGET.HEAP.good, unit: "MB" });
                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                        const warnings: string[] = [];
                                                                                                                                                                                                                                                                                                            if (p98INP > BUDGET.INP.good) warnings.push(`INP ${Math.round(p98INP)}ms exceeds ${BUDGET.INP.good}ms budget`);
                                                                                                                                                                                                                                                                                                                if (cls > BUDGET.CLS.good) warnings.push(`CLS ${cls.toFixed(3)} exceeds ${BUDGET.CLS.good} budget`);
                                                                                                                                                                                                                                                                                                                    if (lcp > BUDGET.LCP.good) warnings.push(`LCP ${Math.round(lcp)}ms exceeds ${BUDGET.LCP.good}ms budget`);
                                                                                                                                                                                                                                                                                                                        if (heapMB > BUDGET.HEAP.good) warnings.push(`Heap ${heapMB}MB exceeds ${BUDGET.HEAP.good}MB budget`);

                                                                                                                                                                                                                                                                                                                            const goodCount = metrics.filter((m) => m.rating === "good").length;
                                                                                                                                                                                                                                                                                                                                const overallScore = Math.round((goodCount / metrics.length) * 100);

                                                                                                                                                                                                                                                                                                                                    if (import.meta.env.DEV && overallScore < LIGHTHOUSE_WARNING_THRESHOLD && !hasWarnedRef.current) {
                                                                                                                                                                                                                                                                                                                                          hasWarnedRef.current = true;
                                                                                                                                                                                                                                                                                                                                                console.warn(`%c AccessMI Performance Budget Violation - Score ${overallScore}/100`, "color: #ff6b35; font-weight: bold;");
                                                                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                                                                        const snapshot: PerfSnapshot = { timestamp: Date.now(), zipCode, metrics, overallScore, warnings };
                                                                                                                                                                                                                                                                                                                                                            setSnapshots((prev) => [snapshot, ...prev].slice(0, 20));

                                                                                                                                                                                                                                                                                                                                                                interactionTimings.current = [];
                                                                                                                                                                                                                                                                                                                                                                    return snapshot;
                                                                                                                                                                                                                                                                                                                                                                      }, []);

                                                                                                                                                                                                                                                                                                                                                                        const toggleMonitoring = useCallback(() => {
                                                                                                                                                                                                                                                                                                                                                                            setIsMonitoring((prev) => !prev);
                                                                                                                                                                                                                                                                                                                                                                                if (!isMonitoring) {
                                                                                                                                                                                                                                                                                                                                                                                      interactionTimings.current = [];
                                                                                                                                                                                                                                                                                                                                                                                            layoutShifts.current = 0;
                                                                                                                                                                                                                                                                                                                                                                                                  lcpValue.current = 0;
                                                                                                                                                                                                                                                                                                                                                                                                        hasWarnedRef.current = false;
                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                              }, [isMonitoring]);

                                                                                                                                                                                                                                                                                                                                                                                                                const clearSnapshots = useCallback(() => setSnapshots([]), []);

                                                                                                                                                                                                                                                                                                                                                                                                                  return { isMonitoring, toggleMonitoring, captureSnapshot, snapshots, clearSnapshots };
                                                                                                                                                                                                                                                                                                                                                                                                                  }