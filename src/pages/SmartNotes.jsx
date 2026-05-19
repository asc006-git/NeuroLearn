import { useState, useMemo } from "react";
import { Network, Hash, Zap, Expand, Layers, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const knowledgeNodes = [
  {
    id: 1,
    topic: "Action Potentials",
    category: "Neuroscience",
    relevance: 98,
    color: "#FF8A00",
    points: [
      "Rapid rise and subsequent fall in voltage or membrane potential.",
      "Follows the 'all-or-none' principle.",
      "Caused by the opening and closing of voltage-gated ion channels.",
    ],
    connections: [2],
    x: 18, y: 22,
  },
  {
    id: 2,
    topic: "Neurotransmitters",
    category: "Biochemistry",
    relevance: 95,
    color: "#00F5D4",
    points: [
      "Chemical messengers that cross the synaptic gaps between neurons.",
      "Excitatory (e.g., Glutamate) vs. Inhibitory (e.g., GABA).",
    ],
    connections: [1],
    x: 55, y: 15,
  },
  {
    id: 3,
    topic: "Hebbian Theory",
    category: "Learning",
    relevance: 88,
    color: "#38BDF8",
    points: [
      "Neurons that fire together, wire together.",
      "Explains adaptation of neurons in the brain during the learning process.",
    ],
    connections: [4],
    x: 72, y: 50,
  },
  {
    id: 4,
    topic: "Synaptic Plasticity",
    category: "Neuroscience",
    relevance: 92,
    color: "#8B5CF6",
    points: [
      "The ability of synapses to strengthen or weaken over time.",
      "Fundamental mechanism for memory and learning.",
    ],
    connections: [3, 1],
    x: 30, y: 58,
  },
];

// SVG connection lines between nodes
function ConnectionLines({ nodes, activeNode }) {
  const lines = [];

  nodes.forEach((node) => {
    node.connections.forEach((targetId) => {
      const target = nodes.find((n) => n.id === targetId);
      if (target && node.id < targetId) {
        const isHighlighted = activeNode === node.id || activeNode === targetId;
        lines.push(
          <motion.line
            key={`${node.id}-${targetId}`}
            x1={`${node.x + 6}%`}
            y1={`${node.y + 8}%`}
            x2={`${target.x + 6}%`}
            y2={`${target.y + 8}%`}
            stroke={isHighlighted ? "rgba(0, 245, 212, 0.3)" : "rgba(255, 255, 255, 0.06)"}
            strokeWidth={isHighlighted ? 2 : 1}
            strokeDasharray="6 4"
            className={isHighlighted ? "animate-dash-flow" : ""}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        );
      }
    });
  });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {lines}
    </svg>
  );
}

export function SmartNotes() {
  const [activeNode, setActiveNode] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", ...springConfig } },
  };

  return (
    <div className="space-y-8 min-h-[calc(100vh-8rem)] relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[15%] left-[15%] w-[500px] h-[500px] rounded-full animate-neural-glow"
          style={{
            background: "radial-gradient(circle, rgba(0, 245, 212, 0.05) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] rounded-full animate-neural-glow"
          style={{
            background: "radial-gradient(circle, rgba(255, 138, 0, 0.04) 0%, transparent 70%)",
            filter: "blur(100px)",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2 flex items-center gap-3 tracking-tight">
            <Network className="text-neural-cyan w-8 h-8 drop-shadow-[0_0_15px_rgba(0,245,212,0.5)]" />
            Neural Knowledge Map
          </h1>
          <p className="text-text-muted text-lg">
            Synthesized concepts automatically mapped from your data.
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={springConfig}
            className="px-5 py-2.5 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-text-primary flex items-center gap-2"
            style={{
              background: "rgba(11, 16, 32, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Layers className="w-4 h-4" /> Toggle Hierarchy
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={springConfig}
            className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
              color: "#050816",
              boxShadow: "0 0 20px rgba(0, 245, 212, 0.15)",
            }}
          >
            <Expand className="w-4 h-4" /> Expand Map
          </motion.button>
        </div>
      </div>

      {/* Spatial Knowledge Graph */}
      <div className="relative min-h-[600px] z-10">
        {/* Connection lines SVG */}
        <ConnectionLines nodes={knowledgeNodes} activeNode={activeNode} />

        {/* Knowledge Nodes — positioned spatially */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10"
        >
          {knowledgeNodes.map((node) => {
            const isActive = activeNode === node.id;

            return (
              <motion.div
                key={node.id}
                variants={itemVariants}
                className="absolute"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: "min(340px, 40%)",
                }}
              >
                <motion.div
                  layout
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={springConfig}
                  onClick={() => setActiveNode(isActive ? null : node.id)}
                  className="cursor-pointer relative overflow-hidden"
                  style={{
                    background: isActive
                      ? "rgba(19, 27, 46, 0.9)"
                      : "rgba(11, 16, 32, 0.65)",
                    backdropFilter: "blur(24px)",
                    border: isActive
                      ? `1px solid ${node.color}40`
                      : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "24px",
                    padding: "24px",
                    boxShadow: isActive
                      ? `0 0 40px ${node.color}15, inset 0 0 30px ${node.color}05`
                      : "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Node ambient glow */}
                  {isActive && (
                    <div
                      className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${node.color}20, transparent)`,
                        filter: "blur(30px)",
                      }}
                    />
                  )}

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          background: `${node.color}15`,
                          border: `1px solid ${node.color}25`,
                          color: node.color,
                        }}
                      >
                        <Hash className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        {node.category}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                      style={{
                        background: "rgba(5, 8, 22, 0.8)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <Zap className="w-3 h-3" style={{ color: node.color }} />
                      <span className="text-xs font-bold text-text-primary">
                        {node.relevance}%
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-bold text-text-primary mb-4 leading-tight relative z-10">
                    {node.topic}
                  </h3>

                  {/* Expandable content */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={springConfig}
                        className="overflow-hidden"
                      >
                        <ul className="space-y-3 mb-5">
                          {node.points.map((point, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1, ...springConfig }}
                              className="flex items-start gap-3"
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                style={{
                                  background: node.color,
                                  boxShadow: `0 0 8px ${node.color}60`,
                                }}
                              />
                              <span className="text-sm text-text-secondary leading-relaxed">
                                {point}
                              </span>
                            </motion.li>
                          ))}
                        </ul>

                        <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                          <span className="text-xs font-medium text-text-ghost flex items-center gap-1.5 w-full mb-1">
                            Neural Links
                          </span>
                          {node.connections.map((connId) => {
                            const connNode = knowledgeNodes.find((n) => n.id === connId);
                            return connNode ? (
                              <button
                                key={connId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNode(connId);
                                }}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors hover:bg-white/5"
                                style={{
                                  background: "rgba(5, 8, 22, 0.8)",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                  color: "#94A3B8",
                                }}
                              >
                                {connNode.topic}
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </button>
                            ) : null;
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
