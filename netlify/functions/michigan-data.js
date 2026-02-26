// netlify/functions/michigan-data.js
// Michigan Civic Data Aggregator
// Fetches from Michigan Open Data (Socrata), CDC, HRSA, EGLE, and other public APIs
// Called by aiService.ts -> fetchMichiganData(county, sector)

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// --- Michigan Open Data (Socrata) base ---
const SOCRATA_BASE = 'https://data.michigan.gov/resource';
const SOCRATA_APP_TOKEN = process.env.MICHIGAN_OPEN_DATA_TOKEN || '';

async function socrataFetch(endpoint, params = {}) {
  const url = new URL(`${SOCRATA_BASE}/${endpoint}.json`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  if (SOCRATA_APP_TOKEN) url.searchParams.set('$$app_token', SOCRATA_APP_TOKEN);
  url.searchParams.set('$limit', '50');
  try {
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --- CDC PLACES county health data (public, no key needed) ---
async function fetchCDCPlaces(county) {
  // CDC PLACES 2023 county-level health measures for Michigan
  const url =
    `https://data.cdc.gov/resource/swc5-untb.json` +
    `?StateAbbr=MI&LocationName=${encodeURIComponent(county + ' County')}&$limit=30`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const rows = await res.json();
    // Summarize key measures
    const summary = {};
    for (const row of rows) {
      if (row.MeasureId && row.Data_Value) {
        summary[row.MeasureId] = {
          measure: row.Measure,
          value: row.Data_Value,
          unit: row.Data_Value_Unit,
        };
      }
    }
    return Object.keys(summary).length ? summary : null;
  } catch {
    return null;
  }
}

// --- HRSA Health Resources (primary care shortage areas, federally qualified health centers) ---
async function fetchHRSAData(county, stateAbbr = 'MI') {
  // HRSA Data Warehouse - shortage areas
  const url =
    `https://data.hrsa.gov/DataDownload/DD_Files/Shortage_Areas.json` +
    `?state=${stateAbbr}&county=${encodeURIComponent(county)}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --- Michigan EGLE / Environmental data via ArcGIS REST ---
async function fetchEGLEAirQuality(county) {
  // EGLE ArcGIS REST - Michigan air monitoring stations
  const url =
    `https://gisagocss.state.mi.us/arcgis/rest/services/EGLE/EGLE_Air_Quality_Monitors/MapServer/0/query` +
    `?where=${encodeURIComponent(`COUNTY_NAME='${county.toUpperCase()}'`)}` +
    `&outFields=COUNTY_NAME,SITE_NAME,PARAMETER_NAME,AQI_VALUE,AQI_CATEGORY` +
    `&returnGeometry=false&f=json&resultRecordCount=20`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.features?.map((f) => f.attributes) || null;
  } catch {
    return null;
  }
}

// --- Michigan Open Data: Medicaid enrollment by county ---
async function fetchMedicaidEnrollment(county) {
  // Michigan DHHS Medicaid county enrollment
  const rows = await socrataFetch('mhv3-n3m7', {
    county_name: county,
    $order: 'month_year DESC',
  });
  return rows && rows.length ? rows.slice(0, 3) : null;
}

// --- Michigan Open Data: SNAP/food assistance by county ---
async function fetchSNAPData(county) {
  const rows = await socrataFetch('g8wa-s4me', {
    county: county,
    $order: 'date DESC',
  });
  return rows && rows.length ? rows.slice(0, 3) : null;
}

// --- Michigan Open Data: Vital statistics / mortality ---
async function fetchVitalStats(county) {
  const rows = await socrataFetch('75cy-s57p', {
    county: county,
  });
  return rows && rows.length ? rows.slice(0, 5) : null;
}

// --- Michigan Open Data: EGLE water quality violations ---
async function fetchWaterQuality(county) {
  const rows = await socrataFetch('9gfn-giqy', {
    county_served: county,
    $order: 'violation_date DESC',
  });
  return rows && rows.length ? rows.slice(0, 5) : null;
}

// --- Michigan Open Data: Energy / utility shutoff data ---
async function fetchEnergyData(county) {
  const rows = await socrataFetch('4i2i-cfmb', {
    county: county,
    $order: 'year DESC',
  });
  return rows && rows.length ? rows.slice(0, 3) : null;
}

// --- Michigan Open Data: Unemployment / workforce ---
async function fetchWorkforceData(county) {
  const rows = await socrataFetch('bktp-b6ze', {
    area_name: county + ' County',
    $order: 'year DESC',
  });
  return rows && rows.length ? rows.slice(0, 3) : null;
}

// --- County Health Rankings (Robert Wood Johnson) via public CSV ---
async function fetchCountyHealthRankings(county) {
  // CHR provides ranked county health data; we use the public API proxy
  const url =
    `https://chronicdata.cdc.gov/resource/dttw-5yxu.json` +
    `?stateabbr=MI&county=${encodeURIComponent(county)}&$limit=20`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --- Route handler ---
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters || {};
  const county = (params.county || 'Wayne').trim();
  const sector = (params.sector || 'health').toLowerCase().trim();

  try {
    let data = {};

    if (sector === 'health') {
      const [cdc, hrsa, medicaid, vital, chr] = await Promise.all([
        fetchCDCPlaces(county),
        fetchHRSAData(county),
        fetchMedicaidEnrollment(county),
        fetchVitalStats(county),
        fetchCountyHealthRankings(county),
      ]);
      data = {
        source: 'CDC PLACES, HRSA, Michigan DHHS, County Health Rankings',
        county,
        cdcHealthMeasures: cdc,
        hrsaShortageAreas: hrsa,
        medicaidEnrollment: medicaid,
        vitalStatistics: vital,
        countyHealthRankings: chr,
      };
    } else if (sector === 'environment') {
      const [air, water] = await Promise.all([
        fetchEGLEAirQuality(county),
        fetchWaterQuality(county),
      ]);
      data = {
        source: 'Michigan EGLE, Michigan Open Data',
        county,
        airQuality: air,
        waterQualityViolations: water,
      };
    } else if (sector === 'housing') {
      const [snap, energy] = await Promise.all([
        fetchSNAPData(county),
        fetchEnergyData(county),
      ]);
      data = {
        source: 'Michigan Open Data (MDHHS SNAP, MPSC Energy)',
        county,
        snapEnrollment: snap,
        energyBurden: energy,
      };
    } else if (sector === 'workforce') {
      const workforce = await fetchWorkforceData(county);
      data = {
        source: 'Michigan Open Data (LEO Workforce)',
        county,
        laborMarket: workforce,
      };
    } else {
      // Default: return all sectors
      const [cdc, air, snap, workforce] = await Promise.all([
        fetchCDCPlaces(county),
        fetchEGLEAirQuality(county),
        fetchSNAPData(county),
        fetchWorkforceData(county),
      ]);
      data = {
        source: 'CDC, EGLE, Michigan Open Data',
        county,
        health: cdc,
        airQuality: air,
        snap: snap,
        workforce: workforce,
      };
    }

    // Strip nulls to keep payload lean for the LLM
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== null && v !== undefined)
    );

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(clean),
    };
  } catch (err) {
    console.error('michigan-data error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Data fetch error', detail: err.message }),
    };
  }
}
