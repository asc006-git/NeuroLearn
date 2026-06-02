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
  type: "MCQ" | "FillBlank" | "TrueFalse" | "Match" | "ShortAnswer" | "Scenario" | "Concept" | "Application";
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  whyCorrectIsCorrect?: string;
  topic?: string;
  learningObjective?: string;
  wrongOptionExplanations?: Record<string, string>;
  // For Match type
  matchPairs?: { left: string; right: string }[];
  // For Scenario type
  scenario?: string;
  // For Concept type
  conceptName?: string;
  // For Application type
  context?: string;
}

export interface SummaryResult {
  title: string;
  documentType: string;
  projectObjective: string;
  keyFindings: string[];
  architecture: string;
  methodology: string;
  results: string;
  conclusion: string;
  executiveBrief: string;
  detailedSummary: string;
  keyInsights: string[];
  keyTakeaways: string[];
  concepts: ConceptItem[];
  definitions: { term: string; definition: string }[];
  facts: string[];
  formulas: { name: string; formula: string; description: string }[];
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

// ─── Local Summary Generation (Intelligent Extractive) ──────

function generateLocalSummary(text: string, filename: string): SummaryResult {
  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  const sections = detectHeadingsAndSections(text);
  const allSentences = extractSentences(text);
  const entities = extractKeyEntities(text, allSentences);
  const documentType = detectDocumentType(text, sections);
  const techStack = detectTechnologyStack(entities);

  // ── Executive Brief: Build from top-scored sentences across sections ──
  const scoredSentences: { text: string; score: number; section: string }[] = [];

  for (const section of sections) {
    const sectionSentences = extractSentences(section.content);
    sectionSentences.forEach((s, i) => {
      const score = scoreSentence(s, i, sectionSentences.length, entities, section.heading);
      scoredSentences.push({ text: s, score, section: section.heading });
    });
  }

  // If no sections found, score all sentences
  if (scoredSentences.length === 0) {
    allSentences.forEach((s, i) => {
      const score = scoreSentence(s, i, allSentences.length, entities, "");
      scoredSentences.push({ text: s, score, section: "General" });
    });
  }

  scoredSentences.sort((a, b) => b.score - a.score);

  // Build a coherent multi-paragraph executive brief
  const topSentences = scoredSentences.slice(0, 15);
  const briefParagraphs: string[] = [];

  // Opening paragraph: What is this document about
  const techNames = techStack.slice(0, 5).map((t) => t.name);
  const conceptEntities = entities.filter((e) => e.type === "concept").slice(0, 5);
  const conceptNames = conceptEntities.map((e) => capitalize(e.name));

  let openingContext = `This ${documentType.toLowerCase()} presents`;
  if (techNames.length > 0 || conceptNames.length > 0) {
    const topics = [...conceptNames.slice(0, 3), ...techNames.slice(0, 2)].filter(Boolean);
    openingContext += ` a comprehensive exploration of ${topics.join(", ")}`;
  } else {
    openingContext += ` "${cleanName}"`;
  }

  const purposeSentences = topSentences.filter((s) =>
    /\b(?:purpose|objective|goal|aim|designed|developed|focuses|presents|proposes|introduces)\b/i.test(s.text)
  );
  const intro = purposeSentences.length > 0
    ? `${openingContext}. ${purposeSentences[0].text}`
    : `${openingContext}. ${topSentences[0]?.text || "The material covers multiple significant topics within its domain."}`;
  briefParagraphs.push(intro);

  // Middle paragraphs: Core methodologies and findings
  const methodSentences = topSentences.filter((s) =>
    /\b(?:method|approach|architecture|implement|framework|technique|algorithm|process|pipeline|workflow)\b/i.test(s.text) &&
    !purposeSentences.includes(s)
  );
  if (methodSentences.length > 0) {
    const methodParagraph = methodSentences.slice(0, 3).map((s) => s.text).join(" ");
    briefParagraphs.push(`The methodology and architecture described in the document include several key components. ${methodParagraph}`);
  }

  // Results/findings paragraph
  const resultSentences = topSentences.filter((s) =>
    /\b(?:result|finding|achieve|demonstrate|show|improve|enhance|effective|successful|performance|outcome)\b/i.test(s.text) &&
    !purposeSentences.includes(s) && !methodSentences.includes(s)
  );
  if (resultSentences.length > 0) {
    const resultParagraph = resultSentences.slice(0, 3).map((s) => s.text).join(" ");
    briefParagraphs.push(`Key findings and outcomes presented include: ${resultParagraph}`);
  }

  // Technology paragraph
  if (techStack.length > 0) {
    const techSummary = techStack.slice(0, 8).map((t) => `${t.name} (${t.category})`).join(", ");
    briefParagraphs.push(`The technology ecosystem discussed encompasses: ${techSummary}. These technologies form the backbone of the system's architecture and implementation.`);
  }

  // Fill remaining with high-scoring unique sentences
  const usedTexts = new Set(briefParagraphs.join(" ").split(". ").map((s) => s.trim()));
  const remainingSentences = topSentences.filter(
    (s) => !usedTexts.has(s.text.trim()) && !purposeSentences.includes(s) && !methodSentences.includes(s) && !resultSentences.includes(s)
  );
  if (remainingSentences.length > 0 && briefParagraphs.length < 5) {
    briefParagraphs.push(`Additional significant elements include: ${remainingSentences.slice(0, 3).map((s) => s.text).join(" ")}`);
  }

  const executiveBrief = briefParagraphs.join("\n\n");

  // ── Key Insights ──
  const keyInsights: string[] = [];

  // Extract from purpose-driven sentences
  const insightSentences = scoredSentences
    .filter((s) => s.score >= 3)
    .slice(0, 10);

  for (const s of insightSentences) {
    // Trim to a clean bullet point
    const insight = s.text.length > 200 ? s.text.substring(0, 197) + "..." : s.text;
    if (!keyInsights.some((ki) => ki.includes(insight.substring(0, 50)))) {
      keyInsights.push(insight);
    }
    if (keyInsights.length >= 8) break;
  }

  // Add structural insights
  if (sections.length > 3) {
    keyInsights.push(`The document is structured into ${sections.length} major sections: ${sections.slice(0, 5).map((s) => s.heading).join(", ")}${sections.length > 5 ? ` and ${sections.length - 5} more` : ""}.`);
  }
  if (techStack.length > 0) {
    keyInsights.push(`${techStack.length} technologies/tools are referenced, spanning categories: ${[...new Set(techStack.map((t) => t.category))].join(", ")}.`);
  }

  // ── Core Concepts ──
  const concepts: ConceptItem[] = [];

  // From entities with context
  const topEntities = entities.filter((e) => e.contexts.length > 0).slice(0, 8);
  for (const entity of topEntities) {
    // Find a definition-like sentence
    const defSentence = entity.contexts.find((c) =>
      /\b(?:is\s+(?:a|an|the)|refers?\s+to|provides?|enables?|used\s+(?:to|for)|designed\s+to|responsible\s+for)\b/i.test(c)
    ) || entity.contexts[0];

    const explanation = defSentence.length > 250 ? defSentence.substring(0, 247) + "..." : defSentence;

    let importance = "";
    if (entity.type === "technology") {
      importance = `Core technology used in the system's ${techStack.find((t) => t.name.toLowerCase() === entity.name.toLowerCase())?.category?.toLowerCase() || "implementation"} layer.`;
    } else {
      importance = entity.frequency > 3
        ? `Fundamental concept referenced ${entity.frequency} times throughout the document, indicating central importance to the material.`
        : `Key concept that supports the document's core arguments and methodology.`;
    }

    concepts.push({
      name: capitalize(entity.name),
      explanation,
      importance,
    });

    if (concepts.length >= 6) break;
  }

  // If we found fewer than 3 concepts, extract from definition patterns in text
  if (concepts.length < 3) {
    const defPattern = /([A-Z][a-zA-Z\s]{2,25})\s+(?:is\s+(?:a|an)\s+)([^.]{20,150})\./g;
    let defMatch: RegExpExecArray | null;
    const usedNames = new Set(concepts.map((c) => c.name.toLowerCase()));
    while ((defMatch = defPattern.exec(text)) !== null && concepts.length < 5) {
      const name = defMatch[1].trim();
      if (usedNames.has(name.toLowerCase())) continue;
      if (/^(this|that|the|it|there|which)\b/i.test(name)) continue;
      usedNames.add(name.toLowerCase());
      concepts.push({
        name,
        explanation: `${name} is a ${defMatch[2].trim()}.`,
        importance: "Defined concept within the document's domain of study.",
      });
    }
  }

  // ── Key Takeaways ──
  const keyTakeaways = keyInsights.slice(0, 5).map((insight) =>
    insight.length > 120 ? insight.substring(0, 117) + "..." : insight
  );

  // ── Detailed Summary ──
  const topBriefSentences = scoredSentences.slice(0, 25)
    .filter((s) => s.score >= 2)
    .map((s) => s.text);
  const detailedSummary = topBriefSentences.length > 0
    ? `This document provides a comprehensive exploration of its subject matter, organized into ${sections.length} major sections. ${topBriefSentences.slice(0, 8).join(" ")}\n\n${topBriefSentences.length > 8 ? topBriefSentences.slice(8, 16).join(" ") : ""}\n\n${topBriefSentences.length > 16 ? topBriefSentences.slice(16).join(" ") : ""}`
    : executiveBrief;

  // ── Definitions ──
  const definitions: { term: string; definition: string }[] = [];
  const defPatternGlobal = /([A-Z][a-zA-Z\s]{2,30})\s+(?:is\s+(?:a|an|the)|refers?\s+to|is\s+defined\s+as|can\s+be\s+described\s+as|represents?|means)\s+([^.]{10,200})\./gi;
  let defMatch: RegExpExecArray | null;
  const usedTerms = new Set<string>();
  while ((defMatch = defPatternGlobal.exec(text)) !== null && definitions.length < 10) {
    const term = defMatch[1].trim();
    const def = defMatch[2].trim();
    const key = term.toLowerCase();
    if (!usedTerms.has(key) && term.length > 2 && def.length > 15) {
      usedTerms.add(key);
      definitions.push({ term, definition: def });
    }
  }
  for (const entity of entities.slice(0, 5)) {
    const defCtx = entity.contexts.find((c) =>
      /\b(?:is\s+(?:a|an|the)|refers?\s+to|provides?|enables?|used\s+(?:to|for))\b/i.test(c)
    );
    if (defCtx && !usedTerms.has(entity.name.toLowerCase()) && definitions.length < 10) {
      usedTerms.add(entity.name.toLowerCase());
      definitions.push({
        term: capitalize(entity.name),
        definition: defCtx.length > 200 ? defCtx.substring(0, 197) + "..." : defCtx,
      });
    }
  }

  // ── Facts ──
  const facts: string[] = [];
  const factCandidates = scoredSentences
    .filter((s) => s.score >= 3.5 && /\d/.test(s.text))
    .slice(0, 8);
  for (const fs of factCandidates) {
    const clean = fs.text.length > 180 ? fs.text.substring(0, 177) + "..." : fs.text;
    if (!facts.some((f) => f.substring(0, 40) === clean.substring(0, 40))) {
      facts.push(clean);
    }
  }
  for (const entity of entities.slice(0, 3)) {
    if (entity.contexts.length > 0 && facts.length < 10) {
      const fact = `${capitalize(entity.name)}: ${entity.contexts[0].length > 150 ? entity.contexts[0].substring(0, 147) + "..." : entity.contexts[0]}`;
      if (!facts.some((f) => f.includes(entity.name))) {
        facts.push(fact);
      }
    }
  }

  // ── Formulas ──
  const formulas: { name: string; formula: string; description: string }[] = [];
  const formulaPatterns = [
    /([A-Za-z]+)\s*[=:]\s*[A-Za-z0-9_+\-*/().^\s=]+/g,
    /(?:equation|formula|expression)\s*(?:is|:)\s*([^.\n]{5,100})/gi,
  ];
  const usedFormulas = new Set<string>();
  for (const pattern of formulaPatterns) {
    const regex = new RegExp(pattern.source, "gi");
    let fm: RegExpExecArray | null;
    while ((fm = regex.exec(text)) !== null && formulas.length < 5) {
      const formulaText = fm[1] || fm[0];
      if (formulaText.length > 5 && formulaText.length < 100 && !usedFormulas.has(formulaText.substring(0, 20))) {
        usedFormulas.add(formulaText.substring(0, 20));
        formulas.push({
          name: `Formula ${formulas.length + 1}`,
          formula: formulaText.trim().substring(0, 80),
          description: `Mathematical relationship found in the document context.`,
        });
      }
    }
  }

  // ── Revision Notes ──
  const revisionPoints: string[] = [];
  // Definitions
  const definitionEntities = entities.filter((e) => e.contexts.some((c) => /\b(?:is\s+(?:a|an)|defined|means)\b/i.test(c)));
  for (const de of definitionEntities.slice(0, 5)) {
    const defCtx = de.contexts.find((c) => /\b(?:is\s+(?:a|an)|defined|means)\b/i.test(c));
    if (defCtx) revisionPoints.push(`• ${capitalize(de.name)}: ${defCtx.length > 150 ? defCtx.substring(0, 147) + "..." : defCtx}`);
  }
  // Key facts from high-scoring sentences
  const factSentences = scoredSentences
    .filter((s) => s.score >= 4 && !revisionPoints.some((rp) => rp.includes(s.text.substring(0, 30))))
    .slice(0, 5);
  for (const fs of factSentences) {
    revisionPoints.push(`• ${fs.text.length > 150 ? fs.text.substring(0, 147) + "..." : fs.text}`);
  }
  // Tech stack summary
  if (techStack.length > 0) {
    revisionPoints.push(`• Technology Stack: ${techStack.map((t) => t.name).join(", ")}`);
  }
  const revisionNotes = revisionPoints.length > 0
    ? `IMPORTANT REVISION POINTS:\n\n${revisionPoints.join("\n\n")}`
    : "No specific revision points could be extracted from this document.";

  // ── Chapter Summaries ──
  const chapterSummaries: ChapterSummary[] = [];
  for (const section of sections) {
    if (section.content.length < 50) continue;
    const sectionSentences = extractSentences(section.content);
    const topN = sectionSentences
      .map((s, i) => ({ text: s, score: scoreSentence(s, i, sectionSentences.length, entities, section.heading) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.text);

    chapterSummaries.push({
      heading: section.heading,
      summary: topN.join(" ") || section.content.substring(0, 300),
    });
  }

  // ── Project Objective ──
  let projectObjective = "";
  const objectiveSentences = scoredSentences.filter((s) =>
    /\b(?:objective|goal|purpose|aim|this\s+(?:paper|report|document|work|study|project)\s+(?:proposes|presents|introduces|aims|describes|explores|investigates|develops|designs|implements))(?:\s+(?:a|an|the|to|and|of))?/i.test(s.text)
  );
  if (objectiveSentences.length > 0) {
    projectObjective = objectiveSentences.slice(0, 3).map((s) => s.text).join(" ");
  } else {
    const introScored = scoredSentences.filter((s) => s.score >= 3).slice(0, 2);
    projectObjective = introScored.length > 0
      ? introScored.map((s) => s.text).join(" ")
      : `To analyze and synthesize the content of "${cleanName}" within the domain of ${documentType.toLowerCase()}.`;
  }

  // ── Key Findings ──
  const keyFindings: string[] = [];
  const findingSentences = scoredSentences.filter((s) =>
    /\b(?:findings?\s+(?:show|indicate|suggest|reveal|demonstrate)|results?\s+(?:show|indicate|suggest|reveal|demonstrate)|key\s+(?:findings?|results?)|we\s+(?:found|observed|noted|discovered)|the\s+(?:study|analysis|experiment)\s+(?:shows|reveals|demonstrates|indicates))\b/i.test(s.text)
  );
  for (const s of findingSentences.slice(0, 6)) {
    const finding = s.text.length > 200 ? s.text.substring(0, 197) + "..." : s.text;
    if (!keyFindings.some((kf) => kf.includes(finding.substring(0, 40)))) {
      keyFindings.push(finding);
    }
  }
  if (keyFindings.length === 0) {
    const highScore = scoredSentences.filter((s) => /\d+(?:%|percent|times|users)/.test(s.text)).slice(0, 4);
    for (const s of highScore) {
      const finding = s.text.length > 200 ? s.text.substring(0, 197) + "..." : s.text;
      if (!keyFindings.some((kf) => kf.includes(finding.substring(0, 40)))) {
        keyFindings.push(finding);
      }
    }
  }

  // ── Architecture ──
  let architecture = "";
  const archSection = sections.find((s) =>
    /\b(?:architecture|system\s*(?:design|architecture|overview)|technical\s*(?:architecture|design)|high.level\s*(?:design|architecture))\b/i.test(s.heading)
  );
  if (archSection && archSection.content.length > 50) {
    const archScored = extractSentences(archSection.content)
      .map((s, i) => ({ text: s, score: scoreSentence(s, i, 100, entities, archSection.heading) }))
      .sort((a, b) => b.score - a.score);
    architecture = archScored.slice(0, 4).map((s) => s.text).join(" ");
  } else {
    const archSentences = scoredSentences.filter((s) =>
      /\b(?:architecture|system\s+design|layers?|modules?|components?|pipeline|workflow|integration)\b/i.test(s.text)
    );
    if (archSentences.length > 0) {
      architecture = archSentences.slice(0, 3).map((s) => s.text).join(" ");
    } else {
      architecture = `The ${documentType.toLowerCase()} presents a structured approach to its subject matter.${techStack.length > 0 ? ` Core technologies include ${techStack.slice(0, 5).map((t) => t.name).join(", ")}.` : ""}`;
    }
  }

  // ── Methodology ──
  let methodology = "";
  const methodSection = sections.find((s) =>
    /\b(?:methodology|methods?|approach|implementation|procedure|process|technique|experimental\s+setup|research\s+design)\b/i.test(s.heading)
  );
  if (methodSection && methodSection.content.length > 50) {
    const methodScored = extractSentences(methodSection.content)
      .map((s, i) => ({ text: s, score: scoreSentence(s, i, 100, entities, methodSection.heading) }))
      .sort((a, b) => b.score - a.score);
    methodology = methodScored.slice(0, 4).map((s) => s.text).join(" ");
  } else {
    const methodSentences = scoredSentences.filter((s) =>
      /\b(?:methodology|approach|method|technique|framework|algorithm|process|pipeline|workflow|using|utilizing|leveraging)\b/i.test(s.text)
    );
    if (methodSentences.length > 0) {
      methodology = methodSentences.slice(0, 3).map((s) => s.text).join(" ");
    } else {
      methodology = `The ${documentType.toLowerCase()} employs a systematic approach combining ${concepts.slice(0, 3).map((c) => c.name).join(", ") || "multiple analytical methods"} to achieve its objectives.`;
    }
  }

  // ── Results ──
  let results = "";
  const resultSection = sections.find((s) =>
    /\b(?:results?|findings?|evaluation|experimental\s+results?|performance|outcomes?|analysis|discussion)\b/i.test(s.heading)
  );
  if (resultSection && resultSection.content.length > 50) {
    const resultScored = extractSentences(resultSection.content)
      .map((s, i) => ({ text: s, score: scoreSentence(s, i, 100, entities, resultSection.heading) }))
      .sort((a, b) => b.score - a.score);
    results = resultScored.slice(0, 4).map((s) => s.text).join(" ");
  } else {
    const resultSentences = scoredSentences.filter((s) =>
      /\b(?:result|finding|achieve|demonstrate|show|improve|enhance|effective|successful|performance|outcome|increase|decrease|reduce)\b/i.test(s.text) && /\d/.test(s.text)
    );
    if (resultSentences.length > 0) {
      results = resultSentences.slice(0, 4).map((s) => s.text).join(" ");
    } else {
      const topFactual = scoredSentences.filter((s) => s.score >= 4).slice(0, 3);
      results = topFactual.length > 0
        ? topFactual.map((s) => s.text).join(" ")
        : "The document presents substantive findings within its domain of study.";
    }
  }

  // ── Conclusion ──
  let conclusion = "";
  const concSection = sections.find((s) =>
    /\b(?:conclusion|summary|future\s+work|discussion|closing\s+remarks|final\s+thoughts|recommendations?)\b/i.test(s.heading)
  );
  if (concSection && concSection.content.length > 50) {
    const concScored = extractSentences(concSection.content)
      .map((s, i) => ({ text: s, score: scoreSentence(s, i, 100, entities, concSection.heading) }))
      .sort((a, b) => b.score - a.score);
    conclusion = concScored.slice(0, 3).map((s) => s.text).join(" ");
  } else {
    const concSentences = scoredSentences.filter((s) =>
      /\b(?:in\s+conclusion|to\s+summarize|overall|thus|therefore|consequently|this\s+(?:work|study|paper|project)\s+(?:demonstrates|provides|presents|contributes|offers))\b/i.test(s.text)
    );
    if (concSentences.length > 0) {
      conclusion = concSentences.slice(0, 3).map((s) => s.text).join(" ");
    } else {
      conclusion = `In summary, this ${documentType.toLowerCase()} provides a comprehensive exploration of ${cleanName}.${techStack.length > 0 ? ` The integration of ${techStack.slice(0, 3).map((t) => t.name).join(", ")} demonstrates a robust approach to the subject matter.` : ""} The findings contribute meaningful insights to the field.`;
    }
  }

  // ── Build title ──
  const title = `${documentType}: ${cleanName}`;

  return {
    title,
    documentType,
    projectObjective,
    keyFindings,
    architecture,
    methodology,
    results,
    conclusion,
    executiveBrief,
    detailedSummary,
    keyInsights,
    keyTakeaways,
    concepts,
    definitions,
    facts,
    formulas,
    technologyStack: techStack,
    revisionNotes,
    chapterSummaries,
  };
}

// ─── Local Quiz Generation (Contextual) ─────────────────────

function generateLocalQuiz(text: string, filename: string): QuizResult {
  const allSentences = extractSentences(text);
  const entities = extractKeyEntities(text, allSentences);
  const sections = detectHeadingsAndSections(text);
  const techStack = detectTechnologyStack(entities);
  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

  const questions: QuizQuestion[] = [];
  const usedContent = new Set<string>();
  let qId = 1;

  // ── MCQ Questions from entity contexts ──
  const conceptEntities = entities.filter((e) => e.contexts.length > 0).slice(0, 6);
  for (const entity of conceptEntities.slice(0, 3)) {
    const context = entity.contexts[0];
    if (!context || usedContent.has(context.substring(0, 50))) continue;
    usedContent.add(context.substring(0, 50));

    // Find what the entity does/is from context
    const purposeMatch = context.match(
      new RegExp(`${entity.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(?:is\\s+(?:used|designed|built|created)\\s+(?:to|for)|provides?|enables?|allows?|helps?)\\s+([^.]{10,100})`, "i")
    );
    const purpose = purposeMatch ? purposeMatch[1].trim() : null;

    if (purpose) {
      // Generate "Why is X used?" style question
      const wrongOptions = [
        `To replace all manual processes without any configuration`,
        `To handle unrelated data visualization tasks only`,
        `To serve as a temporary placeholder during development`,
      ];

      const correctAnswer = `To ${purpose}`;
      const allOptions = [correctAnswer, ...wrongOptions];
      shuffleArray(allOptions);

      const wrongExplanations: Record<string, string> = {};
      for (const wrong of wrongOptions) {
        wrongExplanations[wrong] = `This is incorrect. The document specifically states that ${entity.name} is used to ${purpose}, not for "${wrong.toLowerCase().replace(/^to\s+/, "")}".`;
      }

      questions.push({
        id: `q${qId++}`,
        type: "MCQ",
        difficulty: "Medium",
        question: `According to the document, what is the primary purpose of ${capitalize(entity.name)} in this context?`,
        options: allOptions,
        correctAnswer,
        explanation: `The document states: "${context.substring(0, 200)}${context.length > 200 ? "..." : ""}"`,
        whyCorrectIsCorrect: `${capitalize(entity.name)} is explicitly used for ${purpose} as described in the document context. This aligns with its core function and the system's overall architecture.`,
        topic: capitalize(entity.name),
        learningObjective: `Understand the purpose of ${entity.name} in the documented system`,
        wrongOptionExplanations: wrongExplanations,
      });
    } else {
      // "Which of the following is discussed" style
      const wrongEntities = entities
        .filter((e) => e.name.toLowerCase() !== entity.name.toLowerCase())
        .slice(-3)
        .map((e) => capitalize(e.name));

      // Add plausible-sounding wrong options if we don't have enough
      const fillers = ["Quantum Computing Architecture", "Distributed Ledger Technology", "Neural Pathway Optimization", "Autonomous System Integration"];
      while (wrongEntities.length < 3) {
        const filler = fillers[wrongEntities.length];
        if (filler) wrongEntities.push(filler);
      }

      const correctAnswer = capitalize(entity.name);
      const allOptions = [correctAnswer, ...wrongEntities.slice(0, 3)];
      shuffleArray(allOptions);

      const wrongExplanations: Record<string, string> = {};
      for (const wrong of wrongEntities.slice(0, 3)) {
        wrongExplanations[wrong] = `"${wrong}" is not a primary concept discussed in this context of the document.`;
      }

      questions.push({
        id: `q${qId++}`,
        type: "MCQ",
        difficulty: "Easy",
        question: `Which of the following concepts is discussed in relation to: "${context.substring(0, 120)}..."?`,
        options: allOptions,
        correctAnswer,
        explanation: `${capitalize(entity.name)} is explicitly mentioned in the document. Context: "${context.substring(0, 200)}${context.length > 200 ? "..." : ""}"`,
        whyCorrectIsCorrect: `${capitalize(entity.name)} is the concept directly referenced in the provided context from the document. The other options are not mentioned in this specific context.`,
        topic: "Document Concepts",
        learningObjective: "Identify key concepts discussed in the document",
        wrongOptionExplanations: wrongExplanations,
      });
    }

    if (questions.filter((q) => q.type === "MCQ").length >= 3) break;
  }

  // ── True/False Questions ──
  const factualSentences = allSentences.filter((s) =>
    /\b(?:is\s+(?:a|an|the)|uses?|provides?|supports?|enables?|includes?|contains?|requires?)\b/i.test(s) &&
    s.length > 40 && s.length < 250
  );

  for (const sentence of factualSentences.slice(0, 2)) {
    if (usedContent.has(sentence.substring(0, 50))) continue;
    usedContent.add(sentence.substring(0, 50));

    const isTrue = Math.random() > 0.4; // Bias toward true statements

    if (isTrue) {
      questions.push({
        id: `q${qId++}`,
        type: "TrueFalse",
        difficulty: "Easy",
        question: `True or False: ${sentence}`,
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: `This statement is TRUE. The document explicitly states: "${sentence}"`,
        topic: "Factual Understanding",
        learningObjective: "Verify understanding of factual statements from the document",
      });
    } else {
      // Create a false statement by negating or altering the original
      const falsified = negateSentence(sentence);
      questions.push({
        id: `q${qId++}`,
        type: "TrueFalse",
        difficulty: "Medium",
        question: `True or False: ${falsified}`,
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: `This statement is FALSE. The document actually states: "${sentence}"`,
        topic: "Factual Understanding",
        learningObjective: "Distinguish true statements from false ones based on document content",
      });
    }
  }

  // ── Fill in the Blanks ──
  const defSentences = allSentences.filter((s) =>
    /\b(?:is\s+(?:a|an|the)|defined\s+as|known\s+as|refers?\s+to)\b/i.test(s)
  );

  for (const sentence of defSentences.slice(0, 2)) {
    if (usedContent.has(sentence.substring(0, 50))) continue;
    usedContent.add(sentence.substring(0, 50));

    // Find a key term to blank out
    const entityInSentence = entities.find((e) =>
      sentence.toLowerCase().includes(e.name.toLowerCase()) && e.name.length > 2
    );

    if (entityInSentence) {
      const blanked = sentence.replace(
        new RegExp(entityInSentence.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        "________"
      );

      questions.push({
        id: `q${qId++}`,
        type: "FillBlank",
        difficulty: "Medium",
        question: `Fill in the blank: ${blanked}`,
        correctAnswer: entityInSentence.name,
        explanation: `The complete sentence reads: "${sentence}"`,
        topic: "Terminology",
        learningObjective: "Recall key terminology from the document",
      });
    }
  }

  // ── Short Answer Questions ──
  if (techStack.length > 0) {
    const techNames = techStack.slice(0, 5).map((t) => t.name);
    questions.push({
      id: `q${qId++}`,
      type: "ShortAnswer",
      difficulty: "Medium",
      question: `List at least 3 technologies or tools mentioned in "${cleanName}" and briefly describe their role.`,
      correctAnswer: techStack.slice(0, 5).map((t) => `${t.name} — ${t.category}: ${t.context.substring(0, 80)}`).join("; "),
      explanation: `The document references the following technologies: ${techNames.join(", ")}. Each plays a specific role in the system described.`,
      topic: "Knowledge Transfer",
      learningObjective: "Synthesize information from the document into a concise list",
    });
  }

  // ── Scenario-based Questions ──
  const scenarioSection = sections.find((s) =>
    /\b(?:implementation|architecture|methodology|system\s+design|approach)\b/i.test(s.heading)
  );
  if (scenarioSection && scenarioSection.content.length > 100) {
    const scenarioSentences = extractSentences(scenarioSection.content).slice(0, 3);
    const scenarioText = scenarioSentences.join(" ");
    if (scenarioText.length > 50) {
      const entityForScenario = entities.find((e) => scenarioText.toLowerCase().includes(e.name.toLowerCase()));
      const scenarioTopic = entityForScenario ? entityForScenario.name : scenarioSection.heading;

      questions.push({
        id: `q${qId++}`,
        type: "Scenario",
        difficulty: "Hard",
        scenario: `Consider a scenario where you need to implement a system similar to what is described in the "${scenarioSection.heading}" section. ${scenarioText.substring(0, 300)}`,
        question: `Based on the approach described in the document, what would be the most critical component or step when implementing ${scenarioTopic}? Explain why.`,
        correctAnswer: `The document emphasizes: ${scenarioSentences[0] || "the systematic approach described in the methodology section"}. This is critical because it forms the foundation of the implementation described.`,
        explanation: `The "${scenarioSection.heading}" section describes: ${scenarioText.substring(0, 250)}. Understanding this is key to applying the document's methodology.`,
        topic: "Practical Application",
        learningObjective: "Apply document concepts to a real-world implementation scenario",
      });
    }
  }

  // ── Concept Question (if key entities exist) ──
  const primaryEntity = entities[0];
  if (primaryEntity && primaryEntity.contexts.length > 0) {
    const conceptContext = primaryEntity.contexts[0];
    questions.push({
      id: `q${qId++}`,
      type: "Concept",
      difficulty: "Medium",
      question: `Explain the concept of ${capitalize(primaryEntity.name)} as described in the document. What role does it play and why is it important?`,
      correctAnswer: `${capitalize(primaryEntity.name)} is described as: ${conceptContext.substring(0, 300)}`,
      explanation: `This concept is central to understanding the document because: ${conceptContext.substring(0, 200)}`,
      conceptName: capitalize(primaryEntity.name),
      topic: "Core Concepts",
      learningObjective: "Demonstrate understanding of a key concept from the document",
    });
  }

  // ── Application Question (if sections with methodology exist) ──
  const appSection = sections.find((s) =>
    /\b(?:methodology|implementation|design|approach|architecture|how\s+to|guide)\b/i.test(s.heading)
  );
  if (appSection && appSection.content.length > 100) {
    const appSentences = extractSentences(appSection.content).slice(0, 4);
    const appText = appSentences.join(" ");
    const appEntity = entities.find((e) => appText.toLowerCase().includes(e.name.toLowerCase()));
    const applicationTopic = appEntity ? appEntity.name : "the described methodology";

    questions.push({
      id: `q${qId++}`,
      type: "Application",
      difficulty: "Hard",
      question: `Based on the "${appSection.heading}" section, how would you apply the ${applicationTopic} approach to a new project with different requirements? What key principles would you adapt?`,
      context: `A new project is starting with different constraints than what is described in the document. The core principles from "${appSection.heading}" still apply, but the implementation details may need adjustment.`,
      correctAnswer: `Key principles to adapt from the document's approach: ${appSentences.slice(0, 2).join(" ")}. These should be tailored to the new context while maintaining the fundamental methodology.`,
      explanation: `${appText.substring(0, 250)}. The application of these principles to new contexts is a key skill derived from understanding the document.`,
      topic: "Knowledge Transfer",
      learningObjective: "Apply learned concepts to solve problems in new contexts",
    });
  }

  // ── Match the Following (if enough entities) ──
  if (techStack.length >= 3) {
    const matchPairs = techStack.slice(0, 5).map((t) => ({
      left: t.name,
      right: t.category,
    }));

    questions.push({
      id: `q${qId++}`,
      type: "Match",
      difficulty: "Easy",
      question: `Match the following technologies mentioned in the document with their categories:`,
      matchPairs,
      correctAnswer: matchPairs.map((p) => `${p.left} → ${p.right}`).join(", "),
      explanation: `These technologies are used in the system described in "${cleanName}": ${matchPairs.map((p) => `${p.left} serves as the ${p.right.toLowerCase()}`).join("; ")}.`,
      topic: "Concept Mapping",
      learningObjective: "Associate technologies with their correct categories",
    });
  }

  // Ensure minimum questions
  if (questions.length < 3) {
    // Add a general comprehension MCQ
    const topSentence = allSentences[0] || "the primary subject matter";
    const mainEntity = entities[0];
    const mainTopic = mainEntity ? capitalize(mainEntity.name) : cleanName;

    questions.push({
        id: `q${qId++}`,
        type: "MCQ",
        difficulty: "Easy",
        question: `What is the primary focus of "${cleanName}"?`,
        options: [
          `${mainTopic} and its applications in the described context`,
          "An unrelated historical analysis with no practical applications",
          "Abstract theoretical proofs without implementation details",
          "Random data collection without structured analysis",
        ],
        correctAnswer: `${mainTopic} and its applications in the described context`,
        explanation: `The document primarily focuses on ${mainTopic}, as evidenced by: "${topSentence.substring(0, 150)}..."`,
        whyCorrectIsCorrect: `The document's content revolves around ${mainTopic} and its practical applications, as shown by the key entities, concepts, and methodologies discussed throughout.`,
        topic: "Overall Comprehension",
        learningObjective: "Identify the primary focus of the document",
        wrongOptionExplanations: {
          "An unrelated historical analysis with no practical applications": "The document focuses on practical, applied content rather than historical analysis.",
          "Abstract theoretical proofs without implementation details": "The document contains concrete implementation details and practical methodology.",
          "Random data collection without structured analysis": "The document presents structured, organized analysis of its subject matter.",
        },
      });
  }

  // Collect all question types used
  const questionTypes = [...new Set(questions.map((q) => q.type))];

  return {
    questions,
    difficulty: "balanced",
    questionTypes,
  };
}

// ─── Helper: Shuffle Array ──────────────────────────────────

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ─── Helper: Negate a sentence for True/False ───────────────

function negateSentence(sentence: string): string {
  // Simple negation strategies
  const replacements: [RegExp, string][] = [
    [/\bis used\b/i, "is not used"],
    [/\bprovides\b/i, "does not provide"],
    [/\benables\b/i, "does not enable"],
    [/\bsupports\b/i, "does not support"],
    [/\bincludes\b/i, "excludes"],
    [/\brequires\b/i, "does not require"],
    [/\bcan\b/i, "cannot"],
    [/\bis a\b/i, "is not a"],
    [/\bare\b/i, "are not"],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(sentence)) {
      return sentence.replace(pattern, replacement);
    }
  }

  // Fallback: swap key terms
  return sentence.replace(/\b(first|primary|main|key|important)\b/i, "least important");
}

// ─── Gemini API Integration (Enhanced) ──────────────────────

async function tryGeminiSummary(text: string, filename: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;

  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  // Gemini Flash supports 1M tokens, send more context
  const truncatedText = text.substring(0, 30000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert document analyst producing human-quality intelligence briefings — like a senior reviewer synthesizing a complex document for an executive audience. Analyze the following document with deep comprehension and produce a comprehensive JSON response.

CRITICAL QUALITY STANDARDS:
- Write like a human expert reviewer, NOT like a keyword extractor
- Every field must contain fluent, coherent, analytical prose — NEVER lists of keywords
- Connect ideas across sections to show deep understanding
- Be specific: reference actual technologies, numbers, names, and concepts from the text
- The executiveBrief should read like a consulting firm's analysis: insightful, structured, and valuable without reading the source

REQUIREMENTS:
1. Detect the document type (Research Paper, Project Report, Notes, Technical Document, Book Chapter, or Study Material)
2. Extract the PROJECT OBJECTIVE: What is this document trying to achieve? What problem does it solve? (2-4 sentences)
3. Extract KEY FINDINGS: 3-6 specific findings or discoveries presented in the document (each as a short paragraph)
4. Extract ARCHITECTURE: Describe the system architecture, structure, or organizational framework (2-4 sentences)
5. Extract METHODOLOGY: Describe the approach, methods, processes, or techniques used (2-4 sentences)
6. Extract RESULTS: What outcomes, performance metrics, or concrete results are reported? (2-4 sentences)
7. Extract CONCLUSION: What does the document conclude? What are the implications? (2-4 sentences)
8. Generate an EXECUTIVE BRIEF: 5-10 paragraphs of professional, analytical summary covering purpose, architecture, methodology, findings, technologies, and conclusions — like a McKinsey or Gartner analyst report
9. Generate DETAILED SUMMARY: 10-15 paragraphs of expanded analysis with deeper technical and contextual insights
10. Extract 5-10 KEY INSIGHTS as insightful bullet points (each 1-3 sentences, showing understanding)
11. Extract 3-5 KEY TAKEAWAYS as concise, actionable bullet points
12. Identify 4-6 CORE CONCEPTS with name, clear explanation (what it is, how it works), and importance (why it matters in this document)
13. Extract 5-10 IMPORTANT DEFINITIONS (term + clear definition pairs)
14. Extract 3-6 FACTUAL STATEMENTS from the document
15. Extract any FORMULAS, equations, or mathematical relationships
16. Detect all technologies, frameworks, databases, APIs, and tools mentioned
17. Generate exam-oriented REVISION NOTES with key definitions, facts, and important points
18. If the document has clear sections/chapters, summarize each one

Example of executiveBrief quality:
"This document presents an AI-Powered Content Simplifier and Interactive Learning Assistant developed to transform lengthy educational PDFs into structured learning material. The system integrates secure authentication, document processing, AI summarization, intelligent quiz generation, PostgreSQL storage, and interactive dashboards. The architecture follows a modular pipeline pattern where each stage — upload, parse, summarize, quiz — operates independently yet feeds into the next..."

Respond with ONLY raw JSON (no markdown fences), in this exact structure:
{
  "title": "${cleanName}",
  "documentType": "Research Paper|Project Report|Notes|Technical Document|Book Chapter|Study Material",
  "projectObjective": "2-4 sentences describing the core objective...",
  "keyFindings": ["Finding 1 with specific details...", "Finding 2 with specific details...", ...],
  "architecture": "2-4 sentences describing system architecture or document structure...",
  "methodology": "2-4 sentences describing the approach or methods...",
  "results": "2-4 sentences describing outcomes or findings...",
  "conclusion": "2-4 sentences summarizing conclusions and implications...",
  "executiveBrief": "5-10 paragraphs of professional analytical writing...",
  "detailedSummary": "10-15 paragraphs of expanded analysis...",
  "keyInsights": ["insight 1", "insight 2", ...],
  "keyTakeaways": ["takeaway 1", "takeaway 2", ...],
  "concepts": [
    {"name": "Concept Name", "explanation": "Clear explanation of what it is and how it works...", "importance": "Why this concept matters in the document..."}
  ],
  "definitions": [
    {"term": "Term Name", "definition": "Clear definition..."}
  ],
  "facts": ["Factual statement 1", "Factual statement 2", ...],
  "formulas": [
    {"name": "Formula Name", "formula": "E=mc^2", "description": "What this formula represents..."}
  ],
  "technologyStack": [
    {"name": "Technology Name", "category": "Framework|Database|API|Language|AI/ML|Tool|Library", "context": "How it's used in the document..."}
  ],
  "revisionNotes": "Formatted exam-oriented notes with key definitions, facts, and important points...",
  "chapterSummaries": [
    {"heading": "Section Name", "summary": "Condensed summary of this section..."}
  ]
}

Document text:
${truncatedText}`
          }]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;

    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.executiveBrief || !parsed.concepts) return null;

    return {
      title: parsed.title || `${cleanName}`,
      documentType: parsed.documentType || "Study Material",
      projectObjective: parsed.projectObjective || `To analyze and synthesize the content of "${cleanName}".`,
      keyFindings: parsed.keyFindings || [],
      architecture: parsed.architecture || "",
      methodology: parsed.methodology || "",
      results: parsed.results || "",
      conclusion: parsed.conclusion || "",
      executiveBrief: parsed.executiveBrief,
      detailedSummary: parsed.detailedSummary || parsed.executiveBrief || "",
      keyInsights: parsed.keyInsights || [],
      keyTakeaways: parsed.keyTakeaways || [],
      concepts: parsed.concepts || [],
      definitions: parsed.definitions || [],
      facts: parsed.facts || [],
      formulas: parsed.formulas || [],
      technologyStack: parsed.technologyStack || [],
      revisionNotes: parsed.revisionNotes || "",
      chapterSummaries: parsed.chapterSummaries || [],
    };
  } catch {
    return null;
  }
}

async function tryGeminiQuiz(text: string, filename: string): Promise<QuizResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;

  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  const truncatedText = text.substring(0, 30000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert quiz designer creating assessments that test genuine understanding — NOT keyword recognition. Based on the following document, generate a comprehensive quiz.

CRITICAL RULES:
- NEVER generate questions that can be answered by keyword matching alone
- Every question must test understanding of concepts, reasoning, methodology, or application
- Include a mix of Easy, Medium, and Hard difficulty levels across the question set
- Every question MUST include: "topic", "learningObjective", and "difficulty" fields
- Every MCQ MUST include "wrongOptionExplanations" — explaining why EACH wrong option is incorrect — AND "whyCorrectIsCorrect" explaining why the right answer is right
- Wrong options must be plausible but demonstrably incorrect based on the document
- Difficulty tiers: Easy (recall/comprehension), Medium (application/analysis), Hard (synthesis/evaluation)

Generate 10-14 questions across these types:
1. MCQ (3-4 questions) — 4 options each, with wrongOptionExplanations for ALL wrong options, plus whyCorrectIsCorrect
2. Fill in the Blanks (1-2 questions) — based on key definitions, with enough context to test understanding
3. True/False (1-2 questions) — must test nuanced understanding, not trivial facts
4. Match the Following (0-1 question) — match concepts to descriptions (not just tech-to-category)
5. Short Answer (1 question) — requires brief analytical response synthesizing multiple concepts
6. Scenario-based (1 question) — applies concepts to a practical, realistic scenario
7. Concept (1 question) — tests understanding of a core concept (has a "conceptName" field)
8. Application (1 question) — asks the learner to apply knowledge to a new situation (has a "context" field)

Example of a GOOD question (tests understanding, not keyword matching):
"Why does the system use PostgreSQL rather than a document database for this project?" 
→ Correct: "The system requires relational integrity across users, documents, summaries, quizzes, and analytics, with complex joins and transactional consistency that relational databases handle natively."
→ Wrong: "Because PostgreSQL is popular" (not specific to this document's requirements)

Example of a BAD question (keyword matching):
"What database does the system use?" → "PostgreSQL" (too trivial, tests word recognition)

Respond with ONLY raw JSON (no markdown fences):
{
  "questions": [
    {
      "id": "q1",
      "type": "MCQ",
      "difficulty": "Easy|Medium|Hard",
      "question": "The question text that tests understanding...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of correct option",
      "explanation": "Comprehensive explanation of the answer...",
      "whyCorrectIsCorrect": "Specific reasoning why this option is the correct answer based on document principles...",
      "topic": "Database Systems",
      "learningObjective": "Understand the role of relational databases in web applications",
      "wrongOptionExplanations": {"Option A": "Why Option A is wrong based on the document...", "Option B": "Why Option B is wrong based on the document...", "Option C": "Why Option C is wrong based on the document..."}
    },
    {
      "id": "q2",
      "type": "TrueFalse",
      "difficulty": "Easy|Medium|Hard",
      "question": "True or False: statement that tests understanding...",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Detailed explanation of why this is true or false based on document evidence...",
      "topic": "Core Concepts",
      "learningObjective": "Verify understanding of factual statements"
    },
    {
      "id": "q3",
      "type": "FillBlank",
      "difficulty": "Easy|Medium|Hard",
      "question": "Context-rich sentence where ________ is the key concept being tested...",
      "correctAnswer": "The answer",
      "explanation": "Why this term/concept fills the blank correctly...",
      "topic": "Terminology",
      "learningObjective": "Recall key terminology from the document"
    },
    {
      "id": "q4",
      "type": "Match",
      "difficulty": "Easy|Medium|Hard",
      "question": "Match the following items with their correct descriptions...",
      "matchPairs": [{"left": "Term/Concept", "right": "Description/Definition"}],
      "correctAnswer": "Term → Description, ...",
      "explanation": "Detailed explanation of each match...",
      "topic": "Concept Mapping",
      "learningObjective": "Associate terms with their correct definitions"
    },
    {
      "id": "q5",
      "type": "ShortAnswer",
      "difficulty": "Hard",
      "question": "Explain briefly...",
      "correctAnswer": "Expected answer covering key points...",
      "explanation": "Key points that should be included...",
      "topic": "Analysis",
      "learningObjective": "Synthesize information from the document into a concise explanation"
    },
    {
      "id": "q6",
      "type": "Scenario",
      "difficulty": "Hard",
      "scenario": "Consider this realistic situation that tests application of document concepts...",
      "question": "What would you do and why?",
      "correctAnswer": "Expected approach with reasoning...",
      "explanation": "Based on the document's methodology or principles...",
      "topic": "Practical Application",
      "learningObjective": "Apply document concepts to a real-world scenario"
    },
    {
      "id": "q7",
      "type": "Concept",
      "difficulty": "Medium",
      "question": "Explain the concept of [core concept] as described in the document. Why is it significant?",
      "correctAnswer": "Complete explanation showing understanding...",
      "explanation": "Why this concept is important in the document's context...",
      "conceptName": "Name of the concept",
      "topic": "Core Concepts",
      "learningObjective": "Demonstrate understanding of a key concept from the document"
    },
    {
      "id": "q8",
      "type": "Application",
      "difficulty": "Hard",
      "question": "How would you apply the principles from this document to solve a new problem?",
      "context": "A novel situation that requires adapting knowledge from the document",
      "correctAnswer": "The expected approach showing adaptation of principles...",
      "explanation": "Why this approach correctly applies the document's methodology...",
      "topic": "Knowledge Transfer",
      "learningObjective": "Apply learned concepts to solve a novel problem"
    }
  ],
  "difficulty": "balanced",
  "questionTypes": ["MCQ", "TrueFalse", "FillBlank", "Match", "ShortAnswer", "Scenario", "Concept", "Application"]
}

Document: "${cleanName}"
Document text:
${truncatedText}`
          }]
        }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 8192 }
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;

    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.questions || !Array.isArray(parsed.questions)) return null;

    return {
      questions: parsed.questions,
      difficulty: parsed.difficulty || "balanced",
      questionTypes: parsed.questionTypes || [...new Set(parsed.questions.map((q: any) => q.type))],
    };
  } catch {
    return null;
  }
}

