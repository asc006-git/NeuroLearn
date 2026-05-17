import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, Mail, Lock, User, ArrowRight } from "lucide-react";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate auth
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-base-dark flex relative overflow-hidden">
      {/* Left Side - Abstract Blobs & Branding */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] bg-accent-orange/20 rounded-full blur-[100px] -top-20 -left-20 pointer-events-none"
        />
        <motion.div
          animate={{
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[500px] h-[500px] bg-accent-teal/20 rounded-full blur-[100px] bottom-0 right-0 pointer-events-none"
        />
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-card border border-white/10 rounded-xl">
              <Brain className="w-8 h-8 text-accent-orange" />
            </div>
            <h1 className="text-3xl font-bold text-white">NeuroLearn AI</h1>
          </div>
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Your Premium <br />
            <span className="text-gradient-teal">Study Workspace</span>
          </h2>
          <p className="text-text-muted text-lg">
            Unlock the power of artificial intelligence to synthesize, understand, and master complex subjects faster than ever before.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md premium-glass p-10 rounded-3xl"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-text-muted">
              {isLogin
                ? "Enter your credentials to access your workspace."
                : "Join the next generation of accelerated learning."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50" />
                  <input
                    type="text"
                    className="w-full bg-base/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50" />
                <input
                  type="email"
                  className="w-full bg-base/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-muted">Password</label>
                {isLogin && (
                  <a href="#" className="text-sm text-accent-teal hover:text-cyan-300 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50" />
                <input
                  type="password"
                  className="w-full bg-base/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-orange hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl shadow-lg glow-orange transition-all flex items-center justify-center gap-2 group"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white font-medium hover:text-accent-orange transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
