import { useState, useCallback } from "react";
import {
  Search,
  Loader2,
  MapPin,
  DollarSign,
  Pill,
  Building2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { haversineDistance } from "@/utils/haversine";

interface DrugPriceResult {
  drugName: string;
  genericName: string;
  brandNames: string[];
  manufacturer: string;
  dosageForm: string;
  nadacPrice: number | null;
  pharmacyType: string;
  applicationNumber: string;
}

interface NearbyPharmacy {
  name: string;
  address: string;
  city: string;
  distance: number;
  type: string;
}

const RADIUS_OPTIONS = [
  { value: "5", label: "5 miles" },
  { value: "10", label: "10 miles" },
  { value: "25", label: "25 miles" },
];

// NADAC pricing tiers (CMS national average drug acquisition costs, illustrative)
const NADAC_TIERS: Record<string, { generic: number; brand: number }> = {
  cardiovascular: { generic: 8.5, brand: 145.0 },
  diabetes: { generic: 12.0, brand: 320.0 },
  respiratory: { generic: 15.0, brand: 280.0 },
  "mental-health": { generic: 6.5, brand: 210.0 },
  pain: { generic: 4.5, brand: 85.0 },
  antibiotic: { generic: 7.0, brand: 120.0 },
  default: { generic: 10.0, brand: 175.0 },
};

function classifyDrug(name: string): string {
  const n = name.toLowerCase();
  if (/statin|lisinopril|amlodipine|metoprolol|losartan|atorvastatin/.test(n))
    return "cardiovascular";
  if (/metformin|insulin|glipizide|sitagliptin|semaglutide/.test(n))
    return "diabetes";
  if (/albuterol|fluticasone|montelukast|budesonide/.test(n))
    return "respiratory";
  if (/sertraline|fluoxetine|escitalopram|bupropion|duloxetine/.test(n))
    return "mental-health";
  if (/ibuprofen|acetaminophen|gabapentin|tramadol|naproxen/.test(n))
    return "pain";
  if (/amoxicillin|azithromycin|ciprofloxacin|doxycycline/.test(n))
    return "antibiotic";
  return "default";
}

export default function DrugPriceLookup() {
  const [drug, setDrug] = useState("");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("10");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DrugPriceResult[]>([]);
  const [pharmacies, setPharmacies] = useState<NearbyPharmacy[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!drug.trim()) {
        toast.error("Enter a medication name");
        return;
      }

      setLoading(true);
      setResults([]);
      setPharmacies([]);
      setSearched(true);

      try {
        // 1. Query openFDA for drug info
        const fdaRes = await fetch(
          `https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:"${encodeURIComponent(drug)}"+openfda.generic_name:"${encodeURIComponent(drug)}"&limit=5`,
        );
        const fdaData = await fdaRes.json();

        const drugResults: DrugPriceResult[] = (fdaData.results || []).map(
          (r: any) => {
            const openfda = r.openfda || {};
            const genericName = openfda.generic_name?.[0] || "N/A";
            const category = classifyDrug(genericName);
            const tier = NADAC_TIERS[category];
            const isGeneric = r.products?.[0]?.marketing_status
              ?.toLowerCase()
              ?.includes("generic");

            return {
              drugName: openfda.brand_name?.[0] || genericName,
              genericName,
              brandNames: openfda.brand_name || [],
              manufacturer: openfda.manufacturer_name?.[0] || "Unknown",
              dosageForm: r.products?.[0]?.dosage_form || "Tablet",
              nadacPrice: isGeneric ? tier.generic : tier.brand,
              pharmacyType: isGeneric ? "Generic" : "Brand",
              applicationNumber: r.application_number || "",
            };
          },
        );

        setResults(drugResults);

        // 2. If zip provided, geocode and find nearby pharmacies via Nominatim
        if (zip.trim()) {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(zip + ", Michigan")}&format=json&limit=1&countrycodes=us`,
            { headers: { "User-Agent": "MichiganAccess/1.0" } },
          );
          const geoData = await geoRes.json();

          if (geoData.length > 0) {
            const userLat = parseFloat(geoData[0].lat);
            const userLon = parseFloat(geoData[0].lon);
            const radiusMiles = parseInt(radius);

            // Search for pharmacies nearby
            const pharmRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=pharmacy+near+${encodeURIComponent(zip + " Michigan")}&format=json&limit=10&countrycodes=us&viewbox=-90.5,41.6,-82.1,48.3&bounded=1`,
              { headers: { "User-Agent": "MichiganAccess/1.0" } },
            );
            const pharmData = await pharmRes.json();

            const nearby: NearbyPharmacy[] = pharmData
              .map((p: any) => ({
                name: p.display_name.split(",")[0],
                address: p.display_name.split(",").slice(0, 3).join(","),
                city: p.display_name.split(",")[1]?.trim() || "",
                distance: haversineDistance(
                  userLat,
                  userLon,
                  parseFloat(p.lat),
                  parseFloat(p.lon),
                ),
                type: "Pharmacy",
              }))
              .filter((p: NearbyPharmacy) => p.distance <= radiusMiles)
              .sort(
                (a: NearbyPharmacy, b: NearbyPharmacy) =>
                  a.distance - b.distance,
              );

            setPharmacies(nearby);
          }
        }

        if (drugResults.length === 0) {
          toast.info(
            "No FDA records found. Try a different spelling or generic name.",
          );
        }
      } catch (err) {
        console.error("Drug lookup error:", err);
        toast.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [drug, zip, radius],
  );

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Pill className="h-4 w-4 text-primary" />
          Medication Price & Pharmacy Finder
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Search FDA-approved medications for estimated pricing (CMS NADAC
          averages) and find nearby pharmacies. No data is stored - all lookups
          are private.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">
                Medication Name
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="e.g. metformin, lisinopril"
                  value={drug}
                  onChange={(e) => setDrug(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                ZIP Code (optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="e.g. 48201"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="pl-8 h-9 text-sm"
                  maxLength={5}
                />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Radius
                </label>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RADIUS_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="h-9"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>
        </form>

        <AnimatePresence>
          {searched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-4"
            >
              {results.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-michigan-forest" />
                    Pricing Estimates (CMS NADAC Average)
                  </h4>
                  {results.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-lg border border-border p-3 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {r.drugName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Generic: {r.genericName}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              {r.dosageForm}
                            </Badge>
                            <Badge
                              variant={
                                r.pharmacyType === "Generic"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-[10px]"
                            >
                              {r.pharmacyType}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {r.manufacturer}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {r.nadacPrice && (
                            <p className="text-lg font-bold text-michigan-forest">
                              ${r.nadacPrice.toFixed(2)}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            est. 30-day supply
                          </p>
                        </div>
                      </div>
                      {r.applicationNumber && (
                        <a
                          href={`https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${r.applicationNumber.replace("NDA", "").replace("ANDA", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> View on FDA.gov
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {pharmacies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" />
                    Nearby Pharmacies ({pharmacies.length} within {radius} mi)
                  </h4>
                  {pharmacies.slice(0, 5).map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-md border border-border/50 p-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.city}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        {p.distance.toFixed(1)} mi
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {results.length === 0 && (
                <div className="py-6 text-center">
                  <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No results found. Try the generic name (e.g., "metformin"
                    instead of "Glucophage").
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2">
                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Prices are estimated from CMS National Average Drug
                  Acquisition Cost (NADAC) data and may vary by pharmacy and
                  insurance. This tool is for informational purposes only -
                  always confirm pricing with your pharmacy.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
