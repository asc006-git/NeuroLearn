import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireAuth(): Promise<{
  user: { id: string; name: string | null; email: string; image: string | null };
  error: NextResponse | null;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { user: null as any, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, image: true },
  });

  if (!user) {
    return { user: null as any, error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user, error: null };
}
