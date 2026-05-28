// ═══════════════════════════════════════════════════════════════
// NEUROLEARN AI ENGINE — Summary Distillation & Quiz Compilation
// Uses Gemini LLM when available, with robust local NLP fallback
// ═══════════════════════════════════════════════════════════════

interface ConceptItem {
  term: string;
  definition: string;
  application: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface SummaryResult {
  title: string;
  executiveBrief: string;
  concepts: ConceptItem[];
}

interface QuizResult {
  questions: QuizQuestion[];
  difficulty: string;
}

// ─── Text Cleaning ──────────────────────────────────────────

export function cleanText(raw: string): string {
  return raw
    // Normalize whitespace
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    // Remove excessive blank lines
    .replace(/\n{3,}/g, "\n\n")
    // Remove non-printable characters except newlines
    .replace(/[^\x20-\x7E\n]/g, " ")
    // Collapse multiple spaces
    .replace(/ {2,}/g, " ")
    .trim();
}

// ─── Sentence Extraction ────────────────────────────────────

function extractSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or newline
  const raw = text.split(/(?<=[.!?])\s+/);
  return raw
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 500);
}

// ─── Key Term Extraction ────────────────────────────────────

function extractKeyTerms(text: string): string[] {
  const words = text.split(/\s+/);
  const freq: Record<string, number> = {};
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "every", "both", "few", "more", "most", "other", "some", "such", "no",
    "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "just", "because", "but", "and", "or", "if", "while", "although",
    "this", "that", "these", "those", "it", "its", "they", "them", "their",
    "we", "us", "our", "you", "your", "he", "him", "his", "she", "her",
    "which", "who", "whom", "what", "also", "about", "up",
  ]);

  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (clean.length > 3 && !stopWords.has(clean)) {
      freq[clean] = (freq[clean] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

// ─── Capitalize Helper ──────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Local Summary Generation (Extractive) ──────────────────

function generateLocalSummary(text: string, filename: string): SummaryResult {
  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  const sentences = extractSentences(text);
  const keyTerms = extractKeyTerms(text);

  // Pick the most informative sentences for the executive brief
  // Score sentences by how many key terms they contain
  const scoredSentences = sentences.map((s) => {
    const lower = s.toLowerCase();
    const score = keyTerms.reduce((acc, term) => acc + (lower.includes(term) ? 1 : 0), 0);
    return { text: s, score };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  const topSentences = scoredSentences.slice(0, 8).map((s) => s.text);

  const executiveBrief = `This executive brief synthesizes the core concepts, methodologies, and findings presented in "${cleanName}".

${topSentences.slice(0, 3).join(" ")}

The material further elaborates on key themes:
${topSentences.slice(3, 6).join(" ")}

${topSentences.length > 6 ? `Additional insights include: ${topSentences.slice(6).join(" ")}` : ""}`.trim();

  // Build concepts from key terms and their surrounding context
  const concepts: ConceptItem[] = keyTerms.slice(0, 5).map((term) => {
    // Find the best sentence containing this term
    const contextSentence = sentences.find((s) => s.toLowerCase().includes(term)) || "";
    return {
      term: capitalize(term),
      definition: contextSentence || `A key concept identified in the analysis of "${cleanName}" related to ${term}.`,
      application: `This concept appears frequently in the document and is central to understanding the material's core arguments and methodology.`,
    };
  });

  return {
    title: `Executive Brief: ${cleanName}`,
    executiveBrief,
    concepts,
  };
}

// ─── Local Quiz Generation ──────────────────────────────────

function generateLocalQuiz(text: string, filename: string): QuizResult {
  const sentences = extractSentences(text);
  const keyTerms = extractKeyTerms(text);
  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

  const questions: QuizQuestion[] = [];

  // Generate MCQs from key sentences
  const usedSentences = new Set<number>();

  for (let i = 0; i < Math.min(keyTerms.length, 5); i++) {
    const term = keyTerms[i];
    // Find a sentence containing this term
    const sentenceIdx = sentences.findIndex(
      (s, idx) => s.toLowerCase().includes(term) && !usedSentences.has(idx)
    );

    if (sentenceIdx === -1) continue;
    usedSentences.add(sentenceIdx);

    const correctSentence = sentences[sentenceIdx];

    // Create a question about this term
    const wrongOptions = keyTerms
      .filter((t) => t !== term)
      .slice(0, 3)
      .map((t) => capitalize(t));

    // Ensure we have enough wrong options
    const fillerOptions = ["Data normalization", "System initialization", "Resource allocation", "Pattern recognition", "Structured analysis"];
    while (wrongOptions.length < 3) {
      const filler = fillerOptions[wrongOptions.length];
      if (filler && !wrongOptions.includes(filler)) {
        wrongOptions.push(filler);
      }
    }

    const options = [capitalize(term), ...wrongOptions.slice(0, 3)];
    // Shuffle options
    for (let j = options.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [options[j], options[k]] = [options[k], options[j]];
    }

    questions.push({
      id: `q${i + 1}`,
      question: `Based on the analysis of "${cleanName}", which of the following concepts is directly discussed in the context: "${correctSentence.substring(0, 120)}..."?`,
      options,
      correctAnswer: capitalize(term),
      explanation: correctSentence,
    });
  }

  // Add a general comprehension question if we have enough content
  if (sentences.length > 5) {
    const topSentence = sentences[0];
    questions.push({
      id: `q${questions.length + 1}`,
      question: `What is a primary theme discussed in "${cleanName}"?`,
      options: [
        `${capitalize(keyTerms[0] || "analysis")} and its applications`,
        "Unrelated historical timelines",
        "Abstract mathematical proofs without context",
        "Random data generation techniques",
      ],
      correctAnswer: `${capitalize(keyTerms[0] || "analysis")} and its applications`,
      explanation: `The document primarily focuses on ${keyTerms.slice(0, 3).join(", ")} as evidenced by: "${topSentence.substring(0, 150)}..."`,
    });
  }

  // Ensure we have at least 3 questions
  if (questions.length < 3) {
    questions.push({
      id: `q${questions.length + 1}`,
      question: `Which best describes the scope of "${cleanName}"?`,
      options: [
        `A comprehensive analysis covering ${keyTerms.slice(0, 2).join(" and ")}`,
        "A fictional narrative unrelated to the topic",
        "A collection of random unstructured notes",
        "An outdated reference with no modern relevance",
      ],
      correctAnswer: `A comprehensive analysis covering ${keyTerms.slice(0, 2).join(" and ")}`,
      explanation: `The document provides structured analysis of key concepts including ${keyTerms.slice(0, 4).join(", ")}.`,
    });
  }

  return { questions, difficulty: "balanced" };
}

// ─── Gemini API Integration (when key is valid) ─────────────

async function tryGeminiSummary(text: string, filename: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  const truncatedText = text.substring(0, 8000); // Limit to avoid token overflow

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert educational AI. Analyze the following document text and produce a JSON response with exactly this structure (no markdown fences, just raw JSON):
{
  "title": "Executive Brief: ${cleanName}",
  "executiveBrief": "A 3-4 paragraph executive summary of the key themes, findings, and methodology...",
  "concepts": [
    {"term": "Concept Name", "definition": "Clear definition...", "application": "How this concept applies..."},
    ... (3-5 concepts)
  ]
}

Document text:
${truncatedText}`
          }]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;

    // Strip markdown code fences if present
    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed as SummaryResult;
  } catch {
    return null;
  }
}

async function tryGeminiQuiz(text: string, filename: string): Promise<QuizResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  const truncatedText = text.substring(0, 8000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert quiz designer. Based on the following document text, generate a quiz with 4-6 multiple choice questions. Produce a JSON response with exactly this structure (no markdown fences, just raw JSON):
{
  "questions": [
    {
      "id": "q1",
      "question": "The question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact text of the correct option",
      "explanation": "Why this is the correct answer..."
    }
  ],
  "difficulty": "balanced"
}

Document text:
${truncatedText}`
          }]
        }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;

    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed as QuizResult;
  } catch {
    return null;
  }
}

