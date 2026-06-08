import { useState, useCallback } from "react";
import { Share2, Check, Link2, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Props {
  title: string;
  description?: string;
  /** Optional override URL - defaults to current page */
  url?: string;
}

/** Ensure share URL is same-origin or a well-formed https URL - prevents open redirect / javascript: URIs */
function getSafeUrl(url: string | undefined): string {
  const candidate = url || window.location.href;
  if (candidate.startsWith("/") || candidate.startsWith(window.location.origin)) return candidate;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "https:") return candidate;
  } catch {}
  return window.location.href;
}

export default function ShareButton({ title, description, url }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getSafeUrl(url);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [shareUrl]);

  const shareTwitter = useCallback(() => {
    const text = encodeURIComponent(`${title}${description ? ` - ${description}` : ""}`);
    const u = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${u}`, "_blank", "width=600,height=400");
  }, [title, description, shareUrl]);

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch {
        // User cancelled
      }
    } else {
      copyLink();
    }
  }, [title, description, shareUrl, copyLink]);

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  if (hasNativeShare) {
    return (
      <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={shareNative}>
        <Share2 className="h-3.5 w-3.5" /> Share
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs gap-1.5">
          <Share2 className="h-3.5 w-3.5" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-card border border-border">
        <DropdownMenuItem onClick={copyLink} className="gap-2 text-sm cursor-pointer">
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareTwitter} className="gap-2 text-sm cursor-pointer">
          <Twitter className="h-4 w-4" /> Share on X
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
