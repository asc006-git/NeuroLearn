"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, BrainCircuit, ChevronRight, Trophy, Flame,
  Lightbulb, Zap, Loader2, Play, BookOpen, PenLine, ToggleLeft,
  Link2, MessageSquare, ShieldQuestion, ArrowRight, Sparkles,
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
  Concept: { label: "Concept", icon: BookOpen, color: "#38BDF8" },
  Application: { label: "Application", icon: Zap, color: "#EC4899" },
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
  const [finalAccuracy, setFinalAccuracy] = useState(0);

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
      case "Concept": return 60;
      case "Application": return 90;
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
      case "Scenario":
      case "Concept":
      case "Application": {
        // Similar to short answer
        if (selectedAnswer !== null && question.options) {
          const ans = question.correctAnswer;
          return ans === selectedAnswer || question.options?.[selectedAnswer] === ans;
        }
        const correctWords = (question.correctAnswer || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        const givenWords = (question.type === "Concept" ? shortAnswer : shortAnswer).toLowerCase().split(/\s+/);
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
      case "Concept":
      case "Application":
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
        const points = qType === "Scenario" || qType === "Application" ? 200 : qType === "ShortAnswer" || qType === "Concept" ? 150 : 100;
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
      const nextTimer = nextQ?.type === "ShortAnswer" || nextQ?.type === "Concept" ? 60 : nextQ?.type === "Scenario" || nextQ?.type === "Application" ? 90 : nextQ?.type === "Match" ? 45 : 30;
      setTimeLeft(nextTimer);
    } else {
      setGameState("summary");
      setSubmittingScore(true);
      try {
        const maxScore = questions.reduce((acc: number, q: any) => {
          const pts = q.type === "Scenario" || q.type === "Application" ? 200 : q.type === "ShortAnswer" || q.type === "Concept" ? 150 : 100;
          return acc + pts;
        }, 0);
        const accuracy = Math.round((score / maxScore) * 100) || 0;
        setFinalAccuracy(accuracy);
        await fetch("/api/quizzes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: selectedQuiz.id,
            score: accuracy,
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
    setTimeLeft(firstQ?.type === "ShortAnswer" || firstQ?.type === "Concept" ? 60 : firstQ?.type === "Scenario" || firstQ?.type === "Application" ? 90 : firstQ?.type === "Match" ? 45 : 30);
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

  // ─── Render True/False ───
  const renderTrueFalse = () => {
    const options = question?.options || ["True", "False"];
    return (
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt: string, i: number) => {
          const isCorrectOption = question.correctAnswer === opt;
          const isSelected = selectedAnswer === i;
          let borderColor = "rgba(255,255,255,0.08)";
          let bg = "rgba(11, 16, 32, 0.6)";
          let textColor = "#94A3B8";

          if (isSubmitted) {
            if (isCorrectOption) { borderColor = "rgba(0, 245, 212, 0.4)"; bg = "rgba(0, 245, 212, 0.08)"; textColor = "#00F5D4"; }
            else if (isSelected) { borderColor = "rgba(239, 68, 68, 0.4)"; bg = "rgba(239, 68, 68, 0.08)"; textColor = "#EF4444"; }
          } else if (isSelected) { borderColor = "rgba(255, 138, 0, 0.4)"; bg = "rgba(255, 138, 0, 0.08)"; textColor = "#FF8A00"; }

          return (
            <motion.button
              key={i}
              whileHover={!isSubmitted ? { scale: 1.02 } : {}}
              whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(i)}
              disabled={isSubmitted}
              className="p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border"
              style={{ borderColor, background: bg }}
            >
              <ToggleLeft className="w-8 h-8" style={{ color: textColor }} />
              <span className="text-xl font-display font-bold" style={{ color: textColor }}>{opt}</span>
              {isSubmitted && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-neural-cyan" />}
              {isSubmitted && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-danger" />}
            </motion.button>
          );
        })}
      </div>
    );
  };

  // ─── Render Fill in the Blank ───
  const renderFillBlank = () => (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={fillBlankAnswer}
          onChange={(e) => !isSubmitted && setFillBlankAnswer(e.target.value)}
          placeholder="Type your answer here..."
          disabled={isSubmitted}
          className="w-full p-5 rounded-2xl text-lg text-text-primary placeholder:text-text-ghost font-semibold focus:outline-none transition-all"
          style={{
            background: "rgba(11, 16, 32, 0.6)",
            border: isSubmitted
              ? isCorrect ? "2px solid rgba(0, 245, 212, 0.5)" : "2px solid rgba(239, 68, 68, 0.5)"
              : fillBlankAnswer ? "2px solid rgba(56, 189, 248, 0.3)" : "2px solid rgba(255,255,255,0.08)",
          }}
          onKeyDown={(e) => { if (e.key === "Enter" && canSubmit && !isSubmitted) handleSubmit(false); }}
        />
        {isSubmitted && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isCorrect ? <CheckCircle2 className="w-6 h-6 text-neural-cyan" /> : <XCircle className="w-6 h-6 text-danger" />}
          </div>
        )}
      </div>
      {isSubmitted && !isCorrect && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl" style={{ background: "rgba(0, 245, 212, 0.04)", border: "1px solid rgba(0, 245, 212, 0.15)" }}>
          <p className="text-xs font-semibold text-neural-cyan mb-1">Correct Answer:</p>
          <p className="text-sm text-text-secondary font-semibold">{question.correctAnswer}</p>
        </motion.div>
      )}
    </div>
  );

  // ─── Render Match the Following ───
  const renderMatch = () => {
    if (!question?.matchPairs) return null;
    const rightOptions = [...question.matchPairs.map((p: any) => p.right)].sort(() => Math.random() - 0.5);
    const [activeLeft, setActiveLeft] = useState<string | null>(null);

    const handleMatchSelect = (right: string) => {
      if (isSubmitted || !activeLeft) return;
      setMatchSelections((prev) => ({ ...prev, [activeLeft]: right }));
      setActiveLeft(null);
    };

    return (
      <div className="space-y-4">
        <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Click a term, then click its match</p>
        <div className="grid grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-3">
            {question.matchPairs.map((pair: any, i: number) => {
              const isActive = activeLeft === pair.left;
              const isMatched = matchSelections[pair.left] !== undefined;
              const isCorrectMatch = isSubmitted && matchSelections[pair.left] === pair.right;
              const isWrongMatch = isSubmitted && isMatched && matchSelections[pair.left] !== pair.right;

              return (
                <button
                  key={i}
                  onClick={() => !isSubmitted && setActiveLeft(pair.left)}
                  className="w-full p-4 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer border"
                  style={{
                    background: isCorrectMatch ? "rgba(0,245,212,0.08)" : isWrongMatch ? "rgba(239,68,68,0.08)" : isActive ? "rgba(255,138,0,0.08)" : isMatched ? "rgba(56,189,248,0.08)" : "rgba(11,16,32,0.6)",
                    borderColor: isCorrectMatch ? "rgba(0,245,212,0.4)" : isWrongMatch ? "rgba(239,68,68,0.4)" : isActive ? "rgba(255,138,0,0.4)" : isMatched ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.08)",
                    color: isActive ? "#FF8A00" : "#E2E8F0",
                  }}
                >
                  {pair.left}
                  {isMatched && !isSubmitted && (
                    <span className="block text-xs text-[#38BDF8] mt-1">→ {matchSelections[pair.left]}</span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Right column */}
          <div className="space-y-3">
            {rightOptions.map((right: string, i: number) => {
              const isUsed = Object.values(matchSelections).includes(right);
              return (
                <button
                  key={i}
                  onClick={() => handleMatchSelect(right)}
                  disabled={isSubmitted || !activeLeft}
                  className="w-full p-4 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer border"
                  style={{
                    background: isUsed ? "rgba(56,189,248,0.05)" : "rgba(11,16,32,0.6)",
                    borderColor: isUsed ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.08)",
                    color: isUsed ? "#64748B" : "#E2E8F0",
                    opacity: isUsed && !isSubmitted ? 0.5 : 1,
                  }}
                >
                  {right}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── Render Short Answer ───
  const renderShortAnswer = () => (
    <div className="space-y-4">
      <textarea
        value={shortAnswer}
        onChange={(e) => !isSubmitted && setShortAnswer(e.target.value)}
        placeholder="Write your answer here (at least 2 sentences)..."
        disabled={isSubmitted}
        rows={4}
        className="w-full p-5 rounded-2xl text-sm text-text-primary placeholder:text-text-ghost focus:outline-none resize-none transition-all leading-relaxed"
        style={{
          background: "rgba(11, 16, 32, 0.6)",
          border: isSubmitted
            ? isCorrect ? "2px solid rgba(0, 245, 212, 0.5)" : "2px solid rgba(239, 68, 68, 0.5)"
            : shortAnswer.length > 10 ? "2px solid rgba(255,138,0,0.3)" : "2px solid rgba(255,255,255,0.08)",
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-ghost">{shortAnswer.length} characters</span>
        {isSubmitted && (
          <span className={`text-xs font-semibold ${isCorrect ? "text-neural-cyan" : "text-danger"}`}>
            {isCorrect ? "Key concepts identified ✓" : "Some key concepts missing"}
          </span>
        )}
      </div>
      {isSubmitted && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl" style={{ background: "rgba(0, 245, 212, 0.04)", border: "1px solid rgba(0, 245, 212, 0.15)" }}>
          <p className="text-xs font-semibold text-neural-cyan mb-1">Model Answer:</p>
          <p className="text-sm text-text-secondary leading-relaxed">{question.correctAnswer}</p>
        </motion.div>
      )}
    </div>
  );

  // ─── Render Scenario ───
  const renderScenario = () => (
    <div className="space-y-6">
      {question.scenario && (
        <div className="p-5 rounded-2xl" style={{ background: "rgba(244, 114, 182, 0.04)", border: "1px solid rgba(244, 114, 182, 0.15)" }}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldQuestion className="w-4 h-4 text-[#F472B6]" />
            <span className="text-xs font-bold text-[#F472B6] uppercase tracking-wider">Scenario Context</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{question.scenario}</p>
        </div>
      )}
      {question.options ? renderMCQOptions() : renderShortAnswer()}
    </div>
  );

  // ─── Render Concept ───
  const renderConcept = () => (
    <div className="space-y-4">
      {question.conceptName && (
        <div className="p-4 rounded-xl mb-2" style={{ background: "rgba(56, 189, 248, 0.04)", border: "1px solid rgba(56, 189, 248, 0.15)" }}>
          <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Concept: {question.conceptName}</span>
        </div>
      )}
      <textarea
        value={shortAnswer}
        onChange={(e) => !isSubmitted && setShortAnswer(e.target.value)}
        placeholder="Explain the concept in your own words..."
        disabled={isSubmitted}
        rows={4}
        className="w-full p-5 rounded-2xl text-sm text-text-primary placeholder:text-text-ghost focus:outline-none resize-none transition-all leading-relaxed"
        style={{
          background: "rgba(11, 16, 32, 0.6)",
          border: isSubmitted
            ? isCorrect ? "2px solid rgba(0, 245, 212, 0.5)" : "2px solid rgba(239, 68, 68, 0.5)"
            : shortAnswer.length > 10 ? "2px solid rgba(56,189,248,0.3)" : "2px solid rgba(255,255,255,0.08)",
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-ghost">{shortAnswer.length} characters</span>
        {isSubmitted && (
          <span className={`text-xs font-semibold ${isCorrect ? "text-neural-cyan" : "text-danger"}`}>
            {isCorrect ? "Concept understood ✓" : "Key aspects missing"}
          </span>
        )}
      </div>
      {isSubmitted && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl" style={{ background: "rgba(56, 189, 248, 0.04)", border: "1px solid rgba(56, 189, 248, 0.15)" }}>
          <p className="text-xs font-semibold text-[#38BDF8] mb-1">Expected Understanding:</p>
          <p className="text-sm text-text-secondary leading-relaxed">{question.correctAnswer}</p>
        </motion.div>
      )}
    </div>
  );

  // ─── Render Application ───
  const renderApplication = () => (
    <div className="space-y-6">
      {question.context && (
        <div className="p-5 rounded-2xl" style={{ background: "rgba(236, 72, 153, 0.04)", border: "1px solid rgba(236, 72, 153, 0.15)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#EC4899]" />
            <span className="text-xs font-bold text-[#EC4899] uppercase tracking-wider">Application Context</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{question.context}</p>
        </div>
      )}
      {question.options ? renderMCQOptions() : (
        <div className="space-y-4">
          <textarea
            value={shortAnswer}
            onChange={(e) => !isSubmitted && setShortAnswer(e.target.value)}
            placeholder="Describe how you would apply this knowledge..."
            disabled={isSubmitted}
            rows={4}
            className="w-full p-5 rounded-2xl text-sm text-text-primary placeholder:text-text-ghost focus:outline-none resize-none transition-all leading-relaxed"
            style={{
              background: "rgba(11, 16, 32, 0.6)",
              border: isSubmitted
                ? isCorrect ? "2px solid rgba(0, 245, 212, 0.5)" : "2px solid rgba(239, 68, 68, 0.5)"
                : shortAnswer.length > 10 ? "2px solid rgba(236,72,153,0.3)" : "2px solid rgba(255,255,255,0.08)",
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-ghost">{shortAnswer.length} characters</span>
            {isSubmitted && (
              <span className={`text-xs font-semibold ${isCorrect ? "text-neural-cyan" : "text-danger"}`}>
                {isCorrect ? "Approach valid ✓" : "Key reasoning missing"}
              </span>
            )}
          </div>
          {isSubmitted && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl" style={{ background: "rgba(236, 72, 153, 0.04)", border: "1px solid rgba(236, 72, 153, 0.15)" }}>
              <p className="text-xs font-semibold text-[#EC4899] mb-1">Expected Approach:</p>
              <p className="text-sm text-text-secondary leading-relaxed">{question.correctAnswer}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );

  // ─── Render question body based on type ───
  const renderQuestionBody = () => {
    switch (qType) {
      case "MCQ": return renderMCQOptions();
      case "TrueFalse": return renderTrueFalse();
      case "FillBlank": return renderFillBlank();
      case "Match": return renderMatch();
      case "ShortAnswer": return renderShortAnswer();
      case "Scenario": return renderScenario();
      case "Concept": return renderConcept();
      case "Application": return renderApplication();
      default: return renderMCQOptions(); // fallback
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      {/* Ambient reactive background */}
      <AnimatePresence>
        {gameState === "playing" && isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              background: isCorrect
                ? "radial-gradient(ellipse at 50% 50%, rgba(0, 245, 212, 0.08) 0%, transparent 60%)"
                : "radial-gradient(ellipse at 50% 50%, rgba(239, 68, 68, 0.06) 0%, transparent 60%)",
              filter: "blur(40px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Burst particles */}
      <AnimatePresence>
        {showCorrectBurst && (
          <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const distance = burstDistances[i];
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 2 === 0 ? "#00F5D4" : "#38BDF8",
                    boxShadow: `0 0 10px ${i % 2 === 0 ? "rgba(0,245,212,0.6)" : "rgba(56,189,248,0.6)"}`,
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        {loading ? (
          <div className="w-full min-h-[25rem] flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-3xl">
            <Loader2 className="w-12 h-12 text-neural-cyan animate-spin mb-4" />
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-widest">Retrieving Neural assessments...</h3>
          </div>
        ) : gameState === "lobby" ? (
          /* Lobby selection list */
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-display font-bold text-text-primary mb-2 tracking-tight">
                Quiz Lab
              </h1>
              <p className="text-text-muted text-lg">
                Engage in adaptive multi-format assessments to solidify document knowledge.
              </p>
            </div>

            {quizzes.length === 0 ? (
              <div className="w-full min-h-[20rem] flex flex-col items-center justify-center text-center bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                <div className="w-16 h-16 bg-white/5 border border-white/8 rounded-2xl flex items-center justify-center mb-5 text-text-muted">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">No dynamic quizzes compiled</h3>
                <p className="text-sm text-text-muted max-w-sm leading-relaxed">
                  Ingest PDF documents from the dashboard. The system compiles custom concept cards and multi-format quiz pipelines automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map((quiz, i) => {
                  // Parse question types from quiz data
                  const types = (quiz.questionTypes || "MCQ").split(",").filter(Boolean);
                  let questionCount = 0;
                  try { questionCount = JSON.parse(quiz.questions).length; } catch {}

                  return (
                    <motion.div
                      key={quiz.id}
                      whileHover={{ y: -6 }}
                      transition={springConfig}
                      className="neural-card-interactive p-6 flex flex-col justify-between rounded-3xl cursor-pointer"
                      onClick={() => startQuiz(quiz)}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 rounded-2xl bg-quantum-orange/10 border border-quantum-orange/20 text-quantum-orange">
                            <BrainCircuit className="w-6 h-6 animate-pulse" />
                          </div>
                          <span className="text-xs font-semibold text-neural-cyan px-2.5 py-1 rounded-lg bg-neural-cyan/10 border border-neural-cyan/20">
                            {questionCount} Questions
                          </span>
                        </div>
                        <h3 className="text-xl font-display font-semibold text-text-primary mb-2 leading-snug">
                          {quiz.summaryTitle}
                        </h3>
                        <p className="text-xs text-text-muted mb-4 font-mono">
                          Source: {quiz.documentTitle}
                        </p>
                        {/* Question type badges */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {types.map((type: string) => {
                            const cfg = TYPE_CONFIG[type.trim()] || TYPE_CONFIG.MCQ;
                            return (
                              <span
                                key={type}
                                className="text-[10px] font-semibold px-2 py-1 rounded-md"
                                style={{ background: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}20` }}
                              >
                                {cfg.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => startQuiz(quiz)}
                        className="w-full py-3 rounded-xl bg-base border border-white/8 hover:border-neural-cyan/30 text-text-primary text-xs font-semibold flex items-center justify-center gap-2 group cursor-pointer transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Initiate Assessment
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : gameState === "playing" ? (
          /* Active Playing HUD & Cards */
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-text-primary mb-1 flex items-center gap-3">
                  <BrainCircuit className="text-quantum-orange w-6 h-6 animate-pulse" />
                  Neural Lab
                </h1>
                <p className="text-xs text-text-muted font-medium font-mono">
                  Question {currentQIndex + 1}/{questions.length}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <TimerRing timeLeft={timeLeft} total={timerDuration} isSubmitted={isSubmitted} />

                <div className="neural-glass-panel px-6 py-3 flex items-center gap-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${streak >= 2 ? "text-quantum-orange animate-pulse" : "text-text-muted"}`} />
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Streak</p>
                      <p className="font-display font-bold text-text-primary text-lg leading-none">
                        {streak} <span className="text-neural-cyan text-sm ml-0.5">x{multiplier}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/8" />
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-quantum-orange" />
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Score</p>
                      <p className="font-display font-bold text-text-primary text-lg leading-none">{score}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-1.5 bg-void/50 rounded-full overflow-hidden border border-border-subtle relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF8A00] via-[#00F5D4] to-[#38BDF8]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {question && (
                <motion.div
                  key={currentQIndex}
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.02, y: -20 }}
                  transition={springConfig}
                  className="neural-glass-panel p-8 md:p-12 space-y-8 rounded-[32px] relative overflow-hidden"
                >
                  {/* Question type and difficulty badges */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase"
                      style={{
                        background: (TYPE_CONFIG[qType]?.color || "#38BDF8") + "12",
                        border: `1px solid ${(TYPE_CONFIG[qType]?.color || "#38BDF8")}25`,
                        color: TYPE_CONFIG[qType]?.color || "#38BDF8",
                      }}
                    >
                      <Zap className="w-3 h-3" />
                      {TYPE_CONFIG[qType]?.label || "Question"}
                    </div>
                    {question.difficulty && (
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase"
                        style={{
                          background: DIFFICULTY_CONFIG[question.difficulty]?.bg || "rgba(255,255,255,0.05)",
                          color: DIFFICULTY_CONFIG[question.difficulty]?.color || "#64748B",
                          border: `1px solid ${(DIFFICULTY_CONFIG[question.difficulty]?.color || "#64748B")}25`,
                        }}
                      >
                        {question.difficulty}
                      </span>
                    )}
                    <span className="text-[10px] text-text-ghost font-mono ml-auto">Q{currentQIndex + 1}</span>
                  </div>

                  <h2 className="text-2xl text-text-primary font-display font-semibold leading-relaxed">
                    {question.question}
                  </h2>

                  {/* Render question body based on type */}
                  {renderQuestionBody()}

                  {!isSubmitted && !showHint && (
                    <button
                      onClick={() => setShowHint(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-quantum-orange bg-quantum-orange/5 border border-quantum-orange/15 cursor-pointer hover:bg-quantum-orange/10 transition-all"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Request AI Hint
                    </button>
                  )}

                  <AnimatePresence>
                    {showHint && !isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 rounded-2xl flex gap-3 bg-quantum-orange/5 border border-quantum-orange/15"
                      >
                        <Lightbulb className="w-4 h-4 text-quantum-orange shrink-0 mt-0.5 animate-bounce" />
                        <p className="text-sm text-text-secondary">
                          {qType === "FillBlank" ? `Hint: The answer starts with "${(question.correctAnswer || "")[0] || "..."}" and is ${(question.correctAnswer || "").length} characters long.` :
                           qType === "Match" ? "Hint: Think about the role each technology plays. Framework? Database? Language?" :
                           qType === "ShortAnswer" || qType === "Scenario" ? "Hint: Focus on the key concepts mentioned in the document. Reference specific technologies or methodologies." :
                           "Hint: Read each option carefully. Look for terms mapping directly to core concepts in the document."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl border border-neural-cyan/20 bg-neural-cyan/[0.03] space-y-2 relative"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-neural-cyan rounded-l-2xl" />
                        <h4 className="font-display font-bold text-text-primary flex items-center gap-2 text-sm uppercase tracking-wider text-neural-cyan">
                          <BrainCircuit className="w-4 h-4" /> Explanation
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-light whitespace-pre-line">
                          {question.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-6 flex justify-between items-center border-t border-white/5">
                    <div className="text-sm font-semibold">
                      {isSubmitted && (
                        <span className={isCorrect ? "text-neural-cyan" : "text-danger"}>
                          {isCorrect
                            ? `+${(qType === "Scenario" ? 200 : qType === "ShortAnswer" ? 150 : 100) * multiplier} points`
                            : "Multiplier reset"}
                        </span>
                      )}
                    </div>
                    {!isSubmitted ? (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSubmit(false)}
                        disabled={!canSubmit}
                        className="font-semibold px-8 py-3.5 rounded-xl text-sm disabled:opacity-40 cursor-pointer"
                        style={{
                          background: canSubmit ? "linear-gradient(135deg, #00F5D4, #38BDF8)" : "rgba(255,255,255,0.08)",
                          color: canSubmit ? "#050816" : "#64748B",
                          boxShadow: canSubmit ? "0 0 25px rgba(0, 245, 212, 0.15)" : "none",
                        }}
                      >
                        Submit Answer
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleNext}
                        className="font-semibold px-8 py-3.5 rounded-xl text-sm cursor-pointer flex items-center gap-2"
                        style={{
                          background: "linear-gradient(135deg, #FF8A00, #FFB800)",
                          color: "#050816",
                          boxShadow: "0 0 25px rgba(255, 138, 0, 0.15)",
                        }}
                      >
                        {currentQIndex < questions.length - 1 ? "Next Question" : "Complete Assessment"}
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Summary screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto neural-glass-panel p-10 rounded-[32px] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neural-cyan/30 to-transparent" />

            <div className="w-20 h-20 rounded-full bg-neural-cyan/10 border border-neural-cyan/20 flex items-center justify-center mx-auto mb-6 text-neural-cyan shadow-[0_0_30px_rgba(0,245,212,0.15)]">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-3xl font-display font-bold text-text-primary mb-3">
              Assessment Completed
            </h2>
            <p className="text-sm text-text-muted mb-8 max-w-sm mx-auto leading-relaxed">
              Excellent work! You completed the multi-format assessment for <span className="text-text-primary font-semibold">{selectedQuiz?.summaryTitle}</span>.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-void/50 border border-white/5">
                <p className="text-[10px] text-text-ghost uppercase font-bold tracking-wider mb-1">Accuracy</p>
                <p className="text-2xl font-display font-bold text-neural-cyan">{finalAccuracy}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-void/50 border border-white/5">
                <p className="text-[10px] text-text-ghost uppercase font-bold tracking-wider mb-1">Points</p>
                <p className="text-2xl font-display font-bold text-[#FF8A00]">{score}</p>
              </div>
              <div className="p-4 rounded-2xl bg-void/50 border border-white/5">
                <p className="text-[10px] text-text-ghost uppercase font-bold tracking-wider mb-1">Questions</p>
                <p className="text-2xl font-display font-bold text-[#38BDF8]">{questions.length}</p>
              </div>
            </div>

            {/* Question type breakdown */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[...new Set(questions.map((q: any) => q.type || "MCQ"))].map((type: any) => {
                const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.MCQ;
                const count = questions.filter((q: any) => (q.type || "MCQ") === type).length;
                return (
                  <span
                    key={type}
                    className="text-[10px] font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}20` }}
                  >
                    {cfg.label}: {count}
                  </span>
                );
              })}
            </div>

            <button
              onClick={returnToLobby}
              className="px-10 py-3.5 font-semibold rounded-xl text-sm transition-all cursor-pointer w-full text-center"
              style={{
                background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
                color: "#050816",
                boxShadow: "0 0 25px rgba(0, 245, 212, 0.2)",
              }}
            >
              Back to Lab
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
