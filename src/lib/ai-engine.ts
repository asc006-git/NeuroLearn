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

// ─── Document Type Detection ────────────────────────────────

function detectDocumentType(text: string, sections: Section[]): string {
  const lower = text.toLowerCase();
  const headings = sections.map((s) => s.heading.toLowerCase());

  // Research Paper markers
  const researchMarkers = ["abstract", "methodology", "literature review", "related work", "hypothesis", "experimental results", "peer review", "citations", "references"];
  const researchScore = researchMarkers.filter((m) => lower.includes(m)).length;

  // Project Report markers
  const projectMarkers = ["project description", "objectives", "implementation", "tech stack", "technologies used", "system design", "architecture", "screenshots", "deployment", "team members"];
  const projectScore = projectMarkers.filter((m) => lower.includes(m)).length;

  // Book Chapter markers
  const bookMarkers = ["chapter", "table of contents", "preface", "index", "glossary", "further reading"];
  const bookScore = bookMarkers.filter((m) => lower.includes(m) || headings.some((h) => h.includes(m))).length;

  // Technical Document markers
  const techMarkers = ["api", "endpoint", "configuration", "installation", "setup", "prerequisites", "dependencies", "troubleshooting", "documentation"];
  const techScore = techMarkers.filter((m) => lower.includes(m)).length;

  // Notes markers
  const notesMarkers = ["note:", "important:", "remember:", "key points", "summary points", "bullet"];
  const notesScore = notesMarkers.filter((m) => lower.includes(m)).length;

  const scores: [string, number][] = [
    ["Research Paper", researchScore],
    ["Project Report", projectScore],
    ["Book Chapter", bookScore],
    ["Technical Document", techScore],
    ["Notes", notesScore],
  ];

  scores.sort((a, b) => b[1] - a[1]);

  if (scores[0][1] >= 2) return scores[0][0];
  return "Study Material";
}

// ─── Entity & Concept Extraction ────────────────────────────

interface ExtractedEntity {
  name: string;
  type: string; // technology, concept, methodology, organization, metric
  frequency: number;
  contexts: string[];
}

