// Mock Supabase client using local mock data
import { mockFacilities, searchFacilities, getFacilitiesByCounty } from "@/data/mockFacilities";

export const supabase = {
  from: (table: string) => ({
    select: () => ({
      eq: (field: string, value: any) => ({
        data: mockFacilities.filter((f) => (f as any)[field] === value),
        error: null,
      }),
      order: (field: string, opts?: any) => ({
        data: mockFacilities.sort((a, b) => {
          const aVal = (a as any)[field];
          const bVal = (b as any)[field];
          return opts?.ascending !== false
            ? aVal > bVal ? 1 : -1
            : aVal < bVal ? 1 : -1;
        }),
        error: null,
      }),
      data: mockFacilities,
      error: null,
    }),
    insert: (data: any) => Promise.resolve({ data, error: null }),
    update: (data: any) => Promise.resolve({ data, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
  },
};

export { searchFacilities, getFacilitiesByCounty, mockFacilities };