"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, Mic, ChevronDown, LogOut, BrainCircuit, Sparkles, User } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const searchPlaceholders = [
  "Search concepts…",
  "Ask NeuroLearn AI…",
  "Generate adaptive quiz…",
  "Analyze weak topics…",
  "Build memory map…",
];

export function TopNavbar() {
  const { data: session } = useSession();
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cycle search placeholders
  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused]);

  // Click outside profile menu close handler
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const userName = session?.user?.name || "Alex";
  const userAvatar = session?.user?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${userName}&backgroundColor=transparent`;

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
          <div className="relative animate-pulse">
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

        <button className="hidden md:flex items-center gap-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors px-2.5 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer">
          <span
            className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold"
            style={{
              background: "rgba(0, 245, 212, 0.15)",
              color: "#00F5D4",
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </span>
          {userName}'s Workspace
          <ChevronDown className="w-3.5 h-3.5 opacity-40" />
        </button>
      </div>

      {/* Center: Neural Command Search */}
      <div className="flex-1 max-w-xl px-8 hidden lg:block relative">
        <div
          className={`relative flex items-center w-full h-11 rounded-2xl transition-all duration-500 ${
            isFocused ? "ring-1 ring-neural-cyan/30" : ""
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
              {!isFocused && (
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
              )}
            </AnimatePresence>
          </div>

          <input
            type="text"
            className="w-full h-full bg-transparent border-none pl-11 pr-24 text-sm text-text-primary focus:outline-none"
            placeholder={isFocused ? "Type neural query..." : ""}
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
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-neural-cyan hover:bg-neural-cyan/10 transition-all cursor-pointer">
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
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-[calc(100%-4rem)] neural-glass-panel rounded-2xl p-3 shadow-2xl z-50"
            >
              <p className="text-[10px] font-bold text-text-ghost uppercase tracking-widest px-3 py-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-neural-cyan" /> Semantic Directives
              </p>
              {[
                { label: "Review mitochondria notes", icon: "📚" },
                { label: "Generate quiz on Neuroscience", icon: "🧪" },
                { label: "Analyze weak topics this week", icon: "📊" },
              ].map((s, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all text-left cursor-pointer"
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
            <div className="w-2 h-2 rounded-full bg-neural-cyan" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-neural-cyan animate-ring-pulse" />
          </div>
          <span className="text-xs text-text-muted font-medium">
            AI Synced
          </span>
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all relative group cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-quantum-orange">
            <span className="absolute inset-0 rounded-full bg-quantum-orange animate-ping opacity-75" />
          </span>
        </button>

        {/* Profile Orb with mini dynamic menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative ml-1 group cursor-pointer focus:outline-none"
          >
            <div className="absolute -inset-0.5 rounded-full bg-gradient-neural opacity-50 group-hover:opacity-100 blur-sm transition-opacity" />
            <div
              className="relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: "rgba(11, 16, 32, 1)",
                border: "2px solid rgba(0, 245, 212, 0.3)",
              }}
            >
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={springConfig}
                className="absolute right-0 mt-3.5 w-52 neural-glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-white/10"
              >
                <div className="px-3 py-2.5 border-b border-white/5 mb-1.5">
                  <p className="text-sm font-semibold text-text-primary truncate">{userName}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{session?.user?.email || "Offline Master"}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
