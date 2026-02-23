import Layout from "@/components/layout/Layout";

const AboutPage = () => {
  return (
    <Layout>
      <div className="container max-w-3xl py-12 space-y-6">
        <h1 className="text-3xl font-bold">About Access Michigan</h1>

        <p>
          Access Michigan is an independent civic resource that organizes public
          information across health, housing, transportation, energy, and legal
          services for all 83 Michigan counties.
        </p>

        <h2 className="text-xl font-semibold">Methodology</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Publicly available government datasets</li>
          <li>State of Michigan open data portals</li>
          <li>County and municipal service directories</li>
          <li>Non-profit and community service registries</li>
        </ul>

        <h2 className="text-xl font-semibold">Principles</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>No tracking</li>
          <li>No data selling</li>
          <li>Open civic access</li>
          <li>Human-centered navigation</li>
        </ul>

        <h2 className="text-xl font-semibold">Disclaimer</h2>
        <p>
          Access Michigan is not affiliated with any government agency. Information
          is compiled from public sources and may change.
        </p>
      </div>
    </Layout>
  );
};

export default AboutPage;