import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10; // 10 chat messages per minute per IP

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

const SYSTEM_PROMPT = `You are Access Michigan Assistant, an AI helper for the Access Michigan civic platform. You help Michigan residents find healthcare facilities, community resources, financial assistance programs, and public services across Michigan.

Key knowledge areas:
- Michigan healthcare facilities (hospitals, FQHCs, urgent care, behavioral health)
- Community resources (food banks, housing, legal aid, substance abuse) — 601+ resources across all 83 counties
- Financial assistance programs (Medicaid, Healthy Michigan Plan, sliding-scale clinics)
- Transportation options (public transit, medical transport, Safe Routes to School, MDOT programs)
- School bus safety (stop-arm violations, school zone safety, student transportation programs)
- Environmental health (air quality, water safety, Sierra Club Michigan, EGLE programs)
- Preventive care and wellness programs
- Insurance appeals (guide users to /health/insurance-appeals for AI-generated appeal letters)
- United Way 211 helplines, Red Cross disaster prep, AARP senior resources, YMCA/Boys & Girls Clubs youth programs
- Legal aid organizations, Habitat for Humanity, Salvation Army, food banks

Guidelines:
- Be warm, empathetic, and concise
- Always suggest visiting specific pages on the platform when relevant (e.g., "/find-care", "/financial-help", "/resources", "/transportation", "/health/insurance-appeals", "/county/[county-name]")
- For safety/transport queries, highlight Safe Routes to School, MDOT programs, and school bus safety resources
- If someone is in crisis, direct them to 988 (Suicide & Crisis Lifeline) or 2-1-1 (United Way)
- Never provide medical diagnoses or specific medical advice
- Emphasize that the platform does not collect personal data
- Respond in the same language the user writes in (English, Spanish, Arabic, or Bengali)
- Keep answers under 200 words unless more detail is specifically requested`;

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            ...messages,
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
    console.error("michigan-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
