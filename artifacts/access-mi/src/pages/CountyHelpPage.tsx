/**
 * /county/<slug>/help - the full version of the county brief's resource
 * bridge. Every shortage measured in the county, every matching program, no
 * truncation, plus the inputs that could not be assessed so a reader is never
 * left thinking an unmeasured need was measured and found absent.
 */
import { Link, useParams } from "react-router-dom";
import { LifeBuoy, ArrowLeft, Phone } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import NotFound from "./NotFound";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { slugToCounty, countyToSlug } from "@/utils/countyUtils";
import { detectShortages } from "@/lib/countyShortages";
import ShortageBlock from "@/components/brief/ShortageBlock";

export default function CountyHelpPage() {
  const { slug } = useParams<{ slug: string }>();
  const county = slug ? slugToCounty(slug) : null;

  usePageMeta({
    title: county
      ? `Get help in ${county} County, MI | Access Michigan`
      : "Get help in your county | Access Michigan",
    description: county
      ? `Health, housing, food and coverage programs serving ${county} County, Michigan, matched to the shortages measured in this county, with how to apply.`
      : "Programs serving Michigan counties, matched to measured local shortages.",
    canonical: county ? `/county/${countyToSlug(county)}/help` : undefined,
  });

  if (!county) return <NotFound />;

  const { shortages, unassessed } = detectShortages(county);

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 lg:py-14">
        <div className="container max-w-3xl">
          <Breadcrumbs
            items={[
              { label: `${county} County`, href: `/county/${countyToSlug(county)}` },
              { label: "Get help" },
            ]}
          />
          <h1 className="mt-3 text-2xl font-bold text-foreground lg:text-4xl">
            Get help in {county} County
          </h1>
          <p className="mt-2 text-muted-foreground">
            Every need measured in this county, and the programs that answer it.
            Care sites listed here are physically located in {county} County.
            Assistance programs show their own coverage area, so a statewide
            program is never presented as a local one.
          </p>
          <p className="mt-3 text-sm">
            <a
              href="tel:211"
              className="inline-flex items-center gap-1.5 font-semibold text-primary underline"
            >
              <Phone className="h-4 w-4" /> Call 2-1-1
            </a>
            <span className="text-muted-foreground">
              {" "}
              for a live referral, any time, free.
            </span>
          </p>
        </div>
      </section>

      <section className="container max-w-3xl pb-16 space-y-6">
        <Card className="border-primary/20">
          <CardContent className="py-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <LifeBuoy className="h-4 w-4 text-primary" />
              Measured needs in {county} County
            </h2>

            {shortages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tracked shortage crossed its threshold in this county on the
                published figures. That is not the same as no need: call 2-1-1
                or browse the resource directory for a specific situation.
              </p>
            ) : (
              <div className="space-y-4">
                {shortages.map((s) => (
                  <ShortageBlock key={s.id} county={county} shortage={s} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {unassessed.length > 0 && (
          <Card>
            <CardContent className="py-5 space-y-2">
              <h2 className="text-sm font-bold text-foreground">
                Not yet assessed for {county} County
              </h2>
              <p className="text-xs text-muted-foreground">
                These inputs have no published county value in the current data
                vintages, so no conclusion is drawn either way.
              </p>
              <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                {unassessed.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            to={`/brief?county=${countyToSlug(county)}`}
            className="inline-flex items-center gap-1.5 text-primary underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the {county} County brief
          </Link>
          <Link to="/community-resources" className="text-primary underline">
            Browse the full resource directory
          </Link>
        </div>
      </section>
    </Layout>
  );
}
