// netlify/functions/chat-mistral.js
// Secure Mistral proxy - API key stays server-side
// Accepts messages[] + optional dataContext from frontend

import { Mistral } from '@mistralai/mistralai';

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

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'MISTRAL_API_KEY not configured on server' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const incomingMessages = body.messages || [];
    const dataContext = body.dataContext || null;

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

    const client = new Mistral({ apiKey });
    const response = await client.chat.complete({
      model: 'mistral-small-latest', // upgrade to mistral-medium-latest for deeper analysis
      messages,
      maxTokens: 1024,
      temperature: 0.4,
    });

    const reply = response.choices?.[0]?.message?.content || '';
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
