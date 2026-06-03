import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const {
      dark,
      accentColor,
      intensity,
      adaptive,
      voice,
      emailAlerts,
      pushAlerts,
    } = body;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dark: dark ?? true,
        accentColor: accentColor || "#00F5D4",
        intensity: intensity ?? 2,
        adaptive: adaptive ?? true,
        voice: voice ?? false,
        emailAlerts: emailAlerts ?? true,
        pushAlerts: pushAlerts ?? true,
      },
      update: {
        ...(dark !== undefined && { dark }),
        ...(accentColor !== undefined && { accentColor }),
        ...(intensity !== undefined && { intensity }),
        ...(adaptive !== undefined && { adaptive }),
        ...(voice !== undefined && { voice }),
        ...(emailAlerts !== undefined && { emailAlerts }),
        ...(pushAlerts !== undefined && { pushAlerts }),
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
    const { user, error } = await requireAuth();
    if (error) return error;

    const userWithPrefs = await prisma.user.findUnique({
      where: { id: user.id },
      include: { preferences: true },
    });

    return NextResponse.json({ preferences: userWithPrefs?.preferences });
  } catch (error) {
    console.error("[Preferences API] Get error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}
