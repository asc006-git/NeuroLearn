import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, MoreVertical, Folder, Search, SlidersHorizontal, Download, Trash2, BrainCircuit, Tag } from "lucide-react";
import { cn } from "../lib/utils";

const timelineGroups = [
  {
    period: "Today",
    documents: [
      { id: 1, name: "Neural Network Architectures", size: "2.4 MB", type: "pdf", tag: "AI/ML", color: "text-accent-orange", bg: "bg-accent-orange/10", border: "border-accent-orange/20" },
      { id: 2, name: "Q3 Research Synthesis", size: "1.1 MB", type: "doc", tag: "Research", color: "text-accent-teal", bg: "bg-accent-teal/10", border: "border-accent-teal/20" },
    ]
  },
  {
    period: "Earlier this week",
    documents: [
      { id: 3, name: "Quantum Computing Fundamentals", size: "12 KB", type: "txt", tag: "Physics", color: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/20" },
      { id: 4, name: "Advanced Algorithms", size: "4.5 MB", type: "pdf", tag: "Computer Science", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    ]
  }
];

export function Documents() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Source Documents</h1>
          <p className="text-text-muted text-lg">Manage and organize your raw knowledge base.</p>
        </div>
        
        <div className="flex w-full lg:w-auto items-center gap-3">
          <div className={cn(
            "relative flex-1 lg:w-64 flex items-center h-11 bg-[#060816] rounded-xl border transition-all duration-300",
            searchFocused ? "border-accent-teal/50 ring-1 ring-accent-teal/20" : "border-white/10 hover:border-white/20"
          )}>
            <Search className="absolute left-3 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm text-white placeholder:text-text-muted focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
          
          <button className="h-11 px-4 bg-[#060816] border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2 text-text-muted hover:text-white">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          
          <button className="h-11 px-5 bg-white text-[#060816] font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95">
            <Folder className="w-4 h-4" /> 
            <span className="hidden sm:inline">New Folder</span>
          </button>
        </div>
      </div>

      {/* Document Timeline Grid */}
      <div className="space-y-12">
        {timelineGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-semibold text-text-muted tracking-wider uppercase">{group.period}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.documents.map((doc) => (
                <motion.div 
                  key={doc.id}
                  whileHover={{ y: -4 }}
                  className="group relative bg-[#0B1120] border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-[#111827] hover:border-white/15 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col"
                >
                  {/* Hover AI Glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl ${doc.bg}`} />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`p-3 rounded-2xl border ${doc.bg} ${doc.color} ${doc.border}`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <BrainCircuit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex-1 relative z-10">
                    <h4 className="text-lg font-display font-semibold text-white mb-1 leading-snug line-clamp-2">{doc.name}</h4>
                    <p className="text-sm text-text-muted">{doc.size} • {doc.type.toUpperCase()}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#060816] border border-white/5">
                      <Tag className="w-3 h-3 text-text-subtle" />
                      <span className="text-xs font-medium text-text-muted">{doc.tag}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-1.5 text-text-subtle hover:text-white transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-text-subtle hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
