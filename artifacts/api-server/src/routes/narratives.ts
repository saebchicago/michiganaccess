import { Router, type Request, type Response } from "express";

const router: Router = Router();

/**
 * Abuse controls for a paid upstream (Mistral) endpoint that has no login.
 * Each request costs two LLM calls, so we cap per-IP frequency and validate
 * every attacker-controlled field before it reaches the prompt.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_CHARS = 2_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) {
    // Bound memory: drop entries whose window has fully expired.
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

/** Plain text only: no newlines, no prompt-instruction payloads, length capped. */
function safeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\r\n]+/g, " ").trim();
  if (!cleaned || cleaned.length > maxLength) return null;
  if (!/^[A-Za-z0-9 .,'’&/()-]+$/.test(cleaned)) return null;
  return cleaned;
}

function safeNumber(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}


const RESIDENT_PROMPT = (
  zip: string,
  county: string,
  equityScore: number,
  equityTier: number,
  topHealthConcern: string,
  medianIncome: number,
) =>
  `Write a 2-paragraph plain-language summary for a resident of ZIP code ${zip} in ${county} County, Michigan. Population data: Equity score ${equityScore}/100 (Tier ${equityTier}). Top health concern: ${topHealthConcern}. Median income: $${medianIncome.toLocaleString()}. Write in second person. Focus on available resources. Empathetic, action-oriented. Under 120 words. Do not mention race. Label data with source year.`;

const STRATEGIST_PROMPT = (
  zip: string,
  county: string,
  equityScore: number,
  equityTier: number,
  topHealthConcern: string,
  renterPct: number,
  lepPct: number,
) =>
  `Write a 2-paragraph professional summary for a hospital system strategist reviewing ZIP ${zip} in ${county} County, Michigan. Equity score ${equityScore}/100 (Tier ${equityTier}). Top concern: ${topHealthConcern}. Renter rate: ${renterPct.toFixed(1)}%. LEP: ${lepPct.toFixed(1)}%. Focus on market opportunity, care gap analysis, community benefit strategy. Professional tone. Under 130 words.`;

router.post("/narratives", async (req: Request, res: Response) => {
  const key = process.env["MISTRAL_API_KEY"];
  if (!key) {
    res.status(503).json({ error: "Narrative generation not configured" });
    return;
  }

  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
  if (rateLimited(ip)) {
    res.setHeader("Retry-After", "60");
    res
      .status(429)
      .json({ error: "Too many narrative requests. Try again in a minute." });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  if (JSON.stringify(body).length > MAX_BODY_CHARS) {
    res.status(413).json({ error: "Request body too large" });
    return;
  }

  const zip = typeof body["zip"] === "string" && /^\d{5}$/.test(body["zip"])
    ? body["zip"]
    : null;
  const county = safeText(body["county"], 40);
  const topHealthConcern = safeText(body["topHealthConcern"], 80) ?? "not reported";
  const equityScore = safeNumber(body["equityScore"], 0, 100);
  const equityTier = safeNumber(body["equityTier"], 1, 5);
  const medianIncome = safeNumber(body["medianIncome"], 0, 1_000_000);
  const renterPct = safeNumber(body["renterPct"], 0, 100);
  const lepPct = safeNumber(body["lepPct"], 0, 100);

  if (
    !zip ||
    !county ||
    equityScore === null ||
    equityTier === null ||
    medianIncome === null ||
    renterPct === null ||
    lepPct === null
  ) {
    res.status(400).json({
      error:
        "A 5-digit ZIP, a county name, and numeric equity, income, renter, and LEP values are required.",
    });
    return;
  }

  const prompts: Record<"resident" | "strategist", string> = {
    resident: RESIDENT_PROMPT(
      zip,
      county,
      equityScore,
      equityTier,
      topHealthConcern,
      medianIncome,
    ),
    strategist: STRATEGIST_PROMPT(
      zip,
      county,
      equityScore,
      equityTier,
      topHealthConcern,
      renterPct,
      lepPct,
    ),
  };

  const results: Record<"resident" | "strategist", string> = {
    resident: "",
    strategist: "",
  };

  for (const role of ["resident", "strategist"] as const) {
    try {
      const mistralRes = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "mistral-small-latest",
            max_tokens: 250,
            messages: [{ role: "user", content: prompts[role] }],
          }),
        },
      );
      if (mistralRes.ok) {
        const data = (await mistralRes.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        results[role] = data.choices?.[0]?.message?.content ?? "";
      }
    } catch {
      // leave empty for this role
    }
  }

  res.json(results);
});

export default router;
