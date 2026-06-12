import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, MapPin, Coffee, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

const parseItinerary = (text: string) => {
  const match = text.match(/\[itinerary\]([\s\S]*?)\[\/itinerary\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch (e) {
    console.error("Failed to parse itinerary JSON:", e);
    return null;
  }
};

const getCleanText = (text: string) => {
  return text.replace(/\[itinerary\]([\s\S]*?)\[\/itinerary\]/, "").trim();
};

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

  const startCustomItinerary = () => {
    setMessages([
      {
        role: "model",
        text: "What's the mood?",
      },
    ]);
    setIsOpen(true);
    setTimeout(() => {
      const inputEl = document.getElementById("ai-chat-input");
      if (inputEl) {
        inputEl.focus();
      }
    }, 100);
  };

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Custom itinerary highlight banner */}
      {!isOpen && (
        <button
          onClick={startCustomItinerary}
          className="bg-amber-900 border border-amber-500 text-white text-[10px] font-mono font-bold tracking-wider px-3.5 py-1.5 rounded-full shadow-lg mb-2 flex items-center gap-1.5 leading-none select-none animate-bounce cursor-pointer hover:bg-amber-800 hover:border-amber-400 transition-all duration-200"
        >
          <Sparkles className="w-3 h-3 text-white animate-pulse" />
          <span>Create a custom itinerary</span>
        </button>
      )}

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
              {messages.map((m, idx) => {
                const itinerary = m.role === "model" ? parseItinerary(m.text) : null;
                const cleanText = m.role === "model" ? getCleanText(m.text) : m.text;
                return (
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
                      <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: cleanText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
                      
                      {itinerary && (
                        <div className="mt-3 bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-3 text-left">
                          <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs border-b border-stone-250 pb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>Custom Itinerary</span>
                          </div>
                          
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {itinerary.stops?.map((stop: any, i: number) => (
                              <div key={i} className="flex gap-2 text-xs">
                                <span className="bg-amber-800 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">{i+1}</span>
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-stone-900">{stop.name}</p>
                                  {stop.description && <p className="text-[10px] text-stone-500 leading-snug">{stop.description}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {itinerary.summary && (
                            <div className="bg-white border border-stone-200 p-2 rounded-lg text-[10px] text-stone-600 leading-relaxed font-sans">
                              <strong>Summary:</strong> {itinerary.summary}
                            </div>
                          )}
                          
                          <div className="flex gap-1.5 pt-1.5 border-t border-stone-200">
                            <a
                              href={(() => {
                                if (!itinerary.stops || itinerary.stops.length === 0) return "#";
                                const origin = "Shillong, Meghalaya";
                                const destination = itinerary.stops[itinerary.stops.length - 1].name + ", Shillong, Meghalaya";
                                const waypoints = itinerary.stops.slice(0, -1).map((s: any) => s.name + ", Shillong, Meghalaya");
                                return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${waypoints.map(encodeURIComponent).join('|')}`;
                              })()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-[9px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs text-center"
                            >
                              <span>Export to GMaps</span>
                            </a>
                            <button
                              onClick={() => {
                                const printWindow = window.open("", "_blank");
                                if (!printWindow) return;
                                const stopsHTML = itinerary.stops.map((stop: any, i: number) => `
                                  <div class="stop">
                                    <div class="number">${i + 1}</div>
                                    <div class="details">
                                      <h3>${stop.name}</h3>
                                      <p>${stop.description || ''}</p>
                                    </div>
                                  </div>
                                `).join('');
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Your Custom Shillong Itinerary</title>
                                      <style>
                                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1c1917; background-color: #FAF8F5; }
                                        .header { text-align: center; border-bottom: 2px solid #8b5c1a; padding-bottom: 20px; margin-bottom: 30px; }
                                        .logo { font-size: 24px; font-weight: bold; color: #8b5c1a; letter-spacing: 1px; }
                                        .title { font-size: 20px; color: #44403c; margin-top: 10px; }
                                        .summary { font-style: italic; color: #57534e; margin-bottom: 30px; line-height: 1.5; font-size: 14px; background: #fff; padding: 15px; border-left: 4px solid #8b5c1a; border-radius: 8px; }
                                        .stop { display: flex; align-items: flex-start; margin-bottom: 20px; background: white; padding: 15px; border-radius: 12px; border: 1px solid #e7e5e4; }
                                        .number { background: #8b5c1a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 15px; flex-shrink: 0; }
                                        .details h3 { margin: 0 0 5px 0; font-size: 16px; color: #1c1917; }
                                        .details p { margin: 0; font-size: 13px; color: #57534e; line-height: 1.4; }
                                        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 20px; }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="header">
                                        <div class="logo">SHILLONG HEARTH & MAP</div>
                                        <div class="title">Custom Travel Itinerary</div>
                                      </div>
                                      <div class="summary">
                                        <strong>Summary:</strong> ${itinerary.summary}
                                      </div>
                                      <div class="stops">
                                        ${stopsHTML}
                                      </div>
                                      <div class="footer">
                                        Generated by Kong Labet AI Guide • shillongcafemap.in
                                      </div>
                                      <script>
                                        window.onload = function() {
                                          window.print();
                                          setTimeout(function() { window.close(); }, 500);
                                        }
                                      </script>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              }}
                              className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-[9px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                            >
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <span className="block text-[9px] mt-1.5 opacity-60 text-right font-mono">
                        {m.role === "user" ? "You" : "Kong Labet"}
                      </span>
                    </div>
                  </div>
                );
              })}

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
