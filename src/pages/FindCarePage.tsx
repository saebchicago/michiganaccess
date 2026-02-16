import { useState, useMemo, useCallback, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Star, Shield, Heart, Filter, X, Phone, ExternalLink,
  Wifi, Clock, Users, Award, ChevronDown, Building2, Stethoscope, Activity, Radio
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useFacilities, type Facility } from "@/hooks/useFacilities";
import { useHRSAData } from "@/hooks/useHRSAData";
import { useCounty } from "@/contexts/CountyContext";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProviderDirectory from "@/components/findcare/ProviderDirectory";
import VisitPrepChecklist from "@/components/shared/VisitPrepChecklist";
import CareTeamReminders from "@/components/shared/CareTeamReminders";
import SpotlightTabs from "@/components/shared/SpotlightTabs";
import { ClipboardList, Bell } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

const facilityTypeLabels: Record<string, string> = {
  hospital: "Hospital",
  fqhc: "Community Health Center",
  urgent_care: "Urgent Care",
  specialty: "Specialty Center",
  behavioral_health: "Behavioral Health",
};

function qualityBadges(f: Facility) {
  const badges: { label: string; color: string }[] = [];
  if (f.leapfrog_grade === "A") badges.push({ label: `⭐ Leapfrog A`, color: "bg-michigan-gold/10 text-michigan-gold border-michigan-gold/20" });
  if (f.is_magnet) badges.push({ label: "🏆 Magnet", color: "bg-primary/10 text-primary border-primary/20" });
  if (f.is_blue_distinction) badges.push({ label: "💙 Blue Distinction", color: "bg-michigan-sky/10 text-michigan-sky border-michigan-sky/20" });
  if (f.joint_commission) badges.push({ label: "✓ Joint Commission", color: "bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20" });
  return badges;
}

function qualityColor(score: number | null) {
  if (!score) return "text-muted-foreground";
  if (score >= 80) return "text-michigan-gold";
  if (score >= 70) return "text-michigan-teal";
  if (score >= 60) return "text-michigan-blue";
  return "text-muted-foreground";
}

function compositeScore(f: Facility): number {
  const qualityWeight = 0.3;
  const digitalWeight = 0.15;
  const serviceWeight = 0.15;
  // quality (0-100)
  const quality = (f.quality_score || 0);
  // digital (0-100)
  const dc = f.digital_capabilities as Record<string, boolean> | null;
  const digitalFeatures = dc ? Object.values(dc).filter(Boolean).length : 0;
  const digital = (digitalFeatures / 3) * 100;
  // services (0-100)
  const serviceCount = f.services?.length || 0;
  const service = Math.min(serviceCount / 8, 1) * 100;
  return Math.round(quality * qualityWeight + digital * digitalWeight + service * serviceWeight);
}

type SortBy = "composite" | "quality" | "name";

