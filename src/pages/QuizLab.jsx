import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, BrainCircuit, ChevronRight, Trophy } from "lucide-react";
import clsx from "clsx";

const sampleQuestions = [
  {
    id: 1,
    question: "What is the primary function of mitochondria in a cell?",
    options: [
      "Protein synthesis",
      "Cellular respiration and energy production",
      "DNA storage",
      "Waste elimination"
    ],
    correctAnswer: 1,
    explanation: "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
  },
  {
    id: 2,
    question: "Which of the following is NOT a part of the central nervous system?",
    options: [
      "Brain",
      "Spinal Cord",
      "Sensory Neurons",
      "Cerebellum"
    ],
    correctAnswer: 2,
    explanation: "Sensory neurons are part of the peripheral nervous system, which connects the central nervous system to the limbs and organs."
  }
];

export function QuizLab() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const question = sampleQuestions[currentQIndex];

  const handleSelect = (index) => {
    if (!isSubmitted) setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null && !isSubmitted) {
      setIsSubmitted(true);
      if (selectedAnswer === question.correctAnswer) {
        setScore(s => s + 1);
      }
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    if (currentQIndex < sampleQuestions.length - 1) {
      setCurrentQIndex(c => c + 1);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BrainCircuit className="text-accent-teal w-8 h-8" />
            Quiz Lab
          </h1>
          <p className="text-text-muted">Test your knowledge on recently processed documents.</p>
        </div>
        <div className="premium-card px-6 py-3 flex items-center gap-4">
          <Trophy className="w-5 h-5 text-accent-amber" />
          <div className="text-right">
            <p className="text-xs text-text-muted">Current Score</p>
            <p className="font-bold text-white text-lg">{score} / {sampleQuestions.length}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
        <motion.div 
          className="bg-gradient-teal h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQIndex + (isSubmitted ? 1 : 0)) / sampleQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentQIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="premium-card p-8 md:p-12 space-y-8"
      >
        <div>
          <span className="text-sm font-semibold text-accent-teal mb-4 block">Question {currentQIndex + 1} of {sampleQuestions.length}</span>
          <h2 className="text-2xl text-white font-medium leading-relaxed">{question.question}</h2>
        </div>

        <div className="space-y-4">
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correctAnswer;
            const isSelected = selectedAnswer === i;
            let stateClass = "border-white/10 hover:border-white/30 hover:bg-white/5";
            
            if (isSubmitted) {
              if (isCorrect) stateClass = "border-green-500/50 bg-green-500/10 text-green-100";
              else if (isSelected) stateClass = "border-red-500/50 bg-red-500/10 text-red-100";
              else stateClass = "border-white/5 opacity-50";
            } else if (isSelected) {
              stateClass = "border-accent-teal bg-accent-teal/10 shadow-[0_0_15px_rgba(20,184,166,0.15)]";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={isSubmitted}
                className={clsx(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between",
                  stateClass,
                  !isSubmitted && "cursor-pointer"
                )}
              >
                <span className="text-white text-lg">{opt}</span>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-2 overflow-hidden"
            >
              <h4 className="font-semibold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-accent-teal" /> AI Explanation
              </h4>
              <p className="text-text-muted leading-relaxed">{question.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 flex justify-end">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="bg-gradient-teal hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-card font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-white hover:bg-white/90 text-card font-semibold px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              {currentQIndex < sampleQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
