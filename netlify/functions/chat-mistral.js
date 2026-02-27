// netlify/functions/chat-mistral.js
// Secure Mistral proxy - API key stays server-side
// Accepts messages[] + optional dataContext from frontend

// CORS headers for all responses
const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Build a data-context block to inject into the system message
function buildDataBlock(dataContext) {
  if (!dataContext || !dataContext.data || Object.keys(dataContext.data).length === 0) {
    return '';
  }
  const county = dataContext.county ? `${dataContext.county} County` : 'the requested area';
  const json = JSON.stringify(dataContext.data, null, 2);
  return `\n\n--- LIVE DATA CONTEXT FOR ${county.toUpperCase()} ---\nThe following data was fetched from Michigan public sources. Treat it as ground truth for your answer.\n${json}\n--- END DATA CONTEXT ---`;
}

export async function handler(event) {
  // Handle preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Support both MISTRAL_API_KEY (server-side convention) and VITE_MISTRAL_API_KEY
  const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'MISTRAL_API_KEY not configured on server' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const incomingMessages = body.messages || [];
    const dataContext = body.dataContext || null;

    // Input size guard: reject oversized payloads
    if (incomingMessages.length > 50) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Too many messages in conversation' }) };
    }

    // Guard individual message length
    for (const msg of incomingMessages) {
      if (typeof msg.content === 'string' && msg.content.length > 8000) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Message content too long' }) };
      }
    }

    // Inject data context into the first system message if it exists
    const messages = incomingMessages.map((msg, idx) => {
      if (idx === 0 && msg.role === 'system' && dataContext) {
        return { ...msg, content: msg.content + buildDataBlock(dataContext) };
      }
      return msg;
    });

    // If no system message was sent at all, prepend a minimal one with data context
    const hasSystem = messages.some((m) => m.role === 'system');
    if (!hasSystem && dataContext) {
      messages.unshift({
        role: 'system',
        content:
          'You are the Michigan Access Civic Data Engine. Use the data context below to answer accurately.' +
          buildDataBlock(dataContext),
      });
    }

    // Call Mistral API directly via fetch (no SDK dependency needed)
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages,
        max_tokens: 1024,
        temperature: 0.4,
      }),
    });

    if (!mistralRes.ok) {
      const errText = await mistralRes.text().catch(() => '');
      console.error('Mistral API error:', mistralRes.status, errText);
      return {
        statusCode: mistralRes.status === 429 ? 429 : 500,
        headers: CORS,
        body: JSON.stringify({ error: mistralRes.status === 429 ? 'Rate limit exceeded' : 'AI service error' }),
      };
    }

    const json = await mistralRes.json();
    const reply = json.choices?.[0]?.message?.content || '';
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error('chat-mistral error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'AI service error', detail: err.message }),
    };
  }
}
