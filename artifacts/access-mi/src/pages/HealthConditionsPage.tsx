import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Baby,
  Ribbon,
  Activity,
  Star,
  MapPin,
  Phone,
  ExternalLink,
  Stethoscope,
  Shield,
  Users,
  Wifi,
  Building2,
  ChevronRight,
  Apple,
  Brain,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFacilities, type Facility } from "@/hooks/useFacilities";
import { useProviders, type Provider } from "@/hooks/useProviders";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

interface Pathway {
  key: string;
  label: string;
  icon: typeof Heart;
  color: string;
  bgColor: string;
  description: string;
  specialties: string[];
  services: string[];
  supportServices: string[];
}

const pathways: Pathway[] = [
  {
    key: "diabetes",
    label: "Diabetes Care",
    icon: Activity,
    color: "text-michigan-teal",
    bgColor: "bg-michigan-teal/10",
    description:
      "Find endocrinologists, diabetes education, nutrition counseling, and community support near you.",
    specialties: ["Endocrinology", "Internal Medicine", "Family Medicine"],
    services: [
      "Diabetes Management",
      "Chronic Disease Management",
      "Laboratory",
      "Nutrition Counseling",
    ],
    supportServices: [
      "Nutrition Education",
      "Chronic Disease Self-Management",
      "Community Health Workers",
    ],
  },
  {
    key: "cancer",
    label: "Cancer Care",
    icon: Ribbon,
    color: "text-michigan-coral",
    bgColor: "bg-michigan-coral/10",
    description:
      "Access oncology centers, treatment facilities, support groups, and financial assistance for cancer care.",
    specialties: [
      "Oncology",
      "Surgical Oncology",
      "Radiation Oncology",
      "Hematology",
    ],
    services: [
      "Cancer Treatment",
      "Chemotherapy",
      "Radiation Therapy",
      "Surgical Services",
      "Imaging",
    ],
    supportServices: [
      "Support Groups",
      "Social Work",
      "Palliative Care",
      "Patient Navigation",
    ],
  },
  {
    key: "pregnancy",
    label: "Pregnancy & Maternity",
    icon: Baby,
    color: "text-michigan-gold",
    bgColor: "bg-michigan-gold/10",
    description:
      "Find OB/GYN providers, birthing centers, prenatal care, and postpartum support services.",
    specialties: [
      "Obstetrics/Gynecology",
      "OB/GYN",
      "Family Medicine",
      "Pediatrics",
    ],
    services: [
      "Maternity Care",
      "Labor & Delivery",
      "Prenatal Care",
      "Women's Health",
      "Newborn Care",
    ],
    supportServices: [
      "WIC",
      "Breastfeeding Support",
      "Prenatal Classes",
      "Doula Services",
    ],
  },
];

interface PathwayMatch {
  pathwayScore: number;
  matches: boolean;
}

function scoreFacilityForPathway(f: Facility, pw: Pathway): PathwayMatch {
  const matchingSpecs =
    f.specialties?.filter((s) =>
      pw.specialties.some((ps) => s.toLowerCase().includes(ps.toLowerCase())),
    ) || [];
  const matchingSvcs =
    f.services?.filter((s) =>
      pw.services.some((ps) => s.toLowerCase().includes(ps.toLowerCase())),
    ) || [];

  // A facility only belongs in a condition pathway if it actually offers
  // a matching specialty or service. Without this gate, high-quality
  // hospitals leak into every pathway just from their quality / Magnet
  // / Leapfrog bonuses.
  const matches = matchingSpecs.length > 0 || matchingSvcs.length > 0;
  if (!matches) return { pathwayScore: 0, matches: false };

  let score = 0;
  score += matchingSpecs.length * 15;
  score += matchingSvcs.length * 10;
  score += (f.quality_score || 0) * 0.3;
  if (f.leapfrog_grade === "A") score += 10;
  if (f.is_magnet) score += 8;
  if (f.telehealth_available) score += 5;
  if (f.accepting_new_patients) score += 5;
  return { pathwayScore: Math.round(score), matches: true };
}

