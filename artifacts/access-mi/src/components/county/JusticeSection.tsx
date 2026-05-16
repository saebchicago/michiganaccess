import { motion } from "framer-motion";
import { Scale, ExternalLink, Phone, Accessibility, Globe, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CourtInfo = {
  name: string;
  type: "district" | "circuit" | "probate" | "municipal" | "other";
  address?: string;
  website?: string;
  recordsPortal?: string;
  virtualHearings?: boolean;
};

type LegalAidInfo = {
  name: string;
  website: string;
  phone?: string;
  category?: "civil" | "criminal" | "family" | "other";
};

type JusticeAccessibility = {
  languageSupport?: boolean;
  adaInformationUrl?: string;
  selfHelpCenterUrl?: string;
};

export type JusticeInfo = {
  courts: CourtInfo[];
  legalAid: LegalAidInfo[];
  accessibility?: JusticeAccessibility;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

const COURT_TYPE_LABELS: Record<CourtInfo["type"], string> = {
  district: "District Court",
  circuit: "Circuit Court",
  probate: "Probate Court",
  municipal: "Municipal Court",
  other: "Court",
};

/**
 * Generate county justice data. In production this would come from a database.
 * For now, we build reasonable defaults from county name.
 */
export function getCountyJusticeInfo(county: string): JusticeInfo {
  const countySlug = county.toLowerCase().replace(/[. ]/g, "-");
  return {
    courts: [
      {
        name: `${county} County Circuit Court`,
        type: "circuit",
        website: `https://www.courts.michigan.gov/courts/circuit-court/`,
        recordsPortal: `https://www.courts.michigan.gov/case-search/`,
        virtualHearings: true,
      },
      {
        name: `${county} County District Court`,
        type: "district",
        website: `https://www.courts.michigan.gov/courts/district-court/`,
        virtualHearings: true,
      },
      {
        name: `${county} County Probate Court`,
        type: "probate",
        website: `https://www.courts.michigan.gov/courts/probate-court/`,
      },
    ],
    legalAid: [
      {
        name: "Michigan Legal Help",
        website: "https://michiganlegalhelp.org",
        phone: "888-783-8190",
        category: "civil",
      },
      {
        name: "Legal Aid of Western Michigan",
        website: "https://lawestmi.org",
        phone: "888-783-8190",
        category: "civil",
      },
      {
        name: "Michigan Poverty Law Program",
        website: "https://mplp.org",
        category: "civil",
      },
    ],
    accessibility: {
      languageSupport: true,
      adaInformationUrl: "https://www.courts.michigan.gov/administration/offices/office-of-dispute-resolution/ada-accommodations/",
      selfHelpCenterUrl: "https://michiganlegalhelp.org",
    },
  };
}

interface Props {
  county: string;
}

export default function JusticeSection({ county }: Props) {
  const info = getCountyJusticeInfo(county);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Justice & Courts</h2>
        <Badge variant="outline" className="text-[10px] ml-auto">How to get help</Badge>
      </div>

      {/* Courts */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">If you have a court issue</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {info.courts.map((court, i) => (
            <motion.div key={court.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full hover-lift">
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold text-foreground">{court.name}</h4>
                    <Badge variant="secondary" className="text-[9px] shrink-0">
                      {COURT_TYPE_LABELS[court.type]}
                    </Badge>
                  </div>
                  {court.address && (
                    <p className="text-xs text-muted-foreground">{court.address}</p>
                  )}
                  {court.virtualHearings && (
                    <Badge variant="outline" className="text-[10px] border-michigan-teal/40 text-foreground">
                      Virtual hearings available
                    </Badge>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {court.website && (
                      <a href={court.website} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                          <Globe className="mr-1 h-3 w-3" /> Website
                        </Button>
                      </a>
                    )}
                    {court.recordsPortal && (
                      <a href={court.recordsPortal} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                          <ExternalLink className="mr-1 h-3 w-3" /> View Records
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legal Aid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Legal help and rights</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {info.legalAid.map((org, i) => (
            <motion.div key={org.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full hover-lift">
                <CardContent className="py-4 space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">{org.name}</h4>
                  {org.category && (
                    <Badge variant="secondary" className="text-[9px] capitalize">{org.category} law</Badge>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a href={org.website} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                        <Globe className="mr-1 h-3 w-3" /> Website
                      </Button>
                    </a>
                    {org.phone && (
                      <a href={`tel:${org.phone}`}>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                          <Phone className="mr-1 h-3 w-3" /> {org.phone}
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      {info.accessibility && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Accessibility</h3>
          <Card>
            <CardContent className="py-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {info.accessibility.languageSupport && (
                  <li className="flex items-center gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-primary" />
                    Language interpretation services are available — ask the court clerk.
                  </li>
                )}
                {info.accessibility.adaInformationUrl && (
                  <li className="flex items-center gap-2">
                    <Accessibility className="h-3.5 w-3.5 text-primary" />
                    <a href={info.accessibility.adaInformationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      ADA accommodations and disability access information →
                    </a>
                  </li>
                )}
                {info.accessibility.selfHelpCenterUrl && (
                  <li className="flex items-center gap-2">
                    <Scale className="h-3.5 w-3.5 text-primary" />
                    <a href={info.accessibility.selfHelpCenterUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Self-help resources — navigate the system on your own →
                    </a>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
