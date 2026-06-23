import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  ExternalLink,
  Clock,
  Search,
  Pill,
  Shield,
  ChevronDown,
  ChevronUp,
  Download,
  AlertTriangle,
  List,
  Map,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCounty } from "@/contexts/CountyContext";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

interface NarcanLocation {
  name: string;
  type: "pharmacy" | "health_dept" | "community" | "hospital";
  address: string;
  city: string;
  county: string;
  phone?: string;
  website?: string;
  hours?: string;
  hasNarcan: boolean;
  hasFitKits: boolean;
  isFree: boolean;
  training: boolean;
  lat: number;
  lng: number;
}

// Michigan standing order naloxone distribution points - curated dataset
const NARCAN_LOCATIONS: NarcanLocation[] = [
  {
    name: "CVS Pharmacy - Detroit",
    type: "pharmacy",
    address: "2401 W Grand Blvd",
    city: "Detroit",
    county: "Wayne",
    phone: "313-895-1052",
    hours: "8 AM–10 PM",
    hasNarcan: true,
    hasFitKits: false,
    isFree: false,
    training: false,
    lat: 42.368,
    lng: -83.093,
  },
  {
    name: "Walgreens - Detroit Midtown",
    type: "pharmacy",
    address: "6501 Woodward Ave",
    city: "Detroit",
    county: "Wayne",
    phone: "313-871-0320",
    hours: "8 AM–10 PM",
    hasNarcan: true,
    hasFitKits: false,
    isFree: false,
    training: false,
    lat: 42.364,
    lng: -83.072,
  },
  {
    name: "Wayne County Health Dept",
    type: "health_dept",
    address: "33030 Van Born Rd",
    city: "Wayne",
    county: "Wayne",
    phone: "734-727-7000",
    website: "https://www.waynecounty.com/departments/hhvs/public-health.aspx",
    hours: "Mon–Fri 8 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.28,
    lng: -83.387,
  },
  {
    name: "Community Health Access - Harm Reduction",
    type: "community",
    address: "3401 E Jefferson Ave",
    city: "Detroit",
    county: "Wayne",
    phone: "313-822-9510",
    hours: "Mon–Fri 9 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.34,
    lng: -83.02,
  },
  {
    name: "Washtenaw County Health Dept",
    type: "health_dept",
    address: "555 Towner St",
    city: "Ypsilanti",
    county: "Washtenaw",
    phone: "734-544-6700",
    website: "https://www.washtenaw.org/839/Public-Health",
    hours: "Mon–Fri 8:30 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.241,
    lng: -83.613,
  },
  {
    name: "CVS Pharmacy - Ann Arbor",
    type: "pharmacy",
    address: "2000 W Stadium Blvd",
    city: "Ann Arbor",
    county: "Washtenaw",
    phone: "734-665-8215",
    hours: "8 AM–10 PM",
    hasNarcan: true,
    hasFitKits: false,
    isFree: false,
    training: false,
    lat: 42.274,
    lng: -83.77,
  },
  {
    name: "Kent County Health Dept",
    type: "health_dept",
    address: "700 Fuller Ave NE",
    city: "Grand Rapids",
    county: "Kent",
    phone: "616-632-7100",
    website: "https://www.accesskent.com/Health/",
    hours: "Mon–Fri 8 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.975,
    lng: -85.651,
  },
  {
    name: "Mel Trotter Ministries",
    type: "community",
    address: "225 Commerce Ave SW",
    city: "Grand Rapids",
    county: "Kent",
    phone: "616-454-8249",
    website: "https://www.meltrotter.org/",
    hours: "24/7",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.96,
    lng: -85.672,
  },
  {
    name: "Rite Aid - Kalamazoo",
    type: "pharmacy",
    address: "501 N Burdick St",
    city: "Kalamazoo",
    county: "Kalamazoo",
    phone: "269-343-3677",
    hours: "9 AM–9 PM",
    hasNarcan: true,
    hasFitKits: false,
    isFree: false,
    training: false,
    lat: 42.297,
    lng: -85.585,
  },
  {
    name: "Kalamazoo County Health Dept",
    type: "health_dept",
    address: "311 E Alcott St",
    city: "Kalamazoo",
    county: "Kalamazoo",
    phone: "269-373-5200",
    website: "https://www.kalcounty.com/hcs/",
    hours: "Mon–Fri 8 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.289,
    lng: -85.579,
  },
  {
    name: "Genesee County Health Dept",
    type: "health_dept",
    address: "630 S Saginaw St, Ste 4",
    city: "Flint",
    county: "Genesee",
    phone: "810-257-3612",
    website: "https://gchd.us/",
    hours: "Mon–Fri 8 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 43.011,
    lng: -83.688,
  },
  {
    name: "Insight Recovery Center",
    type: "community",
    address: "1016 Roe St",
    city: "Flint",
    county: "Genesee",
    phone: "810-232-2090",
    hours: "Mon–Fri 8 AM–6 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 43.019,
    lng: -83.703,
  },
  {
    name: "Ingham County Health Dept",
    type: "health_dept",
    address: "5303 S Cedar St",
    city: "Lansing",
    county: "Ingham",
    phone: "517-887-4311",
    website: "https://hd.ingham.org/",
    hours: "Mon–Fri 8 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.693,
    lng: -84.567,
  },
  {
    name: "Meijer Pharmacy - Lansing",
    type: "pharmacy",
    address: "6200 S Pennsylvania Ave",
    city: "Lansing",
    county: "Ingham",
    phone: "517-887-3939",
    hours: "8 AM–9 PM",
    hasNarcan: true,
    hasFitKits: false,
    isFree: false,
    training: false,
    lat: 42.681,
    lng: -84.553,
  },
  {
    name: "Saginaw County Health Dept",
    type: "health_dept",
    address: "1600 N Michigan Ave",
    city: "Saginaw",
    county: "Saginaw",
    phone: "989-758-3800",
    website: "https://www.saginawcounty.com/health-department/",
    hours: "Mon–Fri 8 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 43.434,
    lng: -83.954,
  },
  {
    name: "Munson Medical Center",
    type: "hospital",
    address: "1105 Sixth St",
    city: "Traverse City",
    county: "Grand Traverse",
    phone: "231-935-5000",
    website: "https://www.munsonhealthcare.org/",
    hours: "24/7 ER",
    hasNarcan: true,
    hasFitKits: false,
    isFree: false,
    training: true,
    lat: 44.762,
    lng: -85.624,
  },
  {
    name: "UP Health System - Marquette",
    type: "hospital",
    address: "580 W College Ave",
    city: "Marquette",
    county: "Marquette",
    phone: "906-449-3000",
    website: "https://www.mghs.org/",
    hours: "24/7 ER",
    hasNarcan: true,
    hasFitKits: false,
    isFree: false,
    training: true,
    lat: 46.547,
    lng: -87.404,
  },
  {
    name: "Marquette County Health Dept",
    type: "health_dept",
    address: "184 US-41 E",
    city: "Negaunee",
    county: "Marquette",
    phone: "906-475-9977",
    hours: "Mon–Fri 8 AM–4:30 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 46.497,
    lng: -87.596,
  },
  {
    name: "Oakland County Health - Narcan Program",
    type: "health_dept",
    address: "1200 N Telegraph Rd",
    city: "Pontiac",
    county: "Oakland",
    phone: "248-858-1280",
    website: "https://www.oakgov.com/health",
    hours: "Mon–Fri 8:30 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.641,
    lng: -83.289,
  },
  {
    name: "Macomb County Health Dept",
    type: "health_dept",
    address: "43525 Elizabeth Rd",
    city: "Mt Clemens",
    county: "Macomb",
    phone: "586-469-5235",
    website: "https://health.macombgov.org/",
    hours: "Mon–Fri 8:30 AM–5 PM",
    hasNarcan: true,
    hasFitKits: true,
    isFree: true,
    training: true,
    lat: 42.601,
    lng: -82.89,
  },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  pharmacy: {
    label: "Pharmacy",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  health_dept: {
    label: "Health Dept",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  community: {
    label: "Community",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  hospital: {
    label: "Hospital",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

const MARKER_COLORS: Record<string, string> = {
  pharmacy: "#3b82f6",
  health_dept: "#10b981",
  community: "#f59e0b",
  hospital: "#8b5cf6",
};

function NarcanMap({ locations }: { locations: NarcanLocation[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      [44.3, -84.6],
      6,
    );
    L.tileLayer(
      "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        crossOrigin: "anonymous",
        maxZoom: 20,
      },
    ).addTo(map);

    locations.forEach((loc) => {
      const color = MARKER_COLORS[loc.type] || "#6b7280";
      const icon = L.divIcon({
        className: "narcan-marker",
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
      const freeTag = loc.isFree
        ? '<span style="color:#059669;font-weight:600">Free Narcan</span> · '
        : "";
      marker.bindPopup(
        `<div style="min-width:180px">
          <strong>${loc.name}</strong><br/>
          <span style="font-size:12px;color:#666">${TYPE_LABELS[loc.type].label} · ${loc.county} County</span><br/>
          <span style="font-size:12px">${freeTag}${loc.address}, ${loc.city}</span>
          ${loc.phone ? `<br/><a href="tel:${loc.phone}" style="font-size:12px">📞 ${loc.phone}</a>` : ""}
          ${loc.hours ? `<br/><span style="font-size:11px;color:#888">🕐 ${loc.hours}</span>` : ""}
          <br/><a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address + ", " + loc.city + ", MI")}" target="_blank" rel="noopener noreferrer" style="font-size:12px">Get Directions →</a>
        </div>`,
      );
    });

    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((l) => [l.lat, l.lng] as [number, number]),
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [locations]);

  return <div ref={containerRef} style={{ height: "450px", width: "100%" }} />;
}

export default function NarcanLocator() {
  const { county: ctxCounty } = useCounty();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countyFilter, setCountyFilter] = useState(ctxCounty || "all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<string>("list");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const counties = useMemo(() => {
    const set = new Set(NARCAN_LOCATIONS.map((l) => l.county));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return NARCAN_LOCATIONS.filter((l) => {
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (countyFilter !== "all" && l.county !== countyFilter) return false;
      if (freeOnly && !l.isFree) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.county.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, typeFilter, countyFilter, freeOnly]);

  const stats = useMemo(
    () => ({
      total: NARCAN_LOCATIONS.length,
      free: NARCAN_LOCATIONS.filter((l) => l.isFree).length,
      training: NARCAN_LOCATIONS.filter((l) => l.training).length,
      counties: new Set(NARCAN_LOCATIONS.map((l) => l.county)).size,
    }),
    [],
  );

  const downloadCSV = () => {
    const headers = [
      "Name",
      "Type",
      "Address",
      "City",
      "County",
      "Phone",
      "Hours",
      "Free Narcan",
      "Fentanyl Test Kits",
      "Training",
    ];
    const rows = filtered.map((l) => [
      l.name,
      TYPE_LABELS[l.type].label,
      l.address,
      l.city,
      l.county,
      l.phone || "",
      l.hours || "",
      l.isFree ? "Yes" : "No",
      l.hasFitKits ? "Yes" : "No",
      l.training ? "Yes" : "No",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "michigan-narcan-locations.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={0}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-michigan-coral/10">
          <Pill className="h-5 w-5 text-michigan-coral-deep" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Naloxone (Narcan) Locator
          </h2>
          <p className="text-sm text-muted-foreground">
            Find free and retail naloxone near you - Michigan's standing order
            allows purchase without a prescription
          </p>
        </div>
      </div>

      {/* Important info banner */}
      <Card className="border-michigan-coral/20 bg-michigan-coral/5">
        <CardContent className="py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-michigan-coral-deep mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Michigan Standing Order:</strong> Under Michigan law,
              naloxone (Narcan) is available at any pharmacy without a personal
              prescription. Many health departments and community organizations
              distribute it <strong>free of charge</strong> with training.
              <a
                href="https://www.michigan.gov/opioids"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline inline-flex items-center gap-0.5"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Locations", value: stats.total, icon: MapPin },
          { label: "Free Narcan Sites", value: stats.free, icon: Shield },
          { label: "Training Available", value: stats.training, icon: Pill },
          { label: "Counties Covered", value: stats.counties, icon: MapPin },
        ].map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} custom={i + 1}>
            <Card>
              <CardContent className="py-3 text-center">
                <s.icon className="h-4 w-4 mx-auto mb-1 text-michigan-teal-deep" />
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or county..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={countyFilter} onValueChange={setCountyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="County" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {counties.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="health_dept">Health Dept</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={freeOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setFreeOnly(!freeOnly)}
              className="gap-1"
            >
              <Shield className="h-3.5 w-3.5" />
              Free Only
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} locations found
          </p>
          <div className="flex items-center gap-2">
            <TabsList className="h-8">
              <TabsTrigger value="list" className="text-xs gap-1 px-2.5">
                <List className="h-3.5 w-3.5" />
                List
              </TabsTrigger>
              <TabsTrigger value="map" className="text-xs gap-1 px-2.5">
                <Map className="h-3.5 w-3.5" />
                Map
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              className="gap-1 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="mt-3">
          <div className="space-y-2">
            {filtered.map((loc, i) => {
              const isExpanded = expanded === loc.name;
              const typeStyle = TYPE_LABELS[loc.type];
              return (
                <motion.div
                  key={loc.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
                >
                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : loc.name)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-michigan-teal/10 flex-shrink-0 mt-0.5">
                          <Pill className="h-4 w-4 text-michigan-teal-deep" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-foreground text-sm">
                              {loc.name}
                            </h3>
                            <Badge
                              className={`text-[10px] border-0 ${typeStyle.color}`}
                            >
                              {typeStyle.label}
                            </Badge>
                            {loc.isFree && (
                              <Badge className="bg-michigan-forest/10 text-michigan-forest-deep border-michigan-forest/20 text-[10px]">
                                Free
                              </Badge>
                            )}
                            {loc.training && (
                              <Badge variant="outline" className="text-[10px]">
                                Training
                              </Badge>
                            )}
                            {loc.hasFitKits && (
                              <Badge variant="outline" className="text-[10px]">
                                Test Kits
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {loc.address}, {loc.city}
                            </span>
                            <span>{loc.county} County</span>
                            {loc.hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {loc.hours}
                              </span>
                            )}
                          </div>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2"
                            >
                              {loc.phone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="gap-1 text-xs"
                                >
                                  <a href={`tel:${loc.phone}`}>
                                    <Phone className="h-3 w-3" />
                                    {loc.phone}
                                  </a>
                                </Button>
                              )}
                              {loc.website && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="gap-1 text-xs"
                                >
                                  <a
                                    href={loc.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Website
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="gap-1 text-xs"
                              >
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address + ", " + loc.city + ", MI")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <MapPin className="h-3 w-3" />
                                  Directions
                                </a>
                              </Button>
                            </motion.div>
                          )}
                        </div>
                        <button
                          className="text-muted-foreground"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Pill className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No locations found. Try adjusting your filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-3">
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              <NarcanMap locations={filtered} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-border/50 bg-muted/30">
        <CardContent className="py-3 space-y-1.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <Shield className="inline h-3.5 w-3.5 mr-1 text-primary" />
            <strong>This is not a 911 service.</strong> Call 911 for
            emergencies. This list shows naloxone distribution points from our
            curated database and is not exhaustive of all options in Michigan.
            Call ahead to confirm availability, hours, and eligibility.
          </p>
          <p className="text-[10px] text-muted-foreground">
            Sources: Michigan DHHS Standing Order, county health departments,
            pharmacy chains. Michigan's Good Samaritan Law protects callers from
            prosecution.
          </p>
        </CardContent>
      </Card>
    </motion.section>
  );
}
