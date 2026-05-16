import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  variant: "stat" | "card" | "chart" | "table" | "paragraph";
  count?: number;
}

export default function DataSkeleton({ variant, count = 1 }: Props) {
  const items = Array.from({ length: count }, (_, i) => i);

  switch (variant) {
    case "stat":
      return (
        <div className="space-y-2">
          {items.map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-24 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      );

    case "card":
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      );

    case "chart":
      return <Skeleton className="h-48 w-full rounded-lg" />;

    case "table":
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full rounded" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded" />
          ))}
        </div>
      );

    case "paragraph":
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-4/6 rounded" />
        </div>
      );

    default:
      return <Skeleton className="h-24 w-full rounded-xl" />;
  }
}
