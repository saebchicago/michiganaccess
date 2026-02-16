import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, Globe, Users, FileText, Scale, Building2, ExternalLink, Vote, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

// County government website patterns
const COUNTY_GOV_SITES: Record<string, string> = {
  Wayne: "https://www.waynecounty.com",
  Oakland: "https://www.oakgov.com",
  Macomb: "https://www.macombgov.org",
  Kent: "https://www.accesskent.com",
  Genesee: "https://www.gc4me.com",
  Washtenaw: "https://www.washtenaw.org",
  Ingham: "https://www.ingham.org",
  Kalamazoo: "https://www.kalcounty.com",
  Saginaw: "https://www.saginawcounty.com",
  Ottawa: "https://www.miottawa.org",
  Muskegon: "https://www.co.muskegon.mi.us",
  "St. Clair": "https://www.stclaircounty.org",
  Livingston: "https://www.livgov.com",
  Monroe: "https://www.co.monroe.mi.us",
  Jackson: "https://www.co.jackson.mi.us",
  Berrien: "https://www.berriencounty.org",
  Calhoun: "https://www.calhouncountymi.gov",
  Eaton: "https://www.eatoncounty.org",
  Bay: "https://www.baycounty-mi.gov",
  Midland: "https://www.co.midland.mi.us",
  "Grand Traverse": "https://www.grandtraverse.org",
  Marquette: "https://www.co.marquette.mi.us",
  Allegan: "https://www.allegancounty.org",
  Lenawee: "https://www.lenawee.mi.us",
};

interface CountyCivicData {
  govSite: string;
  departments: string[];
  services: string[];
  electedRoles: string[];
  hasOpenData: boolean;
  transitAgency?: string;
}

function getCountyCivicData(county: string, countyType: string): CountyCivicData {
  const govSite = COUNTY_GOV_SITES[county] || `https://www.google.com/search?q=${encodeURIComponent(county + " County Michigan government")}`;

  const baseDepts = ["Clerk/Register of Deeds", "Treasurer", "Prosecuting Attorney", "Sheriff"];
  const urbanDepts = [...baseDepts, "Health Department", "Parks & Recreation", "Community Development", "Veterans Services", "Emergency Management"];
  const suburbanDepts = [...baseDepts, "Health Department", "Parks & Recreation", "Veterans Services"];

  const baseServices = ["Property Tax Information", "Vital Records", "Court Records"];
  const urbanServices = [...baseServices, "Public Health Clinics", "Mental Health Services", "Housing Assistance", "Job Training", "Senior Services", "Transit", "Environmental Programs"];
  const suburbanServices = [...baseServices, "Public Health Programs", "Senior Services", "Parks Permits"];

  const baseRoles = ["County Executive/Administrator", "Board of Commissioners", "Sheriff", "Prosecutor", "Clerk", "Treasurer"];

  const transitMap: Record<string, string> = {
    Wayne: "DDOT / SMART",
    Oakland: "SMART",
    Macomb: "SMART",
    Washtenaw: "TheRide (AAATA)",
    Ingham: "CATA",
    Kent: "The Rapid",
    Kalamazoo: "Metro Transit",
    Genesee: "MTA Flint",
  };

  return {
    govSite,
    departments: countyType === "urban" ? urbanDepts : countyType === "suburban" ? suburbanDepts : baseDepts,
    services: countyType === "urban" ? urbanServices : countyType === "suburban" ? suburbanServices : baseServices,
    electedRoles: baseRoles,
    hasOpenData: ["Wayne", "Oakland", "Macomb", "Kent", "Washtenaw", "Ingham", "Genesee", "Kalamazoo", "Ottawa"].includes(county),
    transitAgency: transitMap[county],
  };
}

interface CountyCivicSectionProps {
  county: string;
  countyType: "urban" | "suburban" | "rural";
}

export default function CountyCivicSection({ county, countyType }: CountyCivicSectionProps) {
  const civic = getCountyCivicData(county, countyType);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Landmark className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Civic & Government</h2>
        <Link to="/civic-data">
          <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-muted">Statewide Data →</Badge>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Government Portal */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                County Government
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href={civic.govSite} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <ExternalLink className="mr-1.5 h-3 w-3" />
                  {county} County Website
                </Button>
              </a>
              <div className="flex flex-wrap gap-1.5">
                {civic.electedRoles.slice(0, 4).map((role) => (
                  <Badge key={role} variant="secondary" className="text-[10px]">{role}</Badge>
                ))}
              </div>
              {civic.transitAgency && (
                <p className="text-[11px] text-muted-foreground">
                  🚌 Transit: <strong>{civic.transitAgency}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* County Services */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-michigan-teal" />
                County Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {civic.services.slice(0, 6).map((svc) => (
                  <li key={svc} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-michigan-teal flex-shrink-0" />
                    {svc}
                  </li>
                ))}
                {civic.services.length > 6 && (
                  <li className="text-[10px] text-muted-foreground">+{civic.services.length - 6} more services</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Civic Engagement */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Vote className="h-4 w-4 text-michigan-forest" />
                Civic Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href={`https://mvic.sos.state.mi.us/`} target="_blank" rel="noopener">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Vote className="mr-1.5 h-3 w-3" />
                  Check Voter Registration
                </Button>
              </a>
              <a href={`https://www.michigan.gov/sos/elections`} target="_blank" rel="noopener">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <FileText className="mr-1.5 h-3 w-3" />
                  Election Information
                </Button>
              </a>
              {civic.hasOpenData && (
                <Badge variant="outline" className="text-[10px] w-full justify-center">
                  ✅ Open Data Available
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* County Departments (for larger counties) */}
      {(countyType === "urban" || countyType === "suburban") && (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="mt-4">
          <Card className="border-muted">
            <CardContent className="py-3">
              <p className="text-xs font-medium text-foreground mb-2">
                <Scale className="inline h-3 w-3 mr-1" />
                Key Departments
              </p>
              <div className="flex flex-wrap gap-1.5">
                {civic.departments.map((dept) => (
                  <Badge key={dept} variant="secondary" className="text-[10px]">{dept}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </section>
  );
}
