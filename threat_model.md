# Threat Model

## Project Overview

Access Michigan is a public civic data platform with a React/Vite web frontend, an Expo mobile app, a minimal Express API server, and heavy reliance on Supabase tables and edge functions for data access, submissions, analytics, and AI-backed helpers. The application is intentionally unauthenticated for end users, so nearly every browser-visible route and client-side write path must be treated as publicly reachable in production.

## Assets

- **Resident-submitted data** — contact messages, feedback reports, partner inquiries, community reports, event submissions, and collaborator interest records. These can contain email addresses, phone numbers, free-form narrative, and other sensitive context supplied by users.
- **Behavioral analytics** — search terms, search volume, correction rates, and other engagement metrics. Even when aggregated, these can reveal sensitive community needs or resident intent.
- **Operational integrity** — moderation queues, notification channels, outbound email functions, and Supabase resources. Abuse of public write paths can create spam, data pollution, operator fatigue, and cost/availability impact.
- **Supabase credentials and policies** — the anon/publishable key is intentionally public, so security depends on careful RLS and edge-function authorization. Service-role credentials appear only in ingestion scripts and must remain out of production client bundles.
- **AI and proxy-backed features** — public edge functions and Netlify functions that proxy data or generate AI responses. These can be abused for cost amplification, prompt abuse, or sensitive data exposure if not scoped tightly.

## Trust Boundaries

- **Browser/mobile client to Supabase** — the frontend and mobile app talk directly to Supabase tables and edge functions using the public anon/publishable key. The client is untrusted.
- **Browser/mobile client to custom API / serverless functions** — public users can call the Express API and any Netlify/Supabase function endpoints reachable from shipped code.
- **Application to external data providers** — Supabase edge functions and client code fetch public datasets from government and third-party APIs; those responses are untrusted input.
- **Public read vs public write surfaces** — the app intentionally exposes broad public read access, but public write paths still require abuse controls, moderation boundaries, and least-privilege data exposure.
- **Production vs dev-only code** — `artifacts/mockup-sandbox/`, generated `dist/`, and ingestion scripts are out of scope unless production reachability is demonstrated. `.migration-backup/` is usually out of scope as a deploy target, but `.migration-backup/supabase/*` may be used as supporting evidence when shipped production code directly references the same Supabase function or table names and no fresher policy/function source is present in-repo. The mockup sandbox is assumed never to be deployed to production.

## Scan Anchors

- Production web entry point: `artifacts/access-mi/src/main.tsx`
- Production route map: `artifacts/access-mi/src/config/routes.ts`
- Supabase client boundary: `artifacts/access-mi/src/integrations/supabase/client.ts`
- Public write surfaces: forms/components under `artifacts/access-mi/src/pages/` and `artifacts/access-mi/src/components/` that call `supabase.from(...).insert(...)` or `supabase.functions.invoke(...)`
- Public analytics / partner exports: `artifacts/access-mi/src/pages/SearchTrendsPage.tsx`, `artifacts/access-mi/src/components/partners/MetricsAPI.tsx`, `artifacts/access-mi/src/utils/searchAnalytics.ts`
- API server entry: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`
- Supporting Supabase evidence when directly matched to production-referenced names: `.migration-backup/supabase/config.toml`, `.migration-backup/supabase/functions/*`, `.migration-backup/supabase/migrations/*`
- Usually ignore unless reachability changes: `artifacts/mockup-sandbox/`, `artifacts/access-mi/src/utils/data-ingestion/`, generated `dist/`

## Threat Categories

### Tampering

Because the application permits anonymous public use, every client-side submission flow must assume attackers can script requests directly rather than using the UI. Public write paths that create records, moderation backlog, or outbound notifications must enforce server-side abuse controls such as rate limiting, bot resistance, and strict validation; frontend validation alone is not a security control.

### Information Disclosure

Public-facing analytics, exports, and AI/context features must not expose search behavior, resident-submitted content, or moderation data more broadly than intended. Aggregation claims are only meaningful if low-volume or free-form data cannot be retrieved by arbitrary visitors and if sensitive terms are redacted robustly before storage and display.

### Denial of Service

Unauthenticated forms, edge functions, and AI/proxy endpoints are susceptible to automated abuse and cost amplification. Production-facing endpoints must bound request volume, payload size, and downstream fan-out so a public attacker cannot create spam floods, moderation exhaustion, or sustained third-party API cost.

### Elevation of Privilege

The public anon/publishable Supabase key is safe only if RLS and edge functions enforce least privilege. Routes or functions labeled as admin, export, or internal analytics must not rely on obscurity or frontend routing for access control; authorization must be enforced server-side.
