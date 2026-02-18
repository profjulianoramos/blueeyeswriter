
import React, { useState } from 'react';
import { Sparkles, Wand2, Eraser, Search, MessageSquare } from 'lucide-react';

interface FloatingAiMenuProps {
  onAction: (type: 'completar' | 'corrigir' | 'explicar' | 'chat') => void;
  disabled?: boolean;
}

const FloatingAiMenu: React.FC<FloatingAiMenuProps> = ({ onAction, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (disabled) return null;

  return (
    <div className="fixed bottom-12 right-6 z-[90] flex flex-col items-end gap-2">
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2">
          <button 
            onClick={() => { onAction('chat'); setIsOpen(false); }}
            className="flex items-center gap-3 px-4 py-2 bg-white text-[#2b579a] rounded-full shadow-lg border office-border hover:bg-blue-50 transition-all font-medium text-sm"
          >
            <MessageSquare size={16} />
            Chat com IA
          </button>
          <button 
            onClick={() => { onAction('completar'); setIsOpen(false); }}
            className="flex items-center gap-3 px-4 py-2 bg-white text-[#2b579a] rounded-full shadow-lg border office-border hover:bg-blue-50 transition-all font-medium text-sm"
          >
            <Wand2 size={16} />
            Completar Texto
          </button>
          <button 
            onClick={() => { onAction('corrigir'); setIsOpen(false); }}
            className="flex items-center gap-3 px-4 py-2 bg-white text-[#2b579a] rounded-full shadow-lg border office-border hover:bg-blue-50 transition-all font-medium text-sm"
          >
            <Eraser size={16} />
            Corrigir Gramática
          </button>
          <button 
            onClick={() => { onAction('explicar'); setIsOpen(false); }}
            className="flex items-center gap-3 px-4 py-2 bg-white text-[#2b579a] rounded-full shadow-lg border office-border hover:bg-blue-50 transition-all font-medium text-sm"
          >
            <Search size={16} />
            Explicar Conteúdo
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full office-blue shadow-2xl flex items-center justify-center hover:scale-105 transition-transform group relative ${isOpen ? 'rotate-12' : ''}`}
      >
        <Sparkles size={24} className={isOpen ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} />
        <div className="absolute -top-1 -right-1 bg-yellow-400 w-4 h-4 rounded-full border-2 border-white"></div>
        <div className="absolute -left-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          Assistente Blue IA
        </div>
      </button>
    </div>
  );
};

export default FloatingAiMenu;
