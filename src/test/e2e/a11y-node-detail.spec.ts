import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Temporary diagnostic spec that dumps node-level violation details for
// the six rules still flagged in A11Y_VIOLATIONS.md. Used to locate the
// exact DOM selectors and HTML snippets that need patching, then the
// spec can be removed or repurposed.

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRIORITY_ROUTES = [
  '/',
  '/find-care',
  '/zip/48201',
  '/compare',
  '/health-map',
  '/tax-comparison',
  '/health-equity-atlas',
  '/data-sources',
  '/methodology',
  '/about',
];

const TARGET_RULES = new Set([
  'button-name',
  'link-name',
  'aria-prohibited-attr',
  'aria-input-field-name',
  'aria-progressbar-name',
  'select-name',
  'label',
]);

type NodeRow = {
  route: string;
  rule: string;
  impact: string;
  target: string;
  html: string;
  failureSummary: string;
};

const rows: NodeRow[] = [];

test.describe.configure({ mode: 'serial' });
test.describe('A11y node-level diagnostic', () => {
  for (const route of PRIORITY_ROUTES) {
    test(`diagnostic ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      for (const v of results.violations) {
        if (!TARGET_RULES.has(v.id)) continue;
        for (const n of v.nodes) {
          rows.push({
            route,
            rule: v.id,
            impact: v.impact ?? '',
            target: n.target.join(' '),
            html: (n.html || '').slice(0, 240),
            failureSummary: (n.failureSummary || '').replace(/\n/g, ' ').slice(0, 240),
          });
        }
      }
    });
  }

  test.afterAll(() => {
    const lines = [
      '# A11y Node Detail (diagnostic)',
      '',
      `Generated ${new Date().toISOString()}`,
      `Captured ${rows.length} individual nodes across ${PRIORITY_ROUTES.length} routes`,
      '',
    ];
    const byRule = new Map<string, NodeRow[]>();
    for (const r of rows) {
      const arr = byRule.get(r.rule) ?? [];
      arr.push(r);
      byRule.set(r.rule, arr);
    }
    for (const [rule, ns] of [...byRule.entries()].sort((a, b) => b[1].length - a[1].length)) {
      lines.push(`## ${rule} (${ns.length} nodes)`, '');
      for (const n of ns) {
        lines.push(`- **${n.route}** \`${n.target}\``);
        lines.push(`  - html: \`${n.html.replace(/`/g, "'")}\``);
        if (n.failureSummary) lines.push(`  - why: ${n.failureSummary}`);
      }
      lines.push('');
    }
    const target = join(__dirname, '../../../A11Y_NODE_DETAIL.md');
    try {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, lines.join('\n'), 'utf8');
    } catch {
      // best-effort
    }
  });
});
