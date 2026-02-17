import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Heart, Users, Phone, Globe, MapPin, Clock, Search, Brain,
  Baby, Ribbon, Activity, Shield, AlertTriangle, MessageCircle, ExternalLink
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import TransportationCallout from "@/components/shared/TransportationCallout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface SupportGroup {
  id: string;
  name: string;
  organization: string;
  condition: string;
  format: "in-person" | "virtual" | "hybrid" | "phone";
  location: string;
  county: string;
  schedule: string;
  contact: string;
  website?: string;
  languages: string[];
  isFree: boolean;
  description: string;
}

const groups: SupportGroup[] = [
  {
    id: "1", name: "Living with Diabetes Support Circle", organization: "American Diabetes Association – Michigan",
    condition: "Diabetes", format: "hybrid", location: "Multiple locations statewide",
    county: "Statewide", schedule: "Every 2nd Tuesday, 6:30 PM", contact: "888-342-2383",
    website: "https://diabetes.org/", languages: ["English", "Spanish"], isFree: true,
    description: "Peer support, education, nutrition tips, and guest speakers. Open to Type 1, Type 2, and caregivers."
  },
  {
    id: "2", name: "Cancer Survivors Network", organization: "American Cancer Society – Great Lakes",
    condition: "Cancer", format: "hybrid", location: "Ann Arbor, Detroit, Grand Rapids, Traverse City",
    county: "Multiple", schedule: "Weekly, varies by location", contact: "800-227-2345",
    website: "https://www.cancer.org/", languages: ["English"], isFree: true,
    description: "Support for survivors, patients undergoing treatment, and caregivers. Connects you with trained peer mentors."
  },
  {
    id: "3", name: "NAMI Michigan Family Support", organization: "National Alliance on Mental Illness – Michigan",
    condition: "Mental Health", format: "hybrid", location: "40+ chapters across Michigan",
    county: "Statewide", schedule: "Weekly meetings", contact: "517-485-4049",
    website: "https://namimi.org/", languages: ["English"], isFree: true,
    description: "Free peer-led support groups for family members and caregivers of individuals living with mental illness."
  },
  {
    id: "4", name: "Alcoholics Anonymous – Michigan", organization: "AA Michigan",
    condition: "Substance Use", format: "hybrid", location: "1,800+ meetings statewide",
    county: "Statewide", schedule: "Daily meetings available", contact: "Find local: aa.org",
    website: "https://www.aa.org/", languages: ["English", "Spanish"], isFree: true,
    description: "Open and closed meetings for individuals seeking recovery from alcohol use disorder. Anonymous peer support."
  },
  {
    id: "5", name: "Postpartum Support International – Michigan", organization: "PSI Michigan",
    condition: "Maternal Health", format: "virtual", location: "Online / Phone",
    county: "Statewide", schedule: "Mon & Wed, 12 PM; Thurs, 7 PM", contact: "800-944-4773",
    website: "https://www.postpartum.net/", languages: ["English", "Spanish"], isFree: true,
    description: "Support for mothers experiencing postpartum depression, anxiety, OCD, or psychosis. Partners welcome."
  },
  {
    id: "6", name: "Grief Share", organization: "GriefShare Network",
    condition: "Grief & Loss", format: "in-person", location: "200+ host churches in Michigan",
    county: "Statewide", schedule: "13-week cycle, ongoing enrollment", contact: "griefshare.org",
    website: "https://www.griefshare.org/", languages: ["English"], isFree: true,
    description: "Seminar and support group for people grieving the loss of a loved one. Video-based curriculum with small-group discussion."
  },
  {
    id: "7", name: "Parkinson's Support Group – West Michigan", organization: "Parkinson's Foundation",
    condition: "Neurological", format: "in-person", location: "Spectrum Health, Grand Rapids",
    county: "Kent", schedule: "1st Saturday monthly, 10 AM", contact: "800-473-4636",
    website: "https://www.parkinson.org/", languages: ["English"], isFree: true,
    description: "Education, exercise programs, and peer support for individuals with Parkinson's and their care partners."
  },
  {
    id: "8", name: "Moms in Recovery", organization: "MDHHS / Community Mental Health",
    condition: "Substance Use", format: "hybrid", location: "Lansing, Detroit, Kalamazoo",
    county: "Multiple", schedule: "Tuesdays, 5:30 PM", contact: "211",
    languages: ["English"], isFree: true,
    description: "Specialized support for mothers in recovery from substance use disorders. Childcare provided. Trauma-informed."
  },
];