// ─── Public API ─────────────────────────────────────────────

export async function generateSummary(text: string, filename: string): Promise<SummaryResult> {
  // Try Gemini first
  const geminiResult = await tryGeminiSummary(text, filename);
  if (geminiResult) {
    console.log("[AI Engine] Summary generated via Gemini API");
    return geminiResult;
  }

  // Fallback to local extractive summary
  console.log("[AI Engine] Summary generated via local NLP fallback");
  return generateLocalSummary(text, filename);
}

export async function generateQuiz(text: string, filename: string): Promise<QuizResult> {
  // Try Gemini first
  const geminiResult = await tryGeminiQuiz(text, filename);
  if (geminiResult) {
    console.log("[AI Engine] Quiz generated via Gemini API");
    return geminiResult;
  }

  // Fallback to local quiz generation
  console.log("[AI Engine] Quiz generated via local NLP fallback");
  return generateLocalQuiz(text, filename);
}

export function chunkText(text: string, chunkSize: number = 1000): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current: string[] = [];
  let len = 0;

  for (const word of words) {
    len += word.length + 1;
    current.push(word);
    if (len >= chunkSize) {
      chunks.push(current.join(" "));
      current = [];
      len = 0;
    }
  }
  if (current.length > 0) {
    chunks.push(current.join(" "));
  }
  return chunks;
}
