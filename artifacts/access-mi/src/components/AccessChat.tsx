// src/components/AccessChat.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import {
  searchVerifiedClaims,
  formatVerifiedClaimsContext,
  EXAMPLE_ACCESSMI_QUERIES,
} from "@/utils/verifiedClaimsRag";
import { resolveCohortFromNaturalLanguage } from "@/utils/cohortNlResolver";

const MI_COUNTIES = [
  "Alcona",
  "Alger",
  "Allegan",
  "Alpena",
  "Antrim",
  "Arenac",
  "Baraga",
  "Barry",
  "Bay",
  "Benzie",
  "Berrien",
  "Branch",
  "Calhoun",
  "Cass",
  "Charlevoix",
  "Cheboygan",
  "Chippewa",
  "Clare",
  "Clinton",
  "Crawford",
  "Delta",
  "Dickinson",
  "Eaton",
  "Emmet",
  "Genesee",
  "Gladwin",
  "Gogebic",
  "Grand Traverse",
  "Gratiot",
  "Hillsdale",
  "Houghton",
  "Huron",
  "Ingham",
  "Ionia",
  "Iosco",
  "Iron",
  "Isabella",
  "Jackson",
  "Kalamazoo",
  "Kalkaska",
  "Kent",
  "Keweenaw",
  "Lake",
  "Lapeer",
  "Leelanau",
  "Lenawee",
  "Livingston",
  "Luce",
  "Mackinac",
  "Macomb",
  "Manistee",
  "Marquette",
  "Mason",
  "Mecosta",
  "Menominee",
  "Midland",
  "Missaukee",
  "Monroe",
  "Montcalm",
  "Montmorency",
  "Muskegon",
  "Newaygo",
  "Oakland",
  "Oceana",
  "Ogemaw",
  "Ontonagon",
  "Osceola",
  "Oscoda",
  "Otsego",
  "Ottawa",
  "Presque Isle",
  "Roscommon",
  "Saginaw",
  "Sanilac",
  "Schoolcraft",
  "Shiawassee",
  "St. Clair",
  "St. Joseph",
  "Tuscola",
  "Van Buren",
  "Washtenaw",
  "Wayne",
  "Wexford",
];

function detectCounty(text: string): string | null {
  const lower = text.toLowerCase();
  for (const county of MI_COUNTIES) {
    if (lower.includes(county.toLowerCase())) return county;
  }
  return null;
}

async function fetchContextForCounty(county: string): Promise<string> {
  if (!supabaseConfigured) return "";
  try {
    const { data: facilities } = (await (supabase.from("facilities") as any)
      .select("name, type, city, phone")
      .ilike("county", county)
      .limit(10)) as { data: any[] | null };
    const { data: resources } = (await (
      supabase.from("community_resources") as any
    )
      .select("name, category, city, phone")
      .ilike("county", county)
      .limit(10)) as { data: any[] | null };
    const parts: string[] = [];
    if (facilities?.length)
      parts.push(
        "FACILITIES:\n" +
          facilities
            .map(
              (f: any) =>
                `- ${f.name} (${f.type}) in ${f.city}${f.phone ? `, ${f.phone}` : ""}`,
            )
            .join("\n"),
      );
    if (resources?.length)
      parts.push(
        "COMMUNITY RESOURCES:\n" +
          resources
            .map(
              (r: any) =>
                `- ${r.name} (${r.category}) in ${r.city}${r.phone ? `, ${r.phone}` : ""}`,
            )
            .join("\n"),
      );
    return parts.join("\n\n");
  } catch {
    return "";
  }
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  cohortLink?: string;
  cohortSummary?: string;
};

export function AccessChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newUserMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, newUserMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    // Keep last 20 messages to prevent oversized context payloads
    const historySlice = nextMessages.slice(-20);

    try {
      const detectedCounty = detectCounty(trimmed);
      const cohortNl = resolveCohortFromNaturalLanguage(trimmed);
      const ragMatches = searchVerifiedClaims(trimmed, 8);
      const verifiedBlock = formatVerifiedClaimsContext(ragMatches);

      const dataPayload: Record<string, unknown> = {};
      if (cohortNl.matched) {
        dataPayload.cohortBuilderLink = cohortNl.href;
        dataPayload.cohortCriteriaSummary = cohortNl.summary;
      }
      if (verifiedBlock) {
        dataPayload.verifiedClaims = verifiedBlock;
        dataPayload.verifiedClaimCount = ragMatches.length;
      }

      if (detectedCounty) {
        const contextStr = await fetchContextForCounty(detectedCounty);
        if (contextStr) dataPayload.countyResources = contextStr;
      }

      const dataContext =
        Object.keys(dataPayload).length > 0
          ? {
              county: detectedCounty ?? "Michigan",
              data: dataPayload,
            }
          : undefined;

      const res = await fetch("/.netlify/functions/chat-mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an assistant for Access Michigan (accessmi.org), an independent civic platform for all 83 Michigan counties. " +
                "Ground every numeric claim in the VERIFIED CLAIMS CONTEXT when provided. " +
                "Label unverified or modeled figures clearly. " +
                "Only reference facilities and programs from the county resources context when provided. " +
                "If you lack verified data, say: 'I do not have verified data for that - see /data-sources or call Michigan 211 (dial 2-1-1).' " +
                "Never invent facility names, addresses, phone numbers, or statistics. Be clear, concise, and helpful. " +
                "When cohortBuilderLink is provided in data context, mention the Cohort Builder deep link for ZIP filtering.",
            },
            ...historySlice,
          ],
          ...(dataContext ? { dataContext } : {}),
        }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply || "",
        cohortLink: cohortNl.matched ? cohortNl.href : undefined,
        cohortSummary: cohortNl.matched ? cohortNl.summary : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError("The assistant is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-michigan-blue/5 to-primary/10 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-gradient-michigan flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Ask Access Michigan</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Questions about Michigan services, benefits, or verified public
              data. Answers cite the source manifest when available.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <div
              ref={scrollRef}
              className="h-72 overflow-y-auto p-4 space-y-3 bg-muted/20"
            >
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8 space-y-2">
                  <Bot className="h-8 w-8 mx-auto opacity-40" />
                  <p>Ask a question to get started.</p>
                  <p className="text-xs italic">
                    "Explain MI-Access in simple terms for a parent."
                  </p>
                </div>
              )}
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-michigan text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                      {m.cohortLink && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <Link
                            to={m.cohortLink}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            <Filter className="h-3 w-3" />
                            Open Cohort Builder
                            {m.cohortSummary ? ` (${m.cohortSummary})` : ""}
                          </Link>
                        </div>
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="h-6 w-6 rounded-full bg-michigan-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 text-michigan-gold-deep" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                  </div>
                  <span className="text-xs">Thinking…</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-border bg-background"
            >
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  disabled={loading}
                  className="flex-1"
                  aria-label="Chat message input"
                  maxLength={1000}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={loading || !input.trim()}
                  className="bg-gradient-michigan hover:opacity-90 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {EXAMPLE_ACCESSMI_QUERIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="text-[10px] rounded-full border px-2 py-0.5 text-muted-foreground hover:bg-muted/60 transition-colors"
                    onClick={() => setInput(q)}
                    disabled={loading}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[9px] text-muted-foreground">
                Grounded in verified claims when possible. Not medical or legal
                advice.
              </p>
            </form>

            {error && (
              <p className="text-xs text-destructive px-3 pb-2">{error}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
