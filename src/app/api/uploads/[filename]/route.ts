import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

async function serveFile(safeFilename: string, download: boolean) {
  const filePath = path.join(process.cwd(), "private", "uploads", safeFilename);

  let buffer: Buffer;
  let fileExists = true;
  try {
    await fs.access(filePath);
    buffer = await fs.readFile(filePath);
  } catch {
    try {
      const publicPath = path.join(process.cwd(), "public", "uploads", safeFilename);
      await fs.access(publicPath);
      buffer = await fs.readFile(publicPath);
    } catch {
      fileExists = false;
    }
  }

  if (!fileExists) {
    return NextResponse.json({ error: "Requested file does not exist on this server." }, { status: 404 });
  }

  const ext = path.extname(safeFilename).toLowerCase();
  const contentType = ext === ".pdf" ? "application/pdf" : "application/octet-stream";
  const disposition = download ? "attachment" : "inline";

  return new NextResponse(new Uint8Array(buffer!), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename="${safeFilename}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;

    const safeFilename = path.basename(filename);
    if (safeFilename !== filename || safeFilename.includes("..") || safeFilename.includes("/") || safeFilename.includes("\\")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const download = searchParams.get("download") === "true";

    // Verify the requesting user owns this file
    const document = await prisma.document.findFirst({
      where: {
        fileUrl: { endsWith: safeFilename },
        user: { email: session.user.email },
      },
      select: { id: true },
    });

    if (!document) {
      return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
    }

    return await serveFile(safeFilename, download);
  } catch (error) {
    console.error("[File Serve Error]", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
