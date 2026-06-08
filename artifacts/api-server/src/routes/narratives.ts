import { Router, type Request, type Response } from "express";

const router: Router = Router();

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

  const {
    zip,
    county,
    equityScore,
    equityTier,
    topHealthConcern,
    medianIncome,
    renterPct,
    lepPct,
  } = req.body as {
    zip: string;
    county: string;
    equityScore: number;
    equityTier: number;
    topHealthConcern: string;
    medianIncome: number;
    renterPct: number;
    lepPct: number;
  };

  if (!zip || !county) {
    res.status(400).json({ error: "zip and county are required" });
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
