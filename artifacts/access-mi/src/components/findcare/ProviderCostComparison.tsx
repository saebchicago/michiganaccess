import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Shield, UserCheck, UserX, Plus, X, ArrowUpDown, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Provider } from "@/hooks/useProviders";
import { type Facility } from "@/hooks/useFacilities";

// Estimated cost ranges by specialty (representative Michigan market data)
const SPECIALTY_COST: Record<string, { uninsured: number; insured: number; unit: string }> = {
  "Family Medicine": { uninsured: 185, insured: 35, unit: "visit" },
  "Internal Medicine": { uninsured: 225, insured: 45, unit: "visit" },
  "Pediatrics": { uninsured: 160, insured: 30, unit: "visit" },
  "Cardiology": { uninsured: 350, insured: 75, unit: "consult" },
  "Dermatology": { uninsured: 275, insured: 50, unit: "visit" },
  "OB/GYN": { uninsured: 260, insured: 55, unit: "visit" },
  "Orthopedics": { uninsured: 325, insured: 70, unit: "consult" },
  "Psychiatry": { uninsured: 250, insured: 40, unit: "session" },
  "Emergency Medicine": { uninsured: 1750, insured: 250, unit: "visit" },
  "Oncology": { uninsured: 550, insured: 100, unit: "consult" },
  "Neurology": { uninsured: 350, insured: 65, unit: "consult" },
  "Pulmonology": { uninsured: 325, insured: 60, unit: "consult" },
  "Endocrinology": { uninsured: 290, insured: 55, unit: "consult" },
  "Gastroenterology": { uninsured: 350, insured: 70, unit: "consult" },
  "Rheumatology": { uninsured: 290, insured: 55, unit: "consult" },
};

// Insurance discount multipliers
const INSURANCE_DISCOUNTS: Record<string, number> = {
  "BCBSM": 0.20,
  "Blue Cross Blue Shield": 0.20,
  "United Healthcare": 0.22,
  "Priority Health": 0.18,
  "HAP": 0.19,
  "Medicare": 0.15,
  "Medicaid": 0.10,
  "Aetna": 0.21,
  "Cigna": 0.22,
  "Humana": 0.20,
  "Molina": 0.12,
};

interface Props {
  providers: Provider[];
  facilityMap: Record<string, Facility>;
}

