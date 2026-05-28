import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, MapPin, Coffee, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export default function AIGuideChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Khublei! (Greetings!) I am Kong Labet, your local Shillong companion. The hills are quiet today, wrapped in warm coffee mist. Ask me about our cozy cafes, best food specialties like Jadoh, or a dreamy afternoon walking trail!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Tell me about traditional Jadoh & Dohneiiong",
    "Recommend a quiet cafe for reading",
    "Where is Dylan's Cafe?",
    "Plan a perfect rainy afternoon walk",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleAskEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.prompt) {
        setIsOpen(true);
        // Stagger slightly to allow transition
        setTimeout(() => {
          handleSendMessage(customEvent.detail.prompt);
        }, 100);
      }
    };
    window.addEventListener("ask-kong-labet", handleAskEvent);
    return () => {
      window.removeEventListener("ask-kong-labet", handleAskEvent);
    };
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", text: textToSend };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.text || "I apologize, custom connection issue. Speak to me again!" },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "The mountain mist is thick over the towers. Ask me again in a moment, dear traveler!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Launcher Button */}
      <motion.button
        id="ai-chat-launcher"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-stone-800 text-stone-100 hover:bg-amber-800 hover:text-white px-5 py-3.5 rounded-full shadow-2xl transition-colors duration-300 font-sans text-sm tracking-wide font-medium cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>Ask Local Guide</span>
        <MessageSquare className="w-4 h-4" />
      </motion.button>

      {/* Chat Window Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-window"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] bg-[#FAF8F5] border border-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-stone-800 text-stone-100 p-4 flex items-center justify-between border-b border-stone-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-800 rounded-full flex items-center justify-center font-sans font-bold text-amber-200 text-xs border border-amber-600">
                  KL
                </div>
                <div>
                  <h3 className="font-sans font-medium text-sm tracking-wide text-stone-100 flex items-center gap-1.5">
                    Kong Labet
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono">Local Guide AI • Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-150 hover:bg-stone-700/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-amber-800 text-white rounded-tr-none shadow-sm"
                        : "bg-white text-stone-800 border border-stone-200/80 rounded-tl-none shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span className="block text-[9px] mt-1.5 opacity-60 text-right font-mono">
                      {m.role === "user" ? "You" : "Kong Labet"}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-250/70 rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-xs max-w-[85%] flex items-center gap-2">
                    <span className="text-stone-500 font-mono text-xs">Kong Labet is typing</span>
                    <span className="inline-flex gap-1">
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce delay-100" />
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce delay-200" />
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce delay-300" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions & Input Section */}
            <div className="p-4 border-t border-stone-200 bg-stone-50/60 space-y-3">
              {/* Quick suggestions */}
              {messages.length === 1 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-mono font-bold">
                    Suggested conversations
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s)}
                        className="text-xs bg-white hover:bg-amber-50 hover:border-amber-400 text-stone-700 border border-stone-200 px-2.5 py-1.5 rounded-lg text-left transition-all duration-200 cursor-pointer shadow-2xs"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input field */}
              <div className="flex items-center gap-2">
                <input
                  id="ai-chat-input"
                  type="text"
                  placeholder="Ask Kong Labet..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage(input);
                  }}
                  className="flex-1 bg-white border border-stone-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all font-sans"
                />
                <button
                  id="ai-chat-send-btn"
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="bg-stone-800 text-stone-100 hover:bg-amber-800 hover:text-white disabled:opacity-40 disabled:hover:bg-stone-800 disabled:hover:text-stone-100 p-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-md select-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
