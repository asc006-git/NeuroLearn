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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const quizzesList = user.documents.flatMap((doc) =>
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized access detected." }, { status: 401 });
    }

    const { quizId, score, duration } = await req.json();

    if (!quizId || score === undefined) {
      return NextResponse.json({ error: "Missing required session parameters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { summary: { include: { document: true } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz record not found." }, { status: 404 });
    }

    const docTitle = quiz.summary.document.title.replace(/\.[^/.]+$/, "");

    // Record learning session using actual schema fields
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

    // Update analytics using actual schema fields
    const analytics = await prisma.analytics.findFirst({ where: { userId: user.id } });

    if (analytics) {
      await prisma.analytics.update({
        where: { id: analytics.id },
        data: {
          studyMinutes: analytics.studyMinutes + (duration || 1),
          quizzesTaken: analytics.quizzesTaken + 1,
          retentionRating: Math.round((analytics.retentionRating + score) / 2),
        },
      });
    } else {
      await prisma.analytics.create({
        data: {
          userId: user.id,
          studyMinutes: duration || 1,
          quizzesTaken: 1,
          retentionRating: score,
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
