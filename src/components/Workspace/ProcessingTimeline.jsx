import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, Brain, Sparkles, GraduationCap } from "lucide-react";
import { cn } from "../../lib/utils";

const STAGES = [
  { id: 1, icon: FileSearch, label: "Extracting Content" },
  { id: 2, icon: Brain, label: "Understanding Context" },
  { id: 3, icon: Sparkles, label: "Generating Summary" },
  { id: 4, icon: GraduationCap, label: "Building Quizzes" },
];

export function ProcessingTimeline() {
  const [activeStage, setActiveStage] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full max-w-4xl mx-auto py-12">
      <div className="relative flex justify-between items-center w-full">
        {/* Background Track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full" />
        
        {/* Animated Progress Beam */}
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-primary via-secondary to-transparent rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"
          initial={{ width: "0%" }}
          animate={{ width: `${((activeStage - 1) / (STAGES.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = stage.id === activeStage;
          const isPassed = stage.id < activeStage;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.2 : 1,
                  borderColor: isActive || isPassed ? "rgba(139, 92, 246, 1)" : "rgba(255, 255, 255, 0.2)",
                  backgroundColor: isActive || isPassed ? "rgba(15, 23, 42, 0.9)" : "rgba(15, 23, 42, 0.4)",
                  boxShadow: isActive ? "0 0 20px rgba(139, 92, 246, 0.5)" : "none",
                }}
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center backdrop-blur-md transition-colors duration-500 relative",
                  isActive && "neon-border"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-colors duration-500",
                    isActive || isPassed ? "text-primary" : "text-slate-500",
                    isActive && "animate-pulse"
                  )} 
                />
                
                {/* Active Stage Rotating Ring */}
                {isActive && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-6px] rounded-full border border-primary/40 border-t-transparent"
                  />
                )}
              </motion.div>
              
              <div className="absolute top-16 w-32 text-center">
                <p className={cn(
                  "text-xs font-medium transition-colors duration-500",
                  isActive ? "text-white" : isPassed ? "text-slate-300" : "text-slate-500"
                )}>
                  {stage.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
