// Phase 2 route audit script
// Usage: node scripts/audit-routes.mjs
// Requires: npm run dev running in background OR starts it here via child_process

import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROUTES = [
  // Core / partner-facing
  '/',
  '/story',
  '/for-health-systems',
  '/partnerships/health-systems',
  '/partners/health-systems',
  '/domain-dashboard',
  '/health',
  '/detection-gap',
  '/chna-explorer',
  '/equity',
  '/find-care',
  '/financial-help',
  '/data-and-insights',
  '/about',
  '/partners',
  // Dynamic routes (real examples)
  '/county/wayne',
  '/zip/48214',
  '/place/detroit-mi',
  // Other significant routes
  '/environment',
  '/transportation',
  '/civic-data',
  '/life-navigator',
  '/health-map',
  '/resources',
  '/quality',
  '/status',
  '/sitemap',
  '/contact',
  '/terms',
  '/privacy',
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const SCREENSHOT_DIR = '.audit-screenshots';
const BASE_URL = 'http://localhost:8080';
const TIMEOUT = 15000;

// Ensure screenshot dir exists
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = [];

async function auditRoute(page, route) {
  const url = BASE_URL + route;
  const consoleErrors = [];
  const consoleWarnings = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });

  page.on('response', response => {
    if (response.status() >= 400 && !response.url().includes('localhost')) {
      failedRequests.push({ url: response.url(), status: response.status() });
    }
  });

  let crashed = false;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT });
    await page.waitForTimeout(1000);
  } catch (e) {
    crashed = true;
    consoleErrors.push(`NAVIGATION_ERROR: ${e.message}`);
  }

  return { route, url, crashed, consoleErrors, consoleWarnings, failedRequests };
}

async function takeScreenshots(browser, route) {
  const slug = route.replace(/\//g, '_').replace(/^_/, '') || 'home';
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: TIMEOUT });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${slug}_${vp.name}.png`),
        fullPage: true,
      });
    } catch (e) {
      // ignore screenshot failures — errors captured in audit phase
    } finally {
      await ctx.close();
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  console.log(`Auditing ${ROUTES.length} routes at ${BASE_URL}...\n`);

  for (const route of ROUTES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const result = await auditRoute(page, route);
    await ctx.close();

    const status = result.crashed ? '💥 CRASH' :
      result.consoleErrors.length > 0 ? '⚠️  ERRORS' :
      result.consoleWarnings.length > 0 ? '📋 WARNS' : '✅ OK';
    console.log(`${status}  ${route}`);
    if (result.consoleErrors.length > 0) {
      result.consoleErrors.slice(0, 3).forEach(e => console.log(`       ERROR: ${e.slice(0, 120)}`));
    }
    if (result.failedRequests.length > 0) {
      result.failedRequests.slice(0, 3).forEach(r => console.log(`       FAIL ${r.status}: ${r.url.slice(0, 100)}`));
    }

    results.push(result);
  }

  // Screenshots for a subset (home, story, for-health-systems, detection-gap)
  const screenshotRoutes = ['/', '/story', '/for-health-systems', '/detection-gap', '/chna-explorer', '/equity'];
  console.log('\nTaking screenshots for key partner routes...');
  for (const route of screenshotRoutes) {
    await takeScreenshots(browser, route);
    console.log(`  ✓ ${route}`);
  }

  await browser.close();

  // Write JSON report
  fs.writeFileSync('.audit-screenshots/results.json', JSON.stringify(results, null, 2));

  // Summary
  const crashes = results.filter(r => r.crashed);
  const withErrors = results.filter(r => !r.crashed && r.consoleErrors.length > 0);
  const withWarnings = results.filter(r => !r.crashed && r.consoleErrors.length === 0 && r.consoleWarnings.length > 0);
  const clean = results.filter(r => !r.crashed && r.consoleErrors.length === 0 && r.consoleWarnings.length === 0);

  console.log(`\n── Summary ─────────────────────────────`);
  console.log(`Total routes audited: ${results.length}`);
  console.log(`✅ Clean:             ${clean.length}`);
  console.log(`📋 Warnings only:     ${withWarnings.length}`);
  console.log(`⚠️  Console errors:    ${withErrors.length}`);
  console.log(`💥 Crashed:           ${crashes.length}`);
  console.log(`Results saved to .audit-screenshots/results.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
