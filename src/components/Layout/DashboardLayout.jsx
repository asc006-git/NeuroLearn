import { Outlet } from "react-router-dom";
import { TopNavbar } from "../Navigation/TopNavbar";
import { QuantumDock } from "../Navigation/QuantumDock";
import { FloatingAIAssistant } from "../Assistant/FloatingAIAssistant";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#060816] flex flex-col relative text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-teal/5 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-orange/5 rounded-full filter blur-[150px]"></div>
      </div>

      <TopNavbar />
      
      {/* Main content area */}
      <main className="flex-1 w-full pt-[90px] pb-[100px] px-6 lg:px-12 relative z-10 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <QuantumDock />
      <FloatingAIAssistant />
    </div>
  );
}
