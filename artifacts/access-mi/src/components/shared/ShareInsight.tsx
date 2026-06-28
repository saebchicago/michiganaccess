import { useState } from "react";
import { Link2, Linkedin, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareInsightProps {
  title: string;
  description: string;
  url?: string;
}

export default function ShareInsight({
  title,
  description,
  url,
}: ShareInsightProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const text = `${title}: ${description}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs h-7 px-2"
        onClick={copyLink}
      >
        <Link2 className="h-3 w-3" />
        {copied ? "Copied!" : "Copy"}
      </Button>
      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on X`}
        >
          <Twitter className="h-3 w-3" />
        </a>
      </Button>
      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on LinkedIn`}
        >
          <Linkedin className="h-3 w-3" />
        </a>
      </Button>
      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on Facebook`}
        >
          <Facebook className="h-3 w-3" />
        </a>
      </Button>
      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
        <a href={mailUrl} aria-label={`Share via email`}>
          <Mail className="h-3 w-3" />
        </a>
      </Button>
    </div>
  );
}
