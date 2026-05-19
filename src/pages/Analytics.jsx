import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Clock, BookOpen, BrainCircuit, Activity, Target } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const activityData = [
  { name: "Mon", hours: 2, neuralActivity: 40 },
  { name: "Tue", hours: 4, neuralActivity: 65 },
  { name: "Wed", hours: 3, neuralActivity: 50 },
  { name: "Thu", hours: 6, neuralActivity: 85 },
  { name: "Fri", hours: 5, neuralActivity: 75 },
  { name: "Sat", hours: 8, neuralActivity: 95 },
  { name: "Sun", hours: 4, neuralActivity: 60 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", ...springConfig } },
};

export function Analytics() {
  const stats = [
    { label: "Deep Work Hours", value: "32.4h", icon: Clock, color: "#38BDF8" },
    { label: "Concepts Mastered", value: "148", icon: Target, color: "#FF8A00" },
    { label: "Neural Synapses", value: "2.4k", icon: BrainCircuit, color: "#00F5D4" },
    { label: "Efficiency Delta", value: "+34%", icon: TrendingUp, color: "#8B5CF6" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2 tracking-tight flex items-center gap-3">
            <Activity className="text-neural-cyan w-8 h-8 drop-shadow-[0_0_15px_rgba(0,245,212,0.5)]" />
            Cognitive Telemetry
          </h1>
          <p className="text-text-muted text-lg">
            Real-time analysis of your learning patterns and AI interactions.
          </p>
        </div>
        <select
          className="rounded-xl px-5 py-2.5 text-sm font-medium focus:outline-none cursor-pointer transition-colors"
          style={{
            background: "rgba(11, 16, 32, 0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#F0F6FC",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <option>Trailing 7 Days</option>
          <option>Trailing 30 Days</option>
          <option>All Time</option>
        </select>
      </motion.div>

      {/* Metric Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={springConfig}
            className="neural-glass-panel p-6 flex flex-col gap-4 group cursor-default relative overflow-hidden"
          >
            {/* Ambient glow on hover */}
            <div
              className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-700 blur-2xl pointer-events-none"
              style={{ background: stat.color }}
            />

            <div className="flex justify-between items-start relative z-10">
              <div
                className="p-3.5 rounded-2xl border group-hover:scale-110 transition-all duration-500"
                style={{
                  background: "rgba(5, 8, 22, 0.8)",
                  borderColor: `${stat.color}30`,
                  color: stat.color,
                }}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="relative z-10 mt-2">
              <h3 className="text-3xl font-display font-bold tracking-tight mb-1" style={{ color: stat.color }}>
                {stat.value}
              </h3>
              <p className="text-text-muted text-sm font-medium tracking-wide">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="xl:col-span-2 neural-glass-panel p-8 flex flex-col group relative overflow-hidden">
          {/* Bloom on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(56, 189, 248, 0.04) 0%, transparent 70%)",
            }}
          />

          <h3 className="text-xl font-display font-semibold text-text-primary mb-8 relative z-10">
            Neural Activity & Focus Duration
          </h3>
          <div className="flex-1 min-h-[350px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNeural" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                  <filter id="glowCyan">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(11, 16, 32, 0.95)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(56, 189, 248, 0.1)",
                    backdropFilter: "blur(20px)",
                    padding: "12px 16px",
                  }}
                  itemStyle={{ color: "#F0F6FC", fontWeight: 600, fontSize: 14 }}
                  labelStyle={{ color: "#64748B", fontSize: 12 }}
                  cursor={{ stroke: "rgba(56, 189, 248, 0.2)", strokeWidth: 2, strokeDasharray: "5 5" }}
                />
                <Area
                  type="monotone"
                  dataKey="neuralActivity"
                  name="Neural Output"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNeural)"
                  activeDot={{
                    r: 6,
                    fill: "#0B1020",
                    stroke: "#38BDF8",
                    strokeWidth: 3,
                    style: { filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))" },
                  }}
                  filter="url(#glowCyan)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Metrics */}
        <div className="space-y-8 flex flex-col">
          {/* Subject Mastery */}
          <div className="neural-glass-panel p-8 flex-1">
            <h3 className="text-xl font-display font-semibold text-text-primary mb-8">
              Subject Mastery
            </h3>
            <div className="space-y-8">
              {[
                { topic: "Neuroscience", progress: 85, color: "#00F5D4" },
                { topic: "Quantum Mechanics", progress: 62, color: "#38BDF8" },
                { topic: "Macroeconomics", progress: 40, color: "#FF8A00" },
              ].map((topic, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-text-secondary font-medium">{topic.topic}</span>
                    <span className="font-display font-bold" style={{ color: topic.color }}>{topic.progress}%</span>
                  </div>
                  <div
                    className="w-full h-2.5 rounded-full overflow-hidden relative"
                    style={{
                      background: "rgba(5, 8, 22, 0.8)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{
                        background: topic.color,
                        boxShadow: `0 0 15px ${topic.color}50`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Diagnosis */}
          <div
            className="neural-glass-panel p-8 relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, rgba(11, 16, 32, 0.65), rgba(255, 138, 0, 0.04))",
              border: "1px solid rgba(255, 138, 0, 0.1)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full group-hover:opacity-20 opacity-10 transition-opacity duration-700 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255, 138, 0, 0.3), transparent)",
                filter: "blur(40px)",
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="w-6 h-6 text-quantum-orange" />
                <h3 className="text-xl font-display font-semibold text-text-primary">
                  AI Diagnosis
                </h3>
              </div>
              <p className="text-text-muted leading-relaxed text-sm">
                Your retention in{" "}
                <span className="text-text-primary font-medium">Neuroscience</span> is
                optimal. Focus your next deep-work block on{" "}
                <span className="text-quantum-orange font-medium">Macroeconomics</span> to
                balance your knowledge matrix.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
