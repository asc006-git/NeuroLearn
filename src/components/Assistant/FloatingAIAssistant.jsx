import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, BrainCircuit, Bot } from "lucide-react";
import { cn } from "../../lib/utils";

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: "ai", text: "Hello. I am your Neural Assistant. How can I assist with your studies today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), type: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: "ai",
        text: "Analyzing context... I'm currently running in limited demonstration mode, but in a full environment, I would cross-reference this with your uploaded documents."
      }]);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-white text-[#060816] flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] z-50 group border border-white/20"
          >
            <div className="absolute inset-0 rounded-full bg-white blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-6 h-6 relative z-10" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-accent-teal rounded-full border-2 border-[#060816]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 right-8 w-[400px] h-[600px] max-h-[80vh] flex flex-col premium-glass-panel rounded-[32px] overflow-hidden z-50 border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-between shrink-0 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-teal to-accent-orange" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent-teal/10 text-accent-teal border border-accent-teal/20 relative">
                  <div className="absolute inset-0 bg-accent-teal/20 blur-md rounded-xl" />
                  <BrainCircuit className="w-5 h-5 relative z-10" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white leading-tight">Neural Assistant</h3>
                  <p className="text-xs text-accent-teal flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#060816] text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-[#060816]/40 backdrop-blur-sm relative">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={cn(
                    "flex max-w-[85%]",
                    msg.type === "user" ? "ml-auto justify-end" : "mr-auto"
                  )}
                >
                  {msg.type === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center mr-3 shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-text-muted" />
                    </div>
                  )}
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.type === "user" 
                      ? "bg-white text-[#060816] rounded-br-sm font-medium" 
                      : "bg-[#0B1120] border border-white/5 text-white/90 rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0B1120]/90 backdrop-blur-xl border-t border-white/5 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-[#060816] border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/20 transition-all placeholder:text-text-subtle"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 p-2 text-text-muted hover:text-white disabled:opacity-50 disabled:hover:text-text-muted transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
