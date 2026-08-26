/**
 * Lighthouse CI config. Runs against a local `vite preview` server of the
 * production build for representative, high-value routes.
 *
 * SEO, accessibility, and best-practices are blocking quality contracts.
 * Performance remains a warning while the homepage bundle/precache work is
 * actively being reduced; this still surfaces regressions without turning
 * shared-runner variance into wasted retry builds.
 *
 * A Lighthouse runtime failure is always blocking because it means the real
 * production bundle did not render in a real browser. That gate previously
 * caught a production-only temporal-dead-zone crash that unit tests missed.
 */
module.exports = {
  ci: {
    collect: {
      // vite.config.ts derives preview.port from the PORT env var (default
      // 5173), not from a CLI --port flag.
      startServerCommand: "PORT=4173 pnpm run serve",
      startServerReadyPattern: "localhost:",
      startServerReadyTimeout: 60000,
      url: [
        "http://localhost:4173/",
        "http://localhost:4173/opportunity",
        "http://localhost:4173/data",
        "http://localhost:4173/compare",
        "http://localhost:4173/methodology",
        "http://localhost:4173/health-equity-atlas",
      ],
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        chromeFlags: "--no-sandbox --headless=new --disable-gpu",
      },
    },
    assert: {
      assertions: {
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.7 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
