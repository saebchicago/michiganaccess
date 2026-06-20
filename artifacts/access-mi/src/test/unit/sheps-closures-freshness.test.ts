import { describe, it, expect } from "vitest";
import zlib from "node:zlib";
// The freshness script exports its pure helpers; importing it does NOT run the
// CLI (the main() call is guarded to direct invocation only).
import {
  isMichiganState,
  detectYear,
  nameTokens,
  cityKey,
  jaccard,
  extractShepsMichigan,
  parseCuratedFallback,
  diffClosures,
  sheetsFromBuffer,
} from "../../../scripts/check-sheps-closures.mjs";

// --- minimal ZIP writer (mirrors the reader's expectations) ----------------

function makeZip(files: { name: string; data: Buffer }[]): Buffer {
  const parts: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const f of files) {
    const comp = zlib.deflateRawSync(f.data);
    const nameBuf = Buffer.from(f.name, "utf8");
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(f.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    parts.push(local, nameBuf, comp);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(8, 10);
    cd.writeUInt32LE(comp.length, 20);
    cd.writeUInt32LE(f.data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt32LE(offset, 42);
    central.push(cd, nameBuf);
    offset += local.length + nameBuf.length + comp.length;
  }
  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cdBuf, eocd]);
}

// --- build a Sheps-shaped .xlsx (a bare workbook, as Sheps publishes) -------

interface ShepsRow {
  name: string;
  city: string;
  state: string;
  county?: string;
  year: string;
}

function buildShepsXlsx(dataRows: ShepsRow[]): Buffer {
  const strings: string[] = [];
  const sidx = new Map<string, number>();
  const S = (s: string) => {
    if (!sidx.has(s)) {
      sidx.set(s, strings.length);
      strings.push(s);
    }
    return sidx.get(s)!;
  };

  const headers = ["Hospital Name", "City", "County", "State", "Closure Year"];
  const colL = (i: number) => String.fromCharCode(65 + i);
  const rowsXml: string[] = [];
  let rn = 0;
  const pushRow = (vals: string[]) => {
    rn++;
    const cx = vals
      .map((v, i) => `<c r="${colL(i)}${rn}" t="s"><v>${S(v)}</v></c>`)
      .join("");
    rowsXml.push(`<row r="${rn}">${cx}</row>`);
  };

  pushRow(headers);
  for (const r of dataRows) {
    pushRow([r.name, r.city, r.county ?? "", r.state, r.year]);
  }

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const sst = `<?xml version="1.0"?><sst>${strings
    .map((s) => `<si><t>${esc(s)}</t></si>`)
    .join("")}</sst>`;
  const sheet = `<?xml version="1.0"?><worksheet><sheetData>${rowsXml.join(
    "",
  )}</sheetData></worksheet>`;

  return makeZip([
    { name: "[Content_Types].xml", data: Buffer.from("<Types/>", "utf8") },
    { name: "xl/sharedStrings.xml", data: Buffer.from(sst, "utf8") },
    { name: "xl/worksheets/sheet1.xml", data: Buffer.from(sheet, "utf8") },
  ]);
}

// A miniature curated fallback, same shape as closureWatchFallback.ts, including
// a commented-out _CANDIDATES block that must NOT count as tracked.
const CURATED_TS = `
export const CLOSURE_WATCH_FALLBACK = [
  {
    id: "aspirus-ontonagon-hospital-full-closure-2024",
    facilityName: "Aspirus Ontonagon Hospital",
    facilityType: "rural-critical-access",
    address: "601 S 7th St",
    city: "Ontonagon",
    county: "Ontonagon",
  },
  {
    id: "spectrum-health-kelsey-full-closure-2023",
    facilityName: "Spectrum Health Kelsey Hospital (Corewell Health)",
    facilityType: "rural-critical-access",
    address: "418 Washington Ave",
    city: "Lakeview",
    county: "Montcalm",
  },
];
/*
export const _CANDIDATES = [
  {
    id: "munson-manistee-ob-2019",
    facilityName: "Munson Healthcare Manistee Hospital",
    city: "Manistee",
    county: "Manistee",
  },
];
*/
`;

