#!/usr/bin/env node
/**
 * Page-level provenance guard.
 *
 * check-integrity-labels.mjs protects hand-authored seeds under src/data/,
 * but VERIFIED chips are also written directly in page and component JSX -
 * and that is where the Round-6 defect recurred one directory over: press
 * releases, self-reported annual reports, and news outlets (Bridge Michigan,
 * the identical category as the Planet Detroit case that motivated the data
 * guard) were rendered under VERIFIED, and several VERIFIED chips carried no
 * source at all while their popover asserted "Confirmed from a primary
 * federal or state source."
 *
 * Two rules over src/pages/ and src/components/:
 *
 *   1. A literal `label="VERIFIED"` element must carry either a `source`
 *      prop or the `legend` prop (legend chips explain what the label means
 *      and assert nothing about a particular figure).
 *   2. A VERIFIED element's `source` string must not be a secondary-source
 *      kind: press release, annual report, self-reported figures, or a news
 *      publication. Those are MODELED at best - relabel, never delete the
 *      data.
 *
 * The scan is per-JSX-element: it matches `label="VERIFIED"` and inspects the
 * text from the element's opening `<` to its closing `>` so props on other
 * lines are seen. Dynamic labels (label={expr}) are out of scope here - the
 * value they carry is guarded at its data source.
 *
 * Run via: node scripts/check-page-provenance.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src", "pages"), join(ROOT, "src", "components")];

/** Kinds of document, not topics - same philosophy as check-integrity-labels. */
const SECONDARY_SOURCE_PATTERNS = [
  /press release/i,
  /annual report/i,
  /self-reported/i,
  /\bnewsletter\b/i,
  /Planet Detroit/i,
  /Bridge Michigan/i,
  /Detroit Free Press/i,
  /\bMLive\b/i,
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!/\.tsx?$/.test(entry)) continue;
    if (/\.(test|spec)\.tsx?$/.test(entry)) continue;
    out.push(full);
  }
  return out;
}

/**
 * Given the source and the index of a `label="VERIFIED"` occurrence, return
 * the text of the enclosing JSX element's opening tag: from the nearest `<`
 * before the match to the first unquoted `>` after it.
 */
function enclosingOpeningTag(src, matchIndex) {
  const start = src.lastIndexOf("<", matchIndex);
  if (start === -1) return null;
  // Find closing '>' - JSX props here are string literals or simple
  // expressions; a plain scan is sufficient for this codebase's usage.
  let i = matchIndex;
  let inString = null;
  while (i < src.length) {
    const ch = src[i];
    if (inString) {
      if (ch === inString) inString = null;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
    } else if (ch === ">") {
      return src.slice(start, i + 1);
    }
    i++;
  }
  return null;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    const rel = relative(ROOT, file);

    for (const m of src.matchAll(/label=["']VERIFIED["']/g)) {
      const tag = enclosingOpeningTag(src, m.index);
      if (!tag) continue;
      const line = src.slice(0, m.index).split("\n").length;

      const hasLegend = /\blegend\b/.test(tag);
      const sourceMatch = tag.match(/\bsource=\{?["'`]([^"'`]+)["'`]/);
      // source={SOME_EXPRESSION} passes a source too - the string it carries
      // is guarded where that value is defined, not here.
      const hasExpressionSource = !sourceMatch && /\bsource=\{[^"'`]/.test(tag);

      if (!sourceMatch && !hasExpressionSource && !hasLegend) {
        violations.push(
          `${rel}:${line} - VERIFIED with no source prop. The popover will ` +
            `assert "Confirmed from a primary federal or state source" and ` +
            `name none. Add the source, or mark it \`legend\` if it only ` +
            `explains what the label means.`,
        );
        continue;
      }

      if (sourceMatch) {
        const sourceText = sourceMatch[1];
        for (const pattern of SECONDARY_SOURCE_PATTERNS) {
          if (pattern.test(sourceText)) {
            violations.push(
              `${rel}:${line} - VERIFIED paired with a secondary source ` +
                `("${sourceText}" matches ${pattern}). Relabel MODELED - ` +
                `keep the data, change the label.`,
            );
            break;
          }
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error(
    `[check-page-provenance] FAIL - ${violations.length} violation(s):\n`,
  );
  for (const v of violations) console.error(`  ${v}`);
  console.error(
    `\nVERIFIED is reserved for figures confirmed from a primary federal or ` +
      `state source. Never delete the data to satisfy this check - relabel it.`,
  );
  process.exit(1);
}

console.log(
  "[check-page-provenance] ok - every literal VERIFIED chip in pages/components carries a primary source or is a legend entry.",
);
