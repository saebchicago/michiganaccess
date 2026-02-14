import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

const CrisisBar = () => {
  const { t } = useTranslation();

  return (
    <div
      className="bg-michigan-coral/10 border-b border-michigan-coral/20"
      role="banner"
      aria-label="Crisis resources"
    >
      <div className="container flex flex-wrap items-center justify-center gap-3 py-2 text-sm">
        <Phone className="h-4 w-4 text-michigan-coral" aria-hidden="true" />
        <span className="font-semibold">{t("crisis.inCrisis")}</span>
        <a
          href="tel:988"
          className="font-bold text-michigan-coral hover:underline focus:outline-none focus:ring-2 focus:ring-michigan-coral rounded px-1"
        >
          988
        </a>
        <span className="text-muted-foreground">({t("crisis.suicideCrisis")})</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {t("crisis.textHome")}
        </span>
        <span className="text-muted-foreground">·</span>
        <a
          href="tel:211"
          className="font-bold text-michigan-coral hover:underline focus:outline-none focus:ring-2 focus:ring-michigan-coral rounded px-1"
        >
          2-1-1
        </a>
        <span className="text-muted-foreground">({t("crisis.resources")})</span>
      </div>
    </div>
  );
};

export default CrisisBar;
