import React from 'react';
import { Maximize, Minimize, Maximize2, Columns, Eye, BookOpen, CheckCircle2 } from 'lucide-react';
import { FileState } from '../types';

interface StatusBarProps {
  file: FileState;
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
  editorMode?: 'editor' | 'dual' | 'preview';
  onSetEditorMode?: (mode: 'editor' | 'dual' | 'preview') => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  file, 
  isFocusMode, 
  onToggleFocus, 
  editorMode, 
  onSetEditorMode 
}) => {
  const wordCount = file.content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = file.content.length;

  return (
    <div className="h-10 text-[11px] px-6 flex items-center justify-between select-none border-t border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] transition-all font-medium z-40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <span className="font-bold text-[var(--theme-text)]">{wordCount}</span> palavras
        </div>
        <div className="flex items-center gap-2">
           <span className="font-bold text-[var(--theme-text)]">{charCount}</span> caracteres
        </div>
        <div className="h-3 w-[1px] bg-[var(--theme-border)]" />
        <span className="hidden sm:flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-500" />
            Português (Brasil)
        </span>
      </div>

      <div className="flex items-center gap-4 h-full">
        {/* Controle de Visualização Rápida */}
        {isFocusMode && onSetEditorMode && (
          <div className="flex items-center bg-white border border-[var(--theme-border)] rounded-lg p-0.5 gap-0.5 shadow-sm">
            {[{id: 'editor', icon: Maximize2, label: 'Edit'}, {id: 'dual', icon: Columns, label: 'Dual'}, {id: 'preview', icon: Eye, label: 'View'}].map((mode: any) => (
                <button 
                key={mode.id}
                onClick={() => onSetEditorMode(mode.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${editorMode === mode.id ? 'bg-[var(--theme-accent)] text-[var(--theme-on-accent)] shadow-sm' : 'hover:bg-gray-100 text-gray-500'}`}
                title={mode.label}
              >
                <mode.icon size={11} />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 opacity-70">
          <span className="hidden md:inline font-mono text-[10px] uppercase">Markdown</span>
          <div className="h-3 w-[1px] bg-[var(--theme-border)] hidden md:block" />
          <span>100%</span>
        </div>
        
        {onToggleFocus && (
          <button 
            onClick={onToggleFocus}
            title={isFocusMode ? "Sair do Modo Foco" : "Entrar no Modo Foco"}
            className="flex items-center gap-1.5 hover:bg-[var(--theme-text)] hover:text-[var(--theme-bg)] px-3 py-1 transition-all ml-2 rounded-full border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold"
          >
            {isFocusMode ? <Minimize size={12} /> : <Maximize size={12} />}
            <span className="uppercase text-[9px] tracking-wide">{isFocusMode ? "Sair" : "Foco"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusBar;