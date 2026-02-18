
import React, { useState, useEffect } from 'react';
import { X, History, Clock, Files, Check, Copy, Trash2 } from 'lucide-react';
import { SaveLogEntry } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SaveLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveLog: SaveLogEntry[];
  onRestore: (content: string) => void;
  onDelete: (id: string) => void;
  autoSaveEnabled: boolean; // Nova prop
  onToggleAutoSave: (enabled: boolean) => void; // Nova prop
}

const SaveLogModal: React.FC<SaveLogModalProps> = ({ isOpen, onClose, saveLog, onRestore, onDelete, autoSaveEnabled, onToggleAutoSave }) => {
  const [viewingContent, setViewingContent] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setViewingContent(null);
      setCopiedId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] border office-border">
        {/* Header */}
        <div className="office-blue p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History size={18} />
            <span className="text-sm font-semibold">Histórico de Salvamentos</span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 p-1 rounded transition-opacity">
            <X size={18} />
          </button>
        </div>

        {/* Auto-save Toggle */}
        <div className="p-4 bg-gray-100 border-b office-border flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-gray-700">Auto-salvamento</span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={autoSaveEnabled} 
                onChange={() => onToggleAutoSave(!autoSaveEnabled)} 
              />
              <div 
                className={`block w-12 h-6 rounded-full transition-colors ${
                  autoSaveEnabled ? 'bg-[var(--theme-accent)]' : 'bg-gray-300'
                }`}
              ></div>
              <div 
                className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${
                  autoSaveEnabled ? 'translate-x-full bg-white' : 'bg-white'
                }`}
              ></div>
            </div>
            <span className="ml-3 text-xs font-semibold text-gray-600">{autoSaveEnabled ? 'ATIVO' : 'INATIVO'}</span>
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50 flex flex-col gap-6">
          {viewingContent ? (
            <div className="bg-white p-4 rounded-lg shadow-sm border office-border flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-600 uppercase">VISUALIZANDO CONTEÚDO</h4>
                <button 
                  onClick={() => setViewingContent(null)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Voltar
                </button>
              </div>
              <div className="flex-1 overflow-auto prose prose-slate max-w-none prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {viewingContent}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <>
              {saveLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 opacity-60">
                  <Clock size={32} strokeWidth={1.5} className="mb-2" />
                  <span className="text-[10px] font-medium">Nenhum salvamento registrado ainda.</span>
                  <span className="text-[9px] text-gray-300 mt-1">O auto-salvamento ocorre a cada 3 minutos com o modo "Auto-Salvar" ativado.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {saveLog.map((entry) => (
                    <div key={entry.id} className="group flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col flex-1 pr-2">
                        <span className="text-xs font-semibold text-gray-800">{new Date(entry.timestamp).toLocaleString('pt-BR')}</span>
                        <span className="text-[10px] text-gray-500">{entry.summary}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(entry.content, entry.id)}
                          className={`p-1.5 rounded-full transition-colors ${copiedId === entry.id ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-400'}`}
                          title="Copiar Conteúdo"
                        >
                          {copiedId === entry.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => setViewingContent(entry.content)}
                          className="p-1.5 rounded-full bg-blue-50 text-[#2b579a] hover:bg-blue-100 transition-colors"
                          title="Ver Conteúdo"
                        >
                          <Files size={14} />
                        </button>
                        <button
                          onClick={() => onRestore(entry.content)}
                          className="p-1.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          title="Restaurar este ponto"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)} // Botão de exclusão
                          className="p-1.5 rounded-full hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                          title="Excluir este salvamento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-4 flex justify-end gap-2 border-t office-border shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveLogModal;
