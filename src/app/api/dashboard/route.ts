import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized access detected." }, { status: 401 });
    }

    const email = session.user.email;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        documents: {
          include: {
            summaries: {
              include: { quizzes: true },
            },
          },
        },
        analytics: true,
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const totalDocs = user.documents.length;
    let totalSummaries = 0;
    let totalQuizzes = 0;
    user.documents.forEach((doc) => {
      totalSummaries += doc.summaries.length;
      doc.summaries.forEach((sum) => { totalQuizzes += sum.quizzes.length; });
    });

    const analytics = user.analytics[0] || {
      studyMinutes: 0,
      quizzesTaken: 0,
      retentionRating: 0,
    };

    const recentActivity = user.sessions.map((s) => ({
      id: s.id,
      type: s.score > 0 ? "quiz" : "document",
      topic: s.title,
      description: s.score > 0
        ? `Completed intelligence assessment with ${s.score}% accuracy.`
        : `Ingested new knowledge source and mapped semantic vector nodes.`,
      timestamp: s.createdAt.toISOString(),
      duration: s.duration,
    }));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar || user.image,
        },
        metrics: {
          documentsCount: totalDocs,
          summariesCount: totalSummaries,
          quizzesCount: totalQuizzes,
          studyTimeHours: Math.round((analytics.studyMinutes / 60) * 10) / 10,
          accuracyRate: analytics.retentionRating,
          sessionsCount: analytics.quizzesTaken,
        },
        recentActivity,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to assemble dashboard metrics.", details: error.message },
      { status: 500 }
    );
  }
}
