import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Mic, ChevronDown, User, BrainCircuit, Sparkles } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const searchPlaceholders = [
  "Search concepts…",
  "Ask NeuroLearn AI…",
  "Generate adaptive quiz…",
  "Analyze weak topics…",
  "Build memory map…",
];

export function TopNavbar() {
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cycle search placeholders
  useEffect(() => {
    if (isFocused) return; // Stop cycling when focused
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", ...springConfig, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 h-[76px] z-50 px-6 flex items-center justify-between"
      style={{
        background: "rgba(5, 8, 22, 0.5)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Left: Logo & Workspace Selector */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          {/* Neural Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-neural-cyan/20 rounded-xl blur-md" />
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(56, 189, 248, 0.2))",
                border: "1px solid rgba(0, 245, 212, 0.3)",
              }}
            >
              <BrainCircuit className="w-5 h-5 text-neural-cyan" />
            </div>
          </div>
          <span className="font-display font-semibold tracking-tight text-text-primary text-lg">
            NeuroLearn
          </span>
        </div>

        <div className="h-6 w-px bg-white/8 hidden md:block" />

        <button className="hidden md:flex items-center gap-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors px-2.5 py-1.5 rounded-xl hover:bg-white/5">
          <span
            className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-bold"
            style={{
              background: "rgba(0, 245, 212, 0.15)",
              color: "#00F5D4",
            }}
          >
            A
          </span>
          Alex's Workspace
          <ChevronDown className="w-3.5 h-3.5 opacity-40" />
        </button>
      </div>

      {/* Center: Neural Command Search */}
      <div className="flex-1 max-w-xl px-8 hidden lg:block">
        <div
          className={`relative flex items-center w-full h-11 rounded-2xl transition-all duration-500 ${
            isFocused
              ? "ring-1 ring-neural-cyan/30"
              : ""
          }`}
          style={{
            background: isFocused ? "rgba(7, 17, 34, 0.8)" : "rgba(11, 16, 32, 0.5)",
            border: isFocused
              ? "1px solid rgba(0, 245, 212, 0.3)"
              : "1px solid rgba(255, 255, 255, 0.06)",
            boxShadow: isFocused
              ? "0 0 20px rgba(0, 245, 212, 0.08), inset 0 0 20px rgba(0, 245, 212, 0.03)"
              : "none",
          }}
        >
          <Search className="absolute left-4 w-4 h-4 text-text-muted" />

          {/* Cycling placeholder */}
          <div className="absolute left-11 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.span
                key={placeholderIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.4, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-text-muted"
              >
                {searchPlaceholders[placeholderIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <input
            type="text"
            className="w-full h-full bg-transparent border-none pl-11 pr-24 text-sm text-text-primary focus:outline-none"
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />

          <div className="absolute right-3 flex items-center gap-2">
            {/* Voice button */}
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-neural-cyan hover:bg-neural-cyan/10 transition-all">
              <Mic className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-void border border-white/10 text-text-muted">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-void border border-white/10 text-text-muted">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Semantic AI Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={springConfig}
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-full max-w-xl neural-glass-panel rounded-2xl p-3 shadow-2xl"
            >
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest px-3 py-2">
                AI Suggestions
              </p>
              {[
                { label: "Review mitochondria notes", icon: "📚" },
                { label: "Generate quiz on Chapter 4", icon: "🧪" },
                { label: "Analyze weak topics this week", icon: "📊" },
              ].map((s, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors text-left"
                >
                  <span>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* AI Sync Orb */}
        <div className="hidden md:flex items-center gap-2.5 border-r border-white/8 pr-4 mr-1">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-neural-cyan" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-neural-cyan animate-ring-pulse" />
          </div>
          <span className="text-xs text-text-muted font-medium">
            AI Synced
          </span>
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all relative group">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-quantum-orange">
            <span className="absolute inset-0 rounded-full bg-quantum-orange animate-ping opacity-75" />
          </span>
        </button>

        {/* Profile Orb */}
        <button className="relative ml-1 group">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-neural opacity-50 group-hover:opacity-100 blur-sm transition-opacity" />
          <div
            className="relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: "rgba(11, 16, 32, 1)",
              border: "2px solid rgba(0, 245, 212, 0.3)",
            }}
          >
            <User className="w-4 h-4 text-text-secondary" />
          </div>
        </button>
      </div>
    </motion.header>
  );
}
