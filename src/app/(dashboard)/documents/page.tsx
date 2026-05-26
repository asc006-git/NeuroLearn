"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Download, Trash2, BrainCircuit, Tag, Loader2 } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, ...springConfig } },
};

const COLORS = ["#FF8A00", "#00F5D4", "#38BDF8", "#8B5CF6"];

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.documents || []);
      }
    } catch (err) {
      console.error("Error retrieving documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this knowledge source from your neural catalog?")) {
      return;
    }
    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Error purging document:", err);
    }
  };

  // Filter based on search query
  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Partition into Today vs Earlier
  const today = new Date();
  const todayDocs = filteredDocs.filter((doc) => {
    const docDate = new Date(doc.uploadedAt);
    return docDate.toDateString() === today.toDateString();
  });
  const earlierDocs = filteredDocs.filter((doc) => {
    const docDate = new Date(doc.uploadedAt);
    return docDate.toDateString() !== today.toDateString();
  });

  const timelineGroups = [
    ...(todayDocs.length > 0 ? [{ period: "Today", documents: todayDocs }] : []),
    ...(earlierDocs.length > 0 ? [{ period: "Earlier this week", documents: earlierDocs }] : []),
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 min-h-[calc(100vh-8rem)]"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2 tracking-tight">
            Source Documents
          </h1>
          <p className="text-text-muted text-lg">
            Manage and organize your raw knowledge base.
          </p>
        </div>

        <div className="flex w-full lg:w-auto items-center gap-3">
          <div
            className={`relative flex-1 lg:w-64 flex items-center h-11 rounded-xl transition-all duration-500 ${
              searchFocused ? "ring-1 ring-neural-cyan/30" : ""
            }`}
            style={{
              background: searchFocused ? "rgba(7, 17, 34, 0.8)" : "rgba(5, 8, 22, 0.8)",
              border: searchFocused ? "1px solid rgba(0, 245, 212, 0.3)" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Search className="absolute left-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>
      </motion.div>

      {/* Dynamic listing state */}
      {loading ? (
        <div className="w-full min-h-[20rem] flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-3xl">
          <Loader2 className="w-10 h-10 text-neural-cyan animate-spin mb-3" />
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Loading source materials...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="w-full min-h-[20rem] flex flex-col items-center justify-center text-center bg-white/[0.01] border border-white/5 rounded-3xl p-8">
          <div className="w-16 h-16 bg-white/5 border border-white/8 rounded-2xl flex items-center justify-center mb-5 text-text-muted">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No documents mapped yet</h3>
          <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-6">
            Ingest PDF files directly from your workspace dashboard to populate your virtual neural catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {timelineGroups.length === 0 ? (
            <div className="text-center text-text-ghost text-sm py-12">
              No materials match your search parameters.
            </div>
          ) : (
            timelineGroups.map((group, groupIdx) => (
              <motion.div key={groupIdx} variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-semibold text-text-muted tracking-wider uppercase">
                    {group.period}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.documents.map((doc, docIdx) => {
                    const color = COLORS[docIdx % COLORS.length];
                    const docSize = `${Math.round(doc.extractedText.length / 1024)} KB`;
                    return (
                      <motion.div
                        key={doc.id}
                        whileHover={{ y: -6, scale: 1.01 }}
                        transition={springConfig}
                        className="group relative flex flex-col cursor-pointer"
                        style={{
                          background: "rgba(11, 16, 32, 0.6)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "24px",
                          padding: "24px",
                          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      >
                        {/* Hover glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[24px] pointer-events-none overflow-hidden">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
                            style={{ animation: "shimmerSlide 3s ease-in-out infinite" }}
                          />
                        </div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div
                            className="p-3 rounded-2xl"
                            style={{
                              background: `${color}12`,
                              border: `1px solid ${color}25`,
                              color,
                            }}
                          >
                            <FileText className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="mb-4 flex-1 relative z-10">
                          <h4 className="text-lg font-display font-semibold text-text-primary mb-1 leading-snug line-clamp-2">
                            {doc.title}
                          </h4>
                          <p className="text-sm text-text-muted">
                            {docSize} • PDF
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                            style={{
                              background: "rgba(5, 8, 22, 0.8)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <Tag className="w-3 h-3 text-text-ghost" />
                            <span className="text-xs font-semibold text-text-muted">Ingested</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1.5 text-text-ghost hover:text-danger transition-colors cursor-pointer"
                              title="Delete source"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
