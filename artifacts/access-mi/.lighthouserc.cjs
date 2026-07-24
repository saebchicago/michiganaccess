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
 *
 * READ THE FAILURE BEFORE DISMISSING IT. Because every assertion is only a
 * "warn", a low score can never fail this job - so when it does fail, it is a
 * Lighthouse RUNTIME error, which means the page genuinely did not work. That
 * is what happened for months: a "NO_FCP" failure ("The page did not paint any
 * content") was read as CI noise, and it was in fact a temporal-dead-zone
 * ReferenceError thrown from the production bundle before ReactDOM rendered.
 * Every visitor got a blank page, and nothing else in CI could see it because
 * vitest and the dev server use a different module graph than the bundle.
 *
 * This job is the only check that exercises the real production build in a real
 * browser. Promote it to blocking (drop continue-on-error in ci.yml) once a
 * green run has been observed.
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
      // NOT "Local:". Vite prints the ready line with ANSI codes between the
      // word and the colon (`\x1b[1mLocal\x1b[22m:`), so LHCI's /Local:/i can
      // never match it. Every CI run burned the full startServerReadyTimeout
      // and logged "Timed out waiting for the server to start listening" while
      // the server was in fact up and printing that exact line. Match a span
      // with no escape codes inside it instead.
      startServerReadyPattern: "localhost:",
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
