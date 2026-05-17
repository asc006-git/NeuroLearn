import { motion } from "framer-motion";
import { 
  UploadCloud, 
  FileText, 
  Brain, 
  TrendingUp, 
  Clock, 
  Target,
  ChevronRight,
  Sparkles
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

export function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between premium-glass p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-orange opacity-10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex-1 space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-accent-teal text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Ready</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Welcome back, <span className="text-gradient-orange">Alex</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            You're on a 5-day study streak! Your AI assistant has processed 3 new documents and generated 2 new quiz sets for you.
          </p>
          <div className="pt-4 flex gap-4">
            <button className="bg-white text-card font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg">
              <UploadCloud className="w-5 h-5" />
              Upload Material
            </button>
            <button className="bg-card border border-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/5 transition-colors">
              View Summaries
            </button>
          </div>
        </div>

        <div className="lg:w-1/3 flex justify-center z-10">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-48 relative"
          >
            <div className="absolute inset-0 bg-gradient-teal opacity-20 blur-2xl rounded-full" />
            <div className="absolute inset-0 border border-accent-teal/30 rounded-full flex items-center justify-center bg-card/50 backdrop-blur-sm">
              <Brain className="w-20 h-20 text-accent-teal" />
            </div>
            {/* Orbiting particles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-white/10 rounded-full"
            >
              <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-accent-orange rounded-full glow-orange" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Study Streak", value: "5 Days", icon: TrendingUp, color: "text-accent-orange", bg: "bg-accent-orange/10" },
          { label: "Hours Learned", value: "24.5h", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Quiz Avg Score", value: "85%", icon: Target, color: "text-accent-teal", bg: "bg-accent-teal/10" },
          { label: "Docs Processed", value: "12", icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card p-6 flex items-center gap-4 group hover:border-white/20 transition-colors"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-muted text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
            <select className="bg-card border border-white/10 rounded-lg px-3 py-1 text-sm text-text-muted focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Recommendations */}
        <div className="space-y-6">
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Continue Learning</h3>
              <button className="text-sm text-accent-teal hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { title: "Neuroscience 101 Summary", type: "AI Summary", time: "2h ago" },
                { title: "Cellular Biology Quiz", type: "Quiz", time: "5h ago" },
                { title: "Physics Chapter 4", type: "Document", time: "1d ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-text-muted group-hover:text-white transition-colors">
                      {item.type === 'Quiz' ? <Target className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white line-clamp-1">{item.title}</p>
                      <p className="text-xs text-text-muted">{item.type} • {item.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Recommendation Widget */}
          <div className="premium-card p-6 bg-gradient-to-br from-card to-accent-teal/10 border-accent-teal/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent-teal" />
              <h3 className="text-lg font-semibold text-white">AI Suggestion</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Based on your recent performance in <span className="text-white font-medium">Cellular Biology</span>, you should review the mitochondria function flashcards.
            </p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 rounded-lg transition-colors border border-white/5">
              Start Review Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
