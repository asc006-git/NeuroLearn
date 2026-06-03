import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/password-validation";

const signupSchema = z.object({
  name: z.string().min(1, "Name identifier cannot be empty.").max(100).transform((s) => s.trim()),
  email: z.string().email("Please provide a valid neural email address.").toLowerCase().trim(),
  password: z
    .string()
    .min(passwordSchema.min, "Security key must be at least 8 characters long.")
    .max(passwordSchema.max, "Security key must not exceed 128 characters.")
    .regex(passwordSchema.pattern, "Password must contain at least one uppercase letter.")
    .regex(passwordSchema.patternLower, "Password must contain at least one lowercase letter.")
    .regex(passwordSchema.patternNumber, "Password must contain at least one number."),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const { allowed, retryAfter } = rateLimit(`signup:${ip}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many signup attempts. Try again in ${retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const json = await request.json();
    const body = signupSchema.parse(json);

    const userExists = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (userExists) {
      return NextResponse.json(
        { error: "This email address is already bound to another profile." },
        { status: 400 }
      );
    }

    // Securely hash user credentials
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const image = `https://api.dicebear.com/7.x/notionists/svg?seed=${body.name}&backgroundColor=transparent`;

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        hashedPassword,
        image,
        preferences: {
          create: {
            intensity: 2,
            adaptive: true,
            voice: false,
            dark: true,
            emailAlerts: true,
            pushAlerts: true,
            accentColor: "#00F5D4",
          }
        }
      },
    });

    return NextResponse.json(
      {
        message: "Neural identity profile created successfully.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          image: newUser.image,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Signup process execution failure:", error);
    return NextResponse.json(
      { error: "Internal server anomaly in database profile provision." },
      { status: 500 }
    );
  }
}
