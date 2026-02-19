import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [announcement, setAnnouncement] = useState("");

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
