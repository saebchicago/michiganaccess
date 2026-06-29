// Centralized AI Service - All Mistral calls go through Netlify function
// API key is server-side only; data context is fetched and injected per call

import {
  searchVerifiedClaims,
  formatVerifiedClaimsContext,
} from "@/utils/verifiedClaimsRag";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface MichiganDataContext {
  county?: string;
  sector?: string; // e.g. "health", "environment", "housing"
  data?: Record<string, unknown>;
}

// ─── Base URL for Netlify functions ───────────────────────────────────────────
const BASE_URL =
  import.meta.env.VITE_NETLIFY_FUNCTIONS_URL ||
  "/.netlify/functions";

// ─── Core: call chat-mistral Netlify function ─────────────────────────────────
async function callMistral(
  messages: Message[],
  dataContext?: MichiganDataContext
): Promise<string> {
  const payload: { messages: Message[]; dataContext?: MichiganDataContext } = {
    messages,
  };
  if (dataContext) payload.dataContext = dataContext;

  const res = await fetch(`${BASE_URL}/chat-mistral`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `AI service error ${res.status}: ${
        (err as { error?: string }).error || res.statusText
      }`
    );
  }

  const json = await res.json();
  return (json as { reply: string }).reply;
}

// ─── Core: fetch Michigan civic data from michigan-data Netlify function ───────
export async function fetchMichiganData(
  county?: string,
  sector?: string
): Promise<Record<string, unknown>> {
  try {
    const params = new URLSearchParams();
    if (county) params.set("county", county);
    if (sector) params.set("sector", sector);
    const res = await fetch(
      `${BASE_URL}/michigan-data?${params.toString()}`
    );
    if (!res.ok) return {};
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// ─── FEATURE 1: CHAT WIDGET ───────────────────────────────────────────────────
// General Q&A about Michigan services, optionally enriched with live county data
export async function chatWithAssistant(
  userMessage: string,
  conversationHistory: Message[] = [],
  county?: string
): Promise<string> {
  const systemPrompt = `You are the Michigan Access Civic Data Engine, embedded in a public platform that helps people in all 83 Michigan counties understand local conditions and connect to services. Your job is to turn Michigan-specific data into clear, equity-focused, practical insights across sectors: health, housing, energy, water, environment, transportation, safety, justice and courts, zoning and land use, education and jobs, food, youth, seniors, veterans.

The application may pass you summary data from Michigan Open Data, EGLE, MDHHS, CDC, HRSA, ArcGIS, and other public sources. When structured data is provided in the context, treat it as ground truth.

Always anchor answers in place (county, city, ZIP) when the user mentions one. Use an equity lens: highlight gaps by race/ethnicity, income, disability, age, and geography when supported by Michigan data. Look across sectors for overlapping burdens.

For emergencies: 911 | Mental health crisis: 988 | Any need: 211
Keep responses concise, plain-language, and actionable.`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const ragMatches = searchVerifiedClaims(userMessage, 6);
  const verifiedBlock = formatVerifiedClaimsContext(ragMatches);

  const data: Record<string, unknown> = {};
  if (verifiedBlock) {
    data.verifiedClaims = verifiedBlock;
  }
  if (county) {
    Object.assign(data, await fetchMichiganData(county, "health"));
  }

  const dataContext: MichiganDataContext | undefined =
    Object.keys(data).length > 0
      ? { county: county ?? "Michigan", data }
      : undefined;

  return callMistral(messages, dataContext);
}

// ─── FEATURE 2: INSURANCE APPEAL BUILDER ─────────────────────────────────────
export async function generateInsuranceAppeal(
  denialReason: string,
  claimDetails: string,
  userContext: string
): Promise<string> {
  const systemPrompt = `You are an expert in Michigan insurance appeals and patient advocacy.
Help residents write compelling, evidence-based appeal letters for denied insurance claims.
- Reference Michigan insurance regulations and patient rights
- Be specific and evidence-based
- Provide step-by-step guidance and clear next steps
- Use professional but accessible language`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Help me draft an insurance appeal for:
Denial Reason: ${denialReason}
Claim Details: ${claimDetails}
My Situation: ${userContext}
Provide a structured, persuasive appeal letter I can customize.`,
    },
  ];
  return callMistral(messages);
}

// ─── FEATURE 3: RESOURCE RECOMMENDATIONS ─────────────────────────────────────
// Smart service matching, enriched with live county data
export async function getResourceRecommendations(
  userNeeds: string,
  location: string,
  demographics?: string
): Promise<string> {
  const systemPrompt = `You are a Michigan social services expert. Based on user needs and location, recommend specific programs, agencies, and resources.
- Be specific with program names, eligibility criteria, and application processes
- Prioritize free and low-cost options and include contact information
- Consider equity - recommend programs serving underserved populations when relevant
- Use any county data provided in context to personalise recommendations`;

  const countyData = await fetchMichiganData(location, "health");

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `I need help finding resources for: ${userNeeds}
Location: ${location}
${demographics ? `Background/Situation: ${demographics}` : ""}
Please recommend specific programs and the best way to access them.`,
    },
  ];
  return callMistral(messages, { county: location, data: countyData });
}

// ─── FEATURE 4: EQUITY INSIGHTS & ANALYSIS ───────────────────────────────────
// Explain health/equity disparities, enriched with live data
export async function analyzeEquityIssue(
  metric: string,
  county: string,
  historicalContext?: string
): Promise<string> {
  const systemPrompt = `You are a health equity expert with deep knowledge of Michigan health disparities and structural inequities.
Provide context and analysis:
- Explain root causes (structural, systemic, historical)
- Discuss real-world impacts on communities
- Suggest evidence-based solutions
- Use data-driven language but keep it accessible
- Connect to broader health equity frameworks
- When county data is provided in context, use it to anchor your analysis`;

  const countyData = await fetchMichiganData(county, "health");

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Explain the disparities in "${metric}" in ${county} County, Michigan.
${historicalContext ? `Historical/contextual information: ${historicalContext}` : ""}
Provide brief, actionable insights about causes and what can be done.`,
    },
  ];
  return callMistral(messages, { county, data: countyData });
}

