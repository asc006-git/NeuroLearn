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
    let totalQuizScore = 0;
    let conceptsExtracted = 0;
    const docColors = ["#00F5D4", "#38BDF8", "#FF8A00", "#8B5CF6"];

    user.documents.forEach((doc) => {
      totalSummaries += doc.summaries.length;
      doc.summaries.forEach((sum) => {
        totalQuizzes += sum.quizzes.length;
        sum.quizzes.forEach((q) => { totalQuizScore += q.score || 0; });
        if (sum.concepts) {
          try {
            const parsed = JSON.parse(sum.concepts);
            if (Array.isArray(parsed)) conceptsExtracted += parsed.length;
          } catch {}
        }
      });
    });

    const analytics = user.analytics[0] || {
      studyMinutes: 0,
      quizzesTaken: 0,
      retentionRating: 0,
    };

    const avgQuizAccuracy = totalQuizzes > 0 ? Math.round(totalQuizScore / totalQuizzes) : 0;
    const efficiency = avgQuizAccuracy > 0 ? `+${Math.round(avgQuizAccuracy / 15)}%` : "0%";

    // Build activity data from sessions, fill gaps with empty days
    const sessionDays = user.sessions.slice(0, 14).map((s) => ({
      name: new Date(s.createdAt).toLocaleDateString("en-US", { weekday: "short" }),
      hours: parseFloat((parseInt(s.duration || "0") / 60).toFixed(1)) || 0.5,
      neuralActivity: s.score || 40,
    }));
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const activityData = dayNames.map((day) => {
      const match = sessionDays.find((s) => s.name === day);
      return match || { name: day, hours: 0, neuralActivity: 0 };
    });

    // Build subject mastery from actual document titles
    const subjectMastery = user.documents.slice(0, 4).map((doc, i) => {
      const summaryCount = doc.summaries.length;
      const quizCount = doc.summaries.reduce((acc, s) => acc + s.quizzes.length, 0);
      const progress = summaryCount > 0 ? Math.min(60 + summaryCount * 10 + quizCount * 5, 98) : 10;
      return {
        topic: doc.name?.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ") || `Document ${i + 1}`,
        progress,
        color: docColors[i % docColors.length],
      };
    });

    // Build meaningful ai diagnosis
    let aiDiagnosis: string;
    if (totalDocs === 0) {
      aiDiagnosis = "Upload your first document to begin cognitive analysis.";
    } else {
      const diagParts: string[] = [];
      diagParts.push(`Analysis of ${totalDocs} document${totalDocs > 1 ? "s" : ""} complete.`);
      if (conceptsExtracted > 0) diagParts.push(`${conceptsExtracted} concepts extracted.`);
      if (totalQuizzes > 0) diagParts.push(`${totalQuizzes} quiz${totalQuizzes > 1 ? "zes" : ""} taken at ${avgQuizAccuracy}% average accuracy.`);
      if (analytics.studyMinutes > 0) diagParts.push(`${Math.round(analytics.studyMinutes / 60)}h total study time.`);
      if (avgQuizAccuracy >= 70) diagParts.push("Retention is strong — consider exploring advanced topics.");
      else if (avgQuizAccuracy >= 40) diagParts.push("Moderate retention — review weaker areas with targeted quizzes.");
      else diagParts.push("Early stage — continue ingesting documents and taking practice quizzes.");
      aiDiagnosis = diagParts.join(" ");
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          deepWorkHours: Math.round((analytics.studyMinutes / 60) * 10) / 10,
          conceptsMastered: conceptsExtracted || totalSummaries,
          neuralSynapses: totalDocs + totalQuizzes + conceptsExtracted,
          efficiencyDelta: efficiency,
        },
        activityData,
        subjectMastery,
        aiDiagnosis,
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
