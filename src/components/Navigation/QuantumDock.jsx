import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  Files,
  FileText,
  Beaker,
  Lightbulb,
  BarChart3,
  Settings,
} from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

function DockIcon({ item, isActive, mouseX, index }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate distance from mouse to icon center for magnetic effect
  const distance = useTransform(mouseX, (val) => {
    if (!ref.current) return 150;
    const rect = ref.current.getBoundingClientRect();
    const iconCenter = rect.left + rect.width / 2;
    return Math.abs(val - iconCenter);
  });

  // Magnetic scaling — closer = bigger
  const scale = useSpring(
    useTransform(distance, [0, 80, 200], [1.35, 1.1, 1]),
    springConfig
  );

  // Magnetic Y lift
  const y = useSpring(
    useTransform(distance, [0, 80, 200], [-10, -3, 0]),
    springConfig
  );

  return (
    <Link to={item.path} className="relative group" ref={ref}>
      {/* Context label — animate upward on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.8 }}
            transition={springConfig}
            className="absolute -top-14 left-1/2 -translate-x-1/2 pointer-events-none z-50"
          >
            <div className="neural-glass px-3.5 py-1.5 rounded-xl text-xs font-medium text-text-primary whitespace-nowrap shadow-2xl border border-white/10">
              {item.name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon Container */}
      <motion.div
        style={{ scale, y }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.9 }}
        className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
          isActive
            ? "text-neural-cyan"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        <item.icon
          size={20}
          strokeWidth={isActive ? 2.5 : 1.8}
          className="relative z-10"
        />

        {/* Active indicator — glowing background */}
        {isActive && (
          <motion.div
            layoutId="activeDockBg"
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "rgba(0, 245, 212, 0.1)",
              border: "1px solid rgba(0, 245, 212, 0.2)",
              boxShadow:
                "inset 0 0 12px rgba(0, 245, 212, 0.1), 0 0 20px rgba(0, 245, 212, 0.08)",
            }}
            transition={springConfig}
          />
        )}
      </motion.div>

      {/* Floating AI pulse under active tab */}
      {isActive && (
        <motion.div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springConfig}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-neural-cyan relative">
            <div className="absolute inset-0 rounded-full bg-neural-cyan animate-ring-pulse" />
          </div>
        </motion.div>
      )}
    </Link>
  );
}

export function QuantumDock() {
  const location = useLocation();
  const mouseX = useMotionValue(-1000);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Workspace", path: "/workspace", icon: FolderOpen },
    { name: "Documents", path: "/documents", icon: Files },
    { name: "Summaries", path: "/summaries", icon: FileText },
    { name: "Neural Lab", path: "/quiz-lab", icon: Beaker },
    { name: "Smart Notes", path: "/smart-notes", icon: Lightbulb },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-3xl flex justify-center px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", ...springConfig, delay: 0.3 }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(-1000)}
        className="pointer-events-auto relative rounded-full p-2.5 flex items-center gap-1 animate-breathe"
        style={{
          background: "rgba(5, 8, 22, 0.6)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Neon edge glow — top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-neural-cyan/30 to-transparent" />

        {/* Neon edge glow — bottom subtle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-electric-blue/15 to-transparent" />

        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <DockIcon
              key={item.name}
              item={item}
              isActive={isActive}
              mouseX={mouseX}
              index={i}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
