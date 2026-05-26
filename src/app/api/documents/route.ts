import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET user's documents
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized access detected." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      documents: user.documents,
    });
  } catch (error: any) {
    console.error("GET Documents Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch source materials.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE a document
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized access detected." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID parameter is required." }, { status: 400 });
    }

    // Retrieve document and verify owner
    const document = await prisma.document.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (document.user.email !== session.user.email) {
      return NextResponse.json({ error: "Access denied. Cannot delete another user's materials." }, { status: 403 });
    }

    // Delete in transactional cascade if Prisma does not handle it cleanly
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Knowledge node successfully purged from workspace catalog.",
    });
  } catch (error: any) {
    console.error("DELETE Document Error:", error);
    return NextResponse.json(
      { error: "Failed to purge source material.", details: error.message },
      { status: 500 }
    );
  }
}
