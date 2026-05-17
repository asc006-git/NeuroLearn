import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Share2, Sparkles, Search, SlidersHorizontal, BookOpen } from "lucide-react";

const summaries = [
  { id: 1, title: "Neuroscience 101 - Synaptic Plasticity", date: "Oct 24, 2026", length: "Short", tags: ["Biology", "Brain"] },
  { id: 2, title: "Quantum Computing Basics", date: "Oct 22, 2026", length: "Detailed", tags: ["Physics", "Tech"] },
  { id: 3, title: "History of Ancient Rome", date: "Oct 20, 2026", length: "Bullet Points", tags: ["History"] }
];

export function Summaries() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-accent-orange w-8 h-8" />
            AI Summaries
          </h1>
          <p className="text-text-muted">Review, export, and study your AI-generated summaries.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search summaries..." 
              className="bg-card border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-accent-teal transition-colors"
            />
          </div>
          <button className="p-2 bg-card border border-white/10 rounded-xl text-text-muted hover:text-white transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4">
        {["All", "Recent", "Favorites"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab 
                ? "bg-white/10 text-white" 
                : "text-text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summaries List */}
        <div className="lg:col-span-1 space-y-4">
          {summaries.map((summary) => (
            <motion.div
              key={summary.id}
              whileHover={{ scale: 1.02 }}
              className="premium-card p-5 cursor-pointer hover:border-accent-teal/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-white/5 rounded-lg text-accent-teal">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs text-text-muted">{summary.date}</span>
              </div>
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{summary.title}</h3>
              <div className="flex items-center gap-2 mt-4">
                {summary.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-text-muted">{tag}</span>
                ))}
                <span className="px-2 py-1 bg-accent-orange/10 text-accent-orange rounded text-xs ml-auto">{summary.length}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Viewer */}
        <div className="lg:col-span-2 premium-card flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-card/50">
            <h2 className="text-xl font-bold text-white">Neuroscience 101 - Synaptic Plasticity</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors" title="Export">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors" title="Share">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-gradient-teal text-card font-semibold rounded-lg text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                <BookOpen className="w-4 h-4" /> Study Mode
              </button>
            </div>
          </div>
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-accent-teal">Executive Summary</h3>
              <p className="text-text-muted leading-relaxed">
                Synaptic plasticity is the biological process by which specific patterns of synaptic activity result in changes in synaptic strength and is thought to contribute to learning and memory. Both long-term potentiation (LTP) and long-term depression (LTD) are forms of synaptic plasticity.
              </p>
              
              <h3 className="text-white mt-6">Key Concepts</h3>
              <ul className="space-y-3 text-text-muted">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-orange mt-2 shrink-0" />
                  <span><strong>Long-term potentiation (LTP):</strong> A persistent strengthening of synapses based on recent patterns of activity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-orange mt-2 shrink-0" />
                  <span><strong>Long-term depression (LTD):</strong> An activity-dependent reduction in the efficacy of neuronal synapses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-orange mt-2 shrink-0" />
                  <span><strong>Hebbian Theory:</strong> "Neurons that fire together, wire together."</span>
                </li>
              </ul>

              <div className="mt-8 p-4 bg-accent-teal/5 border border-accent-teal/20 rounded-xl">
                <h4 className="flex items-center gap-2 text-accent-teal font-semibold mb-2">
                  <Sparkles className="w-4 h-4" /> AI Insight
                </h4>
                <p className="text-sm text-text-muted m-0">
                  Understanding synaptic plasticity is crucial for grasping how modern neural networks (like the one generating this text!) were conceptually inspired by biological brains.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
