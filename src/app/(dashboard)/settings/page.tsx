"use client";

import { useState } from "react";
import { User, Bell, Shield, Paintbrush, Database, Sparkles, LogOut, Command, Zap, Volume2, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const menuItems = [
  { id: "profile", label: "Account Profile", icon: User },
  { id: "ai", label: "Neural Preferences", icon: Sparkles },
  { id: "appearance", label: "Interface & Theme", icon: Paintbrush },
  { id: "notifications", label: "Alerts & Notifications", icon: Bell },
  { id: "security", label: "Privacy & Security", icon: Shield },
  { id: "data", label: "Data Management", icon: Database },
];

// Custom Neural Toggle
function NeuralToggle({ enabled, onToggle, color = "#00F5D4" }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-8 rounded-full transition-all duration-300 cursor-pointer"
      style={{
        background: enabled ? `${color}30` : "rgba(255,255,255,0.06)",
        border: enabled ? `1px solid ${color}50` : "1px solid rgba(255,255,255,0.1)",
        boxShadow: enabled ? `0 0 20px ${color}20` : "none",
      }}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 2 }}
        transition={springConfig}
        className="absolute top-1 w-6 h-6 rounded-full shadow-md"
        style={{
          background: enabled ? color : "rgba(148, 163, 184, 0.8)",
          boxShadow: enabled ? `0 0 12px ${color}60` : "none",
        }}
      />
    </button>
  );
}

