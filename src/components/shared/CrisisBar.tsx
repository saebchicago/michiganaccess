import { Phone, LogOut, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const CrisisBar = () => {
  const { t } = useTranslation();

  const handleQuickExit = () => {
    window.open("https://google.com", "_blank");
    if (window.history.length > 1) {
      window.history.go(-window.history.length);
    }
  };

  return (
    <div
      id="crisis-bar"
      className="sticky top-0 z-crisis-bar bg-michigan-coral/95 backdrop-blur-sm border-b-2 border-michigan-coral/30 shadow-sm"
      role="banner"
      aria-label="Crisis resources and safety options"
    >
      <div className="container flex flex-wrap items-center justify-between gap-2 md:gap-3 py-2.5 text-xs md:text-sm">
        {/* Crisis Resources Left Side */}
        <div className="flex items-center gap-1 md:gap-2 text-white">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span className="font-semibold">988</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Text <strong>HOME</strong> to 741741</span>
          <span className="sm:hidden">· TEXT HOME</span>
          <span className="hidden sm:inline">· 211</span>
        </div>

        {/* Quick Exit Button Right Side */}
        <button
          onClick={handleQuickExit}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Quick exit to Google (safety feature)"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline font-semibold">Exit</span>
        </button>
      </div>
    </div>
  );
};

export default CrisisBar;
