import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, X, CheckCircle, Loader2 } from "lucide-react";

export function Workspace() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);

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
      status: "ready"
    }));
    setFiles(prev => [...prev, ...fileObjects]);
  };

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setFiles(files.map(f => ({ ...f, status: "completed" })));
    }, 3000);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Workspace</h1>
        <p className="text-text-muted">Upload and process your study materials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`premium-card p-12 border-2 border-dashed flex flex-col items-center justify-center transition-all ${
              isDragging ? "border-accent-teal bg-accent-teal/5" : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="p-4 bg-white/5 rounded-full mb-4 pointer-events-none">
              <UploadCloud className={`w-10 h-10 ${isDragging ? "text-accent-teal" : "text-text-muted"}`} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop Files Here</h3>
            <p className="text-text-muted mb-6 text-center max-w-sm">
              Supports PDF, DOCX, PPTX, and TXT up to 50MB per file.
            </p>
            <label className="bg-card border border-white/10 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              Browse Files
              <input type="file" className="hidden" multiple onChange={(e) => handleFiles(Array.from(e.target.files))} />
            </label>
          </div>

          {/* File Queue */}
          {files.length > 0 && (
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Upload Queue</h3>
                {files.some(f => f.status === 'ready') && (
                  <button 
                    onClick={handleProcess}
                    disabled={processing}
                    className="bg-gradient-teal hover:bg-teal-500 text-card font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {processing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      "Process Files"
                    )}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {files.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <File className="w-6 h-6 text-accent-teal" />
                        <div>
                          <p className="text-sm font-medium text-white">{file.name}</p>
                          <p className="text-xs text-text-muted">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {file.status === "completed" && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {file.status === "ready" && !processing && (
                          <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                            <X className="w-5 h-5 text-text-muted hover:text-white transition-colors" />
                          </button>
                        )}
                        {processing && file.status === "ready" && <Loader2 className="w-5 h-5 text-accent-teal animate-spin" />}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Processing State/Info */}
        <div className="premium-card p-6 h-fit sticky top-28">
          <h3 className="text-lg font-semibold text-white mb-4">AI Processing Engine</h3>
          <div className="space-y-6">
            {[
              { title: "Text Extraction", desc: "OCR and raw text parsing", active: processing },
              { title: "Contextual Analysis", desc: "Understanding topics and semantics", active: processing },
              { title: "Summary Generation", desc: "Creating concise overviews", active: false },
              { title: "Quiz Creation", desc: "Extracting key facts for MCQs", active: false }
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${step.active ? "bg-accent-orange shadow-[0_0_10px_rgba(249,115,22,0.5)]" : "bg-white/20"}`} />
                  {i < 3 && <div className="absolute top-4 left-[5px] w-[2px] h-full bg-white/10" />}
                </div>
                <div>
                  <p className={`font-medium ${step.active ? "text-white" : "text-text-muted"}`}>{step.title}</p>
                  <p className="text-xs text-text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
