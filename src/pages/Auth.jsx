import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#060816] flex relative overflow-hidden">
      {/* Left Side - Premium Abstract Mesh Gradients */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center p-16">
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{
              rotate: [0, 90, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="mesh-blob w-[600px] h-[600px] bg-accent-orange/20 -top-20 -left-20"
          />
          <motion.div
            animate={{
              rotate: [0, -90, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="mesh-blob w-[500px] h-[500px] bg-accent-teal/20 bottom-0 right-0"
          />
          <motion.div
            animate={{
              y: [0, -50, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="mesh-blob w-[400px] h-[400px] bg-accent-cyan/15 top-1/2 left-1/4"
          />
        </div>
        
        <div className="relative z-10 max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="p-3 bg-gradient-orange rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">NeuroLearn</h1>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl font-display font-bold text-white leading-[1.1] mb-8"
          >
            Elevate your <br />
            <span className="text-gradient-teal">cognitive potential.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-text-muted text-xl leading-relaxed max-w-md font-light"
          >
            A cinematic AI-native workspace designed to transform raw information into structured, intelligent mastery.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Floating Authentication Panel */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 z-10 bg-[#0B1120]/40 backdrop-blur-md border-l border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] premium-glass-panel p-10 rounded-3xl"
        >
          <div className="mb-10">
            <h3 className="text-3xl font-display font-bold text-white mb-3 tracking-tight">
              {isLogin ? "Welcome back" : "Create your account"}
            </h3>
            <p className="text-text-muted">
              {isLogin
                ? "Enter your details to access your AI workspace."
                : "Join the next generation of accelerated learning."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-text-muted pl-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-teal transition-colors" />
                    <input
                      type="text"
                      className="w-full bg-[#060816]/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/50 transition-all placeholder:text-text-subtle"
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
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-teal transition-colors" />
                <input
                  type="email"
                  className="w-full bg-[#060816]/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/50 transition-all placeholder:text-text-subtle"
                  placeholder="alex@neurolearn.ai"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-sm font-medium text-text-muted">Password</label>
                {isLogin && (
                  <a href="#" className="text-sm text-text-subtle hover:text-white transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-teal transition-colors" />
                <input
                  type="password"
                  className="w-full bg-[#060816]/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/50 transition-all placeholder:text-text-subtle"
                  placeholder="••••••••"
                  required
                />
              </div>
              {!isLogin && (
                <div className="flex items-center gap-2 pt-2 pl-1">
                  <ShieldCheck className="w-4 h-4 text-accent-teal" />
                  <span className="text-xs text-text-subtle">Passwords must be at least 8 characters.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-white text-[#060816] hover:bg-gray-200 font-semibold py-3.5 px-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2 group mt-2"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-subtle">
              {isLogin ? "New to NeuroLearn?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white font-medium hover:text-accent-teal transition-colors underline decoration-white/30 underline-offset-4 hover:decoration-accent-teal"
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
