/**
 * data-ingest – Batch ingestion edge function
 *
 * Fetches external ArcGIS / Socrata datasets and upserts rows into
 * ingestion_cache. Tracks each run in ingestion_runs.
 *
 * Callable on schedule (pg_cron) or manually via POST.
 * Body: { "datasets": ["pfas-sites","econ-det-blight"] } or omit for all.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Source definitions ──────────────────────────────────────────────────────

interface SourceDef {
  datasetId: string;
  type: "arcgis-geojson" | "arcgis-esri" | "nrel-afdc" | "socrata";
  url: string;
  idField: string; // field used as stable source_id
}

const SOURCES: SourceDef[] = [
  {
    datasetId: "env-pfas-sites",
    type: "arcgis-geojson",
    url: "https://services1.arcgis.com/VdSAmGfE7jMMbR2h/arcgis/rest/services/PFAS_Sites_Public/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&outSR=4326&resultRecordCount=500",
    idField: "OBJECTID",
  },
  {
    datasetId: "env-air-quality",
    type: "arcgis-esri",
    url: "https://utility.arcgis.com/usrsvcs/servers/7667046c1a724cebaf153ec1336f74f4/rest/services/EGLE/AirMonitoring/MapServer/0/query?where=1%3D1&outFields=*&f=json&outSR=4326",
    idField: "AqsId",
  },
  {
    datasetId: "mobility-mdot-workzones",
    type: "arcgis-geojson",
    url: "https://mdotgis.state.mi.us/arcgis/rest/services/Widget/NextGenPrFinderPub/FeatureServer/275/query?where=1%3D1&outFields=*&f=geojson&outSR=4326&resultRecordCount=500",
    idField: "OBJECTID",
  },
  {
    datasetId: "mobility-ev-stations",
    type: "nrel-afdc",
    url: "https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=DEMO_KEY&fuel_type=ELEC&state=MI&limit=500",
    idField: "id",
  },
  {
    datasetId: "mobility-ddot-routes",
    type: "arcgis-geojson",
    url: "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/DDOT_Bus_Routes/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&outSR=4326",
    idField: "OBJECTID",
  },
  {
    datasetId: "econ-det-blight",
    type: "socrata",
    url: "https://data.detroitmi.gov/resource/ti6p-wcg4.json?$limit=1000&$order=violation_date%20DESC",
    idField: "ticket_id",
  },
  {
    datasetId: "econ-det-demolitions",
    type: "socrata",
    url: "https://data.detroitmi.gov/resource/rv44-e9di.json?$limit=1000&$order=demolition_date%20DESC",
    idField: "contractor_name", // fallback composite
  },
];

// ── Fetch helpers ───────────────────────────────────────────────────────────

function extractRows(
  src: SourceDef,
  raw: any
): { sourceId: string; data: Record<string, unknown> }[] {
  const rows: { sourceId: string; data: Record<string, unknown> }[] = [];

  if (src.type === "arcgis-geojson") {
    const features = raw?.features ?? [];
    for (const f of features) {
      const props = f.properties ?? {};
      const sid = String(props[src.idField] ?? props["OBJECTID"] ?? rows.length);
      rows.push({
        sourceId: sid,
        data: {
          ...props,
          _lat: f.geometry?.coordinates?.[1],
          _lon: f.geometry?.coordinates?.[0],
        },
      });
    }
  } else if (src.type === "arcgis-esri") {
    const features = raw?.features ?? [];
    for (const f of features) {
      const attrs = f.attributes ?? {};
      const sid = String(attrs[src.idField] ?? rows.length);
      rows.push({
        sourceId: sid,
        data: { ...attrs, _lat: f.geometry?.y, _lon: f.geometry?.x },
      });
    }
  } else if (src.type === "nrel-afdc") {
    const stations = raw?.fuel_stations ?? [];
    for (const s of stations) {
      rows.push({
        sourceId: String(s[src.idField] ?? rows.length),
        data: {
          Station_Name: s.station_name,
          Street_Address: s.street_address,
          City: s.city,
          ZIP: s.zip,
          EV_Level2_EVSE_Num: s.ev_level2_evse_num,
          EV_DC_Fast_Count: s.ev_dc_fast_num,
          EV_Network: s.ev_network,
          Access: s.access_code,
          Status: s.status_code,
          _lat: s.latitude,
          _lon: s.longitude,
        },
      });
    }
  } else if (src.type === "socrata") {
    if (!Array.isArray(raw)) return rows;
    for (const r of raw) {
      const sid = String(r[src.idField] ?? rows.length);
      rows.push({ sourceId: sid, data: r });
    }
  }

  return rows;
}

// ── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Parse optional dataset filter
  let targetIds: string[] | null = null;
  try {
    const body = await req.json();
    if (body?.datasets && Array.isArray(body.datasets)) {
      targetIds = body.datasets;
    }
  } catch {
    // no body = ingest all
  }

  const sources = targetIds
    ? SOURCES.filter((s) => targetIds!.includes(s.datasetId))
    : SOURCES;

  const results: Record<string, { status: string; records?: number; error?: string }> = {};

  for (const src of sources) {
    // Create run record
    const { data: run } = await supabase
      .from("ingestion_runs")
      .insert({ dataset_id: src.datasetId, status: "running" })
      .select("id")
      .single();

    const runId = run?.id;

    try {
      const res = await fetch(src.url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        throw new Error(`Upstream ${res.status}`);
      }

      const raw = await res.json();
      const rows = extractRows(src, raw);

      // Upsert in batches of 100
      let upserted = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100).map((r) => ({
          dataset_id: src.datasetId,
          source_id: r.sourceId,
          data: r.data,
          ingested_at: new Date().toISOString(),
        }));

        const { error: upsertErr } = await supabase
          .from("ingestion_cache")
          .upsert(batch, { onConflict: "dataset_id,source_id" });

        if (upsertErr) throw new Error(upsertErr.message);
        upserted += batch.length;
      }

      // Update run
      if (runId) {
        await supabase
          .from("ingestion_runs")
          .update({
            status: "success",
            finished_at: new Date().toISOString(),
            records_fetched: rows.length,
            records_upserted: upserted,
          })
          .eq("id", runId);
      }

      results[src.datasetId] = { status: "success", records: upserted };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (runId) {
        await supabase
          .from("ingestion_runs")
          .update({
            status: "error",
            finished_at: new Date().toISOString(),
            error_message: msg,
          })
          .eq("id", runId);
      }
      results[src.datasetId] = { status: "error", error: msg };
    }
  }

  return new Response(JSON.stringify({ results, timestamp: new Date().toISOString() }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
