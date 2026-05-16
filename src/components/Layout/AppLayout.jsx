import { motion } from "framer-motion";
import { TopNavbar } from "../Navigation/TopNavbar";
import { Sidebar } from "../Navigation/Sidebar";
import { InsightsPanel } from "../SidebarRight/InsightsPanel";

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-base text-text-main flex flex-col">
      <TopNavbar />
      
      <div className="flex-1 flex pt-[72px]">
        {/* Left Sidebar Fixed Container */}
        <div className="hidden md:block w-[280px] shrink-0 border-r border-border-subtle bg-base relative z-30">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-4xl mx-auto px-8 py-10 space-y-12 pb-32"
          >
            {children}
          </motion.div>
        </main>

        {/* Right Insights Fixed Container */}
        <div className="hidden xl:block w-[340px] shrink-0 border-l border-border-subtle bg-base relative z-30">
          <InsightsPanel />
        </div>
      </div>
    </div>
  );
}
