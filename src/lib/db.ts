import { PrismaClient } from "@prisma/client";

// Global declaration to prevent duplicate PrismaClient instances in hot-reloaded dev mode
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ═══════════════════════════════════════════════════════════════
// NEURAL COGNITIVE MOCK DATABASE FALLBACK SYSTEM
// Intercepts and mocks active schemas if the primary DB is offline.
// ═══════════════════════════════════════════════════════════════

interface MockStore {
  users: any[];
  documents: any[];
  summaries: any[];
  quizzes: any[];
  knowledgeMaps: any[];
  analytics: any[];
  preferences: any[];
  sessions: any[];
}

export const mockDb: MockStore = {
  users: [
    {
      id: "demo-user-id",
      name: "Alex",
      email: "alex.chen@quantum.io",
      hashedPassword: "$2a$12$Z0H9V6q4dYhE2CegUv.yB.3vL0z/j4rF6eU2v0jE/Tj.w8d9aH7qy", // bcrypt hashed password: "password"
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent",
      authProvider: "credentials",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  documents: [
    {
      id: "doc-1",
      userId: "demo-user-id",
      title: "Neural Network Architectures",
      fileUrl: "/docs/neural-networks.pdf",
      extractedText: "Neural networks represent interconnected topologies of neurons that propagate information forward and backward...",
      embeddings: "[]",
      processingStatus: "completed",
      uploadedAt: new Date(),
    },
    {
      id: "doc-2",
      userId: "demo-user-id",
      title: "Q3 Research Synthesis",
      fileUrl: "/docs/q3-research.docx",
      extractedText: "During the third quarter, active cognitive research focused on human retention and synaptic triggers...",
      embeddings: "[]",
      processingStatus: "completed",
      uploadedAt: new Date(Date.now() - 3600000),
    }
  ],
  summaries: [
    {
      id: "summary-1",
      documentId: "doc-1",
      title: "Neural Network Architectures Summary",
      executiveBrief: "This executive brief analyzes deep learning topologies, tracing how feedforward vectors adjust weights through stochastic error optimization.",
      concepts: JSON.stringify([
        { topic: "Backpropagation", category: "AI/ML", relevance: 98, color: "#FF8A00", points: ["Propagates error backward to adjust synaptic weights.", "Calculates gradients across multi-layered feedforward systems."] },
        { topic: "Activation Functions", category: "Math", relevance: 92, color: "#00F5D4", points: ["Introduces non-linearity to map hyper-dimensional matrices.", "Examples include ReLU, Gelu, and dynamic Softmax outputs."] }
      ]),
      generatedAt: new Date(),
    }
  ],
  quizzes: [
    {
      id: "quiz-1",
      summaryId: "summary-1",
      difficulty: "balanced",
      score: 100,
      createdAt: new Date(),
      questions: JSON.stringify([
        {
          id: 1,
          question: "What is the primary function of mitochondria in a cell?",
          options: [
            "Protein synthesis via ribosomes",
            "Cellular respiration and ATP energy production",
            "DNA storage and replication",
            "Waste elimination and enzyme breakdown"
          ],
          correctAnswer: 1,
          explanation: "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
          hint: "Think about energy — what organelle is nicknamed the 'powerhouse'?"
        },
        {
          id: 2,
          question: "Which of the following is NOT a part of the central nervous system?",
          options: [
            "The Brain",
            "The Spinal Cord",
            "Peripheral Sensory Neurons",
            "The Cerebellum"
          ],
          correctAnswer: 2,
          explanation: "Sensory neurons are part of the peripheral nervous system, which connects the central nervous system to the limbs and organs. The CNS consists solely of the brain and spinal cord.",
          hint: "The CNS is contained within protective bone structures (skull and vertebral column)."
        }
      ]),
    }
  ],
  knowledgeMaps: [
    {
      id: "node-1",
      userId: "demo-user-id",
      topic: "Action Potentials",
      category: "Neuroscience",
      relevance: 98,
      color: "#FF8A00",
      points: JSON.stringify([
        "Rapid rise and subsequent fall in voltage or membrane potential.",
        "Follows the 'all-or-none' principle.",
        "Caused by the opening and closing of voltage-gated ion channels."
      ]),
      connections: "[2]",
      x: 300,
      y: 200,
    },
    {
      id: "node-2",
      userId: "demo-user-id",
      topic: "Neurotransmitters",
      category: "Biochemistry",
      relevance: 95,
      color: "#00F5D4",
      points: JSON.stringify([
        "Chemical messengers that cross the synaptic gaps between neurons.",
        "Excitatory (e.g., Glutamate) vs. Inhibitory (e.g., GABA)."
      ]),
      connections: "[1]",
      x: 550,
      y: 180,
    },
    {
      id: "node-3",
      userId: "demo-user-id",
      topic: "Hebbian Theory",
      category: "Learning",
      relevance: 88,
      color: "#38BDF8",
      points: JSON.stringify([
        "Neurons that fire together, wire together.",
        "Explains adaptation of neurons in the brain during the learning process."
      ]),
      connections: "[4]",
      x: 750,
      y: 350,
    },
    {
      id: "node-4",
      userId: "demo-user-id",
      topic: "Synaptic Plasticity",
      category: "Neuroscience",
      relevance: 92,
      color: "#8B5CF6",
      points: JSON.stringify([
        "The ability of synapses to strengthen or weaken over time.",
        "Fundamental mechanism for memory and learning."
      ]),
      connections: "[3, 1]",
      x: 350,
      y: 420,
    }
  ],
  analytics: [
    {
      id: "a-1",
      userId: "demo-user-id",
      studyMinutes: 324,
      cognitiveScore: 85,
      retentionRating: 88,
      date: new Date(),
    }
  ],
  preferences: [
    {
      id: "pref-1",
      userId: "demo-user-id",
      intensity: 2,
      adaptive: true,
      voice: false,
      dark: true,
      emailAlerts: true,
      pushAlerts: true,
      accentColor: "#00F5D4",
    }
  ],
  sessions: [
    {
      id: "sess-1",
      userId: "demo-user-id",
      title: "Neuroscience 101 Summary",
      type: "AI Summary",
      duration: "24.5h",
      timeAgo: "2h ago",
      color: "#8B5CF6",
    },
    {
      id: "sess-2",
      userId: "demo-user-id",
      title: "Cellular Biology Quiz",
      type: "Adaptive Quiz",
      duration: "5 Days",
      timeAgo: "5h ago",
      color: "#FF8A00",
    },
    {
      id: "sess-3",
      userId: "demo-user-id",
      title: "Physics Chapter 4",
      type: "Raw Source",
      duration: "12",
      timeAgo: "1d ago",
      color: "#64748B",
    }
  ]
};

// Clean functional db operations utility that falls back smoothly
export const dbOperation = async <T>(operation: () => Promise<T>, fallback: () => T): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("PostgreSQL connection offline. Serving memory fallback trace.", error);
    }
    return fallback();
  }
};
