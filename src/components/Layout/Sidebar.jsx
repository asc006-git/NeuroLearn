import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  ListOrdered, 
  Lightbulb, 
  PenTool, 
  BarChart3, 
  Bot, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Brain
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderOpen, label: "Workspace", path: "/workspace" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: ListOrdered, label: "Summaries", path: "/summaries" },
  { icon: PenTool, label: "Quiz Lab", path: "/quiz-lab" },
  { icon: Lightbulb, label: "Smart Notes", path: "/smart-notes" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Bot, label: "AI Assistant", path: "/ai-assistant" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="bg-card border-r border-white/5 h-screen flex flex-col relative z-20 transition-all duration-300"
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-8 bg-card border border-white/10 rounded-full p-1 hover:bg-card-hover transition-colors z-30 shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-5 h-5 text-text-muted" /> : <ChevronLeft className="w-5 h-5 text-text-muted" />}
      </button>

      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-orange rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-bold text-white whitespace-nowrap"
              >
                NeuroLearn <span className="text-accent-teal">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group",
                isActive 
                  ? "text-white bg-white/5" 
                  : "text-text-muted hover:text-white hover:bg-white/5"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-accent-orange rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={clsx("w-5 h-5 shrink-0 transition-colors", isActive ? "text-accent-orange" : "group-hover:text-white")} />
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {collapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-card border border-white/10 rounded-md text-sm text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-white/5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group",
              isActive 
                ? "text-white bg-white/5" 
                : "text-text-muted hover:text-white hover:bg-white/5"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-accent-orange rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <SettingsIcon className={clsx("w-5 h-5 shrink-0 transition-colors", isActive ? "text-accent-orange" : "group-hover:text-white")} />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </NavLink>
      </div>
    </motion.aside>
  );
}