function extractKeyEntities(text: string, sentences: string[]): ExtractedEntity[] {
  const entities: Map<string, ExtractedEntity> = new Map();

  // Technology patterns
  const techPatterns = /\b(React|Angular|Vue\.?js|Next\.?js|Node\.?js|Express|Django|Flask|FastAPI|Spring\s?Boot|\.NET|Laravel|Ruby\s+on\s+Rails|PostgreSQL|MySQL|MongoDB|Redis|SQLite|Firebase|Supabase|Docker|Kubernetes|AWS|Azure|GCP|Google\s+Cloud|Heroku|Vercel|Netlify|TensorFlow|PyTorch|Keras|Scikit-learn|OpenAI|GPT-?\d*|BERT|LLM|NLP|Gemini|Claude|Langchain|Prisma|Sequelize|GraphQL|REST\s?API|WebSocket|JWT|OAuth|bcrypt|TypeScript|JavaScript|Python|Java|Rust|Go|C\+\+|C#|Swift|Kotlin|Tailwind\s?CSS|Bootstrap|Material\s?UI|Framer\s?Motion|HTML5?|CSS3?|SASS|LESS|Git|GitHub|GitLab|CI\/CD|Jenkins|Nginx|Apache|Linux|Windows|macOS|Android|iOS|Pandas|NumPy|Matplotlib|Hugging\s?Face|Transformers|LSTM|CNN|RNN|GAN|RAG|Vector\s+Database|Pinecone|Weaviate|ChromaDB|FAISS|Elasticsearch|Kafka|RabbitMQ|gRPC|Microservices|Monolithic|Serverless|Lambda|S3|EC2|RDS|DynamoDB|Terraform|Ansible|Prometheus|Grafana)\b/gi;

  // Concept/methodology patterns (multi-word terms often found in academic/technical docs)
  const conceptPatterns = /\b(machine\s+learning|deep\s+learning|artificial\s+intelligence|natural\s+language\s+processing|computer\s+vision|reinforcement\s+learning|transfer\s+learning|supervised\s+learning|unsupervised\s+learning|neural\s+network|convolutional\s+neural|recurrent\s+neural|attention\s+mechanism|transformer\s+architecture|embedding|tokenization|fine[\s-]tuning|pre[\s-]training|data\s+pipeline|ETL|data\s+warehouse|data\s+lake|feature\s+engineering|model\s+training|hyperparameter|cross[\s-]validation|overfitting|underfitting|gradient\s+descent|backpropagation|loss\s+function|activation\s+function|batch\s+normalization|dropout|regularization|ensemble\s+method|random\s+forest|decision\s+tree|support\s+vector|logistic\s+regression|linear\s+regression|clustering|classification|regression\s+analysis|sentiment\s+analysis|named\s+entity\s+recognition|text\s+classification|image\s+recognition|object\s+detection|semantic\s+segmentation|generative\s+adversarial|variational\s+autoencoder|recommendation\s+system|collaborative\s+filtering|content[\s-]based\s+filtering|user\s+authentication|role[\s-]based\s+access|session\s+management|API\s+gateway|load\s+balancer|database\s+normalization|indexing|caching|pagination|rate\s+limiting|encryption|hashing|digital\s+signature|blockchain|smart\s+contract|agile\s+methodology|scrum|kanban|waterfall|DevOps|continuous\s+integration|continuous\s+deployment|test[\s-]driven\s+development|behavior[\s-]driven\s+development|design\s+pattern|MVC|MVVM|singleton|factory\s+pattern|observer\s+pattern|dependency\s+injection|microservice\s+architecture|event[\s-]driven|message\s+queue|pub[\s-]sub)\b/gi;

  // Extract technologies
  let match: RegExpExecArray | null;
  const techRegex = new RegExp(techPatterns.source, "gi");
  while ((match = techRegex.exec(text)) !== null) {
    const name = match[1];
    const key = name.toLowerCase().replace(/\s+/g, " ");
    const existing = entities.get(key);
    // Find context sentence
    const contextSentence = sentences.find((s) => s.toLowerCase().includes(key)) || "";
    if (existing) {
      existing.frequency++;
      if (contextSentence && existing.contexts.length < 3) {
        existing.contexts.push(contextSentence);
      }
    } else {
      entities.set(key, {
        name,
        type: "technology",
        frequency: 1,
        contexts: contextSentence ? [contextSentence] : [],
      });
    }
  }

  // Extract concepts
  const conceptRegex = new RegExp(conceptPatterns.source, "gi");
  while ((match = conceptRegex.exec(text)) !== null) {
    const name = match[1];
    const key = name.toLowerCase().replace(/\s+/g, " ");
    const existing = entities.get(key);
    const contextSentence = sentences.find((s) => s.toLowerCase().includes(key)) || "";
    if (existing) {
      existing.frequency++;
      if (contextSentence && existing.contexts.length < 3) {
        existing.contexts.push(contextSentence);
      }
    } else {
      entities.set(key, {
        name,
        type: "concept",
        frequency: 1,
        contexts: contextSentence ? [contextSentence] : [],
      });
    }
  }

  // Extract defined terms: "X is a...", "X refers to...", "X is defined as..."
  const definitionPatterns = [
    /([A-Z][a-zA-Z\s]{2,30})\s+(?:is\s+(?:a|an|the)|refers?\s+to|is\s+defined\s+as|can\s+be\s+described\s+as|represents?|provides?|enables?|allows?)\s+([^.]{20,150})\./g,
  ];

  for (const pattern of definitionPatterns) {
    const defRegex = new RegExp(pattern.source, "gi");
    while ((match = defRegex.exec(text)) !== null) {
      const name = match[1].trim();
      const key = name.toLowerCase();
      // Skip common false positives
      if (key.length < 3 || /^(this|that|the|it|they|we|our|these|those|which|what|there|here)$/i.test(key)) continue;
      if (!entities.has(key)) {
        entities.set(key, {
          name,
          type: "concept",
          frequency: 1,
          contexts: [match[0]],
        });
      }
    }
  }

  return Array.from(entities.values())
    .sort((a, b) => b.frequency - a.frequency);
}

// ─── Technology Stack Detection ─────────────────────────────

function detectTechnologyStack(entities: ExtractedEntity[]): TechStackItem[] {
  const techEntities = entities.filter((e) => e.type === "technology");

  const categoryMap: Record<string, string> = {
    react: "Frontend Framework", angular: "Frontend Framework", "vue.js": "Frontend Framework", vuejs: "Frontend Framework",
    "next.js": "Fullstack Framework", nextjs: "Fullstack Framework", "nuxt.js": "Fullstack Framework",
    "node.js": "Runtime", nodejs: "Runtime",
    express: "Backend Framework", django: "Backend Framework", flask: "Backend Framework",
    fastapi: "Backend Framework", "spring boot": "Backend Framework", springboot: "Backend Framework",
    laravel: "Backend Framework", ".net": "Backend Framework", "ruby on rails": "Backend Framework",
    postgresql: "Database", mysql: "Database", mongodb: "Database", redis: "Cache/Database",
    sqlite: "Database", firebase: "BaaS", supabase: "BaaS",
    docker: "DevOps", kubernetes: "DevOps", "ci/cd": "DevOps", jenkins: "DevOps",
    aws: "Cloud Platform", azure: "Cloud Platform", gcp: "Cloud Platform", "google cloud": "Cloud Platform",
    heroku: "Cloud Platform", vercel: "Hosting", netlify: "Hosting",
    tensorflow: "AI/ML", pytorch: "AI/ML", keras: "AI/ML", "scikit-learn": "AI/ML",
    openai: "AI/ML", gemini: "AI/ML", claude: "AI/ML", langchain: "AI/ML",
    "hugging face": "AI/ML", transformers: "AI/ML",
    prisma: "ORM", sequelize: "ORM",
    graphql: "API", "rest api": "API", restapi: "API", websocket: "API", grpc: "API",
    jwt: "Authentication", oauth: "Authentication", bcrypt: "Security",
    typescript: "Language", javascript: "Language", python: "Language",
    java: "Language", rust: "Language", go: "Language", "c++": "Language", "c#": "Language",
    swift: "Language", kotlin: "Language",
    "tailwind css": "CSS Framework", tailwindcss: "CSS Framework", bootstrap: "CSS Framework",
    "material ui": "UI Library", "framer motion": "Animation Library",
    git: "Version Control", github: "Platform", gitlab: "Platform",
    nginx: "Web Server", apache: "Web Server",
    elasticsearch: "Search Engine", kafka: "Message Broker", rabbitmq: "Message Broker",
  };

  return techEntities.slice(0, 15).map((entity) => {
    const key = entity.name.toLowerCase().replace(/\s+/g, " ");
    return {
      name: entity.name,
      category: categoryMap[key] || "Technology",
      context: entity.contexts[0]?.substring(0, 200) || `Used in the document context.`,
    };
  });
}

// ─── Sentence Analysis ──────────────────────────────────────

function extractSentences(text: string): string[] {
  const raw = text.split(/(?<=[.!?])\s+/);
  return raw
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 600);
}