// Custom Neural Slider
function NeuralSlider({ value, onChange, min = 1, max = 3, labels, color = "#FF8A00" }: { value: number; onChange: (v: number) => void; min?: number; max?: number; labels?: string[]; color?: string }) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3">
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow: `0 0 12px ${color}50`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Glowing thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 pointer-events-none"
          style={{
            left: `calc(${percentage}% - 8px)`,
            background: color,
            boxShadow: `0 0 15px ${color}60, 0 0 30px ${color}20`,
            border: "2px solid rgba(5, 8, 22, 0.9)",
          }}
        />
      </div>
      {labels && (
        <div className="flex justify-between text-xs text-text-muted font-medium">
          {labels.map((l, i) => (
            <span key={i} className={i === value - min ? "text-text-primary" : ""}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [processingIntensity, setProcessingIntensity] = useState(2);
  const [adaptiveQuiz, setAdaptiveQuiz] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  return (
    <div className="space-y-8 min-h-[calc(100vh-8rem)]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2 tracking-tight">
            System Preferences
          </h1>
          <p className="text-text-muted text-lg">
            Configure your learning environment and AI parameters.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Settings Navigation */}
        <div className="w-full lg:w-72 space-y-2 shrink-0">
          <div className="neural-glass-panel p-3 space-y-1 rounded-3xl">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-medium relative group"
                  style={{ color: isActive ? "#F0F6FC" : "#64748B" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="settingsNav"
                      className="absolute inset-0 rounded-2xl z-0"
                      style={{
                        background: "rgba(19, 27, 46, 0.8)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      }}
                      initial={false}
                      transition={springConfig}
                    />
                  )}
                  <item.icon
                    className="w-5 h-5 relative z-10 transition-colors"
                    style={{ color: isActive ? "#00F5D4" : undefined }}
                  />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}

            <div className="h-px bg-white/5 my-2 mx-4" />

            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-medium text-danger/80 hover:bg-danger/10 hover:text-danger">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="neural-glass-panel p-8 sm:p-10 rounded-[32px] relative overflow-hidden"
            >
              {/* ═══ PROFILE TAB ═══ */}
              {activeTab === "profile" && (
                <>
                  <div
                    className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(0, 245, 212, 0.06) 0%, transparent 70%)",
                      filter: "blur(60px)",
                    }}
                  />

                  <div className="relative z-10">
                    <h3 className="text-2xl font-display font-semibold text-text-primary mb-8 tracking-tight">
                      Identity Profile
                    </h3>

                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-10 pb-10 border-b border-white/5">
                      <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: "#00F5D4" }} />
                        <div
                          className="w-24 h-24 rounded-full p-1 relative z-10"
                          style={{
                            background: "linear-gradient(135deg, rgba(19, 27, 46, 1), rgba(11, 16, 32, 1))",
                            border: "2px solid rgba(0, 245, 212, 0.2)",
                          }}
                        >
                          <img
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent"
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div
                          className="absolute -bottom-2 -right-2 p-2 rounded-full text-text-muted group-hover:text-text-primary transition-colors z-20"
                          style={{
                            background: "rgba(5, 8, 22, 0.9)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <Paintbrush className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-text-primary mb-1">Avatar Initialization</h4>
                        <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-3">
                          Upload a custom image to personalize your neural interface. Supports JPG, PNG up to 2MB.
                        </p>
                        <div className="flex gap-3">
                          <button
                            className="text-text-primary font-medium px-5 py-2.5 rounded-xl transition-all text-sm"
                            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            Upload Image
                          </button>
                          <button className="text-text-ghost hover:text-text-primary font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                      {[
                        { label: "Given Name", value: "Alex", span: false },
                        { label: "Surname", value: "Chen", span: false },
                        { label: "Primary Email Link", value: "alex.chen@quantum.io", span: true },
                      ].map((field, i) => (
                        <div key={i} className={`space-y-2.5 ${field.span ? "md:col-span-2" : ""}`}>
                          <label className="text-xs font-semibold text-text-ghost uppercase tracking-widest">
                            {field.label}
                          </label>
                          <input
                            type={field.label.includes("Email") ? "email" : "text"}
                            defaultValue={field.value}
                            className="w-full py-3 px-4 text-text-primary focus:outline-none transition-all rounded-xl text-sm"
                            style={{
                              background: "rgba(5, 8, 22, 0.5)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "rgba(0, 245, 212, 0.3)";
                              e.target.style.boxShadow = "0 0 15px rgba(0, 245, 212, 0.08)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "rgba(255,255,255,0.08)";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-4">
                      <button className="text-text-ghost hover:text-text-primary font-semibold px-6 py-3 rounded-xl transition-all text-sm">
                        Discard
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={springConfig}
                        className="font-semibold px-8 py-3 rounded-xl text-sm"
                        style={{
                          background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
                          color: "#050816",
                          boxShadow: "0 0 25px rgba(0, 245, 212, 0.2)",
                        }}
                      >
                        Apply Changes
                      </motion.button>
                    </div>
                  </div>
                </>
              )}

              {/* ═══ NEURAL PREFERENCES TAB ═══ */}
              {activeTab === "ai" && (
                <>
                  <div
                    className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(255, 138, 0, 0.06) 0%, transparent 70%)",
                      filter: "blur(60px)",
                    }}
                  />

                  <div className="relative z-10">
                    <h3 className="text-2xl font-display font-semibold text-text-primary mb-8 tracking-tight flex items-center gap-3">
                      <Zap className="text-quantum-orange w-6 h-6" /> Neural Processing Engine
                    </h3>

                    <div className="space-y-8">
                      {/* Processing Intensity */}
                      <div
                        className="p-6 rounded-2xl"
                        style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-lg font-medium text-text-primary mb-1">Processing Intensity</h4>
                            <p className="text-sm text-text-muted">Determines the depth of AI analysis on uploaded documents.</p>
                          </div>
                          <div className="px-3 py-1 rounded-lg text-xs font-bold uppercase" style={{ background: "rgba(255, 138, 0, 0.1)", color: "#FF8A00" }}>
                            Pro
                          </div>
                        </div>
                        <NeuralSlider
                          value={processingIntensity}
                          onChange={setProcessingIntensity}
                          min={1}
                          max={3}
                          labels={["Fast (Skim)", "Balanced", "Deep Analysis"]}
                          color="#FF8A00"
                        />
                      </div>

                      {/* Adaptive Quiz */}
                      <div
                        className="p-6 rounded-2xl flex items-center justify-between"
                        style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div>
                          <h4 className="text-lg font-medium text-text-primary mb-1">Adaptive Quiz Difficulty</h4>
                          <p className="text-sm text-text-muted max-w-sm">Automatically scales question complexity based on your performance.</p>
                        </div>
                        <NeuralToggle enabled={adaptiveQuiz} onToggle={() => setAdaptiveQuiz(!adaptiveQuiz)} />
                      </div>

                      {/* Voice Mode */}
                      <div
                        className="p-6 rounded-2xl flex items-center justify-between"
                        style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl" style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                            <Volume2 className="w-5 h-5 text-electric-blue" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-text-primary mb-1">Voice Interaction Mode</h4>
                            <p className="text-sm text-text-muted max-w-sm">Enable voice commands and spoken AI responses.</p>
                          </div>
                        </div>
                        <NeuralToggle enabled={voiceMode} onToggle={() => setVoiceMode(!voiceMode)} color="#38BDF8" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ═══ APPEARANCE TAB ═══ */}
              {activeTab === "appearance" && (
                <div className="relative z-10">
                  <h3 className="text-2xl font-display font-semibold text-text-primary mb-8 tracking-tight flex items-center gap-3">
                    <Moon className="text-electric-blue w-6 h-6" /> Interface Configuration
                  </h3>
                  <div className="space-y-8">
                    <div className="p-6 rounded-2xl flex items-center justify-between" style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div>
                        <h4 className="text-lg font-medium text-text-primary mb-1">Dark Neural Theme</h4>
                        <p className="text-sm text-text-muted">Optimized for deep focus sessions and reduced eye strain.</p>
                      </div>
                      <NeuralToggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} color="#8B5CF6" />
                    </div>
                    <div className="p-6 rounded-2xl" style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <h4 className="text-lg font-medium text-text-primary mb-4">Accent Color</h4>
                      <div className="flex gap-3">
                        {["#00F5D4", "#38BDF8", "#FF8A00", "#8B5CF6", "#EC4899"].map((c) => (
                          <button
                            key={c}
                            className="w-10 h-10 rounded-xl transition-all hover:scale-110"
                            style={{
                              background: c,
                              boxShadow: c === "#00F5D4" ? `0 0 20px ${c}40, inset 0 0 8px rgba(255,255,255,0.2)` : "none",
                              border: c === "#00F5D4" ? "2px solid white" : "2px solid transparent",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ NOTIFICATIONS TAB ═══ */}
              {activeTab === "notifications" && (
                <div className="relative z-10">
                  <h3 className="text-2xl font-display font-semibold text-text-primary mb-8 tracking-tight flex items-center gap-3">
                    <Bell className="text-quantum-orange w-6 h-6" /> Alert Configuration
                  </h3>
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl flex items-center justify-between" style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div>
                        <h4 className="text-lg font-medium text-text-primary mb-1">Email Notifications</h4>
                        <p className="text-sm text-text-muted">Receive weekly learning reports and AI insights.</p>
                      </div>
                      <NeuralToggle enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} color="#FF8A00" />
                    </div>
                    <div className="p-6 rounded-2xl flex items-center justify-between" style={{ background: "rgba(11, 16, 32, 0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div>
                        <h4 className="text-lg font-medium text-text-primary mb-1">Push Notifications</h4>
                        <p className="text-sm text-text-muted">Real-time alerts for quiz reminders and study streaks.</p>
                      </div>
                      <NeuralToggle enabled={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} color="#38BDF8" />
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ PLACEHOLDER TABS ═══ */}
              {["security", "data"].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <Command className="w-8 h-8 text-text-ghost" />
                  </div>
                  <h3 className="text-xl font-display font-medium text-text-primary mb-2">Module Offline</h3>
                  <p className="text-text-muted text-sm">This configuration sector is currently under development.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
