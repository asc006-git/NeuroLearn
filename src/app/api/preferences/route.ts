import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      theme,
      accentColor,
      processingIntensity,
      adaptiveQuiz,
      voiceMode,
      emailNotifications,
      pushNotifications,
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        theme: theme || "dark",
        accentColor: accentColor || "#00ff88",
        processingIntensity: processingIntensity ?? 5,
        adaptiveQuiz: adaptiveQuiz ?? true,
        voiceMode: voiceMode ?? false,
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? true,
      },
      update: {
        ...(theme !== undefined && { theme }),
        ...(accentColor !== undefined && { accentColor }),
        ...(processingIntensity !== undefined && { processingIntensity }),
        ...(adaptiveQuiz !== undefined && { adaptiveQuiz }),
        ...(voiceMode !== undefined && { voiceMode }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
      },
    });

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error("[Preferences API] Error:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ preferences: user.preferences });
  } catch (error) {
    console.error("[Preferences API] Get error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}
