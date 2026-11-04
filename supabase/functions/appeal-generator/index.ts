Deno.serve(() =>
  Response.json(
    { error: "This AI feature is currently unavailable." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  ),
);
