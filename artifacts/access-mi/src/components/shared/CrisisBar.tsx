import { Phone, LogOut } from "lucide-react";
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
      className="bg-michigan-coral backdrop-blur-sm border-b-2 border-michigan-coral/40 shadow-sm"
      role="region"
      aria-label="Crisis resources and safety options"
    >
      <div className="container flex flex-wrap items-center justify-between gap-2 md:gap-3 py-2.5 text-xs md:text-sm">
        {/* Crisis Resources Left Side */}
        <div className="flex items-center gap-1 md:gap-2 text-white">
          <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <a href="tel:988" className="font-semibold hover:underline">988</a>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Text <strong>HOME</strong> to <a href="sms:741741?body=HOME" className="font-semibold hover:underline">741741</a></span>
          <span className="sm:hidden">· <a href="sms:741741?body=HOME" className="font-semibold hover:underline">TEXT HOME</a></span>
          <span className="hidden sm:inline">· <a href="tel:211" className="font-semibold hover:underline">211</a></span>
        </div>

        {/* Quick Exit Button Right Side */}
        <button
          onClick={handleQuickExit}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/25 hover:bg-black/40 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/70"
          aria-label="Quick exit - close this page"
          title="Quick exit - close this page"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline font-semibold">Quick Exit</span>
        </button>
      </div>
    </div>
  );
};

export default CrisisBar;
