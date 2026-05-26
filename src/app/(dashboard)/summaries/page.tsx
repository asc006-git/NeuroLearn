"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Share2, Sparkles, Search, SlidersHorizontal, BookOpen, Layers, Loader2 } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const COLORS = ["#00F5D4", "#38BDF8", "#FF8A00", "#8B5CF6"];

export default function Summaries() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSummary, setActiveSummary] = useState<any>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSummaries = async () => {
    try {
      const res = await fetch("/api/summaries");
      if (res.ok) {
        const json = await res.json();
        const data = json.summaries || [];
        setSummaries(data);
        if (data.length > 0) {
          setActiveSummary(data[0]);
        }
      }
    } catch (err) {
      console.error("Error retrieving summaries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Filter based on search query
  const filteredSummaries = summaries.filter((summary) =>
    summary.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col min-h-[35rem]">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-3xl">
          <Loader2 className="w-10 h-10 text-neural-cyan animate-spin mb-3" />
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Syncing knowledge brief syntheses...</p>
        </div>
      ) : summaries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-white/[0.01] border border-white/5 rounded-3xl p-8">
          <div className="w-16 h-16 bg-white/5 border border-white/8 rounded-2xl flex items-center justify-center mb-5 text-text-muted">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No briefs synthesized yet</h3>
          <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-6">
            Upload your source PDF files on the dashboard to trigger automatic neural distillation.
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
          {/* Summaries List */}
          <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-2">
            {filteredSummaries.map((summary, idx) => {
              const isActive = activeSummary?.id === summary.id;
              const color = COLORS[idx % COLORS.length];
              const dateStr = new Date(summary.generatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

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
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none opacity-10"
                      style={{ background: color }}
                    />
                  )}

                  <div className="relative z-10 flex items-start justify-between mb-4">
                    <div
                      className="p-2.5 rounded-xl group-hover:scale-110 transition-transform"
                      style={{
                        background: `${color}15`,
                        border: `1px solid ${color}25`,
                        color,
                      }}
                    >
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-text-ghost">{dateStr}</span>
                  </div>
                  <h3 className={`font-display font-semibold mb-3 line-clamp-2 leading-snug transition-colors ${isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"}`}>
                    {summary.title}
                  </h3>
                  <div className="relative z-10 flex flex-wrap items-center gap-2 mt-auto">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-text-muted" style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      Brief
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium ml-auto" style={{ background: `${color}15`, color }}>
                      Ingested
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Viewer */}
          <div className="lg:col-span-8 flex flex-col neural-glass-panel rounded-[32px] overflow-hidden relative min-h-0">
            {activeSummary && (
              <>
                {/* Ambient glow */}
                <div
                  className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none transition-all duration-700 opacity-10"
                  style={{
                    background: "radial-gradient(circle, #00F5D430, transparent)",
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
                      <span>Source: {activeSummary.documentTitle}</span>
                      <span>•</span>
                      <span>Generated {new Date(activeSummary.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
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

                        <p className="text-lg text-text-secondary leading-relaxed font-light whitespace-pre-line">
                          {activeSummary.executiveBrief}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-display font-semibold text-text-primary">Core Mechanics & concepts</h3>
                        <div className="grid gap-4">
                          {(() => {
                            try {
                              const parsed = JSON.parse(activeSummary.concepts);
                              return parsed.map((item: any, i: number) => (
                                <div key={i} className="p-5 rounded-2xl flex gap-4 hover:bg-white/[0.02] transition-colors" style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                  <div className="mt-1.5">
                                    <div className="w-2 h-2 rounded-full bg-neural-cyan shadow-[0_0_8px_rgba(0,245,212,0.6)]" />
                                  </div>
                                  <div>
                                    <h4 className="text-text-primary font-semibold mb-1">{item.term}</h4>
                                    <p className="text-sm text-text-muted leading-relaxed mb-2">{item.definition}</p>
                                    <p className="text-xs text-text-ghost font-mono">Application: {item.application}</p>
                                  </div>
                                </div>
                              ));
                            } catch (e) {
                              return <p className="text-xs text-text-ghost">Concept schemas loading failed.</p>;
                            }
                          })()}
                        </div>
                      </div>

                      {/* AI Synthesis callout */}
                      <div
                        className="p-6 rounded-3xl relative overflow-hidden group border border-neural-cyan/20 bg-neural-cyan/[0.02]"
                      >
                        <div className="relative z-10">
                          <h4 className="flex items-center gap-2 font-display font-semibold mb-3 text-neural-cyan">
                            <Sparkles className="w-5 h-5" /> AI Synthesis Context
                          </h4>
                          <p className="text-text-secondary leading-relaxed text-sm">
                            This brief represents high-density, vector-indexed semantic data generated during ingestion. It is integrated within your visual workspace memory block.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
