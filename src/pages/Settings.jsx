import { useState } from "react";
import { User, Bell, Shield, Paintbrush, Database, Sparkles, LogOut, Command, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const menuItems = [
  { id: "profile", label: "Account Profile", icon: User },
  { id: "ai", label: "Neural Preferences", icon: Sparkles },
  { id: "appearance", label: "Interface & Theme", icon: Paintbrush },
  { id: "notifications", label: "Alerts & Notifications", icon: Bell },
  { id: "security", label: "Privacy & Security", icon: Shield },
  { id: "data", label: "Data Management", icon: Database },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-8 min-h-[calc(100vh-8rem)]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">System Preferences</h1>
          <p className="text-text-muted text-lg">Configure your learning environment and AI parameters.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Settings Navigation */}
        <div className="w-full lg:w-72 space-y-2 shrink-0">
          <div className="premium-glass-panel p-3 space-y-1 rounded-3xl">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-medium relative group",
                    isActive 
                      ? "text-white" 
                      : "text-text-muted hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="settingsNav"
                      className="absolute inset-0 bg-[#111827] border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-0"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-accent-teal" : "group-hover:text-white/70")} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
            
            <div className="h-px bg-white/5 my-2 mx-4" />
            
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="premium-glass-panel p-8 sm:p-10 rounded-[32px] relative overflow-hidden"
            >
              {activeTab === "profile" && (
                <>
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-teal/10 blur-[120px] rounded-full pointer-events-none" />
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-display font-semibold text-white mb-8 tracking-tight">Identity Profile</h3>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-10 pb-10 border-b border-white/5">
                      <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-accent-teal rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#111827] to-[#0B1120] border-2 border-white/10 p-1 relative z-10">
                          <img 
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent" 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[#060816] border border-white/10 p-2 rounded-full text-text-muted group-hover:text-white transition-colors z-20">
                          <Paintbrush className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-white mb-1">Avatar Initialization</h4>
                        <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-3">
                          Upload a custom image to personalize your neural interface. Supports JPG, PNG up to 2MB.
                        </p>
                        <div className="flex gap-3">
                          <button className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-xl transition-colors border border-white/5 text-sm">
                            Upload Image
                          </button>
                          <button className="bg-transparent hover:bg-white/5 text-text-muted hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                      <div className="space-y-2.5">
                        <label className="text-sm font-medium text-text-subtle uppercase tracking-wider">Given Name</label>
                        <input 
                          type="text" 
                          defaultValue="Alex"
                          className="w-full bg-[#060816]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent-teal focus:bg-[#060816] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-medium text-text-subtle uppercase tracking-wider">Surname</label>
                        <input 
                          type="text" 
                          defaultValue="Chen"
                          className="w-full bg-[#060816]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent-teal focus:bg-[#060816] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                      </div>
                      <div className="space-y-2.5 md:col-span-2">
                        <label className="text-sm font-medium text-text-subtle uppercase tracking-wider">Primary Email Link</label>
                        <input 
                          type="email" 
                          defaultValue="alex.chen@quantum.io"
                          className="w-full bg-[#060816]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent-teal focus:bg-[#060816] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button className="bg-transparent hover:bg-white/5 text-text-muted hover:text-white font-semibold px-6 py-3 rounded-xl transition-all">
                        Discard
                      </button>
                      <button className="bg-white text-[#060816] font-semibold px-8 py-3 rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95">
                        Apply Changes
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "ai" && (
                <>
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-orange/10 blur-[120px] rounded-full pointer-events-none" />
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-display font-semibold text-white mb-8 tracking-tight flex items-center gap-3">
                      <Zap className="text-accent-orange w-6 h-6" /> Neural Processing Engine
                    </h3>
                    
                    <div className="space-y-8">
                      <div className="p-6 bg-[#0B1120] border border-white/5 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-white mb-1">Processing Intensity</h4>
                            <p className="text-sm text-text-muted">Determines the depth of AI analysis on uploaded documents.</p>
                          </div>
                          <div className="px-3 py-1 bg-accent-orange/10 text-accent-orange rounded-lg text-xs font-bold uppercase">Pro</div>
                        </div>
                        <input type="range" className="w-full accent-accent-orange" min="1" max="3" defaultValue="2" />
                        <div className="flex justify-between text-xs text-text-muted mt-2 font-medium">
                          <span>Fast (Skim)</span>
                          <span>Balanced</span>
                          <span>Deep Analysis</span>
                        </div>
                      </div>

                      <div className="p-6 bg-[#0B1120] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-white mb-1">Adaptive Quiz Difficulty</h4>
                          <p className="text-sm text-text-muted max-w-sm">Automatically scales question complexity based on your performance history.</p>
                        </div>
                        <div className="w-14 h-8 bg-accent-teal rounded-full relative cursor-pointer border border-accent-teal/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                          <div className="w-6 h-6 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Placeholder for other tabs */}
              {["appearance", "notifications", "security", "data"].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Command className="w-12 h-12 text-text-subtle mb-4 opacity-50" />
                  <h3 className="text-xl font-medium text-white mb-2">Module Offline</h3>
                  <p className="text-text-muted">This configuration sector is currently under development.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
