"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Sparkles, Search, Layers, Loader2,
  BookOpen, Cpu, Lightbulb, GraduationCap,
  ChevronDown, ChevronRight, Code2, Brain,
  ClipboardList, ListChecks, Bookmark,
  BookText, Sigma, ScrollText, Variable,
  Target, ArrowUpRight, Building2, FlaskConical, BarChart3, SquareCheckBig,
} from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const COLORS = ["#00F5D4", "#38BDF8", "#FF8A00", "#8B5CF6"];

const DOC_TYPE_CONFIG: Record<string, { color: string; icon: any }> = {
  "Research Paper": { color: "#8B5CF6", icon: BookOpen },
  "Project Report": { color: "#FF8A00", icon: ClipboardList },
  "Notes": { color: "#38BDF8", icon: FileText },
  "Technical Document": { color: "#00F5D4", icon: Code2 },
  "Book Chapter": { color: "#F472B6", icon: Bookmark },
  "Study Material": { color: "#FACC15", icon: GraduationCap },
};

type SummaryTab = "brief" | "detailed" | "insights" | "takeaways" | "concepts" | "definitions" | "facts" | "formulas" | "techstack" | "revision" | "chapters" | "objective" | "findings" | "architecture" | "methodology" | "results" | "conclusion";

export default function Summaries() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSummary, setActiveSummary] = useState<any>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SummaryTab>("brief");
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    setActiveTab("brief");
    setExpandedChapters(new Set());
  }, [activeSummary?.id]);

  // Filter based on search query
  const filteredSummaries = summaries.filter((summary) =>
    summary.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Safe JSON parse helper
  const safeJsonParse = (str: string | null | undefined, fallback: any = []) => {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch { return fallback; }
  };

  const toggleChapter = (idx: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  // Tab configuration
  const tabs: { key: SummaryTab; label: string; icon: any }[] = [
    { key: "brief", label: "Executive Brief", icon: FileText },
    { key: "objective", label: "Objective", icon: Target },
    { key: "findings", label: "Key Findings", icon: ArrowUpRight },
    { key: "architecture", label: "Architecture", icon: Building2 },
    { key: "methodology", label: "Methodology", icon: FlaskConical },
    { key: "results", label: "Results", icon: BarChart3 },
    { key: "conclusion", label: "Conclusion", icon: SquareCheckBig },
    { key: "detailed", label: "Detailed Summary", icon: BookText },
    { key: "insights", label: "Key Insights", icon: Lightbulb },
    { key: "takeaways", label: "Takeaways", icon: ScrollText },
    { key: "concepts", label: "Core Concepts", icon: Brain },
    { key: "definitions", label: "Definitions", icon: BookOpen },
    { key: "facts", label: "Facts", icon: Sigma },
    { key: "formulas", label: "Formulas", icon: Variable },
    { key: "techstack", label: "Tech Stack", icon: Cpu },
    { key: "revision", label: "Revision Notes", icon: GraduationCap },
    { key: "chapters", label: "Chapters", icon: ListChecks },
  ];

  // Determine which tabs have content
  const getTabHasContent = (tab: SummaryTab): boolean => {
    if (!activeSummary) return false;
    switch (tab) {
      case "brief": return !!activeSummary.executiveBrief;
      case "objective": return !!activeSummary.projectObjective;
      case "findings": return safeJsonParse(activeSummary.keyFindings).length > 0;
      case "architecture": return !!activeSummary.architecture;
      case "methodology": return !!activeSummary.methodology;
      case "results": return !!activeSummary.results;
      case "conclusion": return !!activeSummary.conclusion;
      case "detailed": return !!activeSummary.detailedSummary;
      case "insights": return safeJsonParse(activeSummary.keyInsights).length > 0;
      case "takeaways": return safeJsonParse(activeSummary.keyTakeaways).length > 0;
      case "concepts": return safeJsonParse(activeSummary.concepts).length > 0;
      case "definitions": return safeJsonParse(activeSummary.definitions).length > 0;
      case "facts": return safeJsonParse(activeSummary.facts).length > 0;
      case "formulas": return safeJsonParse(activeSummary.formulas).length > 0;
      case "techstack": return safeJsonParse(activeSummary.technologyStack).length > 0;
      case "revision": return !!activeSummary.revisionNotes;
      case "chapters": return safeJsonParse(activeSummary.chapterSummaries).length > 0;
      default: return false;
    }
  };

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
              const docType = summary.documentType || "Study Material";
              const typeConfig = DOC_TYPE_CONFIG[docType] || DOC_TYPE_CONFIG["Study Material"];
              const TypeIcon = typeConfig.icon;
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
                        background: `${typeConfig.color}15`,
                        border: `1px solid ${typeConfig.color}25`,
                        color: typeConfig.color,
                      }}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-text-ghost">{dateStr}</span>
                  </div>
                  <h3 className={`font-display font-semibold mb-3 line-clamp-2 leading-snug transition-colors ${isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"}`}>
                    {summary.title}
                  </h3>
                  <div className="relative z-10 flex flex-wrap items-center gap-2 mt-auto">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{ background: `${typeConfig.color}15`, color: typeConfig.color, border: `1px solid ${typeConfig.color}25` }}
                    >
                      {docType}
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
                    <div className="flex items-center gap-2 text-sm text-text-muted flex-wrap">
                      <span>Source: {activeSummary.documentTitle}</span>
                      <span>•</span>
                      <span>Generated {new Date(activeSummary.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      {activeSummary.documentType && (
                        <>
                          <span>•</span>
                          <span
                            className="px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={{
                              background: `${DOC_TYPE_CONFIG[activeSummary.documentType]?.color || "#64748B"}20`,
                              color: DOC_TYPE_CONFIG[activeSummary.documentType]?.color || "#64748B",
                            }}
                          >
                            {activeSummary.documentType}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 px-6 pt-4 pb-2 overflow-x-auto shrink-0 border-b border-white/5" style={{ background: "rgba(11, 16, 32, 0.5)" }}>
                  {tabs.map((tab) => {
                    const hasContent = getTabHasContent(tab.key);
                    if (!hasContent && tab.key !== "brief") return null;
                    const isActive = activeTab === tab.key;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                        style={{
                          background: isActive ? "rgba(0, 245, 212, 0.08)" : "transparent",
                          color: isActive ? "#00F5D4" : "#64748B",
                          border: isActive ? "1px solid rgba(0, 245, 212, 0.2)" : "1px solid transparent",
                        }}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto relative z-10" style={{ background: "rgba(5, 8, 22, 0.3)" }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeSummary.id}-${activeTab}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-3xl mx-auto space-y-8"
                    >
                      {/* ── Executive Brief (with structured sections) ── */}
                      {activeTab === "brief" && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                            <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">
                              Executive Brief
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                          </div>

                          {/* Structured summary sections */}
                          {activeSummary.projectObjective && (
                            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,138,0,0.04)", border: "1px solid rgba(255,138,0,0.12)" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-[#FF8A00]" />
                                <h4 className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider">Project Objective</h4>
                              </div>
                              <p className="text-sm text-text-secondary leading-relaxed">{activeSummary.projectObjective}</p>
                            </div>
                          )}

                          {(() => { const f = safeJsonParse(activeSummary.keyFindings); return f.length > 0 ? (
                            <div className="p-5 rounded-2xl" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
                              <div className="flex items-center gap-2 mb-3">
                                <ArrowUpRight className="w-4 h-4 text-[#8B5CF6]" />
                                <h4 className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">Key Findings</h4>
                              </div>
                              <div className="space-y-2">
                                {f.map((item: string, i: number) => (
                                  <div key={i} className="flex gap-2">
                                    <span className="text-[#8B5CF6] mt-1 shrink-0">•</span>
                                    <p className="text-sm text-text-secondary leading-relaxed">{item}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null})()}

                          {activeSummary.architecture && (
                            <div className="p-5 rounded-2xl" style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.12)" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-4 h-4 text-[#38BDF8]" />
                                <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Architecture</h4>
                              </div>
                              <p className="text-sm text-text-secondary leading-relaxed">{activeSummary.architecture}</p>
                            </div>
                          )}

                          {activeSummary.methodology && (
                            <div className="p-5 rounded-2xl" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <FlaskConical className="w-4 h-4 text-[#10B981]" />
                                <h4 className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Methodology</h4>
                              </div>
                              <p className="text-sm text-text-secondary leading-relaxed">{activeSummary.methodology}</p>
                            </div>
                          )}

                          {activeSummary.results && (
                            <div className="p-5 rounded-2xl" style={{ background: "rgba(244,114,182,0.04)", border: "1px solid rgba(244,114,182,0.12)" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-4 h-4 text-[#F472B6]" />
                                <h4 className="text-xs font-bold text-[#F472B6] uppercase tracking-wider">Results</h4>
                              </div>
                              <p className="text-sm text-text-secondary leading-relaxed">{activeSummary.results}</p>
                            </div>
                          )}

                          {activeSummary.conclusion && (
                            <div className="p-5 rounded-2xl" style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.12)" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <SquareCheckBig className="w-4 h-4 text-neural-cyan" />
                                <h4 className="text-xs font-bold text-neural-cyan uppercase tracking-wider">Conclusion</h4>
                              </div>
                              <p className="text-sm text-text-secondary leading-relaxed">{activeSummary.conclusion}</p>
                            </div>
                          )}

                          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                          <div className="text-[15px] text-text-secondary leading-[1.85] font-light whitespace-pre-line">
                            {activeSummary.executiveBrief}
                          </div>
                        </div>
                      )}

                      {/* ── Project Objective ── */}
                      {activeTab === "objective" && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Target className="w-5 h-5 text-[#FF8A00]" />
                            <h3 className="text-xl font-display font-semibold text-text-primary">Project Objective</h3>
                          </div>
                          <div
                            className="p-6 rounded-2xl"
                            style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <p className="text-sm text-text-secondary leading-[1.9] whitespace-pre-line font-light">
                              {activeSummary.projectObjective || "No objective extracted for this document."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── Key Findings ── */}
                      {activeTab === "findings" && (() => {
                        const findings = safeJsonParse(activeSummary.keyFindings);
                        return findings.length > 0 ? (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <ArrowUpRight className="w-5 h-5 text-[#8B5CF6]" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Key Findings</h3>
                            </div>
                            <div className="space-y-3">
                              {findings.map((item: string, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex gap-3 p-4 rounded-2xl"
                                  style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                  <div className="mt-1 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                  </div>
                                  <p className="text-sm text-text-secondary leading-relaxed">{item}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-text-muted text-sm">No key findings extracted for this document.</div>
                        );
                      })()}

                      {/* ── Architecture ── */}
                      {activeTab === "architecture" && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Building2 className="w-5 h-5 text-[#38BDF8]" />
                            <h3 className="text-xl font-display font-semibold text-text-primary">Architecture</h3>
                          </div>
                          <div
                            className="p-6 rounded-2xl"
                            style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <p className="text-sm text-text-secondary leading-[1.9] whitespace-pre-line font-light">
                              {activeSummary.architecture || "No architecture information extracted for this document."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── Methodology ── */}
                      {activeTab === "methodology" && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <FlaskConical className="w-5 h-5 text-[#10B981]" />
                            <h3 className="text-xl font-display font-semibold text-text-primary">Methodology</h3>
                          </div>
                          <div
                            className="p-6 rounded-2xl"
                            style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <p className="text-sm text-text-secondary leading-[1.9] whitespace-pre-line font-light">
                              {activeSummary.methodology || "No methodology information extracted for this document."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── Results ── */}
                      {activeTab === "results" && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="w-5 h-5 text-[#F472B6]" />
                            <h3 className="text-xl font-display font-semibold text-text-primary">Results</h3>
                          </div>
                          <div
                            className="p-6 rounded-2xl"
                            style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <p className="text-sm text-text-secondary leading-[1.9] whitespace-pre-line font-light">
                              {activeSummary.results || "No results extracted for this document."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── Conclusion ── */}
                      {activeTab === "conclusion" && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <SquareCheckBig className="w-5 h-5 text-neural-cyan" />
                            <h3 className="text-xl font-display font-semibold text-text-primary">Conclusion</h3>
                          </div>
                          <div
                            className="p-6 rounded-2xl"
                            style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <p className="text-sm text-text-secondary leading-[1.9] whitespace-pre-line font-light">
                              {activeSummary.conclusion || "No conclusion extracted for this document."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── Detailed Summary ── */}
                      {activeTab === "detailed" && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                            <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">
                              Detailed Analysis
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                          </div>
                          <div className="text-[15px] text-text-secondary leading-[1.85] font-light whitespace-pre-line">
                            {activeSummary.detailedSummary}
                          </div>
                        </div>
                      )}

                      {/* ── Key Takeaways ── */}
                      {activeTab === "takeaways" && (() => {
                        const takeaways = safeJsonParse(activeSummary.keyTakeaways);
                        return takeaways.length > 0 ? (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <ScrollText className="w-5 h-5 text-[#8B5CF6]" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Key Takeaways</h3>
                            </div>
                            <div className="grid gap-3">
                              {takeaways.map((item: string, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex gap-3 p-4 rounded-2xl"
                                  style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                  <div className="mt-1 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                  </div>
                                  <p className="text-sm text-text-secondary leading-relaxed">{item}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-text-muted text-sm">No takeaways extracted for this document.</div>
                        );
                      })()}

                      {/* ── Key Insights ── */}
                      {activeTab === "insights" && (() => {
                        const insights = safeJsonParse(activeSummary.keyInsights);
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Lightbulb className="w-5 h-5 text-[#FACC15]" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Key Insights</h3>
                            </div>
                            <div className="space-y-3">
                              {insights.map((insight: string, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex gap-3 p-4 rounded-2xl"
                                  style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                  <div className="mt-1 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                  </div>
                                  <p className="text-sm text-text-secondary leading-relaxed">{insight}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ── Core Concepts ── */}
                      {activeTab === "concepts" && (() => {
                        const concepts = safeJsonParse(activeSummary.concepts);
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Brain className="w-5 h-5 text-neural-cyan" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Core Concepts</h3>
                            </div>
                            <div className="grid gap-4">
                              {concepts.map((item: any, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.08 }}
                                  className="p-5 rounded-2xl hover:bg-white/[0.02] transition-colors"
                                  style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="mt-1.5 shrink-0">
                                      <div className="w-2.5 h-2.5 rounded-full bg-neural-cyan shadow-[0_0_8px_rgba(0,245,212,0.6)]" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-text-primary font-semibold mb-2 text-[15px]">
                                        {item.name || item.term}
                                      </h4>
                                      <p className="text-sm text-text-muted leading-relaxed mb-3">
                                        {item.explanation || item.definition}
                                      </p>
                                      {(item.importance || item.application) && (
                                        <div className="flex items-start gap-2 mt-2 p-3 rounded-xl" style={{ background: "rgba(0, 245, 212, 0.03)", border: "1px solid rgba(0, 245, 212, 0.08)" }}>
                                          <Sparkles className="w-3.5 h-3.5 text-neural-cyan shrink-0 mt-0.5" />
                                          <p className="text-xs text-text-ghost leading-relaxed">
                                            {item.importance || item.application}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ── Definitions ── */}
                      {activeTab === "definitions" && (() => {
                        const defs = safeJsonParse(activeSummary.definitions);
                        return defs.length > 0 ? (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <BookOpen className="w-5 h-5 text-[#38BDF8]" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Key Definitions</h3>
                              <span className="text-xs text-text-ghost px-2 py-0.5 rounded-lg bg-white/5">{defs.length} terms</span>
                            </div>
                            <div className="grid gap-4">
                              {defs.map((item: any, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.06 }}
                                  className="p-5 rounded-2xl"
                                  style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                  <h4 className="text-text-primary font-semibold mb-2 text-[15px] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                                    {item.term || item.name}
                                  </h4>
                                  <p className="text-sm text-text-muted leading-relaxed pl-4">
                                    {item.definition || item.def}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-text-muted text-sm">No definitions extracted for this document.</div>
                        );
                      })()}

                      {/* ── Facts ── */}
                      {activeTab === "facts" && (() => {
                        const factList = safeJsonParse(activeSummary.facts);
                        return factList.length > 0 ? (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Sigma className="w-5 h-5 text-[#FACC15]" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Key Facts</h3>
                              <span className="text-xs text-text-ghost px-2 py-0.5 rounded-lg bg-white/5">{factList.length} facts</span>
                            </div>
                            <div className="space-y-3">
                              {factList.map((fact: string, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex gap-3 p-4 rounded-2xl"
                                  style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                  <div className="mt-1 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                  </div>
                                  <p className="text-sm text-text-secondary leading-relaxed">{fact}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-text-muted text-sm">No factual data extracted for this document.</div>
                        );
                      })()}

                      {/* ── Formulas ── */}
                      {activeTab === "formulas" && (() => {
                        const formulaList = safeJsonParse(activeSummary.formulas);
                        return formulaList.length > 0 ? (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Variable className="w-5 h-5 text-[#EC4899]" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Formulas & Equations</h3>
                              <span className="text-xs text-text-ghost px-2 py-0.5 rounded-lg bg-white/5">{formulaList.length} formulas</span>
                            </div>
                            <div className="grid gap-4">
                              {formulaList.map((item: any, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.06 }}
                                  className="p-5 rounded-2xl"
                                  style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                  <h4 className="text-text-primary font-semibold mb-2 text-[15px]">{item.name || `Formula ${i + 1}`}</h4>
                                  <div className="p-3 rounded-xl mb-3 font-mono text-sm" style={{ background: "rgba(236, 72, 153, 0.06)", border: "1px solid rgba(236, 72, 153, 0.15)", color: "#EC4899" }}>
                                    {item.formula || item.equation}
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-text-muted text-sm">No formulas or equations detected in this document.</div>
                        );
                      })()}

                      {/* ── Technology Stack ── */}
                      {activeTab === "techstack" && (() => {
                        const techStack = safeJsonParse(activeSummary.technologyStack);
                        // Group by category
                        const grouped: Record<string, any[]> = {};
                        for (const tech of techStack) {
                          const cat = tech.category || "Other";
                          if (!grouped[cat]) grouped[cat] = [];
                          grouped[cat].push(tech);
                        }
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Cpu className="w-5 h-5 text-[#38BDF8]" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Technology Stack</h3>
                              <span className="text-xs text-text-ghost px-2 py-0.5 rounded-lg bg-white/5">{techStack.length} detected</span>
                            </div>
                            <div className="space-y-6">
                              {Object.entries(grouped).map(([category, techs], gi) => (
                                <motion.div
                                  key={category}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: gi * 0.08 }}
                                >
                                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">{category}</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(techs as any[]).map((tech: any, ti: number) => (
                                      <div
                                        key={ti}
                                        className="group relative px-4 py-2.5 rounded-xl text-sm font-medium cursor-default transition-all hover:scale-105"
                                        style={{
                                          background: "rgba(56, 189, 248, 0.06)",
                                          border: "1px solid rgba(56, 189, 248, 0.15)",
                                          color: "#38BDF8",
                                        }}
                                      >
                                        <span className="flex items-center gap-2">
                                          <Code2 className="w-3.5 h-3.5 opacity-60" />
                                          {tech.name}
                                        </span>
                                        {tech.context && (
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl text-xs text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50" style={{ background: "rgba(11, 16, 32, 0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            {tech.context.substring(0, 200)}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ── Revision Notes ── */}
                      {activeTab === "revision" && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <GraduationCap className="w-5 h-5 text-[#FF8A00]" />
                            <h3 className="text-xl font-display font-semibold text-text-primary">Revision Notes</h3>
                          </div>
                          <div
                            className="p-6 rounded-2xl"
                            style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <p className="text-sm text-text-secondary leading-[1.9] whitespace-pre-line font-light">
                              {activeSummary.revisionNotes || "No revision notes available for this document."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── Chapter Summaries ── */}
                      {activeTab === "chapters" && (() => {
                        const chapters = safeJsonParse(activeSummary.chapterSummaries);
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <ListChecks className="w-5 h-5 text-[#8B5CF6]" />
                              <h3 className="text-xl font-display font-semibold text-text-primary">Chapter Summaries</h3>
                              <span className="text-xs text-text-ghost px-2 py-0.5 rounded-lg bg-white/5">{chapters.length} sections</span>
                            </div>
                            <div className="space-y-3">
                              {chapters.map((chapter: any, i: number) => {
                                const isExpanded = expandedChapters.has(i);
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="rounded-2xl overflow-hidden transition-all"
                                    style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                                  >
                                    <button
                                      onClick={() => toggleChapter(i)}
                                      className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors text-left"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-text-ghost w-6 h-6 flex items-center justify-center rounded-lg bg-white/5">
                                          {i + 1}
                                        </span>
                                        <h4 className="font-semibold text-text-primary text-sm">{chapter.heading}</h4>
                                      </div>
                                      {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-text-muted" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-text-muted" />
                                      )}
                                    </button>
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="px-5 pb-5 pt-0">
                                            <div className="h-px bg-white/5 mb-4" />
                                            <p className="text-sm text-text-secondary leading-relaxed">
                                              {chapter.summary}
                                            </p>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* AI Synthesis callout */}
                      <div
                        className="p-6 rounded-3xl relative overflow-hidden group border border-neural-cyan/20 bg-neural-cyan/[0.02]"
                      >
                        <div className="relative z-10">
                          <h4 className="flex items-center gap-2 font-display font-semibold mb-3 text-neural-cyan">
                            <Sparkles className="w-5 h-5" /> AI Synthesis Context
                          </h4>
                          <p className="text-text-secondary leading-relaxed text-sm">
                            This analysis was generated using intelligent document understanding — including structural detection, entity extraction, semantic analysis, and contextual concept identification. The summary reflects deep comprehension of the source material, not keyword frequency.
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
