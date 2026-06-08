import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Navigation, Loader2, X, Heart, Apple, Bus, Home, Shield,
  GraduationCap, Phone, ExternalLink, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { haversineDistance } from "@/utils/haversine";
import { toast } from "sonner";

interface GeoResource {
  id: string;
  name: string;
  type: string;
  category: string;
  lat: number;
  lng: number;
  address?: string;
  city: string;
  county: string;
  phone?: string;
  website?: string;
  distance?: number;
  isFree?: boolean;
  source: "resource" | "facility";
}

const CATEGORIES = [
  { value: "all", label: "All Services", icon: Search },
  { value: "health", label: "Health & Clinics", icon: Heart },
  { value: "food", label: "Food & Nutrition", icon: Apple },
  { value: "housing", label: "Housing & Shelter", icon: Home },
  { value: "transport", label: "Transportation", icon: Bus },
  { value: "safety", label: "Safety & Legal", icon: Shield },
  { value: "education", label: "Education", icon: GraduationCap },
];

function mapResourceType(type: string): string {
  const map: Record<string, string> = {
    hospital: "health", fqhc: "health", urgent_care: "health", specialty: "health",
    behavioral_health: "health", mental_health: "health", health_services: "health",
    health_insurance: "health", substance_abuse: "health",
    food: "food", food_nutrition: "food",
    housing: "housing", housing_shelter: "housing", domestic_violence: "housing",
    transportation: "transport",
    education: "education", youth_family: "education",
    veterans_seniors: "safety", environment: "safety", disaster_prep: "safety",
    information_referral: "safety", employment: "safety",
  };
  return map[type] || "health";
}

