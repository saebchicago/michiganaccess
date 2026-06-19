import { describe, it, expect } from "vitest";
import zlib from "node:zlib";
// The ingest script exports its pure helpers; importing it does NOT run the CLI
// (the main() call is guarded to direct invocation only).
import {
  MI_COUNTY_FIPS,
  normCountyKey,
  canonicalCounty,
  isMichigan,
  parseCount,
  detectVintage,
  colToIndex,
  unzip,
  readWorkbook,
  extractMichigan,
} from "../../../scripts/build-snap-county-dataset.mjs";

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

// --- build a FNS-388A-shaped .xlsx (zip of OOXML) inside an outer .zip ------

interface Cell {
  s?: number; // shared-string index
  v?: number; // numeric value
}

function buildFixture(opts: {
  outerName: string;
  extraRows?: { state: string; county: string; persons: number; households: number }[];
}): { zip: Buffer; expected: Map<string, { persons: number; households: number }> } {
  const counties = Object.keys(MI_COUNTY_FIPS);
  const strings: string[] = [];
  const sidx = new Map<string, number>();
  const S = (s: string) => {
    if (!sidx.has(s)) {
      sidx.set(s, strings.length);
      strings.push(s);
    }
    return sidx.get(s)!;
  };
  const headers = ["State", "County", "Persons", "Households"];
  headers.forEach(S);
  S("Michigan");

  const colL = (i: number) => String.fromCharCode(65 + i);
  const rowsXml: string[] = [];
  let rn = 0;
  const pushRow = (cells: Cell[]) => {
    rn++;
    const cx = cells
      .map((c, i) => {
        const ref = colL(i) + rn;
        return c.s !== undefined
          ? `<c r="${ref}" t="s"><v>${c.s}</v></c>`
          : `<c r="${ref}"><v>${c.v}</v></c>`;
      })
      .join("");
    rowsXml.push(`<row r="${rn}">${cx}</row>`);
  };

  // header row
  pushRow(headers.map((h) => ({ s: S(h) })));

  // any extra (e.g. non-Michigan) rows first, to prove disambiguation
  for (const r of opts.extraRows ?? []) {
    pushRow([{ s: S(r.state) }, { s: S(r.county) }, { v: r.persons }, { v: r.households }]);
  }

  const expected = new Map<string, { persons: number; households: number }>();
  counties.forEach((c, i) => {
    const persons = 1000 + i * 7;
    const households = 400 + i * 3; // always < persons
    pushRow([{ s: S("Michigan") }, { s: S(c) }, { v: persons }, { v: households }]);
    expected.set("26" + MI_COUNTY_FIPS[c], { persons, households });
  });

  // duplicate Wayne sub-area row (first-wins should ignore this)
  pushRow([{ s: S("Michigan") }, { s: S("Wayne") }, { v: 1 }, { v: 1 }]);

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const sst = `<?xml version="1.0"?><sst>${strings
    .map((s) => `<si><t>${esc(s)}</t></si>`)
    .join("")}</sst>`;
  const sheet = `<?xml version="1.0"?><worksheet><sheetData>${rowsXml.join(
    "",
  )}</sheetData></worksheet>`;

  const xlsx = makeZip([
    { name: "[Content_Types].xml", data: Buffer.from("<Types/>", "utf8") },
    { name: "xl/sharedStrings.xml", data: Buffer.from(sst, "utf8") },
    { name: "xl/worksheets/sheet1.xml", data: Buffer.from(sheet, "utf8") },
  ]);
  const zip = makeZip([{ name: opts.outerName, data: xlsx }]);
  return { zip, expected };
}

