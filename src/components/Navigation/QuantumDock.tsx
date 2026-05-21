"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Files,
  FileText,
  Beaker,
  Lightbulb,
  BarChart3,
  Settings,
} from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

interface NavItem {
  name: string;
  path: string;
  icon: any;
}

function DockIcon({
  item,
  isActive,
  mouseX,
}: {
  item: NavItem;
  isActive: boolean;
  mouseX: any;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate distance from mouse to icon center for magnetic effect
  const distance = useTransform(mouseX, (val: number) => {
    if (!ref.current) return 150;
    const rect = ref.current.getBoundingClientRect();
    const iconCenter = rect.left + rect.width / 2;
    return Math.abs(val - iconCenter);
  });

  // Magnetic scaling — closer = bigger
  const scale = useSpring(
    useTransform(distance, [0, 80, 200], [1.15, 1.05, 1]),
    springConfig
  );

  // Magnetic Y lift
  const y = useSpring(
    useTransform(distance, [0, 80, 200], [-6, -2, 0]),
    springConfig
  );

  return (
    <Link href={item.path} className="relative group" ref={ref}>
      {/* Glow effect on hover */}
      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 rounded-2xl blur-lg pointer-events-none"
            style={{
              background: "radial-gradient(circle, #00F5D4 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon + Label Container */}
      <motion.div
        style={{ scale, y }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 min-w-[76px] h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
          isActive
            ? "text-neural-cyan"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        <item.icon
          size={18}
          strokeWidth={isActive ? 2.5 : 1.8}
          className="relative z-10 transition-transform duration-300"
        />

        {/* Text Label Below Icon */}
        <span
          className={`text-[9px] font-medium tracking-wide mt-1.5 transition-colors duration-300 ${
            isActive ? "text-neural-cyan font-semibold" : "text-text-muted group-hover:text-text-primary"
          }`}
          style={{
            textShadow: isActive ? "0 0 10px rgba(0, 245, 212, 0.3)" : "none",
          }}
        >
          {item.name}
        </span>

        {/* Active indicator — glowing background */}
        {isActive && (
          <motion.div
            layoutId="activeDockBg"
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "rgba(0, 245, 212, 0.06)",
              border: "1px solid rgba(0, 245, 212, 0.2)",
              boxShadow:
                "inset 0 0 10px rgba(0, 245, 212, 0.08), 0 0 15px rgba(0, 245, 212, 0.05)",
            }}
            transition={springConfig}
          />
        )}
      </motion.div>

      {/* Floating AI pulse under active tab */}
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2"
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
  const pathname = usePathname();
  const mouseX = useMotionValue(-1000);

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Documents", path: "/documents", icon: Files },
    { name: "Summaries", path: "/summaries", icon: FileText },
    { name: "Quiz Lab", path: "/quiz-lab", icon: Beaker },
    { name: "Smart Notes", path: "/smart-notes", icon: Lightbulb },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-4xl flex justify-center px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", ...springConfig, delay: 0.3 }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(-1000)}
        className="pointer-events-auto relative rounded-3xl p-2.5 flex items-center gap-1 animate-breathe"
        style={{
          background: "rgba(5, 8, 22, 0.65)",
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

        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <DockIcon
              key={item.name}
              item={item}
              isActive={isActive}
              mouseX={mouseX}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
