import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, X, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, processing, complete, error
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  const processUpload = async (file) => {
    if (!file.name.endsWith(".pdf")) {
      setUploadStatus("error");
      setErrorMsg("Security Protocol Error: Only PDF documents are supported for high-fidelity neural ingestion.");
      return;
    }

    setUploadStatus("processing");
    setProgressPercent(5);
    setProgressMsg("Establishing secure connection upload tunnel...");
    setUploadedFilename(file.name);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Ingestion pipeline abort.");
      }

      if (!response.body) {
        throw new Error("Empty telemetry data stream received.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", "").trim());
              
              // Handle incremental SSE stream states and scale progress intelligently
              if (data.status === "reading") {
                setProgressPercent(15);
                setProgressMsg(data.message);
              } else if (data.status === "extracting") {
                setProgressPercent(35);
                setProgressMsg(data.message);
              } else if (data.status === "ocr") {
                setProgressPercent(50);
                setProgressMsg(data.message);
              } else if (data.status === "chunking") {
                setProgressPercent(65);
                setProgressMsg(data.message);
              } else if (data.status === "embedding") {
                setProgressPercent(80);
                setProgressMsg(data.message);
              } else if (data.status === "injecting") {
                setProgressPercent(90);
                setProgressMsg(data.message);
              } else if (data.status === "complete") {
                setProgressPercent(95);
                setProgressMsg("Finalizing database catalog synchronization...");
                
                // Fire and wait for the database persistence API
                const saveResponse = await fetch("/api/upload/save", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    filename: file.name,
                    text: data.result.chunks.join("\n"),
                    textLength: data.result.text_length
                  })
                });

                if (!saveResponse.ok) {
                  throw new Error("Ingestion complete, but failed to write knowledge graph to database.");
                }

                setProgressPercent(100);
                setUploadStatus("complete");
                
                // Optional: Trigger a dashboard reload or refresh
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              } else if (data.status === "error") {
                throw new Error(data.message);
              }
            } catch (jsonErr) {
              console.error("Telemetry decode error:", jsonErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Ingestion anomaly:", err);
      setUploadStatus("error");
      setErrorMsg(err.message || "An unhandled neural ingestion failure occurred. Connection terminated.");
    }
  };

  return (
    <section className="w-full mt-8 relative z-10">
      {/* Hidden input field for manual triggers */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div
          className={cn(
            "w-full min-h-[13rem] premium-card-interactive flex flex-col items-center justify-center p-8 transition-all duration-300 relative overflow-hidden group rounded-3xl",
            isDragging ? "border-amber/50 bg-amber/5" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Ambient glow decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber/10 transition-colors" />

          <AnimatePresence mode="wait">
            {uploadStatus === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center text-center"
              >
                <div 
                  onClick={handleBrowseClick}
                  className="w-12 h-12 rounded-xl bg-base border border-border-subtle flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-amber/30 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <UploadCloud className={cn("w-5 h-5", isDragging ? "text-amber" : "text-text-muted")} />
                </div>
                <h3 className="text-sm font-semibold text-text-main mb-1">
                  Drag and drop your document
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  Supports High-Fidelity PDF materials up to 50MB
                </p>
                <button 
                  onClick={handleBrowseClick}
                  className="px-5 py-2 rounded-xl bg-base border border-border-subtle text-text-main text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Browse Files
                </button>
              </motion.div>
            )}

            {uploadStatus === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center w-full max-w-sm"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 text-amber animate-spin" />
                    <span className="text-sm font-semibold text-text-main tracking-tight">Ingesting {uploadedFilename}</span>
                  </div>
                  <span className="text-xs font-bold text-amber">{progressPercent}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-void/50 rounded-full overflow-hidden border border-border-subtle mb-4">
                  <div
                    className="h-full bg-amber shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                
                <p className="text-xs text-text-muted font-mono tracking-tight text-center leading-relaxed h-8">
                  {progressMsg}
                </p>
              </motion.div>
            )}

            {uploadStatus === "complete" && (
              <motion.div
                key="complete"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-teal" />
                </div>
                <div className="flex items-center gap-3 bg-base border border-border-subtle pl-3 pr-2 py-1.5 rounded-xl mb-4">
                  <FileText className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-semibold text-text-main">{uploadedFilename}</span>
                  <button
                    onClick={() => setUploadStatus("idle")}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-text-muted cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-teal font-medium tracking-tight">Knowledge Ingestion Successful. Synchronizing neural mapping...</p>
              </motion.div>
            )}

            {uploadStatus === "error" && (
              <motion.div
                key="error"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center w-full max-w-md"
              >
                <div className="w-12 h-12 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <h4 className="text-sm font-bold text-danger mb-2">Workspace Ingestion Failed</h4>
                <p className="text-xs text-text-muted mb-4 leading-relaxed px-4">{errorMsg}</p>
                <button
                  onClick={() => setUploadStatus("idle")}
                  className="px-4 py-1.5 rounded-lg bg-base border border-border-subtle text-text-main text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Retry Ingestion
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
