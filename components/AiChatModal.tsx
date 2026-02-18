
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Copy, Check, Bot, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  isProcessing: boolean;
  onInsertAtCursor: (text: string) => void;
}

const AiChatModal: React.FC<AiChatModalProps> = ({ 
  isOpen, onClose, onSendMessage, messages, isProcessing, onInsertAtCursor 
}) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col h-[80vh] overflow-hidden border office-border">
        
        {/* Header Profissional - Cor do texto ajusta via CSS var */}
        <div className="office-blue p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Blue IA Assistant</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70 p-1 rounded transition-opacity">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-auto p-6 flex flex-col gap-6 bg-gray-50/30">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 opacity-50">
               <Sparkles size={48} />
               <p className="text-sm font-medium">Como posso ajudar com seu texto hoje?</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-800 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-xl shadow-sm text-sm ${
                msg.role === 'user' ? 'bg-[#2b579a] text-white' : 'bg-white border border-gray-200 text-gray-800'
              }`}>
                <div className="prose prose-sm max-w-none prose-inherit">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => onInsertAtCursor(msg.text)}
                    className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-blue-600 hover:text-blue-800"
                  >
                    <Check size={12} /> Inserir no editor
                  </button>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white"><Bot size={16} /></div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 text-gray-500 text-sm animate-pulse">
                Aguarde...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t office-border flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte qualquer coisa à Blue IA..."
            className="flex-1 bg-gray-50 border office-border rounded-full px-5 py-3 text-sm outline-none focus:border-blue-500 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="w-12 h-12 rounded-full bg-[#2b579a] text-white flex items-center justify-center shadow-lg hover:opacity-90 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChatModal;
