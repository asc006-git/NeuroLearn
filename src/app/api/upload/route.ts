import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { cleanText, generateSummary, generateQuiz } from "@/lib/ai-engine";
import { rateLimit } from "@/lib/rate-limit";
import path from "path";
import fs from "fs/promises";
import { generateRedesignedKnowledgeMap } from "@/lib/knowledge-map-generator";

// ═══════════════════════════════════════════════════════════════
// NEUROLEARN — Unified Document Ingestion Pipeline
// Handles: Auth → File Save → PDF Parse → Summary → Quiz → DB
// Streams SSE status events to the client in real time
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, retryAfter } = rateLimit(`upload:${ip}`, 10, 60000);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: `Upload rate limit exceeded. Try again in ${retryAfter} seconds.` }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // ─── Authenticate ───────────────────────────────────────
    const { user, error } = await requireAuth();
    if (error) {
      const body = await error.json();
      return new Response(
        JSON.stringify(body),
        { status: error.status, headers: { "Content-Type": "application/json" } }
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

    if (file.size > 20 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File size exceeds the 20MB limit." }),
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

          // Save physical file (secured: outside public dir to prevent direct access)
          const uploadsDir = "/tmp/uploads";
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
              fileUrl: `/api/uploads/${safeFilename}`,
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

          let rawText = "";
          try {
            const pdfParse = require("pdf-parse/lib/pdf-parse.js");
            const result = await pdfParse(fileBuffer);
            rawText = result.text;
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
          send("embedding", "Performing intelligent document analysis — detecting structure, entities, and concepts...");
          await updateDocStatus("Generating Summary", "AI semantic analysis and summary generation in progress.");

          const summaryResult = await generateSummary(cleanedText, file.name);
          console.log(`[AI Engine] Document type detected: ${summaryResult.documentType}`);
          console.log(`[AI Engine] Key insights: ${summaryResult.keyInsights.length}, Concepts: ${summaryResult.concepts.length}, Tech stack: ${summaryResult.technologyStack.length}`);

          const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
          const summary = await prisma.summary.create({
            data: {
              documentId,
              title: summaryResult.title,
              documentType: summaryResult.documentType,
              projectObjective: summaryResult.projectObjective || null,
              keyFindings: JSON.stringify(summaryResult.keyFindings || []),
              architecture: summaryResult.architecture || null,
              methodology: summaryResult.methodology || null,
              results: summaryResult.results || null,
              conclusion: summaryResult.conclusion || null,
              executiveBrief: summaryResult.executiveBrief,
              detailedSummary: summaryResult.detailedSummary || summaryResult.executiveBrief,
              keyInsights: JSON.stringify(summaryResult.keyInsights),
              keyTakeaways: JSON.stringify(summaryResult.keyTakeaways || []),
              concepts: JSON.stringify(summaryResult.concepts),
              definitions: JSON.stringify(summaryResult.definitions || []),
              facts: JSON.stringify(summaryResult.facts || []),
              formulas: JSON.stringify(summaryResult.formulas || []),
              technologyStack: JSON.stringify(summaryResult.technologyStack),
              revisionNotes: summaryResult.revisionNotes,
              chapterSummaries: JSON.stringify(summaryResult.chapterSummaries),
              advantages: summaryResult.advantages || null,
              limitations: summaryResult.limitations || null,
              futureScope: summaryResult.futureScope || null,
              tldr: summaryResult.tldr || null,
              examples: JSON.stringify(summaryResult.examples || []),
            },
          });

          // ── Stage 5: Populate Smart Notes ──────────────────
          send("injecting", "Generating smart notes from document content...");
          await updateDocStatus("Generating Notes", "AI notes compilation in progress.");

          try {
            const parsedConcepts = typeof summaryResult.concepts === "string"
              ? JSON.parse(summaryResult.concepts) : summaryResult.concepts;
            const parsedDefinitions = summaryResult.definitions
              ? (typeof summaryResult.definitions === "string"
                ? JSON.parse(summaryResult.definitions) : summaryResult.definitions)
              : [];
            const parsedTech = summaryResult.technologyStack
              ? (typeof summaryResult.technologyStack === "string"
                ? JSON.parse(summaryResult.technologyStack) : summaryResult.technologyStack)
              : [];

            const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

            // Helper to filter low-quality keywords
            const isLowQuality = (name: string) => {
              if (!name) return true;
              const normalized = name.trim().toLowerCase();
              const blocklist = ["and", "the", "platform", "system", "a", "an", "of", "to", "in", "for", "with", "on", "at", "by", "from", "it", "its", "this", "that", "these", "those", "details", "generic", "filler"];
              return blocklist.includes(normalized) || normalized.length < 2;
            };

            // Create Concept notes
            if (Array.isArray(parsedConcepts)) {
              for (const concept of parsedConcepts) {
                if (isLowQuality(concept.name)) continue;
                const noteText = `${concept.explanation || ""}${concept.importance ? `\n\nImportance: ${concept.importance}` : ""}`;
                if (concept.name && noteText.trim()) {
                  await prisma.note.create({
                    data: { userId: user.id, summaryId: summary.id, title: concept.name, content: noteText.trim(), type: "concept", source: "AI-generated", tags: "concept, ai-generated" },
                  }).catch(() => { });
                }
              }
            }

            // Create Definition notes
            if (Array.isArray(parsedDefinitions)) {
              for (const def of parsedDefinitions) {
                const term = def.term || (def as any).name;
                const defText = def.definition || (def as any).def;
                if (isLowQuality(term)) continue;
                if (term && defText) {
                  await prisma.note.create({
                    data: { userId: user.id, summaryId: summary.id, title: term, content: defText, type: "definition", source: "AI-generated", tags: "definition, ai-generated" },
                  }).catch(() => { });
                }
              }
            }

            // Create Technology / AI Component notes
            if (Array.isArray(parsedTech)) {
              for (const tech of parsedTech) {
                if (isLowQuality(tech.name)) continue;
                const noteText = `${tech.context || ""}${tech.category ? `\n\nCategory: ${tech.category}` : ""}`;
                if (tech.name && noteText.trim()) {
                  const isAIComponent = ["ai/ml", "ai", "ml", "nlp", "llm", "ai-engine"].includes(tech.category?.toLowerCase() || "");
                  const noteType = isAIComponent ? "ai_component" : "technology";
                  await prisma.note.create({
                    data: { userId: user.id, summaryId: summary.id, title: tech.name, content: noteText.trim(), type: noteType, source: "AI-generated", tags: `${noteType}, ai-generated` },
                  }).catch(() => { });
                }
              }
            }

            // Create Architecture notes
            if (summaryResult.architecture && summaryResult.architecture.trim()) {
              await prisma.note.create({
                data: { userId: user.id, summaryId: summary.id, title: `${cleanTitle} - Architecture`, content: summaryResult.architecture.trim(), type: "architecture", source: "AI-generated", tags: "architecture, ai-generated" },
              }).catch(() => { });
            }

            // Create Revision notes
            if (summaryResult.revisionNotes && summaryResult.revisionNotes.trim()) {
              const title = `${summaryResult.title || "Document"} - Revision Notes`;
              await prisma.note.create({
                data: { userId: user.id, summaryId: summary.id, title, content: summaryResult.revisionNotes.trim(), type: "revision", source: "AI-generated", tags: "revision, ai-generated" },
              }).catch(() => { });
            }
          } catch (e) {
            console.error("[AI Engine] Note population error (non-fatal):", e);
          }

          // ── Stage 6: Generating Quiz ──────────────────────
          send("injecting", "Generating multi-type contextual quiz — MCQ, True/False, Fill-in-the-Blanks, Scenario, Concept, Application...");
          await updateDocStatus("Generating Quiz", "AI contextual quiz compilation in progress.");

          const quizResult = await generateQuiz(cleanedText, file.name);
          console.log(`[AI Engine] Quiz generated: ${quizResult.questions.length} questions across types: ${quizResult.questionTypes.join(", ")}`);

          const quiz = await prisma.quiz.create({
            data: {
              summaryId: summary.id,
              questions: JSON.stringify(quizResult.questions),
              questionTypes: quizResult.questionTypes.join(","),
              difficulty: quizResult.difficulty,
            },
          });

          // ── Stage 7: Generate Knowledge Map ────────────────
          try {
            await generateRedesignedKnowledgeMap(user.id, documentId, summaryResult, file.name, summary.id);
          } catch (kmError) {
            console.error("[Knowledge Map Generation Error]", kmError);
          }

          // ── Stage 7: Finalize ─────────────────────────────
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
            documentId,
            summaryId: summary.id,
            quizId: quiz.id,
          });
        } catch (err: any) {
          console.error("[Upload Pipeline Error]", err);
          send("error", err.message || "An unhandled ingestion failure occurred.");
          if (documentId) {
            await updateDocStatus("Failed", err.message || "Pipeline failure").catch(() => { });
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
