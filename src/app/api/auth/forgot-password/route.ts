import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return a successful message to prevent email enumeration
      return NextResponse.json(
        { message: "If a profile is bound to this email, a reset transmission has been sent." },
        { status: 200 }
      );
    }

    // Generate secure token and expiry (1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: expiry,
      },
    });

    // Simulate sending email via backend console log
    console.log("\n╔══════════════════════════════════════════════════════════════════╗");
    console.log("║ NEUROLEARN AI — SIMULATED EMAIL RESET SERVICE                   ║");
    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log(`║ TO:      ${email.padEnd(54)} ║`);
    console.log(`║ LINK:    http://localhost:3000/auth/reset-password?token=${token.substring(0, 16)}... ║`);
    console.log(`║ FULL URL: http://localhost:3000/auth/reset-password?token=${token} ║`);
    console.log("╚══════════════════════════════════════════════════════════════════╝\n");

    return NextResponse.json(
      { message: "A secure reset link has been dispatched to your email address (simulated)." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal server anomaly during reset authorization." },
      { status: 500 }
    );
  }
}
