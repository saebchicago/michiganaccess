import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateCountyPDF } from "@/utils/generateCountyPDF";
import { getALICEByCounty } from "@/data/aliceData";
import { getBroadbandByCounty } from "@/hooks/useBroadbandData";
import { getFoodAccessByCounty } from "@/hooks/useFoodAccess";
import { getCountyProfile } from "@/data/michigan-county-profiles";

interface DownloadCountyGuideProps {
  county: string;
  facilityCount?: number;
}

export default function DownloadCountyGuide({ county, facilityCount }: DownloadCountyGuideProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const alice = getALICEByCounty(county);
      const broadband = getBroadbandByCounty(county);
      const food = getFoodAccessByCounty(county);
      const profile = getCountyProfile(county);

      await generateCountyPDF({
        countyName: county,
        population: profile?.population,
        combinedHardshipPct: alice?.combinedHardshipPct,
        uninsuredPct: profile?.healthHighlights?.[0]?.value ? parseFloat(profile.healthHighlights[0].value) : undefined,
        foodInsecurityPct: food?.lowAccessPct,
        facilityCount,
        broadbandPct: broadband?.pct_25_3_covered,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading} className="gap-1.5">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? "Generating..." : "Download County Brief"}
    </Button>
  );
}
