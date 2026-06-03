import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        documents: {
          include: {
            summaries: {
              include: { quizzes: true },
            },
          },
        },
      },
    });

    const quizzesList = (userData?.documents || []).flatMap((doc) =>
      doc.summaries.flatMap((sum) =>
        sum.quizzes.map((quiz) => ({
          ...quiz,
          summaryTitle: sum.title,
          documentTitle: doc.title,
        }))
      )
    );

    return NextResponse.json({ success: true, quizzes: quizzesList });
  } catch (error: any) {
    console.error("GET Quizzes Error:", error);
    return NextResponse.json(
      { error: "Failed to load modular quizzes.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { quizId, score, points, duration } = await req.json();

    if (!quizId || score === undefined) {
      return NextResponse.json({ error: "Missing required session parameters." }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { summary: { include: { document: true } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz record not found." }, { status: 404 });
    }

    const docTitle = quiz.summary.document.title.replace(/\.[^/.]+$/, "");

    await prisma.quiz.update({
      where: { id: quizId },
      data: { score },
    });

    const learningSession = await prisma.learningSession.create({
      data: {
        userId: user.id,
        title: `${docTitle} Quiz`,
        type: "quiz",
        duration: `${duration || 1} min`,
        timeAgo: "just now",
        color: "#FF8A00",
        score: score,
      },
    });

    const analytics = await prisma.analytics.findFirst({ where: { userId: user.id } });

    if (analytics) {
      await prisma.analytics.update({
        where: { id: analytics.id },
        data: {
          studyMinutes: analytics.studyMinutes + (duration || 1),
          quizzesTaken: analytics.quizzesTaken + 1,
          retentionRating: Math.round((analytics.retentionRating + score) / 2),
          cognitiveScore: analytics.cognitiveScore + (points || 0),
        },
      });
    } else {
      await prisma.analytics.create({
        data: {
          userId: user.id,
          studyMinutes: duration || 1,
          quizzesTaken: 1,
          retentionRating: score,
          cognitiveScore: points || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Neural lab session logs successfully archived.",
      data: learningSession,
    });
  } catch (error: any) {
    console.error("POST Submit Quiz Error:", error);
    return NextResponse.json(
      { error: "Failed to record learning metrics.", details: error.message },
      { status: 500 }
    );
  }
}
