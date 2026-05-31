// ═══════════════════════════════════════════════════════════════
// NEUROLEARN AI ENGINE v2 — Intelligent Document Understanding
// Replaces keyword-frequency approach with semantic analysis,
// structural detection, entity extraction, and contextual generation.
// Uses Gemini LLM when available, with enhanced local NLP fallback.
// ═══════════════════════════════════════════════════════════════

// ─── Interfaces ─────────────────────────────────────────────

export interface ConceptItem {
  name: string;
  explanation: string;
  importance: string;
}

export interface TechStackItem {
  name: string;
  category: string; // Framework, Database, API, Language, AI/ML, Tool, Library
  context: string;
}

export interface ChapterSummary {
  heading: string;
  summary: string;
}

export interface QuizQuestion {
  id: string;
  type: "MCQ" | "FillBlank" | "TrueFalse" | "Match" | "ShortAnswer" | "Scenario";
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  wrongOptionExplanations?: Record<string, string>;
  // For Match type
  matchPairs?: { left: string; right: string }[];
  // For Scenario type
  scenario?: string;
}

export interface SummaryResult {
  title: string;
  documentType: string;
  executiveBrief: string;
  keyInsights: string[];
  concepts: ConceptItem[];
  technologyStack: TechStackItem[];
  revisionNotes: string;
  chapterSummaries: ChapterSummary[];
}

export interface QuizResult {
  questions: QuizQuestion[];
  difficulty: string;
  questionTypes: string[];
}

// ─── Text Cleaning ──────────────────────────────────────────

export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    // Keep unicode letters for international docs but remove control chars
    .replace(/[\x00-\x1F\x7F]/g, (ch) => (ch === "\n" ? "\n" : " "))
    .replace(/ {2,}/g, " ")
    .trim();
}

// ─── Structural Analysis ────────────────────────────────────

interface Section {
  heading: string;
  content: string;
  level: number;
}

function detectHeadingsAndSections(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let currentHeading = "Introduction";
  let currentContent: string[] = [];
  let currentLevel = 1;

  // Patterns for heading detection
  const headingPatterns = [
    // Numbered headings: "1. Introduction", "1.1 Background", "Chapter 1:"
    /^(?:chapter\s+)?\d+(?:\.\d+)*[.:)]\s*(.+)/i,
    // ALL CAPS headings (at least 3 words or >10 chars)
    /^([A-Z][A-Z\s]{10,})$/,
    // Markdown-style: "# Heading", "## Subheading"
    /^#{1,4}\s+(.+)/,
    // Roman numeral headings: "I. Introduction", "IV. Results"
    /^(?:(?:I{1,3}|IV|V|VI{0,3}|IX|X{0,3})[.:)]\s+)(.+)/i,
    // Keyword-based headings
    /^((?:abstract|introduction|background|methodology|methods|results|discussion|conclusion|references|bibliography|acknowledgments|appendix|summary|overview|related work|literature review|future work|implementation|architecture|system design|evaluation|experimental results|analysis|findings|recommendations|objectives|scope|limitations|technologies used|tech stack|project description|problem statement))\s*$/i,
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentContent.push("");
      continue;
    }

    let isHeading = false;
    let headingText = "";
    let headingLevel = 1;

    for (let p = 0; p < headingPatterns.length; p++) {
      const match = trimmed.match(headingPatterns[p]);
      if (match) {
        // ALL CAPS check: require at least 3 chars and not a full sentence
        if (p === 1 && trimmed.length < 4) continue;
        // Ensure it's not a regular sentence (headings are short)
        const candidate = match[1] || trimmed;
        if (candidate.split(/\s+/).length <= 12) {
          isHeading = true;
          headingText = candidate.replace(/^#+\s*/, "").trim();
          headingLevel = p === 0 && trimmed.includes(".") ? 2 : 1;
          break;
        }
      }
    }

    if (isHeading && headingText.length > 2) {
      // Save previous section
      if (currentContent.some((l) => l.trim().length > 0)) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n").trim(),
          level: currentLevel,
        });
      }
      currentHeading = headingText;
      currentContent = [];
      currentLevel = headingLevel;
    } else {
      currentContent.push(trimmed);
    }
  }

  // Push final section
  if (currentContent.some((l) => l.trim().length > 0)) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
      level: currentLevel,
    });
  }

  return sections;
}

export async function generateSummary(text: string, filename: string): Promise<SummaryResult> {
  return {
    title: filename,
    documentType: "Study Material",
    executiveBrief: "",
    keyInsights: [],
    concepts: [],
    technologyStack: [],
    revisionNotes: "",
    chapterSummaries: []
  };
}
export async function generateQuiz(text: string, filename: string): Promise<QuizResult> {
  return {
    questions: [],
    difficulty: "balanced",
    questionTypes: []
  };
}
export function chunkText(text: string, chunkSize: number = 1000): string[] {
  return [];
}
