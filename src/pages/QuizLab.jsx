import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  BrainCircuit,
  ChevronRight,
  Trophy,
  Zap,
  Timer,
  Flame,
  Sparkles,
  Lightbulb,
} from "lucide-react";

const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };

const sampleQuestions = [
  {
    id: 1,
    question: "What is the primary function of mitochondria in a cell?",
    options: [
      "Protein synthesis via ribosomes",
      "Cellular respiration and ATP energy production",
      "DNA storage and replication",
      "Waste elimination and enzyme breakdown",
    ],
    correctAnswer: 1,
    explanation:
      "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
    hint: "Think about energy — what organelle is nicknamed the 'powerhouse'?",
  },
  {
    id: 2,
    question:
      "Which of the following is NOT a part of the central nervous system?",
    options: [
      "The Brain",
      "The Spinal Cord",
      "Peripheral Sensory Neurons",
      "The Cerebellum",
    ],
    correctAnswer: 2,
    explanation:
      "Sensory neurons are part of the peripheral nervous system, which connects the central nervous system to the limbs and organs. The CNS consists solely of the brain and spinal cord.",
    hint: "The CNS is contained within protective bone structures (skull and vertebral column).",
  },
];

// SVG Timer Ring component
function TimerRing({ timeLeft, total, isSubmitted }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / total) * circumference;
  const isLow = timeLeft <= 5 && !isSubmitted;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
        {/* Background ring */}
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        {/* Progress ring */}
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

