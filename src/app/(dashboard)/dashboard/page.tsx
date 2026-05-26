"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  BrainCircuit,
  TrendingUp,
  Clock,
  Target,
  ChevronRight,
  Sparkles,
  Zap,
  Flame,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UploadArea } from "../../../components/Workspace/UploadArea";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const performanceData = [
  { name: "Mon", score: 65 },
  { name: "Tue", score: 75 },
  { name: "Wed", score: 70 },
  { name: "Thu", score: 85 },
  { name: "Fri", score: 80 },
  { name: "Sat", score: 95 },
  { name: "Sun", score: 90 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, ...springConfig },
  },
};

// Unique metric card effects
const MetricCard = React.memo(function MetricCard({ stat, index }: { stat: any; index: number }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={springConfig}
      className="neural-card-interactive p-6 flex items-center gap-5 group cursor-default relative overflow-hidden"
    >
      {/* Unique per-card ambient effect */}
      {index === 0 && (
        /* Neural Streak — energy crackle */
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-quantum-orange/60 to-transparent" style={{ animation: "energyCrackle 2s ease infinite" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-quantum-orange/40 to-transparent" style={{ animation: "energyCrackle 2.5s ease infinite reverse" }} />
        </div>
      )}
      {index === 1 && (
        /* Deep Work — rotating radial glow */
        <div className="absolute -right-8 -top-8 w-32 h-32 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" style={{ background: "conic-gradient(from 0deg, transparent, rgba(56, 189, 248, 0.6), transparent, rgba(56, 189, 248, 0.3), transparent)", animation: "radialGlow 4s linear infinite" }} />
      )}
      {index === 2 && (
        /* Retention — pulse wave */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full border border-neural-cyan/20 opacity-0 group-hover:opacity-100" style={{ animation: "pulseWave 2s ease-out infinite" }} />
          <div className="absolute w-16 h-16 rounded-full border border-neural-cyan/15" style={{ animation: "pulseWave 2s ease-out infinite 0.5s" }} />
        </div>
      )}
      {index === 3 && (
        /* Sources — holographic shimmer */
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ animation: "shimmerSlide 2s ease-in-out infinite" }} />
        </div>
      )}

      {/* Background glow */}
      <div
        className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-700 blur-2xl pointer-events-none`}
        style={{ background: stat.glowColor }}
      />

      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={springConfig}
        className="relative z-10 p-4 rounded-2xl border transition-all duration-500"
        style={{
          background: stat.iconBg,
          borderColor: stat.iconBorder,
          color: stat.color,
        }}
      >
        <stat.icon className="w-6 h-6" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-text-muted text-sm font-medium mb-1 tracking-wide">
          {stat.label}
        </p>
        <h3
          className="text-3xl font-display font-bold tracking-tight"
          style={{ color: stat.color }}
        >
          {stat.value}
        </h3>
      </div>
    </motion.div>
  );
});

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const metrics = data?.metrics || {
    documentsCount: 0,
    summariesCount: 0,
    quizzesCount: 0,
    studyTimeHours: 0,
    accuracyRate: 0,
    sessionsCount: 0,
  };

  const stats = [
    {
      label: "Neural Streak",
      value: metrics.sessionsCount > 0 ? `${metrics.sessionsCount} Days` : "0 Days",
      icon: Flame,
      color: "#FF8A00",
      glowColor: "rgba(255, 138, 0, 0.5)",
      iconBg: "rgba(255, 138, 0, 0.1)",
      iconBorder: "rgba(255, 138, 0, 0.2)",
    },
    {
      label: "Deep Work",
      value: `${metrics.studyTimeHours}h`,
      icon: Clock,
      color: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.5)",
      iconBg: "rgba(56, 189, 248, 0.1)",
      iconBorder: "rgba(56, 189, 248, 0.2)",
    },
    {
      label: "Retention",
      value: `${metrics.accuracyRate}%`,
      icon: Target,
      color: "#00F5D4",
      glowColor: "rgba(0, 245, 212, 0.5)",
      iconBg: "rgba(0, 245, 212, 0.1)",
      iconBorder: "rgba(0, 245, 212, 0.2)",
    },
    {
      label: "Sources Synthesized",
      value: `${metrics.documentsCount}`,
      icon: FileText,
      color: "#8B5CF6",
      glowColor: "rgba(139, 92, 246, 0.5)",
      iconBg: "rgba(139, 92, 246, 0.1)",
      iconBorder: "rgba(139, 92, 246, 0.2)",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* ════════ HERO SECTION ════════ */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row gap-8 items-center justify-between neural-glass-panel p-10 lg:p-14 rounded-[32px] relative overflow-hidden group"
      >
        {/* Hero ambient glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none transition-opacity duration-1000 group-hover:opacity-30 opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255, 138, 0, 0.15) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(0, 245, 212, 0.2) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        <div className="flex-1 space-y-6 z-10">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium relative overflow-hidden"
            style={{
              background: "rgba(0, 245, 212, 0.08)",
              border: "1px solid rgba(0, 245, 212, 0.2)",
              color: "#00F5D4",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-cyan/10 to-transparent animate-shimmer" />
            <Sparkles className="w-4 h-4 relative z-10" />
            <span className="relative z-10">AI Processing Complete</span>
          </motion.div>

          {/* Hero Title */}
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-text-primary leading-[1.05] tracking-tight">
            Welcome back,{" "}
            <span className="text-gradient-orange">{data?.user?.name || "Explorer"}</span>.
          </h1>

          {/* AI Insight */}
          <p className="text-text-secondary text-lg max-w-xl font-light leading-relaxed">
            You're on a{" "}
            <span className="text-text-primary font-medium">{metrics.sessionsCount > 0 ? `${metrics.sessionsCount}-day` : "0-day"} streak</span>!
            Your neural AI has processed {metrics.documentsCount} knowledge source(s) and generated {metrics.summariesCount} customized memory brief(s) and quiz(zes) for you.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-4">
            <motion.button
              onClick={() => setShowUploadModal(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={springConfig}
              className="font-semibold px-7 py-3.5 rounded-2xl flex items-center gap-2.5 text-sm cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
                color: "#050816",
                boxShadow: "0 0 30px rgba(0, 245, 212, 0.2)",
              }}
            >
              <UploadCloud className="w-5 h-5" />
              Upload Material
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={springConfig}
              className="border border-white/10 text-text-primary font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/5 transition-colors text-sm cursor-pointer"
              style={{ background: "rgba(11, 16, 32, 0.8)" }}
            >
              Review Synthesized Notes
            </motion.button>
          </div>
        </div>

        {/* Neural Orb Visualization */}
        <div className="lg:w-1/3 flex justify-center z-10 relative">
          <motion.div
            animate={{ y: [-12, 12, -12] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-56 h-56 relative"
          >
            {/* Outer glow layers */}
            <div
              className="absolute inset-0 rounded-full animate-neural-pulse"
              style={{
                background: "radial-gradient(circle, rgba(0, 245, 212, 0.2) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <div
              className="absolute inset-6 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255, 138, 0, 0.15) 0%, transparent 70%)",
                filter: "blur(25px)",
              }}
            />

            {/* Core orb */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(11, 16, 32, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0, 245, 212, 0.15)",
                boxShadow: "inset 0 0 60px rgba(0, 245, 212, 0.08), 0 0 40px rgba(0, 245, 212, 0.1)",
              }}
            >
              <BrainCircuit className="w-20 h-20 text-neural-cyan opacity-90 drop-shadow-[0_0_20px_rgba(0,245,212,0.5)]" />
            </div>

            {/* Orbital Ring 1 */}
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.05, 1] }}
              transition={{
                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute -inset-4 rounded-full border border-dashed border-neural-cyan/15"
            >
              <div className="absolute top-1/2 -right-1.5 w-3 h-3 rounded-full bg-quantum-orange glow-orange" />
            </motion.div>

            {/* Orbital Ring 2 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 rounded-full border border-white/5"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-electric-blue glow-blue" />
              <div className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full bg-neural-cyan/60" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* ════════ METRIC CARDS ════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <MetricCard key={i} stat={stat} index={i} />
        ))}
      </motion.div>

      {/* ════════ MAIN CONTENT GRID ════════ */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Analytics Chart */}
        <div className="lg:col-span-2 neural-card p-8 flex flex-col group relative overflow-hidden">
          {/* Bloom on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(0, 245, 212, 0.05) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-display font-semibold text-text-primary mb-1">
                Cognitive Performance
              </h3>
              <p className="text-sm text-text-muted">
                Your learning efficiency over time.
              </p>
            </div>
            <select
              className="rounded-xl px-4 py-2 text-sm font-medium focus:outline-none cursor-pointer transition-colors"
              style={{
                background: "rgba(5, 8, 22, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94A3B8",
              }}
            >
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>

          <div className="flex-1 min-h-[300px] relative z-10">
            {!isMounted ? (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse">
                <BrainCircuit className="w-8 h-8 text-neural-cyan/40 mb-2 animate-neural-pulse" />
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Syncing cognitive telemetry...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={performanceData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00F5D4" stopOpacity={0} />
                    </linearGradient>
                    <filter id="glowLine">
                      <feGaussianBlur
                        stdDeviation="6"
                        result="coloredBlur"
                      />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(11, 16, 32, 0.95)",
                      border: "1px solid rgba(0, 245, 212, 0.2)",
                      borderRadius: "16px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0, 245, 212, 0.1)",
                      backdropFilter: "blur(20px)",
                      padding: "12px 16px",
                    }}
                    itemStyle={{ color: "#F0F6FC", fontWeight: 600, fontSize: 14 }}
                    labelStyle={{ color: "#64748B", fontSize: 12 }}
                    cursor={{
                      stroke: "rgba(0, 245, 212, 0.2)",
                      strokeWidth: 1,
                      strokeDasharray: "5 5",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00F5D4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    activeDot={{
                      r: 6,
                      fill: "#0B1020",
                      stroke: "#00F5D4",
                      strokeWidth: 3,
                      style: { filter: "drop-shadow(0 0 8px rgba(0, 245, 212, 0.6))" },
                    }}
                    filter="url(#glowLine)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Continue Learning */}
          <div className="neural-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-text-primary">
                Continue Learning
              </h3>
              <button className="text-sm text-neural-cyan hover:text-electric-blue transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {(!data?.recentActivity || data.recentActivity.length === 0) ? (
                <div className="text-center py-8 text-xs text-text-ghost">
                  No learning sessions logged yet.<br/>Upload a source document above to begin mapping your workspace.
                </div>
              ) : (
                data.recentActivity.map((item: any, i: number) => {
                  const isQuiz = item.type === "quiz";
                  return (
                    <motion.div
                      key={item.id || i}
                      whileHover={{ x: 4 }}
                      transition={springConfig}
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="p-2.5 rounded-xl border group-hover:scale-110 transition-transform"
                          style={{
                            background: "rgba(5, 8, 22, 0.8)",
                            borderColor: "rgba(255,255,255,0.06)",
                            color: isQuiz ? "#FF8A00" : "#8B5CF6",
                          }}
                        >
                          {isQuiz ? <Target className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary line-clamp-1">
                            {item.topic}
                          </p>
                          <p className="text-[11px] text-text-ghost mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Smart Suggestion */}
          <div className="relative rounded-[24px] p-px overflow-hidden group">
            {/* Animated gradient border */}
            <div
              className="absolute inset-0 rounded-[24px] opacity-40 group-hover:opacity-80 transition-opacity duration-700"
              style={{
                background: "linear-gradient(135deg, rgba(0, 245, 212, 0.4), rgba(255, 138, 0, 0.3), rgba(56, 189, 248, 0.4))",
              }}
            />

            <div
              className="relative rounded-[23px] p-6 h-full"
              style={{
                background: "rgba(5, 8, 22, 0.9)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-xl"
                  style={{
                    background: "rgba(0, 245, 212, 0.1)",
                    border: "1px solid rgba(0, 245, 212, 0.2)",
                  }}
                >
                  <Sparkles className="w-4 h-4 text-neural-cyan" />
                </div>
                <h3 className="text-lg font-display font-semibold text-text-primary">
                  Smart Suggestion
                </h3>
              </div>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Based on your neural mapping in{" "}
                <span className="text-text-primary font-medium">
                  Cellular Biology
                </span>
                , reviewing the{" "}
                <span className="text-neural-cyan">
                  mitochondria function notes
                </span>{" "}
                will solidify your retention.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springConfig}
                className="w-full text-text-primary text-sm font-medium py-3 rounded-xl transition-all border border-white/10 hover:border-neural-cyan/30 flex items-center justify-center gap-2 group/btn"
                style={{ background: "rgba(11, 16, 32, 0.8)" }}
              >
                Initiate Review
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Futuristic Ingestion Portal Overlay */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={springConfig}
              className="w-full max-w-xl neural-glass-panel p-8 rounded-[32px] relative overflow-hidden"
              style={{ border: "1px solid rgba(0, 245, 212, 0.2)" }}
            >
              {/* Top ambient highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neural-cyan/30 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-display font-semibold text-text-primary tracking-tight mb-2">
                  Knowledge Ingestion Pipeline
                </h3>
                <p className="text-sm text-text-muted">
                  Feed high-fidelity documents into the NeuroLearn semantic database to train your personalized learning AI models.
                </p>
              </div>

              {/* Render our reactive UploadArea */}
              <UploadArea />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
