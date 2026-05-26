"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { BrainCircuit, Lock, ArrowRight, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Precompute particles client-side only
  const particles = useMemo(() => {
    if (!mounted) return [];
    return [...Array(3)].map((_, i) => ({
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      background: i % 2 === 0 ? "rgba(0, 245, 212, 0.5)" : "rgba(56, 189, 248, 0.4)",
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 4,
    }));
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset authorization token is missing from the URL.");
      return;
    }

    if (password.length < 6) {
      setError("Security key must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Security keys do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Password reset failed.");
      } else {
        setSuccess(data.message || "Security key synchronized successfully.");
        setTimeout(() => {
          router.push("/auth");
        }, 2000);
      }
    } catch (err: any) {
      setError("A connection anomaly occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden">
      {/* Volumetric glows */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 245, 212, 0.15) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 138, 0, 0.1) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((particle, i) => (
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", ...springConfig }}
        className="w-full max-w-[440px] neural-glass-panel p-10 rounded-[32px] relative overflow-hidden z-10"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neural-cyan/30 to-transparent" />

        {/* Ambient glow */}
        <div
          className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0, 245, 212, 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-neural-cyan/20 blur-xl" />
            <div
              className="relative p-3 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(56, 189, 248, 0.2))",
                border: "1px solid rgba(0, 245, 212, 0.3)",
                boxShadow: "0 0 30px rgba(0, 245, 212, 0.2)",
              }}
            >
              <BrainCircuit className="w-6 h-6 text-neural-cyan" />
            </div>
          </div>
          <span className="font-display font-semibold tracking-tight text-text-primary text-lg">
            NeuroLearn AI
          </span>
        </div>

        {/* Title */}
        <div className="relative z-10 mb-8">
          <h3 className="text-3xl font-display font-bold text-text-primary mb-3 tracking-tight">
            Reset security key
          </h3>
          <p className="text-text-secondary text-sm">
            Set a new secure password for your neural workspace.
          </p>
        </div>

        {/* Feedback messages */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted pl-1">New Password</label>
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
            <div className="flex items-center gap-1.5 pt-0.5 pl-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neural-cyan" />
              <span className="text-[10px] text-text-ghost">Minimum 6 characters required.</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted pl-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-neural-cyan transition-colors" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-void/50 border border-white/8 rounded-2xl py-3 pl-11 pr-4 text-text-primary focus:outline-none focus:border-neural-cyan/40 focus:ring-1 focus:ring-neural-cyan/20 focus:bg-deep/80 transition-all placeholder:text-text-ghost text-sm"
                placeholder="••••••••"
                required
              />
            </div>
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
                Synchronize New Key
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <p className="text-text-ghost text-sm">
            Return to{" "}
            <button
              onClick={() => router.push("/auth")}
              className="text-neural-cyan font-medium hover:text-electric-blue transition-colors bg-transparent border-none cursor-pointer underline decoration-neural-cyan/30 underline-offset-4 hover:decoration-electric-blue"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-void flex items-center justify-center text-text-muted">
        Initializing secure sync session...
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
