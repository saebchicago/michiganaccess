import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Stethoscope, Globe, Wifi, Users, GraduationCap, Award, Shield, DollarSign, Phone, MapPin, UserCheck, UserX, CreditCard, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useProviders, type Provider } from "@/hooks/useProviders";
import { type Facility } from "@/hooks/useFacilities";
import ValueBadges from "@/components/civic/ValueBadges";
import ProviderCostComparison from "./ProviderCostComparison";
import { ALL_SPECIALTIES } from "@/data/findhelp-specialties";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

// Common insurance abbreviation map for display
const INSURANCE_ABBREV: Record<string, string> = {
  "BCBSM": "Blue Cross",
  "Blue Cross Blue Shield": "BCBS",
  "United Healthcare": "UHC",
  "Priority Health": "Priority",
  "HAP": "HAP",
  "Medicare": "Medicare",
  "Medicaid": "Medicaid",
  "Aetna": "Aetna",
  "Cigna": "Cigna",
  "Humana": "Humana",
  "Molina": "Molina",
};

function getInsuranceAbbrev(name: string): string {
  return INSURANCE_ABBREV[name] || name;
}

// Estimated cost ranges by specialty (representative Michigan market data)
const SPECIALTY_COST_RANGE: Record<string, { low: number; high: number; unit: string }> = {
  "Family Medicine": { low: 120, high: 250, unit: "visit" },
  "Internal Medicine": { low: 150, high: 300, unit: "visit" },
  "Pediatrics": { low: 100, high: 220, unit: "visit" },
  "Cardiology": { low: 200, high: 500, unit: "consult" },
  "Dermatology": { low: 150, high: 400, unit: "visit" },
  "OB/GYN": { low: 175, high: 350, unit: "visit" },
  "Orthopedics": { low: 200, high: 450, unit: "consult" },
  "Psychiatry": { low: 150, high: 350, unit: "session" },
  "Emergency Medicine": { low: 500, high: 3000, unit: "visit" },
  "Oncology": { low: 300, high: 800, unit: "consult" },
  "Neurology": { low: 200, high: 500, unit: "consult" },
  "Pulmonology": { low: 200, high: 450, unit: "consult" },
  "Endocrinology": { low: 175, high: 400, unit: "consult" },
  "Gastroenterology": { low: 200, high: 500, unit: "consult" },
  "Rheumatology": { low: 175, high: 400, unit: "consult" },
};

function getCostRange(specialty: string): { low: number; high: number; unit: string } | null {
  return SPECIALTY_COST_RANGE[specialty] || null;
}

interface Props {
  facilities: Facility[];
}

