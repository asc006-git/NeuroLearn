import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";
import { sanitizeInput } from "@/lib/utils";

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userWithPrefs = await prisma.user.findUnique({
      where: { id: user.id },
      include: { preferences: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      preferences: userWithPrefs?.preferences || null,
    });
  } catch (error) {
    console.error("[Profile API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = profileUpdateSchema.parse(body);
    const { name, email, image } = parsed;

    const updateData: any = {};
    if (name !== undefined) updateData.name = sanitizeInput(name);
    if (email !== undefined) updateData.email = email;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
      },
    });
  } catch (error) {
    console.error("[Profile API] Update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Profile API] Delete error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
