import { Network } from "lucide-react";
import { cn } from "../../lib/utils";

const KEYWORDS = [
  { text: "Machine Learning", confidence: "High" },
  { text: "Neural Networks", confidence: "High" },
  { text: "Backpropagation", confidence: "Medium" },
  { text: "Deep Learning", confidence: "High" },
  { text: "Gradient Descent", confidence: "Low" },
  { text: "Loss Function", confidence: "Medium" },
  { text: "Weights & Biases", confidence: "Medium" },
];

export function KeywordCloud() {
  return (
    <section className="w-full mt-8">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Network className="w-4 h-4 text-text-muted" />
        <h3 className="text-sm font-semibold text-text-main">Extracted Concepts</h3>
      </div>

      <div className="premium-card p-5">
        <div className="flex flex-wrap gap-3">
          {KEYWORDS.map((kw, idx) => {
            let dotColor = "bg-teal";
            if (kw.confidence === "Medium") dotColor = "bg-amber";
            if (kw.confidence === "Low") dotColor = "bg-orange";

            return (
              <div 
                key={idx}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-base border border-border-subtle hover:border-teal/30 hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                <span className="text-xs font-medium text-text-main group-hover:text-white transition-colors">
                  {kw.text}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
          <span>Click a concept to explore related materials.</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-teal" /> High</div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber" /> Med</div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange" /> Low</div>
          </div>
        </div>
      </div>
    </section>
  );
}
