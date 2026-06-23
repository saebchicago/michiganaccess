import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist, type WatchlistItem } from "@/hooks/useWatchlist";
import { toast } from "@/hooks/use-toast";

interface Props {
  item: Omit<WatchlistItem, "addedAt">;
  size?: "sm" | "md";
}

export default function WatchlistStar({ item, size = "sm" }: Props) {
  const { toggle, isStarred } = useWatchlist();
  const starred = isStarred(item.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
    toast({
      title: starred ? "Removed from your list" : "Saved to your list",
      description: starred ? `${item.label} removed.` : `${item.label} pinned for your next visit.`,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`shrink-0 ${size === "sm" ? "h-7 w-7" : "h-8 w-8"} transition-transform hover:scale-110 active:scale-95`}
      aria-label={starred ? `Unstar ${item.label}` : `Star ${item.label}`}
      aria-pressed={starred}
    >
      <Star
        className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} transition-colors ${
          starred ? "fill-michigan-gold text-michigan-gold-deep" : "text-muted-foreground"
        }`}
      />
    </Button>
  );
}
