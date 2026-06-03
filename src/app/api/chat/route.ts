import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

const chatSchema = z.object({
  message: z.string().min(1).max(10000).transform(sanitizeInput),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    text: z.string().transform(sanitizeInput),
  })).max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
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
                projectObjective: true,
                keyFindings: true,
                methodology: true,
                architecture: true,
                results: true,
                conclusion: true,
                revisionNotes: true,
              },
              take: 10,
              orderBy: { generatedAt: "desc" },
            },
          },
        },
        notes: {
          select: { id: true, title: true, content: true, type: true },
          take: 20,
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, retryAfter } = rateLimit(`chat:${ip}`, 30, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = chatSchema.parse(body);
    const { message, history } = parsed;

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "API_KEY_MISSING",
        details: "The GOOGLE_API_KEY environment variable is not set. Please add a valid Gemini API key to your .env file.",
      }, { status: 503 });
    }

    const docCount = (userData?.documents || []).length;
    const noteCount = (userData?.notes || []).length;

    const contextParts: string[] = [`You are a helpful AI learning assistant. The user has ${docCount} document(s) and ${noteCount} note(s) in their workspace. Answer based on their document context.\n`];

    for (const doc of (userData?.documents || []).slice(0, 10)) {
      for (const summary of doc.summaries) {
        contextParts.push(`Document: ${summary.title || doc.title}`);
        if (summary.projectObjective) contextParts.push(`Objective: ${summary.projectObjective.substring(0, 500)}`);
        if (summary.executiveBrief) contextParts.push(`Brief: ${summary.executiveBrief.substring(0, 800)}`);
        if (summary.keyInsights) {
          try {
            const insights = JSON.parse(summary.keyInsights);
            if (Array.isArray(insights)) contextParts.push(`Key Insights: ${insights.slice(0, 5).join("; ")}`);
          } catch {}
        }
        if (summary.keyFindings) {
          try {
            const findings = JSON.parse(summary.keyFindings);
            if (Array.isArray(findings)) contextParts.push(`Findings: ${findings.slice(0, 3).join("; ")}`);
          } catch {}
        }
        if (summary.concepts) {
          try {
            const concepts = JSON.parse(summary.concepts);
            if (Array.isArray(concepts)) contextParts.push(`Concepts: ${concepts.slice(0, 5).map((c: any) => c.name || c.term).filter(Boolean).join(", ")}`);
          } catch {}
        }
        if (summary.methodology) contextParts.push(`Methodology: ${summary.methodology.substring(0, 500)}`);
        if (summary.architecture) contextParts.push(`Architecture: ${summary.architecture.substring(0, 500)}`);
        if (summary.results) contextParts.push(`Results: ${summary.results.substring(0, 500)}`);
        if (summary.conclusion) contextParts.push(`Conclusion: ${summary.conclusion.substring(0, 500)}`);
        contextParts.push("---");
      }
    }

    // Add notes as context
    if (noteCount > 0) {
      contextParts.push("\nUser's Smart Notes:");
      for (const note of (userData?.notes || []).slice(0, 15)) {
        contextParts.push(`- [${note.type}] ${note.title}: ${note.content.substring(0, 300)}`);
      }
      contextParts.push("---");
    }

    const contextText = contextParts.join("\n");

    // Format conversation history
    const historyParts = (history || []).slice(-8).map((msg: any) =>
      `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}`
    ).join("\n");

    const noDocFallback = docCount === 0
      ? "\n\nNote: The user has no documents yet. If they ask about specific content, suggest they upload a PDF document from the Dashboard to get started."
      : "";

    const prompt = `${contextText}${noDocFallback}

Conversation so far:
${historyParts}

User: ${message}

Assistant: Provide a helpful, accurate answer based on the user's document context, summaries, and notes. If the answer is not in the available context, suggest what the user could upload or search for. Keep answers concise but informative.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Chat API] Gemini error:", errorText);
      // Detect API key errors specifically
      if (response.status === 400 || response.status === 403) {
        return NextResponse.json({
          error: "API_KEY_INVALID",
          details: "The configured Gemini API key is invalid or unauthorized. Please update your GOOGLE_API_KEY in the .env file with a valid key from Google AI Studio.",
        }, { status: 502 });
      }
      if (response.status === 429) {
        const isQuotaExhausted = errorText.includes("limit: 0") || errorText.includes("exceeded your current quota");
        return NextResponse.json({
          error: isQuotaExhausted ? "QUOTA_EXHAUSTED" : "RATE_LIMITED",
          details: isQuotaExhausted
            ? "Your Gemini API free-tier quota is exhausted. Please wait for it to reset (usually daily), generate a new API key from a different Google account, or enable billing on your Google Cloud project."
            : "The Gemini API rate limit has been exceeded. Please wait a moment and try again.",
        }, { status: 429 });
      }
      // Provide graceful fallback
      if (docCount === 0) {
        return NextResponse.json({ reply: "I don't have any documents to reference yet. Upload a PDF document from the Dashboard, and I'll be able to answer questions about its content!" });
      }
      return NextResponse.json({
        error: "AI_UNAVAILABLE",
        details: "The AI service is temporarily unavailable. Please try again in a moment.",
      }, { status: 502 });
    }

    const json = await response.json();
    const reply = json.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response right now.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
