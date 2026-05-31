"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, BrainCircuit, ChevronRight, Trophy, Flame,
  Lightbulb, Zap, Loader2, Play, BookOpen, PenLine, ToggleLeft,
  Link2, MessageSquare, ShieldQuestion, ArrowRight,
} from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string }> = {
  Easy: { color: "#00F5D4", bg: "rgba(0, 245, 212, 0.08)" },
  Medium: { color: "#FF8A00", bg: "rgba(255, 138, 0, 0.08)" },
  Hard: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.08)" },
};

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  MCQ: { label: "Multiple Choice", icon: CheckCircle2, color: "#00F5D4" },
  FillBlank: { label: "Fill in the Blank", icon: PenLine, color: "#38BDF8" },
  TrueFalse: { label: "True / False", icon: ToggleLeft, color: "#FACC15" },
  Match: { label: "Match the Following", icon: Link2, color: "#8B5CF6" },
  ShortAnswer: { label: "Short Answer", icon: MessageSquare, color: "#FF8A00" },
  Scenario: { label: "Scenario-Based", icon: ShieldQuestion, color: "#F472B6" },
};

function TimerRing({ timeLeft, total, isSubmitted }: { timeLeft: number; total: number; isSubmitted: boolean }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / total) * circumference;
  const isLow = timeLeft <= 5 && !isSubmitted;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <motion.circle
          cx="25" cy="25" r={radius} fill="none"
          stroke={isLow ? "#EF4444" : "#00F5D4"}
          strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ filter: isLow ? "drop-shadow(0 0 8px rgba(239,68,68,0.6))" : "drop-shadow(0 0 8px rgba(0,245,212,0.4))" }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <span className={`absolute font-display font-bold text-lg ${isLow ? "text-danger animate-pulse" : "text-text-primary"}`}>
        {timeLeft}
      </span>
    </div>
  );
}

