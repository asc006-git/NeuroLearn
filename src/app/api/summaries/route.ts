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

    const [summaries, total] = await Promise.all([
      prisma.summary.findMany({
        where: {
          document: { userId: user.id },
        },
        orderBy: { generatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          document: { select: { title: true } },
        },
      }),
      prisma.summary.count({
        where: {
          document: { userId: user.id },
        },
      }),
    ]);

    const allSummaries = summaries.map((sum) => ({
      ...sum,
      documentTitle: sum.document.title,
      document: undefined,
    }));

    return NextResponse.json({
      success: true,
      summaries: allSummaries,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("GET Summaries Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge brief syntheses.", details: error.message },
      { status: 500 }
    );
  }
}