export default function HealthConditionsPage() {
  const { t } = useTranslation();
  usePageMeta({
    title: "Health Conditions",
    description:
      "Find specialized care pathways for diabetes, heart disease, cancer, maternal health, and more across Michigan.",
    path: "/conditions",
    jsonLd: {
      "@type": "MedicalWebPage",
      name: "Health Conditions — Access Michigan",
      about: {
        "@type": "MedicalCondition",
        name: "Common health conditions in Michigan",
      },
      url: "https://accessmi.org/conditions",
    },
  });
  const { data: facilities = [], isLoading: facLoading } = useFacilities();
  const { data: providers = [], isLoading: provLoading } = useProviders();
  const [activePathway, setActivePathway] = useState("diabetes");

  const pw = pathways.find((p) => p.key === activePathway)!;

  const rankedFacilities = useMemo(() => {
    return facilities
      .map((f) => {
        const { pathwayScore, matches } = scoreFacilityForPathway(f, pw);
        return { facility: f, pathwayScore, matches };
      })
      .filter((r) => r.matches)
      .sort((a, b) => {
        // Primary sort: quality score (highest first) so the visible
        // quality badge runs in monotonic order down the list. Ties fall
        // back to the pathway relevance score.
        const qa = a.facility.quality_score ?? -1;
        const qb = b.facility.quality_score ?? -1;
        if (qb !== qa) return qb - qa;
        return b.pathwayScore - a.pathwayScore;
      })
      .slice(0, 12);
  }, [facilities, pw]);

  const relevantProviders = useMemo(() => {
    return providers
      .filter((p) =>
        pw.specialties.some(
          (s) =>
            p.specialty.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(p.specialty.toLowerCase()),
        ),
      )
      .sort((a, b) => (b.patient_rating || 0) - (a.patient_rating || 0))
      .slice(0, 8);
  }, [providers, pw]);

  const isLoading = facLoading || provLoading;

  return (
    <Layout>
      <div className="container pt-6">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/find-care" },
            { label: "Health Conditions" },
          ]}
        />
      </div>
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 lg:py-16">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {t("conditions.badge")}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-3xl font-bold text-foreground lg:text-5xl"
          >
            {t("conditions.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            {t("conditions.subtitle")}
          </motion.p>
        </div>
      </section>

      <div className="container max-w-6xl py-8 space-y-8">
        {/* Pathway selector */}
        <div className="grid gap-4 sm:grid-cols-3">
          {pathways.map((p, i) => (
            <motion.div
              key={p.key}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <Card
                className={`cursor-pointer transition-all ${activePathway === p.key ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                onClick={() => setActivePathway(p.key)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${p.bgColor}`}
                  >
                    <p.icon className={`h-6 w-6 ${p.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{p.label}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {p.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <Tabs defaultValue="facilities">
            <TabsList>
              <TabsTrigger value="facilities">
                {t("conditions.topFacilities")} ({rankedFacilities.length})
              </TabsTrigger>
              <TabsTrigger value="providers">
                {t("conditions.specialists")} ({relevantProviders.length})
              </TabsTrigger>
              <TabsTrigger value="support">
                {t("conditions.supportServices")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="facilities" className="mt-4 space-y-3">
              {rankedFacilities.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No matching facilities found for this pathway.
                </div>
              ) : (
                rankedFacilities.map(({ facility: f, pathwayScore }, i) => (
                  <motion.div
                    key={f.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i % 10}
                  >
                    <Card className="hover-lift">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className="hidden sm:flex flex-col items-center">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${f.quality_score && f.quality_score >= 80 ? "border-michigan-gold bg-michigan-gold/5" : "border-border bg-muted/50"}`}
                            >
                              <span className="text-sm font-bold text-foreground">
                                {f.quality_score || "—"}
                              </span>
                            </div>
                            <span className="mt-0.5 text-[9px] text-muted-foreground">
                              Quality
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground text-sm">
                                {f.name}
                              </h3>
                              {f.leapfrog_grade === "A" && (
                                <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">
                                  ⭐ Leapfrog A
                                </Badge>
                              )}
                              {f.is_magnet && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                  🏆 Magnet
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <MapPin className="mr-1 inline h-3 w-3" />
                              {f.city}, {f.county} County
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {f.accepting_new_patients && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Accepting
                                </span>
                              )}
                              {f.telehealth_available && (
                                <span className="flex items-center gap-1">
                                  <Wifi className="h-3 w-3" />
                                  Telehealth
                                </span>
                              )}
                              {f.system_affiliation && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {f.system_affiliation}
                                </span>
                              )}
                            </div>
                            {f.specialties && f.specialties.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {f.specialties
                                  .filter((s) =>
                                    pw.specialties.some((ps) =>
                                      s
                                        .toLowerCase()
                                        .includes(ps.toLowerCase()),
                                    ),
                                  )
                                  .slice(0, 4)
                                  .map((s) => (
                                    <Badge
                                      key={s}
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      {s}
                                    </Badge>
                                  ))}
                              </div>
                            )}
                            <div className="mt-2 flex gap-2">
                              {f.phone && (
                                <a href={`tel:${f.phone}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                  >
                                    <Phone className="mr-1 h-3 w-3" />
                                    {f.phone}
                                  </Button>
                                </a>
                              )}
                              {f.website && (
                                <a
                                  href={f.website}
                                  target="_blank"
                                  rel="noopener"
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                  >
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Website
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="providers" className="mt-4">
              {relevantProviders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No matching specialists found.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {relevantProviders.map((p, i) => {
                    const fac = p.facility_id
                      ? facilities.find((f) => f.id === p.facility_id)
                      : null;
                    return (
                      <motion.div
                        key={p.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={i}
                      >
                        <Card className="hover-lift h-full">
                          <CardContent className="py-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                  {p.first_name} {p.last_name},{" "}
                                  {p.title || "MD"}
                                </h4>
                                <p className="text-xs text-primary">
                                  {p.specialty}
                                </p>
                                {p.subspecialty && (
                                  <p className="text-[11px] text-muted-foreground">
                                    {p.subspecialty}
                                  </p>
                                )}
                              </div>
                              {p.patient_rating && (
                                <div className="flex items-center gap-1 rounded-md bg-michigan-gold/10 px-2 py-0.5">
                                  <Star className="h-3 w-3 text-michigan-gold fill-michigan-gold" />
                                  <span className="text-xs font-bold text-michigan-gold">
                                    {Number(p.patient_rating).toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {p.board_certified && (
                                <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">
                                  Board Certified
                                </Badge>
                              )}
                              {p.accepting_new_patients && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                  Accepting
                                </Badge>
                              )}
                              {p.telehealth_available && (
                                <Badge className="bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20 text-[10px]">
                                  Telehealth
                                </Badge>
                              )}
                            </div>
                            {p.languages && p.languages.length > 1 && (
                              <p className="text-[11px] text-muted-foreground">
                                🌐 {p.languages.join(", ")}
                              </p>
                            )}
                            {fac && (
                              <p className="text-[11px] text-muted-foreground">
                                <Building2 className="mr-1 inline h-3 w-3" />
                                {fac.name} · {fac.city}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="support" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {pw.supportServices.map((svc, i) => (
                  <motion.div
                    key={svc}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i}
                  >
                    <Card className="hover-lift">
                      <CardContent className="py-4 flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${pw.bgColor}`}
                        >
                          {svc.toLowerCase().includes("nutrition") ? (
                            <Apple className={`h-5 w-5 ${pw.color}`} />
                          ) : svc.toLowerCase().includes("support") ||
                            svc.toLowerCase().includes("social") ? (
                            <Heart className={`h-5 w-5 ${pw.color}`} />
                          ) : (
                            <Brain className={`h-5 w-5 ${pw.color}`} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {svc}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Available through participating facilities
                          </p>
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                <Card className="border-primary/20">
                  <CardContent className="py-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Need help finding the right care?
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Our resources connect you to quality care, financial help,
                      and community support.
                    </p>
                    <div className="flex gap-2">
                      <Link to="/find-care">
                        <Button size="sm" variant="outline" className="text-xs">
                          Find Care
                        </Button>
                      </Link>
                      <Link to="/financial-help">
                        <Button size="sm" variant="outline" className="text-xs">
                          Financial Help
                        </Button>
                      </Link>
                      <Link to="/resources">
                        <Button size="sm" variant="outline" className="text-xs">
                          Community Resources
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