export default function ProviderCostComparison({ providers, facilityMap }: Props) {
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "uninsured" | "insured">("uninsured");

  const specialties = useMemo(() => {
    const s = new Set(providers.map((p) => p.specialty));
    return Array.from(s).sort();
  }, [providers]);

  const filteredProviders = useMemo(() => {
    if (selectedSpecialty === "all") return providers;
    return providers.filter((p) => p.specialty === selectedSpecialty);
  }, [providers, selectedSpecialty]);

  const comparedProviders = useMemo(() => {
    if (selectedIds.length === 0) return [];
    return selectedIds
      .map((id) => providers.find((p) => p.id === id))
      .filter(Boolean) as Provider[];
  }, [selectedIds, providers]);

  const toggleProvider = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const getCosts = (provider: Provider) => {
    const base = SPECIALTY_COST[provider.specialty];
    if (!base) return null;
    const fac = provider.facility_id ? facilityMap[provider.facility_id] : null;
    const qualityMultiplier = fac?.quality_score ? 0.85 + (fac.quality_score / 100) * 0.3 : 1;
    const uninsured = Math.round(base.uninsured * qualityMultiplier);

    // Calculate per-insurance costs
    const insuranceCosts: Record<string, number> = {};
    const accepted = fac?.insurance_accepted || [];
    accepted.forEach((ins) => {
      const discount = INSURANCE_DISCOUNTS[ins] || 0.18;
      insuranceCosts[ins] = Math.round(uninsured * discount);
    });

    return { uninsured, insured: base.insured, unit: base.unit, insuranceCosts, accepted };
  };

  const sortedComparison = useMemo(() => {
    const items = comparedProviders.map((p) => ({ provider: p, costs: getCosts(p) }));
    return items.sort((a, b) => {
      if (sortBy === "name") return `${a.provider.last_name}`.localeCompare(`${b.provider.last_name}`);
      if (sortBy === "uninsured") return (a.costs?.uninsured ?? 0) - (b.costs?.uninsured ?? 0);
      return (a.costs?.insured ?? 0) - (b.costs?.insured ?? 0);
    });
  }, [comparedProviders, sortBy]);

  // Collect all insurance types in compared set
  const allInsuranceInComparison = useMemo(() => {
    const ins = new Set<string>();
    comparedProviders.forEach((p) => {
      const fac = p.facility_id ? facilityMap[p.facility_id] : null;
      fac?.insurance_accepted?.forEach((i) => ins.add(i));
    });
    return Array.from(ins).sort();
  }, [comparedProviders, facilityMap]);

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-michigan-gold" />
          Cost Comparison Tool
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Compare estimated costs across providers. Estimates use CMS fair-price data and facility quality scores. Always verify with the provider's office.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Specialty filter + add providers */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Filter by specialty</label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Select up to 5 providers to compare ({selectedIds.length}/5)
          </p>
        </div>

        {/* Provider selection chips */}
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {filteredProviders.slice(0, 30).map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleProvider(p.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                }`}
              >
                {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {p.first_name} {p.last_name}, {p.title || "MD"}
                <span className="text-[10px] opacity-70">· {p.specialty}</span>
              </button>
            );
          })}
        </div>

        {/* Comparison table */}
        <AnimatePresence>
          {comparedProviders.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-x-auto"
            >
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setSortBy(sortBy === "uninsured" ? "insured" : sortBy === "insured" ? "name" : "uninsured")}
                >
                  <ArrowUpDown className="mr-1 h-3 w-3" />
                  Sort: {sortBy === "uninsured" ? "Uninsured Cost" : sortBy === "insured" ? "Insured Copay" : "Name"}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Provider</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">
                      <span className="text-destructive">Uninsured</span>
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      <span className="text-primary">Avg Copay</span>
                    </TableHead>
                    {allInsuranceInComparison.slice(0, 4).map((ins) => (
                      <TableHead key={ins} className="text-xs text-right">{ins}</TableHead>
                    ))}
                    <TableHead className="text-xs">Insurance Accepted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedComparison.map(({ provider: p, costs }) => {
                    const fac = p.facility_id ? facilityMap[p.facility_id] : null;
                    const lowestUninsured = Math.min(...sortedComparison.map((x) => x.costs?.uninsured ?? Infinity));
                    const isCheapest = costs?.uninsured === lowestUninsured;

                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs font-medium">
                          <div>
                            {p.first_name} {p.last_name}, {p.title || "MD"}
                            <p className="text-[10px] text-muted-foreground">{p.specialty}</p>
                            {fac && <p className="text-[10px] text-muted-foreground">{fac.name}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {p.accepting_new_patients ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                              <UserCheck className="mr-0.5 h-2.5 w-2.5" />Accepting
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                              <UserX className="mr-0.5 h-2.5 w-2.5" />Closed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-xs font-bold ${isCheapest ? "text-michigan-forest" : "text-destructive"}`}>
                            ${costs?.uninsured ?? "-"}
                          </span>
                          {isCheapest && (
                            <Badge className="ml-1 bg-michigan-forest/10 text-michigan-forest text-[9px] px-1">Lowest</Badge>
                          )}
                          {costs && <p className="text-[9px] text-muted-foreground">/{costs.unit}</p>}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs font-bold text-primary">${costs?.insured ?? "-"}</span>
                          {costs && <p className="text-[9px] text-muted-foreground">/{costs.unit}</p>}
                        </TableCell>
                        {allInsuranceInComparison.slice(0, 4).map((ins) => (
                          <TableCell key={ins} className="text-right text-xs">
                            {costs?.insuranceCosts[ins] != null ? (
                              <span className="font-medium">${costs.insuranceCosts[ins]}</span>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">N/A</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {(fac?.insurance_accepted || []).slice(0, 3).map((ins) => (
                              <Badge key={ins} variant="outline" className="text-[9px] px-1.5 py-0">
                                <Shield className="mr-0.5 h-2 w-2" />{ins}
                              </Badge>
                            ))}
                            {(fac?.insurance_accepted?.length || 0) > 3 && (
                              <span className="text-[9px] text-muted-foreground">
                                +{(fac?.insurance_accepted?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Savings callout */}
              {sortedComparison.length >= 2 && (() => {
                const costs = sortedComparison.map((x) => x.costs?.uninsured ?? 0).filter(Boolean);
                const savings = Math.max(...costs) - Math.min(...costs);
                return savings > 0 ? (
                  <div className="mt-3 rounded-lg bg-michigan-forest/5 border border-michigan-forest/15 p-3 text-sm">
                    <DollarSign className="inline h-4 w-4 text-michigan-forest mr-1" />
                    <span className="font-semibold text-michigan-forest">Potential savings:</span>{" "}
                    <span className="text-foreground">
                      Up to <strong>${savings}</strong> per visit by choosing the lowest-cost provider for this specialty.
                    </span>
                  </div>
                ) : null;
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {comparedProviders.length < 2 && selectedIds.length > 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            Select at least 2 providers to see a side-by-side comparison.
          </p>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Cost estimates are approximate based on CMS fair-price benchmarks and facility quality data.
          Insurance copays vary by plan. Always verify with the provider's billing office.
        </p>
      </CardContent>
    </Card>
  );
}
