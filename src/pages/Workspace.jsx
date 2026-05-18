import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, X, CheckCircle, Loader2, Sparkles, BrainCircuit, Waves } from "lucide-react";
import { cn } from "../lib/utils";

export function Workspace() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (newFiles) => {
    const fileObjects = newFiles.map(file => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      status: "ready",
      id: Math.random().toString(36).substr(2, 9)
    }));
    setFiles(prev => [...prev, ...fileObjects]);
  };

  const handleProcess = () => {
    setProcessing(true);
    setProcessingStep(1);
    
    // Simulate multi-step AI processing
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1500));
      setProcessingStep(2);
      await new Promise(r => setTimeout(r, 1500));
      setProcessingStep(3);
      await new Promise(r => setTimeout(r, 2000));
      setProcessingStep(4);
      await new Promise(r => setTimeout(r, 1000));
      setProcessing(false);
      setProcessingStep(0);
      setFiles(files.map(f => ({ ...f, status: "completed" })));
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
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Quantum Workspace</h1>
          <p className="text-text-muted text-lg">Upload raw data. Extract intelligent insights.</p>
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
            className={cn(
              "relative premium-glass-panel p-16 border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 overflow-hidden group",
              isDragging ? "border-accent-cyan bg-accent-cyan/5 scale-[1.02]" : "border-white/10 hover:border-white/20"
            )}
          >
            {/* Ambient Upload Glow */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-b from-accent-cyan/10 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none",
              isDragging && "opacity-100"
            )} />

            {/* Particle Effects when dragging */}
            <AnimatePresence>
              {isDragging && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                >
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: "100%", x: Math.random() * 400 - 200, opacity: 0 }}
                      animate={{ y: "-100%", opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "linear", delay: Math.random() }}
                      className="absolute bottom-0 left-1/2 w-1 h-1 bg-accent-cyan rounded-full blur-[1px]"
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
                <div className={cn(
                  "absolute inset-0 rounded-full blur-xl transition-all duration-500",
                  isDragging ? "bg-accent-cyan/40" : "bg-white/5"
                )} />
                <div className="relative p-5 bg-[#0B1120] border border-white/10 rounded-full shadow-2xl">
                  {isDragging ? (
                    <Waves className="w-12 h-12 text-accent-cyan animate-pulse" />
                  ) : (
                    <UploadCloud className="w-12 h-12 text-text-muted group-hover:text-white transition-colors" />
                  )}
                </div>
              </div>
              
              <h3 className="text-2xl font-display font-semibold text-white mb-3">
                {isDragging ? "Initialize Transfer" : "Drag & Drop Data Here"}
              </h3>
              <p className="text-text-muted mb-8 text-center max-w-sm">
                Supports PDF, DOCX, PPTX, and TXT up to 50MB per file. Neural extraction begins automatically.
              </p>
              
              <label className="relative overflow-hidden bg-white text-[#060816] font-semibold px-8 py-3.5 rounded-2xl hover:bg-gray-200 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 flex items-center gap-2">
                <span>Browse Local Files</span>
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
                className="premium-card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-semibold text-white">Data Queue</h3>
                  {files.some(f => f.status === 'ready') && (
                    <button 
                      onClick={handleProcess}
                      disabled={processing}
                      className="bg-[#0B1120] border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
                    >
                      {processing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : (
                        <><BrainCircuit className="w-4 h-4" /> Begin Processing</>
                      )}
                    </button>
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
                        className="group flex items-center justify-between p-4 bg-[#0B1120]/50 border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-[#060816] rounded-xl border border-white/5">
                            <File className="w-5 h-5 text-accent-cyan" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{file.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {file.status === "completed" && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle className="w-5 h-5 text-accent-teal glow-teal" />
                            </motion.div>
                          )}
                          {file.status === "ready" && !processing && (
                            <button 
                              onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4 text-text-muted hover:text-white" />
                            </button>
                          )}
                          {processing && file.status === "ready" && (
                            <div className="flex items-center gap-2 text-accent-cyan">
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

        {/* Processing State/Timeline */}
        <div className="relative">
          <div className="sticky top-28 premium-glass-panel p-8 rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-teal/10 blur-[50px] rounded-full" />
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <BrainCircuit className="w-6 h-6 text-accent-teal" />
              <h3 className="text-xl font-display font-semibold text-white">Neural Engine</h3>
            </div>

            <div className="space-y-8 relative z-10">
              {[
                { step: 1, title: "Text Extraction", desc: "OCR and raw text parsing" },
                { step: 2, title: "Contextual Analysis", desc: "Understanding semantics" },
                { step: 3, title: "Summary Generation", desc: "Creating concise overviews" },
                { step: 4, title: "Quiz Creation", desc: "Extracting key facts for MCQs" }
              ].map((item, i) => {
                const isActive = processingStep === item.step;
                const isCompleted = processingStep > item.step || (processingStep === 0 && files.some(f => f.status === 'completed'));
                
                return (
                  <div key={i} className="flex gap-4 relative">
                    <div className="relative flex flex-col items-center">
                      <motion.div 
                        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={cn(
                          "w-3.5 h-3.5 rounded-full z-10 transition-colors duration-500",
                          isActive ? "bg-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.6)]" : 
                          isCompleted ? "bg-accent-teal shadow-[0_0_10px_rgba(20,184,166,0.4)]" : "bg-white/10"
                        )} 
                      />
                      {i < 3 && (
                        <div className="absolute top-3.5 w-px h-full -bottom-8">
                          <div className="w-full h-full bg-white/5" />
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: isCompleted ? "100%" : "0%" }}
                            className="absolute top-0 w-full bg-accent-teal transition-all duration-500"
                          />
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "transition-opacity duration-300",
                      isActive ? "opacity-100" : isCompleted ? "opacity-70" : "opacity-40"
                    )}>
                      <p className="text-white font-medium mb-1">{item.title}</p>
                      <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {processing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-8 p-4 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-cyan/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <Sparkles className="w-5 h-5 text-accent-cyan mb-1" />
                <p className="text-sm font-medium text-accent-cyan">Quantum Processing Active</p>
                <p className="text-xs text-text-muted">Do not close this window</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
