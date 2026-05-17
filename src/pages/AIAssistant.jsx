import { useState } from "react";
import { Send, Bot, User, Paperclip } from "lucide-react";
import { motion } from "framer-motion";

export function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your NeuroLearn AI. I've analyzed your recent uploads. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: "That's an interesting question. Based on the 'Neuroscience 101' document, synaptic plasticity is..." }]);
    }, 1500);
  };

  return (
    <div className="p-8 h-[calc(100vh-5rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Assistant</h1>
        <p className="text-text-muted mb-6">Chat with your workspace context.</p>
      </div>

      <div className="premium-card flex-1 flex flex-col overflow-hidden relative">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'ai' ? 'bg-gradient-teal text-card' : 'bg-white/10 text-white'
              }`}>
                {msg.role === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] ${
                msg.role === 'ai' ? 'bg-white/5 border border-white/10 text-white' : 'bg-gradient-orange text-white'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-card/50 backdrop-blur-sm">
          <div className="relative flex items-center">
            <button className="absolute left-4 text-text-muted hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your study materials..."
              className="w-full bg-base border border-white/10 rounded-full py-3 pl-12 pr-14 text-white focus:outline-none focus:border-accent-teal transition-colors"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 p-2 bg-gradient-teal rounded-full text-card hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
