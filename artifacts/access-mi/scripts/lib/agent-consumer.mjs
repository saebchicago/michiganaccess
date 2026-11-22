/**
 * A deliberately naive, independent consumer of AccessMI's public data.
 *
 * It knows nothing about the repository. It starts from /llms.txt, follows
 * only what the published discovery documents say, and must either answer
 * with the meaning preserved (source, period, geography, label, uncertainty)
 * or refuse. Used by scripts/check-agent-readiness.mjs (local files or a live
 * base URL) and by src/data/__tests__/agent-consumer.test.ts.
 *
 * `fetcher(path)` must resolve to { status, contentType, body } and never
 * throw for a missing file.
 */

/** Read a dotted path like "provenance.source_url" or "counties[].countyFips". */
export function pick(obj, dotted) {
  if (!dotted) return undefined;
  let cur = obj;
  for (const part of dotted.split(".")) {
    if (cur == null) return undefined;
    if (part.endsWith("[]")) {
      const arr = cur[part.slice(0, -2)];
      return Array.isArray(arr) ? arr : undefined;
    }
    cur = cur[part];
  }
  return cur;
}

/** Minimal JSON Schema subset: type, required, properties, items, enum, const, pattern, min/maxItems, additionalProperties. */
export function validate(schema, value, at = "$") {
  const errors = [];
  const types = schema.type ? [].concat(schema.type) : null;
  const actual = value === null ? "null" : Array.isArray(value) ? "array" : Number.isInteger(value) ? "integer" : typeof value;
  if (types && !types.some((t) => t === actual || (t === "number" && actual === "integer"))) {
    errors.push(`${at}: expected ${types.join("|")}, got ${actual}`);
    return errors;
  }
  if ("const" in schema && value !== schema.const) errors.push(`${at}: expected ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at}: ${JSON.stringify(value)} not in enum`);
  if (schema.pattern && typeof value === "string" && !new RegExp(schema.pattern).test(value)) errors.push(`${at}: does not match ${schema.pattern}`);
  if (actual === "object") {
    for (const k of schema.required ?? []) if (!(k in value)) errors.push(`${at}.${k}: required`);
    for (const [k, sub] of Object.entries(schema.properties ?? {})) if (k in value) errors.push(...validate(sub, value[k], `${at}.${k}`));
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      for (const [k, v] of Object.entries(value)) if (!(k in (schema.properties ?? {}))) errors.push(...validate(schema.additionalProperties, v, `${at}.${k}`));
    }
  }
  if (actual === "array") {
    if (schema.minItems != null && value.length < schema.minItems) errors.push(`${at}: fewer than ${schema.minItems} items`);
    if (schema.maxItems != null && value.length > schema.maxItems) errors.push(`${at}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => errors.push(...validate(schema.items, v, `${at}[${i}]`)));
  }
  return errors.slice(0, 20);
}

export async function getJson(fetcher, path) {
  const r = await fetcher(path);
  if (r.status !== 200) return { ok: false, reason: `HTTP ${r.status}` };
  if (!/json/.test(r.contentType ?? "") && !/^\s*[[{]/.test(r.body)) return { ok: false, reason: "response is not JSON" };
  try {
    return { ok: true, json: JSON.parse(r.body) };
  } catch {
    return { ok: false, reason: "response is not valid JSON" };
  }
}

/** Step 1: discover the data index from llms.txt alone. */
export async function discover(fetcher) {
  const r = await fetcher("/llms.txt");
  if (r.status !== 200) return { ok: false, reason: `llms.txt HTTP ${r.status}` };
  const m = r.body.match(/\((?:https:\/\/accessmi\.org)?(\/data\/index\.json)\)/);
  if (!m) return { ok: false, reason: "llms.txt does not link the data index" };
  const idx = await getJson(fetcher, m[1]);
  if (!idx.ok) return idx;
  return { ok: true, indexPath: m[1], index: idx.json };
}

/**
 * Load one dataset and describe it the way a careful agent must before using
 * any number from it. Returns { ok:false, refusal } when meaning is missing.
 */
export async function describe(fetcher, index, id) {
  const entry = index.datasets?.find((d) => d.id === id);
  if (!entry) return { ok: false, refusal: `dataset ${id} is not in the index` };
  if (entry.status !== "supported") return { ok: false, refusal: `dataset ${id} is marked ${entry.status}: ${entry.reason ?? "no reason given"}` };
  const data = await getJson(fetcher, entry.path);
  if (!data.ok) return { ok: false, refusal: `dataset ${id} unavailable (${data.reason})` };
  let schemaErrors = [];
  if (entry.schema) {
    const s = await getJson(fetcher, entry.schema);
    if (!s.ok) return { ok: false, refusal: `schema for ${id} unavailable (${s.reason})` };
    schemaErrors = validate(s.json, data.json);
    if (schemaErrors.length) return { ok: false, refusal: `dataset ${id} does not match its schema`, schemaErrors };
  }
  const label = entry.epistemic_label_field ? pick(data.json, entry.epistemic_label_field) : entry.epistemic_label;
  const d = {
    ok: true,
    id,
    entry,
    data: data.json,
    sourceUrl: entry.source_url_field ? pick(data.json, entry.source_url_field) : null,
    downloadUrl: entry.download_url_field ? pick(data.json, entry.download_url_field) : null,
    releaseVersion: entry.release_version_field ? pick(data.json, entry.release_version_field) : null,
    retrievedAt: entry.retrieval_date_field && !entry.retrieval_date_field.includes("[]") ? pick(data.json, entry.retrieval_date_field) : null,
    geographyUnit: entry.geography?.unit ?? null,
    label: label ?? null,
    labelDeclaredMatches: entry.epistemic_label == null || label === entry.epistemic_label,
  };
  return d;
}

/** Return a county measure with everything needed to cite it, or a refusal. */
export function readCountyValue(desc, fips, measureId) {
  const county = desc.data.counties?.find((c) => c.countyFips === fips);
  if (!county) return { ok: false, refusal: `no county ${fips} in ${desc.id}` };
  const measure = desc.data.measures?.find((m) => m.id === measureId);
  if (!measure) return { ok: false, refusal: `no measure ${measureId} in ${desc.id}` };
  const value = county.values?.[measureId];
  if (value === null || value === undefined) return { ok: false, refusal: `${measureId} is unavailable for ${county.countyName} (null means unavailable, not zero)` };
  return {
    ok: true,
    value,
    unit: measure.unit,
    label: measure.value_label,
    interval: county.confidence?.[measureId] ?? null,
    period: desc.releaseVersion,
    geography: { unit: desc.geographyUnit, id: fips, name: county.countyName },
    source: desc.sourceUrl,
  };
}

/**
 * Decide whether two cited values may be compared. Refuses on mismatched
 * geography unit, period, measure, unit or epistemic program; reports
 * "no established difference" when intervals overlap or are missing.
 */
export function compareValues(a, b) {
  if (!a?.ok || !b?.ok) return { verdict: "refuse", reason: "one side is unavailable" };
  if (a.geography?.unit !== b.geography?.unit) return { verdict: "refuse", reason: `geography units differ (${a.geography?.unit} vs ${b.geography?.unit})` };
  if (String(a.period) !== String(b.period)) return { verdict: "refuse", reason: `reporting periods differ (${a.period} vs ${b.period})` };
  if (a.unit !== b.unit) return { verdict: "refuse", reason: `units differ (${a.unit} vs ${b.unit})` };
  if (a.program && b.program && a.program !== b.program) return { verdict: "refuse", reason: `different estimation programs (${a.program} vs ${b.program})` };
  if (!a.interval || !b.interval) return { verdict: "no_established_difference", reason: "uncertainty unavailable for at least one value" };
  const overlap = a.interval[0] <= b.interval[1] && b.interval[0] <= a.interval[1];
  if (overlap) return { verdict: "no_established_difference", reason: "90% intervals overlap" };
  return { verdict: "difference", higher: a.value > b.value ? a.geography.name : b.geography.name, reason: "90% intervals do not overlap" };
}

/** What may an automated consumer do with this dataset? */
export function reusePosition(index, entry) {
  const access = index._meta?.access ?? {};
  return {
    accessmiReads: access.accessmi_automated_reads ?? "not_established",
    rateLimit: access.rate_limit ?? null,
    upstreamTerms: entry?.upstream_terms_status ?? "not_established",
    robotsIsNotALicense: /not a license/i.test(access.robots_txt_scope ?? ""),
  };
}
