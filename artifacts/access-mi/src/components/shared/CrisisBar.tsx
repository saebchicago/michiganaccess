import { Phone, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

const CrisisBar = () => {
  const { t } = useTranslation();

  const handleQuickExit = () => {
    // Match the dedicated QuickExitBar safety contract: replace this history
    // entry rather than opening an unrelated tab and attempting to walk an
    // unknown history stack.
    document.body.style.visibility = "hidden";
    window.location.replace("https://www.weather.com");
  };

  const crisisLinkClass =
    "inline-flex min-h-[44px] items-center px-1 font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

  return (
    <div
      id="crisis-bar"
      className="bg-michigan-coral backdrop-blur-sm border-b-2 border-michigan-coral/40 shadow-sm"
      role="region"
      aria-label="Crisis resources and safety options"
    >
      <div className="container flex flex-wrap items-center justify-between gap-2 md:gap-3 py-1 text-xs md:text-sm">
        <div className="flex min-w-0 items-center gap-1 md:gap-2 text-white">
          <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <a href="tel:988" className={crisisLinkClass}>988</a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span className="hidden sm:flex items-center gap-1">
            Text <strong>HOME</strong> to
            <a href="sms:741741?body=HOME" className={crisisLinkClass}>741741</a>
          </span>
          <span className="sm:hidden" aria-hidden="true">·</span>
          <a
            href="sms:741741?body=HOME"
            className={`${crisisLinkClass} sm:hidden`}
          >
            TEXT HOME
          </a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <a href="tel:211" className={`${crisisLinkClass} hidden sm:inline-flex`}>211</a>
        </div>

        <button
          onClick={handleQuickExit}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md bg-black/25 px-3 py-2 text-white transition-colors hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/70"
          aria-label="Quick exit - leave this site immediately"
          title="Quick exit - leave this site immediately"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline font-semibold">Quick Exit</span>
        </button>
      </div>
    </div>
  );
};

export default CrisisBar;
