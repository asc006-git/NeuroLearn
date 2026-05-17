import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Clock, BookOpen, BrainCircuit } from "lucide-react";

const activityData = [
  { name: 'Week 1', hours: 12 },
  { name: 'Week 2', hours: 19 },
  { name: 'Week 3', hours: 15 },
  { name: 'Week 4', hours: 22 },
];

export function Analytics() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Learning Analytics</h1>
        <p className="text-text-muted">Track your progress and AI engagement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Study Time", value: "68h", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Documents Read", value: "45", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "AI Interactions", value: "128", icon: BrainCircuit, color: "text-accent-teal", bg: "bg-accent-teal/10" },
          { label: "Knowledge Growth", value: "+24%", icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-muted text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Study Time (Monthly)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="hours" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Topic Mastery Breakdown</h3>
          <div className="space-y-6">
            {[
              { topic: "Neuroscience", progress: 85, color: "bg-accent-teal" },
              { topic: "Cellular Biology", progress: 60, color: "bg-purple-500" },
              { topic: "Organic Chemistry", progress: 40, color: "bg-accent-orange" },
            ].map((topic, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">{topic.topic}</span>
                  <span className="text-text-muted">{topic.progress}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${topic.color} rounded-full`} style={{ width: `${topic.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
