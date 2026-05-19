import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, BrainCircuit, Bot, Mic, Zap } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

// Typing dots animation
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-neural-cyan"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.8,
            delay: i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: "ai", text: "Hello. I am your Neural Assistant. How can I assist with your studies today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiState, setAiState] = useState("idle"); // idle, thinking, analyzing, synthesizing
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setAiState("thinking");

    // Simulate AI state transitions
    setTimeout(() => setAiState("analyzing"), 500);
    setTimeout(() => setAiState("synthesizing"), 1200);

    // Simulate streaming response
    setTimeout(() => {
      setIsTyping(false);
      setAiState("idle");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "ai",
          text: "Analyzing context... I've cross-referenced your query with your uploaded documents and knowledge graph. Based on your learning patterns, I recommend focusing on the concepts you found challenging in your last quiz session.",
        },
      ]);
    }, 2000);
  };

  const quickActions = [
    { label: "Review weak topics", icon: "📊" },
    { label: "Generate quiz", icon: "🧪" },
    { label: "Summarize notes", icon: "📝" },
  ];

  const stateLabels = {
    idle: null,
    thinking: "Thinking",
    analyzing: "Analyzing context",
    synthesizing: "Synthesizing",
  };

  return (
    <>
      {/* Floating Neural Orb — collapsed state */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={springConfig}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center z-50 group cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(56, 189, 248, 0.2))",
              border: "1px solid rgba(0, 245, 212, 0.3)",
              boxShadow: "0 0 40px rgba(0, 245, 212, 0.15), inset 0 0 20px rgba(0, 245, 212, 0.1)",
            }}
          >
            {/* Breathing glow ring */}
            <div className="absolute inset-0 rounded-full animate-ring-pulse" style={{ border: "1px solid rgba(0, 245, 212, 0.3)" }} />
            <BrainCircuit className="w-6 h-6 text-neural-cyan relative z-10 drop-shadow-[0_0_10px_rgba(0,245,212,0.5)]" />
            {/* Online indicator */}
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-neural-cyan border-2 border-void" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", ...springConfig }}
            className="fixed bottom-8 right-8 w-[400px] h-[600px] max-h-[80vh] flex flex-col rounded-[28px] overflow-hidden z-50"
            style={{
              background: "rgba(7, 17, 34, 0.85)",
              backdropFilter: "blur(40px) saturate(1.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 245, 212, 0.05)",
            }}
          >
            {/* Ambient neural glow around edges */}
            <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ boxShadow: "inset 0 0 60px rgba(0, 245, 212, 0.03)" }} />

            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0 relative" style={{ background: "rgba(11, 16, 32, 0.6)" }}>
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-neural-cyan/40 via-electric-blue/30 to-quantum-orange/20" />

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl blur-md" style={{ background: "rgba(0, 245, 212, 0.2)" }} />
                  <div className="relative p-2 rounded-xl" style={{ background: "rgba(0, 245, 212, 0.1)", border: "1px solid rgba(0, 245, 212, 0.2)" }}>
                    <BrainCircuit className="w-5 h-5 text-neural-cyan relative z-10" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-text-primary leading-tight text-sm">
                    Neural Assistant
                  </h3>
                  <p className="text-xs flex items-center gap-1.5 font-medium" style={{ color: "#00F5D4" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
                    {stateLabels[aiState] || "Online"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice mode */}
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-neural-cyan hover:bg-neural-cyan/10 transition-all">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 relative" style={{ background: "rgba(5, 8, 22, 0.3)" }}>
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springConfig}
                  key={msg.id}
                  className={`flex max-w-[85%] ${msg.type === "user" ? "ml-auto justify-end" : "mr-auto"}`}
                >
                  {msg.type === "ai" && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mr-3 shrink-0 mt-1"
                      style={{
                        background: "rgba(19, 27, 46, 0.8)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Bot className="w-3.5 h-3.5 text-text-muted" />
                    </div>
                  )}
                  <div
                    className="px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: msg.type === "user"
                        ? "linear-gradient(135deg, rgba(0, 245, 212, 0.15), rgba(56, 189, 248, 0.15))"
                        : "rgba(11, 16, 32, 0.6)",
                      border: msg.type === "user"
                        ? "1px solid rgba(0, 245, 212, 0.2)"
                        : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: msg.type === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      color: msg.type === "user" ? "#F0F6FC" : "rgba(240, 246, 252, 0.85)",
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex mr-auto max-w-[85%]">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mr-3 shrink-0 mt-1"
                    style={{
                      background: "rgba(19, 27, 46, 0.8)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Bot className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <div
                    className="rounded-2xl"
                    style={{
                      background: "rgba(11, 16, 32, 0.6)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pt-3 flex gap-2 shrink-0">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                  style={{
                    background: "rgba(11, 16, 32, 0.5)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 shrink-0" style={{ background: "rgba(11, 16, 32, 0.5)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full py-3.5 pl-4 pr-12 text-sm text-text-primary focus:outline-none transition-all rounded-2xl placeholder:text-text-ghost"
                  style={{
                    background: "rgba(5, 8, 22, 0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(0, 245, 212, 0.3)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 p-2 rounded-lg text-text-muted hover:text-neural-cyan disabled:opacity-30 transition-all hover:bg-neural-cyan/10"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
