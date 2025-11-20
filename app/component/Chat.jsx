'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Hammer } from 'lucide-react';

export default function BuildCraftAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm BuildCraft AI. Tell me what you're trying to build (like a shelf, deck, or workbench), and I’ll suggest tools, materials, and steps.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newConversation = [...messages, userMessage];

    // update UI immediately
    setMessages(newConversation);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/buildcraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newConversation }),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      const data = await res.json();
      if (data?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      }
    } catch (err) {
      console.error('BuildCraft error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Hmm, something went wrong talking to the AI. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full shadow-lg 
                     w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-400 text-white
                     hover:scale-105 transition-transform"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-pink-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            AI
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-28 right-6 z-40 
                        w-[380px] h-[520px] max-w-[90vw] 
                        rounded-2xl shadow-2xl bg-white overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 
                          bg-gradient-to-r from-orange-500 to-amber-400 text-white">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <Hammer className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-semibold text-sm">BuildCraft AI Assistant</h2>
                <p className="text-xs text-orange-50">
                  Ask me about your building project
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-white/15"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 bg-slate-50">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`mb-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="mr-2 mt-auto w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                      <Hammer className="w-3 h-3 text-orange-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="mb-2 flex justify-start">
                <div className="mr-2 mt-auto w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                  <Hammer className="w-3 h-3 text-orange-600" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-slate-500 flex items-center gap-1">
                  <span className="inline-block animate-bounce [animation-delay:-0.2s]">
                    •
                  </span>
                  <span className="inline-block animate-bounce [animation-delay:-0.1s]">
                    •
                  </span>
                  <span className="inline-block animate-bounce">•</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 px-3 py-2 bg-white">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about your project..."
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs
                           outline-none focus:ring-2 focus:ring-orange-400/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-full w-8 h-8 flex items-center justify-center 
                           bg-orange-500 text-white text-xs hover:bg-orange-600 disabled:opacity-50 
                           disabled:cursor-not-allowed transition-colors"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
