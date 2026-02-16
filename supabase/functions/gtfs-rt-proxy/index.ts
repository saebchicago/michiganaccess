const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Known Michigan GTFS-RT vehicle position feeds
// Multiple URL variants for resilience
const FEEDS: Record<string, { urls: string[]; agency: string; color: string }> = {
  ddot: {
    urls: [
      "https://ddot.info/gtfsrt/vehiclePositions",
      "https://ddot.info/gtfsrt/vehiclepositions",
      "https://api.ddot.info/api/api/where/vehicles-for-agency/DDOT.json?key=BETA",
    ],
    agency: "DDOT (Detroit)",
    color: "#E85D4A",
  },
  theride: {
    urls: [
      "https://rt.theride.org/InfoPoint/GTFS-Realtime.ashx?Type=VehiclePosition",
    ],
    agency: "TheRide (Ann Arbor)",
    color: "#00A3A1",
  },
};

interface VehiclePosition {
  id: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
  routeId?: string;
  tripId?: string;
  label?: string;
  timestamp?: number;
  agency: string;
  color: string;
}

// Manual GTFS-RT protobuf decoder (minimal implementation)
// GTFS-RT uses protobuf wire format. We decode FeedMessage → entity[] → vehicle → position
function decodeVarint(buf: Uint8Array, offset: number): [number, number] {
  let result = 0;
  let shift = 0;
  let pos = offset;
  while (pos < buf.length) {
    const byte = buf[pos];
    result |= (byte & 0x7f) << shift;
    pos++;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return [result, pos];
}

function decodeFixed32(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16) | (buf[offset + 3] << 24);
}

function decodeFixed64AsNumber(buf: Uint8Array, offset: number): number {
  const low = buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16) | (buf[offset + 3] << 24);
  const high = buf[offset + 4] | (buf[offset + 5] << 8) | (buf[offset + 6] << 16) | (buf[offset + 7] << 24);
  return (high >>> 0) * 0x100000000 + (low >>> 0);
}

function decodeFloat(buf: Uint8Array, offset: number): number {
  const view = new DataView(buf.buffer, buf.byteOffset + offset, 4);
  return view.getFloat32(0, true);
}

function decodeString(buf: Uint8Array, offset: number, length: number): string {
  return new TextDecoder().decode(buf.slice(offset, offset + length));
}

interface RawField { fieldNumber: number; wireType: number; data: Uint8Array | number }

function parseMessage(buf: Uint8Array): RawField[] {
  const fields: RawField[] = [];
  let pos = 0;
  while (pos < buf.length) {
    const [tag, newPos] = decodeVarint(buf, pos);
    pos = newPos;
    const fieldNumber = tag >>> 3;
    const wireType = tag & 0x7;

    if (wireType === 0) { // varint
      const [val, np] = decodeVarint(buf, pos);
      fields.push({ fieldNumber, wireType, data: val });
      pos = np;
    } else if (wireType === 1) { // 64-bit
      fields.push({ fieldNumber, wireType, data: buf.slice(pos, pos + 8) as any });
      pos += 8;
    } else if (wireType === 2) { // length-delimited
      const [len, np] = decodeVarint(buf, pos);
      pos = np;
      fields.push({ fieldNumber, wireType, data: buf.slice(pos, pos + len) });
      pos += len;
    } else if (wireType === 5) { // 32-bit
      fields.push({ fieldNumber, wireType, data: buf.slice(pos, pos + 4) as any });
      pos += 4;
    } else {
      // Unknown wire type, skip
      break;
    }
  }
  return fields;
}

