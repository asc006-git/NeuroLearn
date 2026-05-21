"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Share2, Sparkles, Search, SlidersHorizontal, BookOpen, Layers, Zap, Network } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const summaries = [
  { id: 1, title: "Neuroscience 101 - Synaptic Plasticity", date: "Oct 24, 2026", length: "Short", tags: ["Biology", "Brain"], icon: Network, color: "#00F5D4" },
  { id: 2, title: "Quantum Computing Algorithms", date: "Oct 22, 2026", length: "Detailed", tags: ["Physics", "Tech"], icon: Zap, color: "#38BDF8" },
  { id: 3, title: "Macroeconomics Principles", date: "Oct 20, 2026", length: "Bullets", tags: ["Economics"], icon: Layers, color: "#FF8A00" },
];

export default function Summaries() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeSummary, setActiveSummary] = useState(summaries[0]);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2 tracking-tight">
            Knowledge Synthesis
          </h1>
          <p className="text-text-muted text-lg">
            AI-distilled insights from your source materials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`relative w-64 flex items-center h-11 rounded-xl transition-all duration-500 ${searchFocused ? "ring-1 ring-neural-cyan/30" : ""}`}
            style={{
              background: searchFocused ? "rgba(7, 17, 34, 0.8)" : "rgba(5, 8, 22, 0.8)",
              border: searchFocused ? "1px solid rgba(0, 245, 212, 0.3)" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Search className="absolute left-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search synthesis..."
              className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
          <button className="h-11 px-4 rounded-xl hover:bg-white/5 transition-colors flex items-center text-text-muted hover:text-text-primary" style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/8 pb-4 shrink-0">
        {["All", "Recent", "Favorites", "Archived"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative"
            style={{
              background: activeTab === tab ? "linear-gradient(135deg, #00F5D4, #38BDF8)" : "transparent",
              color: activeTab === tab ? "#050816" : "#64748B",
              boxShadow: activeTab === tab ? "0 0 20px rgba(0, 245, 212, 0.15)" : "none",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Summaries List */}
        <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-2">
          {summaries.map((summary) => {
            const isActive = activeSummary.id === summary.id;
            const Icon = summary.icon;

            return (
              <motion.div
                key={summary.id}
                whileHover={{ x: 4 }}
                transition={springConfig}
                onClick={() => setActiveSummary(summary)}
                className="relative p-5 rounded-3xl cursor-pointer transition-all duration-500 overflow-hidden group"
                style={{
                  background: isActive ? "rgba(19, 27, 46, 0.8)" : "rgba(11, 16, 32, 0.6)",
                  border: isActive ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isActive ? "0 10px 40px -10px rgba(0,0,0,0.5)" : "none",
                }}
              >
                {/* Active glow */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none opacity-10"
                    style={{ background: summary.color }}
                  />
                )}

                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div
                    className="p-2.5 rounded-xl group-hover:scale-110 transition-transform"
                    style={{
                      background: `${summary.color}15`,
                      border: `1px solid ${summary.color}25`,
                      color: summary.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-text-ghost">{summary.date}</span>
                </div>
                <h3 className={`font-display font-semibold mb-3 line-clamp-2 leading-snug transition-colors ${isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"}`}>
                  {summary.title}
                </h3>
                <div className="relative z-10 flex flex-wrap items-center gap-2 mt-auto">
                  {summary.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-medium text-text-muted" style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {tag}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium ml-auto" style={{ background: `${summary.color}15`, color: summary.color }}>
                    {summary.length}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Viewer */}
        <div className="lg:col-span-8 flex flex-col neural-glass-panel rounded-[32px] overflow-hidden relative">
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none transition-all duration-700 opacity-10"
            style={{
              background: `radial-gradient(circle, ${activeSummary.color}30, transparent)`,
              filter: "blur(80px)",
            }}
          />

          {/* Header bar */}
          <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 shrink-0" style={{ background: "rgba(11, 16, 32, 0.7)", backdropFilter: "blur(20px)" }}>
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-1 tracking-tight">
                {activeSummary.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span>Distilled from 1 source</span>
                <span>•</span>
                <span>Generated {activeSummary.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all" style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Download className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all" style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Share2 className="w-4 h-4" />
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springConfig}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
                  color: "#050816",
                  boxShadow: "0 0 20px rgba(0, 245, 212, 0.15)",
                }}
              >
                <BookOpen className="w-4 h-4" />
                Focus Mode
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 flex-1 overflow-y-auto relative z-10" style={{ background: "rgba(5, 8, 22, 0.3)" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSummary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto space-y-10"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">
                      Executive Brief
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  </div>

                  <p className="text-lg text-text-secondary leading-relaxed font-light">
                    Synaptic plasticity is the biological process by which specific patterns of synaptic activity result in changes in synaptic strength and is thought to contribute to learning and memory. Both{" "}
                    <strong className="text-text-primary font-medium">long-term potentiation (LTP)</strong> and{" "}
                    <strong className="text-text-primary font-medium">long-term depression (LTD)</strong> are fundamental forms of synaptic plasticity.
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-display font-semibold text-text-primary">Core Mechanics</h3>
                  <div className="grid gap-4">
                    {[
                      { title: "Long-term potentiation (LTP)", desc: "A persistent strengthening of synapses based on recent patterns of activity. This produces a long-lasting increase in signal transmission between two neurons." },
                      { title: "Long-term depression (LTD)", desc: "An activity-dependent reduction in the efficacy of neuronal synapses lasting hours or longer following a long patterned stimulus." },
                    ].map((item, i) => (
                      <div key={i} className="p-5 rounded-2xl flex gap-4 hover:bg-white/[0.02] transition-colors" style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="mt-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: activeSummary.color, boxShadow: `0 0 8px ${activeSummary.color}60` }} />
                        </div>
                        <div>
                          <h4 className="text-text-primary font-medium mb-1">{item.title}</h4>
                          <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Synthesis callout */}
                <div
                  className="p-6 rounded-3xl relative overflow-hidden group animate-breathe"
                  style={{
                    background: `linear-gradient(135deg, ${activeSummary.color}08, transparent)`,
                    border: `1px solid ${activeSummary.color}20`,
                  }}
                >
                  <div className="relative z-10">
                    <h4 className="flex items-center gap-2 font-display font-semibold mb-3" style={{ color: activeSummary.color }}>
                      <Sparkles className="w-5 h-5" /> AI Synthesis
                    </h4>
                    <p className="text-text-secondary leading-relaxed">
                      Understanding synaptic plasticity is crucial for grasping how modern artificial neural networks were conceptually inspired by biological brains. The concept of weight adjustments in machine learning directly mirrors LTP and LTD.
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
