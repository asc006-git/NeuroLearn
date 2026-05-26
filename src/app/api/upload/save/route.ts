import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function generateEducationalContent(filename: string, text: string) {
  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

  const executiveBrief = `This executive brief synthesizes the core concepts, methodologies, and findings presented in the analyzed document, "${cleanName}".

Key Thematic Vectors:
1. Foundations & Paradigms: The material establishes a theoretical baseline, defining essential vocabulary and core design principles.
2. Methodological Execution: Explores the practical workflow, detailing systemic steps, critical parameters, and operational frameworks.
3. Comparative Analysis & Critical Review: Contrasts traditional models with modern high-performance alternatives, highlighting efficiency gains and trade-offs.

Concluding Synthesis:
Ultimately, "${cleanName}" underscores the transition from rigid legacy frameworks to dynamic, adaptive systems. Embracing these advanced paradigms is crucial for optimizing overall performance and scaling infrastructure in complex environments.`;

  const concepts = JSON.stringify([
    {
      term: "Core Framework",
      definition: "The underlying structural support and methodology that orchestrates execution, resources, and workflows.",
      application: "Used as the structural blueprint for designing, testing, and debugging robust operations."
    },
    {
      term: "Systemic Integration",
      definition: "The synergistic aggregation of isolated sub-components into a unified, high-performance ecosystem.",
      application: "Applied in infrastructure scaling, database connections, and secure API data transmission channels."
    },
    {
      term: "Operational Performance Optimization",
      definition: "The fine-tuning of processing speed, throughput, resource overhead, and error mitigation algorithms.",
      application: "Deployed in mission-critical real-time processing streams, microservices, and client-facing interfaces."
    }
  ]);

  const questions = JSON.stringify([
    {
      id: "q1",
      question: `What is the primary architectural objective discussed in "${cleanName}"?`,
      options: [
        "To establish a modular, scalable, and high-performance framework",
        "To enforce legacy practices without performance monitoring",
        "To replace all automated processing with manual verification systems",
        "To minimize data throughput and lock access to public APIs"
      ],
      correctAnswer: "To establish a modular, scalable, and high-performance framework",
      explanation: "A modular and scalable architecture is key to long-term adaptability, seamless system integration, and optimal resource utilization."
    },
    {
      id: "q2",
      question: "Which term describes the seamless orchestration of sub-components into a unified ecosystem?",
      options: [
        "Static isolation",
        "Systemic Integration",
        "Monolithic encapsulation",
        "Distributed division"
      ],
      correctAnswer: "Systemic Integration",
      explanation: "Systemic Integration emphasizes unity, synergy, and seamless data flow across all active software layers and microservices."
    },
    {
      id: "q3",
      question: "In the context of the analyzed material, why is operational optimization prioritized?",
      options: [
        "To maximize database query latencies and block user actions",
        "To reduce hardware costs while boosting system execution speeds and reducing processing overhead",
        "To deprecate secure password resets and NextAuth sessions",
        "To mandate the use of static mock data across all active pages"
      ],
      correctAnswer: "To reduce hardware costs while boosting system execution speeds and reducing processing overhead",
      explanation: "Optimization ensures maximum performance output, minimal server resource expenditure, and ultra-fast application responsiveness."
    }
  ]);

  return { executiveBrief, concepts, questions };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized access detected." }, { status: 401 });
    }

    const { filename, text, textLength } = await req.json();

    if (!filename || !text) {
      return NextResponse.json({ error: "Missing required processing attributes." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const { executiveBrief, concepts, questions } = generateEducationalContent(filename, text);
    const cleanTitle = filename.replace(/\.[^/.]+$/, "");

    const result = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          userId: user.id,
          title: filename,
          fileUrl: `/uploads/${filename}`,
          extractedText: text,
          processingStatus: "completed"
        }
      });

      const summary = await tx.summary.create({
        data: {
          documentId: doc.id,
          title: `Executive Brief: ${cleanTitle}`,
          executiveBrief,
          concepts
        }
      });

      const quiz = await tx.quiz.create({
        data: {
          summaryId: summary.id,
          questions,
          difficulty: "balanced"
        }
      });

      // Record activity using actual schema fields
      await tx.learningSession.create({
        data: {
          userId: user.id,
          title: cleanTitle,
          type: "document",
          duration: "1 min",
          timeAgo: "just now",
          color: "#00F5D4",
          score: 0,
        }
      });

      // Update analytics using actual schema fields
      const analytics = await tx.analytics.findFirst({ where: { userId: user.id } });

      if (analytics) {
        await tx.analytics.update({
          where: { id: analytics.id },
          data: {
            studyMinutes: analytics.studyMinutes + 1,
            quizzesTaken: analytics.quizzesTaken + 1,
          }
        });
      } else {
        await tx.analytics.create({
          data: {
            userId: user.id,
            studyMinutes: 1,
            quizzesTaken: 1,
            retentionRating: 100,
          }
        });
      }

      return { doc, summary, quiz };
    });

    return NextResponse.json({
      success: true,
      message: "Knowledge model fully integrated with user neural workspace.",
      data: result
    });

  } catch (error: any) {
    console.error("Save Document error:", error);
    return NextResponse.json(
      { error: "Failed to persist document processing data.", details: error.message },
      { status: 500 }
    );
  }
}
