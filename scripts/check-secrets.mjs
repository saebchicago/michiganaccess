#!/usr/bin/env node
/**
 * CI guard: fail if secrets or bad env patterns appear in tracked files.
 * Run from repo root: node scripts/check-secrets.mjs
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function gitTracked(pattern) {
  try {
    return execSync(`git ls-files ${pattern}`, {
      cwd: root,
      encoding: "utf-8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

// 1. .env must not be tracked (use .env.example + .env.local)
const trackedEnv = gitTracked(".env");
if (trackedEnv.length > 0) {
  errors.push(
    `.env is tracked in git (${trackedEnv.join(", ")}). Run: git rm --cached .env`,
  );
}

// 2. Scan all tracked text files for forbidden patterns
const forbidden = [
  {
    re: /VITE_MISTRAL_API_KEY/g,
    msg: "VITE_MISTRAL_API_KEY must not appear in tracked files (use MISTRAL_API_KEY server-side only)",
  },
  {
    re: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]?[a-zA-Z0-9._-]{20,}/g,
    msg: "Hardcoded SUPABASE_SERVICE_ROLE_KEY value in tracked file",
  },
  {
    re: /MISTRAL_API_KEY\s*=\s*['"]?[a-zA-Z0-9]{16,}/g,
    msg: "Hardcoded MISTRAL_API_KEY value in tracked file",
  },
  {
    re: /"role"\s*:\s*"service_role"/g,
    msg: "Possible service_role JWT in tracked file",
  },
];

let trackedFiles = [];
try {
  trackedFiles = execSync(
    'git ls-files "*.ts" "*.tsx" "*.js" "*.mjs" "*.json" "*.yml" "*.yaml" "*.env" "*.md"',
    { cwd: root, encoding: "utf-8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
} catch {
  trackedFiles = [];
}

const skipPaths = new Set([
  "scripts/check-secrets.mjs",
  ".env.example",
  ".migration-backup/.env.example",
]);

for (const rel of trackedFiles) {
  if (skipPaths.has(rel)) continue;
  const abs = resolve(root, rel);
  if (!existsSync(abs)) continue;
  let text;
  try {
    text = readFileSync(abs, "utf-8");
  } catch {
    continue;
  }
  for (const { re, msg } of forbidden) {
    re.lastIndex = 0;
    if (re.test(text)) {
      errors.push(`${rel}: ${msg}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Secret hygiene check FAILED:\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nFix: use .env.local (gitignored) and Netlify/Supabase secrets. Commit only .env.example.",
  );
  process.exit(1);
}

console.log("Secret hygiene check passed.");
process.exit(0);