import { Outlet } from "react-router-dom";
import { TopNavbar } from "../Navigation/TopNavbar";
import { QuantumDock } from "../Navigation/QuantumDock";
import { FloatingAIAssistant } from "../Assistant/FloatingAIAssistant";
import { NeuralBackground } from "../Background/NeuralBackground";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-void flex flex-col relative text-text-primary noise-overlay">
      {/* Immersive Neural Background */}
      <NeuralBackground />

      {/* Top Command Bar */}
      <TopNavbar />

      {/* Main content area */}
      <main className="flex-1 w-full pt-[88px] pb-[110px] px-6 lg:px-12 relative z-10 overflow-y-auto overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Floating Quantum Dock */}
      <QuantumDock />

      {/* AI Assistant Orb */}
      <FloatingAIAssistant />
    </div>
  );
}