// ─── Public API ─────────────────────────────────────────────

export async function generateSummary(text: string, filename: string): Promise<SummaryResult> {
  // Try Gemini first
  const geminiResult = await tryGeminiSummary(text, filename);
  if (geminiResult) {
    console.log("[AI Engine] Summary generated via Gemini API — intelligent analysis complete");
    return geminiResult;
  }

  // Enhanced local fallback with structural analysis
  console.log("[AI Engine] Summary generated via enhanced local NLP (semantic analysis)");
  return generateLocalSummary(text, filename);
}

export async function generateQuiz(text: string, filename: string): Promise<QuizResult> {
  // Try Gemini first
  const geminiResult = await tryGeminiQuiz(text, filename);
  if (geminiResult) {
    console.log("[AI Engine] Quiz generated via Gemini API — multi-type assessment complete");
    return geminiResult;
  }

  // Enhanced local fallback with contextual questions
  console.log("[AI Engine] Quiz generated via enhanced local NLP (contextual extraction)");
  return generateLocalQuiz(text, filename);
}

export function chunkText(text: string, chunkSize: number = 1000): string[] {
  // Semantic chunking: prefer breaking at paragraph/section boundaries
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current: string[] = [];
  let len = 0;

  for (const para of paragraphs) {
    if (len + para.length > chunkSize && current.length > 0) {
      chunks.push(current.join("\n\n"));
      current = [];
      len = 0;
    }
    current.push(para);
    len += para.length;
  }
  if (current.length > 0) {
    chunks.push(current.join("\n\n"));
  }
  return chunks;
}
