import { Share2, Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareMenuProps {
  title: string;
  url?: string;
  className?: string;
}

export default function ShareMenu({ title, url, className }: ShareMenuProps) {
  const shareUrl = url || window.location.href;
  const encoded = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(title);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className={className} aria-label="Share">
          <Share2 className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <a href={`https://twitter.com/intent/tweet?text=${text}&url=${encoded}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
            <Twitter className="h-3.5 w-3.5" /> Twitter / X
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`mailto:?subject=${text}&body=${encoded}`} className="flex items-center gap-2 cursor-pointer">
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
