#!/usr/bin/env node
/**
 * Form-control accessible-name guard.
 *
 * Every text input and textarea outside the vendored shadcn primitives must
 * have a real accessible name: aria-label, aria-labelledby, an id with a
 * matching htmlFor, a nearby <label>/<Label>, or a shadcn <FormControl>
 * wrapper. A `placeholder` alone does not count.
 *
 * WHY A SEPARATE GUARD - axe will not catch this
 * ----------------------------------------------
 * The accessible-name computation treats `placeholder` as a last-resort
 * name, so axe-core reports a placeholder-only input as PASSING. The nine
 * vitest-axe suites in src/test/a11y/ were green across all 39 controls this
 * guard was written to find. Placeholder-as-label is still a genuine defect:
 * the text vanishes the moment the user types, taking the field's purpose
 * with it - worst for screen-reader users re-navigating a partly-filled form,
 * and for anyone relying on short-term memory.
 *
 * Vendored primitives under src/components/ui/ are exempt: they forward
 * {...props} and the caller supplies the name.
 *
 * Run via: node scripts/check-form-labels.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const SRC = path.join(ROOT, "src");

/** Vendored shadcn primitives forward props; the caller names the control. */
const EXEMPT_DIR = /src[/\\]components[/\\]ui[/\\]/;

/** Control types that take their name from surrounding content, not a label. */
const NON_TEXT_TYPES =
  /type=["'](hidden|checkbox|radio|submit|button|range|file|color|image)["']/;

function walk(dir, out = []) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const n of names) {
    const p = path.join(dir, n);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    st.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

/**
 * Attribute text of the JSX opening tag starting at `open`, tracking brace
 * depth and strings. A naive "match anything up to the next angle bracket"
 * scan breaks on the `>` inside an arrow function prop such as
 * onChange={(e) => setX(e.target.value)}, silently truncating the attributes
 * and misreporting labelled controls as unlabelled.
 */
function tagAttrs(src, open) {
  let i = open;
  while (i < src.length && src[i] !== " " && src[i] !== "\n" && src[i] !== ">")
    i++;
  const start = i;
  let depth = 0;
  let str = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (str) {
      if (c === "\\") i++;
      else if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") str = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return src.slice(start, i);
  }
  return null;
}

const files = walk(SRC).filter(
  (f) =>
    f.endsWith(".tsx") &&
    !/\.test\.|__tests__|[/\\]test[/\\]/.test(f) &&
    !EXEMPT_DIR.test(f),
);

const TAGNAME = /<(Input|Textarea|input|textarea)[\s/>]/g;

let failures = 0;
let checked = 0;
const fail = (msg) => {
  console.error(`[check-form-labels] FAIL ${msg}`);
  failures++;
};

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");

  let m;
  TAGNAME.lastIndex = 0;
  while ((m = TAGNAME.exec(src))) {
    const attrs = tagAttrs(src, m.index);
    if (attrs === null) continue;
    if (NON_TEXT_TYPES.test(attrs)) continue;
    checked++;

    if (/aria-label|aria-labelledby/.test(attrs)) continue;

    const line = src.slice(0, m.index).split("\n").length;
    const idMatch = attrs.match(/\bid=["{]?["']?([A-Za-z0-9_-]+)/);
    if (idMatch && src.includes(`htmlFor="${idMatch[1]}"`)) continue;

    const before = lines.slice(Math.max(0, line - 7), line - 1).join(" ");
    if (/<label\b|<Label\b|<FormControl|<FormItem/.test(before)) continue;

    const hasPlaceholder = /placeholder/.test(attrs);
    fail(
      hasPlaceholder
        ? `${rel}:${line} <${m[1]}> has only a placeholder for its accessible name. Placeholder text disappears on input - add an aria-label (axe accepts placeholder, which is why the a11y suites stay green on this).`
        : `${rel}:${line} <${m[1]}> has no accessible name at all - add an aria-label, or a <Label htmlFor>.`,
    );
  }
}

// Self-check: a broken scan that matched nothing would pass vacuously.
if (checked < 50) {
  console.error(
    `[check-form-labels] FAIL only ${checked} controls scanned - the scan is broken.`,
  );
  process.exit(1);
}

if (failures > 0) {
  console.error(`[check-form-labels] ${failures} failure(s).`);
  process.exit(1);
}

console.log(
  `[check-form-labels] ok - all ${checked} text inputs and textareas outside src/components/ui/ carry a real accessible name.`,
);
