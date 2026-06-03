"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Download, Edit3, Loader2, BookOpen, BrainCircuit, StickyNote, RotateCw, Trash2, Network, ChevronDown, Cpu } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

export default function DocumentDetail() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [deleting, setDeleting] = useState(false);
  const getStageDetails = (idx: number) => {
    if (!doc?.statusLogs) return null;
    let statuses: string[] = [];
    if (idx === 0) statuses = ["Uploading", "Reprocessing"];
    else if (idx === 1) statuses = ["Extracting", "Processing"];
    else if (idx === 2) statuses = ["Generating Summary"];
    else if (idx === 3) statuses = ["Generating Notes"];
    else if (idx === 4) statuses = ["Generating Quiz"];
    else if (idx === 5) statuses = ["Generating Map", "Completed"];

    return doc.statusLogs.find((l: any) => statuses.includes(l.status));
  };

  const fetchDoc = async () => {
    try {
      const res = await fetch(`/api/documents/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setDoc(json.document);
        setNewTitle(json.document.title);
      }
    } catch (err) {
      console.error("Error fetching document:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
  }, [params.id]);

  // Auto-refresh while document is being processed
  useEffect(() => {
    if (!doc || doc.processingStatus === "Completed" || doc.processingStatus === "Failed") return;
    const interval = setInterval(fetchDoc, 3000);
    return () => clearInterval(interval);
  }, [doc?.processingStatus]);

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === doc.title) { setEditing(false); return; }
    try {
      const res = await fetch(`/api/documents/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        const json = await res.json();
        setDoc((prev: any) => ({ ...prev, title: json.document.title }));
        setEditing(false);
      }
    } catch (err) {
      console.error("Error renaming document:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document and all its data?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents?id=${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/documents");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setDeleting(false);
    }
  };

  const statusColor: Record<string, string> = {
    Completed: "#00F5D4", Failed: "#EF4444", Uploading: "#FF8A00",
    Extracting: "#FF8A00", Processing: "#FF8A00",
    "Generating Summary": "#38BDF8", "Generating Quiz": "#8B5CF6",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#00F5D4] animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <XCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Document not found</h2>
        <button onClick={() => router.push("/documents")} className="text-sm text-[#38BDF8] hover:underline cursor-pointer">Back to documents</button>
      </div>
    );
  }

  const textSizeKB = Math.round((doc.extractedText?.length || 0) / 1024);
  const summaryCount = doc.summaries?.length || 0;
  const quizCount = doc.summaries?.reduce((acc: number, s: any) => acc + (s.quizzes?.length || 0), 0) || 0;
  const noteCount = doc.summaries?.reduce((acc: number, s: any) => acc + (s.notes?.length || 0), 0) || 0;
  const firstSummary = doc.summaries?.[0];
  const firstSummaryId = firstSummary?.id;

  // Word count
  const wordCount = doc.extractedText ? doc.extractedText.split(/\s+/).filter(Boolean).length : 0;
  // Concepts count
  let conceptsCount = 0;
  if (firstSummary?.concepts) {
    try {
      conceptsCount = JSON.parse(firstSummary.concepts).length;
    } catch (e) {
      conceptsCount = 0;
    }
  }
  // Notes count
  const notesCount = firstSummary?.notes?.length || 0;
  // Quiz questions count
  let quizQuestionsCount = 0;
  if (firstSummary?.quizzes?.[0]?.questions) {
    try {
      quizQuestionsCount = JSON.parse(firstSummary.quizzes[0].questions).length;
    } catch (e) {
      quizQuestionsCount = 0;
    }
  }
  const completionStatus = doc.processingStatus;

  const stageOrder = [
    "Upload Complete",
    "Text Extraction",
    "Summary Generated",
    "Notes Generated",
    "Quiz Generated",
    "Knowledge Map Generated"
  ];

  let currentStageIdx = 0;
  if (doc.processingStatus === "Uploading" || doc.processingStatus === "Reprocessing") currentStageIdx = 0;
  else if (doc.processingStatus === "Extracting" || doc.processingStatus === "Processing") currentStageIdx = 1;
  else if (doc.processingStatus === "Generating Summary") currentStageIdx = 2;
  else if (doc.processingStatus === "Generating Notes") currentStageIdx = 3;
  else if (doc.processingStatus === "Generating Quiz") currentStageIdx = 4;
  else if (doc.processingStatus === "Generating Map" || doc.processingStatus === "Completed") currentStageIdx = 5;
  else if (doc.processingStatus === "Failed") currentStageIdx = 5;

  const completionPercentMap = [15, 35, 60, 75, 90, 100];
  const completionPercent = doc.processingStatus === "Failed" ? 100 : (completionPercentMap[currentStageIdx] || 0);

  // Compute duration based on status logs
  const startLog = doc.statusLogs?.find((l: any) => l.status === "Uploading" || l.status === "Reprocessing") || doc.statusLogs?.[doc.statusLogs?.length - 1];
  const endLog = doc.statusLogs?.find((l: any) => l.status === "Completed" || l.status === "Failed");
  const startTime = startLog ? new Date(startLog.createdAt).getTime() : new Date(doc.uploadedAt).getTime();
  const endTime = endLog ? new Date(endLog.createdAt).getTime() : Date.now();
  const durationMs = Math.max(0, endTime - startTime);
  const durationSec = Math.round(durationMs / 1000);
  const durationText = durationSec < 60 ? `${durationSec}s` : `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;

  // Deduplicate status logs for audit trail (keeping latest log per status)
  const uniqueLogs = doc.statusLogs ? doc.statusLogs.filter((log: any, idx: number, self: any[]) =>
    self.findIndex((l) => l.status === log.status) === idx
  ) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={springConfig} className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <button onClick={() => router.push("/documents")}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Documents
      </button>

      {/* Document Header */}
      <div className="p-8 rounded-3xl relative overflow-hidden" style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-start gap-5">
          <div className="p-4 rounded-2xl shrink-0" style={{ background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.2)" }}>
            <FileText className="w-8 h-8 text-[#00F5D4]" />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2 items-center">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  className="flex-1 p-2 rounded-xl text-lg font-semibold text-text-primary focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setNewTitle(doc.title); setEditing(false); } }} />
                <button onClick={handleRename} className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer" style={{ background: "#00F5D4", color: "#050816" }}>Save</button>
                <button onClick={() => { setNewTitle(doc.title); setEditing(false); }} className="px-3 py-2 rounded-xl text-xs font-semibold text-text-muted cursor-pointer" style={{ background: "rgba(255,255,255,0.05)" }}>Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-display font-bold text-text-primary truncate">{doc.title}</h1>
                <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="text-xs text-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="text-xs text-text-muted">{textSizeKB} KB</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: `${statusColor[doc.processingStatus] || "#64748B"}15`, color: statusColor[doc.processingStatus] || "#64748B" }}>
                {doc.processingStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => router.push(firstSummaryId ? `/summaries?id=${firstSummaryId}` : "/summaries")}
          disabled={doc.processingStatus !== "Completed"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
          style={{ background: "rgba(0,245,212,0.15)", color: "#00F5D4", border: "1px solid rgba(0,245,212,0.3)" }}>
          <BookOpen className="w-4 h-4" /> View Summary
        </button>
        <button
          onClick={() => router.push(doc.id ? `/smart-notes?tab=notes&docId=${doc.id}` : "/smart-notes")}
          disabled={doc.processingStatus !== "Completed"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
          style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.3)" }}>
          <StickyNote className="w-4 h-4" /> Open Notes
        </button>
        <button
          onClick={() => router.push(firstSummary?.quizzes?.[0]?.id ? `/quiz-lab?id=${firstSummary.quizzes[0].id}` : "/quiz-lab")}
          disabled={doc.processingStatus !== "Completed"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
          style={{ background: "rgba(255,138,0,0.15)", color: "#FF8A00", border: "1px solid rgba(255,138,0,0.3)" }}>
          <BrainCircuit className="w-4 h-4" /> Take Quiz
        </button>
        <button
          onClick={() => router.push(doc.id ? `/smart-notes?tab=knowledge&docId=${doc.id}` : "/smart-notes?tab=knowledge")}
          disabled={doc.processingStatus !== "Completed"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
          style={{ background: "rgba(56,189,248,0.15)", color: "#38BDF8", border: "1px solid rgba(56,189,248,0.3)" }}>
          <Network className="w-4 h-4" /> Open Knowledge Map
        </button>
        <button
          onClick={() => window.open(doc.fileUrl + "?download=true", "_blank")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Download className="w-4 h-4" /> Download PDF
        </button>
        <button
          onClick={async () => {
            if (!confirm("Reprocess this document? This will regenerate the summary, quiz, and notes.")) return;
            try {
              const res = await fetch(`/api/documents/${params.id}`, { method: "POST" });
              if (res.ok) {
                fetchDoc();
              } else {
                const err = await res.json();
                alert("Reprocess failed: " + (err.error || err.details || "Unknown error"));
              }
            } catch (err) {
              alert("Reprocess failed. Please try again.");
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.1)" }}>
          <RotateCw className="w-4 h-4" /> Reprocess
        </button>
        <button onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 ml-auto"
          style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
          <Trash2 className="w-4 h-4" /> {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Stats and Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Duration", value: durationText, color: "#38BDF8" },
          { label: "Doc Size", value: `${textSizeKB} KB`, color: "#8B5CF6" },
          { label: "Word Count", value: wordCount.toLocaleString(), color: "#FF8A00" },
          { label: "Concepts", value: conceptsCount, color: "#EC4899" },
          { label: "Notes", value: notesCount, color: "#10B981" },
          { label: "Quiz Questions", value: quizQuestionsCount, color: "#FACC15" },
          { label: "Status", value: completionStatus === "Completed" ? "Completed" : completionStatus === "Failed" ? "Failed" : "Processing", color: "#00F5D4" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl text-center flex flex-col justify-center items-center" style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xl font-display font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Redesigned Processing Timeline (Vertical Stepper) */}
      {doc.statusLogs && doc.statusLogs.length > 0 && (
        <div className="p-8 rounded-3xl" style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-lg font-display font-semibold text-text-primary mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF8A00]" /> Processing Timeline
          </h2>

          <div className="relative space-y-6">
            {/* Left Vertical Line */}
            <div className="absolute left-3 top-2.5 bottom-2.5 w-px bg-white/10" />

            {stageOrder.map((stage, i) => {
              const completed = doc.processingStatus === "Completed" || (doc.processingStatus !== "Failed" && currentStageIdx > i);
              const active = doc.processingStatus !== "Completed" && doc.processingStatus !== "Failed" && currentStageIdx === i;
              const failed = doc.processingStatus === "Failed" && currentStageIdx === i;

              // Step-specific icons for pending stages
              const STAGE_ICONS = [FileText, Cpu, BookOpen, StickyNote, BrainCircuit, Network];
              const PendingIcon = STAGE_ICONS[i] || FileText;

              // Resolve latest log message and timestamp details for this stage
              const logEntry = getStageDetails(i);
              const detailMessage = logEntry?.message || (
                completed ? "Step completed successfully." :
                active ? "Processing this step..." :
                failed ? "Ingestion failed at this step." :
                "Awaiting execution..."
              );
              const timeString = logEntry ? new Date(logEntry.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "";

              return (
                <div key={stage} className="relative pl-10">
                  {/* Status Node Circle */}
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300"
                    style={{
                      background: completed ? "rgba(0, 245, 212, 0.12)" : active ? "rgba(255, 138, 0, 0.12)" : failed ? "rgba(239, 68, 68, 0.12)" : "rgba(255, 255, 255, 0.02)",
                      border: completed ? "1px solid rgba(0, 245, 212, 0.3)" : active ? "1px solid rgba(255, 138, 0, 0.4)" : failed ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)",
                      boxShadow: active ? "0 0 12px rgba(255, 138, 0, 0.15)" : completed ? "0 0 12px rgba(0, 245, 212, 0.15)" : "none"
                    }}
                  >
                    {completed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[#00F5D4]" />
                    ) : failed ? (
                      <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />
                    ) : active ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#FF8A00] animate-spin" />
                    ) : (
                      <PendingIcon className="w-3 h-3 text-slate-500" />
                    )}
                  </div>

                  {/* Step Description Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                    style={{
                      background: active ? "rgba(255, 138, 0, 0.02)" : "rgba(255, 255, 255, 0.01)",
                      border: active ? "1px solid rgba(255, 138, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold tracking-tight uppercase"
                        style={{
                          color: completed ? "#00F5D4" : active ? "#FF8A00" : failed ? "#EF4444" : "#64748B"
                        }}
                      >
                        {stage}
                      </h3>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {detailMessage}
                      </p>
                    </div>

                    {timeString && (
                      <span className="text-[10px] text-text-ghost font-mono bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded-lg shrink-0">
                        {timeString}
                      </span>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Extracted Text Preview */}
      {doc.extractedText && (
        <div className="p-6 rounded-3xl" style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#38BDF8]" /> Extracted Text Preview
          </h2>
          <div className="max-h-80 overflow-y-auto p-4 rounded-2xl text-sm text-text-muted leading-relaxed font-mono" style={{ background: "rgba(0,0,0,0.3)" }}>
            {doc.extractedText.substring(0, 3000)}
            {doc.extractedText.length > 3000 && <span className="text-[#FF8A00]">... (truncated)</span>}
          </div>
        </div>
      )}
    </motion.div>
  );
}