export default function NearbyResourceFinder() {
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState("5");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeoResource[]>([]);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const geocodeAndSearch = useCallback(async (lat?: number, lng?: number) => {
    setLoading(true);
    setSearched(true);

    try {
      let searchLat = lat;
      let searchLng = lng;

      if (!searchLat || !searchLng) {
        // Geocode address via Nominatim
        const q = encodeURIComponent(address.trim() + ", Michigan, USA");
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=us`,
          { headers: { "User-Agent": "AccessMichigan/1.0 (civic resource tool)" } }
        );
        const data = await resp.json();
        if (!data.length) {
          toast.error("Address not found. Try a more specific Michigan address.");
          setLoading(false);
          return;
        }
        searchLat = parseFloat(data[0].lat);
        searchLng = parseFloat(data[0].lon);
      }

      setUserCoords({ lat: searchLat!, lng: searchLng! });

      // Fetch resources & facilities with coords in parallel
      const [resResources, resFacilities] = await Promise.all([
        supabase
          .from("community_resources")
          .select("id, resource_name, resource_type, latitude, longitude, address, city, county, phone, website, is_free")
          .eq("is_active", true)
          .not("latitude", "is", null),
        supabase
          .from("facilities")
          .select("id, name, facility_type, latitude, longitude, address, city, county, phone, website")
      ]);

      const resources: GeoResource[] = [];
      const radiusMiles = parseInt(radius);

      // Process community resources
      (resResources.data || []).forEach((r) => {
        const dist = haversineDistance(searchLat!, searchLng!, r.latitude!, r.longitude!);
        if (dist <= radiusMiles) {
          resources.push({
            id: r.id, name: r.resource_name, type: r.resource_type,
            category: mapResourceType(r.resource_type),
            lat: r.latitude!, lng: r.longitude!,
            address: r.address || undefined, city: r.city, county: r.county,
            phone: r.phone || undefined, website: r.website || undefined,
            distance: Math.round(dist * 10) / 10, isFree: r.is_free || false,
            source: "resource",
          });
        }
      });

      // Process facilities
      (resFacilities.data || []).forEach((f) => {
        const dist = haversineDistance(searchLat!, searchLng!, f.latitude, f.longitude);
        if (dist <= radiusMiles) {
          resources.push({
            id: f.id, name: f.name, type: f.facility_type,
            category: mapResourceType(f.facility_type),
            lat: f.latitude, lng: f.longitude,
            address: f.address || undefined, city: f.city, county: f.county,
            phone: f.phone || undefined, website: f.website || undefined,
            distance: Math.round(dist * 10) / 10, isFree: false,
            source: "facility",
          });
        }
      });

      // Sort by distance
      resources.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setResults(resources);

      if (resources.length === 0) {
        toast.info(`No services found within ${radiusMiles} miles. Try a larger radius.`);
      } else {
        toast.success(`Found ${resources.length} services nearby!`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [address, radius]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please enter an address or city.");
      return;
    }
    geocodeAndSearch();
  };

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddress("📍 Your current location");
        geocodeAndSearch(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        toast.error("Location access denied. You can type an address instead.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [geocodeAndSearch]);

  const filtered = useMemo(() => {
    if (category === "all") return results;
    return results.filter((r) => r.category === category);
  }, [results, category]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    return counts;
  }, [results]);

  const displayResults = expanded ? filtered : filtered.slice(0, 6);

  const CatIcon = CATEGORIES.find((c) => c.value === category)?.icon || Search;

  return (
    <section id="nearby-finder" className="py-12 md:py-16" aria-label="Find nearby services">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            <MapPin className="h-3.5 w-3.5" />
            Location-Based Discovery
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Find Services Near Your Address
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
            Enter a specific Michigan address to get distance-sorted results - this tool calculates actual proximity, unlike the keyword search above.
            <span className="font-medium text-primary"> 100% private - no data stored.</span>
          </p>
          <p className="text-[10px] text-muted-foreground max-w-md mx-auto mt-1">
            This is not a 911 service. Call 911 for emergencies. Check with providers directly to confirm hours and eligibility.
          </p>
        </div>

        {/* Search Form */}
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <input
                    ref={inputRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address, city, or zip code..."
                    className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-label="Enter a Michigan address to find nearby services"
                  />
                  {address && (
                    <button
                      type="button"
                      onClick={() => { setAddress(""); setSearched(false); setResults([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear address"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="w-full sm:w-32" aria-label="Search radius">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 mile</SelectItem>
                    <SelectItem value="3">3 miles</SelectItem>
                    <SelectItem value="5">5 miles</SelectItem>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={loading || !address.trim()} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUseLocation}
                  disabled={loading}
                  className="gap-1.5 text-xs text-primary hover:text-primary"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Use my location
                </Button>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Info className="h-3 w-3" />
                  <span>Voluntary opt-in · No data stored · Browser-only</span>
                </div>
              </div>
            </form>

            {/* Category Filters */}
            <AnimatePresence>
              {searched && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 flex flex-wrap gap-1.5"
                >
                  {CATEGORIES.map((cat) => {
                    const count = cat.value === "all" ? results.length : (categoryCounts[cat.value] || 0);
                    if (cat.value !== "all" && count === 0) return null;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          category === cat.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <cat.icon className="h-3 w-3" />
                        {cat.label}
                        <span className="ml-0.5 text-[10px] opacity-80">({count})</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Results */}
        <AnimatePresence mode="wait">
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 space-y-3"
              role="region"
              aria-label={`${filtered.length} nearby services found`}
              aria-live="polite"
            >
              {filtered.length === 0 && !loading && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No {category !== "all" ? CATEGORIES.find(c => c.value === category)?.label.toLowerCase() : "services"} found within {radius} miles.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setRadius("25")}>
                      Expand to 25 miles
                    </Button>
                  </CardContent>
                </Card>
              )}

              {displayResults.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-foreground truncate">{r.name}</h3>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {r.type.replace(/_/g, " ")}
                            </Badge>
                            {r.isFree && (
                              <Badge variant="secondary" className="text-[10px]">
                                Free
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            {r.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                {r.address}, {r.city}
                              </span>
                            )}
                            <span className="font-medium text-primary">{r.county} County</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {r.phone && (
                              <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                <Phone className="h-3 w-3" /> {r.phone}
                              </a>
                            )}
                            {r.website && (
                              <a href={r.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                <ExternalLink className="h-3 w-3" /> Website
                              </a>
                            )}
                            {r.address && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address + ", " + r.city + ", MI")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <Navigation className="h-3 w-3" /> Directions
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-lg font-bold text-primary">{r.distance}</span>
                          <span className="text-[10px] text-muted-foreground">miles</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filtered.length > 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
                  ) : (
                    <>Show All {filtered.length} Results <ChevronDown className="h-3.5 w-3.5" /></>
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
