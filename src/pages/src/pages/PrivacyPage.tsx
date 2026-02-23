import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";

const PrivacyPage = () => {
  usePageMeta({
    title: "Privacy | Access Michigan",
    description:
      "Access Michigan is designed to be useful without tracking you. Learn what we collect and what we do not.",
    path: "/privacy",
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-12 space-y-6">
        <h1 className="text-3xl font-bold">Privacy</h1>

        <p className="text-muted-foreground">
          Access Michigan is an independent civic resource. We aim to minimize data
          collection by design.
        </p>

        <h2 className="text-xl font-semibold">What we do not do</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>No targeted advertising</li>
          <li>No sale of personal data</li>
          <li>No attempt to identify individuals</li>
        </ul>

        <h2 className="text-xl font-semibold">What may be collected</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Basic operational logs from hosting (e.g., IP + request metadata)</li>
          <li>Aggregated, non-identifying usage analytics if enabled</li>
          <li>Aggregated search telemetry (if enabled) to improve relevance</li>
        </ul>

        <h2 className="text-xl font-semibold">Third-party services</h2>
        <p className="text-muted-foreground">
          If external providers (maps, APIs, hosting) are used, they may collect their
          own operational logs. We choose privacy-respecting defaults where possible.
        </p>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-muted-foreground">
          Questions? Use the site contact page.
        </p>
      </div>
    </Layout>
  );
};

export default PrivacyPage;