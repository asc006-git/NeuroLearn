import { NextResponse } from "next/server";
import { prisma, dbOperation, mockDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name identifier cannot be empty."),
  email: z.string().email("Please provide a valid neural email address."),
  password: z.string().min(6, "Security key must be at least 6 characters long."),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = signupSchema.parse(json);

    // Database check with elegant offline fallback
    const userExists = await dbOperation(
      async () => {
        return await prisma.user.findUnique({
          where: { email: body.email },
        });
      },
      () => {
        return mockDb.users.find((u) => u.email === body.email) || null;
      }
    );

    if (userExists) {
      return NextResponse.json(
        { error: "This email address is already bound to another profile." },
        { status: 400 }
      );
    }

    // Securely hash user credentials
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${body.name}&backgroundColor=transparent`;

    const newUser = await dbOperation(
      async () => {
        return await prisma.user.create({
          data: {
            name: body.name,
            email: body.email,
            hashedPassword,
            avatar,
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
      },
      () => {
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          name: body.name,
          email: body.email,
          hashedPassword,
          avatar,
          authProvider: "credentials",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockDb.users.push(user);
        
        // Also add standard preferences mock state
        mockDb.preferences.push({
          id: `pref-${user.id}`,
          userId: user.id,
          intensity: 2,
          adaptive: true,
          voice: false,
          dark: true,
          emailAlerts: true,
          pushAlerts: true,
          accentColor: "#00F5D4",
        });

        return user;
      }
    );

    return NextResponse.json(
      {
        message: "Neural identity profile created successfully.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          image: newUser.avatar,
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
