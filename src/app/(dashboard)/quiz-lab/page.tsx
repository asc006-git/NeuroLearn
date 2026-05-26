"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, BrainCircuit, ChevronRight, Trophy, Flame, Lightbulb, Zap, Loader2, Play } from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

function TimerRing({ timeLeft, total, isSubmitted }: { timeLeft: number; total: number; isSubmitted: boolean }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / total) * circumference;
  const isLow = timeLeft <= 5 && !isSubmitted;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        <motion.circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke={isLow ? "#EF4444" : "#00F5D4"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            filter: isLow
              ? "drop-shadow(0 0 8px rgba(239,68,68,0.6))"
              : "drop-shadow(0 0 8px rgba(0,245,212,0.4))",
          }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <span
        className={`absolute font-display font-bold text-lg ${
          isLow ? "text-danger animate-pulse" : "text-text-primary"
        }`}
      >
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

  // Robust correct option matching
  const isCorrect = useMemo(() => {
    if (!question || selectedAnswer === null) return false;
    const ans = question.correctAnswer;
    return ans === selectedAnswer || question.options[selectedAnswer] === ans;
  }, [question, selectedAnswer]);

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
    if ((selectedAnswer !== null || isTimeout) && !isSubmitted) {
      setIsSubmitted(true);
      if (!isTimeout && isCorrect) {
        setScore((s) => s + 100 * multiplier);
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
    setTimeLeft(30);
    setShowHint(false);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((c) => c + 1);
    } else {
      // Quiz complete!
      setGameState("summary");
      setSubmittingScore(true);
      try {
        const finalAccuracy = Math.round((score / (questions.length * 100)) * 100) || 0;
        await fetch("/api/quizzes/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: selectedQuiz.id,
            score: finalAccuracy,
            duration: questions.length, // assume 1 min per card
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
    setTimeLeft(30);
    setGameState("playing");
  };

  const returnToLobby = () => {
    setGameState("lobby");
    setSelectedQuiz(null);
    fetchQuizzes();
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      {/* Ambient reactive background */}
      <AnimatePresence>
        {gameState === "playing" && isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 0,
                    opacity: 0,
                  }}
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
                Engage in adaptive visual memory challenges to solidify document knowledge.
              </p>
            </div>

            {quizzes.length === 0 ? (
              <div className="w-full min-h-[20rem] flex flex-col items-center justify-center text-center bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                <div className="w-16 h-16 bg-white/5 border border-white/8 rounded-2xl flex items-center justify-center mb-5 text-text-muted">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">No dynamic quizzes compiled</h3>
                <p className="text-sm text-text-muted max-w-sm leading-relaxed">
                  Ingest PDF documents from the dashboard. The system compiles custom concept cards and multiple choice quiz pipelines automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map((quiz, i) => (
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
                          Active Ingestion
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-semibold text-text-primary mb-2 leading-snug">
                        {quiz.summaryTitle}
                      </h3>
                      <p className="text-xs text-text-muted mb-4 font-mono">
                        Source: {quiz.documentTitle}
                      </p>
                    </div>

                    <button
                      onClick={() => startQuiz(quiz)}
                      className="w-full py-3 rounded-xl bg-base border border-white/8 hover:border-neural-cyan/30 text-text-primary text-xs font-semibold flex items-center justify-center gap-2 group cursor-pointer transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Initiate Assessment
                    </button>
                  </motion.div>
                ))}
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
                  Ingestion module {currentQIndex + 1}/{questions.length}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <TimerRing timeLeft={timeLeft} total={30} isSubmitted={isSubmitted} />

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
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase mb-4 bg-void/50 border border-white/5 text-[#38BDF8]">
                      <Zap className="w-3 h-3" /> Question {currentQIndex + 1}
                    </div>
                    <h2 className="text-2xl text-text-primary font-display font-semibold leading-relaxed">
                      {question.question}
                    </h2>
                  </div>

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
                          style={{
                            borderColor,
                            background: bg,
                            boxShadow: shadow,
                            opacity,
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                              style={{
                                background:
                                  isSubmitted && isCorrectOption
                                    ? "#00F5D4"
                                    : isSubmitted && isSelected && !isCorrectOption
                                    ? "#EF4444"
                                    : isSelected
                                    ? "#FF8A00"
                                    : "rgba(5, 8, 22, 0.8)",
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
                  </div>

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
                          Hint: Read options carefully. Look for terms mapping directly to core concepts in the distilled summary briefs.
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
                          <BrainCircuit className="w-4 h-4" /> Cognitive Analysis Context
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
                          {isCorrect ? `+${100 * multiplier} points` : "Multiplier reset"}
                        </span>
                      )}
                    </div>
                    {!isSubmitted ? (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSubmit(false)}
                        disabled={selectedAnswer === null}
                        className="font-semibold px-8 py-3.5 rounded-xl text-sm disabled:opacity-40 cursor-pointer"
                        style={{
                          background: selectedAnswer !== null ? "linear-gradient(135deg, #00F5D4, #38BDF8)" : "rgba(255,255,255,0.08)",
                          color: selectedAnswer !== null ? "#050816" : "#64748B",
                          boxShadow: selectedAnswer !== null ? "0 0 25px rgba(0, 245, 212, 0.15)" : "none",
                        }}
                      >
                        Submit Answer
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleNext}
                        className="font-semibold px-8 py-3.5 rounded-xl text-sm cursor-pointer"
                        style={{
                          background: "linear-gradient(135deg, #FF8A00, #FFB800)",
                          color: "#050816",
                          boxShadow: "0 0 25px rgba(255, 138, 0, 0.15)",
                        }}
                      >
                        {currentQIndex < questions.length - 1 ? "Next Sequence" : "Complete Assessment"}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Lobby completeness summary screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto neural-glass-panel p-10 rounded-[32px] text-center relative overflow-hidden"
          >
            {/* Top ambient highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neural-cyan/30 to-transparent" />

            <div className="w-20 h-20 rounded-full bg-neural-cyan/10 border border-neural-cyan/20 flex items-center justify-center mx-auto mb-6 text-neural-cyan shadow-[0_0_30px_rgba(0,245,212,0.15)]">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-3xl font-display font-bold text-text-primary mb-3">
              Assessment Completed
            </h2>
            <p className="text-sm text-text-muted mb-8 max-w-sm mx-auto leading-relaxed">
              Fantastic! You have completed the training module for <span className="text-text-primary font-semibold">{selectedQuiz?.summaryTitle}</span>. Your workspace index is successfully synced.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-void/50 border border-white/5">
                <p className="text-[10px] text-text-ghost uppercase font-bold tracking-wider mb-1">Final Score</p>
                <p className="text-2xl font-display font-bold text-neural-cyan">{score}</p>
              </div>
              <div className="p-4 rounded-2xl bg-void/50 border border-white/5">
                <p className="text-[10px] text-text-ghost uppercase font-bold tracking-wider mb-1">Session Accuracy</p>
                <p className="text-2xl font-display font-bold text-[#FF8A00]">{Math.round((score / (questions.length * 100)) * 100) || 0}%</p>
              </div>
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