export default function ProviderDirectory({ facilities }: Props) {
  const { data: providers = [], isLoading } = useProviders();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [insuranceFilter, setInsuranceFilter] = useState("all");
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const facilityMap = useMemo(() => {
    const m: Record<string, Facility> = {};
    facilities.forEach((f) => { m[f.id] = f; });
    return m;
  }, [facilities]);

  // Merge DB specialties with full SPECIALTY_GROUPS reference list
  const specialties = useMemo(() => {
    const dbSpecs = new Set(providers.map((p) => p.specialty));
    const allSpecs = new Set([...dbSpecs, ...ALL_SPECIALTIES.map((s) => s.value)]);
    return ["all", ...Array.from(allSpecs).sort()];
  }, [providers]);

  const languages = useMemo(() => {
    const l = new Set<string>();
    providers.forEach((p) => p.languages?.forEach((lang) => l.add(lang)));
    return ["all", ...Array.from(l).sort()];
  }, [providers]);

  // Collect all insurance types from facilities linked to providers
  const allInsurances = useMemo(() => {
    const ins = new Set<string>();
    providers.forEach((p) => {
      if (p.facility_id) {
        const fac = facilityMap[p.facility_id];
        fac?.insurance_accepted?.forEach((i) => ins.add(i));
      }
    });
    return ["all", ...Array.from(ins).sort()];
  }, [providers, facilityMap]);

  const filtered = useMemo(() => {
    let result = [...providers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        p.specialty.toLowerCase().includes(q) ||
        p.subspecialty?.toLowerCase().includes(q)
      );
    }
    if (specialty !== "all") result = result.filter((p) => p.specialty === specialty);
    if (langFilter !== "all") result = result.filter((p) => p.languages?.includes(langFilter));
    if (acceptingOnly) result = result.filter((p) => p.accepting_new_patients);
    if (insuranceFilter !== "all") {
      result = result.filter((p) => {
        if (!p.facility_id) return false;
        const fac = facilityMap[p.facility_id];
        return fac?.insurance_accepted?.includes(insuranceFilter);
      });
    }
    return result.sort((a, b) => (b.patient_rating || 0) - (a.patient_rating || 0));
  }, [providers, search, specialty, langFilter, acceptingOnly, insuranceFilter, facilityMap]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <Input placeholder="Search by name or specialty..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-64 text-sm" />
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Specialty" /></SelectTrigger>
          <SelectContent>
            {specialties.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Specialties" : s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Language" /></SelectTrigger>
          <SelectContent>
            {languages.map((l) => <SelectItem key={l} value={l}>{l === "all" ? "All Languages" : l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
          <SelectTrigger className="w-44 h-9">
            <CreditCard className="mr-1 h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Insurance" />
          </SelectTrigger>
          <SelectContent>
            {allInsurances.map((i) => <SelectItem key={i} value={i}>{i === "all" ? "All Insurance" : i}</SelectItem>)}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Switch checked={acceptingOnly} onCheckedChange={setAcceptingOnly} className="h-5 w-9" />
          <span className="text-xs">Accepting new patients</span>
        </label>
      </div>

      <p className="text-xs text-muted-foreground"><strong className="text-foreground">{filtered.length}</strong> providers found</p>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No providers match your filters</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const fac = p.facility_id ? facilityMap[p.facility_id] : null;
            const costRange = getCostRange(p.specialty);

            return (
              <motion.div key={p.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 12}>
                <Card className="hover-lift h-full">
                  <CardContent className="py-3 space-y-2">
                    {/* Header: Name + Rating */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {p.first_name} {p.last_name}, {p.title || "MD"}
                        </h4>
                        <p className="text-xs text-primary">{p.specialty}</p>
                        {p.subspecialty && <p className="text-[11px] text-muted-foreground">{p.subspecialty}</p>}
                      </div>
                      {p.patient_rating && (
                        <div className="flex items-center gap-1 rounded-md bg-michigan-gold/10 px-2 py-0.5">
                          <Star className="h-3 w-3 text-michigan-gold-deep fill-michigan-gold" />
                          <span className="text-xs font-bold text-michigan-gold-deep">{Number(p.patient_rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.board_certified && <Badge className="bg-michigan-forest/10 text-michigan-forest-deep border-michigan-forest/20 text-[10px]"><Award className="mr-0.5 h-2.5 w-2.5" />Board Certified</Badge>}
                      {p.accepting_new_patients ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]"><UserCheck className="mr-0.5 h-2.5 w-2.5" />Accepting</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]"><UserX className="mr-0.5 h-2.5 w-2.5" />Not Accepting</Badge>
                      )}
                      {p.telehealth_available && <Badge className="bg-michigan-teal/10 text-michigan-teal-deep border-michigan-teal/20 text-[10px]"><Wifi className="mr-0.5 h-2.5 w-2.5" />Telehealth</Badge>}
                    </div>

                    {/* Insurance accepted */}
                    {fac?.insurance_accepted && fac.insurance_accepted.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Shield className="h-2.5 w-2.5" /> Insurance Accepted
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {fac.insurance_accepted.slice(0, 5).map((ins) => (
                            <Badge key={ins} variant="outline" className="text-[9px] bg-muted/50 px-1.5 py-0">
                              {getInsuranceAbbrev(ins)}
                            </Badge>
                          ))}
                          {fac.insurance_accepted.length > 5 && (
                            <span className="text-[9px] text-muted-foreground">+{fac.insurance_accepted.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cost transparency */}
                    {costRange && (
                      <div className="rounded-md bg-michigan-gold/5 border border-michigan-gold/15 p-1.5">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-2.5 w-2.5 text-michigan-gold-deep" />
                          <span className="font-medium text-foreground">
                            ${costRange.low}–${costRange.high}
                          </span>
                          <span>/ {costRange.unit} (uninsured est.)</span>
                        </p>
                      </div>
                    )}

                    <ValueBadges specialty={p.specialty} boardCertified={p.board_certified} yearsExperience={p.years_experience} />

                    {/* Last Updated */}
                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      Last verified: {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>

                    {/* Details */}
                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      {p.years_experience && <p><Stethoscope className="mr-1 inline h-3 w-3" />{p.years_experience} years experience</p>}
                      {p.languages && p.languages.length > 1 && <p><Globe className="mr-1 inline h-3 w-3" />{p.languages.join(", ")}</p>}
                      {p.medical_school && <p><GraduationCap className="mr-1 inline h-3 w-3" />{p.medical_school}</p>}
                    </div>

                    {/* Facility info */}
                    {fac && (
                      <div className="rounded-md bg-muted/50 p-2 space-y-1">
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{fac.name}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" /> {fac.city}, {fac.county} Co.
                        </p>
                        {fac.phone && (
                          <p className="text-[10px]">
                            <a href={`tel:${fac.phone}`} className="text-primary hover:underline flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5" /> {fac.phone}
                            </a>
                          </p>
                        )}
                        {fac.quality_score && fac.quality_score > 0 && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, fac.quality_score)}%`,
                                backgroundColor: fac.quality_score >= 90 ? "#F4A460" : fac.quality_score >= 75 ? "#00A3A1" : fac.quality_score >= 60 ? "#4A90E2" : "#94a3b8",
                              }}
                            />
                            <span className="text-[9px] text-muted-foreground">{fac.quality_score}/100 quality</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cost Comparison Tool */}
      <ProviderCostComparison providers={filtered} facilityMap={facilityMap} />

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center mt-4">
        Insurance acceptance and cost estimates are approximate. Always verify directly with the provider's office. 
        Cost ranges reflect typical uninsured/self-pay rates in Michigan. Source: CMS NPPES, facility data.
      </p>
    </div>
  );
}