describe("sheps-closures freshness check", () => {
  it("isMichiganState recognizes state-column signals", () => {
    expect(isMichiganState("Michigan")).toBe(true);
    expect(isMichiganState("MI")).toBe(true);
    expect(isMichiganState("26")).toBe(true);
    expect(isMichiganState("Ohio")).toBe(false);
    expect(isMichiganState("")).toBe(false);
  });

  it("detectYear pulls a 4-digit year from free text", () => {
    expect(detectYear("2024")).toBe(2024);
    expect(detectYear("closed April 2024")).toBe(2024);
    expect(detectYear("n/a")).toBeNull();
  });

  it("nameTokens drops corporate brands and facility-type filler", () => {
    const t = nameTokens("Aspirus Ontonagon Hospital");
    expect(t.has("ontonagon")).toBe(true);
    expect(t.has("aspirus")).toBe(false); // brand stopword
    expect(t.has("hospital")).toBe(false); // type stopword
  });

  it("jaccard scores token-set overlap", () => {
    expect(jaccard(nameTokens("Ontonagon Hospital"), nameTokens("Ontonagon Memorial Hospital"))).toBe(1);
    expect(jaccard(nameTokens("Sturgis Hospital"), nameTokens("Ontonagon Hospital"))).toBe(0);
  });

  it("parseCuratedFallback reads active entries and ignores the commented _CANDIDATES", () => {
    const curated = parseCuratedFallback(CURATED_TS);
    expect(curated.length).toBe(2);
    expect(curated.map((c) => c.name)).toContain("Aspirus Ontonagon Hospital");
    // The commented-out Manistee candidate must not be parsed as tracked.
    expect(curated.find((c) => c.name.includes("Manistee"))).toBeUndefined();
    expect(curated[0].cityKey).toBe("ontonagon");
  });

  it("sheetsFromBuffer parses a bare Sheps-style .xlsx workbook", () => {
    const xlsx = buildShepsXlsx([
      { name: "Aspirus Ontonagon Hospital", city: "Ontonagon", state: "Michigan", year: "2024" },
    ]);
    const sheets = sheetsFromBuffer(xlsx);
    expect(sheets.length).toBe(1);
    expect(sheets[0].rows.length).toBe(2); // header + 1 data row
  });

  it("extractShepsMichigan keeps Michigan rows and drops other states", () => {
    const xlsx = buildShepsXlsx([
      { name: "Aspirus Ontonagon Hospital", city: "Ontonagon", state: "Michigan", year: "2024" },
      { name: "Some Ohio Hospital", city: "Monroe", state: "Ohio", year: "2024" },
      { name: "Sturgis Hospital", city: "Sturgis", state: "MI", year: "2023" },
    ]);
    const rows = extractShepsMichigan(sheetsFromBuffer(xlsx), 2020);
    expect(rows.length).toBe(2);
    expect(rows.map((r) => r.name)).toEqual([
      "Aspirus Ontonagon Hospital",
      "Sturgis Hospital",
    ]);
  });

  it("extractShepsMichigan honors the --since year window", () => {
    const xlsx = buildShepsXlsx([
      { name: "Old Closure Hospital", city: "Detroit", state: "MI", year: "2011" },
      { name: "Recent Hospital", city: "Flint", state: "MI", year: "2023" },
    ]);
    const rows = extractShepsMichigan(sheetsFromBuffer(xlsx), 2020);
    expect(rows.map((r) => r.name)).toEqual(["Recent Hospital"]);
  });

  it("diffClosures classifies tracked vs new Michigan closures", () => {
    const curated = parseCuratedFallback(CURATED_TS);
    const xlsx = buildShepsXlsx([
      // Sheps spelling differs but shares the distinctive 'ontonagon' token -> tracked.
      { name: "Ontonagon Memorial Hospital", city: "Ontonagon", state: "MI", year: "2024" },
      // genuinely new, unseen facility + city -> new.
      { name: "Eaton Rapids Medical Center", city: "Eaton Rapids", state: "MI", year: "2025" },
    ]);
    const diff = diffClosures(extractShepsMichigan(sheetsFromBuffer(xlsx), 2020), curated);
    expect(diff.tracked.map((r) => r.name)).toContain("Ontonagon Memorial Hospital");
    expect(diff.new.map((r) => r.name)).toContain("Eaton Rapids Medical Center");
    expect(diff.new.map((r) => r.name)).not.toContain("Ontonagon Memorial Hospital");
  });

  it("diffClosures flags a same-city, different-facility row for review", () => {
    const curated = parseCuratedFallback(CURATED_TS);
    // Same city as the tracked Lakeview entry, but a different facility name.
    const xlsx = buildShepsXlsx([
      { name: "Lakeview Community Surgical", city: "Lakeview", state: "MI", year: "2025" },
    ]);
    const diff = diffClosures(extractShepsMichigan(sheetsFromBuffer(xlsx), 2020), curated);
    expect(diff.review.map((r) => r.name)).toContain("Lakeview Community Surgical");
    expect(diff.new.length).toBe(0);
  });
});
