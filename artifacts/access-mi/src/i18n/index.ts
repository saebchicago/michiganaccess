import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";

async function loadLocale(lng: string): Promise<void> {
  if (lng === "en" || i18n.hasResourceBundle(lng, "translation")) return;
  let translations: Record<string, unknown>;
  switch (lng) {
    case "es":
      ({ default: translations } = await import("./locales/es.json"));
      break;
    case "ar":
      ({ default: translations } = await import("./locales/ar.json"));
      break;
    case "bn":
      ({ default: translations } = await import("./locales/bn.json"));
      break;
    default:
      return;
  }
  i18n.addResourceBundle(lng, "translation", translations, true, true);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    initImmediate: false,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  } as any);

// Pre-load the initially detected language if non-English so the
// first render avoids a flash of English on non-English browsers.
const initialLng = i18n.language?.split("-")[0];
if (initialLng && initialLng !== "en") {
  loadLocale(initialLng);
}

i18n.on("languageChanged", (lng) => {
  loadLocale(lng.split("-")[0]);
});

export { loadLocale };
export default i18n;
