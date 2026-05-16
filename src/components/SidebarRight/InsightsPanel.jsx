import { motion } from "framer-motion";
import { Lightbulb, Clock, Activity, Target } from "lucide-react";

export function InsightsPanel() {
  return (
    <aside className="fixed top-[72px] bottom-0 right-0 w-[340px] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
      
      {/* Quiz Progress */}
      <div className="premium-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">
            <Target className="w-4 h-4 text-teal" /> Quiz Progress
          </h3>
          <span className="text-xs font-medium text-text-muted">3/5 Completed</span>
        </div>
        <div className="w-full h-1.5 bg-base rounded-full overflow-hidden mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ duration: 1 }}
            className="h-full bg-teal"
          />
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="premium-card p-4 border-amber/20 bg-amber/5">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-amber" />
          <h3 className="text-sm font-semibold text-text-main">AI Recommendation</h3>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          You struggled with "Backpropagation" in the last quiz. Reviewing the detailed notes section is recommended before continuing.
        </p>
      </div>

      {/* Performance Analytics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Study Time */}
        <div className="premium-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-orange" />
            <span className="text-xs font-medium text-text-muted">Study Time</span>
          </div>
          <div className="text-xl font-bold text-text-main">45m</div>
          <div className="text-[10px] text-orange mt-1">-15m vs avg</div>
        </div>

        {/* Focus Score */}
        <div className="premium-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-teal" />
            <span className="text-xs font-medium text-text-muted">Focus Score</span>
          </div>
          <div className="text-xl font-bold text-text-main">92%</div>
          <div className="text-[10px] text-teal mt-1">Excellent</div>
        </div>
      </div>

      {/* Revision Reminders */}
      <div className="premium-card p-4 flex-1">
        <h3 className="text-sm font-semibold text-text-main mb-3">Revision Reminders</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-orange mt-1.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-text-main">ML Basics Exam</p>
              <p className="text-[10px] text-text-muted">In 3 days • High priority</p>
            </div>
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <div className="w-2 h-2 rounded-full bg-border-subtle mt-1.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-text-main">Review Neural Nets</p>
              <p className="text-[10px] text-text-muted">In 1 week • Medium priority</p>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}
