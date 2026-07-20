/**
 * Lighthouse CI config. Runs against a local `vite preview` server of the
 * production build for a small set of representative routes.
 *
 * Assertions are set to "warn", not "error" - this is the first time
 * Lighthouse has run against this app, so there's no verified baseline yet.
 * The CI job (.github/workflows/ci.yml) also runs with continue-on-error
 * so a bad score surfaces in the log without blocking merges. Once the
 * owner has reviewed a few runs, tighten SEO/Accessibility to "error" at
 * the target thresholds below.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm run serve -- --port 4173",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 60000,
      url: [
        "http://localhost:4173/",
        "http://localhost:4173/data",
        "http://localhost:4173/compare",
        "http://localhost:4173/methodology",
        "http://localhost:4173/health-equity-atlas",
      ],
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:seo": ["warn", { minScore: 0.95 }],
        "categories:accessibility": ["warn", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.7 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
