import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Depth Blur */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-orange/10 rounded-full blur-[150px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-teal/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Floating Particles (Neural Lines abstraction) */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 50, x: Math.random() * 200 - 100 }}
          animate={{ opacity: [0, 0.5, 0], y: -100 }}
          transition={{
            duration: 2.5,
            delay: Math.random() * 1,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-white/40 blur-[1px] z-10"
        />
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="flex flex-col items-center z-20"
      >
        <motion.div
          initial={{ filter: "blur(10px)" }}
          animate={{ filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="relative w-24 h-24 mb-8"
        >
          {/* Animated AI Pulse */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-accent-orange rounded-full blur-xl opacity-50"
          />
          <div className="relative bg-[#0B1120] border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(249,115,22,0.2)] w-full h-full flex items-center justify-center p-1">
            <BrainCircuit className="w-12 h-12 text-accent-orange" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
          className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight"
        >
          NeuroLearn
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1.2 }}
          className="text-text-muted text-lg tracking-wide font-medium"
        >
          Transform Information Into Intelligence
        </motion.p>
      </motion.div>

      {/* Outro Transition Mask */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.3 }}
        className="absolute inset-0 bg-[#060816] z-50 pointer-events-none"
      />
    </div>
  );
}
