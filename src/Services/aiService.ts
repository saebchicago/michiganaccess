// Centralized AI Service - All Mistral calls go through here
// Configure once, use everywhere

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Core Mistral call - used by all features
async function callMistral(messages: Message[]): Promise<string> {
  if (!MISTRAL_API_KEY) {
    throw new Error(
      "MISTRAL_API_KEY not configured. Add VITE_MISTRAL_API_KEY to .env.local"
    );
  }

  try {
 const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Mistral API error response:", error);
      throw new Error(`Mistral API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Mistral API error:", error);
    throw error;
  }
}

// ============ FEATURE 1: CHAT WIDGET ============
// General Q&A about Michigan services
export async function chatWithAssistant(
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  const systemPrompt = `You are Access Michigan, a helpful assistant for Michigan residents seeking health, housing, financial, and community services.

You help people find:
- Healthcare (doctors, clinics, insurance, mental health)
- Financial assistance (SNAP, utility help, rental assistance)
- Housing resources (emergency shelter, stable housing)
- Community services (food banks, legal aid, transportation)
- Energy assistance and environmental resources
- Transportation safety and public transit

Be empathetic, clear, and practical. When appropriate, mention Michigan-specific resources.

For emergencies, always mention:
- 988 (Crisis/suicide prevention)
- 211 (Any need)
- 911 (Emergencies)

Keep responses concise and actionable.`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  return callMistral(messages);
}

// ============ FEATURE 2: INSURANCE APPEAL BUILDER ============
// Draft appeal letters for denied insurance claims
export async function generateInsuranceAppeal(
  denialReason: string,
  claimDetails: string,
  userContext: string
): Promise<string> {
  const systemPrompt = `You are an expert in Michigan insurance appeals and patient advocacy.

Help residents write compelling, legally-sound appeal letters for denied insurance claims.
- Reference Michigan insurance regulations and patient rights
- Be specific and evidence-based
- Provide step-by-step guidance
- Include clear next steps and contact information
- Use professional but accessible language`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Help me draft an insurance appeal for:

Denial Reason: ${denialReason}
Claim Details: ${claimDetails}
My Situation: ${userContext}

Please provide a structured, persuasive appeal letter that I can customize with my information.`,
    },
  ];

  return callMistral(messages);
}

// ============ FEATURE 3: RESOURCE RECOMMENDATIONS ============
// Smart service matching based on user needs
export async function getResourceRecommendations(
  userNeeds: string,
  location: string,
  demographics?: string
): Promise<string> {
  const systemPrompt = `You are a Michigan social services expert with knowledge of state and local programs.

Based on user needs and location, recommend specific programs, agencies, and resources.
- Be specific with program names, eligibility criteria, and application processes
- Prioritize free and low-cost options
- Include contact information and how to apply
- Explain any time limits or deadline dates
- Consider equity - recommend programs serving underserved populations when relevant`;

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

  return callMistral(messages);
}

// ============ FEATURE 4: EQUITY INSIGHTS & ANALYSIS ============
// Explain health disparities and equity issues
export async function analyzeEquityIssue(
  metric: string,
  county: string,
  historicalContext?: string
): Promise<string> {
  const systemPrompt = `You are a health equity expert with deep knowledge of Michigan health disparities and structural inequities.

Provide context and analysis on health disparities:
- Explain root causes (structural, systemic, historical)
- Discuss real-world impacts on communities
- Suggest evidence-based solutions
- Use data-driven language but keep it accessible
- Connect to broader health equity frameworks`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Explain the disparities in "${metric}" in ${county} County, Michigan.
${historicalContext ? `Historical/contextual information: ${historicalContext}` : ""}

Provide brief, actionable insights about what's causing this and what can be done.`,
    },
  ];

  return callMistral(messages);
}

// ============ FEATURE 5: CONTENT GENERATION ============
// Create FAQs, guides, explanations, comparisons
export async function generateContent(
  topic: string,
  format: "faq" | "guide" | "explanation" | "comparison",
  audience?: string
): Promise<string> {
  const systemPrompt = `You are a Michigan public health and social services educator who creates clear, accessible content.

Write for diverse Michigan audiences - prioritize clarity and actionability.
- Avoid jargon or explain it when necessary
- Use Michigan-specific examples and resources
- Structure content for easy scanning
- Include practical next steps`;

  let userPrompt = `Create a ${format} about: ${topic}`;
  if (audience) userPrompt += `\nTarget audience: ${audience}`;

  if (format === "faq") {
    userPrompt += "\nInclude 5-7 of the most common questions and clear answers.";
  } else if (format === "guide") {
    userPrompt += "\nInclude step-by-step instructions with timeline estimates.";
  } else if (format === "comparison") {
    userPrompt += "\nCompare 3-4 main options with pros, cons, and recommendations.";
  } else if (format === "explanation") {
    userPrompt += "\nExplain clearly and include why this matters for Michigan residents.";
  }

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return callMistral(messages);
}

// ============ FEATURE 6: CRISIS SUPPORT ============
// Compassionate guidance for people in crisis
export async function crisisSupport(
  situation: string,
  immediateNeed: string
): Promise<string> {
  const systemPrompt = `You are a crisis support specialist trained in trauma-informed, compassionate care.

Respond to people in crisis:
- Be warm, non-judgmental, and immediately helpful
- Validate their feelings and situation
- Provide practical, immediate steps
- Always include crisis hotline numbers
- If danger to self or others, emphasize calling 988 or 911 immediately
- Keep language accessible and hopeful

Michigan crisis resources to mention:
- 988 Suicide & Crisis Lifeline (call/text, free 24/7)
- 211 (call or text for any kind of help)
- 911 (immediate safety threats)`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `I'm in crisis. Here's what's happening: ${situation}

Right now I need: ${immediateNeed}

What support and resources can help me get through this?`,
    },
  ];

  return callMistral(messages);
}

// ============ FEATURE 7: DATA EXPLANATION ============
// Explain complex health data and metrics to residents
export async function explainHealthData(
  metric: string,
  value: string | number,
  context?: string
): Promise<string> {
  const systemPrompt = `You are a health data interpreter who explains statistics to everyday people.

Make health metrics understandable:
- Explain what the number means in real terms
- Compare to other counties or national averages
- Discuss why this metric matters
- Suggest what questions to ask doctors/agencies
- Avoid scary language but be honest`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Help me understand this health metric:
Metric: ${metric}
Value: ${value}
${context ? `Context: ${context}` : ""}

What does this mean for my health and community?`,
    },
  ];

  return callMistral(messages);
}

// ============ EXPORT ALL FUNCTIONS ============
export default {
  chatWithAssistant,
  generateInsuranceAppeal,
  getResourceRecommendations,
  analyzeEquityIssue,
  generateContent,
  crisisSupport,
  explainHealthData,
};