import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, X, CheckCircle, Loader2, Sparkles, BrainCircuit, Waves, Zap, Network, FileText, Beaker } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const processingStages = [
  { step: 1, title: "Document Dissolution", desc: "Deconstructing into semantic particles", icon: "💫" },
  { step: 2, title: "Neural Graph Formation", desc: "Building knowledge network topology", icon: "🧬" },
  { step: 3, title: "Keyword Illumination", desc: "Extracting key concepts dynamically", icon: "✨" },
  { step: 4, title: "Semantic Clustering", desc: "Forming holographic concept groups", icon: "🔮" },
  { step: 5, title: "Synthesis Complete", desc: "Quiz and summaries materialized", icon: "⚡" },
];

export function Workspace() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (newFiles) => {
    const fileObjects = newFiles.map((file) => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      status: "ready",
      id: Math.random().toString(36).substr(2, 9),
    }));
    setFiles((prev) => [...prev, ...fileObjects]);
  };

  const handleProcess = () => {
    setProcessing(true);
    setProcessingStep(1);

    const sequence = async () => {
      await new Promise((r) => setTimeout(r, 1500));
      setProcessingStep(2);
      await new Promise((r) => setTimeout(r, 1500));
      setProcessingStep(3);
      await new Promise((r) => setTimeout(r, 1500));
      setProcessingStep(4);
      await new Promise((r) => setTimeout(r, 1500));
      setProcessingStep(5);
      await new Promise((r) => setTimeout(r, 1000));
      setProcessing(false);
      setProcessingStep(0);
      setFiles(files.map((f) => ({ ...f, status: "completed" })));
    };
    sequence();
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2 tracking-tight">
            Quantum Workspace
          </h1>
          <p className="text-text-muted text-lg">
            Upload raw data. Extract intelligent insights.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative p-16 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden group"
            style={{
              background: isDragging ? "rgba(0, 245, 212, 0.03)" : "rgba(11, 16, 32, 0.5)",
              backdropFilter: "blur(24px)",
              border: isDragging ? "2px dashed rgba(0, 245, 212, 0.5)" : "2px dashed rgba(255,255,255,0.08)",
              borderRadius: "32px",
              transform: isDragging ? "scale(1.01)" : "scale(1)",
            }}
          >
            {/* Ambient glow when dragging */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{
                background: "radial-gradient(ellipse at 50% 50%, rgba(0, 245, 212, 0.08) 0%, transparent 70%)",
                opacity: isDragging ? 1 : 0,
              }}
            />

            {/* Particles when dragging */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                >
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: "110%", x: Math.random() * 500 - 250, opacity: 0 }}
                      animate={{ y: "-10%", opacity: [0, 0.8, 0] }}
                      transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "linear", delay: Math.random() }}
                      className="absolute bottom-0 left-1/2 rounded-full"
                      style={{
                        width: Math.random() * 3 + 1,
                        height: Math.random() * 3 + 1,
                        background: i % 2 === 0 ? "rgba(0, 245, 212, 0.6)" : "rgba(56, 189, 248, 0.5)",
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              animate={isDragging ? { y: -10 } : { y: 0 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="relative mb-6">
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{
                    background: isDragging ? "rgba(0, 245, 212, 0.3)" : "rgba(255,255,255,0.05)",
                    filter: "blur(20px)",
                  }}
                />
                <div
                  className="relative p-5 rounded-full shadow-2xl"
                  style={{
                    background: "rgba(11, 16, 32, 0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {isDragging ? (
                    <Waves className="w-12 h-12 text-neural-cyan animate-pulse" />
                  ) : (
                    <UploadCloud className="w-12 h-12 text-text-muted group-hover:text-text-primary transition-colors" />
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-display font-semibold text-text-primary mb-3">
                {isDragging ? "Initialize Transfer" : "Drag & Drop Data Here"}
              </h3>
              <p className="text-text-muted mb-8 text-center max-w-sm">
                Supports PDF, DOCX, PPTX, and TXT up to 50MB per file. Neural extraction begins automatically.
              </p>

              <label>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springConfig}
                  className="font-semibold px-8 py-3.5 rounded-2xl cursor-pointer flex items-center gap-2 text-sm"
                  style={{
                    background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
                    color: "#050816",
                    boxShadow: "0 0 30px rgba(0, 245, 212, 0.2)",
                  }}
                >
                  Browse Local Files
                </motion.div>
                <input type="file" className="hidden" multiple onChange={(e) => handleFiles(Array.from(e.target.files))} />
              </label>
            </motion.div>
          </motion.div>

          {/* File Queue */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neural-card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-semibold text-text-primary">Data Queue</h3>
                  {files.some((f) => f.status === "ready") && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={springConfig}
                      onClick={handleProcess}
                      disabled={processing}
                      className="font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all"
                      style={{
                        background: processing ? "rgba(11, 16, 32, 0.8)" : "rgba(0, 245, 212, 0.1)",
                        border: "1px solid rgba(0, 245, 212, 0.3)",
                        color: "#00F5D4",
                      }}
                    >
                      {processing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : (
                        <><BrainCircuit className="w-4 h-4" /> Begin Processing</>
                      )}
                    </motion.button>
                  )}
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {files.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group flex items-center justify-between p-4 rounded-2xl transition-colors"
                        style={{
                          background: "rgba(11, 16, 32, 0.4)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl" style={{ background: "rgba(5, 8, 22, 0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <File className="w-5 h-5 text-electric-blue" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{file.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {file.status === "completed" && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle className="w-5 h-5 text-neural-cyan glow-cyan" />
                            </motion.div>
                          )}
                          {file.status === "ready" && !processing && (
                            <button
                              onClick={() => setFiles(files.filter((f) => f.id !== file.id))}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
                            </button>
                          )}
                          {processing && file.status === "ready" && (
                            <div className="flex items-center gap-2 text-neural-cyan">
                              <span className="text-xs font-medium animate-pulse">Extracting</span>
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Processing Pipeline — 5 Stages */}
        <div className="relative">
          <div className="sticky top-28 neural-glass-panel p-8 rounded-3xl overflow-hidden">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(0, 245, 212, 0.1), transparent)",
                filter: "blur(40px)",
              }}
            />

            <div className="flex items-center gap-3 mb-8 relative z-10">
              <BrainCircuit className="w-6 h-6 text-neural-cyan" />
              <h3 className="text-xl font-display font-semibold text-text-primary">Neural Engine</h3>
            </div>

            <div className="space-y-7 relative z-10">
              {processingStages.map((item, i) => {
                const isActive = processingStep === item.step;
                const isCompleted = processingStep > item.step || (processingStep === 0 && files.some((f) => f.status === "completed"));

                return (
                  <div key={i} className="flex gap-4 relative">
                    <div className="relative flex flex-col items-center">
                      <motion.div
                        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-4 h-4 rounded-full z-10 transition-all duration-500 flex items-center justify-center"
                        style={{
                          background: isActive ? "#00F5D4" : isCompleted ? "#00F5D4" : "rgba(255,255,255,0.08)",
                          boxShadow: isActive
                            ? "0 0 20px rgba(0, 245, 212, 0.6)"
                            : isCompleted
                              ? "0 0 10px rgba(0, 245, 212, 0.3)"
                              : "none",
                        }}
                      />
                      {i < processingStages.length - 1 && (
                        <div className="absolute top-4 w-px h-full">
                          <div className="w-full h-full bg-white/5" />
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: isCompleted ? "100%" : "0%" }}
                            className="absolute top-0 w-full bg-neural-cyan/50 transition-all duration-700"
                          />
                        </div>
                      )}
                    </div>
                    <div className={`transition-all duration-500 pb-2 ${isActive ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{item.icon}</span>
                        <p className="text-text-primary font-medium text-sm">{item.title}</p>
                      </div>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active processing indicator */}
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden"
                style={{
                  background: "rgba(0, 245, 212, 0.06)",
                  border: "1px solid rgba(0, 245, 212, 0.15)",
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-cyan/10 to-transparent"
                  style={{ animation: "shimmerSlide 2s infinite" }}
                />
                <Sparkles className="w-5 h-5 text-neural-cyan mb-1 relative z-10" />
                <p className="text-sm font-medium text-neural-cyan relative z-10">
                  Neural Processing Active
                </p>
                <p className="text-xs text-text-muted relative z-10">
                  Watching AI brain think...
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
