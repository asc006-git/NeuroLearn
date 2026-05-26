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
            summaries: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // Flatten all summaries across user documents
    const allSummaries = user.documents.flatMap((doc) =>
      doc.summaries.map((sum) => ({
        ...sum,
        documentTitle: doc.title,
      }))
    );

    // Sort by generatedAt descending
    allSummaries.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return NextResponse.json({
      success: true,
      summaries: allSummaries,
    });
  } catch (error: any) {
    console.error("GET Summaries Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge brief syntheses.", details: error.message },
      { status: 500 }
    );
  }
}
