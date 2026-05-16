// Auto-Retry Hook - Production Health Shield for resilient data fetches.
// Implements exponential backoff with jitter for failed requests.

import { useState, useCallback, useRef } from "react";

interface AutoRetryOptions {
  maxRetries?: number;
    baseDelay?: number;
      maxDelay?: number;
        onRetry?: (attempt: number, error: Error) => void;
        }

        interface AutoRetryResult<T> {
          data: T | null;
            error: Error | null;
              isLoading: boolean;
                retryCount: number;
                  execute: () => Promise<T | null>;
                    reset: () => void;
                    }

                    export function useAutoRetry<T>(
                      fetcher: () => Promise<T>,
                        options: AutoRetryOptions = {}
                        ): AutoRetryResult<T> {
                          const { maxRetries = 3, baseDelay = 500, maxDelay = 5000, onRetry } = options;
                            const [data, setData] = useState<T | null>(null);
                              const [error, setError] = useState<Error | null>(null);
                                const [isLoading, setIsLoading] = useState(false);
                                  const [retryCount, setRetryCount] = useState(0);
                                    const abortRef = useRef(false);

                                      const execute = useCallback(async (): Promise<T | null> => {
                                          setIsLoading(true);
                                              setError(null);
                                                  abortRef.current = false;

                                                      for (let attempt = 0; attempt <= maxRetries; attempt++) {
                                                            if (abortRef.current) break;

                                                                  try {
                                                                          const result = await fetcher();
                                                                                  setData(result);
                                                                                          setRetryCount(attempt);
                                                                                                  setIsLoading(false);
                                                                                                          return result;
                                                                                                                } catch (err) {
                                                                                                                        const error = err instanceof Error ? err : new Error(String(err));

                                                                                                                                if (attempt < maxRetries) {
                                                                                                                                          onRetry?.(attempt, error);
                                                                                                                                                    const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 100, maxDelay);
                                                                                                                                                              await new Promise((r) => setTimeout(r, delay));
                                                                                                                                                                      } else {
                                                                                                                                                                                setError(error);
                                                                                                                                                                                          setIsLoading(false);
                                                                                                                                                                                                    return null;
                                                                                                                                                                                                            }
                                                                                                                                                                                                                  }
                                                                                                                                                                                                                      }

                                                                                                                                                                                                                          setIsLoading(false);
                                                                                                                                                                                                                              return null;
                                                                                                                                                                                                                                }, [fetcher, maxRetries, baseDelay, maxDelay, onRetry]);

                                                                                                                                                                                                                                  const reset = useCallback(() => {
                                                                                                                                                                                                                                      abortRef.current = true;
                                                                                                                                                                                                                                          setData(null);
                                                                                                                                                                                                                                              setError(null);
                                                                                                                                                                                                                                                  setIsLoading(false);
                                                                                                                                                                                                                                                      setRetryCount(0);
                                                                                                                                                                                                                                                        }, []);

                                                                                                                                                                                                                                                          return { data, error, isLoading, retryCount, execute, reset };
                                                                                                                                                                                                                                                          }