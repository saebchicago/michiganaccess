import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useOutageData } from "./useOutageData";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));

describe("useOutageData", () => {
  it.each(["demo", "aggregated", "live"] as const)(
    "only exposes the %s response if it is live",
    async (source) => {
      const response = { zones: [{ county: "Oakland" }], meta: { source } };
      invoke.mockResolvedValueOnce({ data: response, error: null });
      const client = new QueryClient();

      const { result } = renderHook(() => useOutageData(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(source === "live" ? response : null);
    },
  );
});
