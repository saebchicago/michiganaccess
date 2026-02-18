import { useState, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Heart, DollarSign, Shield, Phone, ExternalLink, ChevronDown, ChevronUp,
  Users, Baby, Stethoscope, Pill, CheckCircle2, HelpCircle, ArrowRight, Calculator
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFinancialPrograms } from "@/hooks/useFinancialPrograms";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

// 2024 Federal Poverty Level guidelines
const FPL_2024: Record<number, number> = {
  1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580, 6: 41960, 7: 47340, 8: 52720,
};

const programTypeLabels: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  charity_care: { label: "Charity Care / Hospital Financial Assistance", icon: Heart, color: "text-michigan-coral" },
  insurance: { label: "Insurance Programs", icon: Shield, color: "text-michigan-blue" },
  prescription: { label: "Prescription Assistance", icon: Pill, color: "text-michigan-forest" },
  social_services: { label: "Social Services & SDOH", icon: Users, color: "text-michigan-teal" },
};

export default function FinancialHelpPage() {
  const { t } = useTranslation();
  usePageMeta({
    title: "Financial Help",
    description: "Find free and reduced-cost care, insurance options, and prescription savings for Michigan residents.",
    path: "/financial-help",
    jsonLd: {
      "@type": "WebPage",
      "name": "Financial Help — Michigan Access",
      "description": "Free and reduced-cost healthcare, insurance programs, and prescription assistance for Michigan residents.",
      "url": "https://michiganaccess.lovable.app/financial-help",
      "provider": { "@type": "Organization", "name": "Michigan Access" },
    },
  });
  const { data: programs = [], isLoading } = useFinancialPrograms();
  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [income, setIncome] = useState<string>("");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const fplPercent = useMemo(() => {
    const inc = parseFloat(income);
    if (!inc || !FPL_2024[householdSize]) return null;
    return Math.round((inc / FPL_2024[householdSize]) * 100);
  }, [income, householdSize]);

  const eligiblePrograms = useMemo(() => {
    if (fplPercent === null) return programs;
    return programs.filter((p) => !p.fpl_threshold || fplPercent <= p.fpl_threshold);
  }, [programs, fplPercent]);

  const filteredPrograms = useMemo(() => {
    if (filterType === "all") return eligiblePrograms;
    return eligiblePrograms.filter((p) => p.program_type === filterType);
  }, [eligiblePrograms, filterType]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredPrograms> = {};
    filteredPrograms.forEach((p) => {
      if (!groups[p.program_type]) groups[p.program_type] = [];
      groups[p.program_type].push(p);
    });
    return groups;
  }, [filteredPrograms]);

  return (
    <Layout>
      <div className="container pt-6">
        <Breadcrumbs items={[{ label: "Financial Help" }]} />
      </div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-coral/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-michigan-coral/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-coral">
              {t('financial.badge')}
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            {t('financial.title')}
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('financial.subtitle')}
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-10">
        {/* Eligibility Screener */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('financial.eligibilityScreener')}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t('financial.eligibilityDesc')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t('financial.householdSize')}</label>
                  <Select value={String(householdSize)} onValueChange={(v) => setHouseholdSize(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "person" : "people"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t('financial.annualIncome')}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="e.g. 35000"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {fplPercent !== null && (
                    <div className="rounded-lg bg-background border border-border px-4 py-2.5 text-center">
                      <p className="text-xs text-muted-foreground">{t('financial.yourFPL')}</p>
                      <p className={`text-xl font-bold ${fplPercent <= 138 ? "text-michigan-forest" : fplPercent <= 250 ? "text-michigan-teal" : fplPercent <= 400 ? "text-michigan-gold" : "text-muted-foreground"}`}>
                        {fplPercent}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {fplPercent !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 rounded-lg bg-background border border-border p-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{eligiblePrograms.length} programs</strong> you may qualify for based on {fplPercent}% of the Federal Poverty Level.
                    {fplPercent <= 138 && " You likely qualify for Medicaid/Healthy Michigan Plan."}
                    {fplPercent <= 200 && fplPercent > 138 && " You may qualify for marketplace subsidies and charity care programs."}
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">{t('findCare.filters')}:</span>
          <Button size="sm" variant={filterType === "all" ? "default" : "outline"} onClick={() => setFilterType("all")}>{t('financial.allPrograms')}</Button>
          {Object.entries(programTypeLabels).map(([key, { label }]) => (
            <Button key={key} size="sm" variant={filterType === key ? "default" : "outline"} onClick={() => setFilterType(key)}>
              {label.split(" /")[0]}
            </Button>
          ))}
        </div>

        {/* Programs by category */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          Object.entries(grouped).map(([type, progs]) => {
            const meta = programTypeLabels[type] || { label: type, icon: HelpCircle, color: "text-muted-foreground" };
            const Icon = meta.icon;
            return (
              <motion.section key={type} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`h-5 w-5 ${meta.color}`} />
                  <h2 className="text-xl font-bold text-foreground">{meta.label}</h2>
                  <Badge variant="secondary" className="text-xs">{progs.length}</Badge>
                </div>
                <div className="space-y-3">
                  {progs.map((prog, i) => {
                    const isExpanded = expandedProgram === prog.id;
                    return (
                      <motion.div key={prog.id} variants={fadeUp} custom={i}>
                        <Card className="hover-lift cursor-pointer" onClick={() => setExpandedProgram(isExpanded ? null : prog.id)}>
                          <CardContent className="py-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-foreground">{prog.program_name}</h3>
                                  {prog.fpl_threshold && (
                                    <Badge variant="outline" className="text-[10px]">
                                      Up to {prog.fpl_threshold}% FPL
                                    </Badge>
                                  )}
                                  {fplPercent !== null && prog.fpl_threshold && fplPercent <= prog.fpl_threshold && (
                                    <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">
                                      <CheckCircle2 className="mr-1 h-3 w-3" /> You may qualify
                                    </Badge>
                                  )}
                                </div>
                                {prog.organization && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{prog.organization} · {prog.coverage_area}</p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{prog.description}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="flex-shrink-0">
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>

                            {isExpanded && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
                                <Separator />
                                {prog.how_to_apply && (
                                  <div>
                                    <p className="text-xs font-semibold text-foreground mb-1">{t('financial.howToApply')}</p>
                                    <p className="text-sm text-muted-foreground">{prog.how_to_apply}</p>
                                  </div>
                                )}
                                {prog.services_covered && prog.services_covered.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-foreground mb-1">{t('financial.servicesCovered')}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {prog.services_covered.map((s) => (
                                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-3">
                                  {prog.phone && (
                                    <a href={`tel:${prog.phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                      <Phone className="h-3.5 w-3.5" /> {prog.phone}
                                    </a>
                                  )}
                                  {prog.application_url && (
                                    <a href={prog.application_url} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                      <ExternalLink className="h-3.5 w-3.5" /> Apply Online
                                    </a>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            );
          })
        )}

        {/* Crisis resources */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card className="border-michigan-coral/20 bg-michigan-coral/5">
            <CardContent className="py-6">
              <h3 className="mb-3 text-lg font-bold text-foreground">{t('financial.needImmediateHelp')}</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-background border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-michigan-coral">2-1-1</p>
                  <p className="text-xs text-muted-foreground">United Way resource line</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-michigan-coral">988</p>
                  <p className="text-xs text-muted-foreground">Suicide & Crisis Lifeline</p>
                </div>
                <div className="rounded-lg bg-background border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-michigan-coral">844-799-9876</p>
                  <p className="text-xs text-muted-foreground">Healthy Michigan Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </Layout>
  );
}
