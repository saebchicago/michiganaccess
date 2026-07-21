/// <reference lib="webworker" />
/**
 * Service worker: conservative, honest offline support.
 *
 * - App shell (js/css/fonts/offline.html/index.html) is precached.
 * - Navigations are NetworkFirst: fresh content when online, the most
 *   recently cached copy of a visited page when offline, and
 *   offline.html for pages never visited.
 * - NOTHING else is runtime-cached: Supabase and federal API calls
 *   always pass through, so no user ever sees silently stale data.
 *
 * Keep this file free of URLs, keys, and hostnames - it is scanned by
 * the backend-leak guard like the rest of src/.
 */
import { precacheAndRoute, matchPrecache } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages",
    networkTimeoutSeconds: 4,
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  }),
);

setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    const offline = await matchPrecache("/offline.html");
    if (offline) return offline;
  }
  return Response.error();
});
