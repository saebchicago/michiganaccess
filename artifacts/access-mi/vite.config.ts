import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { VitePWA } from "vite-plugin-pwa";

const rawPort = process.env.PORT ?? "5173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  define: {
    // Build-time timestamp used by the footer freshness chip. Single
    // source of truth for "Site updated"; per-source vintage comes
    // from the data registry (see DATA_FRESHNESS_SOURCES).
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    // Real installability + honest offline behavior. injectManifest (not
    // generateSW) because navigations must be NetworkFirst with an
    // offline.html fallback - see src/sw.ts. Note on prerendering: the
    // per-route dist/<path>/index.html files are written AFTER the vite
    // build by scripts/prerender-meta.mjs, so they are not in the SW
    // precache manifest. That is accepted: they are crawler artifacts;
    // in-app navigations go NetworkFirst and fall back to offline.html.
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: {
        name: "Access Michigan",
        short_name: "AccessMI",
        description:
          "Independent Michigan civic intelligence. County-level health, environmental, and social data across all 83 counties.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#1e3a5f",
        background_color: "#ffffff",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,woff2}", "offline.html", "index.html"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: [
      // Patched compose-refs to break the React 19 + Radix unstable-ref
      // infinite loop on /county/* (and any page rendering Radix Select
      // or Tooltip). Listed first and as an exact-match RegExp so the
      // Rollup alias plugin used by the production build cannot fall
      // through to the prefix-matching `@` entry below. See
      // src/lib/radix-compose-refs-patch.ts for the patch and the
      // explanation of why this is safe.
      {
        find: /^@radix-ui\/react-compose-refs$/,
        replacement: path.resolve(
          import.meta.dirname,
          "src/lib/radix-compose-refs-patch.ts",
        ),
      },
      { find: "@", replacement: path.resolve(import.meta.dirname, "src") },
      {
        find: "@assets",
        replacement: path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets",
        ),
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Force the Vite alias above to win over node_modules pre-bundling.
    // Without this, every Radix package that calls `useComposedRefs`
    // pulls the unpatched version from node_modules/.vite/deps/.
    exclude: ["@radix-ui/react-compose-refs"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core - cached across all routes
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
          // framer-motion is ~200 KB and used in almost every page
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-motion";
          }
          // i18n stack - i18next + plugins (locales are lazy-loaded separately)
          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next")
          ) {
            return "vendor-i18n";
          }
          // Charts: recharts + d3 transitive deps. ~340 KB; only used on
          // dashboard/data routes, so keeping it out of the main chunk
          // means /find-care and friends don't pay for it.
          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/d3-") ||
            id.includes("node_modules/victory-vendor/")
          ) {
            return "vendor-charts";
          }
          // PDF export (Download Local Insights). ~390 KB; only loaded
          // when the user actually clicks export.
          if (id.includes("node_modules/jspdf")) {
            return "vendor-pdf";
          }
          // Screenshot capture for the same export path. ~200 KB.
          if (id.includes("node_modules/html2canvas")) {
            return "vendor-html2canvas";
          }
          // Map runtime - cached across every page that renders a map.
          if (id.includes("node_modules/leaflet/")) {
            return "vendor-leaflet";
          }
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
