import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-validation";

export async function PUT(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, retryAfter } = rateLimit(`password-change:${ip}`, 3, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const { user, error } = await requireAuth();
    if (error) return error;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!fullUser || !fullUser.hashedPassword) {
      return NextResponse.json({ error: "Account does not support password login" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, fullUser.hashedPassword);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Password API] Error:", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
