import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;

    const safeFilename = filename.replace(/[/\\]/g, "");
    if (safeFilename !== filename || filename.includes("..")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const download = searchParams.get("download") === "true";

    // Fetch fileData from database (persistent across Vercel serverless cold starts)
    const document = await prisma.document.findFirst({
      where: {
        fileUrl: { endsWith: safeFilename },
        user: { email: session.user.email },
      },
      select: { fileData: true, title: true },
    });

    if (!document?.fileData) {
      return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
    }

    const buffer = Buffer.from(document.fileData);
    const contentType = "application/pdf";
    const disposition = download ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${safeFilename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[File Serve Error]", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
