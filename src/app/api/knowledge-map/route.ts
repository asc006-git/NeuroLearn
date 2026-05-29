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
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const maps = await prisma.knowledgeMap.findMany({
      where: { userId: user.id },
    });

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

    return NextResponse.json({ success: true, nodes });
  } catch (error: any) {
    console.error("GET KnowledgeMap Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge map data.", details: error.message },
      { status: 500 }
    );
  }
}
