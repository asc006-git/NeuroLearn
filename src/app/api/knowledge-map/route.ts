import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const [maps, total] = await Promise.all([
      prisma.knowledgeMap.findMany({
        where: { userId: user.id },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.knowledgeMap.count({ where: { userId: user.id } }),
    ]);

    const nodes = maps.map((m) => ({
      id: m.id,
      topic: m.topic,
      category: m.category,
      relevance: m.relevance,
      color: m.color,
      points: JSON.parse(m.points || "[]"),
      connections: JSON.parse(m.connections || "[]"),
      x: m.x,
      y: m.y,
    }));

    return NextResponse.json({ success: true, nodes, total, page, limit });
  } catch (error: any) {
    console.error("GET KnowledgeMap Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge map data.", details: error.message },
      { status: 500 }
    );
  }
}
