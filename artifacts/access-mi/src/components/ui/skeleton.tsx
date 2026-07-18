import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // Individual skeleton bones are decorative; the loading semantics live
      // on the wrapping region (see ContentSkeleton). motion-reduce disables
      // the pulse for users who prefer reduced motion.
      aria-hidden="true"
      className={cn(
        "animate-pulse motion-reduce:animate-none rounded-md bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
