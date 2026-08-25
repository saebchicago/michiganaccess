import { execFileSync } from "node:child_process";

// Netlify ignore commands use inverted exit semantics:
//   exit 0 -> skip this build
//   exit 1 -> run this build
//
// Deploy Previews and branch deploys stay automatic. Production is release-gated:
// merges and automated data refreshes accumulate on main without publishing until
// the explicit GitHub "Publish production release" workflow creates a release
// commit. This keeps review environments available while making production deploy
// spend deliberate and predictable.
const RELEASE_SUBJECT = /^chore\(release\): publish production(?:\s|$)/i;

export function shouldNetlifyBuild(context, commitMessage) {
  if (context !== "production") return true;
  return RELEASE_SUBJECT.test((commitMessage ?? "").trim());
}

const context = process.env.CONTEXT ?? "";

if (context !== "production") {
  process.exit(1);
}

let message = "";
try {
  message = execFileSync("git", ["log", "-1", "--pretty=%B"], {
    encoding: "utf8",
  }).trim();
} catch (error) {
  // Production is intentionally fail-closed: an unreadable commit identity must
  // not accidentally consume a production deploy or publish an unreviewed HEAD.
  console.error(
    "Skipping production deploy because the commit message could not be read.",
    error instanceof Error ? error.message : error,
  );
  process.exit(0);
}

if (shouldNetlifyBuild(context, message)) {
  console.log(`Production release approved: ${message.split("\n")[0]}`);
  process.exit(1);
}

console.log(
  `Skipping production deploy until an explicit release is requested: ${message.split("\n")[0] || "unknown commit"}`,
);
process.exit(0);
