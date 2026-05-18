import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { TrendingUp, Clock, BookOpen, BrainCircuit, Activity, Target } from "lucide-react";
import { cn } from "../lib/utils";

const activityData = [
  { name: 'Mon', hours: 2, neuralActivity: 40 },
  { name: 'Tue', hours: 4, neuralActivity: 65 },
  { name: 'Wed', hours: 3, neuralActivity: 50 },
  { name: 'Thu', hours: 6, neuralActivity: 85 },
  { name: 'Fri', hours: 5, neuralActivity: 75 },
  { name: 'Sat', hours: 8, neuralActivity: 95 },
  { name: 'Sun', hours: 4, neuralActivity: 60 },
];

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

export function Analytics() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight flex items-center gap-3">
            <Activity className="text-accent-teal w-8 h-8 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
            Cognitive Telemetry
          </h1>
          <p className="text-text-muted text-lg">Real-time analysis of your learning patterns and AI interactions.</p>
        </div>
        <select className="bg-[#0B1120] border border-white/10 rounded-xl px-5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-accent-teal/50 transition-colors cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <option>Trailing 7 Days</option>
          <option>Trailing 30 Days</option>
          <option>All Time</option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Deep Work Hours", value: "32.4h", icon: Clock, color: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/20", glow: "glow-teal" },
          { label: "Concepts Mastered", value: "148", icon: Target, color: "text-accent-orange", bg: "bg-accent-orange/10", border: "border-accent-orange/20", glow: "glow-orange" },
          { label: "Neural Synapses", value: "2.4k", icon: BrainCircuit, color: "text-accent-teal", bg: "bg-accent-teal/10", border: "border-accent-teal/20", glow: "glow-teal" },
          { label: "Efficiency Delta", value: "+34%", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", glow: "shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]" },
        ].map((stat, i) => (
          <div key={i} className="premium-glass-panel p-6 flex flex-col gap-4 group cursor-default relative overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-0 blur-2xl bg-current ${stat.color} group-hover:opacity-10 transition-opacity duration-700`} />
            
            <div className="flex justify-between items-start relative z-10">
              <div className={`p-3.5 rounded-2xl border bg-[#060816] ${stat.color} ${stat.border} group-hover:scale-110 group-hover:${stat.glow} transition-all duration-500`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="relative z-10 mt-2">
              <h3 className="text-3xl font-display font-bold text-white tracking-tight mb-1">{stat.value}</h3>
              <p className="text-text-muted text-sm font-medium tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="xl:col-span-2 premium-glass-panel p-8 flex flex-col group">
          <h3 className="text-xl font-display font-semibold text-white mb-8">Neural Activity & Focus Duration</h3>
          <div className="flex-1 min-h-[350px] relative">
            <div className="absolute inset-0 bg-gradient-to-t from-accent-cyan/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNeural" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glowCyan">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                  cursor={{ stroke: 'rgba(34,211,238,0.2)', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="neuralActivity" 
                  name="Neural Output"
                  stroke="#22D3EE" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorNeural)" 
                  activeDot={{ r: 6, fill: '#0B1120', stroke: '#22D3EE', strokeWidth: 3 }}
                  filter="url(#glowCyan)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Metrics */}
        <div className="space-y-8 flex flex-col">
          <div className="premium-glass-panel p-8 flex-1">
            <h3 className="text-xl font-display font-semibold text-white mb-8">Subject Mastery</h3>
            <div className="space-y-8">
              {[
                { topic: "Neuroscience", progress: 85, color: "bg-accent-teal", shadow: "shadow-[0_0_15px_rgba(20,184,166,0.5)]" },
                { topic: "Quantum Mechanics", progress: 62, color: "bg-accent-cyan", shadow: "shadow-[0_0_15px_rgba(34,211,238,0.5)]" },
                { topic: "Macroeconomics", progress: 40, color: "bg-accent-orange", shadow: "shadow-[0_0_15px_rgba(249,115,22,0.5)]" },
              ].map((topic, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-white font-medium group-hover:text-white transition-colors">{topic.topic}</span>
                    <span className="text-text-muted font-display font-bold">{topic.progress}%</span>
                  </div>
                  <div className="w-full bg-[#060816] h-2.5 rounded-full overflow-hidden border border-white/5 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
                      className={cn("absolute top-0 left-0 h-full rounded-full", topic.color, topic.shadow)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-glass-panel p-8 bg-gradient-to-br from-[#0B1120] to-accent-orange/5 border-accent-orange/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/10 blur-[50px] rounded-full group-hover:bg-accent-orange/20 transition-colors duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="w-6 h-6 text-accent-orange" />
                <h3 className="text-xl font-display font-semibold text-white">AI Diagnosis</h3>
              </div>
              <p className="text-text-muted leading-relaxed text-sm">
                Your retention in <span className="text-white font-medium">Neuroscience</span> is optimal. Focus your next deep-work block on <span className="text-accent-orange font-medium">Macroeconomics</span> to balance your knowledge matrix.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
