// netlify/functions/chat-mistral.js
import { Mistral } from '@mistralai/mistralai';

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const messages = body.messages || [];
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing MISTRAL_API_KEY' }),
      };
    }

    const client = new Mistral({ apiKey });

    const response = await client.chat.complete({
      model: 'ministral-8b-2410', // or 'ministral-14b-2410'
      messages,
      maxTokens: 512,
      temperature: 0.4,
    });

    const reply = response.choices?.[0]?.message?.content || '';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI service error' }),
    };
  }
}
