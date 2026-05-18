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
      className="fixed top-0 left-0 right-0 h-[72px] z-50 bg-[#060816]/60 backdrop-blur-3xl border-b border-white/5 px-6 flex items-center justify-between"
    >
      {/* Left: Logo & Workspace */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-orange p-[1px]">
            <div className="w-full h-full rounded-lg bg-card-solid flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-accent-orange" />
            </div>
          </div>
          <span className="font-display font-semibold tracking-tight text-white">NeuroLearn</span>
        </div>
        
        <div className="h-6 w-px bg-white/10 hidden md:block" />
        
        <button className="hidden md:flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5">
          <span className="w-4 h-4 rounded bg-accent-teal/20 flex items-center justify-center text-[10px] text-accent-teal font-medium">A</span>
          Alex's Workspace
          <ChevronDown className="w-4 h-4 opacity-50" />
        </button>
      </div>

      {/* Center: Global AI Search */}
      <div className="flex-1 max-w-xl px-6 hidden lg:block">
        <div className={cn(
          "relative flex items-center w-full h-10 bg-card rounded-lg border transition-all duration-300",
          isFocused ? "border-accent-orange/50 ring-1 ring-accent-orange/20 bg-[#0B1120]" : "border-white/5 hover:border-white/15"
        )}>
          <Search className="absolute left-3 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search documents, ask AI, or find notes..." 
            className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm text-white placeholder:text-text-muted focus:outline-none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="absolute right-2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#060816] border border-white/10 text-text-muted">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#060816] border border-white/10 text-text-muted">K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-1 hidden md:flex">
          <span className="w-2 h-2 rounded-full bg-accent-teal glow-teal animate-pulse" />
          <span className="text-xs text-text-muted font-medium">AI Synced</span>
        </div>
        
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-colors relative group">
          <Bell className="w-4 h-4 group-hover:text-white transition-colors" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-accent-orange" />
        </button>
        
        <button className="w-8 h-8 rounded-full bg-gradient-orange p-[2px] ml-2 hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-full bg-card-solid flex items-center justify-center overflow-hidden">
             <User className="w-4 h-4 text-text-muted" />
          </div>
        </button>
      </div>
    </motion.header>
  );
}