// ─── FEATURE 5: CONTENT GENERATION ───────────────────────────────────────────
export async function generateContent(
  topic: string,
  format: "faq" | "guide" | "explanation" | "comparison",
  audience?: string
): Promise<string> {
  const systemPrompt = `You are a Michigan public health and social services educator who creates clear, accessible content.
Write for diverse Michigan audiences - prioritize clarity and actionability.
- Avoid jargon or explain it
- Use Michigan-specific examples and resources
- Structure content for easy scanning with practical next steps`;

  let userPrompt = `Create a ${format} about: ${topic}`;
  if (audience) userPrompt += `\nTarget audience: ${audience}`;
  if (format === "faq") userPrompt += "\nInclude 5-7 of the most common questions and clear answers.";
  else if (format === "guide") userPrompt += "\nInclude step-by-step instructions with timeline estimates.";
  else if (format === "comparison") userPrompt += "\nCompare 3-4 main options with pros, cons, and recommendations.";
  else if (format === "explanation") userPrompt += "\nExplain clearly and include why this matters for Michigan residents.";

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  return callMistral(messages);
}

// ─── FEATURE 6: CRISIS SUPPORT ───────────────────────────────────────────────
export async function crisisSupport(
  situation: string,
  immediateNeed: string
): Promise<string> {
  const systemPrompt = `You are a crisis support specialist trained in trauma-informed, compassionate care.
- Be warm, non-judgmental, and immediately helpful
- Validate feelings and provide practical immediate steps
- Always include crisis hotline numbers
- If danger to self or others, emphasize calling 988 or 911 immediately
Michigan crisis resources: 988 Suicide & Crisis Lifeline (24/7) | 211 (any help) | 911 (emergencies)`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `I'm in crisis. Here's what's happening: ${situation}\nRight now I need: ${immediateNeed}\nWhat support and resources can help me?`,
    },
  ];
  return callMistral(messages);
}

// ─── FEATURE 7: DATA EXPLANATION ─────────────────────────────────────────────
export async function explainHealthData(
  metric: string,
  value: string | number,
  context?: string
): Promise<string> {
  const systemPrompt = `You are a health data interpreter who explains statistics to everyday people.
- Explain what the number means in real terms
- Compare to other Michigan counties or national averages
- Discuss why this metric matters
- Avoid scary language but be honest`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Help me understand this health metric:\nMetric: ${metric}\nValue: ${value}\n${context ? `Context: ${context}` : ""}\nWhat does this mean for my health and community?`,
    },
  ];
  return callMistral(messages);
}

// ─── FEATURE 8: COUNTY CIVIC INSIGHT STORY ───────────────────────────────────
// NEW: Pulls live data for a county across all sectors and generates a narrative
export async function generateCountyInsightStory(
  county: string,
  audience: "resident" | "health-system" = "resident"
): Promise<string> {
  const systemPrompt = `You are the Michigan Access Civic Data Engine. Given county-level data across sectors (health, environment, housing, energy, education, transit, safety, equity), generate a clear, data-driven insight story.

For RESIDENT audience: explain what the numbers mean day-to-day, flag top 2-3 risks, and suggest 3-5 concrete programs to explore.
For HEALTH-SYSTEM audience: highlight where clinical and social needs converge, suggest SDOH screening priorities and community referral pathways.

Always: name specific Michigan programs (not generic US ones), use plain language, and close with one equity takeaway sentence a journalist could quote.`;

  // Fetch data across multiple sectors in parallel
  const [healthData, envData, housingData] = await Promise.all([
    fetchMichiganData(county, "health"),
    fetchMichiganData(county, "environment"),
    fetchMichiganData(county, "housing"),
  ]);

  const combinedData = {
    health: healthData,
    environment: envData,
    housing: housingData,
  };

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Generate a civic insight story for ${county} County, Michigan. Audience: ${audience}. Use the county data provided in context.`,
    },
  ];
  return callMistral(messages, { county, data: combinedData });
}

// ─── EXPORT ALL ───────────────────────────────────────────────────────────────
export default {
  chatWithAssistant,
  generateInsuranceAppeal,
  getResourceRecommendations,
  analyzeEquityIssue,
  generateContent,
  crisisSupport,
  explainHealthData,
  generateCountyInsightStory,
  fetchMichiganData,
};