export function QuizLab() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [showCorrectBurst, setShowCorrectBurst] = useState(false);

  const question = sampleQuestions[currentQIndex];
  const isCorrect = isSubmitted && selectedAnswer === question.correctAnswer;

  useEffect(() => {
    if (!isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit(true);
    }
  }, [timeLeft, isSubmitted]);

  const handleSelect = (index) => {
    if (!isSubmitted) setSelectedAnswer(index);
  };

  const handleSubmit = (isTimeout = false) => {
    if ((selectedAnswer !== null || isTimeout) && !isSubmitted) {
      setIsSubmitted(true);
      if (!isTimeout && selectedAnswer === question.correctAnswer) {
        setScore((s) => s + 100 * multiplier);
        setStreak((s) => s + 1);
        setShowCorrectBurst(true);
        setTimeout(() => setShowCorrectBurst(false), 1200);
        if (streak > 0 && streak % 2 === 0)
          setMultiplier((m) => Math.min(m + 0.5, 3));
      } else {
        setStreak(0);
        setMultiplier(1);
      }
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setTimeLeft(30);
    setShowHint(false);
    if (currentQIndex < sampleQuestions.length - 1) {
      setCurrentQIndex((c) => c + 1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      {/* Ambient background that reacts to answers */}
      <AnimatePresence>
        {isSubmitted && (
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

      {/* Correct answer burst particles */}
      <AnimatePresence>
        {showCorrectBurst && (
          <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const distance = 80 + Math.random() * 120;
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
        {/* Top HUD */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary mb-1 flex items-center gap-3 tracking-tight">
              <BrainCircuit className="text-quantum-orange w-8 h-8 drop-shadow-[0_0_15px_rgba(255,138,0,0.5)]" />
              Neural Lab
            </h1>
            <p className="text-text-muted font-medium">
              Session: Cellular Biology • Module {currentQIndex + 1}/
              {sampleQuestions.length}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Ring */}
            <TimerRing
              timeLeft={timeLeft}
              total={30}
              isSubmitted={isSubmitted}
            />

            {/* Streak & Score */}
            <div
              className="neural-glass-panel px-6 py-3 flex items-center gap-6 rounded-2xl"
            >
              <div className="flex items-center gap-2">
                <Flame
                  className={`w-5 h-5 transition-all ${
                    streak >= 2
                      ? "text-quantum-orange drop-shadow-[0_0_10px_rgba(255,138,0,0.8)]"
                      : "text-text-muted"
                  }`}
                />
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    Streak
                  </p>
                  <p className="font-display font-bold text-text-primary text-lg leading-none">
                    {streak}{" "}
                    <span className="text-neural-cyan text-sm ml-1">
                      x{multiplier}
                    </span>
                  </p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/8" />
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-quantum-orange drop-shadow-[0_0_10px_rgba(255,138,0,0.5)]" />
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    Score
                  </p>
                  <p className="font-display font-bold text-text-primary text-lg leading-none">
                    {score}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Wave Bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden relative"
          style={{
            background: "rgba(5, 8, 22, 0.8)",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: "linear-gradient(90deg, #FF8A00, #00F5D4, #38BDF8)",
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((currentQIndex + (isSubmitted ? 1 : 0)) /
                  sampleQuestions.length) *
                100
              }%`,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          >
            {/* Shimmer wave on progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -20 }}
            transition={{ type: "spring", ...springConfig }}
            className="neural-glass-panel p-8 md:p-12 space-y-10 rounded-[32px] relative overflow-hidden"
          >
            {/* Internal glow */}
            <div
              className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />

            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase mb-6"
                style={{
                  background: "rgba(5, 8, 22, 0.8)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#38BDF8",
                }}
              >
                <Zap className="w-3.5 h-3.5" />
                Question {currentQIndex + 1}
              </div>
              <h2 className="text-3xl text-text-primary font-display font-medium leading-relaxed tracking-tight">
                {question.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid gap-4">
              {question.options.map((opt, i) => {
                const isCorrectOption = i === question.correctAnswer;
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
                    // Shake animation on wrong answer
                    animate={
                      isSubmitted && isSelected && !isCorrectOption
                        ? { x: [0, -4, 4, -3, 3, 0] }
                        : {}
                    }
                    transition={
                      isSubmitted && isSelected && !isCorrectOption
                        ? { duration: 0.4, ease: "easeInOut" }
                        : springConfig
                    }
                    onClick={() => handleSelect(i)}
                    disabled={isSubmitted}
                    className="w-full text-left p-5 rounded-2xl flex items-center justify-between group transition-all duration-300"
                    style={{
                      border: `1px solid ${borderColor}`,
                      background: bg,
                      boxShadow: shadow,
                      opacity,
                      cursor: isSubmitted ? "default" : "pointer",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm transition-all"
                        style={{
                          background:
                            isSubmitted && isCorrectOption
                              ? "#00F5D4"
                              : isSubmitted && isSelected && !isCorrectOption
                              ? "#EF4444"
                              : isSelected
                              ? "#FF8A00"
                              : "rgba(5, 8, 22, 0.8)",
                          color:
                            isSelected || (isSubmitted && isCorrectOption)
                              ? "#050816"
                              : "#64748B",
                          border:
                            !isSelected && !(isSubmitted && isCorrectOption)
                              ? "1px solid rgba(255,255,255,0.08)"
                              : "none",
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span
                        className={`text-lg font-medium transition-colors ${
                          isSelected || (isSubmitted && isCorrectOption)
                            ? "text-text-primary"
                            : "text-text-secondary group-hover:text-text-primary"
                        }`}
                      >
                        {opt}
                      </span>
                    </div>
                    {isSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-6 h-6 text-neural-cyan drop-shadow-[0_0_8px_rgba(0,245,212,0.5)]" />
                    )}
                    {isSubmitted && isSelected && !isCorrectOption && (
                      <XCircle className="w-6 h-6 text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* AI Hint */}
            {!isSubmitted && !showHint && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-quantum-orange transition-all"
                style={{
                  background: "rgba(255, 138, 0, 0.08)",
                  border: "1px solid rgba(255, 138, 0, 0.2)",
                }}
              >
                <Lightbulb className="w-4 h-4" />
                Request AI Hint
              </motion.button>
            )}

            <AnimatePresence>
              {showHint && !isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springConfig}
                  className="overflow-hidden"
                >
                  <div
                    className="p-5 rounded-2xl flex gap-3"
                    style={{
                      background: "rgba(255, 138, 0, 0.06)",
                      border: "1px solid rgba(255, 138, 0, 0.15)",
                    }}
                  >
                    <Lightbulb className="w-5 h-5 text-quantum-orange shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {question.hint}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Explanation on submit */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  transition={{ type: "spring", ...springConfig }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-6 rounded-2xl space-y-3 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(0, 245, 212, 0.06), transparent)",
                      border: "1px solid rgba(0, 245, 212, 0.15)",
                    }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-neural-cyan rounded-l-2xl" />
                    <h4 className="font-display font-bold text-text-primary flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-neural-cyan" />{" "}
                      Neural Explanation
                    </h4>
                    <p className="text-text-secondary leading-relaxed font-light">
                      {question.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer actions */}
            <div className="pt-6 flex justify-between items-center border-t border-white/5">
              <div className="text-sm font-medium">
                {isSubmitted && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={
                      isCorrect ? "text-neural-cyan" : "text-danger"
                    }
                  >
                    {isCorrect
                      ? `+${100 * multiplier} points`
                      : "Streak lost"}
                  </motion.span>
                )}
              </div>
              {!isSubmitted ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springConfig}
                  onClick={() => handleSubmit(false)}
                  disabled={selectedAnswer === null}
                  className="font-semibold px-10 py-3.5 rounded-xl flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      selectedAnswer !== null
                        ? "linear-gradient(135deg, #00F5D4, #38BDF8)"
                        : "rgba(255,255,255,0.1)",
                    color: selectedAnswer !== null ? "#050816" : "#94A3B8",
                    boxShadow:
                      selectedAnswer !== null
                        ? "0 0 25px rgba(0, 245, 212, 0.2)"
                        : "none",
                  }}
                >
                  Submit Answer
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springConfig}
                  onClick={handleNext}
                  className="font-semibold px-10 py-3.5 rounded-xl flex items-center gap-2 text-sm"
                  style={{
                    background: "linear-gradient(135deg, #FF8A00, #FFB800)",
                    color: "#050816",
                    boxShadow: "0 0 25px rgba(255, 138, 0, 0.2)",
                  }}
                >
                  {currentQIndex < sampleQuestions.length - 1
                    ? "Next Sequence"
                    : "Complete Session"}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
