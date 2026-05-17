import { Search, Bell, Activity, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export function TopNavbar() {
  return (
    <header className="h-20 premium-glass sticky top-0 z-10 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-teal transition-colors" />
          <input
            type="text"
            placeholder="Search documents, summaries, or ask AI..."
            className="w-full bg-base border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/50 transition-all placeholder:text-text-muted"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-text-muted bg-white/5 border border-white/10 rounded">⌘</kbd>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-text-muted bg-white/5 border border-white/10 rounded">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-8">
        {/* AI Sync Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-sm font-medium">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>AI Synced</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-text-muted hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-orange rounded-full border-2 border-card" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Profile Dropdown */}
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-teal to-blue-500 p-[2px]">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent" 
              alt="User profile" 
              className="w-full h-full rounded-full bg-card"
            />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white leading-tight">Alex Carter</p>
            <p className="text-xs text-text-muted">Pro Plan</p>
          </div>
          <ChevronDown className="w-4 h-4 text-text-muted hidden md:block" />
        </button>
      </div>
    </header>
  );
}
