import { useState } from "react";
import { Link2, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareInsightProps {
  title: string;
  description: string;
  url?: string;
}

export default function ShareInsight({ title, description, url }: ShareInsightProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={copyLink}
      >
        <Link2 className="h-3.5 w-3.5" />
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        asChild
      >
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share "${title}" on LinkedIn`}
        >
          <Linkedin className="h-3.5 w-3.5" />
          Share on LinkedIn
        </a>
      </Button>
    </div>
  );
}
