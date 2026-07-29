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

const RTL_LANGS = new Set(["ar"]);

// Keep <html lang/dir> in sync with the active language. index.html
// ships a static lang="en", so without this a returning Arabic or
// Bengali visitor gets translated text under the wrong lang (wrong
// screen-reader voice) and, for Arabic, rendered LTR until they
// reopen the language switcher.
function applyDocumentLanguage(lng: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lng;
  document.documentElement.dir = RTL_LANGS.has(lng) ? "rtl" : "ltr";
}

// Pre-load the initially detected language if non-English so the
// first render avoids a flash of English on non-English browsers.
const initialLng = i18n.language?.split("-")[0];
if (initialLng && initialLng !== "en") {
  loadLocale(initialLng);
  applyDocumentLanguage(initialLng);
}

i18n.on("languageChanged", (lng) => {
  const base = lng.split("-")[0];
  loadLocale(base);
  applyDocumentLanguage(base);
});

export { loadLocale };
export default i18n;
