import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Settings, ChevronDown, User, BrainCircuit } from "lucide-react";
import { cn } from "../../lib/utils";

export function TopNavbar() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.header 
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 h-[72px] z-50 bg-base/80 backdrop-blur-xl border-b border-border-subtle px-6 flex items-center justify-between"
    >
      {/* Left: Logo & Workspace */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-card border border-border-subtle flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-amber" />
          </div>
          <span className="font-semibold tracking-tight text-text-main">NeuroLearn</span>
        </div>
        
        <div className="h-6 w-px bg-border-subtle hidden md:block" />
        
        <button className="hidden md:flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors px-2 py-1 rounded-md hover:bg-white/5">
          <span className="w-4 h-4 rounded bg-teal/20 flex items-center justify-center text-[10px] text-teal font-medium">P</span>
          Personal Workspace
          <ChevronDown className="w-4 h-4 opacity-50" />
        </button>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl px-6 hidden lg:block">
        <div className={cn(
          "relative flex items-center w-full h-10 bg-card rounded-lg border transition-colors duration-200",
          isFocused ? "border-amber/50 ring-1 ring-accent-amber/20" : "border-border-subtle hover:border-white/15"
        )}>
          <Search className="absolute left-3 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search documents, summaries, quizzes..." 
            className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted focus:outline-none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="absolute right-2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-base border border-border-subtle text-text-muted">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-base border border-border-subtle text-text-muted">K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-border-subtle pr-4 mr-1 hidden md:flex">
          <span className="w-2 h-2 rounded-full bg-teal" />
          <span className="text-xs text-text-muted font-medium">AI Synced</span>
        </div>
        
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-text-main hover:bg-white/5 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-orange" />
        </button>
        
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-text-main hover:bg-white/5 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-amber to-orange-400 p-[2px] ml-2">
          <div className="w-full h-full rounded-full bg-base flex items-center justify-center overflow-hidden">
             <User className="w-4 h-4 text-text-muted" />
          </div>
        </button>
      </div>
    </motion.header>
  );
}
