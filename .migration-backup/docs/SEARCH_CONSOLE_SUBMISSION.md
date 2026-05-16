# Search Console & AEO Submission Checklist — Wave A

Generated: 2026-04-09
Scope: Prerender SSG go-live + Wave 2 AEO structured data (Medicaid, SNAP, home page)

---

## 1. Google Search Console

### 1a. Request Indexing (URL Inspection → Request Indexing)

Submit each of these URLs individually via the URL Inspection tool:

- [ ] `https://accessmi.org/`
- [ ] `https://accessmi.org/data-and-insights`
- [ ] `https://accessmi.org/data/medicaid-coverage-at-risk`
- [ ] `https://accessmi.org/data/snap-coverage-at-risk`
- [ ] `https://accessmi.org/data/snap-michigan`
- [ ] `https://accessmi.org/methodology/medicaid-coverage-at-risk`
- [ ] `https://accessmi.org/methodology/snap-coverage-at-risk`
- [ ] `https://accessmi.org/story`

### 1b. Verify Rich Results (Rich Results Test)

Test each data page at https://search.google.com/test/rich-results :

- [ ] `https://accessmi.org/data/medicaid-coverage-at-risk` — expect Dataset schema detected
- [ ] `https://accessmi.org/data/snap-coverage-at-risk` — expect Dataset schema detected
- [ ] `https://accessmi.org/data/snap-michigan` — expect Dataset schema detected

### 1c. Sitemaps

- [ ] Confirm sitemap is submitted: `https://accessmi.org/sitemap.xml`
- [ ] Verify sitemap lists all 8 priority routes above (no 404s in sitemap report)

### 1d. Coverage Report

After 24–48 hours, check Coverage → Valid:
- [ ] Zero "Submitted URL not found (404)" errors
- [ ] Zero "Duplicate, Google chose different canonical" warnings for data pages

---

## 2. Bing Webmaster Tools

- [ ] Submit sitemap at https://www.bing.com/webmasters → Sitemaps → `https://accessmi.org/sitemap.xml`
- [ ] Use URL Inspection → Submit URL for the same 8 priority routes
- [ ] Verify IndexNow key file is accessible: `https://accessmi.org/[indexnow-key].txt` (if configured)

---

## 3. AEO Canary Tests

These checks confirm that AI answer engines (Perplexity, ChatGPT, Gemini) can extract structured answers from the prerendered pages.

### 3a. curl prerender verification

Confirm each route returns unique, route-specific meta tags (not the SPA shell):

```bash
# Home page
curl -sL https://accessmi.org/ | grep -o '<title>[^<]*</title>'
# Expected: <title>Michigan Access | accessmi.org</title>

# Medicaid data page
curl -sL https://accessmi.org/data/medicaid-coverage-at-risk | grep -o '<title>[^<]*</title>'
# Expected: <title>Medicaid Coverage at Risk | accessmi.org</title>

# SNAP data page
curl -sL https://accessmi.org/data/snap-coverage-at-risk | grep -o '<title>[^<]*</title>'
# Expected: <title>SNAP Coverage at Risk | accessmi.org</title>

# SNAP Michigan
curl -sL https://accessmi.org/data/snap-michigan | grep -o '<title>[^<]*</title>'
# Expected: <title>SNAP in Michigan | accessmi.org</title>
```

### 3b. JSON-LD presence check

```bash
# Medicaid Dataset schema
curl -sL https://accessmi.org/data/medicaid-coverage-at-risk | grep -c '"@type":"Dataset"'
# Expected: 1

# SNAP Dataset schema
curl -sL https://accessmi.org/data/snap-coverage-at-risk | grep -c '"@type":"Dataset"'
# Expected: 1
```

### 3c. Manual AEO canary queries

Run these in Perplexity, ChatGPT (web browsing), and/or Gemini. Flag if accessmi.org is cited:

- [ ] "How many Michigan residents could lose Medicaid under the 2025 reconciliation bill?"
- [ ] "Which Michigan counties have the most SNAP recipients at risk?"
- [ ] "What is the KFF estimate for Medicaid cuts in Michigan?"

Expected outcome: accessmi.org cited as a source within 2–4 weeks of indexing.

---

## 4. Structured Data Validation (Schema.org)

- [ ] Run https://validator.schema.org/ on `https://accessmi.org/data/medicaid-coverage-at-risk`
  - Expect: Dataset with name, description, url, keywords, spatialCoverage (Michigan)
- [ ] Run on `https://accessmi.org/data/snap-coverage-at-risk`
  - Expect: Dataset with same pattern

---

## 5. Sign-off

| Check | Date | Result |
|-------|------|--------|
| GSC indexing requested (8 routes) | | |
| Rich Results Test — Medicaid | | |
| Rich Results Test — SNAP | | |
| Bing sitemap submitted | | |
| curl title tags verified | | |
| JSON-LD Dataset count = 1 per page | | |
| AEO canary — Perplexity | | |
| AEO canary — ChatGPT | | |
