import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Share2, Sparkles, Search, SlidersHorizontal, BookOpen, Layers, Zap, Network } from "lucide-react";
import { cn } from "../lib/utils";

const summaries = [
  { id: 1, title: "Neuroscience 101 - Synaptic Plasticity", date: "Oct 24, 2026", length: "Short", tags: ["Biology", "Brain"], icon: Network, color: "text-accent-teal", bg: "bg-accent-teal/10", border: "border-accent-teal/20" },
  { id: 2, title: "Quantum Computing Algorithms", date: "Oct 22, 2026", length: "Detailed", tags: ["Physics", "Tech"], icon: Zap, color: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/20" },
  { id: 3, title: "Macroeconomics Principles", date: "Oct 20, 2026", length: "Bullets", tags: ["Economics"], icon: Layers, color: "text-accent-orange", bg: "bg-accent-orange/10", border: "border-accent-orange/20" }
];

export function Summaries() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeSummary, setActiveSummary] = useState(summaries[0]);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Knowledge Synthesis</h1>
          <p className="text-text-muted text-lg">AI-distilled insights from your source materials.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "relative w-64 flex items-center h-11 bg-[#060816] rounded-xl border transition-all duration-300",
            searchFocused ? "border-accent-teal/50 ring-1 ring-accent-teal/20" : "border-white/10 hover:border-white/20"
          )}>
            <Search className="absolute left-3 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search synthesis..." 
              className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm text-white placeholder:text-text-muted focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
          <button className="h-11 px-4 bg-[#060816] border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2 text-text-muted hover:text-white">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4 shrink-0">
        {["All", "Recent", "Favorites", "Archived"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === tab 
                ? "bg-white text-[#060816] shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                : "text-text-muted hover:text-white hover:bg-white/5"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Summaries List */}
        <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {summaries.map((summary) => {
            const isActive = activeSummary.id === summary.id;
            const Icon = summary.icon;
            
            return (
              <motion.div
                key={summary.id}
                whileHover={{ x: 4 }}
                onClick={() => setActiveSummary(summary)}
                className={cn(
                  "relative p-5 rounded-3xl cursor-pointer transition-all duration-300 border overflow-hidden group",
                  isActive 
                    ? "bg-[#111827] border-white/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]" 
                    : "bg-[#0B1120] border-white/5 hover:border-white/15"
                )}
              >
                {/* Active Indicator Glow */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="activeGlow"
                      className={`absolute inset-0 opacity-10 ${summary.bg}`}
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${summary.bg} ${summary.color} ${summary.border} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-text-subtle">{summary.date}</span>
                </div>
                <h3 className={cn(
                  "font-display font-semibold mb-3 line-clamp-2 leading-snug transition-colors",
                  isActive ? "text-white" : "text-white/80 group-hover:text-white"
                )}>
                  {summary.title}
                </h3>
                <div className="relative z-10 flex flex-wrap items-center gap-2 mt-auto">
                  {summary.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-[#060816] border border-white/5 rounded-md text-xs font-medium text-text-muted">{tag}</span>
                  ))}
                  <span className={`px-2.5 py-1 ${summary.bg} ${summary.color} rounded-md text-xs font-medium ml-auto`}>{summary.length}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Viewer */}
        <div className="lg:col-span-8 flex flex-col premium-glass-panel rounded-[32px] overflow-hidden relative border border-white/10">
          {/* Ambient Background */}
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[100px] opacity-10 rounded-full pointer-events-none transition-colors duration-700 ${activeSummary.bg}`} />
          
          <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1120]/80 backdrop-blur-xl relative z-10 shrink-0">
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-1 tracking-tight">{activeSummary.title}</h2>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span>Distilled from 1 source</span>
                <span>•</span>
                <span>Generated {activeSummary.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center bg-[#060816] border border-white/10 rounded-xl text-text-muted hover:text-white hover:border-white/20 transition-all group" title="Export">
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-[#060816] border border-white/10 rounded-xl text-text-muted hover:text-white hover:border-white/20 transition-all group" title="Share">
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button className="px-5 py-2.5 bg-white text-[#060816] font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95">
                <BookOpen className="w-4 h-4" /> 
                <span>Focus Mode</span>
              </button>
            </div>
          </div>
          
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-[#060816]/40 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSummary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto space-y-10"
              >
                {/* Content block simulation */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">Executive Brief</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                  
                  <p className="text-lg text-white/90 leading-relaxed font-light">
                    Synaptic plasticity is the biological process by which specific patterns of synaptic activity result in changes in synaptic strength and is thought to contribute to learning and memory. Both <strong className="text-white font-medium">long-term potentiation (LTP)</strong> and <strong className="text-white font-medium">long-term depression (LTD)</strong> are fundamental forms of synaptic plasticity.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-xl font-display font-semibold text-white">Core Mechanics</h3>
                  <div className="grid gap-4">
                    <div className="p-5 rounded-2xl bg-[#0B1120] border border-white/5 flex gap-4 hover:border-white/10 transition-colors">
                      <div className="mt-1">
                        <div className={`w-2 h-2 rounded-full ${activeSummary.color} glow-teal`} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Long-term potentiation (LTP)</h4>
                        <p className="text-sm text-text-muted leading-relaxed">A persistent strengthening of synapses based on recent patterns of activity. This produces a long-lasting increase in signal transmission between two neurons.</p>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#0B1120] border border-white/5 flex gap-4 hover:border-white/10 transition-colors">
                      <div className="mt-1">
                        <div className={`w-2 h-2 rounded-full ${activeSummary.color} glow-teal`} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Long-term depression (LTD)</h4>
                        <p className="text-sm text-text-muted leading-relaxed">An activity-dependent reduction in the efficacy of neuronal synapses lasting hours or longer following a long patterned stimulus.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-gradient-to-br from-accent-teal/10 to-transparent border border-accent-teal/20 rounded-3xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-accent-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <h4 className="flex items-center gap-2 text-accent-teal font-display font-semibold mb-3">
                      <Sparkles className="w-5 h-5" /> AI Synthesis
                    </h4>
                    <p className="text-white/80 leading-relaxed">
                      Understanding synaptic plasticity is crucial for grasping how modern artificial neural networks (like the architecture generating this text) were conceptually inspired by biological brains. The concept of weight adjustments in machine learning directly mirrors LTP and LTD.
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
