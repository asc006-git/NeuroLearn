import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: { userId: user.id },
        orderBy: { uploadedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          fileUrl: true,
          processingStatus: true,
          uploadedAt: true,
          userId: true,
        },
      }),
      prisma.document.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      documents,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("GET Documents Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch source materials.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE a document
export async function DELETE(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID parameter is required." }, { status: 400 });
    }

    const document = await prisma.document.findUnique({ where: { id } });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Access denied. Cannot delete another user's materials." }, { status: 403 });
    }

    // 1. Fetch summaries to cascade-delete linked notes
    const summaries = await prisma.summary.findMany({
      where: { documentId: id },
      select: { id: true }
    });
    const summaryIds = summaries.map((s) => s.id);

    if (summaryIds.length > 0) {
      await prisma.note.deleteMany({
        where: { summaryId: { in: summaryIds } }
      });
    }

    // 2. Delete knowledge map nodes associated with this document
    const cleanTitle = document.title.replace(/\.[^/.]+$/, "");
    await prisma.knowledgeMap.deleteMany({
      where: { userId: user.id, category: cleanTitle }
    });

    // 3. Finally delete the Document (cascades to summaries, quizzes, statusLogs, extraction, fileData)
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Knowledge node successfully purged from workspace catalog.",
    });
  } catch (error: any) {
    console.error("DELETE Document Error:", error);
    return NextResponse.json(
      { error: "Failed to purge source material.", details: error.message },
      { status: 500 }
    );
  }
}
