import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";
import { sanitizeInput } from "@/lib/utils";

const createNoteSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(50000),
  type: z.string().max(50).optional(),
  tags: z.string().max(500).optional(),
  summaryId: z.string().optional(),
});

const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).max(50000).optional(),
  type: z.string().max(50).optional(),
  tags: z.string().max(500).optional(),
  pinned: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const summaryId = searchParams.get("summaryId");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const where: any = { userId: user.id };
    if (type) where.type = type;
    if (summaryId) where.summaryId = summaryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return NextResponse.json({ notes, total, page, limit });
  } catch (error) {
    console.error("[NOTES API] Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = createNoteSchema.parse(body);
    const { title, content, type, tags, summaryId } = parsed;

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: sanitizeInput(title),
        content: sanitizeInput(content),
        type: type ? sanitizeInput(type) : "user",
        source: "user-created",
        tags: tags ? sanitizeInput(tags) : "",
        summaryId: summaryId || null,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("[NOTES API] Error creating note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = updateNoteSchema.parse(body);
    const { id, title, content, type, tags, pinned } = parsed;

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: sanitizeInput(title) }),
        ...(content !== undefined && { content: sanitizeInput(content) }),
        ...(type !== undefined && { type: sanitizeInput(type) }),
        ...(tags !== undefined && { tags: sanitizeInput(tags) }),
        ...(pinned !== undefined && { pinned }),
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("[NOTES API] Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTES API] Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
