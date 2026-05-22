"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { TopNavbar } from "../Navigation/TopNavbar";

// Dynamically import heavy UI components with SSR disabled for optimal loading speeds
const NeuralBackground = dynamic(
  () => import("../Background/NeuralBackground").then((mod) => mod.NeuralBackground),
  { ssr: false }
);

const QuantumDock = dynamic(
  () => import("../Navigation/QuantumDock").then((mod) => mod.QuantumDock),
  { ssr: false }
);

const FloatingAIAssistant = dynamic(
  () => import("../Assistant/FloatingAIAssistant").then((mod) => mod.FloatingAIAssistant),
  { ssr: false }
);

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-void flex flex-col relative text-text-primary noise-overlay">
      {/* Immersive Neural Background */}
      <NeuralBackground />

      {/* Top Command Bar */}
      <TopNavbar />

      {/* Main content area */}
      <main className="flex-1 w-full pt-[88px] pb-[110px] px-6 lg:px-12 relative z-10 overflow-y-auto overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Quantum Dock */}
      <QuantumDock />

      {/* AI Assistant Orb */}
      <FloatingAIAssistant />
    </div>
  );
}
