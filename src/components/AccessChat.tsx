// src/components/AccessChat.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function AccessChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
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
      const res = await fetch("/.netlify/functions/chat-mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an assistant for accessmi.org helping Michigan residents understand services, benefits, and MI-Access assessments. Be clear, concise, and avoid making up facts.",
            },
            ...historySlice,
          ],
        }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply || "",
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
              Questions about Michigan services, benefits, or MI-Access assessments.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <div ref={scrollRef} className="h-72 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8 space-y-2">
                  <Bot className="h-8 w-8 mx-auto opacity-40" />
                  <p>Ask a question to get started.</p>
                  <p className="text-xs italic">"Explain MI-Access in simple terms for a parent."</p>
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
                    </div>
                    {m.role === "user" && (
                      <div className="h-6 w-6 rounded-full bg-michigan-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 text-michigan-gold" />
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
            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-border bg-background">
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
