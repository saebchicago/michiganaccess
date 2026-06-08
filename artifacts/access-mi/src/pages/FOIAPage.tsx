import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import FOIARequestBuilder from "@/components/civic/FOIARequestBuilder";

export function FOIAPage() {
  usePageMeta({
    title: "FOIA Request Builder - Access Michigan",
    description:
      "Draft professional public records requests for Michigan municipal, county, or federal agencies. Browser-only, no data stored.",
    path: "/foia",
  });

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Transparency", href: "/transparency" },
          { label: "FOIA Request Builder" },
        ]}
      />

      <section className="bg-gradient-to-b from-primary/5 to-background py-10">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-2">
            FOIA Request Builder
          </h1>
          <p className="text-muted-foreground">
            Draft a public records request for any Michigan city, county, or
            federal agency. Generated entirely in your browser - nothing is
            stored or transmitted.
          </p>
        </div>
      </section>

      <div className="container max-w-3xl py-8">
        <FOIARequestBuilder />
      </div>
    </Layout>
  );
}