export default function FindCarePage() {
  const { t } = useTranslation();
  const { county: selectedCounty } = useCounty();
  usePageMeta({ title: "Find Care Near You", description: "Search Michigan healthcare facilities by location, specialty, quality ratings, and services.", path: "/find-care" });
  const { data: dbFacilities = [], isLoading: dbLoading } = useFacilities(undefined, selectedCounty);
  const { data: hrsaData, isLoading: hrsaLoading } = useHRSAData("MI", 50);

  // Merge HRSA live FQHCs with DB facilities, deduplicating by name
  const facilities = useMemo(() => {
    const dbNames = new Set(dbFacilities.map((f) => f.name.toLowerCase()));
    const hrsaFacilities: Facility[] = (hrsaData?.results || [])
      .filter((h) => h.name && h.lat && h.lng && !dbNames.has(h.name.toLowerCase()))
      .map((h) => ({
        id: `hrsa-${h.name}-${h.zip}`,
        name: h.name,
        address: h.address || "",
        city: h.city || "",
        county: "",
        state: h.state || "MI",
        zip: h.zip || "",
        phone: h.phone || null,
        latitude: h.lat,
        longitude: h.lng,
        facility_type: "fqhc",
        quality_score: null,
        services: null,
        specialties: null,
        languages: null,
        hours: null,
        website: null,
        accepting_new_patients: null,
        telehealth_available: null,
        walk_in: null,
        wheelchair_accessible: null,
        public_transit: null,
        insurance_accepted: null,
        system_affiliation: null,
        is_magnet: null,
        is_blue_distinction: null,
        joint_commission: null,
        leapfrog_grade: null,
        digital_capabilities: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    return [...dbFacilities, ...hrsaFacilities];
  }, [dbFacilities, hrsaData]);

  const isLoading = dbLoading;
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("composite");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filterAccepting, setFilterAccepting] = useState(false);
  const [filterTelehealth, setFilterTelehealth] = useState(false);
  const [filterWalkIn, setFilterWalkIn] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...facilities];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.county.toLowerCase().includes(q) ||
        f.specialties?.some((s) => s.toLowerCase().includes(q)) ||
        f.services?.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (selectedTypes.length > 0) result = result.filter((f) => selectedTypes.includes(f.facility_type));
    if (filterAccepting) result = result.filter((f) => f.accepting_new_patients);
    if (filterTelehealth) result = result.filter((f) => f.telehealth_available);
    if (filterWalkIn) result = result.filter((f) => f.walk_in);

    result.sort((a, b) => {
      if (sortBy === "quality") return (b.quality_score || 0) - (a.quality_score || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return compositeScore(b) - compositeScore(a);
    });
    return result;
  }, [facilities, search, selectedTypes, filterAccepting, filterTelehealth, filterWalkIn, sortBy]);

  const compareList = useMemo(() => facilities.filter((f) => compareIds.includes(f.id)), [facilities, compareIds]);

  const FiltersContent = () => (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facility Type</p>
        {Object.entries(facilityTypeLabels).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <Checkbox checked={selectedTypes.includes(key)} onCheckedChange={() => toggleType(key)} />
            <span className="text-sm text-foreground">{label}</span>
          </label>
        ))}
      </div>
      <Separator />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Availability</p>
        <label className="flex items-center gap-2 py-1.5 cursor-pointer">
          <Checkbox checked={filterAccepting} onCheckedChange={(c) => setFilterAccepting(!!c)} />
          <span className="text-sm">Accepting new patients</span>
        </label>
        <label className="flex items-center gap-2 py-1.5 cursor-pointer">
          <Checkbox checked={filterTelehealth} onCheckedChange={(c) => setFilterTelehealth(!!c)} />
          <span className="text-sm">Telehealth available</span>
        </label>
        <label className="flex items-center gap-2 py-1.5 cursor-pointer">
          <Checkbox checked={filterWalkIn} onCheckedChange={(c) => setFilterWalkIn(!!c)} />
          <span className="text-sm">Walk-in / No appointment</span>
        </label>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 lg:py-16">
        <div className="container max-w-4xl text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
              {t('findCare.title')}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('findCare.subtitle')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mx-auto mt-6 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('findCare.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 pl-12 text-base shadow-michigan"
                />
              </div>
            </motion.div>
        </div>
      </section>

      <div className="container py-8">
        <Tabs defaultValue="facilities" className="mb-6">
          <TabsList>
            <TabsTrigger value="facilities"><Building2 className="mr-1.5 h-4 w-4" />{t('findCare.facilities')}</TabsTrigger>
            <TabsTrigger value="providers"><Stethoscope className="mr-1.5 h-4 w-4" />{t('findCare.providers')}</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="mt-4">
            <ProviderDirectory facilities={facilities} />
          </TabsContent>

          <TabsContent value="facilities" className="mt-4">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-20 space-y-4">
              <h3 className="text-sm font-bold text-foreground">{t('findCare.filters')}</h3>
              <FiltersContent />
              <Separator />
              <Link to="/about#methodology" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                <Shield className="h-3.5 w-3.5" /> How we rank results
              </Link>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Controls bar */}
            <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{filtered.length}</strong> {t('findCare.facilitiesCount')}
                </p>
                {hrsaData && hrsaData.count > 0 && (
                  <Badge variant="outline" className="text-[10px] border-michigan-teal/30 text-michigan-teal">
                    <Radio className="mr-1 h-3 w-3" /> +{hrsaData.count} live HRSA
                  </Badge>
                )}
                {/* Mobile filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline" className="lg:hidden">
                      <Filter className="mr-1.5 h-4 w-4" /> {t('findCare.filters')}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetTitle>{t('findCare.filters')}</SheetTitle>
                    <div className="mt-4">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="flex items-center gap-3">
                {compareIds.length > 0 && (
                  <Button size="sm" variant="secondary" onClick={() => setShowCompare(!showCompare)}>
                    Compare ({compareIds.length}/3)
                  </Button>
                )}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="composite">{t('findCare.bestMatch')}</SelectItem>
                    <SelectItem value="quality">{t('findCare.qualityScore')}</SelectItem>
                    <SelectItem value="name">{t('findCare.nameAZ')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Comparison panel */}
            <AnimatePresence>
              {showCompare && compareList.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <Card className="border-primary/20">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{t('findCare.comparison')}</h3>
                        <Button size="sm" variant="ghost" onClick={() => { setCompareIds([]); setShowCompare(false); }}>
                          <X className="h-4 w-4 mr-1" /> {t('findCare.clear')}
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 text-left text-xs text-muted-foreground">{t('findCare.metric')}</th>
                              {compareList.map((f) => (
                                <th key={f.id} className="py-2 text-left text-xs font-semibold text-foreground max-w-[200px] truncate">{f.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: "Quality Score", fn: (f: Facility) => `${f.quality_score || "N/A"}/100` },
                              { label: "Leapfrog Grade", fn: (f: Facility) => f.leapfrog_grade || "N/A" },
                              { label: "Magnet", fn: (f: Facility) => f.is_magnet ? "Yes ✓" : "No" },
                              { label: "Telehealth", fn: (f: Facility) => f.telehealth_available ? "Yes ✓" : "No" },
                              { label: "Walk-In", fn: (f: Facility) => f.walk_in ? "Yes ✓" : "No" },
                              { label: "Services", fn: (f: Facility) => `${f.services?.length || 0} available` },
                              { label: "Specialties", fn: (f: Facility) => f.specialties?.join(", ") || "N/A" },
                            ].map((row) => (
                              <tr key={row.label} className="border-b border-border/50">
                                <td className="py-2 text-xs text-muted-foreground">{row.label}</td>
                                {compareList.map((f) => (
                                  <td key={f.id} className="py-2 text-xs text-foreground">{row.fn(f)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Facility Cards */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg font-medium text-foreground">{t('findCare.noResults')}</p>
                <p className="text-sm text-muted-foreground">{t('findCare.noResultsHint')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((f, i) => {
                  const badges = qualityBadges(f);
                  const dc = f.digital_capabilities as Record<string, boolean> | null;
                  const isFqhc = f.facility_type === "fqhc";
                  const isCompared = compareIds.includes(f.id);
                  return (
                    <motion.div key={f.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 10}>
                      <Card className={`hover-lift ${isCompared ? "ring-2 ring-primary" : ""}`}>
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            {/* Score circle */}
                            <div className="hidden sm:flex flex-col items-center">
                              <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${f.quality_score && f.quality_score >= 80 ? "border-michigan-gold bg-michigan-gold/5" : f.quality_score && f.quality_score >= 70 ? "border-michigan-teal bg-michigan-teal/5" : "border-border bg-muted/50"}`}>
                                <span className={`text-lg font-bold ${qualityColor(f.quality_score)}`}>{f.quality_score || "—"}</span>
                              </div>
                              <span className="mt-1 text-[9px] text-muted-foreground">Quality</span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-foreground">{f.name}</h3>
                                    <Badge variant="outline" className="text-[10px]">{facilityTypeLabels[f.facility_type] || f.facility_type}</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    <MapPin className="mr-1 inline h-3 w-3" />{f.address}, {f.city}, {f.state} {f.zip} · {f.county} County
                                  </p>
                                </div>
                                <Checkbox
                                  checked={isCompared}
                                  onCheckedChange={() => toggleCompare(f.id)}
                                  disabled={!isCompared && compareIds.length >= 3}
                                  className="mt-1"
                                  aria-label="Add to compare"
                                />
                              </div>

                              {/* Badges */}
                              {(badges.length > 0 || isFqhc) && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {isFqhc && (
                                    <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">
                                      ✅ No one turned away
                                    </Badge>
                                  )}
                                  {badges.map((b) => (
                                    <Badge key={b.label} className={`${b.color} text-[10px]`}>{b.label}</Badge>
                                  ))}
                                  {f.services && f.services.length >= 6 && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">🏥 Comprehensive care</Badge>
                                  )}
                                </div>
                              )}

                              {/* Quick info */}
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                {f.accepting_new_patients && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Accepting patients</span>}
                                {f.telehealth_available && <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> Telehealth</span>}
                                {f.walk_in && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Walk-in</span>}
                                {dc?.patient_portal && <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Portal</span>}
                                {f.system_affiliation && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {f.system_affiliation}</span>}
                              </div>

                              {/* Specialties */}
                              {f.specialties && f.specialties.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {f.specialties.slice(0, 5).map((s) => (
                                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                                  ))}
                                  {f.specialties.length > 5 && (
                                    <Badge variant="secondary" className="text-[10px]">+{f.specialties.length - 5} more</Badge>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                {f.phone && (
                                  <a href={`tel:${f.phone}`}>
                                    <Button size="sm" variant="outline" className="h-8 text-xs">
                                      <Phone className="mr-1 h-3 w-3" /> {f.phone}
                                    </Button>
                                  </a>
                                )}
                                {f.website && (
                                  <a href={f.website} target="_blank" rel="noopener">
                                    <Button size="sm" variant="outline" className="h-8 text-xs">
                                      <ExternalLink className="mr-1 h-3 w-3" /> Website
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
          </TabsContent>
        </Tabs>

        {/* Community SDOH Resources */}
        <SpotlightTabs />

        {/* Prep Tools */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Prepare for Your Visit
            </h2>
            <p className="text-sm text-muted-foreground">
              Get ready before your appointment. Download a checklist to bring with you.
            </p>
            <VisitPrepChecklist
              trigger={
                <Button variant="outline">
                  <ClipboardList className="h-4 w-4" />
                  Open Visit Prep Checklist
                </Button>
              }
            />
          </div>
          <CareTeamReminders />
        </div>
      </div>
    </Layout>
  );
}
