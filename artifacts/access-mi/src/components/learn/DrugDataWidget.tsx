import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Search, Calendar, Shield, ExternalLink, AlertCircle, ChevronDown, ChevronUp, Loader2, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface DrugResult {
  brand_name: string;
  generic_name: string;
  manufacturer_name: string;
  product_type: string;
  route: string;
  substance_name: string;
  pharm_class: string[];
  marketing_start_date: string;
  listing_expiration_date: string;
  application_number: string;
}

const THERAPY_AREAS = [
  { value: "all", label: "All Therapy Areas" },
  { value: "cardiovascular", label: "Cardiovascular" },
  { value: "oncology", label: "Oncology" },
  { value: "neurology", label: "Neurology" },
  { value: "diabetes", label: "Diabetes & Metabolic" },
  { value: "respiratory", label: "Respiratory" },
  { value: "infectious", label: "Infectious Disease" },
  { value: "mental_health", label: "Mental Health" },
  { value: "pain", label: "Pain Management" },
];

const THERAPY_KEYWORDS: Record<string, string[]> = {
  cardiovascular: ["cardiovascular", "antihypertensive", "statin", "anticoagulant", "beta-blocker", "ACE inhibitor", "heart"],
  oncology: ["antineoplastic", "cancer", "oncology", "chemotherapy", "kinase inhibitor"],
  neurology: ["neurological", "anticonvulsant", "antiepileptic", "dopamine", "neuromuscular"],
  diabetes: ["antidiabetic", "insulin", "metformin", "glucose", "metabolic"],
  respiratory: ["bronchodilator", "respiratory", "asthma", "COPD", "corticosteroid"],
  infectious: ["antibiotic", "antiviral", "antifungal", "antimicrobial", "anti-infective"],
  mental_health: ["antidepressant", "antipsychotic", "anxiolytic", "SSRI", "serotonin", "psychiatric"],
  pain: ["analgesic", "anti-inflammatory", "NSAID", "opioid", "pain"],
};

function formatFdaDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 8) return "N/A";
  return `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}/${dateStr.slice(0, 4)}`;
}

function getTimelineStatus(startDate: string, expDate: string): { label: string; color: string } {
  if (!expDate || expDate.length < 8) return { label: "Active", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
  const exp = new Date(`${expDate.slice(0, 4)}-${expDate.slice(4, 6)}-${expDate.slice(6, 8)}`);
  const now = new Date();
  const monthsLeft = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsLeft < 0) return { label: "Expired", color: "bg-destructive/10 text-destructive" };
  if (monthsLeft < 12) return { label: "Expiring Soon", color: "bg-michigan-gold/20 text-michigan-gold" };
  return { label: "Active", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
}

export default function DrugDataWidget() {
  const [query, setQuery] = useState("");
  const [therapyArea, setTherapyArea] = useState("all");
  const [results, setResults] = useState<DrugResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() && therapyArea === "all") {
      toast.error("Enter a drug name or select a therapy area");
      return;
    }
    setLoading(true);
    setSearched(true);

    try {
      const searchTerms: string[] = [];
      if (query.trim()) {
        const q = encodeURIComponent(query.trim());
        searchTerms.push(`(openfda.brand_name:"${q}"+openfda.generic_name:"${q}")`);
      }
      if (therapyArea !== "all") {
        const keywords = THERAPY_KEYWORDS[therapyArea];
        if (keywords?.length) {
          searchTerms.push(`(openfda.pharm_class_epc:"${encodeURIComponent(keywords[0])}")`);
        }
      }

      const searchStr = searchTerms.join("+AND+");
      const url = `https://api.fda.gov/drug/drugsfda.json?search=${searchStr}&limit=20`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`FDA API returned ${res.status}`);
      const data = await res.json();

      const mapped: DrugResult[] = (data.results || []).map((r: any) => {
        const product = r.products?.[0] || {};
        const activeIngredients = product.active_ingredients || [];
        return {
          brand_name: product.brand_name || r.sponsor_name || "Unknown",
          generic_name: activeIngredients.map((a: any) => a.name).join(", ") || "N/A",
          manufacturer_name: r.sponsor_name || "N/A",
          product_type: product.dosage_form || "N/A",
          route: product.route || "N/A",
          substance_name: activeIngredients.map((a: any) => a.name).join(", ") || "N/A",
          pharm_class: r.openfda?.pharm_class_epc || [],
          marketing_start_date: product.marketing_status_date || r.submissions?.[0]?.submission_status_date || "",
          listing_expiration_date: "",
          application_number: r.application_number || "N/A",
        };
      });

      setResults(mapped);
      if (mapped.length === 0) toast.info("No results found. Try a different search term.");
    } catch (err) {
      console.error("FDA API error:", err);
      toast.error("Unable to fetch drug data. Try again later.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-michigan-blue/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          Drug & Medication Explorer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search FDA-approved drugs by name or therapy area. Data sourced live from{" "}
          <a href="https://open.fda.gov" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
            openFDA
          </a>.
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by drug name (e.g., Metformin, Lipitor)…"
              className="pl-9"
              aria-label="Drug name search"
            />
          </div>
          <Select value={therapyArea} onValueChange={setTherapyArea}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Therapy Area" />
            </SelectTrigger>
            <SelectContent>
              {THERAPY_AREAS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading} className="bg-gradient-michigan hover:opacity-90 gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>No personal data collected · Browser-only · For informational purposes only</span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loading && searched && results.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found. Try a different drug name or therapy area.</p>
            </motion.div>
          )}

          {!loading && results.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
              {results.map((drug, i) => {
                const timeline = getTimelineStatus(drug.marketing_start_date, drug.listing_expiration_date);
                const isExpanded = expanded === drug.application_number + i;
                return (
                  <motion.div
                    key={drug.application_number + i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setExpanded(isExpanded ? null : drug.application_number + i)}
                      className="w-full text-left p-4 flex items-start justify-between gap-3"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                          <h3 className="font-semibold text-sm text-foreground truncate">{drug.brand_name}</h3>
                          <Badge variant="outline" className={`text-[10px] ${timeline.color}`}>{timeline.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {drug.generic_name} · {drug.manufacturer_name}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Separator />
                          <div className="p-4 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="font-medium text-muted-foreground">Generic Name</span>
                              <p className="text-foreground">{drug.generic_name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Dosage Form</span>
                              <p className="text-foreground">{drug.product_type}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Route</span>
                              <p className="text-foreground">{drug.route}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Application #</span>
                              <p className="text-foreground">{drug.application_number}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Approval Date</span>
                              <p className="text-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatFdaDate(drug.marketing_start_date)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Manufacturer</span>
                              <p className="text-foreground">{drug.manufacturer_name}</p>
                            </div>
                            {drug.pharm_class.length > 0 && (
                              <div className="col-span-2">
                                <span className="font-medium text-muted-foreground">Pharmacologic Class</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {drug.pharm_class.map((c, j) => (
                                    <Badge key={j} variant="secondary" className="text-[10px]">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="col-span-2 pt-2">
                              <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                                <a
                                  href={`https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${drug.application_number.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  View on FDA.gov
                                </a>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {!searched && !loading && (
          <div className="text-center py-8 text-muted-foreground space-y-2">
            <FlaskConical className="h-10 w-10 mx-auto opacity-30" />
            <p className="text-sm">Search for FDA-approved drugs by name or browse by therapy area.</p>
            <p className="text-xs">Data from <a href="https://open.fda.gov/" target="_blank" rel="noopener" className="text-primary hover:underline">openFDA</a> · This is not medical advice. Consult a healthcare provider before making medication decisions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
