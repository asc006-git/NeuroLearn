import { motion } from "framer-motion";
import { 
  UploadCloud, 
  FileText, 
  BrainCircuit, 
  TrendingUp, 
  Clock, 
  Target,
  ChevronRight,
  Sparkles,
  Zap
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 75 },
  { name: 'Wed', score: 70 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 80 },
  { name: 'Sat', score: 95 },
  { name: 'Sun', score: 90 },
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

export function Dashboard() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-8 items-center justify-between premium-glass-panel p-10 rounded-[32px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-orange/10 blur-[120px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-20" />
        
        <div className="flex-1 space-y-5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0B1120]/80 border border-white/10 rounded-full text-accent-orange text-sm font-medium mb-2 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            <Sparkles className="w-4 h-4" />
            <span>AI Processing Complete</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight tracking-tight">
            Welcome back, <span className="text-gradient-orange">Alex</span>.
          </h1>
          <p className="text-text-muted text-lg max-w-xl font-light">
            You're on a <span className="text-white font-medium">5-day streak</span>! Your quantum AI has processed 3 new documents and generated a customized memory quiz for you.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button className="bg-white text-[#060816] font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95">
              <UploadCloud className="w-5 h-5" />
              Upload Material
            </button>
            <button className="bg-[#0B1120] border border-white/10 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/5 transition-all hover:border-white/20 hover:scale-105 active:scale-95">
              Review Synthesized Notes
            </button>
          </div>
        </div>

        <div className="lg:w-1/3 flex justify-center z-10 relative">
          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-56 h-56 relative"
          >
            {/* Holographic Glowing Orb */}
            <div className="absolute inset-0 bg-accent-teal/20 blur-[50px] rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-accent-orange/20 blur-[30px] rounded-full" />
            
            <div className="absolute inset-0 border border-white/10 rounded-full flex items-center justify-center bg-[#0B1120]/60 backdrop-blur-md shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]">
              <BrainCircuit className="w-20 h-20 text-accent-teal opacity-90 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
            </div>
            
            {/* Orbital Rings */}
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.05, 1] }}
              transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute -inset-4 border border-accent-orange/20 rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-white/5 rounded-full"
            >
              <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-accent-cyan rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Neural Streak", value: "5 Days", icon: Zap, color: "text-accent-orange", glow: "glow-orange" },
          { label: "Deep Work", value: "24.5h", icon: Clock, color: "text-accent-cyan", glow: "shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]" },
          { label: "Knowledge Retention", value: "85%", icon: Target, color: "text-accent-teal", glow: "glow-teal" },
          { label: "Sources Synthesized", value: "12", icon: FileText, color: "text-purple-400", glow: "shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]" },
        ].map((stat, i) => (
          <div
            key={i}
            className="premium-card-interactive p-6 flex items-center gap-5 group cursor-default relative overflow-hidden"
          >
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-xl bg-current ${stat.color} group-hover:opacity-20 transition-opacity`} />
            
            <div className={`relative z-10 p-4 rounded-2xl bg-[#0B1120] border border-white/5 ${stat.color} group-hover:scale-110 group-hover:${stat.glow} transition-all duration-500`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-text-muted text-sm font-medium mb-1 tracking-wide">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 premium-card p-8 flex flex-col group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-semibold text-white mb-1">Cognitive Performance</h3>
              <p className="text-sm text-text-muted">Your learning efficiency over time.</p>
            </div>
            <select className="bg-[#060816] border border-white/10 rounded-xl px-4 py-2 text-sm text-text-muted focus:outline-none focus:border-accent-teal/50 transition-colors cursor-pointer">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px] relative">
            <div className="absolute inset-0 bg-gradient-to-t from-accent-teal/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#14B8A6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  activeDot={{ r: 6, fill: '#0B1120', stroke: '#14B8A6', strokeWidth: 3 }}
                  filter="url(#glow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Recommendations */}
        <div className="space-y-6">
          <div className="premium-card p-6 border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-white">Continue Learning</h3>
              <button className="text-sm text-accent-teal hover:text-cyan-400 transition-colors">View All</button>
            </div>
            <div className="space-y-3">
              {[
                { title: "Neuroscience 101 Summary", type: "AI Summary", time: "2h ago", icon: BrainCircuit, color: "text-accent-purple" },
                { title: "Cellular Biology Quiz", type: "Adaptive Quiz", time: "5h ago", icon: Target, color: "text-accent-orange" },
                { title: "Physics Chapter 4", type: "Raw Source", time: "1d ago", icon: FileText, color: "text-text-muted" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 bg-[#060816] rounded-xl border border-white/5 ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white line-clamp-1">{item.title}</p>
                      <p className="text-xs text-text-subtle mt-0.5">{item.type} • {item.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Recommendation Widget */}
          <div className="premium-glass p-1 rounded-2xl relative overflow-hidden group">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/40 via-accent-orange/40 to-accent-teal/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-[#060816]/90 backdrop-blur-xl p-6 rounded-[14px] h-full border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent-teal/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-accent-teal" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white">Smart Suggestion</h3>
              </div>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                Based on your neural mapping in <span className="text-white font-medium">Cellular Biology</span>, reviewing the <span className="text-accent-teal">mitochondria function notes</span> will solidify your retention.
              </p>
              <button className="w-full bg-[#0B1120] hover:bg-white/10 text-white text-sm font-medium py-3 rounded-xl transition-all border border-white/10 hover:border-accent-teal/30 flex items-center justify-center gap-2 group/btn">
                Initiate Review
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
