import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, BrainCircuit, ChevronRight, Trophy, Zap, Timer, Flame } from "lucide-react";
import clsx from "clsx";

const sampleQuestions = [
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
    explanation: "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
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
    explanation: "Sensory neurons are part of the peripheral nervous system, which connects the central nervous system to the limbs and organs. The CNS consists solely of the brain and spinal cord."
  }
];

export function QuizLab() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);

  const question = sampleQuestions[currentQIndex];
  const isCorrect = isSubmitted && selectedAnswer === question.correctAnswer;

  useEffect(() => {
    if (!isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit(true); // auto submit on timeout
    }
  }, [timeLeft, isSubmitted]);

  const handleSelect = (index) => {
    if (!isSubmitted) setSelectedAnswer(index);
  };

  const handleSubmit = (isTimeout = false) => {
    if ((selectedAnswer !== null || isTimeout) && !isSubmitted) {
      setIsSubmitted(true);
      if (!isTimeout && selectedAnswer === question.correctAnswer) {
        setScore(s => s + (100 * multiplier));
        setStreak(s => s + 1);
        if (streak > 0 && streak % 2 === 0) setMultiplier(m => Math.min(m + 0.5, 3));
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
    if (currentQIndex < sampleQuestions.length - 1) {
      setCurrentQIndex(c => c + 1);
    }
  };

  // Dynamic background based on state
  const bgGlow = isSubmitted 
    ? isCorrect ? "bg-accent-teal/20" : "bg-red-500/20"
    : "bg-accent-orange/10";

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      {/* Ambient background that reacts to answers */}
      <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 blur-[150px] opacity-30 ${bgGlow}`} />

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        {/* Top HUD */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-1 flex items-center gap-3 tracking-tight">
              <BrainCircuit className="text-accent-orange w-8 h-8 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
              Neural Lab
            </h1>
            <p className="text-text-muted font-medium">Session: Cellular Biology • Module {currentQIndex + 1}/{sampleQuestions.length}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl border bg-[#0B1120]",
              timeLeft <= 5 && !isSubmitted ? "border-red-500 text-red-500 animate-pulse" : "border-white/10 text-white"
            )}>
              <Timer className="w-5 h-5" />
              <span className="font-display font-bold text-xl w-8 text-center">{timeLeft}s</span>
            </div>

            {/* Streak & Score */}
            <div className="premium-glass-panel px-6 py-2.5 flex items-center gap-6 rounded-2xl border-white/10">
              <div className="flex items-center gap-2">
                <Flame className={clsx("w-5 h-5 transition-colors", streak >= 2 ? "text-accent-orange drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" : "text-text-muted")} />
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Streak</p>
                  <p className="font-display font-bold text-white text-lg leading-none">{streak} <span className="text-accent-teal text-sm ml-1">x{multiplier}</span></p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent-amber drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Score</p>
                  <p className="font-display font-bold text-white text-lg leading-none">{score}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#060816] h-1.5 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-accent-orange via-accent-teal to-accent-cyan"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQIndex + (isSubmitted ? 1 : 0)) / sampleQuestions.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQIndex}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="premium-glass-panel p-8 md:p-12 space-y-10 rounded-[32px] border border-white/10 relative overflow-hidden"
          >
            {/* Card internal glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#060816] border border-white/5 rounded-lg text-accent-cyan text-xs font-bold tracking-widest uppercase mb-6">
                <Zap className="w-3.5 h-3.5" />
                Question {currentQIndex + 1}
              </div>
              <h2 className="text-3xl text-white font-display font-medium leading-relaxed tracking-tight">
                {question.question}
              </h2>
            </div>

            <div className="grid gap-4">
              {question.options.map((opt, i) => {
                const isCorrectOption = i === question.correctAnswer;
                const isSelected = selectedAnswer === i;
                
                let stateClass = "border-white/10 hover:border-white/30 hover:bg-white/5 bg-[#0B1120]";
                
                if (isSubmitted) {
                  if (isCorrectOption) stateClass = "border-accent-teal bg-accent-teal/10 shadow-[0_0_20px_rgba(20,184,166,0.2)]";
                  else if (isSelected) stateClass = "border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
                  else stateClass = "border-white/5 bg-[#060816] opacity-40";
                } else if (isSelected) {
                  stateClass = "border-accent-orange bg-accent-orange/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]";
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={!isSubmitted ? { scale: 1.01, x: 5 } : {}}
                    whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(i)}
                    disabled={isSubmitted}
                    className={clsx(
                      "w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
                      stateClass,
                      !isSubmitted && "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm transition-colors",
                        isSubmitted && isCorrectOption ? "bg-accent-teal text-[#060816]" :
                        isSubmitted && isSelected && !isCorrectOption ? "bg-red-500 text-white" :
                        isSelected ? "bg-accent-orange text-[#060816]" : "bg-[#060816] text-text-muted group-hover:text-white border border-white/10"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={clsx("text-lg font-medium transition-colors", isSelected || (isSubmitted && isCorrectOption) ? "text-white" : "text-text-muted group-hover:text-white")}>
                        {opt}
                      </span>
                    </div>
                    {isSubmitted && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-accent-teal drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]" />}
                    {isSubmitted && isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gradient-to-br from-accent-teal/10 to-transparent border border-accent-teal/20 rounded-2xl space-y-3 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-teal rounded-l-2xl" />
                    <h4 className="font-display font-bold text-white flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-accent-teal" /> Neural Explanation
                    </h4>
                    <p className="text-white/80 leading-relaxed font-light">{question.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6 flex justify-between items-center border-t border-white/5">
              <div className="text-sm font-medium">
                {isSubmitted && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={isCorrect ? "text-accent-teal glow-teal" : "text-red-400"}
                  >
                    {isCorrect ? `+${100 * multiplier} points` : "Streak lost"}
                  </motion.span>
                )}
              </div>
              {!isSubmitted ? (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={selectedAnswer === null}
                  className="bg-white hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed text-[#060816] font-semibold px-10 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-accent-orange hover:bg-orange-400 text-[#060816] font-semibold px-10 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  {currentQIndex < sampleQuestions.length - 1 ? "Next Sequence" : "Complete Session"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
