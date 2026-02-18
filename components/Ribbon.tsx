import React, { useState, useRef, useEffect } from 'react';
import { 
  FilePlus, FolderOpen, Save, FileDown, Bold, Italic, 
  List, Maximize2, Columns, Palette, MessageCircle, 
  Wand2, RefreshCcw, Search, Monitor, MonitorCheck,
  Table2, Image, Settings, ExternalLink, Key, FileText, Zap, PenTool, GraduationCap
} from 'lucide-react';
import { RibbonTabType, AppSettings, ThemeType } from '../types';

interface RibbonProps {
  activeTab: RibbonTabType;
  setActiveTab: (tab: RibbonTabType) => void;
  onNew: () => void;
  onSave: () => void;
  onOpen: () => void;
  onExport: (format: 'pdf' | 'odt' | 'md') => void;
  onFormat: (type: 'bold' | 'italic' | 'list' | 'list-num' | 'table' | 'image' | 'h1' | 'h2' | 'h3' | 'code-block') => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onAiPrompt: (type: 'completar' | 'corrigir' | 'explicar' | 'chat') => void;
  isProcessing: boolean;
  editorMode: 'editor' | 'dual' | 'preview';
  setEditorMode: (mode: 'editor' | 'dual' | 'preview') => void;
  onToggleFocus: () => void;
  onAbout: () => void;
  onOpenAiChat: () => void;
  onOpenAiConfig: () => void;
}

