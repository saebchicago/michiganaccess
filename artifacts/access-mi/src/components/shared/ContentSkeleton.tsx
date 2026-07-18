import { Skeleton } from "@/components/ui/skeleton";

interface ContentSkeletonProps {
  variant?: "cards" | "rows" | "map";
  count?: number;
  /** Accessible label announced to assistive tech while loading. */
  label?: string;
}

export default function ContentSkeleton({
  variant = "cards",
  count = 6,
  label = "Loading content",
}: ContentSkeletonProps) {
  // The whole placeholder is one live status region: assistive tech hears the
  // label once, the decorative bones inside are aria-hidden (see Skeleton).
  const regionProps = {
    role: "status" as const,
    "aria-busy": true,
    "aria-live": "polite" as const,
  };

  if (variant === "map") {
    return (
      <div className="space-y-4" {...regionProps}>
        <span className="sr-only">{label}</span>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (variant === "rows") {
    return (
      <div className="space-y-3" {...regionProps}>
        <span className="sr-only">{label}</span>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  // cards
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" {...regionProps}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-5 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