const conditionOptions = ["All Conditions", "Diabetes", "Cancer", "Mental Health", "Substance Use", "Maternal Health", "Grief & Loss", "Neurological"];
const formatOptions = ["All Formats", "in-person", "virtual", "hybrid", "phone"];

const conditionIcons: Record<string, typeof Heart> = {
  "Diabetes": Activity,
  "Cancer": Ribbon,
  "Mental Health": Brain,
  "Substance Use": AlertTriangle,
  "Maternal Health": Baby,
  "Grief & Loss": Heart,
  "Neurological": Brain,
};

export default function SupportGroupsPage() {
  usePageMeta({
    title: "Support Groups & Peer Support",
    description: "Find support groups, peer mentoring, caregiver resources, and crisis services across Michigan.",
    path: "/support",
    jsonLd: {
      "@type": "WebPage",
      name: "Support Groups — Michigan Access",
      description: "Directory of support groups and peer support services in Michigan.",
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All Conditions");
  const [formatFilter, setFormatFilter] = useState("All Formats");

  const filtered = useMemo(() => {
    return groups.filter(g => {
      if (conditionFilter !== "All Conditions" && g.condition !== conditionFilter) return false;
      if (formatFilter !== "All Formats" && g.format !== formatFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return g.name.toLowerCase().includes(q) || g.organization.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.location.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, conditionFilter, formatFilter]);

  return (
    <Layout>
      {/* Crisis banner */}
      <div className="bg-michigan-coral text-primary-foreground py-3">
        <div className="container flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className="font-semibold">In Crisis?</span>
          <a href="tel:988" className="flex items-center gap-1 underline underline-offset-2 font-bold"><Phone className="h-3.5 w-3.5" />988 Lifeline</a>
          <span>|</span>
          <span>Text HOME to <strong>741741</strong></span>
          <span>|</span>
          <a href="tel:18006624357" className="underline underline-offset-2">SAMHSA: 1-800-662-4357</a>
        </div>
      </div>

      <section className="bg-gradient-to-b from-michigan-teal/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Support Groups" }]} />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-michigan-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-teal">
              Support & Community
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Support Groups & Peer Support
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Find support groups, peer mentoring, caregiver resources, and crisis services across Michigan. You're not alone.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-8">
        {/* Filters */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search groups, organizations, or locations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={formatFilter} onValueChange={setFormatFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {formatOptions.map(f => <SelectItem key={f} value={f}>{f === "All Formats" ? f : f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="text-sm text-muted-foreground">{filtered.length} groups found</p>

        {/* Group cards */}
        <div className="space-y-3">
          {filtered.map((group, i) => {
            const Icon = conditionIcons[group.condition] || Heart;
            return (
              <motion.div key={group.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 8}>
                <Card className="hover-lift">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-michigan-teal/10 flex-shrink-0">
                        <Icon className="h-5 w-5 text-michigan-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground text-sm">{group.name}</h3>
                          <Badge variant="outline" className="text-[10px] capitalize">{group.format}</Badge>
                          {group.isFree && <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">Free</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{group.organization}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{group.location}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{group.schedule}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{group.contact}</span>
                          {group.languages.length > 1 && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{group.languages.join(", ")}</span>}
                        </div>
                        {group.website && (
                          <a href={group.website} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" />Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Separator />

        {/* Caregiver resources */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-michigan-coral" />Caregiver Resources</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Area Agency on Aging", desc: "Respite care, in-home services, meals, and caregiver support for those caring for older adults.", phone: "833-711-1927" },
              { title: "NAMI Caregiver Support", desc: "Free support groups specifically for family members caring for someone with mental illness.", phone: "517-485-4049" },
              { title: "Alzheimer's Association – Michigan", desc: "24/7 helpline, care planning, education, and support groups for dementia caregivers.", phone: "800-272-3900" },
              { title: "Michigan 2-1-1", desc: "Connect to 2,000+ local services including caregiver support, respite, and financial assistance.", phone: "211" },
            ].map((resource, i) => (
              <Card key={resource.title} className="hover-lift">
                <CardContent className="py-4">
                  <h3 className="font-semibold text-foreground text-sm">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{resource.desc}</p>
                  <a href={`tel:${resource.phone}`} className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Phone className="h-3.5 w-3.5" />{resource.phone}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        <TransportationCallout />

        <Card className="border-border/50 bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3.5 w-3.5 mr-1 text-primary" />
              <strong>Disclaimer:</strong> Support group information is provided for resource navigation only. This platform does not endorse specific groups or provide medical advice. Always verify meeting times and availability directly with the organization. If you or someone you know is in crisis, call 988 or text HOME to 741741.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
