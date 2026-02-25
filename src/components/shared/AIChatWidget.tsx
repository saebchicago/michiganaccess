import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { chatWithAssistant } from "@/Services/aiService";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Pass conversation history for context
      const response = await chatWithAssistant(
        userMessage,
        messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to get response. Please try again.";
      setError(errorMessage);
      console.error("Chat error:", err);
      
      // Show error in chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I'm having trouble right now. ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all"
        aria-label="Open chat"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 h-[500px]">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Access Michigan Assistant</h3>
              <p className="text-sm text-blue-100">
                Questions about Michigan services?
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 p-1 rounded"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center text-gray-500">
                <p className="text-sm mb-2">👋 Hi! I can help you find:</p>
                <ul className="text-xs space-y-1">
                  <li>Healthcare services</li>
                  <li>Financial assistance</li>
                  <li>Housing help</li>
                  <li>Community resources</li>
                </ul>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg rounded-bl-none text-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-700 text-sm border-t border-red-200">
              {error}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="border-t p-3 flex gap-2 bg-white rounded-b-lg"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about services..."
              disabled={loading}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
