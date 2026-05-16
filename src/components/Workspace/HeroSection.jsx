import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full flex flex-col md:flex-row items-center justify-between gap-10 z-10 pt-4 pb-8 border-b border-border-subtle">
      
      {/* Left Text Content */}
      <div className="flex-1 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full premium-card bg-base/50 mb-6 border border-amber/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber" />
          <span className="text-xs font-medium text-amber">NeuroLearn AI v2.0 Available</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-text-main leading-[1.1] mb-5"
        >
          Transform Complex Documents Into <span className="text-gradient-amber">Interactive Learning</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base text-text-muted mb-8 leading-relaxed max-w-lg"
        >
          Generate summaries, quizzes, simplified explanations, and smart notes using advanced AI directly from your uploaded files.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <button className="px-5 py-2.5 bg-text-main text-base font-medium rounded-lg text-sm hover:bg-white transition-colors flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-5 py-2.5 bg-white/5 border border-border-subtle text-text-main font-medium rounded-lg text-sm hover:bg-white/10 transition-colors">
            View Examples
          </button>
        </motion.div>
      </div>

      {/* Right Animated Orb */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-48 h-48 md:w-64 md:h-64 relative shrink-0 hidden sm:flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-amber/10 rounded-full blur-3xl" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="w-full h-full border border-border-subtle rounded-full relative"
        >
          <div className="absolute inset-4 border border-amber/20 rounded-full border-dashed" />
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-1/4 bg-gradient-to-tr from-bg-card to-accent-amber/20 border border-amber/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)]"
          >
            <Sparkles className="w-8 h-8 text-amber opacity-80" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
