# Access Michigan

A civic data platform providing Michigan residents with verified public health, economic, housing, and civic data across all 83 counties — free and organized for action.

## Run & Operate

- `pnpm --filter @workspace/access-mi run dev` — run the frontend (auto-started by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18, Vite, Tailwind v3, shadcn/ui, react-router-dom
- API: Express 5 (api-server artifact)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Data: Supabase (external — needs VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)

## Where things live

- `artifacts/access-mi/` — React/Vite frontend (migrated from Lovable)
- `artifacts/access-mi/src/App.tsx` — routing (react-router-dom BrowserRouter)
- `artifacts/access-mi/src/config/routes.ts` — all page routes
- `artifacts/access-mi/src/integrations/supabase/client.ts` — Supabase client (needs env vars)
- `artifacts/access-mi/src/integrations/supabase/types.ts` — full DB schema types
- `artifacts/api-server/` — Express backend
- `lib/db/src/schema/index.ts` — Drizzle DB schema (empty, Supabase holds the data)

## Architecture decisions

- **Supabase kept as-is**: The app uses 18+ Supabase edge functions as external API proxies (CDC, Census, ArcGIS, GTFS, etc.) and 20+ tables. Replacing these with Replit primitives is a large project. The client degrades gracefully when Supabase credentials are missing.
- **No auth**: The app is fully public-facing — no login required.
- **Tailwind v3**: The original app uses Tailwind v3 + shadcn with a custom CSS variable design system. Not upgraded to v4 to preserve exact styling.
- **react-router-dom**: Uses BrowserRouter (not wouter) with lazy-loaded routes via `src/config/routes.ts`.

## Product

Access Michigan provides ZIP- and county-level data on healthcare, housing, food access, transit, environment, civic power, and more across Michigan. Users can look up their neighborhood, compare counties, explore datasets, and find local services.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The app needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set to enable data features. Without them, Supabase-dependent features silently degrade (the client warns in console).
- Data ingestion scripts live in `src/utils/data-ingestion/` — these seed Supabase, not the Replit DB.
- PWA plugin (`vite-plugin-pwa`) and prerenderer (`@prerenderer/rollup-plugin`) from the original were dropped — not supported in Replit workflow.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