const Ribbon: React.FC<RibbonProps> = ({ 
  activeTab, setActiveTab, onNew, onSave, onOpen, onExport, 
  onFormat, settings, setSettings, onAiPrompt, isProcessing,
  editorMode, setEditorMode, onToggleFocus, onAbout, onOpenAiChat, onOpenAiConfig
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Botão Moderno Minimalista
  const RibbonBtn = ({ 
    icon: Icon, label, onClick, active = false, disabled = false, preventFocus = false 
  }: { 
    icon: any, label: string, onClick: () => void, active?: boolean, disabled?: boolean, preventFocus?: boolean 
  }) => (
    <button 
      onClick={onClick}
      onMouseDown={preventFocus ? (e) => e.preventDefault() : undefined}
      disabled={disabled}
      className={`
        group flex flex-col items-center justify-center gap-1.5 h-[70px] px-4 min-w-[64px] rounded-xl transition-all duration-200
        ${active 
          ? 'bg-[var(--theme-accent)] text-[var(--theme-on-accent)] shadow-md translate-y-[-1px]' 
          : 'text-[var(--theme-text)] hover:bg-black/5 hover:translate-y-[-1px]'} 
        ${disabled ? 'opacity-40 cursor-not-allowed hover:translate-y-0 hover:bg-transparent' : ''}
      `}
    >
      <Icon size={22} strokeWidth={1.5} className={`transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
      <span className="text-[10px] font-semibold tracking-wide leading-none opacity-90">{label}</span>
    </button>
  );

  const Group = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="flex flex-col h-full px-3 border-r border-[var(--theme-border)] last:border-0 relative">
      <div className="flex items-center h-full gap-1 pb-4 pt-1">
        {children}
      </div>
      <span className="absolute bottom-1.5 left-0 w-full text-center text-[9px] font-bold text-[var(--theme-text-secondary)] uppercase tracking-widest opacity-60 select-none">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col w-full glass-panel z-50 transition-all duration-300">
      {/* Tabs Container - Estilo Flutuante Moderno */}
      <div className="flex px-6 pt-3 pb-0 gap-2 items-center">
        {['Arquivo', 'Início', 'Exibir', 'IA', 'Ajuda'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as RibbonTabType)}
            className={`
              px-5 py-2 text-xs font-semibold rounded-t-xl transition-all duration-200 relative top-[1px]
              ${activeTab === tab 
                ? 'text-[var(--theme-accent)] bg-[var(--theme-bg)] border-b-2 border-[var(--theme-accent)]' 
                : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-black/5'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar Container */}
      <div className="h-28 py-3 bg-[var(--theme-bg)] border-b border-[var(--theme-border)] flex items-center px-6 overflow-x-auto overflow-y-hidden scrollbar-thin shadow-inner">
        
        {activeTab === 'Arquivo' && (
          <>
            <Group label="Principal">
              <RibbonBtn icon={FilePlus} label="Novo" onClick={onNew} />
              <RibbonBtn icon={FolderOpen} label="Abrir" onClick={onOpen} />
              <RibbonBtn icon={Save} label="Salvar" onClick={onSave} />
            </Group>
            <Group label="Exportar Como">
              <RibbonBtn icon={FileText} label="Markdown" onClick={() => onExport('md')} />
              <RibbonBtn icon={FileDown} label="PDF Pro" onClick={() => onExport('pdf')} />
              <RibbonBtn icon={FileText} label="ODT" onClick={() => onExport('odt')} />
            </Group>
          </>
        )}

        {activeTab === 'Início' && (
          <>
            <Group label="Estilo">
              <RibbonBtn icon={Bold} label="Negrito" onClick={() => onFormat('bold')} preventFocus={true} />
              <RibbonBtn icon={Italic} label="Itálico" onClick={() => onFormat('italic')} preventFocus={true} />
              <RibbonBtn icon={List} label="Pontos" onClick={() => onFormat('list')} preventFocus={true} />
              <RibbonBtn icon={List} label="Números" onClick={() => onFormat('list-num')} preventFocus={true} />
            </Group>
            <Group label="Inserção">
              {!settings.isLive && (
                <RibbonBtn icon={Table2} label="Tabela" onClick={() => onFormat('table')} preventFocus={true} />
              )}
              <RibbonBtn icon={Image} label="Mídia" onClick={() => onFormat('image')} preventFocus={true} />
            </Group>
            <Group label="Motor">
               <div className="flex flex-col items-center justify-center gap-2 h-[70px] min-w-[100px] px-2">
                 <button 
                   onClick={() => setSettings(s => ({...s, isLive: !s.isLive}))}
                   className={`
                     relative w-full px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-2
                     ${settings.isLive 
                       ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' 
                       : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}
                   `}
                 >
                   <div className={`w-2 h-2 rounded-full ${settings.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                   {settings.isLive ? "WYSIWYG ATIVO" : "MARKDOWN PURO"}
                 </button>
                 <span className="text-[9px] font-medium text-[var(--theme-text-secondary)]">Modo de Edição</span>
               </div>
            </Group>
          </>
        )}

        {activeTab === 'Exibir' && (
          <>
            <Group label="Layout">
              <RibbonBtn icon={Maximize2} label="Editor" active={editorMode === 'editor'} onClick={() => setEditorMode('editor')} />
              <RibbonBtn icon={Columns} label="Lado a Lado" active={editorMode === 'dual'} onClick={() => setEditorMode('dual')} />
            </Group>
            <Group label="Tipografia">
              <div className="flex flex-col justify-center gap-3 h-[70px] w-40 px-2">
                 <div className="flex items-center justify-between text-xs font-semibold text-[var(--theme-text)]">
                    <span className="flex items-center gap-1.5"><Zap size={12} className="text-[var(--theme-accent)]" /> Tamanho da Fonte</span>
                    <span className="bg-black/5 px-2 py-0.5 rounded text-[10px]">{settings.fontSize}px</span>
                 </div>
                 <input 
                   type="range" min="12" max="32" step="1"
                   value={settings.fontSize}
                   onChange={(e) => setSettings(s => ({...s, fontSize: parseInt(e.target.value)}))}
                   className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
                 />
              </div>
            </Group>
            <Group label="Imersão">
              <RibbonBtn icon={Monitor} label="Foco Total" active={settings.isFocusMode} onClick={onToggleFocus} />
              <RibbonBtn icon={MonitorCheck} label="Expandir" active={settings.isFullWidth} onClick={() => setSettings(s => ({...s, isFullWidth: !s.isFullWidth}))} />
            </Group>
          </>
        )}

        {activeTab === 'IA' && (
          <>
            <Group label="Blue AI">
              <RibbonBtn icon={MessageCircle} label="Chat" onClick={onOpenAiChat} />
              <RibbonBtn icon={Wand2} label="Continuar" onClick={() => onAiPrompt('completar')} disabled={isProcessing} />
              <RibbonBtn icon={RefreshCcw} label="Melhorar" onClick={() => onAiPrompt('corrigir')} disabled={isProcessing} />
              <RibbonBtn icon={Search} label="Explicar" onClick={() => onAiPrompt('explicar')} disabled={isProcessing} />
            </Group>
            <Group label="Setup">
              <RibbonBtn icon={Key} label="API Key" onClick={onOpenAiConfig} />
            </Group>
          </>
        )}

        {activeTab === 'Ajuda' && (
            <Group label="Informações">
               <RibbonBtn icon={Settings} label="Sobre" onClick={onAbout} />
               <RibbonBtn 
                 icon={GraduationCap} 
                 label="Escola de Linux" 
                 onClick={() => window.open('https://certbestlinux.com', '_blank')} 
               />
            </Group>
        )}

      </div>
    </div>
  );
};

export default Ribbon;