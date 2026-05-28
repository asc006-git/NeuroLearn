import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ═══════════════════════════════════════════════════════════════
// NEUROLEARN — Post-Ingestion Verification Endpoint
// The main upload pipeline (/api/upload) now handles all DB writes
// during the SSE stream. This endpoint serves as a verification
// check and backward-compatibility bridge for the frontend.
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access detected." }, { status: 401 });
    }

    const { filename } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: "Missing required filename attribute." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // Find the most recently uploaded document with this filename
    const doc = await prisma.document.findFirst({
      where: {
        userId: user.id,
        title: filename,
      },
      orderBy: { uploadedAt: "desc" },
      include: {
        summaries: {
          include: { quizzes: true },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({
        success: false,
        error: "Document not yet found in database. Pipeline may still be processing.",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Knowledge model fully integrated with user neural workspace.",
      data: {
        doc: {
          id: doc.id,
          title: doc.title,
          processingStatus: doc.processingStatus,
          uploadedAt: doc.uploadedAt,
        },
        summary: doc.summaries[0] || null,
        quiz: doc.summaries[0]?.quizzes[0] || null,
      },
    });
  } catch (error: any) {
    console.error("Save Verification Error:", error);
    return NextResponse.json(
      { error: "Failed to verify document ingestion.", details: error.message },
      { status: 500 }
    );
  }
}
