import { useQuery } from "@tanstack/react-query";
import { getCountyFromFips } from "@/data/census-geographies";

interface ConsumersOutages {
  reportedAt: string;
  counties: Array<{ fips: string; metersAffected: number }>;
}

export default function ConsumersOutageReports() {
  const { data, isError, isPending } = useQuery({
    queryKey: ["consumers-outage-reports"],
    queryFn: async (): Promise<ConsumersOutages> => {
      const response = await fetch("/.netlify/functions/consumers-outages");
      if (!response.ok) throw new Error("Outage feed unavailable");
      return response.json();
    },
    retry: false,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <section className="space-y-3 rounded-lg border p-4" aria-labelledby="consumers-outages">
      <h2 id="consumers-outages" className="font-semibold">Consumers Energy county outage reports</h2>
      <p className="text-sm text-muted-foreground">
        This feed covers Consumers Energy. For DTE or another utility, use its
        outage center. The counts below are reported affected meters.
      </p>
      {isPending || isError || !data ? (
        <p role="status">{isPending ? "Checking outage reports…" : "Outage feed unavailable. Check your utility’s outage center."}</p>
      ) : (
        <>
          <p className="text-sm">
            Utility feed received at{" "}
            <time dateTime={data.reportedAt}>{new Date(data.reportedAt).toLocaleString()}</time>
          </p>
          {data.counties.length === 0 ? (
            <p>No active county reports in this feed. Check your utility for a specific address.</p>
          ) : (
            <table className="w-full max-w-md text-left text-sm">
              <thead>
                <tr><th scope="col">County</th><th scope="col">Meters affected</th></tr>
              </thead>
              <tbody>
                {data.counties.map(({ fips, metersAffected }) => (
                  <tr key={fips} className="border-t">
                    <td className="py-1">{getCountyFromFips(fips.slice(2)) ?? fips}</td>
                    <td>{metersAffected.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      <a className="text-sm text-primary underline" href="https://odin.ornl.gov/swagger-ui/index.html">
        Source: Oak Ridge National Laboratory ODIN
      </a>
    </section>
  );
}
