import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderClosed, 
  FileText, 
  BrainCircuit, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Bot, 
  Settings,
  Sparkles
} from "lucide-react";
import { cn } from "../../lib/utils";

const MENU_GROUPS = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", active: true },
      { icon: FolderClosed, label: "Workspace" },
      { icon: FileText, label: "Documents" },
    ]
  },
  {
    title: "Learning",
    items: [
      { icon: BrainCircuit, label: "AI Summaries" },
      { icon: GraduationCap, label: "Quiz Lab" },
      { icon: BookOpen, label: "Smart Notes" },
    ]
  },
  {
    title: "More",
    items: [
      { icon: BarChart3, label: "Analytics" },
      { icon: Bot, label: "AI Assistant" },
      { icon: Settings, label: "Settings" },
    ]
  }
];

export function Sidebar() {
  return (
    <aside className="fixed top-[72px] bottom-0 w-[280px] p-4 overflow-y-auto custom-scrollbar flex flex-col">
      <div className="space-y-8 flex-1">
        {MENU_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                      item.active 
                        ? "bg-white/5 text-text-main font-medium" 
                        : "text-text-muted hover:text-text-main hover:bg-white/5"
                    )}
                  >
                    {item.active && (
                      <motion.div 
                        layoutId="activeSidebar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber rounded-r-full"
                      />
                    )}
                    <Icon className={cn(
                      "w-4 h-4 transition-colors",
                      item.active ? "text-amber" : "text-text-muted group-hover:text-text-main"
                    )} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4 pt-4 border-t border-border-subtle">
        {/* Upgrade Card */}
        <div className="p-4 rounded-xl premium-card bg-gradient-to-br from-bg-card to-bg-base relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-50">
            <Sparkles className="w-16 h-16 text-amber blur-xl" />
          </div>
          <div className="relative z-10">
            <h4 className="text-sm font-semibold text-text-main mb-1">Upgrade to Pro</h4>
            <p className="text-xs text-text-muted mb-3">Get unlimited summaries & advanced AI models.</p>
            <button className="w-full py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
              View Plans
            </button>
          </div>
        </div>

        {/* AI Status */}
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
          </span>
          <span className="text-xs font-medium text-text-muted">AI Systems Online</span>
        </div>
      </div>
    </aside>
  );
}
