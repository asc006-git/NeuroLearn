import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { user: authUser, error } = await requireAuth();
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        name: true,
        email: true,
        avatar: true,
        image: true,
        documents: {
          select: {
            id: true,
            title: true,
            uploadedAt: true,
            processingStatus: true,
            summaries: {
              select: {
                id: true,
                title: true,
                generatedAt: true,
                quizzes: { select: { id: true, score: true } },
              },
            },
          },
          orderBy: { uploadedAt: "desc" },
        },
        analytics: true,
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            score: true,
            duration: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const totalDocs = user.documents.length;
    let totalSummaries = 0;
    let totalQuizzes = 0;
    let totalQuizScore = 0;
    let quizCount = 0;
    user.documents.forEach((doc) => {
      totalSummaries += doc.summaries.length;
      doc.summaries.forEach((sum) => {
        totalQuizzes += sum.quizzes.length;
        sum.quizzes.forEach((q) => {
          if (q.score > 0) { totalQuizScore += q.score; quizCount++; }
        });
      });
    });

    const analytics = user.analytics[0] || {
      studyMinutes: 0,
      quizzesTaken: 0,
      retentionRating: 0,
    };
    const accuracyRate = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : (analytics.retentionRating || 0);

    // Compute quiz score trend for performance chart
    const recentSessions = user.sessions.slice(0, 14).reverse();
    const performanceData = recentSessions.map((s) => ({
      name: new Date(s.createdAt).toLocaleDateString("en-US", { weekday: "short" }),
      score: s.score || 0,
    }));
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const filledPerformance = dayOrder.map((day) => {
      const match = performanceData.find((p) => p.name === day);
      return match || { name: day, score: 0 };
    });

    // Build recent activity from actual documents and quizzes
    const recentActivity: any[] = [];
    for (const doc of user.documents.slice(0, 5)) {
      recentActivity.push({
        id: doc.id,
        type: "document",
        topic: doc.title || "Untitled",
        description: doc.processingStatus === "Completed"
          ? `Processed and synthesized — ${doc.summaries.length} summary(ies), ${doc.summaries.reduce((a, s) => a + s.quizzes.length, 0)} quiz(zes)`
          : `Status: ${doc.processingStatus}`,
        timestamp: doc.uploadedAt.toISOString(),
        status: doc.processingStatus,
      });
      for (const summary of doc.summaries.slice(0, 2)) {
        for (const quiz of summary.quizzes.slice(0, 1)) {
          recentActivity.push({
            id: quiz.id,
            type: "quiz",
            topic: `Quiz: ${summary.title || doc.title}`,
            description: `Score: ${quiz.score}% — ${summary.quizzes.length} question(s)`,
            timestamp: summary.generatedAt.toISOString(),
            score: quiz.score,
          });
        }
      }
    }

    // Add learning sessions
    for (const s of user.sessions) {
      if (!recentActivity.find((a) => a.id === s.id)) {
        recentActivity.push({
          id: s.id,
          type: s.score > 0 ? "quiz" : "document",
          topic: s.title || "Untitled Session",
          description: s.score > 0
            ? `Achieved ${s.score}% on assessment`
            : `Reviewed "${s.title || "learning materials"}"`,
          timestamp: s.createdAt.toISOString(),
          duration: s.duration,
          score: s.score,
        });
      }
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Latest documents for Continue Learning
    const latestDocs = user.documents.slice(0, 3).map((d) => ({
      id: d.id,
      title: d.title,
      status: d.processingStatus,
      uploadedAt: d.uploadedAt,
      summaryCount: d.summaries.length,
      quizCount: d.summaries.reduce((a, s) => a + s.quizzes.length, 0),
      hasSummary: d.summaries.length > 0,
      hasQuiz: d.summaries.some((s) => s.quizzes.length > 0),
    }));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.image,
        },
        metrics: {
          documentsCount: totalDocs,
          summariesCount: totalSummaries,
          quizzesCount: totalQuizzes,
          studyTimeHours: Math.round((analytics.studyMinutes / 60) * 10) / 10,
          accuracyRate,
          sessionsCount: analytics.quizzesTaken,
        },
        recentActivity,
        performanceData: filledPerformance,
        latestDocuments: latestDocs,
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
