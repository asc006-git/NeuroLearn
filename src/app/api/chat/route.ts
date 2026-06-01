import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        documents: {
          include: {
            summaries: {
              select: {
                id: true,
                title: true,
                executiveBrief: true,
                keyInsights: true,
                technologyStack: true,
                chapterSummaries: true,
                concepts: true,
              },
              take: 5,
              orderBy: { generatedAt: "desc" },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "AI assistant is not configured. Please contact support." });
    }

    // Build context from user's documents and summaries
    const contextParts: string[] = ["You are a helpful AI learning assistant. Answer the user's query based on their document context.\n"];

    for (const doc of user.documents.slice(0, 10)) {
      for (const summary of doc.summaries) {
        contextParts.push(`Document: ${summary.title || doc.title}`);
        if (summary.executiveBrief) contextParts.push(`Summary: ${summary.executiveBrief.substring(0, 1000)}`);
        if (summary.keyInsights) {
          try {
            const insights = JSON.parse(summary.keyInsights);
            if (Array.isArray(insights)) contextParts.push(`Key Insights: ${insights.slice(0, 3).join("; ")}`);
          } catch {}
        }
        if (summary.concepts) {
          try {
            const concepts = JSON.parse(summary.concepts);
            if (Array.isArray(concepts)) contextParts.push(`Concepts: ${concepts.slice(0, 3).map((c: any) => c.name || c.term).filter(Boolean).join(", ")}`);
          } catch {}
        }
        contextParts.push("---");
      }
    }

    const contextText = contextParts.join("\n");

    // Format conversation history
    const historyParts = (history || []).slice(-6).map((msg: any) =>
      `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}`
    ).join("\n");

    const prompt = `${contextText}

Conversation so far:
${historyParts}

User: ${message}

Assistant: Provide a helpful, accurate answer based on the user's document context. If the answer is not in the documents, suggest what the user could upload or search for. Keep answers concise but informative.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Chat API] Gemini error:", errorText);
      return NextResponse.json({ reply: "I'm having trouble connecting to my knowledge base. Please try again." });
    }

    const json = await response.json();
    const reply = json.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response right now.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
