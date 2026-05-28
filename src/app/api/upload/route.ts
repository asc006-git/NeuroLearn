import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cleanText, generateSummary, generateQuiz } from "@/lib/ai-engine";
import path from "path";
import fs from "fs/promises";

// ═══════════════════════════════════════════════════════════════
// NEUROLEARN — Unified Document Ingestion Pipeline
// Handles: Auth → File Save → PDF Parse → Summary → Quiz → DB
// Streams SSE status events to the client in real time
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    // ─── Authenticate ───────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access detected." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User profile not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // ─── Parse multipart form ───────────────────────────────
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return new Response(
        JSON.stringify({ error: "Only PDF files are supported for neural ingestion." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Read file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // ─── SSE Stream ─────────────────────────────────────────
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (status: string, message: string, result?: any) => {
          const payload = result
            ? JSON.stringify({ status, message, result })
            : JSON.stringify({ status, message });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        };

        let documentId: string | null = null;

        const updateDocStatus = async (status: string, message: string) => {
          if (documentId) {
            await prisma.document.update({
              where: { id: documentId },
              data: { processingStatus: status },
            });
            await prisma.documentStatusLog.create({
              data: { documentId, status, message },
            });
          }
        };

        try {
          // ── Stage 1: Uploading ────────────────────────────
          send("reading", `Initializing ingestion pipeline for ${file.name}...`);

          // Save physical file
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          await fs.mkdir(uploadsDir, { recursive: true });

          // Generate unique filename to avoid collisions
          const timestamp = Date.now();
          const safeFilename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const filePath = path.join(uploadsDir, safeFilename);
          await fs.writeFile(filePath, fileBuffer);

          // Create document record
          const doc = await prisma.document.create({
            data: {
              userId: user.id,
              title: file.name,
              fileUrl: `/uploads/${safeFilename}`,
              extractedText: "", // Will be populated after extraction
              processingStatus: "Uploading",
            },
          });
          documentId = doc.id;
          await prisma.documentStatusLog.create({
            data: { documentId, status: "Uploading", message: `File ${file.name} received and saved.` },
          });

          // ── Stage 2: Extracting ───────────────────────────
          send("extracting", "Extracting text content from PDF via neural parser...");
          await updateDocStatus("Extracting", "PDF text extraction in progress.");

          // Dynamic import of pdf-parse to avoid bundling issues
          let pdfParse: any;
          try {
            pdfParse = await import("pdf-parse");
          } catch {
            // Fallback: try require
            try {
              pdfParse = require("pdf-parse");
            } catch {
              pdfParse = null;
            }
          }

          let rawText = "";
          try {
            if (pdfParse && typeof pdfParse.PDFParse === "function") {
              const parser = new pdfParse.PDFParse({ data: fileBuffer });
              const result = await parser.getText();
              rawText = result.text || "";
            } else if (pdfParse && typeof pdfParse.default === "function") {
              const res = await pdfParse.default(fileBuffer);
              rawText = res.text || "";
            } else if (typeof pdfParse === "function") {
              const res = await pdfParse(fileBuffer);
              rawText = res.text || "";
            } else {
              throw new Error("PDF parser library could not be loaded or instantiated.");
            }
          } catch (pdfError: any) {
            send("error", `Failed to parse PDF: ${pdfError.message}`);
            await updateDocStatus("Failed", `PDF parse error: ${pdfError.message}`);
            controller.close();
            return;
          }
          if (rawText.trim().length < 20) {
            send("error", "Could not extract sufficient text from this document. It may be a scanned/image-only PDF.");
            await updateDocStatus("Failed", "Insufficient text extracted from PDF.");
            controller.close();
            return;
          }

          const cleanedText = cleanText(rawText);

          // ── Stage 3: Processing ───────────────────────────
          send("chunking", `Processing ${cleanedText.length.toLocaleString()} characters of extracted content...`);
          await updateDocStatus("Processing", `Extracted ${cleanedText.length} characters. Processing text.`);

          // Save extracted text to Document and Extraction models
          await prisma.document.update({
            where: { id: documentId },
            data: { extractedText: cleanedText },
          });

          await prisma.extraction.create({
            data: {
              documentId,
              text: cleanedText,
            },
          });

          // ── Stage 4: Generating Summary ───────────────────
          send("embedding", "Synthesizing executive brief and core concept analysis...");
          await updateDocStatus("Generating Summary", "AI summary generation in progress.");

          const summaryResult = await generateSummary(cleanedText, file.name);

          const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
          const summary = await prisma.summary.create({
            data: {
              documentId,
              title: summaryResult.title,
              executiveBrief: summaryResult.executiveBrief,
              concepts: JSON.stringify(summaryResult.concepts),
            },
          });

          // ── Stage 5: Generating Quiz ──────────────────────
          send("injecting", "Compiling adaptive quiz assessment from source material...");
          await updateDocStatus("Generating Quiz", "AI quiz compilation in progress.");

          const quizResult = await generateQuiz(cleanedText, file.name);

          const quiz = await prisma.quiz.create({
            data: {
              summaryId: summary.id,
              questions: JSON.stringify(quizResult.questions),
              difficulty: quizResult.difficulty,
            },
          });

          // ── Stage 6: Finalize ─────────────────────────────
          // Record learning session activity
          await prisma.learningSession.create({
            data: {
              userId: user.id,
              title: cleanTitle,
              type: "document",
              duration: "1 min",
              timeAgo: "just now",
              color: "#00F5D4",
              score: 0,
            },
          });

          // Update or create analytics
          const analytics = await prisma.analytics.findFirst({
            where: { userId: user.id },
          });

          if (analytics) {
            await prisma.analytics.update({
              where: { id: analytics.id },
              data: {
                studyMinutes: analytics.studyMinutes + 1,
                quizzesTaken: analytics.quizzesTaken + 1,
              },
            });
          } else {
            await prisma.analytics.create({
              data: {
                userId: user.id,
                studyMinutes: 1,
                quizzesTaken: 1,
                retentionRating: 100,
              },
            });
          }

          // Mark document complete
          await updateDocStatus("Completed", "Document fully ingested with summary and quiz.");

          send("complete", "Knowledge synthesis complete.", {
            filename: file.name,
            text_length: cleanedText.length,
            chunks: [],
            ocr_used: false,
          });
        } catch (err: any) {
          console.error("[Upload Pipeline Error]", err);
          send("error", err.message || "An unhandled ingestion failure occurred.");
          if (documentId) {
            await updateDocStatus("Failed", err.message || "Pipeline failure").catch(() => {});
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
