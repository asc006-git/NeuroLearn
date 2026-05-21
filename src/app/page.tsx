"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

export default function Splash() {
  const router = useRouter();
  const [showTagline, setShowTagline] = useState(false);
  const title = "NeuroLearn AI";

  useEffect(() => {
    const taglineTimer = setTimeout(() => setShowTagline(true), 1200);
    const navTimer = setTimeout(() => router.push("/auth"), 3200);
    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Deep ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 245, 212, 0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 1.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut", delay: 0.3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 138, 0, 0.08) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* Neural particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: Math.random() * 100 - 50,
            x: Math.random() * 300 - 150,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: -150 - Math.random() * 100,
            x: Math.random() * 200 - 100,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1.5,
            ease: "easeOut",
          }}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: i % 3 === 0 ? "rgba(0, 245, 212, 0.6)" : i % 3 === 1 ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 138, 0, 0.5)",
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="flex flex-col items-center z-20"
      >
        {/* Animated Neural Orb */}
        <motion.div
          initial={{ filter: "blur(20px)", scale: 0.8 }}
          animate={{ filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 1.8, delay: 0.3 }}
          className="relative w-28 h-28 mb-10"
        >
          {/* Outer pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(0, 245, 212, 0.15)", filter: "blur(15px)" }}
          />

          {/* Orbital ring 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 rounded-full border border-neural-cyan/20 border-dashed"
          />

          {/* Orbital ring 2 */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 rounded-full border border-white/5"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neural-cyan glow-cyan" />
          </motion.div>

          {/* Core orb */}
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(11, 16, 32, 0.9), rgba(7, 17, 34, 0.9))",
              border: "1px solid rgba(0, 245, 212, 0.2)",
              boxShadow: "inset 0 0 40px rgba(0, 245, 212, 0.1), 0 0 60px rgba(0, 245, 212, 0.15)",
            }}
          >
            <BrainCircuit className="w-14 h-14 text-neural-cyan drop-shadow-[0_0_20px_rgba(0,245,212,0.5)]" />
          </div>
        </motion.div>

        {/* Title — staggered letter reveal */}
        <div className="flex overflow-hidden mb-5">
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 40, opacity: 0, filter: "blur(8px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: 0.6,
                delay: 0.6 + i * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-5xl md:text-6xl font-display font-bold text-text-primary tracking-tight"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        {/* Tagline — typewriter reveal */}
        <AnimatePresence>
          {showTagline && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-text-muted text-lg tracking-[0.2em] font-medium uppercase"
            >
              A Cognitive Operating System
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Exit transition mask */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.6 }}
        className="absolute inset-0 z-50 pointer-events-none"
        style={{ background: "#050816" }}
      />
    </div>
  );
}
