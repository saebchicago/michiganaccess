// src/components/AccessChat.tsx
import React, { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function AccessChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            ...nextMessages,
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const replyText: string = data.reply || "";

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: replyText,
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
    <div className="border rounded-lg p-4 max-w-xl w-full mx-auto bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">
        Ask Access Michigan
      </h2>
      <p className="text-sm text-gray-600 mb-3">
        Ask questions about Michigan services, benefits, or MI-Access assessments.
      </p>

      <div className="h-64 overflow-y-auto border rounded-md p-2 mb-3 bg-gray-50 text-sm space-y-2">
        {messages.length === 0 && (
          <div className="text-gray-500">
            Example: “Explain MI-Access in simple terms for a parent.”
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "text-right"
                : "text-left"
            }
          >
            <span
              className={
                "inline-block px-2 py-1 rounded " +
                (m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900")
              }
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-md px-2 py-1 text-sm"
          placeholder="Type your question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
