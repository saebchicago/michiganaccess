import { Phone, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

const CrisisBar = () => {
  const { t } = useTranslation();

  const handleQuickExit = () => {
    // Opens Google in new tab, then attempts to clear history
    window.open("https://google.com", "_blank");
    // Try to clear history (may not work in all browsers)
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
        {/* Crisis Resources */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1">
          <Phone 
            className="h-3.5 w-3.5 md:h-4 md:w-4 text-white flex-shrink-0" 
            aria-hidden="true" 
          />
          <span className="font-semibold text-white whitespace-nowrap">
            {t("crisis.inCrisis")}
          </span>
          
          {/* 988 Link */}
          
            href="tel:988"
            className="font-bold text-white hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-michigan-coral rounded px-1"
            aria-label="Call 988 Suicide and Crisis Lifeline"
          >
            988
          </a>
          
          {/* Divider */}
          <span className="text-white/70 hidden sm:inline">·</span>
          
          {/* Text HOME (mobile-friendly) */}
          <span className="text-white/90 hidden sm:inline">
            {t("crisis.textHome")} <strong>HOME</strong> to 741741
          </span>
          <span className="text-white/90 sm:hidden">
            Text HOME to 741741
          </span>
          
          {/* Divider */}
          <span c
