import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, BrainCircuit } from "lucide-react";
import { cn } from "../../lib/utils";

const QUESTION = {
  text: "What is the primary algorithm used for training artificial neural networks?",
  options: [
    { id: "A", text: "Genetic Algorithm", correct: false },
    { id: "B", text: "Backpropagation", correct: true },
    { id: "C", text: "K-Means Clustering", correct: false },
    { id: "D", text: "Linear Regression", correct: false },
  ]
};

export function QuizLab() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleSelect = (id) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
  };

  return (
    <section className="w-full mt-10">
      <div className="flex items-center gap-2 mb-4 px-1">
        <BrainCircuit className="w-4 h-4 text-text-muted" />
        <h3 className="text-sm font-semibold text-text-main">Knowledge Check</h3>
      </div>

      <div className="premium-card p-6 md:p-8">
        <h4 className="text-lg font-medium text-text-main mb-6 leading-relaxed max-w-2xl">
          {QUESTION.text}
        </h4>

        <div className="space-y-3">
          {QUESTION.options.map((opt) => {
            const isSelected = selectedAnswer === opt.id;
            const isCorrect = opt.correct;
            const showResult = selectedAnswer !== null;
            
            let stateClass = "bg-base border-border-subtle hover:border-white/20 text-text-muted hover:text-text-main";
            let icon = null;

            if (showResult) {
              if (isCorrect) {
                stateClass = "bg-teal/10 border-teal text-text-main shadow-[0_0_15px_rgba(20,184,166,0.15)]";
                icon = <CheckCircle2 className="w-4 h-4 text-teal" />;
              } else if (isSelected && !isCorrect) {
                stateClass = "bg-orange/10 border-orange text-text-main";
                icon = <XCircle className="w-4 h-4 text-orange" />;
              } else {
                stateClass = "bg-base border-border-subtle opacity-40";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={showResult}
                className={cn(
                  "w-full text-left px-5 py-3.5 rounded-xl border flex items-center justify-between transition-all duration-300",
                  stateClass
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-base border border-border-subtle opacity-70">
                    {opt.id}
                  </span>
                  <span className="text-sm font-medium">{opt.text}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              className="flex justify-end"
            >
              <button className="px-5 py-2 rounded-lg bg-text-main text-base font-semibold text-sm transition-colors hover:bg-white">
                Continue to Next
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
