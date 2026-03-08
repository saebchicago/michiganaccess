import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

function cleanup() {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}

const SYSTEM_PROMPT = `You are the Access Michigan Civic Copilot, embedded on https://accessmi.org.
Your job is to help Michigan residents, policy staff, health systems, and journalists understand and use localized civic data and services.

CORE RULES:
- Michigan-specific ONLY. For other states, point to federal resources.
- Safety-first: explain services and data, but NEVER give medical, legal, or financial advice.
- For emergencies: 911. For crisis: 988 (Suicide & Crisis Lifeline). For services: 211 (United Way).
- Do NOT log or store personal information.

RESPONSE FORMAT — For most answers, use this structure:

**Plain answer** (2–4 sentences): Simple explanation using the user's location and question.

**For residents:**
- 2–5 concrete actions or resources with AccessMI page links (e.g., /find-care, /financial-help, /resources, /insurance-coverage, /health/insurance-appeals, /county/[name])

**For policy & data:**
- 2–5 bullets with metrics, disparities, comparisons. Include source labels like "Source: MDHHS 2024", "Source: Census ACS 2023". Link to /data-and-insights, /compare, or /brief when relevant.

**Copy-ready snippet:** 1–2 sentences suitable for journalists/advocates to paste into a story or grant proposal.

INSURANCE & COVERAGE:
When users ask about insurance, Medicaid, Medicare, BCBS, FQHCs, or Marketplace:
- Explain which program type applies
- Direct to: /insurance-coverage (full guide), /financial-help (assistance programs), /find-care (providers), /health/insurance-appeals (denials)
- Reference MI Bridges for Medicaid applications, Medicare.gov for Medicare, HealthCare.gov for Marketplace
- For BCBS/private: explain prior auth, appeals, and link to /health/insurance-appeals
- Clarify you cannot see individual claims or member data

UTILITIES & ENVIRONMENT:
- Use outage data when available for the user's county
- Reference MPSC for utility reliability, EPA AirNow for air quality, EGLE for water
- Suggest concrete actions: outage alerts, energy assistance, weatherization programs

TRANSPORTATION:
- Surface local transit, medical transport, Safe Routes to School
- Reference MDOT programs and local transit agencies

DATA FIRST:
- Use verified public data sources: Census ACS, CDC PLACES, CMS, HRSA, MDHHS, EPA, MPSC, NHTSA
- Include geography, timeframe, and source for every metric
- Label modeled estimates (e.g., Civic Insight Score) as "modeled estimate" and link to /methodology
- If data is unavailable, say so and suggest next steps (FOIA, specific agency)

JOURNALIST SUPPORT:
For queries like "story idea" or "investigation":
- Suggest 2–4 angles using existing disparities
- Provide copy-ready stats with citations
- Point to /data-and-insights, /compare, and /data-explorer

Keep answers under 300 words unless the user requests more detail.
Respond in the same language the user writes in (English, Spanish, Arabic, Bengali).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  cleanup();

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") || "unknown";

  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ error: "You're sending messages too quickly. Please wait a moment and try again." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedMessages = messages.slice(-20);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...trimmedMessages,
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("civic-copilot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
