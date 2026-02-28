import { Building2, BookOpen, Bus, Scale, Vote, Users, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CitizenInitiativeBanner from "@/components/civic/CitizenInitiativeBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const INFRASTRUCTURE_SECTIONS = [
  {
    icon: BookOpen,
    title: "Public Libraries",
    description: "Free internet, digital resources, community programs, meeting spaces, and literacy services across all 83 counties.",
    internalLink: "/libraries",
    internalLabel: "Browse Michigan Libraries",
    externalLink: "https://mel.org/find-a-library",
    externalLabel: "Find on MeL.org",
  },
  {
    icon: Bus,
    title: "Public Transit",
    description: "Bus, rail, and paratransit services. Michigan has 78 public transit agencies serving urban and rural communities.",
    internalLink: "/transportation",
    internalLabel: "Transportation Page",
    externalLink: "https://www.michigan.gov/mdot/travel/transit",
    externalLabel: "MDOT Transit Directory",
  },
  {
    icon: Scale,
    title: "Courts & Legal Aid",
    description: "Find Michigan courts by county, access free legal aid resources, and learn about your rights as a resident.",
    internalLink: "/civic-data",
    internalLabel: "Civic Data & FOIA",
    externalLink: "https://courts.michigan.gov/self-help",
    externalLabel: "Michigan Courts Self-Help",
  },
  {
    icon: Vote,
    title: "Voting & Elections",
    description: "Register to vote, find your polling place, track your absentee ballot, and view sample ballots — all through the Michigan Voter Information Center.",
    internalLink: "/civic-data",
    internalLabel: "Civic Data Page",
    externalLink: "https://mvic.sos.state.mi.us/",
    externalLabel: "Michigan Voter Info Center",
  },
  {
    icon: Users,
    title: "Community Centers",
    description: "Local community centers, recreation departments, and senior centers offer programs, events, and social services.",
    internalLink: "/resources",
    internalLabel: "Community Resources",
    externalLink: "https://www.michigan.gov/mdhhs/assistance-programs",
    externalLabel: "MDHHS Programs",
  },
];

const CommunityInfrastructurePage = () => {
  usePageMeta({
    title: "Community Infrastructure | Access Michigan",
    description: "Navigate Michigan's civic infrastructure — libraries, transit, courts, voting, and community centers.",
    path: "/community-infrastructure",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Civic Data Hub", href: "/civic-data-hub" }, { label: "Community Infrastructure" }]} />

      <section className="py-14 md:py-18 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">Civic Infrastructure</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Community Infrastructure
          </h1>
          <p className="text-muted-foreground">
            Access the essential civic services that serve every Michigan community — libraries, transit, courts, voting locations, and community centers.
          </p>
        </div>
      </section>

      <div className="container py-8 space-y-8 max-w-4xl">
        <CitizenInitiativeBanner />

        <div className="space-y-4">
          {INFRASTRUCTURE_SECTIONS.map((section) => (
            <Card key={section.title} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <section.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="font-bold text-foreground">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link to={section.internalLink}>
                        <Button variant="outline" size="sm" className="text-xs gap-1.5">
                          {section.internalLabel}
                        </Button>
                      </Link>
                      <a href={section.externalLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                          {section.externalLabel}
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CommunityInfrastructurePage;
