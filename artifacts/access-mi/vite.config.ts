import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

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
