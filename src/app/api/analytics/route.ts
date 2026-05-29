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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        documents: {
          include: {
            summaries: {
              include: { quizzes: true },
            },
          },
        },
        analytics: {
          orderBy: { date: "desc" },
          take: 7,
        },
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 100,
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

    const recentSessions = user.sessions.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          deepWorkHours: Math.round((analytics.studyMinutes / 60) * 10) / 10,
          conceptsMastered: totalSummaries,
          neuralSynapses: totalDocs * 10,
          efficiencyDelta: analytics.retentionRating > 0 ? `+${Math.round(analytics.retentionRating / 10)}%` : "0%",
        },
        activityData: user.sessions.slice(0, 7).map((s, i) => ({
          name: new Date(s.createdAt).toLocaleDateString("en-US", { weekday: "short" }),
          hours: Math.round(parseInt(s.duration) / 10) || 1,
          neuralActivity: s.score || 50,
        })),
        subjectMastery: user.documents.slice(0, 3).map((doc, i) => {
          const subjects = [
            { topic: "Neuroscience", color: "#00F5D4" },
            { topic: "Data Science", color: "#38BDF8" },
            { topic: "Machine Learning", color: "#FF8A00" },
            { topic: "Cognitive Science", color: "#8B5CF6" },
          ];
          const progress = doc.summaries.length > 0 ? Math.min(85 + doc.summaries.length * 5, 98) : 30 + (i * 15);
          return {
            topic: subjects[i % subjects.length].topic,
            progress,
            color: subjects[i % subjects.length].color,
          };
        }),
        aiDiagnosis: totalDocs > 0
          ? `Your retention is optimal across ${totalDocs} ingested documents. ${totalQuizzes > 0 ? `Completed ${totalQuizzes} quizzes with ${analytics.retentionRating}% average accuracy.` : "Take a quiz to benchmark your knowledge."}`
          : "Upload your first document to begin cognitive analysis.",
      },
    });
  } catch (error: any) {
    console.error("GET Analytics Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data.", details: error.message },
      { status: 500 }
    );
  }
}
