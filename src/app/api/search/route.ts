import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      return NextResponse.json({ results: { documents: [], summaries: [], notes: [], quizzes: [], concepts: [] } });
    }

    const searchTerm = `%${trimmed}%`;

    const [documents, summaries, notes, quizzes] = await Promise.all([
      prisma.document.findMany({
        where: { userId: user.id, title: { contains: trimmed, mode: "insensitive" } },
        select: { id: true, title: true, uploadedAt: true },
        take: 5,
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.summary.findMany({
        where: {
          document: { userId: user.id },
          OR: [
            { title: { contains: trimmed, mode: "insensitive" } },
            { executiveBrief: { contains: trimmed, mode: "insensitive" } },
            { projectObjective: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, documentId: true, executiveBrief: true },
        take: 5,
        orderBy: { generatedAt: "desc" },
      }),
      prisma.note.findMany({
        where: {
          userId: user.id,
          OR: [
            { title: { contains: trimmed, mode: "insensitive" } },
            { content: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, type: true, content: true },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.quiz.findMany({
        where: {
          summary: { document: { userId: user.id } },
          questions: { contains: trimmed, mode: "insensitive" },
        },
        select: { id: true, summary: { select: { title: true, document: { select: { id: true } } } } },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const conceptResults: { name: string; source: string; summaryId: string }[] = [];
    const allSummaries = await prisma.summary.findMany({
      where: { document: { userId: user.id } },
      select: { id: true, title: true, concepts: true },
      take: 20,
      orderBy: { generatedAt: "desc" },
    });
    for (const s of allSummaries) {
      try {
        const concepts = JSON.parse(s.concepts);
        if (Array.isArray(concepts)) {
          for (const c of concepts) {
            const name = c.name || c.term || "";
            if (name.toLowerCase().includes(trimmed.toLowerCase())) {
              conceptResults.push({ name, source: s.title, summaryId: s.id });
              if (conceptResults.length >= 5) break;
            }
          }
        }
      } catch {}
      if (conceptResults.length >= 5) break;
    }

    const results = {
      documents: documents.map((d) => ({ id: d.id, title: d.title, url: `/documents/${d.id}`, date: d.uploadedAt })),
      summaries: summaries.map((s) => ({ id: s.id, title: s.title, url: `/summaries?id=${s.id}`, excerpt: s.executiveBrief?.substring(0, 120) })),
      notes: notes.map((n) => ({ id: n.id, title: n.title, url: `/smart-notes?tab=notes&id=${n.id}`, type: n.type, excerpt: n.content?.substring(0, 120) })),
      quizzes: quizzes.map((q) => ({ id: q.id, title: q.summary?.title || "Quiz", url: `/quiz-lab?id=${q.id}` })),
      concepts: conceptResults.map((c) => ({ name: c.name, source: c.source, url: `/smart-notes?tab=knowledge&search=${encodeURIComponent(c.name)}` })),
    };

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[Search API] Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