describe("snap-county ingest parser", () => {
  it("colToIndex maps spreadsheet column letters to 0-based indices", () => {
    expect(colToIndex("A1")).toBe(0);
    expect(colToIndex("B2")).toBe(1);
    expect(colToIndex("Z10")).toBe(25);
    expect(colToIndex("AA1")).toBe(26);
    expect(colToIndex("AB1")).toBe(27);
  });

  it("parseCount strips $ , whitespace and rounds; blank -> null", () => {
    expect(parseCount("1,234")).toBe(1234);
    expect(parseCount("$1,500")).toBe(1500);
    expect(parseCount("12.6")).toBe(13);
    expect(parseCount("")).toBeNull();
    expect(parseCount(null)).toBeNull();
    expect(parseCount("abc")).toBeNull();
  });

  it("normCountyKey / canonicalCounty resolve spelling variants to the registry name", () => {
    expect(canonicalCounty("ST CLAIR")).toBe("St. Clair");
    expect(canonicalCounty("Saint Clair County")).toBe("St. Clair");
    expect(canonicalCounty("GRAND TRAVERSE")).toBe("Grand Traverse");
    expect(canonicalCounty("Wayne County")).toBe("Wayne");
    expect(canonicalCounty("Cooketon")).toBeNull();
    expect(normCountyKey("St. Clair")).toBe(normCountyKey("Saint Clair County"));
  });

  it("isMichigan recognizes the state column signals", () => {
    expect(isMichigan("Michigan")).toBe(true);
    expect(isMichigan("MI")).toBe(true);
    expect(isMichigan("26")).toBe(true);
    expect(isMichigan("Ohio")).toBe(false);
  });

  it("detectVintage reads the fiscal year from file/sheet names", () => {
    expect(detectVintage(["snap-fns388a-FY2023.xlsx"])).toBe("FY2023");
    expect(detectVintage(["x FY22 y"])).toBe("FY2022");
    expect(detectVintage(["report 2024 final"])).toBe("FY2024");
    expect(detectVintage(["no year here"])).toBeNull();
  });

  it("unzip + readWorkbook round-trips an OOXML workbook", () => {
    const { zip } = buildFixture({ outerName: "snap-fns388a-FY2023.xlsx" });
    const outer = unzip(zip);
    const xlsxName = [...outer.keys()].find((n) => n.endsWith(".xlsx"))!;
    expect(xlsxName).toBe("snap-fns388a-FY2023.xlsx");
    const sheets = readWorkbook(outer.get(xlsxName)!);
    expect(sheets.length).toBe(1);
    expect(sheets[0].rows.length).toBeGreaterThan(83); // header + 83 + extras
  });

  it("extractMichigan returns all 83 counties with correct persons/households", () => {
    const { zip, expected } = buildFixture({ outerName: "snap-fns388a-FY2023.xlsx" });
    const outer = unzip(zip);
    const sheets = readWorkbook(outer.get("snap-fns388a-FY2023.xlsx")!);
    const found = extractMichigan(sheets);

    expect(found.size).toBe(83);
    for (const [fips, vals] of expected) {
      const row = found.get(fips);
      expect(row, `missing ${fips}`).toBeTruthy();
      expect(row.persons).toBe(vals.persons);
      expect(row.households).toBe(vals.households);
      expect(row.households).toBeLessThan(row.persons);
    }
  });

  it("excludes non-Michigan rows even when the county name recurs across states", () => {
    // Ohio also has a Monroe County - it must not overwrite Michigan's Monroe.
    const { zip } = buildFixture({
      outerName: "snap-fns388a-FY2023.xlsx",
      extraRows: [{ state: "Ohio", county: "Monroe", persons: 999_999, households: 888_888 }],
    });
    const found = extractMichigan(readWorkbook(unzip(zip).get("snap-fns388a-FY2023.xlsx")!));
    const monroe = found.get("26115"); // Michigan Monroe
    expect(monroe).toBeTruthy();
    expect(monroe.persons).not.toBe(999_999); // Ohio row was excluded
  });

  it("first plausible row wins (ignores duplicate sub-area rows)", () => {
    const { zip } = buildFixture({ outerName: "snap-fns388a-FY2023.xlsx" });
    const found = extractMichigan(readWorkbook(unzip(zip).get("snap-fns388a-FY2023.xlsx")!));
    const wayne = found.get("26163");
    expect(wayne).toBeTruthy();
    // The trailing duplicate Wayne row had persons=1; the real row must win.
    expect(wayne.persons).toBeGreaterThan(1);
  });

  it("rejects ZIP64 archives explicitly", () => {
    const buf = Buffer.alloc(22);
    buf.writeUInt32LE(0x06054b50, 0);
    buf.writeUInt16LE(1, 10); // 1 entry
    buf.writeUInt32LE(0xffffffff, 16); // central dir offset = ZIP64 sentinel
    expect(() => unzip(buf)).toThrow(/ZIP64/);
  });
});
