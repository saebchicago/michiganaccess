import { ReactNode, useRef, useState, useEffect } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** Vertical margin around the root for early triggering */
  rootMargin?: string;
  /** Minimum height placeholder to prevent layout shift */
  minHeight?: string;
}

/**
 * Defers rendering of children until the section scrolls near the viewport.
 * Uses IntersectionObserver with a generous rootMargin so content loads
 * just before the user reaches it — zero layout shift, zero wasted work.
 */
export default function LazySection({
  children,
  rootMargin = "200px 0px",
  minHeight = "120px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? children : (
        <div
          className="animate-pulse rounded-xl bg-muted/40 w-full"
          style={{ height: minHeight }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
