import { useState } from "react";
import { Lightbulb, Hash, Network, Zap, GitCommit, Expand, Layers, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const knowledgeNodes = [
  {
    id: 1,
    topic: "Action Potentials",
    category: "Neuroscience",
    relevance: 98,
    color: "accent-orange",
    points: [
      "Rapid rise and subsequent fall in voltage or membrane potential.",
      "Follows the 'all-or-none' principle.",
      "Caused by the opening and closing of voltage-gated ion channels."
    ],
    connections: ["Neurotransmitters", "Synaptic Cleft"]
  },
  {
    id: 2,
    topic: "Neurotransmitters",
    category: "Biochemistry",
    relevance: 95,
    color: "accent-teal",
    points: [
      "Chemical messengers that cross the synaptic gaps between neurons.",
      "Excitatory (e.g., Glutamate) vs. Inhibitory (e.g., GABA)."
    ],
    connections: ["Action Potentials"]
  },
  {
    id: 3,
    topic: "Hebbian Theory",
    category: "Learning",
    relevance: 88,
    color: "accent-cyan",
    points: [
      "Neurons that fire together, wire together.",
      "Explains adaptation of neurons in the brain during the learning process."
    ],
    connections: ["Synaptic Plasticity"]
  },
  {
    id: 4,
    topic: "Synaptic Plasticity",
    category: "Neuroscience",
    relevance: 92,
    color: "purple-400",
    points: [
      "The ability of synapses to strengthen or weaken over time.",
      "Fundamental mechanism for memory and learning."
    ],
    connections: ["Hebbian Theory", "Action Potentials"]
  }
];

export function SmartNotes() {
  const [activeNode, setActiveNode] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 min-h-[calc(100vh-8rem)] relative">
      {/* Background ambient network effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-accent-teal/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-accent-orange/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
            <Network className="text-accent-teal w-8 h-8 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
            Neural Knowledge Map
          </h1>
          <p className="text-text-muted text-lg">Synthesized concepts automatically mapped from your data.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#0B1120] border border-white/10 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-white flex items-center gap-2">
            <Layers className="w-4 h-4" /> Toggle Hierarchy
          </button>
          <button className="px-5 py-2.5 bg-white text-[#060816] rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] text-sm font-bold flex items-center gap-2">
            <Expand className="w-4 h-4" /> Expand Map
          </button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 relative z-10"
      >
        {knowledgeNodes.map((node) => {
          const isActive = activeNode === node.id;
          
          return (
            <motion.div 
              variants={itemVariants}
              key={node.id} 
              className="break-inside-avoid"
            >
              <div 
                className={cn(
                  "premium-glass-panel p-6 rounded-3xl border transition-all duration-500 cursor-pointer group",
                  isActive 
                    ? `border-${node.color}/50 bg-[#111827]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-${node.color}/20` 
                    : "border-white/10 bg-[#0B1120]/80 hover:bg-[#111827] hover:border-white/20"
                )}
                onClick={() => setActiveNode(isActive ? null : node.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-${node.color}/10 border border-${node.color}/20 text-${node.color}`}>
                      <Hash className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{node.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#060816] border border-white/5">
                    <Zap className={cn("w-3 h-3", `text-${node.color}`)} />
                    <span className="text-xs font-bold text-white">{node.relevance}%</span>
                  </div>
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-4 leading-tight group-hover:text-white transition-colors">
                  {node.topic}
                </h3>

                <ul className="space-y-3 mb-6">
                  {node.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0 transition-all duration-300", isActive ? `bg-${node.color} glow-${node.color.split('-')[1] || 'teal'}` : "bg-white/20 group-hover:bg-white/40")} />
                      <span className={cn("text-sm leading-relaxed transition-colors duration-300", isActive ? "text-white/90" : "text-text-muted")}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-text-subtle flex items-center gap-1.5 w-full mb-1">
                    <GitCommit className="w-3.5 h-3.5" /> Neural Links
                  </span>
                  {node.connections.map(conn => (
                    <span key={conn} className="px-2.5 py-1 text-xs font-medium bg-[#060816] border border-white/5 rounded-md text-text-muted hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                      {conn} <ExternalLink className="w-3 h-3 opacity-50" />
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
