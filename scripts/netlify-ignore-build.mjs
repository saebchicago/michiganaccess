import { execFileSync } from "node:child_process";

// Netlify ignore commands: exit 0 skips, exit 1 builds.
// Review/branch deploys always build. In production, data-only commits are
// accumulated and released together by the weekly release workflow.
if ((process.env.CONTEXT ?? "") !== "production") {
  process.exit(1);
}

let message = "";
try {
  message = execFileSync("git", ["log", "-1", "--pretty=%B"], {
    encoding: "utf8",
  }).trim();
} catch {
  process.exit(1); // fail open on unexpected Git metadata errors
}

if (/^data:/i.test(message)) {
  console.log(`Skipping standalone production deploy for data-only commit: ${message.split("\n")[0]}`);
  process.exit(0);
}

process.exit(1);
