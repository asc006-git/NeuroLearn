import { useState, useEffect } from "react";
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Network,
  Hash,
  Zap,
  Expand,
  Layers,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";

const springConfig = {
  stiffness: 120,
  damping: 18,
  mass: 0.8,
};

interface KnowledgeNode extends d3.SimulationNodeDatum {
  id: number;
  topic: string;
  category: string;
  relevance: number;
  color: string;
  points: string[];
  connections: number[];
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
}

interface KnowledgeLink {
  source: KnowledgeNode;
  target: KnowledgeNode;
}

const initialNodes: KnowledgeNode[] = [
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
    x: 20,
    y: 30,
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
    x: 60,
    y: 20,
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
    x: 80,
    y: 60,
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
    x: 30,
    y: 70,
  },
];

export default function SmartNotes() {
  const [loading, setLoading] = useState(true);
  const [nodesData, setNodesData] = useState<any[]>([]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/knowledge-map");
      if (res.ok) {
        const json = await res.json();
        if (json.nodes && json.nodes.length > 0) {
          setNodesData(json.nodes);
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching knowledge map:", err);
    }
    setNodesData([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchNodes();
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [activeNode, setActiveNode] = useState<string | null>(null);

  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    k: 1,
  });

  const [, setTick] = useState(0);

  const simulationRef =
    useRef<d3.Simulation<any, undefined> | null>(null);

  const nodesRef = useRef<any[]>([]);

  const linksRef = useRef<any[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 600;

    nodesRef.current = initialNodes.map((n) => ({
      ...n,
      x: (n.x / 100) * width,
      y: (n.y / 100) * height,
    }));

    linksRef.current = [];

    nodesRef.current.forEach((source) => {
      source.connections.forEach((targetId: number) => {
        const target = nodesRef.current.find(
          (n) => n.id === targetId
        );

        if (target && source.id < targetId) {
          linksRef.current.push({
            source,
            target,
          });
        }
      });
    });

    const simulation = d3
      .forceSimulation<KnowledgeNode>(nodesRef.current)
      .force(
        "link",
        d3
          .forceLink<KnowledgeNode, KnowledgeLink>(
            linksRef.current
          )
          .id((d) => d.id)
          .distance(300)
      )
      .force(
        "charge",
        d3.forceManyBody().strength(-2000)
      )
      .force(
        "center",
        d3.forceCenter(width / 2, height / 2)
      )
      .force(
        "collision",
        d3.forceCollide().radius(180)
      )
      .on("tick", () => {
        requestAnimationFrame(() => {
          setTick((t) => t + 1);
        });
      });

    simulationRef.current = simulation;

    const d3Container = d3.select(containerRef.current);

    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (e) => {
        setTransform(e.transform);
      });

    d3Container.call(zoom);

    d3Container.on("dblclick.zoom", null);

    setTimeout(() => {
      nodesRef.current.forEach((node) => {
        const el = nodeRefs.current[node.id];

        if (!el) return;

        d3.select(el)
          .datum(node)
          .call(
            d3
              .drag<HTMLDivElement, KnowledgeNode>()
              .on("start", (e, d) => {
                if (!e.active) {
                  simulation.alphaTarget(0.3).restart();
                }

                d.fx = d.x;
                d.fy = d.y;
              })
              .on("drag", (e, d) => {
                d.fx = e.x;
                d.fy = e.y;
              })
              .on("end", (e, d) => {
                if (!e.active) {
                  simulation.alphaTarget(0);
                }

                d.fx = null;
                d.fy = null;
              })
          );
      });
    }, 100);

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[15%] left-[15%] w-[500px] h-[500px] rounded-full animate-neural-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(0,245,212,0.05) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div
          className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] rounded-full animate-neural-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(255,138,0,0.04) 0%, transparent 70%)",
            filter: "blur(100px)",
            animationDelay: "2s",
          }}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10 shrink-0">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
            <Network className="text-cyan-400 w-8 h-8" />
            Neural Knowledge Map
          </h1>

          <p className="text-slate-400 text-lg">
            Synthesized concepts automatically mapped
            from your data.
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={springConfig}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 border border-white/10 bg-white/5"
          >
            <Layers className="w-4 h-4" />
            Toggle Hierarchy
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={springConfig}
            className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, #00F5D4, #38BDF8)",
              color: "#050816",
            }}
          >
            <Expand className="w-4 h-4" />
            Recenter Map
          </motion.button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative z-10 rounded-3xl border overflow-hidden"
        style={{
          background: "rgba(5,8,22,0.4)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            {linksRef.current.map((link, i) => {
              const isHighlighted =
                activeNode === link.source.id ||
                activeNode === link.target.id;

              return (
                <motion.line
                  key={i}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke={
                    isHighlighted
                      ? "rgba(0,245,212,0.5)"
                      : "rgba(255,255,255,0.1)"
                  }
                  strokeWidth={isHighlighted ? 3 : 1.5}
                />
              );
            })}
          </svg>

          {nodesRef.current.map((node) => {
            const isActive = activeNode === node.id;

            return (
              <div
                key={node.id}
                ref={(el) => {
                  nodeRefs.current[node.id] = el;
                }}
                className="absolute"
                style={{
                  left: node.x || 0,
                  top: node.y || 0,
                  width: "340px",
                  transform: "translate(-50%, -50%)",
                  zIndex: isActive ? 50 : 10,
                }}
              >
                <motion.div
                  layout
                  whileHover={{
                    scale: 1.03,
                    y: -4,
                  }}
                  transition={springConfig}
                  onClick={() =>
                    setActiveNode(
                      isActive ? null : node.id
                    )
                  }
                  className="relative overflow-hidden rounded-3xl p-6 cursor-pointer"
                  style={{
                    background: isActive
                      ? "rgba(19,27,46,0.9)"
                      : "rgba(11,16,32,0.8)",
                    backdropFilter: "blur(24px)",
                    border: isActive
                      ? `1px solid ${node.color}50`
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          background: `${node.color}15`,
                          color: node.color,
                        }}
                      >
                        <Hash className="w-4 h-4" />
                      </div>

                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {node.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/30 border border-white/5">
                      <Zap
                        className="w-3 h-3"
                        style={{
                          color: node.color,
                        }}
                      />

                      <span className="text-xs font-bold text-white">
                        {node.relevance}%
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {node.topic}
                  </h3>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                        }}
                        transition={springConfig}
                        className="overflow-hidden"
                      >
                        <ul className="space-y-3 mb-5 mt-4">
                          {node.points.map(
                            (
                              point: string,
                              i: number
                            ) => (
                              <li
                                key={i}
                                className="flex items-start gap-3"
                              >
                                <div
                                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                  style={{
                                    background:
                                      node.color,
                                  }}
                                />

                                <span className="text-sm text-slate-300 leading-relaxed">
                                  {point}
                                </span>
                              </li>
                            )
                          )}
                        </ul>

                        <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                          {node.connections.map(
                            (connId: number) => {
                              const connNode =
                                initialNodes.find(
                                  (n) =>
                                    n.id === connId
                                );

                              if (!connNode) return null;

                              return (
                                <button
                                  key={connId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveNode(
                                      connId
                                    );
                                  }}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 bg-black/20 border border-white/5 text-slate-400"
                                >
                                  {connNode.topic}

                                  <ExternalLink className="w-3 h-3 opacity-50" />
                                </button>
                              );
                            }
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}