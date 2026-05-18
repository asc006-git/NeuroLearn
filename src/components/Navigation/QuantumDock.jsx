import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Files, 
  FileText, 
  Beaker, 
  Lightbulb, 
  BarChart3, 
  Settings 
} from "lucide-react";

export function QuantumDock() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Workspace", path: "/workspace", icon: FolderOpen },
    { name: "Documents", path: "/documents", icon: Files },
    { name: "Summaries", path: "/summaries", icon: FileText },
    { name: "Quiz Lab", path: "/quiz-lab", icon: Beaker },
    { name: "Smart Notes", path: "/smart-notes", icon: Lightbulb },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-3xl flex justify-center px-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        className="pointer-events-auto bg-[#0B1120]/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-2 relative overflow-hidden"
      >
        {/* Subtle top border glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path} className="relative group">
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-card border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  {item.name}
                </div>
              </div>

              {/* Icon Container */}
              <motion.div
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isActive 
                    ? "text-white" 
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                
                {/* Active indicator ring */}
                {isActive && (
                  <motion.div
                    layoutId="activeDockIndicator"
                    className="absolute inset-0 rounded-full border border-white/20 bg-white/5"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Active glow dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-teal glow-teal"></div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
