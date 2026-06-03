import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const { user: authUser, error } = await requireAuth();
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        documents: {
          include: {
            summaries: {
              include: { quizzes: true },
            },
            statusLogs: true,
          },
        },
        notes: true,
        sessions: { take: 100, orderBy: { createdAt: "desc" } },
        analytics: true,
        preferences: true,
        knowledgeMaps: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      documents: user.documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        fileUrl: doc.fileUrl,
        processingStatus: doc.processingStatus,
        uploadedAt: doc.uploadedAt,
        summaries: doc.summaries.map((sum) => ({
          id: sum.id,
          title: sum.title,
          documentType: sum.documentType,
          quizzes: sum.quizzes.map((q) => ({
            id: q.id,
            questionTypes: q.questionTypes,
            difficulty: q.difficulty,
            score: q.score,
            questions: q.questions,
            createdAt: q.createdAt,
          })),
        })),
      })),
      notes: user.notes,
      sessions: user.sessions,
      analytics: user.analytics,
      preferences: user.preferences,
      knowledgeMaps: user.knowledgeMaps,
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="neurolearn-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("[Export API] Error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
