"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Network, Hash, Zap, Expand, Layers, ExternalLink,
  BookOpen, StickyNote, Pin, Trash2, Plus, Search,
  FileText, Lightbulb, Sparkles, X, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

interface KnowledgeNode extends d3.SimulationNodeDatum {
  id: number; topic: string; category: string; relevance: number;
  color: string; points: string[]; connections: number[];
  x: number; y: number; fx?: number | null; fy?: number | null;
}
interface KnowledgeLink { source: KnowledgeNode; target: KnowledgeNode; }

const NOTE_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  concept: { label: "Concept", icon: Lightbulb, color: "#8B5CF6" },
  definition: { label: "Definition", icon: BookOpen, color: "#38BDF8" },
  revision: { label: "Revision Note", icon: FileText, color: "#FF8A00" },
  flashcard: { label: "Flashcard", icon: Zap, color: "#00F5D4" },
  user: { label: "Personal Note", icon: StickyNote, color: "#EC4899" },
};

type TabType = "notes" | "knowledge";

export default function SmartNotes() {
  const [activeTab, setActiveTab] = useState<TabType>("notes");

  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Create note modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("user");
  const [newTags, setNewTags] = useState("");

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/notes?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setNotes(json.notes || []);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterType, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleCreateNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent, type: newType, tags: newTags }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle(""); setNewContent(""); setNewType("user"); setNewTags("");
        fetchNotes();
      }
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleTogglePin = async (note: any) => {
    try {
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, pinned: !note.pinned }),
      });
      fetchNotes();
    } catch (err) {
      console.error("Error toggling pin:", err);
    }
  };

  // ── Knowledge Map state ──
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [mapLoading, setMapLoading] = useState(true);
  const [nodesData, setNodesData] = useState<any[]>([]);
  const [, setTick] = useState(0);
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);
  const nodesRef = useRef<any[]>([]);
  const linksRef = useRef<any[]>([]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/knowledge-map");
      if (res.ok) {
        const json = await res.json();
        if (json.nodes && json.nodes.length > 0) {
          setNodesData(json.nodes);
          setMapLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching knowledge map:", err);
    }
    setNodesData([]);
    setMapLoading(false);
  };

  useEffect(() => {
    if (activeTab === "knowledge") fetchNodes();
  }, [activeTab]);

  useEffect(() => {
    if (!containerRef.current || nodesData.length === 0) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 600;

    nodesRef.current = nodesData.map((n: any) => ({
      ...n, x: (n.x / 100) * width || width / 2, y: (n.y / 100) * height || height / 2,
    }));

    linksRef.current = [];
    nodesRef.current.forEach((source: any) => {
      (source.connections || []).forEach((targetId: string) => {
        const target = nodesRef.current.find((n: any) => String(n.id) === String(targetId));
        if (target && String(source.id) < String(target.id)) linksRef.current.push({ source, target });
      });
    });

    if (simulationRef.current) simulationRef.current.stop();

    const simulation = d3.forceSimulation(nodesRef.current)
      .force("link", d3.forceLink(linksRef.current).id((d: any) => d.id).distance(300))
      .force("charge", d3.forceManyBody().strength(-2000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(180))
      .on("tick", () => requestAnimationFrame(() => setTick((t) => t + 1)));

    simulationRef.current = simulation;

    const d3Container = d3.select(containerRef.current);
    const zoom = d3.zoom<HTMLDivElement, unknown>().scaleExtent([0.2, 4]).on("zoom", (e) => setTransform(e.transform));
    d3Container.call(zoom);
    d3Container.on("dblclick.zoom", null);

    setTimeout(() => {
      nodesRef.current.forEach((node: any) => {
        const el = nodeRefs.current[node.id];
        if (!el) return;
        d3.select(el).datum(node).call(d3.drag<HTMLDivElement, any>()
          .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));
      });
    }, 100);

    return () => simulation.stop();
  }, [nodesData]);

  const pinnedNotes = notes.filter((n) => n.pinned);
  const unpinnedNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-2xl relative z-10" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "notes" as TabType, label: "Smart Notes", icon: StickyNote },
          { key: "knowledge" as TabType, label: "Knowledge Map", icon: Network },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab.key ? "text-white" : "text-text-muted hover:text-text-secondary"
            }`}
            style={activeTab === tab.key ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" } : {}}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "notes" ? (
        <div className="space-y-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-[#8B5CF6]" />
                Smart Notes
              </h1>
              <p className="text-text-muted text-sm mt-1">AI-generated concepts, definitions, and your personal notes—all in one place.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "#fff" }}
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-text-primary placeholder:text-text-ghost focus:outline-none"
                style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </form>
            <div className="flex gap-2 flex-wrap">
              {["all", "concept", "definition", "revision", "user"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all capitalize ${
                    filterType === type ? "text-white" : "text-text-muted"
                  }`}
                  style={{
                    background: filterType === type ? `${NOTE_TYPE_CONFIG[type]?.color || "#8B5CF6"}20` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filterType === type ? `${NOTE_TYPE_CONFIG[type]?.color || "#8B5CF6"}40` : "rgba(255,255,255,0.06)"}`,
                    color: filterType === type ? NOTE_TYPE_CONFIG[type]?.color || "#8B5CF6" : "#64748B",
                  }}
                >
                  {type === "all" ? "All Types" : type}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {notesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01] border border-white/5 rounded-3xl">
              <StickyNote className="w-12 h-12 text-text-muted mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No notes here yet</h3>
              <p className="text-sm text-text-muted max-w-sm">Upload a document to generate AI-powered concepts and definitions, or create your own notes.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {pinnedNotes.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Pin className="w-3.5 h-3.5" /> Pinned ({pinnedNotes.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onTogglePin={handleTogglePin} />
                    ))}
                  </div>
                </div>
              )}
              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                      <StickyNote className="w-3.5 h-3.5" /> All Notes ({unpinnedNotes.length})
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unpinnedNotes.map((note) => (
                      <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onTogglePin={handleTogglePin} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── Knowledge Map Tab ── */
        <div className="h-[calc(100vh-12rem)] flex flex-col relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[15%] left-[15%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(0,245,212,0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />
            <div className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,138,0,0.04) 0%, transparent 70%)", filter: "blur(100px)" }} />
          </div>

          <div className="flex justify-between items-center relative z-10 mb-4 shrink-0">
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
                <Network className="text-[#00F5D4] w-6 h-6" />
                Neural Knowledge Map
              </h2>
              <p className="text-text-muted text-sm">Synthesized concepts automatically mapped from your data.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary flex items-center gap-2 border border-white/10 bg-white/5 cursor-pointer">
                <Layers className="w-4 h-4" /> Toggle Hierarchy
              </button>
              <button className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer" style={{ background: "linear-gradient(135deg, #00F5D4, #38BDF8)", color: "#050816" }}>
                <Expand className="w-4 h-4" /> Recenter Map
              </button>
            </div>
          </div>

          {mapLoading ? (
            <div className="flex-1 flex items-center justify-center bg-white/[0.01] border border-white/5 rounded-3xl relative z-10">
              <div className="w-10 h-10 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold text-text-muted uppercase tracking-wider ml-3">Mapping neural knowledge graph...</p>
            </div>
          ) : nodesData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-white/[0.01] border border-white/5 rounded-3xl p-8 relative z-10">
              <Network className="w-12 h-12 text-text-muted mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">No knowledge map generated yet</h3>
              <p className="text-sm text-text-muted max-w-sm leading-relaxed">Upload PDF documents from the dashboard to automatically generate a neural knowledge map with interconnected concepts.</p>
            </div>
          ) : (
            <div ref={containerRef} className="flex-1 relative z-10 rounded-3xl border overflow-hidden" style={{ background: "rgba(5,8,22,0.4)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`, transformOrigin: "0 0", width: "100%", height: "100%" }}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
                  {linksRef.current.map((link, i) => (
                    <line key={i} x1={link.source.x} y1={link.source.y} x2={link.target.x} y2={link.target.y}
                      stroke={activeNode === link.source.id || activeNode === link.target.id ? "rgba(0,245,212,0.5)" : "rgba(255,255,255,0.1)"}
                      strokeWidth={activeNode === link.source.id || activeNode === link.target.id ? 3 : 1.5} />
                  ))}
                </svg>
                {nodesRef.current.map((node) => (
                  <div key={node.id} ref={(el) => { nodeRefs.current[node.id] = el; }}
                    className="absolute" style={{ left: node.x || 0, top: node.y || 0, width: "340px", transform: "translate(-50%, -50%)", zIndex: activeNode === node.id ? 50 : 10 }}>
                    <motion.div layout whileHover={{ scale: 1.03, y: -4 }} transition={springConfig}
                      onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                      className="relative overflow-hidden rounded-3xl p-6 cursor-pointer"
                      style={{ background: activeNode === node.id ? "rgba(19,27,46,0.9)" : "rgba(11,16,32,0.8)", backdropFilter: "blur(24px)", border: activeNode === node.id ? `1px solid ${node.color}50` : "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl" style={{ background: `${node.color}15`, color: node.color }}><Hash className="w-4 h-4" /></div>
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{node.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/30 border border-white/5">
                          <Zap className="w-3 h-3" style={{ color: node.color }} />
                          <span className="text-xs font-bold text-white">{node.relevance}%</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">{node.topic}</h3>
                      <AnimatePresence>
                        {activeNode === node.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={springConfig} className="overflow-hidden">
                            <ul className="space-y-3 mb-5 mt-4">
                              {node.points.map((point: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: node.color }} />
                                  <span className="text-sm text-slate-300 leading-relaxed">{point}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                              {(node.connections || []).map((connId: string) => {
                                const connNode = nodesData.find((n: any) => String(n.id) === String(connId));
                                if (!connNode) return null;
                                return (
                                  <button key={connId} onClick={(e) => { e.stopPropagation(); setActiveNode(connId); }}
                                    className="px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 bg-black/20 border border-white/5 text-slate-400 cursor-pointer">
                                    {connNode.topic} <ExternalLink className="w-3 h-3 opacity-50" />
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Note Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springConfig}
              className="w-full max-w-lg p-8 rounded-3xl relative z-10"
              style={{ background: "rgba(11,16,32,0.95)", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-display font-bold text-text-primary mb-6">Create New Note</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Title</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full p-3 rounded-xl text-sm text-text-primary placeholder:text-text-ghost focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Content</label>
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write your note..."
                    rows={5}
                    className="w-full p-3 rounded-xl text-sm text-text-primary placeholder:text-text-ghost focus:outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(NOTE_TYPE_CONFIG).map(([key, cfg]) => (
                      <button key={key} onClick={() => setNewType(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer capitalize transition-all ${
                          newType === key ? "text-white" : "text-text-muted"
                        }`}
                        style={{
                          background: newType === key ? `${cfg.color}20` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${newType === key ? `${cfg.color}40` : "rgba(255,255,255,0.06)"}`,
                          color: newType === key ? cfg.color : "#64748B",
                        }}>
                        <cfg.icon className="w-3 h-3 inline mr-1" />
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Tags (comma-separated)</label>
                  <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g., biology, exam-prep"
                    className="w-full p-3 rounded-xl text-sm text-text-primary placeholder:text-text-ghost focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }} />
                </div>
                <button onClick={handleCreateNote}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "#fff" }}>
                  Create Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NoteCard = React.memo(function NoteCard({ note, onDelete, onTogglePin }: { note: any; onDelete: (id: string) => void; onTogglePin: (note: any) => void }) {
  const cfg = NOTE_TYPE_CONFIG[note.type] || NOTE_TYPE_CONFIG.user;
  const [expanded, setExpanded] = useState(false);
  const isLong = note.content.length > 200;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-5 rounded-2xl relative overflow-hidden group"
      style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: `${cfg.color}15` }}>
            <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onTogglePin(note)}
            className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            style={{ color: note.pinned ? cfg.color : "#64748B" }}>
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors text-text-muted hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <h3 className="text-[15px] font-semibold text-text-primary mb-2 leading-snug">{note.title}</h3>
      <div className={`text-sm text-text-muted leading-relaxed ${!expanded && isLong ? "line-clamp-4" : ""}`}>
        {note.content}
      </div>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold mt-2 cursor-pointer transition-colors"
          style={{ color: cfg.color }}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
      {note.tags && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {note.tags.split(",").filter(Boolean).map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: `${cfg.color}10`, color: cfg.color }}>
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 text-[10px] text-text-ghost">
        {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>
    </motion.div>
  );
});
