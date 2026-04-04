import { AlertTriangle } from "lucide-react";

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
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="text-xs text-amber-800 dark:text-amber-200">
          <p className="font-semibold">Data Grain Notice for ZIP {zipCode}</p>
          <p className="mt-1">
            {hasZipLevelHealth
              ? `Health metrics (CDC PLACES) are specific to this ZIP. Socioeconomic indicators (income, poverty, education, crime) show ${countyName} County averages because ZIP-level data is limited in public sources.`
              : `Most metrics shown reflect ${countyName} County averages. ZIP-level data is limited in public datasets.`}
          </p>
        </div>
      </div>
    </div>
  );
}
