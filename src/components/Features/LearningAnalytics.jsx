import { motion } from "framer-motion";
import { Activity, Target, Clock, Zap } from "lucide-react";

export function LearningAnalytics() {
  return (
    <section className="w-full mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-400" />
          Learning Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Retention Probability */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium text-sm">Retention Rate</span>
            <Target className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">87%</h3>
            <span className="text-xs text-green-400 font-medium mb-1">+5% this week</span>
          </div>
          
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "87%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)]"
            />
          </div>
        </div>

        {/* Complexity Meter */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium text-sm">Doc Complexity</span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">High</h3>
            <span className="text-xs text-slate-500 font-medium mb-1">Postgrad level</span>
          </div>
          
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden flex">
            <div className="h-full w-1/3 bg-orange-500/20" />
            <div className="h-full w-1/3 bg-orange-500/60" />
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "33%" }}
              transition={{ duration: 1 }}
              className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
            />
          </div>
        </div>

        {/* Study Time Prediction */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium text-sm">Est. Study Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">45m</h3>
            <span className="text-xs text-slate-500 font-medium mb-1">Total to master</span>
          </div>
          
          {/* Circular Chart Placeholder */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">vs Normal: 1h 20m</span>
            <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">
              -43% time
            </span>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium text-sm">AI Confidence</span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">98%</h3>
            <span className="text-xs text-slate-500 font-medium mb-1">Accuracy</span>
          </div>
          
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "98%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
