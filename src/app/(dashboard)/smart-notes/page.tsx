"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Network, Hash, Zap, Expand, Layers, ExternalLink,
  BookOpen, StickyNote, Pin, Trash2, Plus, Search,
  FileText, Lightbulb, Sparkles, X, MessageSquare,
  Cpu, ChevronRight, ChevronDown, Folder, FolderOpen,
  Filter, SlidersHorizontal, ArrowUpDown, RefreshCw,
  FileCode, BrainCircuit, BookType
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

interface KnowledgeNode extends d3.SimulationNodeDatum {
  id: string;
  topic: string;
  category: string;
  relevance: number;
  color: string;
  points: string[];
  connections: string[];
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
}

interface KnowledgeLink {
  source: KnowledgeNode;
  target: KnowledgeNode;
}

const NOTE_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  concept: { label: "Concept", icon: Lightbulb, color: "#8B5CF6" },
  definition: { label: "Definition", icon: BookOpen, color: "#38BDF8" },
  revision: { label: "Revision Note", icon: FileText, color: "#FF8A00" },
  technology: { label: "Technology", icon: Cpu, color: "#00F5D4" },
  architecture: { label: "Architecture", icon: Layers, color: "#EC4899" },
  ai_component: { label: "AI Component", icon: Sparkles, color: "#FACC15" },
  user: { label: "Personal Note", icon: StickyNote, color: "#E0E7FF" },
};

type TabType = "notes" | "knowledge";

