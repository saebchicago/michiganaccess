import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteAnnouncer() {
  const { pathname, hash } = useLocation();
  const [announcement, setAnnouncement] = useState("");
  const prevPath = useRef(pathname);

  // Scroll to top AND move keyboard focus to the main landmark on route
  // change, so keyboard and screen-reader users start each page at its
  // content instead of stranded deep in the previous page's navigation.
  // Hash navigations keep their own target; the first render is skipped.
  useEffect(() => {
    if (prevPath.current !== pathname) {
      window.scrollTo(0, 0);
      prevPath.current = pathname;
      if (!hash) {
        document
          .getElementById("main-content")
          ?.focus({ preventScroll: true });
      }
    }
  }, [pathname, hash]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncement(document.title || "Page loaded");
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
