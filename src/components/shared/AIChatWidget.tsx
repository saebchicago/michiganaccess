import { useState, useRef, useEffect, forwardRef } from "react";
import { Send, Bot, X, MessageSquare, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// Prefer Supabase edge function (streaming) when configured; fall back to Netlify function
const CHAT_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/michigan-chat`
  : "/.netlify/functions/chat-mistral";
// When using the Netlify fallback, responses are non-streaming JSON { reply: string }
const USE_STREAMING = !!SUPABASE_URL;

const AIChatWidget = forwardRef<HTMLDivElement>(function AIChatWidget(_props, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    try {
      const supabaseKey = USE_STREAMING
        ? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "")
        : "";
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

      if (!USE_STREAMING) {
        // Netlify fallback: non-streaming JSON response { reply: string }
        const data = await resp.json();
        const reply = data.reply || "I couldn't get a response. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        assistantContent = reply;
      } else {
        // Supabase edge function: SSE streaming
        if (!resp.body) throw new Error("No response stream");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

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

        if (!assistantContent) {
          setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't get a response. Please try again." }]);
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I'm having trouble right now. ${err.message || "Please try again."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref}>
      {/* FAB — safe-area-aware via .chat-fab in index.css */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-fab w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all"
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Chat Window — safe-area-aware via .chat-window in index.css */}
      {isOpen && (
        <div className="chat-window w-[calc(100vw-2rem)] max-w-sm bg-background border border-border rounded-xl shadow-2xl flex flex-col h-[min(500px,70vh)]">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-xl flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-sm">Access Michigan Assistant</h3>
              <p className="text-xs opacity-80">Ask about Michigan services</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1.5 rounded-lg transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {/* Persistent safety disclaimer */}
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">⚠ AI Assistant.</strong> Do not enter personal health information (name, DOB, diagnosis). General questions only. For emergencies, call <a href="tel:911" className="font-semibold underline">911</a> or <a href="tel:988" className="font-semibold underline">988</a>.
            </div>

            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center text-muted-foreground px-4">
                <Bot className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm mb-2 font-medium">How can I help?</p>
                <ul className="text-xs space-y-1 opacity-70">
                  <li>Find healthcare services</li>
                  <li>Financial assistance programs</li>
                  <li>Housing & community resources</li>
                  <li>Insurance appeal guidance</li>
                </ul>
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
                    <Loader2 className="h-4 w-4 animate-spin" />
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
                aria-label="Chat message"
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
              <span className="ml-1" title="Uses public data only. No personal information is tracked or stored.">ℹ️ How this chat works</span>
            </p>
          </form>
        </div>
      )}
    </div>
  );
});

export default AIChatWidget;