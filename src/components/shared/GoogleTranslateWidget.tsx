import { useEffect } from "react";

/**
 * Injects the Google Translate browser widget for free dynamic content translation.
 * Static UI strings use react-i18next; this handles dynamic API data at zero cost.
 */
export default function GoogleTranslateWidget() {
  useEffect(() => {
    // Define the callback Google expects
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,es,ar,bn,zh-CN,ko,vi,pl",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Only inject script once
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      id="google_translate_element"
      className="[&_.goog-te-gadget]:text-[0px] [&_.goog-te-combo]:text-xs [&_.goog-te-combo]:rounded [&_.goog-te-combo]:border-border [&_.goog-te-combo]:bg-background [&_.goog-te-combo]:text-foreground [&_.goog-te-combo]:py-1 [&_.goog-te-combo]:px-1.5 [&_.goog-te-gadget_span]:hidden"
    />
  );
}