function extractVehicles(feedBuf: Uint8Array, agency: string, color: string): VehiclePosition[] {
  const vehicles: VehiclePosition[] = [];
  try {
    const feedFields = parseMessage(feedBuf);
    // field 2 = entity (repeated)
    for (const field of feedFields) {
      if (field.fieldNumber !== 2 || field.wireType !== 2) continue;
      const entityBuf = field.data as Uint8Array;
      const entityFields = parseMessage(entityBuf);
      
      let entityId = "";
      let vehicleMsg: Uint8Array | null = null;
      
      for (const ef of entityFields) {
        if (ef.fieldNumber === 1 && ef.wireType === 2) entityId = decodeString(ef.data as Uint8Array, 0, (ef.data as Uint8Array).length);
        if (ef.fieldNumber === 4 && ef.wireType === 2) vehicleMsg = ef.data as Uint8Array; // vehicle position
      }
      
      if (!vehicleMsg) continue;
      
      const vpFields = parseMessage(vehicleMsg);
      let lat = 0, lon = 0, bearing: number | undefined, speed: number | undefined;
      let routeId = "", tripId = "", label = "";
      let timestamp = 0;
      
      for (const vf of vpFields) {
        if (vf.fieldNumber === 2 && vf.wireType === 2) { // position
          const posFields = parseMessage(vf.data as Uint8Array);
          for (const pf of posFields) {
            if (pf.fieldNumber === 1 && pf.wireType === 5) lat = decodeFloat(pf.data as Uint8Array, 0);
            if (pf.fieldNumber === 2 && pf.wireType === 5) lon = decodeFloat(pf.data as Uint8Array, 0);
            if (pf.fieldNumber === 3 && pf.wireType === 5) bearing = decodeFloat(pf.data as Uint8Array, 0);
            if (pf.fieldNumber === 4 && pf.wireType === 5) speed = decodeFloat(pf.data as Uint8Array, 0);
          }
        }
        if (vf.fieldNumber === 1 && vf.wireType === 2) { // trip
          const tripFields = parseMessage(vf.data as Uint8Array);
          for (const tf of tripFields) {
            if (tf.fieldNumber === 1 && tf.wireType === 2) tripId = decodeString(tf.data as Uint8Array, 0, (tf.data as Uint8Array).length);
            if (tf.fieldNumber === 5 && tf.wireType === 2) routeId = decodeString(tf.data as Uint8Array, 0, (tf.data as Uint8Array).length);
          }
        }
        if (vf.fieldNumber === 8 && vf.wireType === 2) { // vehicle descriptor
          const vdFields = parseMessage(vf.data as Uint8Array);
          for (const vdf of vdFields) {
            if (vdf.fieldNumber === 2 && vdf.wireType === 2) label = decodeString(vdf.data as Uint8Array, 0, (vdf.data as Uint8Array).length);
          }
        }
        if (vf.fieldNumber === 5 && vf.wireType === 0) timestamp = vf.data as number; // timestamp
      }
      
      if (lat !== 0 && lon !== 0) {
        vehicles.push({
          id: entityId || `${agency}-${vehicles.length}`,
          latitude: lat,
          longitude: lon,
          bearing,
          speed,
          routeId,
          tripId,
          label,
          timestamp: timestamp || undefined,
          agency,
          color,
        });
      }
    }
  } catch (e) {
    console.error("Protobuf parse error:", e);
  }
  return vehicles;
}

// Try to parse as OneBusAway JSON API (DDOT fallback)
function parseOneBusAwayJSON(data: any, agency: string, color: string): VehiclePosition[] {
  const vehicles: VehiclePosition[] = [];
  try {
    const list = data?.data?.list || [];
    for (const v of list) {
      if (v.location?.lat && v.location?.lon) {
        vehicles.push({
          id: v.vehicleId || `${agency}-${vehicles.length}`,
          latitude: v.location.lat,
          longitude: v.location.lon,
          bearing: v.heading ?? undefined,
          routeId: v.routeId ?? undefined,
          tripId: v.tripId ?? undefined,
          label: v.vehicleId ?? undefined,
          timestamp: v.lastUpdateTime ? Math.floor(v.lastUpdateTime / 1000) : undefined,
          agency,
          color,
        });
      }
    }
  } catch {}
  return vehicles;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const feedId = url.searchParams.get("feed");

    if (!feedId) {
      return new Response(
        JSON.stringify({ error: "Missing 'feed' parameter", available_feeds: Object.keys(FEEDS) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const feedConfig = FEEDS[feedId];
    if (!feedConfig) {
      return new Response(
        JSON.stringify({ error: `Unknown feed: ${feedId}`, available_feeds: Object.keys(FEEDS) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let vehicles: VehiclePosition[] = [];
    let feedUrl = "";
    let feedError = "";

    // Try each URL until one works
    for (const tryUrl of feedConfig.urls) {
      try {
        feedUrl = tryUrl;
        const response = await fetch(tryUrl, {
          headers: { Accept: "application/x-protobuf, application/json, */*" },
        });

        if (!response.ok) {
          feedError = `${tryUrl} returned ${response.status}`;
          continue;
        }

        const contentType = response.headers.get("content-type") || "";
        
        if (contentType.includes("json")) {
          // JSON response (OneBusAway API)
          const data = await response.json();
          vehicles = parseOneBusAwayJSON(data, feedConfig.agency, feedConfig.color);
        } else {
          // Protobuf response
          const buffer = await response.arrayBuffer();
          const buf = new Uint8Array(buffer);
          
          // Quick check: valid protobuf starts with field tags
          if (buf.length < 4) {
            feedError = `${tryUrl} returned empty/tiny response`;
            continue;
          }
          
          vehicles = extractVehicles(buf, feedConfig.agency, feedConfig.color);
        }
        
        if (vehicles.length > 0) break;
      } catch (err) {
        feedError = `${tryUrl}: ${err.message}`;
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        feed: feedId,
        agency: feedConfig.agency,
        vehicles,
        count: vehicles.length,
        fetched_at: new Date().toISOString(),
        source_url: feedUrl,
        ...(vehicles.length === 0 && feedError ? { warning: feedError } : {}),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GTFS-RT proxy error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch GTFS-RT data", vehicles: [], count: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
