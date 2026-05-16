import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, RefreshCw, FileText, LayoutList, MessageSquare, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";

const TABS = [
  { id: "quick", label: "Quick Summary", icon: FileText },
  { id: "detailed", label: "Detailed Notes", icon: LayoutList },
  { id: "simple", label: "Explain Like I'm 5", icon: MessageSquare },
  { id: "smart", label: "Smart Flashcards", icon: BookOpen },
];

const CONTENT = {
  quick: "Neural networks are computational models inspired by the human brain. They consist of interconnected nodes (neurons) organized in layers, designed to recognize patterns and solve complex problems through machine learning.",
  detailed: "The architecture of a typical neural network includes an input layer, hidden layers, and an output layer. Backpropagation is the primary algorithm used for training, where the network adjusts its weights based on the error rate to minimize the loss function.",
  simple: "Imagine a big group of friends trying to guess what animal is in a picture. Some friends look at the ears, some look at the tail. They talk to each other and finally vote on the answer. That's exactly how a neural network works to make decisions!",
  smart: "Flashcard 1: What is a neural network? \nAnswer: A computational model inspired by biological brains.\n\nFlashcard 2: What is Backpropagation?\nAnswer: The method used to calculate the error gradient and adjust weights."
};

export function SummaryCards() {
  const [activeTab, setActiveTab] = useState("quick");

  return (
    <section className="w-full mt-10">
      <div className="premium-card p-2 mb-4 flex items-center justify-between overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive ? "text-text-main" : "text-text-muted hover:text-text-main hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-white/10 rounded-lg border border-border-subtle"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-amber")} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2 pl-4 border-l border-border-subtle ml-2 shrink-0">
          <button className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-white/5 transition-colors group relative">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-white/5 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="premium-card p-6 min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-text-main text-sm leading-relaxed whitespace-pre-line"
          >
            {CONTENT[activeTab]}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end">
          <button className="text-xs flex items-center gap-1.5 text-text-muted hover:text-text-main transition-colors bg-base px-3 py-1.5 rounded-md border border-border-subtle hover:border-white/20">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate Output
          </button>
        </div>
      </div>
    </section>
  );
}
