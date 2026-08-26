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
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
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
        // Keep the offline shell focused on reading/navigation. Large
        // interaction-only vendors are fetched and browser-cached when a user
        // actually opens a chart/map/export surface instead of being charged
        // to every first install in the background.
        //
        // PDF export is explicitly network-adjacent and has always been safe to
        // omit offline. Charts/maps remain fully available online and after a
        // normal browser visit; they simply are not forced into the install
        // precache before the user asks for those features.
        globIgnores: [
          "assets/vendor-pdf-*.js",
          "assets/html2canvas.esm-*.js",
          "assets/index.es-*.js",
          "assets/vendor-charts-*.js",
          "assets/vendor-leaflet-*.js",
        ],
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
    exclude: ["@radix-ui/react-compose-refs"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-motion";
          }
          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next")
          ) {
            return "vendor-i18n";
          }
          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/d3-") ||
            id.includes("node_modules/victory-vendor/")
          ) {
            return "vendor-charts";
          }
          if (id.includes("node_modules/jspdf")) {
            return "vendor-pdf";
          }
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
