import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, MoreVertical, Folder, Search, SlidersHorizontal, Download, Trash2, BrainCircuit, Tag } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const timelineGroups = [
  {
    period: "Today",
    documents: [
      { id: 1, name: "Neural Network Architectures", size: "2.4 MB", type: "pdf", tag: "AI/ML", color: "#FF8A00" },
      { id: 2, name: "Q3 Research Synthesis", size: "1.1 MB", type: "doc", tag: "Research", color: "#00F5D4" },
    ],
  },
  {
    period: "Earlier this week",
    documents: [
      { id: 3, name: "Quantum Computing Fundamentals", size: "12 KB", type: "txt", tag: "Physics", color: "#38BDF8" },
      { id: 4, name: "Advanced Algorithms", size: "4.5 MB", type: "pdf", tag: "Computer Science", color: "#8B5CF6" },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", ...springConfig } },
};

export function Documents() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
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
              className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          <button
            className="h-11 px-4 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2 text-text-muted hover:text-text-primary"
            style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={springConfig}
            className="h-11 px-5 font-semibold rounded-xl flex items-center gap-2 text-sm"
            style={{
              background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
              color: "#050816",
              boxShadow: "0 0 20px rgba(0, 245, 212, 0.15)",
            }}
          >
            <Folder className="w-4 h-4" />
            <span className="hidden sm:inline">New Folder</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Document Timeline */}
      <div className="space-y-12">
        {timelineGroups.map((group, groupIdx) => (
          <motion.div key={groupIdx} variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-semibold text-text-muted tracking-wider uppercase">
                {group.period}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.documents.map((doc) => (
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.background = "rgba(19, 27, 46, 0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.background = "rgba(11, 16, 32, 0.6)";
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[24px] pointer-events-none overflow-hidden"
                  >
                    {/* Holographic shimmer */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
                      style={{ animation: "shimmerSlide 3s ease-in-out infinite" }}
                    />
                  </div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div
                      className="p-3 rounded-2xl"
                      style={{
                        background: `${doc.color}12`,
                        border: `1px solid ${doc.color}25`,
                        color: doc.color,
                      }}
                    >
                      <FileText className="w-6 h-6" />
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-text-muted hover:text-text-primary hover:bg-white/10 rounded-lg transition-colors">
                        <BrainCircuit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-text-muted hover:text-text-primary hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 flex-1 relative z-10">
                    <h4 className="text-lg font-display font-semibold text-text-primary mb-1 leading-snug line-clamp-2">
                      {doc.name}
                    </h4>
                    <p className="text-sm text-text-muted">
                      {doc.size} • {doc.type.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <Tag className="w-3 h-3 text-text-ghost" />
                      <span className="text-xs font-medium text-text-muted">{doc.tag}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 text-text-ghost hover:text-text-primary transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-text-ghost hover:text-danger transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
