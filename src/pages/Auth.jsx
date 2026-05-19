import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-void flex relative overflow-hidden">
      {/* Left Side — Neural Atmosphere */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center p-16">
        {/* Volumetric glows */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            animate={{ rotate: [0, 90, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(0, 245, 212, 0.2) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <motion.div
            animate={{ rotate: [0, -90, 0], scale: [1, 1.5, 1] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(255, 138, 0, 0.15) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
          <motion.div
            animate={{ y: [0, -60, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: i % 2 === 0 ? "rgba(0, 245, 212, 0.5)" : "rgba(56, 189, 248, 0.4)",
            }}
            animate={{
              y: [0, -30, 10, -20, 0],
              opacity: [0, 0.8, 0.3, 0.6, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              delay: Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Animated AI glyphs — abstract geometric shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[15%] w-16 h-16 border border-neural-cyan/10 rounded-lg"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[25%] left-[20%] w-12 h-12 border border-quantum-orange/10 rounded-full"
        />

        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-neural-cyan/20 blur-xl" />
              <div
                className="relative p-3.5 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(56, 189, 248, 0.2))",
                  border: "1px solid rgba(0, 245, 212, 0.3)",
                  boxShadow: "0 0 30px rgba(0, 245, 212, 0.2)",
                }}
              >
                <BrainCircuit className="w-8 h-8 text-neural-cyan" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
              NeuroLearn AI
            </h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl font-display font-bold text-text-primary leading-[1.05] mb-8"
          >
            Elevate your{" "}
            <br />
            <span className="text-gradient-neural">cognitive potential.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-text-secondary text-xl leading-relaxed max-w-md font-light"
          >
            A cinematic AI-native operating system designed to transform raw information into structured, intelligent mastery.
          </motion.p>
        </div>
      </div>

      {/* Right Side — Floating Authentication Panel */}
      <div
        className="w-full lg:w-[45%] flex items-center justify-center p-8 z-10"
        style={{
          background: "rgba(7, 17, 34, 0.3)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Floating particles behind auth card */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2,
              height: 2,
              right: `${5 + Math.random() * 35}%`,
              top: `${10 + Math.random() * 80}%`,
              background: "rgba(0, 245, 212, 0.3)",
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              delay: Math.random() * 3,
              repeat: Infinity,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", ...springConfig }}
          className="w-full max-w-[440px] neural-glass-panel p-10 rounded-[32px] relative overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neural-cyan/30 to-transparent" />

          {/* Ambient glow */}
          <div
            className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background: isLogin
                ? "radial-gradient(circle, rgba(0, 245, 212, 0.08) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
              transition: "background 0.5s ease",
            }}
          />

          <div className="relative z-10 mb-10">
            <motion.h3
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-display font-bold text-text-primary mb-3 tracking-tight"
            >
              {isLogin ? "Resume session" : "Initialize interface"}
            </motion.h3>
            <p className="text-text-secondary">
              {isLogin
                ? "Enter your credentials to access your neural workspace."
                : "Join the next generation of accelerated learning."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={springConfig}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-text-muted pl-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted group-focus-within:text-neural-cyan transition-colors" />
                    <input
                      type="text"
                      className="w-full bg-void/50 border border-white/8 rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-neural-cyan/40 focus:ring-1 focus:ring-neural-cyan/20 focus:bg-deep/80 transition-all placeholder:text-text-ghost text-sm"
                      placeholder="Alex Carter"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted group-focus-within:text-neural-cyan transition-colors" />
                <input
                  type="email"
                  className="w-full bg-void/50 border border-white/8 rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-neural-cyan/40 focus:ring-1 focus:ring-neural-cyan/20 focus:bg-deep/80 transition-all placeholder:text-text-ghost text-sm"
                  placeholder="alex@neurolearn.ai"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-sm font-medium text-text-muted">Password</label>
                {isLogin && (
                  <a href="#" className="text-sm text-text-ghost hover:text-text-primary transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted group-focus-within:text-neural-cyan transition-colors" />
                <input
                  type="password"
                  className="w-full bg-void/50 border border-white/8 rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-neural-cyan/40 focus:ring-1 focus:ring-neural-cyan/20 focus:bg-deep/80 transition-all placeholder:text-text-ghost text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              {!isLogin && (
                <div className="flex items-center gap-2 pt-1 pl-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neural-cyan" />
                  <span className="text-xs text-text-ghost">Minimum 8 characters required.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full font-semibold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group mt-3 text-sm"
              style={{
                background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
                color: "#050816",
                boxShadow: "0 0 30px rgba(0, 245, 212, 0.2), 0 8px 24px rgba(0, 245, 212, 0.15)",
              }}
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-text-ghost text-sm">
              {isLogin ? "New to NeuroLearn?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-neural-cyan font-medium hover:text-electric-blue transition-colors underline decoration-neural-cyan/30 underline-offset-4 hover:decoration-electric-blue"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
