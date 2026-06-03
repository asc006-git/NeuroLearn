"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, X, Send, BrainCircuit, Bot, Mic, Zap,
  AlertTriangle, Key, ExternalLink, BookOpen, Brain,
  ClipboardList, Lightbulb, GraduationCap,
} from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

// Typing dots animation
const TypingIndicator = React.memo(function TypingIndicator() {
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
});

// API Key Troubleshooting Panel
const APIKeyTroubleshootPanel = React.memo(function APIKeyTroubleshootPanel({
  errorType,
  details,
}: {
  errorType: string;
  details: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
      className="mx-2 mb-3"
    >
      <div
        className="rounded-2xl p-4 space-y-3 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, rgba(255,138,0,0.06), rgba(239,68,68,0.04))",
          border: "1px solid rgba(255,138,0,0.2)",
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,138,0,0.1), transparent)", filter: "blur(20px)" }}
        />

        <div className="flex items-center gap-2 relative z-10">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(255,138,0,0.15)", border: "1px solid rgba(255,138,0,0.25)" }}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF8A00]" />
          </div>
          <span className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider">
            {errorType === "API_KEY_MISSING" ? "API Key Required" : errorType === "API_KEY_INVALID" ? "Invalid API Key" : errorType === "QUOTA_EXHAUSTED" ? "Quota Exhausted" : errorType === "RATE_LIMITED" ? "Rate Limited" : "Connection Issue"}
          </span>
        </div>

        <p className="text-xs text-text-muted leading-relaxed relative z-10">
          {details}
        </p>

        <div className="space-y-2 relative z-10">
          <p className="text-[10px] font-semibold text-text-ghost uppercase tracking-wider">How to fix:</p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold" style={{ background: "rgba(0,245,212,0.15)", color: "#00F5D4" }}>1</div>
              <p className="text-[11px] text-text-muted">
                Visit{" "}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-neural-cyan hover:underline inline-flex items-center gap-0.5">
                  Google AI Studio <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold" style={{ background: "rgba(0,245,212,0.15)", color: "#00F5D4" }}>2</div>
              <p className="text-[11px] text-text-muted">Generate a new API key</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold" style={{ background: "rgba(0,245,212,0.15)", color: "#00F5D4" }}>3</div>
              <p className="text-[11px] text-text-muted">
                Add to your <code className="px-1 py-0.5 rounded bg-white/5 text-neural-cyan text-[10px]">.env</code> file:
              </p>
            </div>
          </div>
          <div
            className="px-3 py-2 rounded-lg font-mono text-[10px] text-text-secondary"
            style={{ background: "rgba(5,8,22,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            GOOGLE_API_KEY=your_api_key_here
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold" style={{ background: "rgba(0,245,212,0.15)", color: "#00F5D4" }}>4</div>
            <p className="text-[11px] text-text-muted">Restart the dev server</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

interface Message {
  id: number;
  type: "ai" | "user" | "error";
  text: string;
  errorType?: string;
  errorDetails?: string;
}

type AIState = "idle" | "thinking" | "analyzing" | "synthesizing";

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: "ai", text: "Hello! I'm your Neural Assistant powered by Gemini AI. Ask me anything about your uploaded documents, or use a quick action below to get started." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiState, setAiState] = useState<AIState>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), type: "user", text: input };
    const currentInput = input;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setAiState("analyzing");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          history: messages.filter((m) => m.id !== 1 && m.type !== "error").slice(-10).map((m) => ({
            role: m.type === "ai" ? "assistant" : "user",
            text: m.text,
          })),
        }),
      });

      setAiState("synthesizing");
      const json = await res.json();

      // Handle structured error responses
      if (json.error && (json.error === "API_KEY_MISSING" || json.error === "API_KEY_INVALID" || json.error === "RATE_LIMITED" || json.error === "AI_UNAVAILABLE")) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "error" as const,
            text: json.details || "An error occurred with the AI service.",
            errorType: json.error,
            errorDetails: json.details,
          },
        ]);
      } else if (json.reply) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "ai", text: json.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "ai", text: "I couldn't process that request. Please try again." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "ai", text: "I'm having trouble connecting to the server. Please check your network and try again." },
      ]);
    } finally {
      setIsTyping(false);
      setAiState("idle");
    }
  }, [input, messages]);

  const quickActions = [
    { label: "Generate Quiz", icon: Brain, prompt: "Generate a practice quiz for me based on my documents.", color: "#00F5D4" },
    { label: "Flashcards", icon: Zap, prompt: "Can you generate a set of flashcards for the key concepts discussed in my uploaded documents?", color: "#38BDF8" },
    { label: "Weak Topics", icon: ClipboardList, prompt: "Based on my quiz performance, what are my weakest topics and how can I improve them?", color: "#FF8A00" },
    { label: "Study Plan", icon: GraduationCap, prompt: "Please create a structured, personalized study plan based on my uploaded documents.", color: "#8B5CF6" },
    { label: "Explain", icon: Lightbulb, prompt: "Choose a key concept from my documents and explain it in simple terms with a real-world analogy.", color: "#FACC15" },
  ];

  const stateLabels: Record<AIState, string | null> = {
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
                <React.Fragment key={msg.id}>
                  {msg.type === "error" ? (
                    <APIKeyTroubleshootPanel
                      errorType={msg.errorType || "UNKNOWN"}
                      details={msg.errorDetails || msg.text}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={springConfig}
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
                  )}
                </React.Fragment>
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

            {/* Quick Actions — 5 context-aware prompts */}
            <div className="px-3 pt-3 pb-1 flex gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(action.prompt);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer group hover:scale-[1.02]"
                    style={{
                      background: `${action.color}08`,
                      border: `1px solid ${action.color}20`,
                      color: `${action.color}cc`,
                    }}
                  >
                    <Icon className="w-3 h-3 shrink-0" style={{ color: action.color }} />
                    {action.label}
                  </button>
                );
              })}
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
