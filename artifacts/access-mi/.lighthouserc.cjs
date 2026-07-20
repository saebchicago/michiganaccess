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
      // vite.config.ts derives preview.port from the PORT env var (default
      // 5173), not from a CLI --port flag - and pnpm's `-- --port 4173`
      // pass-through mangles the arg anyway (vite's CLI parser treats a
      // literal `--` as "stop parsing options", so --port never lands).
      // Set PORT directly so this actually serves on 4173.
      startServerCommand: "PORT=4173 pnpm run serve",
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
        // GitHub-hosted runners don't grant the unprivileged user Chrome's
        // sandboxing namespaces; without --no-sandbox Chrome shows a
        // CHROME_INTERSTITIAL_ERROR instead of loading the page at all.
        chromeFlags: "--no-sandbox --headless=new --disable-gpu",
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
