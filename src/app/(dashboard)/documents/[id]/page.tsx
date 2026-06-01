"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Download, Edit3, Loader2 } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

export default function DocumentDetail() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    async function fetchDoc() {
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
    }
    fetchDoc();
  }, [params.id]);

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
          <div className="p-4 rounded-2xl shrink-0" style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)" }}>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Summaries", value: summaryCount, color: "#38BDF8" },
          { label: "Quizzes", value: quizCount, color: "#FF8A00" },
          { label: "Status Logs", value: doc.statusLogs?.length || 0, color: "#8B5CF6" },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl text-center" style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-2xl font-display font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

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

      {/* Processing Logs */}
      {doc.statusLogs?.length > 0 && (
        <div className="p-6 rounded-3xl" style={{ background: "rgba(11,16,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF8A00]" /> Processing Timeline
          </h2>
          <div className="space-y-2">
            {doc.statusLogs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                {log.status === "Completed" ? <CheckCircle className="w-4 h-4 text-[#00F5D4]" /> : <Loader2 className="w-4 h-4 text-[#FF8A00] animate-spin" />}
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">{log.status}</p>
                  {log.message && <p className="text-xs text-text-muted">{log.message}</p>}
                </div>
                <span className="text-[10px] text-text-ghost">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
