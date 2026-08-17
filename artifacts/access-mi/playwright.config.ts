import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/e2e",
  timeout: 45 * 1000,
  expect: { timeout: 10 * 1000 },
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:8081",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    // pnpm, not npm: the root package.json preinstall hook rejects npm and
    // yarn outright (see CLAUDE.md). This line was the last npm invocation
    // left in the repo.
    command: "PORT=8081 pnpm run dev",
    cwd: "../../",
    port: 8081,
    timeout: 180 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
