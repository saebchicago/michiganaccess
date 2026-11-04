// Pause public AI requests until server-side limits and provider data
// handling have been verified. Keep this endpoint for existing callers.
export async function handler() {
  return {
    statusCode: 503,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({ error: "The AI assistant is currently unavailable." }),
  };
}
