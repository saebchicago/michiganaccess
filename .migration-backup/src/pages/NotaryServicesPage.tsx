import { Stamp, ExternalLink, Search, MapPin, FileText } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CitizenInitiativeBanner from "@/components/civic/CitizenInitiativeBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NotaryServicesPage = () => {
  usePageMeta({
    title: "Find Notary Services in Michigan | Access Michigan",
    description: "Learn how to find a notary public in Michigan, understand notarization requirements, and access official state resources.",
    path: "/notary-services",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Civic Data Hub", href: "/civic-data-hub" }, { label: "Notary Services" }]} />

      <section className="py-14 md:py-18 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <Stamp className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">Civic Services</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Find Notary Services in Michigan</h1>
          <p className="text-muted-foreground">
            Notarization is required for many legal documents. Here's how Michigan residents can find a notary public nearby.
          </p>
        </div>
      </section>

      <div className="container py-8 space-y-8 max-w-3xl">
        <CitizenInitiativeBanner />

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" aria-hidden="true" />
              Where to Find a Notary
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                <span><strong>Banks & Credit Unions</strong> — Most branches offer free notary services to account holders.</span>
              </li>
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                <span><strong>UPS Stores & Shipping Centers</strong> — Available for a small fee, no appointment needed at most locations.</span>
              </li>
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                <span><strong>Public Libraries</strong> — Some Michigan libraries provide notary services; call ahead to confirm.</span>
              </li>
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                <span><strong>Law Offices & Real Estate Offices</strong> — Often have a notary on staff.</span>
              </li>
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                <span><strong>AAA Offices</strong> — Available for members at many Michigan locations.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              What You Need to Know
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Bring a <strong>valid photo ID</strong> (driver's license, passport, or state ID).</p>
              <p>• <strong>Do not sign</strong> the document before meeting the notary — they must witness your signature.</p>
              <p>• Michigan law caps notary fees at <strong>$10 per notarial act</strong>.</p>
              <p>• <strong>Remote Online Notarization (RON)</strong> is legal in Michigan since 2018, allowing notarization via video call.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-foreground">Official State Resources</h2>
            <div className="space-y-2">
              <a href="https://www.michigan.gov/sos/services/notary" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  Michigan Secretary of State — Notary Information
                </Button>
              </a>
              <a href="https://www.nationalnotary.org/notary-bulletin" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  National Notary Association — Find a Notary
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NotaryServicesPage;
