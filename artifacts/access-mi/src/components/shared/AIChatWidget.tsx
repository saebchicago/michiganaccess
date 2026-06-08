import { useState, useRef, useEffect, forwardRef } from "react";
import { Send, Bot, X, MessageSquare, Loader2, Phone, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCounty } from "@/contexts/CountyContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const CHAT_URL = `${SUPABASE_URL}/functions/v1/civic-copilot`;

/** Crisis signal detection - confidence-based, not exact match */
const CRISIS_SIGNALS = [
  "suicide", "kill myself", "end my life", "hurt myself", "self harm",
  "crisis", "homeless tonight", "eviction today", "can't afford food",
  "domestic violence", "abuse", "overdose", "emergency",
  "no where to go", "nowhere to go", "danger", "unsafe at home",
  "want to die", "need help now", "someone is hurting me",
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_SIGNALS.some((signal) => lower.includes(signal));
}

const CRISIS_BANNER = `**If you need immediate help right now:**

📞 Call **988** (Mental Health Crisis Line)
💬 Text **HOME** to **741741** (Crisis Text Line)
📞 Call **2-1-1** (Community Resources)

---

`;

const AIChatWidget = forwardRef<HTMLDivElement>(function AIChatWidget(_props, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { county } = useCounty();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const starterChips = [
    "What food pantries are near me?",
    "How do I appeal a Medicaid denial?",
    `What's the air quality in ${county || "my area"}?`,
  ];

  const handleChipClick = (chip: string) => {
    setInput(chip);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const isCrisis = detectCrisis(trimmed);

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    try {
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
      const recentMessages = newMessages.slice(-20);
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(supabaseKey ? { Authorization: `Bearer ${supabaseKey}` } : {}),
        },
        body: JSON.stringify({ messages: recentMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const crisisPrefix = isCrisis ? CRISIS_BANNER : "";
      assistantContent = crisisPrefix;

      if (crisisPrefix) {
        setMessages((prev) => [...prev, { role: "assistant", content: crisisPrefix }]);
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (!assistantContent || assistantContent === crisisPrefix) {
        setMessages((prev) => [...prev, { role: "assistant", content: (crisisPrefix || "") + "I couldn't get a response. Please try again." }]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I'm having trouble right now. ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref}>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-fab w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all"
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window w-[calc(100vw-2rem)] max-w-sm bg-background border border-border rounded-xl shadow-2xl flex flex-col h-[min(500px,70vh)]">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-xl flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-sm">Access Michigan Assistant</h3>
              <p className="text-xs opacity-80">Ask about Michigan services</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1.5 rounded-lg transition-colors" aria-label="Close chat">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {/* Safety disclaimer */}
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">⚠ AI Assistant.</strong> Do not enter personal health information. For emergencies, call <a href="tel:911" className="font-semibold underline">911</a> or <a href="tel:988" className="font-semibold underline">988</a>.
            </div>

            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center text-muted-foreground px-4">
                <Bot className="h-8 w-8 mb-3 opacity-40" aria-hidden="true" />
                <p className="text-sm mb-3 font-medium">How can I help?</p>
                {/* Starter chips */}
                <div className="flex flex-col gap-1.5 w-full max-w-[240px]">
                  {starterChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className="text-left rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                ))}
                {loading && !messages.some(m => m.role === "assistant" && m === messages[messages.length - 1]) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span className="text-xs">Thinking…</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-border p-3 bg-background rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about services…"
                disabled={loading}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                aria-label="Type a question about Michigan services"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[9px] text-muted-foreground leading-relaxed">
              This assistant explains Michigan services and public data. It cannot provide medical or legal advice.
            </p>
          </form>
        </div>
      )}
    </div>
  );
});

export default AIChatWidget;
