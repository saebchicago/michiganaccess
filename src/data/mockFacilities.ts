// Mock Facilities Database - for local development and testing
// This data simulates what would come from a real database
// Replace with actual API calls to NPI Registry, Michigan 211, etc. when deploying

export interface Facility {
  id: string;
  name: string;
  county: string;
  county_code: string;
  city: string;
  address: string;
  phone: string;
  website?: string;
  type: "clinic" | "hospital" | "mental_health" | "dental" | "financial" | "housing" | "food" | "legal" | "transportation";
  services: string[];
  hours?: string;
  accepts_medicaid: boolean;
  accepts_insurance: boolean;
  sliding_scale: boolean;
  lat: number;
  lng: number;
  notes?: string;
}

export const mockFacilities: Facility[] = [
  // ========== WAYNE COUNTY (Detroit Metro) ==========
  {
    id: "wayne_001",
    name: "Detroit Community Health Center",
    county: "wayne",
    county_code: "082",
    city: "Detroit",
    address: "4707 Cass Ave, Detroit, MI 48201",
    phone: "313-577-9500",
    website: "https://www.dhcd.org",
    type: "clinic",
    services: ["primary care", "dental", "mental health", "substance abuse treatment"],
    hours: "Mon-Fri 8am-5pm",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: true,
    lat: 42.33,
    lng: -83.07,
    notes: "Largest community health center in Detroit. Multiple locations."
  },
  {
    id: "wayne_002",
    name: "Henry Ford Hospital",
    county: "wayne",
    county_code: "082",
    city: "Detroit",
    address: "2799 W Grand Blvd, Detroit, MI 48202",
    phone: "313-916-2600",
    website: "https://www.henryford.com",
    type: "hospital",
    services: ["emergency", "inpatient", "outpatient", "trauma center"],
    hours: "24/7",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: false,
    lat: 42.3359,
    lng: -83.1146
  },
  {
    id: "wayne_003",
    name: "Detroit Financial Empowerment Center",
    county: "wayne",
    county_code: "082",
    city: "Detroit",
    address: "615 Griswold St, Suite 401, Detroit, MI 48226",
    phone: "313-963-5500",
    website: "https://detroit.gov",
    type: "financial",
    services: ["financial counseling", "credit repair", "homeownership", "debt management"],
    hours: "Mon-Fri 9am-5pm",
    accepts_medicaid: false,
    accepts_insurance: false,
    sliding_scale: true,
    lat: 42.3314,
    lng: -83.0458,
    notes: "Free financial counseling for Detroit residents"
  },
  {
    id: "wayne_004",
    name: "Wayne County Emergency Shelter",
    county: "wayne",
    county_code: "082",
    city: "Detroit",
    address: "2959 Martin Luther King Jr Blvd, Detroit, MI 48208",
    phone: "313-494-8800",
    type: "housing",
    services: ["emergency shelter", "case management", "job training"],
    hours: "24/7",
    accepts_medicaid: false,
    accepts_insurance: false,
    sliding_scale: true,
    lat: 42.3208,
    lng: -83.1508,
    notes: "No barriers entry shelter"
  },
  {
    id: "wayne_005",
    name: "Detroit Food Bank",
    county: "wayne",
    county_code: "082",
    city: "Detroit",
    address: "2131 Beaufait St, Detroit, MI 48207",
    phone: "313-223-2500",
    website: "https://detroitfoodbank.org",
    type: "food",
    services: ["food distribution", "meal programs", "nutrition education"],
    hours: "Mon-Fri 8am-4pm",
    accepts_medicaid: false,
    accepts_insurance: false,
    sliding_scale: true,
    lat: 42.3447,
    lng: -83.0086,
    notes: "Serves 12+ partner food pantries"
  },

  // ========== OAKLAND COUNTY ==========
  {
    id: "oakland_001",
    name: "Pontiac Community Health Center",
    county: "oakland",
    county_code: "071",
    city: "Pontiac",
    address: "680 Martin Luther King Ave, Pontiac, MI 48341",
    phone: "248-857-0300",
    type: "clinic",
    services: ["primary care", "pediatrics", "obstetrics", "mental health"],
    hours: "Mon-Fri 8am-5pm, Sat 9am-1pm",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: true,
    lat: 42.6354,
    lng: -83.2915,
    notes: "Serving Pontiac area for 40+ years"
  },
  {
    id: "oakland_002",
    name: "Beaumont Hospital - Royal Oak",
    county: "oakland",
    county_code: "071",
    city: "Royal Oak",
    address: "3601 W 13 Mile Rd, Royal Oak, MI 48073",
    phone: "248-898-2000",
    website: "https://www.beaumonthospitals.com",
    type: "hospital",
    services: ["emergency", "surgery", "cardiology", "orthopedics"],
    hours: "24/7",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: false,
    lat: 42.4914,
    lng: -83.1487
  },
  {
    id: "oakland_003",
    name: "Oakland County Housing Services",
    county: "oakland",
    county_code: "071",
    city: "Pontiac",
    address: "2100 Pontiac Lake Rd, Pontiac, MI 48341",
    phone: "248-858-1200",
    type: "housing",
    services: ["public housing", "rental assistance", "homeless prevention"],
    hours: "Mon-Fri 8am-4:30pm",
    accepts_medicaid: false,
    accepts_insurance: false,
    sliding_scale: true,
    lat: 42.6589,
    lng: -83.2998
  },

  // ========== GENESEE COUNTY (Flint area) ==========
  {
    id: "genesee_001",
    name: "Flint Health Department - Primary Care",
    county: "genesee",
    county_code: "037",
    city: "Flint",
    address: "410 W 5th Ave, Flint, MI 48503",
    phone: "810-257-3156",
    type: "clinic",
    services: ["primary care", "women's health", "preventive care", "water testing"],
    hours: "Mon-Fri 8am-5pm",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: true,
    lat: 42.7118,
    lng: -83.6915,
    notes: "Also offers water testing related to lead concerns"
  },
  {
    id: "genesee_002",
    name: "Hurley Medical Center",
    county: "genesee",
    county_code: "037",
    city: "Flint",
    address: "One Hurley Plaza, Flint, MI 48503",
    phone: "810-262-9000",
    website: "https://www.hurleymc.com",
    type: "hospital",
    services: ["emergency", "trauma center", "maternity", "ICU"],
    hours: "24/7",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: false,
    lat: 42.7192,
    lng: -83.6803
  },

  // ========== KING (formerly Ingham) COUNTY - Lansing ==========
  {
    id: "ingham_001",
    name: "Lansing Community Health Center",
    county: "ingham",
    county_code: "065",
    city: "Lansing",
    address: "901 N Washington Ave, Lansing, MI 48906",
    phone: "517-372-0100",
    type: "clinic",
    services: ["primary care", "dental", "mental health", "health education"],
    hours: "Mon-Fri 8am-5:30pm, Sat 9am-1pm",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: true,
    lat: 42.7292,
    lng: -84.5555
  },
  {
    id: "ingham_002",
    name: "Sparrow Hospital",
    county: "ingham",
    county_code: "065",
    city: "Lansing",
    address: "1215 E Michigan Ave, Lansing, MI 48912",
    phone: "517-364-1000",
    website: "https://www.sparrow.org",
    type: "hospital",
    services: ["emergency", "Level 1 trauma", "specialty care"],
    hours: "24/7",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: false,
    lat: 42.7268,
    lng: -84.5326
  },

  // ========== KENT COUNTY (Grand Rapids) ==========
  {
    id: "kent_001",
    name: "Pine Rest Christian Mental Health Services",
    county: "kent",
    county_code: "081",
    city: "Grand Rapids",
    address: "300 68th St SW, Byron Center, MI 49315",
    phone: "616-281-7500",
    website: "https://pinerest.org",
    type: "mental_health",
    services: ["inpatient psychiatric", "outpatient counseling", "substance abuse", "telehealth"],
    hours: "24/7",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: true,
    lat: 42.7908,
    lng: -85.4339,
    notes: "Largest behavioral health provider in West Michigan"
  },
  {
    id: "kent_002",
    name: "Spectrum Health Grand Rapids",
    county: "kent",
    county_code: "081",
    city: "Grand Rapids",
    address: "100 Michigan St NE, Grand Rapids, MI 49503",
    phone: "616-391-1774",
    website: "https://www.spectrumhealth.org",
    type: "hospital",
    services: ["emergency", "trauma", "surgery", "specialty care"],
    hours: "24/7",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: false,
    lat: 42.9632,
    lng: -85.6789
  },

  // ========== MACOMB COUNTY ==========
  {
    id: "macomb_001",
    name: "Mount Clemens Community Health Center",
    county: "macomb",
    county_code: "099",
    city: "Mount Clemens",
    address: "50 Crocker Blvd, Mount Clemens, MI 48043",
    phone: "586-465-4600",
    type: "clinic",
    services: ["primary care", "pediatrics", "family medicine"],
    hours: "Mon-Fri 8am-5pm",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: true,
    lat: 42.5889,
    lng: -82.8689
  },

  // ========== WASHTENAW COUNTY (Ann Arbor) ==========
  {
    id: "washtenaw_001",
    name: "University of Michigan Health - Family Medicine",
    county: "washtenaw",
    county_code: "161",
    city: "Ann Arbor",
    address: "1500 E Medical Center Dr, Ann Arbor, MI 48109",
    phone: "734-936-4000",
    website: "https://www.uofmhealth.org",
    type: "clinic",
    services: ["primary care", "pediatrics", "internal medicine", "women's health"],
    hours: "Mon-Fri 8am-5pm",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: true,
    lat: 42.2331,
    lng: -83.7400,
    notes: "Part of University of Michigan Health System"
  },
  {
    id: "washtenaw_002",
    name: "Washtenaw County Community Mental Health",
    county: "washtenaw",
    county_code: "161",
    city: "Ypsilanti",
    address: "555 Tronc, Ypsilanti, MI 48198",
    phone: "734-485-1234",
    type: "mental_health",
    services: ["outpatient counseling", "case management", "crisis services"],
    hours: "Mon-Fri 8am-5pm",
    accepts_medicaid: true,
    accepts_insurance: true,
    sliding_scale: true,
    lat: 42.2459,
    lng: -83.4778
  },

  // ========== COUNTY LINES / STATEWIDE PROGRAMS ==========
  {
    id: "state_001",
    name: "Michigan Department of Health & Human Services - SNAP",
    county: "statewide",
    county_code: "000",
    city: "Lansing",
    address: "Lewis Cass Building, 6th Floor, 320 S Walnut St, Lansing, MI 48913",
    phone: "1-855-275-6424",
    website: "https://www.michigan.gov/mdhhs",
    type: "financial",
    services: ["SNAP enrollment", "benefits counseling", "emergency assistance"],
    hours: "Mon-Fri 8am-5pm",
    accepts_medicaid: false,
    accepts_insurance: false,
    sliding_scale: false,
    lat: 42.7334,
    lng: -84.5467,
    notes: "State office for food assistance programs"
  },
  {
    id: "state_002",
    name: "Michigan 211",
    county: "statewide",
    county_code: "000",
    city: "Statewide",
    address: "Online/Phone",
    phone: "211",
    website: "https://www.michigan211.org",
    type: "financial",
    services: ["resource referral", "crisis support", "community services"],
    hours: "24/7",
    accepts_medicaid: false,
    accepts_insurance: false,
    sliding_scale: false,
    lat: 42.7534,
    lng: -84.5535,
    notes: "Dial 211 or text ZIP code to 898-211 for resources"
  },
  {
    id: "state_003",
    name: "Michigan Legal Help",
    county: "statewide",
    county_code: "000",
    city: "Statewide",
    address: "Online Resource",
    phone: "1-888-783-8190",
    website: "https://www.michiganlegalhelp.org",
    type: "legal",
    services: ["legal information", "self-help forms", "provider directory"],
    hours: "24/7 online",
    accepts_medicaid: false,
    accepts_insurance: false,
    sliding_scale: true,
    lat: 42.7534,
    lng: -84.5535,
    notes: "Free legal information and self-help tools"
  },
];

// Helper function to get facilities by county
export function getFacilitiesByCounty(county: string): Facility[] {
  return mockFacilities.filter(
    (f) => f.county.toLowerCase() === county.toLowerCase()
  );
}

// Helper function to get facilities by type
export function getFacilitiesByType(
  type: Facility["type"]
): Facility[] {
  return mockFacilities.filter((f) => f.type === type);
}

// Helper function to search facilities
export function searchFacilities(
  query: string,
  county?: string
): Facility[] {
  const lowerQuery = query.toLowerCase();
  return mockFacilities.filter((f) => {
    const matchesQuery =
      f.name.toLowerCase().includes(lowerQuery) ||
      f.city.toLowerCase().includes(lowerQuery) ||
      f.services.some((s) => s.toLowerCase().includes(lowerQuery));

    const matchesCounty = !county || f.county.toLowerCase() === county.toLowerCase();

    return matchesQuery && matchesCounty;
  });
}

// Helper function to get distance (simplified)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