export default function QuizLab() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [gameState, setGameState] = useState<"lobby" | "playing" | "summary">("lobby");

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [showCorrectBurst, setShowCorrectBurst] = useState(false);

  // New state for different question types
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [showWrongExplanations, setShowWrongExplanations] = useState(false);

  // High-score submitting state
  const [submittingScore, setSubmittingScore] = useState(false);

  const burstDistances = useMemo(() => {
    return [...Array(16)].map(() => 80 + Math.random() * 120);
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const json = await res.json();
        setQuizzes(json.quizzes || []);
      }
    } catch (err) {
      console.error("Error retrieving quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Parse questions when playing
  const questions = useMemo(() => {
    if (!selectedQuiz) return [];
    try {
      return JSON.parse(selectedQuiz.questions);
    } catch (e) {
      console.error("Failed to parse quiz questions schema", e);
      return [];
    }
  }, [selectedQuiz]);

  const question = questions[currentQIndex];
  const qType = question?.type || "MCQ";

  // Timer per question type
  const timerDuration = useMemo(() => {
    if (!question) return 30;
    switch (question.type) {
      case "ShortAnswer": return 60;
      case "Scenario": return 90;
      case "Match": return 45;
      default: return 30;
    }
  }, [question]);

  // Check correctness based on question type
  const checkAnswer = (): boolean => {
    if (!question) return false;
    switch (question.type) {
      case "MCQ":
      case "TrueFalse": {
        if (selectedAnswer === null) return false;
        const ans = question.correctAnswer;
        return ans === selectedAnswer || question.options?.[selectedAnswer] === ans;
      }
      case "FillBlank": {
        const correct = question.correctAnswer?.toLowerCase().trim() || "";
        const given = fillBlankAnswer.toLowerCase().trim();
        // Flexible matching: exact, contains, or >70% match
        return given === correct || correct.includes(given) || given.includes(correct) ||
          (given.length > 3 && correct.includes(given.substring(0, Math.ceil(given.length * 0.7))));
      }
      case "ShortAnswer": {
        // Check if key terms from the correct answer appear in the response
        const correctWords = (question.correctAnswer || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        const givenWords = shortAnswer.toLowerCase().split(/\s+/);
        const matchCount = correctWords.filter((w: string) => givenWords.some((gw: string) => gw.includes(w) || w.includes(gw))).length;
        return matchCount >= Math.ceil(correctWords.length * 0.4);
      }
      case "Match": {
        if (!question.matchPairs) return false;
        return question.matchPairs.every((pair: any) => matchSelections[pair.left] === pair.right);
      }
      case "Scenario": {
        // Similar to short answer
        if (selectedAnswer !== null && question.options) {
          const ans = question.correctAnswer;
          return ans === selectedAnswer || question.options?.[selectedAnswer] === ans;
        }
        const correctWords = (question.correctAnswer || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        const givenWords = shortAnswer.toLowerCase().split(/\s+/);
        const matchCount = correctWords.filter((w: string) => givenWords.some((gw: string) => gw.includes(w) || w.includes(gw))).length;
        return matchCount >= Math.ceil(correctWords.length * 0.3);
      }
      default:
        return false;
    }
  };

  const isCorrect = useMemo(() => {
    if (!isSubmitted) return false;
    return checkAnswer();
  }, [isSubmitted, selectedAnswer, fillBlankAnswer, shortAnswer, matchSelections, question]);

  // Can submit check
  const canSubmit = useMemo(() => {
    if (!question) return false;
    switch (question.type) {
      case "MCQ":
      case "TrueFalse":
        return selectedAnswer !== null;
      case "FillBlank":
        return fillBlankAnswer.trim().length > 0;
      case "ShortAnswer":
        return shortAnswer.trim().length > 10;
      case "Match":
        return question.matchPairs ? Object.keys(matchSelections).length === question.matchPairs.length : false;
      case "Scenario":
        return question.options ? selectedAnswer !== null : shortAnswer.trim().length > 10;
      default:
        return selectedAnswer !== null;
    }
  }, [question, selectedAnswer, fillBlankAnswer, shortAnswer, matchSelections]);

  // Timer countdown hook
  useEffect(() => {
    if (gameState === "playing" && !isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (gameState === "playing" && timeLeft === 0 && !isSubmitted) {
      handleSubmit(true);
    }
  }, [timeLeft, isSubmitted, gameState]);

  const handleSelect = (index: number) => {
    if (!isSubmitted) setSelectedAnswer(index);
  };

  const handleSubmit = (isTimeout = false) => {
    if (!isSubmitted && (canSubmit || isTimeout)) {
      setIsSubmitted(true);
      const correct = !isTimeout && checkAnswer();
      if (correct) {
        const points = qType === "Scenario" ? 200 : qType === "ShortAnswer" ? 150 : 100;
        setScore((s) => s + points * multiplier);
        setStreak((s) => s + 1);
        setShowCorrectBurst(true);
        setTimeout(() => setShowCorrectBurst(false), 1200);
        if (streak > 0 && streak % 2 === 0) {
          setMultiplier((m) => Math.min(m + 0.5, 3));
        }
      } else {
        setStreak(0);
        setMultiplier(1);
      }
    }
  };

  const handleNext = async () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowHint(false);
    setFillBlankAnswer("");
    setShortAnswer("");
    setMatchSelections({});
    setShowWrongExplanations(false);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((c) => c + 1);
      // Set timer for next question type
      const nextQ = questions[currentQIndex + 1];
      const nextTimer = nextQ?.type === "ShortAnswer" ? 60 : nextQ?.type === "Scenario" ? 90 : nextQ?.type === "Match" ? 45 : 30;
      setTimeLeft(nextTimer);
    } else {
      setGameState("summary");
      setSubmittingScore(true);
      try {
        const maxScore = questions.reduce((acc: number, q: any) => {
          const pts = q.type === "Scenario" ? 200 : q.type === "ShortAnswer" ? 150 : 100;
          return acc + pts;
        }, 0);
        const finalAccuracy = Math.round((score / maxScore) * 100) || 0;
        await fetch("/api/quizzes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: selectedQuiz.id,
            score: finalAccuracy,
            duration: questions.length,
          }),
        });
      } catch (err) {
        console.error("Score persist error:", err);
      } finally {
        setSubmittingScore(false);
      }
    }
  };

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setFillBlankAnswer("");
    setShortAnswer("");
    setMatchSelections({});
    setShowWrongExplanations(false);
    setGameState("playing");
    // Set initial timer based on first question type
    const firstQ = (() => { try { return JSON.parse(quiz.questions)[0]; } catch { return null; } })();
    setTimeLeft(firstQ?.type === "ShortAnswer" ? 60 : firstQ?.type === "Scenario" ? 90 : firstQ?.type === "Match" ? 45 : 30);
  };

  const returnToLobby = () => {
    setGameState("lobby");
    setSelectedQuiz(null);
    fetchQuizzes();
  };

  // ─── Render MCQ Options ───
  const renderMCQOptions = () => {
    if (!question?.options) return null;
    return (
      <div className="grid gap-4">
        {question.options.map((opt: string, i: number) => {
          const isCorrectOption = question.correctAnswer === i || question.options[i] === question.correctAnswer;
          const isSelected = selectedAnswer === i;

          let borderColor = "rgba(255,255,255,0.08)";
          let bg = "rgba(11, 16, 32, 0.6)";
          let shadow = "none";
          let opacity = 1;

          if (isSubmitted) {
            if (isCorrectOption) {
              borderColor = "rgba(0, 245, 212, 0.4)";
              bg = "rgba(0, 245, 212, 0.08)";
              shadow = "0 0 25px rgba(0, 245, 212, 0.15)";
            } else if (isSelected) {
              borderColor = "rgba(239, 68, 68, 0.4)";
              bg = "rgba(239, 68, 68, 0.08)";
              shadow = "0 0 25px rgba(239, 68, 68, 0.1)";
            } else {
              opacity = 0.35;
            }
          } else if (isSelected) {
            borderColor = "rgba(255, 138, 0, 0.4)";
            bg = "rgba(255, 138, 0, 0.08)";
            shadow = "0 0 25px rgba(255, 138, 0, 0.1)";
          }

          return (
            <motion.button
              key={i}
              whileHover={!isSubmitted ? { scale: 1.01, x: 5 } : {}}
              whileTap={!isSubmitted ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(i)}
              disabled={isSubmitted}
              className="w-full text-left p-5 rounded-2xl flex items-center justify-between group transition-all duration-300 border cursor-pointer"
              style={{ borderColor, background: bg, boxShadow: shadow, opacity }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                  style={{
                    background: isSubmitted && isCorrectOption ? "#00F5D4" : isSubmitted && isSelected && !isCorrectOption ? "#EF4444" : isSelected ? "#FF8A00" : "rgba(5, 8, 22, 0.8)",
                    color: isSelected || (isSubmitted && isCorrectOption) ? "#050816" : "#64748B",
                    border: !isSelected && !(isSubmitted && isCorrectOption) ? "1px solid rgba(255,255,255,0.08)" : "none",
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={`text-base font-semibold transition-colors ${isSelected || (isSubmitted && isCorrectOption) ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"}`}>
                  {opt}
                </span>
              </div>
              {isSubmitted && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-neural-cyan" />}
              {isSubmitted && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-danger" />}
            </motion.button>
          );
        })}

        {/* Wrong option explanations toggle */}
        {isSubmitted && question.wrongOptionExplanations && (
          <div className="mt-2">
            <button
              onClick={() => setShowWrongExplanations(!showWrongExplanations)}
              className="text-xs font-semibold text-text-muted hover:text-text-secondary flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showWrongExplanations ? "rotate-90" : ""}`} />
              {showWrongExplanations ? "Hide" : "Show"} why other options are wrong
            </button>
            <AnimatePresence>
              {showWrongExplanations && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3 space-y-2"
                >
                  {Object.entries(question.wrongOptionExplanations).map(([opt, explanation]: [string, any]) => (
                    <div key={opt} className="flex gap-3 p-3 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.1)" }}>
                      <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-text-muted mb-1">{opt}</p>
                        <p className="text-xs text-text-ghost leading-relaxed">{explanation}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  };

  };
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      <div className="w-full max-w-4xl space-y-8 relative z-10 text-center">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-2">Quiz Lab (Staging Support)</h1>
        <p className="text-text-muted text-lg">Initial state setup for multi-format questions...</p>
      </div>
    </div>
  );
}
