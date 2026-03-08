import { useState } from "react";
import { MessageSquare, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/civic-copilot`;

interface Props {
  context: string;
  label?: string;
}

export default function AskCopilotButton({ context, label = "Ask Copilot about this page" }: Props) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setOpen(true);
    setLoading(true);
    setAnswer("");

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Based on this page context, give me a helpful summary and key takeaways:\n\n${context}`,
            },
          ],
        }),
      });

      if (!resp.ok || !resp.body) {
        setAnswer("Unable to get a response right now. Please try again later.");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              full += c;
              setAnswer(full);
            }
          } catch {}
        }
      }
      if (!full) setAnswer("No response received.");
    } catch {
      setAnswer("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={ask}>
        <MessageSquare className="h-3.5 w-3.5" />
        {label}
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> Civic Copilot
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      {loading && !answer && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
        </div>
      )}
      {answer && (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        AI-generated summary. Verify with official sources.
      </p>
    </div>
  );
}
