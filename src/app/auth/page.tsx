"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { BrainCircuit, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

interface AuthParticle {
  width: number;
  height: number;
  left: string;
  top: string;
  background: string;
  duration: number;
  delay: number;
}

interface AuthRightParticle {
  right: string;
  top: string;
  duration: number;
  delay: number;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Precompute left-side atmospheric particles (reduced from 8 to 4 for performance)
  const leftParticles = useMemo<AuthParticle[]>(() => {
    if (!mounted) return [];
    return [...Array(4)].map((_, i) => ({
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      background: i % 2 === 0 ? "rgba(0, 245, 212, 0.5)" : "rgba(56, 189, 248, 0.4)",
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 4,
    }));
  }, [mounted]);

  // Precompute right-side floating particles (reduced from 5 to 2 for performance)
  const rightParticles = useMemo<AuthRightParticle[]>(() => {
    if (!mounted) return [];
    return [...Array(2)].map(() => ({
      right: `${5 + Math.random() * 35}%`,
      top: `${10 + Math.random() * 80}%`,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 3,
    }));
  }, [mounted]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Sign In
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          setSuccess("Access granted. Syncing neural interface...");
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1000);
        }
      } else {
        // Sign Up
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Profile provision failed.");
        } else {
          setSuccess("Neural identity profile created! Authenticating...");
          // Auto login after signup
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError("Profile created, but auto-login failed. Please sign in manually.");
          } else {
            setTimeout(() => {
              router.push("/dashboard");
              router.refresh();
            }, 1200);
          }
        }
      }
    } catch (err: any) {
      setError("A connection anomaly occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLogin, name, email, password, router]);

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("OAuth connection failed.");
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-void flex relative overflow-hidden">
      {/* Left Side — Neural Atmosphere */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center p-16">
        {/* Volumetric glows */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ duration: 2 }}
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0, 245, 212, 0.2) 0%, transparent 70%)",
              filter: "blur(80px)",
              willChange: "opacity",
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ duration: 2, delay: 0.2 }}
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255, 138, 0, 0.15) 0%, transparent 70%)",
              filter: "blur(100px)",
              willChange: "opacity",
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 2, delay: 0.4 }}
            className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
              filter: "blur(80px)",
              willChange: "opacity",
            }}
          />
        </div>

        {/* Floating particles */}
        {leftParticles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: particle.width,
              height: particle.height,
              left: particle.left,
              top: particle.top,
              background: particle.background,
              willChange: "transform, opacity",
            }}
            animate={{
              y: [0, -30, 10, -20, 0],
              opacity: [0, 0.8, 0.3, 0.6, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
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
          style={{ willChange: "transform" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[25%] left-[20%] w-12 h-12 border border-quantum-orange/10 rounded-full"
          style={{ willChange: "transform" }}
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
            Elevate your <br />
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
        {rightParticles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2,
              height: 2,
              right: particle.right,
              top: particle.top,
              background: "rgba(0, 245, 212, 0.3)",
              willChange: "transform, opacity",
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
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

          <div className="relative z-10 mb-8">
            <motion.h3
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-display font-bold text-text-primary mb-3 tracking-tight"
            >
              {isLogin ? "Resume session" : "Initialize interface"}
            </motion.h3>
            <p className="text-text-secondary text-sm">
              {isLogin
                ? "Enter your credentials to access your neural workspace."
                : "Join the next generation of accelerated learning."}
            </p>
          </div>

          {/* Dynamic feedback messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2.5 z-10 relative"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-4 rounded-2xl bg-success/10 border border-success/20 text-success text-sm flex items-start gap-2.5 z-10 relative"
              >
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={springConfig}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-semibold text-text-muted pl-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-neural-cyan transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-void/50 border border-white/8 rounded-2xl py-3 pl-11 pr-4 text-text-primary focus:outline-none focus:border-neural-cyan/40 focus:ring-1 focus:ring-neural-cyan/20 focus:bg-deep/80 transition-all placeholder:text-text-ghost text-sm"
                      placeholder="Alex Carter"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-neural-cyan transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-void/50 border border-white/8 rounded-2xl py-3 pl-11 pr-4 text-text-primary focus:outline-none focus:border-neural-cyan/40 focus:ring-1 focus:ring-neural-cyan/20 focus:bg-deep/80 transition-all placeholder:text-text-ghost text-sm"
                  placeholder="alex@neurolearn.ai"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1">
                <label className="text-xs font-semibold text-text-muted">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs text-text-ghost hover:text-text-primary transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-neural-cyan transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-void/50 border border-white/8 rounded-2xl py-3 pl-11 pr-4 text-text-primary focus:outline-none focus:border-neural-cyan/40 focus:ring-1 focus:ring-neural-cyan/20 focus:bg-deep/80 transition-all placeholder:text-text-ghost text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              {!isLogin && (
                <div className="flex items-center gap-1.5 pt-0.5 pl-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neural-cyan" />
                  <span className="text-[10px] text-text-ghost">Minimum 6 characters required.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group mt-2 text-sm cursor-pointer disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
                color: "#050816",
                boxShadow: "0 0 25px rgba(0, 245, 212, 0.15), 0 6px 20px rgba(0, 245, 212, 0.1)",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#050816] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 z-10 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <span className="relative px-3 text-[10px] uppercase tracking-widest font-bold text-text-ghost bg-surface/80 rounded-full backdrop-blur-md">
              or connect via
            </span>
          </div>

          {/* Google OAuth Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full relative z-10 font-semibold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2.5 text-sm cursor-pointer border border-white/8 hover:border-white/15 bg-void/35 hover:bg-void/50 text-text-primary mb-6"
          >
            {/* Beautiful SVG Google Icon */}
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.82 2.96C6.26 7.42 8.92 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.71 2.88c2.16-1.99 3.42-4.92 3.42-8.61z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.54c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.5 7.02C.54 8.95 0 11.11 0 13.4s.54 4.45 1.5 6.38l3.82-2.96c-.24-.72-.38-1.49-.38-2.29z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.88c-1.03.69-2.35 1.1-4.25 1.1-3.08 0-5.74-2.38-6.68-5.46L1.5 15.82C3.4 19.65 7.35 23 12 23z"
              />
            </svg>
            Google OAuth
          </button>

          <div className="mt-4 text-center relative z-10">
            <p className="text-text-ghost text-sm">
              {isLogin ? "New to NeuroLearn?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }}
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
