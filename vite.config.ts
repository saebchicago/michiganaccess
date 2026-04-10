import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
// @ts-ignore — @prerenderer/rollup-plugin returns a Rollup OutputPlugin; Vite accepts it.
import prerender from "@prerenderer/rollup-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "offline.html"],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,ico,png,svg,jpg,webp,woff,woff2}"],
        // Do NOT precache index.html — let NavigationRoute handle it
        // with NetworkFirst so CSP headers are always fresh from Netlify.
        navigateFallback: undefined,
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          // HTML pages: always fetch from network first so Netlify CSP headers are current
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
          // External APIs: always network, never cache stale responses
          {
            urlPattern: /^https:\/\/(data\.cdc\.gov|api\.weather\.gov|api\.fda\.gov|clinicaltrials\.gov|api\.tidesandcurrents\.noaa\.gov)\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "external-api-cache",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 30, maxAgeSeconds: 5 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: "Michigan Access — Michigan, County by County",
        short_name: "MI Access",
        description: "One structured gateway to health, housing, food, and family services across Michigan.",
        theme_color: "#1e3a5f",
        background_color: "#f5f6f8",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        categories: ["health", "government", "utilities"],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    // Static prerender — production builds only.
    // Puppeteer navigates each route, waits for usePageMeta to dispatch
    // 'prerender-ready', then writes route-specific HTML to dist/.
    // Netlify serves these static files in preference to the catch-all
    // /index.html SPA fallback (static files always win unless force=true).
    // Prerender is gated on PRERENDER_ENABLED=true (set in netlify.toml).
    // Skipped in GitHub Actions CI (no env var) and local dev builds.
    mode === "production" && process.env.PRERENDER_ENABLED === "true" && prerender({
      routes: [
        "/",
        "/story",
        "/data-and-insights",
        "/data/medicaid-coverage-at-risk",
        "/methodology/medicaid-coverage-at-risk",
        "/data/dual-eligible-exposure",
        "/methodology/dual-eligible-exposure",
        "/data/snap-coverage-at-risk",
        "/methodology/snap-coverage-at-risk",
        "/data/snap-michigan",
        "/methodology/environmental",
        "/closure-watch",
        "/find-care",
        "/financial-help",
        "/resources",
        "/health/insurance-appeals",
        "/housing-options",
        "/wellness",
        "/reentry",
        "/insurance-coverage",
        "/insurance-appeals",
        "/downloads",
        "/press",
        "/install",
        "/privacy",
        "/terms",
        "/about",
      ],
      renderer: "@prerenderer/renderer-puppeteer",
      rendererOptions: {
        // Wait for usePageMeta to signal it has written all <head> tags.
        renderAfterDocumentEvent: "prerender-ready",
        // Limit concurrent puppeteer instances to stay within CI memory limits.
        maxConcurrentRoutes: 2,
        // Block external API calls during prerender — we only need meta tags,
        // not data-fetched content. Same-origin asset chunks are not affected.
        skipThirdPartyRequests: true,
        // 60 s per route: generous for lazy-chunk resolution + useEffect flush.
        timeout: 60000,
      },
      postProcess(renderedRoute: { html: string }) {
        // Strip the local prerender server's origin from any absolute URLs
        // that sneak into the HTML (canonical / og:url are set via BASE_URL
        // = "https://accessmi.org" in usePageMeta, so this is a safety net).
        renderedRoute.html = renderedRoute.html.replace(
          /(https?:\/\/)?(localhost|127\.0\.0\.1):\d+\//g,
          "https://accessmi.org/"
        );
      },
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['framer-motion', 'recharts', 'cmdk'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-scroll-area',
          ],
          'vendor-map': ['leaflet', 'd3'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
