import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5; // 5 appeals per minute per IP

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

const SYSTEM_PROMPT = `You are an expert health insurance appeal letter generator for Michigan residents. You create professional, compelling appeal letters that maximize the chance of overturning insurance denials.

Your letters follow this structure:
1. Patient identification (use [PATIENT NAME], [DATE OF BIRTH], [MEMBER ID] as placeholders)
2. Denial reference (claim number, date of denial, service denied)
3. Legal basis for appeal citing Michigan Insurance Code and relevant federal regulations
4. Medical necessity argument with clinical justification
5. Supporting evidence section (what documentation to attach)
6. Request for expedited review if applicable
7. Deadline awareness and next steps

Carrier-specific knowledge:
- BCBS Michigan: Reference BCBS Medical Policy guidelines, use their specific appeal form references
- HAP (Health Alliance Plan): Cite HAP member handbook provisions
- Priority Health: Reference Priority Health clinical guidelines
- Molina Healthcare (Michigan Medicaid): Cite 42 CFR 438.400 for Medicaid managed care appeals
- Medicare Advantage: Reference CMS Medicare Managed Care Manual Chapter 13
- Employer-sponsored (ERISA): Cite 29 USC §1133 and DOL regulations

Michigan-specific regulations:
- Michigan Insurance Code MCL 500.2213
- DIFS External Review Process under MCL 550.1901-1920
- Michigan Medicaid Fair Hearing rights under 42 CFR 431.200

Always:
- Use plain, authoritative language (8th grade reading level for patient sections)
- Include specific Michigan Department of Insurance and Financial Services (DIFS) contact info
- Note the 180-day deadline for internal appeals and 127-day deadline for external review
- Suggest obtaining a peer-to-peer review with the carrier's medical director
- NEVER ask for or include actual PHI — always use bracketed placeholders

Output the letter in markdown format.`;

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
      JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before generating another appeal." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  try {
    const { denialType, carrier, serviceDescription, denialReason, appealType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Generate a ${appealType || 'internal'} appeal letter for the following denial:

Carrier: ${carrier || 'Unknown carrier'}
Service Denied: ${serviceDescription || 'Medical service'}
Reason for Denial: ${denialReason || 'Medical necessity'}
Denial Type: ${denialType || 'Standard denial'}

Generate a complete, ready-to-customize appeal letter with all bracketed placeholders for personal information. Include specific Michigan regulations and carrier-specific appeal procedures.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
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
    console.error("appeal-generator error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
