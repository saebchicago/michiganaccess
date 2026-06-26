import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface ZipDataGrainBannerProps {
  zipCode: string;
  countyName: string;
  hasZipLevelHealth?: boolean;
}

export function ZipDataGrainBanner({
  zipCode,
  countyName,
  hasZipLevelHealth = true,
}: ZipDataGrainBannerProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-start gap-2">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <div className="text-xs text-amber-800 dark:text-amber-200">
          <p className="font-semibold">
            Geographic resolution notice for ZIP {zipCode}
          </p>
          <p className="mt-1">
            {hasZipLevelHealth
              ? `CDC PLACES health metrics are reported at the ZCTA level, the Census Bureau's approximation of this ZIP. Socioeconomic indicators (income, poverty, education, crime) reflect ${countyName} County averages and are not specific to this ZIP.`
              : `Most metrics shown reflect ${countyName} County, the county that contains this ZIP. They are not specific to the ZIP itself.`}
          </p>
          <p className="mt-1">
            ZCTAs do not align perfectly with USPS ZIP codes and can cross
            county lines, so a single ZIP can fall within more than one county;
            AccessMI's data layer pairs each ZIP with the USPS preferred county.{" "}
            <Link
              to="/methodology#geographic-resolution"
              className="underline hover:text-amber-900 dark:hover:text-amber-100"
            >
              How resolution is labeled
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
