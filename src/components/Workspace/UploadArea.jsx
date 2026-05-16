import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadStatus("uploading");
    setTimeout(() => setUploadStatus("complete"), 2000);
  };

  return (
    <section className="w-full mt-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div 
          className={cn(
            "w-full h-48 premium-card-interactive flex flex-col items-center justify-center p-8 transition-all duration-300 relative overflow-hidden group",
            isDragging ? "border-amber/50 bg-amber/5" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadStatus === "idle" && (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-base border border-border-subtle flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-amber/30 transition-all duration-300 shadow-sm">
                <UploadCloud className={cn("w-5 h-5", isDragging ? "text-amber" : "text-text-muted")} />
              </div>
              <h3 className="text-sm font-semibold text-text-main mb-1">
                Drag and drop your document
              </h3>
              <p className="text-xs text-text-muted mb-4">
                Supports PDF, DOCX, TXT up to 50MB
              </p>
              <button className="px-4 py-1.5 rounded-md bg-base border border-border-subtle text-text-main text-xs font-medium hover:bg-white/5 transition-colors">
                Browse Files
              </button>
            </div>
          )}

          {uploadStatus === "uploading" && (
            <div className="flex flex-col items-center w-full max-w-sm">
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber" />
                  <span className="text-sm font-medium text-text-main">Analyzing Document...</span>
                </div>
                <span className="text-xs font-medium text-text-muted">45%</span>
              </div>
              <div className="w-full h-1.5 bg-base rounded-full overflow-hidden border border-border-subtle">
                <motion.div 
                  className="h-full bg-amber"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          {uploadStatus === "complete" && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-teal" />
              </div>
              <div className="flex items-center gap-3 bg-base border border-border-subtle pl-3 pr-2 py-1.5 rounded-lg mb-4">
                <FileText className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text-main">machine_learning_basics.pdf</span>
                <button onClick={() => setUploadStatus("idle")} className="p-1 hover:bg-white/10 rounded-md transition-colors text-text-muted">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-text-muted">Your workspace is ready.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
