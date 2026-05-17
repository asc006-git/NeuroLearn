import { useState } from "react";
import { Lightbulb, ChevronRight, Pin, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const notes = [
  {
    id: 1,
    topic: "Action Potentials",
    pinned: true,
    points: [
      "Rapid rise and subsequent fall in voltage or membrane potential.",
      "Follows the 'all-or-none' principle.",
      "Caused by the opening and closing of voltage-gated ion channels."
    ]
  },
  {
    id: 2,
    topic: "Neurotransmitters",
    pinned: false,
    points: [
      "Chemical messengers that cross the synaptic gaps between neurons.",
      "Excitatory (e.g., Glutamate) vs. Inhibitory (e.g., GABA)."
    ]
  }
];

export function SmartNotes() {
  const [expanded, setExpanded] = useState(notes.map(n => n.id));

  const toggleExpand = (id) => {
    setExpanded(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Lightbulb className="text-accent-amber w-8 h-8" />
          Smart Notes
        </h1>
        <p className="text-text-muted">Auto-generated key takeaways from your documents.</p>
      </div>

      <div className="space-y-4">
        {notes.map((note) => {
          const isExpanded = expanded.includes(note.id);
          return (
            <div key={note.id} className="premium-card overflow-hidden">
              <button 
                onClick={() => toggleExpand(note.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-transparent data-[expanded=true]:border-white/5"
                data-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                    <ChevronRight className="w-5 h-5 text-text-muted" />
                  </motion.div>
                  <Hash className="w-4 h-4 text-accent-teal" />
                  <h3 className="font-semibold text-white">{note.topic}</h3>
                </div>
                {note.pinned && <Pin className="w-4 h-4 text-accent-amber" />}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-card/50 px-12 py-4"
                  >
                    <ul className="space-y-3">
                      {note.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-text-muted leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-orange mt-2 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
