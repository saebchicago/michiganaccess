import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Stethoscope, Globe, Wifi, Users, GraduationCap, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProviders, type Provider } from "@/hooks/useProviders";
import { type Facility } from "@/hooks/useFacilities";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

interface Props {
  facilities: Facility[];
}

export default function ProviderDirectory({ facilities }: Props) {
  const { data: providers = [], isLoading } = useProviders();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [langFilter, setLangFilter] = useState("all");

  const facilityMap = useMemo(() => {
    const m: Record<string, Facility> = {};
    facilities.forEach((f) => { m[f.id] = f; });
    return m;
  }, [facilities]);

  const specialties = useMemo(() => {
    const s = new Set(providers.map((p) => p.specialty));
    return ["all", ...Array.from(s).sort()];
  }, [providers]);

  const languages = useMemo(() => {
    const l = new Set<string>();
    providers.forEach((p) => p.languages?.forEach((lang) => l.add(lang)));
    return ["all", ...Array.from(l).sort()];
  }, [providers]);

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
    return result.sort((a, b) => (b.patient_rating || 0) - (a.patient_rating || 0));
  }, [providers, search, specialty, langFilter]);

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
      <div className="flex flex-wrap gap-3">
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
      </div>

      <p className="text-xs text-muted-foreground"><strong className="text-foreground">{filtered.length}</strong> providers found</p>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No providers match your filters</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const fac = p.facility_id ? facilityMap[p.facility_id] : null;
            return (
              <motion.div key={p.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 12}>
                <Card className="hover-lift h-full">
                  <CardContent className="py-3 space-y-2">
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
                          <Star className="h-3 w-3 text-michigan-gold fill-michigan-gold" />
                          <span className="text-xs font-bold text-michigan-gold">{Number(p.patient_rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {p.board_certified && <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]"><Award className="mr-0.5 h-2.5 w-2.5" />Board Certified</Badge>}
                      {p.accepting_new_patients && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]"><Users className="mr-0.5 h-2.5 w-2.5" />Accepting</Badge>}
                      {p.telehealth_available && <Badge className="bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20 text-[10px]"><Wifi className="mr-0.5 h-2.5 w-2.5" />Telehealth</Badge>}
                    </div>

                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      {p.years_experience && <p><Stethoscope className="mr-1 inline h-3 w-3" />{p.years_experience} years experience</p>}
                      {p.languages && p.languages.length > 1 && <p><Globe className="mr-1 inline h-3 w-3" />{p.languages.join(", ")}</p>}
                      {p.medical_school && <p><GraduationCap className="mr-1 inline h-3 w-3" />{p.medical_school}</p>}
                    </div>

                    {fac && (
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{fac.name}</span> · {fac.city}, {fac.county} Co.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
