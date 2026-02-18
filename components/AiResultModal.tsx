
import React from 'react';
import { X, Check, Copy, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AiResultModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  onInsert: (content: string) => void;
  isLoading: boolean;
}

const AiResultModal: React.FC<AiResultModalProps> = ({ isOpen, content, onClose, onInsert, isLoading }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] border office-border">
        {/* Header */}
        <div className="office-blue p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="opacity-80" />
            <span className="text-sm font-semibold">Sugestão da Blue IA</span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 p-1 rounded transition-opacity">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Sparkles size={32} className="text-[#2b579a] opacity-50 animate-pulse" />
              <span className="text-sm text-gray-500 animate-pulse">A IA está pensando...</span>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-4 flex justify-between items-center border-t office-border shrink-0">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Copy size={14} />
            Copiar
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Descartar
            </button>
            <button 
              onClick={() => onInsert(content)}
              disabled={isLoading || !content}
              className="flex items-center gap-2 px-6 py-1.5 text-xs font-medium bg-[var(--theme-accent)] text-[var(--theme-on-accent)] hover:opacity-90 rounded transition-colors shadow-sm disabled:opacity-50"
            >
              <Check size={14} />
              Inserir no Documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiResultModal;
