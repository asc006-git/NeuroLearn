import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { cleanText, generateSummary, generateQuiz } from "@/lib/ai-engine";
import { z } from "zod";
import { generateRedesignedKnowledgeMap } from "@/lib/knowledge-map-generator";

const renameSchema = z.object({
  title: z.string().min(1).max(200),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = await requireAuth();
    if (error) return error;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        summaries: {
          orderBy: { generatedAt: "desc" },
          include: { quizzes: true, notes: { select: { id: true } } },
        },
        extraction: true,
        statusLogs: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { fileData: _, ...docWithoutFileData } = document;
    return NextResponse.json({ document: docWithoutFileData });
  } catch (error) {
    console.error("[Document API] Error fetching document:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}

async function reprocessInBackground(documentId: string, userId: string, originalTitle: string) {
  try {
    // Stage 1: Restart extraction by reading PDF buffer from database
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "Extracting" },
    });
    await prisma.documentStatusLog.create({
      data: { documentId, status: "Extracting", message: "PDF extraction restarted." },
    });

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { fileData: true },
    });
    if (!doc?.fileData) {
      throw new Error("PDF binary data not found in database. Re-upload the document.");
    }
    const fileBuffer = Buffer.from(doc.fileData);

    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const result = await pdfParse(fileBuffer);
    const rawText = result.text;

    if (rawText.trim().length < 20) {
      throw new Error("Could not extract sufficient text from this document. It may be a scanned/image-only PDF.");
    }

    const cleanedText = cleanText(rawText);

    // Save newly extracted text
    await prisma.document.update({
      where: { id: documentId },
      data: { extractedText: cleanedText, processingStatus: "Processing" },
    });
    await prisma.documentStatusLog.create({
      data: { documentId, status: "Processing", message: "Extracted text content refreshed." },
    });

    // Stage 2: Regenerate Summary
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "Generating Summary" },
    });
    await prisma.documentStatusLog.create({
      data: { documentId, status: "Generating Summary", message: "AI summary regeneration in progress." },
    });

    const summaryResult = await generateSummary(cleanedText, originalTitle);
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

    // Stage 3: Regenerate Notes
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "Generating Notes" },
    });
    await prisma.documentStatusLog.create({
      data: { documentId, status: "Generating Notes", message: "AI notes regeneration in progress." },
    });

    try {
      const parsedConcepts = Array.isArray(summaryResult.concepts) ? summaryResult.concepts : [];
      const parsedDefinitions = Array.isArray(summaryResult.definitions) ? summaryResult.definitions : [];
      const parsedTech = Array.isArray(summaryResult.technologyStack) ? summaryResult.technologyStack : [];

      const cleanTitle = originalTitle.replace(/\.[^/.]+$/, "");

      // Helper to filter low-quality keywords
      const isLowQuality = (name: string) => {
        if (!name) return true;
        const normalized = name.trim().toLowerCase();
        const blocklist = ["and", "the", "platform", "system", "a", "an", "of", "to", "in", "for", "with", "on", "at", "by", "from", "it", "its", "this", "that", "these", "those", "details", "generic", "filler"];
        return blocklist.includes(normalized) || normalized.length < 2;
      };

      // Create Concept notes
      for (const concept of parsedConcepts) {
        if (isLowQuality(concept.name)) continue;
        const noteText = `${concept.explanation || ""}${concept.importance ? `\n\nImportance: ${concept.importance}` : ""}`;
        if (concept.name && noteText.trim()) {
          await prisma.note.create({
            data: { userId, summaryId: summary.id, title: concept.name, content: noteText.trim(), type: "concept", source: "AI-generated", tags: "concept, ai-generated" },
          }).catch(() => { });
        }
      }

      // Create Definition notes
      for (const def of parsedDefinitions) {
        const term = def.term || (def as any).name;
        const defText = def.definition || (def as any).def;
        if (isLowQuality(term)) continue;
        if (term && defText) {
          await prisma.note.create({
            data: { userId, summaryId: summary.id, title: term, content: defText, type: "definition", source: "AI-generated", tags: "definition, ai-generated" },
          }).catch(() => { });
        }
      }

      // Create Technology / AI Component notes
      for (const tech of parsedTech) {
        if (isLowQuality(tech.name)) continue;
        const noteText = `${tech.context || ""}${tech.category ? `\n\nCategory: ${tech.category}` : ""}`;
        if (tech.name && noteText.trim()) {
          const isAIComponent = ["ai/ml", "ai", "ml", "nlp", "llm", "ai-engine"].includes(tech.category?.toLowerCase() || "");
          const noteType = isAIComponent ? "ai_component" : "technology";
          await prisma.note.create({
            data: { userId, summaryId: summary.id, title: tech.name, content: noteText.trim(), type: noteType, source: "AI-generated", tags: `${noteType}, ai-generated` },
          }).catch(() => { });
        }
      }

      // Create Architecture notes
      if (summaryResult.architecture && summaryResult.architecture.trim()) {
        await prisma.note.create({
          data: { userId, summaryId: summary.id, title: `${cleanTitle} - Architecture`, content: summaryResult.architecture.trim(), type: "architecture", source: "AI-generated", tags: "architecture, ai-generated" },
        }).catch(() => { });
      }

      // Create Revision notes
      if (summaryResult.revisionNotes && summaryResult.revisionNotes.trim()) {
        await prisma.note.create({
          data: { userId, summaryId: summary.id, title: `${summaryResult.title || "Document"} - Revision Notes`, content: summaryResult.revisionNotes.trim(), type: "revision", source: "AI-generated", tags: "revision, ai-generated" },
        }).catch(() => { });
      }
    } catch (e) {
      console.error("Reprocess note population error (non-fatal):", e);
    }

    // Stage 4: Regenerate Quiz
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "Generating Quiz" },
    });
    await prisma.documentStatusLog.create({
      data: { documentId, status: "Generating Quiz", message: "AI quiz compilation in progress." },
    });

    const quizResult = await generateQuiz(cleanedText, originalTitle);
    await prisma.quiz.create({
      data: {
        summaryId: summary.id,
        questions: JSON.stringify(quizResult.questions),
        questionTypes: quizResult.questionTypes.join(","),
        difficulty: quizResult.difficulty,
      },
    });

    // Stage 5: Regenerate Knowledge Map Nodes
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "Generating Map" },
    });
    await prisma.documentStatusLog.create({
      data: { documentId, status: "Generating Map", message: "AI knowledge graph reconstruction in progress." },
    });

    await generateRedesignedKnowledgeMap(userId, documentId, summaryResult, originalTitle, summary.id);

    // Stage 6: Complete
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "Completed" },
    });
    await prisma.documentStatusLog.create({
      data: { documentId, status: "Completed", message: "Reprocessing completed successfully." },
    });
  } catch (bgError: any) {
    console.error(`[Background Reprocess Error] Document ID: ${documentId}`, bgError);
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "Failed" },
    }).catch(() => { });
    await prisma.documentStatusLog.create({
      data: { documentId, status: "Failed", message: `Reprocessing failed: ${bgError.message}` },
    }).catch(() => { });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = await requireAuth();
    if (error) return error;

    const existing = await prisma.document.findUnique({
      where: { id },
      include: { summaries: { include: { quizzes: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Delete prior outputs (summaries, quizzes, notes)
    for (const summary of existing.summaries) {
      await prisma.quiz.deleteMany({ where: { summaryId: summary.id } });
      await prisma.note.deleteMany({ where: { summaryId: summary.id } });
      await prisma.summary.delete({ where: { id: summary.id } });
    }

    // 2. Delete prior knowledge map nodes (specific to this document)
    const cleanTitle = existing.title.replace(/\.[^/.]+$/, "");
    await prisma.knowledgeMap.deleteMany({
      where: { userId: user.id, category: cleanTitle },
    });

    // 3. Delete prior status logs
    await prisma.documentStatusLog.deleteMany({
      where: { documentId: id },
    });

    // 4. Update status and start background thread
    await prisma.document.update({
      where: { id },
      data: { processingStatus: "Uploading" },
    });
    await prisma.documentStatusLog.create({
      data: { documentId: id, status: "Reprocessing", message: "Document re-ingestion sequence initialized." },
    });

    reprocessInBackground(id, user.id, existing.title).catch((bgError) => {
      console.error(`[Reprocess Launch Exception] Document ID: ${id}`, bgError);
    });

    return NextResponse.json({ success: true, message: "Document reprocessing initiated in background." });
  } catch (error: any) {
    console.error("[Document API] Reprocess startup error:", error);
    return NextResponse.json({ error: "Failed to initialize reprocessing", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = await requireAuth();
    if (error) return error;

    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = renameSchema.parse(body);
    const updated = await prisma.document.update({
      where: { id },
      data: { title: parsed.title },
      select: { id: true, title: true, fileUrl: true, processingStatus: true, uploadedAt: true, userId: true },
    });

    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error("[Document API] Error updating document:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}
