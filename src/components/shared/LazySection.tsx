import { useEffect, useRef, useState } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  /** How far outside the viewport to start loading (e.g. "256px") */
  rootMargin?: string;
  /** Optional className for the wrapper */
  className?: string;
}

/**
 * LazySection waits until it is near the viewport before rendering children.
 * Useful for heavy maps, dashboards, and long lists.
 */
export default function LazySection({
  children,
  rootMargin = "256px",
  className = "",
}: LazySectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shown, rootMargin]);

  return (
    <div ref={containerRef} className={className} aria-label="Lazy loaded section">
      {shown ? children : null}
    </div>
  );
}