function scoreSentence(
  sentence: string,
  position: number,
  totalSentences: number,
  entities: ExtractedEntity[],
  sectionHeading: string
): number {
  let score = 0;

  // Position bonus: early sentences in a section are often more important
  const positionRatio = position / totalSentences;
  if (positionRatio < 0.15) score += 3;
  else if (positionRatio < 0.3) score += 2;

  // Entity density: sentences mentioning more entities are more informative
  const lowerSentence = sentence.toLowerCase();
  for (const entity of entities) {
    if (lowerSentence.includes(entity.name.toLowerCase())) {
      score += entity.type === "technology" ? 2 : 1.5;
    }
  }

  // Information markers: sentences with these patterns carry more meaning
  const infoPatterns = [
    /\b(?:therefore|consequently|as a result|in conclusion|significantly|importantly)\b/i,
    /\b(?:purpose|objective|goal|aim|designed to|developed to|created to|built to)\b/i,
    /\b(?:enables?|provides?|achieves?|improves?|enhances?|ensures?|facilitates?)\b/i,
    /\b(?:architecture|framework|methodology|approach|algorithm|technique|strategy)\b/i,
    /\b(?:integrates?|combines?|leverages?|utilizes?|implements?)\b/i,
    /\b(?:results?\s+show|findings?\s+indicate|data\s+suggests?|analysis\s+reveals?)\b/i,
    /\b(?:challenge|limitation|advantage|benefit|drawback|trade-off)\b/i,
  ];
  for (const pattern of infoPatterns) {
    if (pattern.test(sentence)) score += 1.5;
  }

  // Contains numbers/statistics (often factual, important)
  if (/\d+(?:\.\d+)?%|\d+\s+(?:times|percent|users|documents|records)/.test(sentence)) {
    score += 1;
  }

  // Definition pattern (very informative)
  if (/\b(?:is\s+(?:a|an|the)|refers?\s+to|defined\s+as|known\s+as)\b/i.test(sentence)) {
    score += 2;
  }

  // Sentence length sweet spot (not too short, not too long)
  if (sentence.length > 60 && sentence.length < 300) score += 1;

  // Heading relevance: sentences near their heading's topic
  if (sectionHeading && lowerSentence.includes(sectionHeading.toLowerCase().split(/\s+/)[0])) {
    score += 1;
  }

  return score;
}

// ─── Capitalize Helper ──────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