export default function SmartNotes() {
  const [activeTab, setActiveTab] = useState<TabType>("notes");
  const [documents, setDocuments] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);

  // ─── Fetch Helper Lists for Navigation ───────────────────
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents?limit=100");
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.documents || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const fetchSummaries = async () => {
    try {
      const res = await fetch("/api/summaries?limit=100");
      if (res.ok) {
        const json = await res.json();
        setSummaries(json.summaries || []);
      }
    } catch (err) {
      console.error("Error fetching summaries:", err);
    }
  };

  // URL query handling for deep-linking
  useEffect(() => {
    fetchDocuments();
    fetchSummaries();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "knowledge" || tab === "notes") {
        setActiveTab(tab as TabType);
      }
      
      const noteId = params.get("id");
      if (noteId && tab === "notes") {
        setSearchQuery(""); // Clear search to see all notes
      }
      
      const mapSearch = params.get("search");
      if (mapSearch) {
        setMapSearchQuery(decodeURIComponent(mapSearch));
      }
    }
  }, []);

  // ─── Notes Tab State & Filtering ─────────────────────────
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest"); // newest, oldest, alpha-asc, alpha-desc, type
  const [filterDocId, setFilterDocId] = useState<string>("all"); // all, or documentId
  const [noteTagFilter, setNoteTagFilter] = useState<string>("all"); // all, or specific tag

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("user");
  const [newTags, setNewTags] = useState("");

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await fetch(`/api/notes?limit=1000`);
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
    fetchNotes();
  }, []);

  // Filter low-quality concepts/keywords
  const isLowQuality = (name: string) => {
    if (!name) return true;
    const normalized = name.trim().toLowerCase();
    const blocklist = ["and", "the", "platform", "system", "a", "an", "of", "to", "in", "for", "with", "on", "at", "by", "from", "it", "its", "this", "that", "these", "those", "details", "generic", "filler"];
    return blocklist.includes(normalized) || normalized.length < 2;
  };

  // Process, Deduplicate, Merge and Sort notes in client side
  const processedNotes = useMemo(() => {
    let result = [...notes];

    // Filter by document ID
    if (filterDocId !== "all") {
      const matchedSummary = summaries.find(s => s.documentId === filterDocId);
      if (matchedSummary) {
        result = result.filter(n => n.summaryId === matchedSummary.id);
      } else {
        result = result.filter(n => n.summaryId === filterDocId);
      }
    }

    // Filter by type
    if (filterType !== "all") {
      result = result.filter(n => n.type === filterType);
    }

    // Filter by search query (case-insensitive across title and content)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags && n.tags.toLowerCase().includes(q))
      );
    }

    // Filter by specific tag
    if (noteTagFilter !== "all") {
      result = result.filter(n => 
        n.tags && n.tags.split(",").map((t: string) => t.trim().toLowerCase()).includes(noteTagFilter.toLowerCase())
      );
    }

    // Merge notes with identical titles (deduplication utility)
    const uniqueNotes: any[] = [];
    const titlesSeen = new Set<string>();
    result.forEach(note => {
      const titleKey = note.title.trim().toLowerCase();
      if (!titlesSeen.has(titleKey)) {
        titlesSeen.add(titleKey);
        uniqueNotes.push({ ...note });
      } else {
        const existing = uniqueNotes.find(n => n.title.trim().toLowerCase() === titleKey);
        if (existing && !existing.content.includes(note.content)) {
          existing.content += `\n\n${note.content}`;
        }
      }
    });

    // Sorting
    if (sortOrder === "newest") {
      uniqueNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === "oldest") {
      uniqueNotes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOrder === "alpha-asc") {
      uniqueNotes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === "alpha-desc") {
      uniqueNotes.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOrder === "type") {
      uniqueNotes.sort((a, b) => a.type.localeCompare(b.type));
    }

    return uniqueNotes;
  }, [notes, filterDocId, filterType, searchQuery, noteTagFilter, sortOrder, summaries]);

  // Unique tags list extracted from current notes
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(n => {
      if (n.tags) {
        n.tags.split(",").forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) tags.add(trimmed);
        });
      }
    });
    return Array.from(tags);
  }, [notes]);

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

  const handleViewNote = (topic: string) => {
    setSearchQuery(topic);
    setFilterType("all");
    setActiveTab("notes");
  };

  // ─── Knowledge Map Tab State & Visual Filters ────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const zoomRef = useRef<any>(null);
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);
  
  const [nodesData, setNodesData] = useState<any[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Set<string>>(new Set());
  const [relevanceSlider, setRelevanceSlider] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState({
    concepts: true,
    tech: true,
    architecture: true,
    workflow: true,
    futureScope: true
  });
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [, setTick] = useState(0);

  const nodesRef = useRef<any[]>([]);
  const linksRef = useRef<any[]>([]);

  const fetchNodes = async () => {
    setMapLoading(true);
    try {
      const res = await fetch("/api/knowledge-map");
      if (res.ok) {
        const json = await res.json();
        if (json.nodes) {
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

  // Expand tree node helper
  const toggleTreeExpanded = (nodeId: string) => {
    setExpandedTreeNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // Toggle graph node collapse/expand of children
  const toggleNodeCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      const strId = String(nodeId);
      if (next.has(strId)) next.delete(strId);
      else next.add(strId);
      return next;
    });
  };

  // Helper colors configuration
  const CATEGORY_COLORS = {
    concepts: "#8B5CF6",     // Purple
    tech: "#FF8A00",         // Orange
    architecture: "#38BDF8", // Blue
    workflow: "#EC4899",     // Pink
    futureScope: "#10B981"   // Green
  };

  // Filter nodes & links dynamically for the simulation
  const filteredNodes = useMemo(() => {
    // 1. Gather all collapsed node IDs and recursively find all their child node IDs to hide
    const hiddenIds = new Set<string>();
    const traverseCollapse = (nodeId: string) => {
      const node = nodesData.find(n => String(n.id) === String(nodeId));
      if (!node) return;
      const childIds = typeof node.connections === 'string' ? JSON.parse(node.connections) : node.connections;
      if (Array.isArray(childIds)) {
        childIds.forEach(cId => {
          hiddenIds.add(String(cId));
          traverseCollapse(cId);
        });
      }
    };
    collapsedNodes.forEach(nodeId => {
      traverseCollapse(nodeId);
    });

    // 2. Filter nodes based on user category checklist, relevance slider and blocklist
    return nodesData.filter(node => {
      if (hiddenIds.has(String(node.id))) return false;

      const isConceptsNode = node.topic === "Concepts" || node.color === CATEGORY_COLORS.concepts;
      const isTechNode = node.topic === "Technologies" || node.color === CATEGORY_COLORS.tech;
      const isArchNode = node.topic === "Architecture" || node.color === CATEGORY_COLORS.architecture;
      const isWorkflowNode = node.topic === "Workflow" || node.color === CATEGORY_COLORS.workflow;
      const isFutureNode = node.topic === "Future Scope" || node.color === CATEGORY_COLORS.futureScope;

      if (isConceptsNode && !selectedCategories.concepts) return false;
      if (isTechNode && !selectedCategories.tech) return false;
      if (isArchNode && !selectedCategories.architecture) return false;
      if (isWorkflowNode && !selectedCategories.workflow) return false;
      if (isFutureNode && !selectedCategories.futureScope) return false;

      // Root document nodes should always stay visible
      const isRoot = node.topic === node.category;
      if (!isRoot && node.relevance < relevanceSlider) return false;

      // Apply low quality filter
      if (isLowQuality(node.topic)) return false;

      return true;
    });
  }, [nodesData, collapsedNodes, selectedCategories, relevanceSlider]);

  // Hierarchy Tree builder for Left Panel
  const treeData = useMemo(() => {
    const roots = nodesData.filter(n => n.topic === n.category);

    return roots.map(root => {
      // Find all category folders for this document
      const catNodes = nodesData.filter(n => n.category === root.category && ["Concepts", "Technologies", "Architecture", "Workflow", "Future Scope"].includes(n.topic));

      const processedCats = catNodes.map(cat => {
        // Find individual leafs linked to this category
        const childIds = typeof cat.connections === 'string' ? JSON.parse(cat.connections) : cat.connections;
        const leafNodes = nodesData.filter(n => childIds.map(String).includes(String(n.id)));

        // Filter leaf nodes based on relevance limit and low quality
        const filteredLeafs = leafNodes.filter(leaf => {
          if (leaf.relevance < relevanceSlider) return false;
          if (isLowQuality(leaf.topic)) return false;
          // Apply category filters
          if (cat.topic === "Concepts" && !selectedCategories.concepts) return false;
          if (cat.topic === "Technologies" && !selectedCategories.tech) return false;
          if (cat.topic === "Architecture" && !selectedCategories.architecture) return false;
          if (cat.topic === "Workflow" && !selectedCategories.workflow) return false;
          if (cat.topic === "Future Scope" && !selectedCategories.futureScope) return false;

          // Apply tree text search
          if (mapSearchQuery.trim()) {
            const q = mapSearchQuery.toLowerCase().trim();
            return leaf.topic.toLowerCase().includes(q) || 
              (leaf.points || []).some((p: string) => p.toLowerCase().includes(q));
          }
          return true;
        });

        // Category folder matches search query directly
        let catMatches = true;
        if (mapSearchQuery.trim()) {
          const q = mapSearchQuery.toLowerCase().trim();
          catMatches = cat.topic.toLowerCase().includes(q) || 
            (cat.points || []).some((p: string) => p.toLowerCase().includes(q));
        }

        // Apply category visibility
        let categoryEnabled = true;
        if (cat.topic === "Concepts" && !selectedCategories.concepts) categoryEnabled = false;
        if (cat.topic === "Technologies" && !selectedCategories.tech) categoryEnabled = false;
        if (cat.topic === "Architecture" && !selectedCategories.architecture) categoryEnabled = false;
        if (cat.topic === "Workflow" && !selectedCategories.workflow) categoryEnabled = false;
        if (cat.topic === "Future Scope" && !selectedCategories.futureScope) categoryEnabled = false;

        return {
          ...cat,
          leafs: filteredLeafs,
          isVisible: categoryEnabled && (catMatches || filteredLeafs.length > 0)
        };
      }).filter(c => c.isVisible);

      let rootMatches = true;
      if (mapSearchQuery.trim()) {
        const q = mapSearchQuery.toLowerCase().trim();
        rootMatches = root.topic.toLowerCase().includes(q) || 
          (root.points || []).some((p: string) => p.toLowerCase().includes(q));
      }

      return {
        ...root,
        categories: processedCats,
        isVisible: rootMatches || processedCats.length > 0
      };
    }).filter(r => r.isVisible);
  }, [nodesData, relevanceSlider, selectedCategories, mapSearchQuery]);

  // Recenter D3 simulation on specific node
  const centerNode = (nodeId: string | number) => {
    const node = nodesRef.current.find(n => String(n.id) === String(nodeId));
    if (node && containerRef.current && zoomRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight || 600;
      const k = transform.k || 1;
      const targetX = width / 2 - node.x * k;
      const targetY = height / 2 - node.y * k;

      d3.select(containerRef.current)
        .transition()
        .duration(750)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(targetX, targetY).scale(k)
        );
      setActiveNode(String(nodeId));
    }
  };

  // Zoom map handlers
  const zoomIn = () => {
    if (containerRef.current && zoomRef.current) {
      d3.select(containerRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const zoomOut = () => {
    if (containerRef.current && zoomRef.current) {
      d3.select(containerRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1 / 1.3);
    }
  };

  const recenterMap = () => {
    if (containerRef.current && zoomRef.current) {
      d3.select(containerRef.current)
        .transition()
        .duration(500)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  // D3 force network simulation configuration
  useEffect(() => {
    if (!containerRef.current || filteredNodes.length === 0) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 600;

    // Preserving node positions when filters update to avoid jumps
    nodesRef.current = filteredNodes.map((n: any) => {
      const existing = nodesRef.current.find((old: any) => String(old.id) === String(n.id));
      return {
        ...n,
        x: existing ? existing.x : (n.x / 100) * width || width / 2,
        y: existing ? existing.y : (n.y / 100) * height || height / 2,
        vx: existing ? existing.vx : 0,
        vy: existing ? existing.vy : 0,
      };
    });

    linksRef.current = [];
    nodesRef.current.forEach((source: any) => {
      const childIds = typeof source.connections === 'string' ? JSON.parse(source.connections) : source.connections;
      if (Array.isArray(childIds)) {
        childIds.forEach((targetId: string) => {
          const target = nodesRef.current.find((n: any) => String(n.id) === String(targetId));
          if (target) {
            linksRef.current.push({ source, target });
          }
        });
      }
    });

    if (simulationRef.current) simulationRef.current.stop();

    const simulation = d3.forceSimulation(nodesRef.current)
      .force("link", d3.forceLink(linksRef.current).id((d: any) => d.id).distance((l: any) => {
        if (l.source.topic === l.source.category) return 100;
        return 150;
      }))
      .force("charge", d3.forceManyBody().strength((d: any) => {
        if (d.topic === d.category) return -2500;
        if (["Concepts", "Technologies", "Architecture", "Workflow", "Future Scope"].includes(d.topic)) return -1200;
        return -500;
      }))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => {
        if (d.topic === d.category) return 120;
        if (["Concepts", "Technologies", "Architecture", "Workflow", "Future Scope"].includes(d.topic)) return 90;
        return 65;
      }))
      .on("tick", () => requestAnimationFrame(() => setTick((t) => t + 1)));

    simulationRef.current = simulation;

    const d3Container = d3.select(containerRef.current);
    const zoom = d3.zoom<HTMLDivElement, unknown>().scaleExtent([0.15, 4]).on("zoom", (e) => setTransform(e.transform));
    zoomRef.current = zoom;
    d3Container.call(zoom);
    d3Container.on("dblclick.zoom", null);

    // Bind dragging events to DOM nodes
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

    return () => { simulation.stop(); };
  }, [filteredNodes]);

  // Selected Node detailed info resolver
  const selectedNodeInfo = useMemo(() => {
    if (!activeNode) return null;
    const node = nodesData.find(n => String(n.id) === String(activeNode));
    if (!node) return null;

    // Resolve matched document/summary for hyperlinks
    const matchedDoc = documents.find(d => 
      d.title.replace(/\.[^/.]+$/, "").toLowerCase() === node.category.toLowerCase()
    );
    const matchedSummary = summaries.find(s => 
      s.documentTitle.replace(/\.[^/.]+$/, "").toLowerCase() === node.category.toLowerCase()
    );

    // Resolve matching related notes
    const relatedNotes = notes.filter(n =>
      n.title.toLowerCase().includes(node.topic.toLowerCase()) ||
      node.topic.toLowerCase().includes(n.title.toLowerCase()) ||
      n.content.toLowerCase().includes(node.topic.toLowerCase())
    );

    const pointsList = typeof node.points === "string" ? JSON.parse(node.points) : node.points || [];

    return {
      ...node,
      pointsList,
      matchedDoc,
      matchedSummary,
      relatedNotes
    };
  }, [activeNode, nodesData, documents, summaries, notes]);

  // Note cards groups
  const pinnedNotes = processedNotes.filter((n) => n.pinned);
  const unpinnedNotes = processedNotes.filter((n) => !n.pinned);

  return (
    <div className="space-y-6">
      {/* ─── Tab Navigation ──────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-2xl relative z-10 max-w-sm" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "notes" as TabType, label: "Smart Notes", icon: StickyNote },
          { key: "knowledge" as TabType, label: "Knowledge Map", icon: Network },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
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
        // ═════════════════════════════════════════════════════════
        // SMART NOTES VIEW
        // ═════════════════════════════════════════════════════════
        <div className="space-y-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-[#8B5CF6]" />
                Smart Notes
              </h1>
              <p className="text-text-muted text-sm mt-1">AI-generated concepts, definitions, architecture blocks, and your personal notes—all organized dynamically.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "#fff" }}
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {/* Search, Sort & Filters Toolbar */}
          <div className="bg-[#0B1020]/50 border border-white/5 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes dynamically..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-text-primary placeholder:text-text-ghost focus:outline-none"
                  style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                {/* Sort Option Dropdown */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-secondary border border-white/8 bg-[#0B1020]/60">
                  <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-text-primary font-semibold pr-1"
                  >
                    <option value="newest" className="bg-[#0B1020] text-text-primary">Newest</option>
                    <option value="oldest" className="bg-[#0B1020] text-text-primary">Oldest</option>
                    <option value="alpha-asc" className="bg-[#0B1020] text-text-primary">A-Z</option>
                    <option value="alpha-desc" className="bg-[#0B1020] text-text-primary">Z-A</option>
                    <option value="type" className="bg-[#0B1020] text-text-primary">Group Type</option>
                  </select>
                </div>

                {/* Document Filter Dropdown */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-secondary border border-white/8 bg-[#0B1020]/60">
                  <Filter className="w-3.5 h-3.5 text-text-muted" />
                  <select
                    value={filterDocId}
                    onChange={(e) => setFilterDocId(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-text-primary font-semibold max-w-[150px] pr-1"
                  >
                    <option value="all" className="bg-[#0B1020] text-text-primary">All Materials</option>
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id} className="bg-[#0B1020] text-text-primary truncate">
                        {doc.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Filter Dropdown */}
                {allTags.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-secondary border border-white/8 bg-[#0B1020]/60">
                    <Hash className="w-3.5 h-3.5 text-text-muted" />
                    <select
                      value={noteTagFilter}
                      onChange={(e) => setNoteTagFilter(e.target.value)}
                      className="bg-transparent border-none focus:outline-none text-text-primary font-semibold pr-1"
                    >
                      <option value="all" className="bg-[#0B1020] text-text-primary">All Tags</option>
                      {allTags.map((tag) => (
                        <option key={tag} value={tag} className="bg-[#0B1020] text-text-primary">
                          #{tag}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Note Type Category Tabs */}
            <div className="flex gap-2 flex-wrap pt-2 border-t border-white/5">
              {["all", "concept", "definition", "revision", "technology", "architecture", "ai_component", "user"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all capitalize flex items-center gap-1.5 ${
                    filterType === type ? "text-white" : "text-text-muted"
                  }`}
                  style={{
                    background: filterType === type ? `${NOTE_TYPE_CONFIG[type]?.color || "#8B5CF6"}20` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filterType === type ? `${NOTE_TYPE_CONFIG[type]?.color || "#8B5CF6"}40` : "rgba(255,255,255,0.06)"}`,
                    color: filterType === type ? NOTE_TYPE_CONFIG[type]?.color || "#8B5CF6" : "#64748B",
                  }}
                >
                  {type === "all" ? (
                    <>
                      <BookType className="w-3.5 h-3.5" />
                      All Types
                    </>
                  ) : (
                    <>
                      {React.createElement(NOTE_TYPE_CONFIG[type]?.icon || StickyNote, { className: "w-3.5 h-3.5" })}
                      {NOTE_TYPE_CONFIG[type]?.label || type}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {notesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : processedNotes.length === 0 ? (
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
                    <Pin className="w-3.5 h-3.5 text-[#00F5D4]" /> Pinned ({pinnedNotes.length})
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
        // ═════════════════════════════════════════════════════════
        // REDESIGNED 3-PANEL KNOWLEDGE MAP VIEW
        // ═════════════════════════════════════════════════════════
        <div className="h-[calc(100vh-12rem)] grid grid-cols-12 gap-6 relative z-10 overflow-hidden">
          
          {/* ────────────────────────────────────────────────────────
              LEFT PANEL: Hierarchy Tree & Filters (3/12 cols)
              ──────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-3 bg-[#0B1020]/90 border border-white/8 rounded-3xl p-5 flex flex-col h-full overflow-hidden">
            {/* Tree Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                placeholder="Search map concepts..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs text-text-primary placeholder:text-text-ghost focus:outline-none"
                style={{ background: "rgba(11,16,32,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              {mapSearchQuery && (
                <button onClick={() => setMapSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Visual Control Filters */}
            <div className="mb-4 pb-4 border-b border-white/5 space-y-3 shrink-0">
              {/* Category checkboxes */}
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Category Filters</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "concepts" as const, label: "Concepts", color: CATEGORY_COLORS.concepts },
                    { key: "tech" as const, label: "Tech", color: CATEGORY_COLORS.tech },
                    { key: "architecture" as const, label: "Arch", color: CATEGORY_COLORS.architecture },
                    { key: "workflow" as const, label: "Workflow", color: CATEGORY_COLORS.workflow },
                    { key: "futureScope" as const, label: "Future", color: CATEGORY_COLORS.futureScope },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategories(p => ({ ...p, [cat.key]: !p[cat.key] }))}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all border"
                      style={{
                        background: selectedCategories[cat.key] ? `${cat.color}15` : "rgba(255,255,255,0.02)",
                        borderColor: selectedCategories[cat.key] ? `${cat.color}50` : "rgba(255,255,255,0.05)",
                        color: selectedCategories[cat.key] ? cat.color : "#64748B"
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Relevance Slider */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  <span>Relevance Threshold</span>
                  <span className="text-neural-cyan">{relevanceSlider}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={relevanceSlider}
                  onChange={(e) => setRelevanceSlider(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-neural-cyan"
                  style={{
                    background: `linear-gradient(to right, #00F5D4 0%, #00F5D4 ${relevanceSlider}%, rgba(255,255,255,0.05) ${relevanceSlider}%, rgba(255,255,255,0.05) 100%)`
                  }}
                />
              </div>
            </div>

            {/* Hierarchy Concept Tree Scrollbox */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {mapLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="w-6 h-6 border-2 border-neural-cyan border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Building hierarchy tree...</span>
                </div>
              ) : treeData.length === 0 ? (
                <span className="text-xs text-text-muted block text-center py-10">No matching concepts.</span>
              ) : (
                treeData.map((docNode) => {
                  const isDocExpanded = expandedTreeNodes.has(docNode.id);
                  const isDocSelected = activeNode === docNode.id;

                  return (
                    <div key={docNode.id} className="space-y-1">
                      {/* Document Root Node row */}
                      <div
                        onClick={() => {
                          setActiveNode(docNode.id);
                          centerNode(docNode.id);
                        }}
                        className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all border ${
                          isDocSelected ? "border-neural-cyan/30 bg-neural-cyan/5" : "border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTreeExpanded(docNode.id);
                            }}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-text-muted"
                          >
                            {isDocExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <BookOpen className="w-4 h-4 shrink-0 text-neural-cyan" />
                          <span className={`text-xs font-semibold truncate ${isDocSelected ? "text-neural-cyan" : "text-text-primary"}`}>
                            {docNode.topic}
                          </span>
                        </div>
                      </div>

                      {/* Document Children (Categories Folders) */}
                      {isDocExpanded && (
                        <div className="pl-4 space-y-1 border-l border-white/5 ml-3.5">
                          {docNode.categories.map((catFolder) => {
                            const catKey = `${docNode.id}-${catFolder.topic}`;
                            const isCatExpanded = expandedTreeNodes.has(catKey);
                            const isCatSelected = activeNode === catFolder.id;
                            const hasChildren = catFolder.leafs && catFolder.leafs.length > 0;

                            return (
                              <div key={catFolder.id} className="space-y-1">
                                {/* Category folder row */}
                                <div
                                  onClick={() => {
                                    setActiveNode(catFolder.id);
                                    centerNode(catFolder.id);
                                  }}
                                  className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-all border ${
                                    isCatSelected ? "border-white/20 bg-white/5" : "border-transparent"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {hasChildren ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTreeExpanded(catKey);
                                        }}
                                        className="p-0.5 rounded hover:bg-white/10 text-text-muted"
                                      >
                                        {isCatExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      </button>
                                    ) : (
                                      <div className="w-4 h-4" />
                                    )}
                                    {isCatExpanded ? (
                                      <FolderOpen className="w-3.5 h-3.5 shrink-0" style={{ color: catFolder.color }} />
                                    ) : (
                                      <Folder className="w-3.5 h-3.5 shrink-0" style={{ color: catFolder.color }} />
                                    )}
                                    <span className="text-xs text-text-secondary truncate font-medium">
                                      {catFolder.topic}
                                    </span>
                                  </div>
                                  {hasChildren && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-text-muted">
                                      {catFolder.leafs.length}
                                    </span>
                                  )}
                                </div>

                                {/* Leaf Concept nodes */}
                                {isCatExpanded && hasChildren && (
                                  <div className="pl-4 space-y-1 border-l border-white/5 ml-3">
                                    {catFolder.leafs.map((leaf) => {
                                      const isLeafSelected = activeNode === leaf.id;

                                      return (
                                        <div
                                          key={leaf.id}
                                          onClick={() => {
                                            setActiveNode(leaf.id);
                                            centerNode(leaf.id);
                                          }}
                                          className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-all border ${
                                            isLeafSelected ? "border-white/10 bg-white/5 text-white" : "border-transparent text-text-muted"
                                          }`}
                                        >
                                          <FileCode className="w-3 h-3 shrink-0" style={{ color: catFolder.color }} />
                                          <span className="text-[11px] truncate font-medium">
                                            {leaf.topic}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────
              CENTER PANEL: D3 Network Canvas (6/12 cols)
              ──────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-6 bg-[#0B1020]/40 border border-white/5 rounded-3xl flex flex-col h-full overflow-hidden relative">
            
            {/* Control buttons overlay */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <button
                onClick={() => {
                  nodesRef.current.forEach((n) => { n.fx = null; n.fy = null; });
                  if (simulationRef.current) simulationRef.current.alpha(1).restart();
                }}
                className="p-2 rounded-xl text-xs font-semibold text-text-secondary flex items-center gap-1.5 border border-white/10 bg-[#0B1020]/90 backdrop-blur-md cursor-pointer hover:bg-white/5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Auto-layout
              </button>
              <button
                onClick={recenterMap}
                className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #00F5D4, #38BDF8)", color: "#050816" }}
              >
                <Expand className="w-3.5 h-3.5" /> Recenter Map
              </button>
            </div>

            {/* Zoom overlay buttons */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
              <button onClick={zoomIn} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0B1020]/90 border border-white/10 text-white hover:bg-white/10 cursor-pointer text-base font-bold shadow-lg">+</button>
              <button onClick={zoomOut} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0B1020]/90 border border-white/10 text-white hover:bg-white/10 cursor-pointer text-base font-bold shadow-lg">−</button>
              <button onClick={recenterMap} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0B1020]/90 border border-white/10 text-white hover:bg-white/10 cursor-pointer text-xs shadow-lg">⟲</button>
            </div>

            {/* D3 Canvas container */}
            {mapLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-neural-cyan border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Mapping neural knowledge graph...</p>
              </div>
            ) : nodesData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Network className="w-12 h-12 text-text-muted mb-4 animate-pulse" />
                <h3 className="text-lg font-bold text-text-primary mb-2">No knowledge map generated yet</h3>
                <p className="text-sm text-text-muted max-w-xs leading-relaxed">Upload PDF documents to automatically synthesize and construct a neural knowledge map.</p>
              </div>
            ) : (
              <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ background: "rgba(5,8,22,0.2)" }}>
                <div
                  style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                    transformOrigin: "0 0",
                    width: "100%",
                    height: "100%"
                  }}
                  className="transition-transform duration-750 ease-out"
                >
                  {/* SVG Links Canvas */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
                    {linksRef.current.map((link, i) => {
                      const isActive = activeNode && (activeNode === link.source.id || activeNode === link.target.id);
                      const q = mapSearchQuery.trim().toLowerCase();
                      
                      const sourceMatched = !q || 
                        link.source.topic.toLowerCase().includes(q) || 
                        (link.source.points || []).some((p: string) => p.toLowerCase().includes(q));
                      const targetMatched = !q || 
                        link.target.topic.toLowerCase().includes(q) || 
                        (link.target.points || []).some((p: string) => p.toLowerCase().includes(q));
                      
                      const linkOpacity = q ? ((sourceMatched && targetMatched) ? 0.8 : 0.1) : (isActive ? 0.7 : 0.2);

                      return (
                        <g key={i} style={{ opacity: linkOpacity }} className="transition-opacity duration-300">
                          <line
                            x1={link.source.x}
                            y1={link.source.y}
                            x2={link.target.x}
                            y2={link.target.y}
                            stroke={isActive ? "rgba(0,245,212,0.5)" : "rgba(255,255,255,0.08)"}
                            strokeWidth={isActive ? 2.5 : 1}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* HTML Node cards */}
                  {nodesRef.current.map((node) => {
                    const q = mapSearchQuery.trim().toLowerCase();
                    const isMatched = !q || 
                      node.topic.toLowerCase().includes(q) || 
                      (node.points || []).some((p: string) => p.toLowerCase().includes(q));
                    
                    const isSearchResultActive = q.length > 0;
                    const nodeOpacity = isSearchResultActive ? (isMatched ? 1.0 : 0.2) : 1.0;
                    const isGlowing = isSearchResultActive && isMatched;
                    const isNodeActive = activeNode === node.id;
                    const hasChildren = node.connections && node.connections.length > 0;
                    const isCollapsed = collapsedNodes.has(String(node.id));

                    return (
                      <div
                        key={node.id}
                        ref={(el) => { nodeRefs.current[node.id] = el; }}
                        className="absolute transition-opacity duration-300"
                        style={{
                          left: node.x || 0,
                          top: node.y || 0,
                          width: "220px",
                          transform: "translate(-50%, -50%)",
                          zIndex: isNodeActive ? 50 : 10,
                          opacity: nodeOpacity
                        }}
                      >
                        <motion.div
                          layout
                          whileHover={{ scale: 1.04 }}
                          transition={springConfig}
                          onClick={() => {
                            setActiveNode(isNodeActive ? null : node.id);
                          }}
                          className="relative overflow-hidden rounded-xl p-3.5 cursor-pointer border"
                          style={{
                            background: isNodeActive ? "rgba(19,27,46,0.96)" : "rgba(11,16,32,0.9)",
                            backdropFilter: "blur(12px)",
                            borderColor: isGlowing 
                              ? node.color 
                              : isNodeActive 
                                ? `${node.color}cc` 
                                : "rgba(255,255,255,0.08)",
                            boxShadow: isGlowing 
                              ? `0 0 20px ${node.color}88` 
                              : isNodeActive
                                ? `0 0 15px rgba(255,255,255,0.05)`
                                : "none"
                          }}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                              {node.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" style={{ color: node.color }} />
                              <span className="text-[9px] font-bold text-white">{node.relevance}%</span>
                            </div>
                          </div>
                          <h3 className="text-xs font-bold text-white leading-tight pr-4 truncate">
                            {node.topic}
                          </h3>

                          {/* Action overlay: Expand/Collapse indicator */}
                          {hasChildren && (
                            <button
                              onClick={(e) => toggleNodeCollapse(node.id, e)}
                              className="absolute bottom-2.5 right-2.5 p-1 rounded hover:bg-white/10 text-text-muted transition-colors"
                            >
                              {isCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5 text-neural-cyan" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                              )}
                            </button>
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ────────────────────────────────────────────────────────
              RIGHT PANEL: Selected Concept Inspector (3/12 cols)
              ──────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-3 bg-[#0B1020]/90 border border-white/8 rounded-3xl p-5 flex flex-col h-full overflow-y-auto">
            {selectedNodeInfo ? (
              <div className="space-y-5">
                {/* Node details */}
                <div className="border-b border-white/5 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Selected Concept</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                      style={{ background: `${selectedNodeInfo.color}15`, color: selectedNodeInfo.color }}
                    >
                      <Zap className="w-3 h-3" />
                      {selectedNodeInfo.relevance}% Relevance
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-snug">{selectedNodeInfo.topic}</h2>
                  <span className="text-[10px] text-text-ghost font-medium block mt-1.5 uppercase tracking-wider">
                    Scope: {selectedNodeInfo.category}
                  </span>
                </div>

                {/* Facts Bulletpoints */}
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Key Synthesized Facts</span>
                  {selectedNodeInfo.pointsList.length > 0 ? (
                    <ul className="space-y-2.5">
                      {selectedNodeInfo.pointsList.map((pt: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed bg-white/[0.02] border border-white/5 rounded-xl p-3">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: selectedNodeInfo.color }} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-text-ghost">No details available.</span>
                  )}
                </div>

                {/* Linked Actions / Hyperlinks */}
                {(selectedNodeInfo.matchedDoc || selectedNodeInfo.matchedSummary) && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Source Material Deep Links</span>
                    {selectedNodeInfo.matchedDoc && (
                      <a
                        href={`/documents/${selectedNodeInfo.matchedDoc.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-neural-cyan hover:bg-neural-cyan/10 transition-all font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" />
                          View Source Document
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                    {selectedNodeInfo.matchedSummary && (
                      <a
                        href={`/summaries?id=${selectedNodeInfo.matchedSummary.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-purple-400 hover:bg-purple-400/10 transition-all font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5" />
                          Open Summary Brief
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                  </div>
                )}

                {/* Related Notes */}
                <div className="pt-2 border-t border-white/5 space-y-2.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Related Notes ({selectedNodeInfo.relatedNotes.length})</span>
                  {selectedNodeInfo.relatedNotes.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedNodeInfo.relatedNotes.map((note: any) => (
                        <div
                          key={note.id}
                          onClick={() => handleViewNote(note.title)}
                          className="p-2.5 rounded-xl bg-[#0B1020]/60 border border-white/5 cursor-pointer hover:border-white/20 transition-all group"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold uppercase" style={{ color: NOTE_TYPE_CONFIG[note.type]?.color }}>
                              {NOTE_TYPE_CONFIG[note.type]?.label || note.type}
                            </span>
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </div>
                          <h4 className="text-xs font-semibold text-white truncate">{note.title}</h4>
                          <p className="text-[10px] text-text-muted line-clamp-2 mt-0.5 leading-relaxed">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-text-ghost">No directly related notes found.</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <BrainCircuit className="w-10 h-10 text-text-muted mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-text-primary mb-1">Concept Inspector</h4>
                <p className="text-xs text-text-muted max-w-[180px]">Select any concept node in the tree or map to inspect details and deep-links.</p>
              </div>
            )}
          </div>
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
                        {React.createElement(cfg.icon, { className: "w-3 h-3 inline mr-1" })}
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
      className="p-5 rounded-2xl relative overflow-hidden group border"
      style={{ background: "rgba(11,16,32,0.6)", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: `${cfg.color}15` }}>
            {React.createElement(cfg.icon, { className: "w-3.5 h-3.5", style: { color: cfg.color } })}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onTogglePin(note)}
            className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            style={{ color: note.pinned ? "#00F5D4" : "#64748B" }}>
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
