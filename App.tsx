import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Maximize2, Columns, Eye, Palette, MonitorCheck, Check, ChevronDown, Plus, X } from 'lucide-react';
import { RibbonTabType, FileState, AppSettings, ChatMessage, SaveLogEntry, ThemeType } from './types';
import Editor from './components/Editor';
import Ribbon from './components/Ribbon';
import StatusBar from './components/StatusBar';
import TableModal from './components/TableModal';
import AiResultModal from './components/AiResultModal';
import AiChatModal from './components/AiChatModal';
import AiConfigModal from './components/AiConfigModal'; 
import AboutModal from './components/AboutModal';
import FloatingAiMenu from './components/FloatingAiMenu';
import TaskSidebar from './components/TaskSidebar';
import SourceManagerModal from './components/SourceManagerModal'; 
import SaveLogModal from './components/SaveLogModal';
import { exportToPdf, exportToOdt, downloadFile } from './services/fileService';
import { GoogleGenAI } from "@google/genai";

const INITIAL_CONTENT = `# Bem-vindo ao Blue Eyes Writer 🖋️

O **Modo Vivo** agora está disponível! Ative-o na aba Início para ver o Markdown ser renderizado enquanto você digita.

---

## 🚀 Novidades
1. **Atalhos de Teclado**: 
   - Ctrl+S para Salvar
   - Ctrl+1/2/3 para Títulos
   - Ctrl+N para Negrito, Ctrl+I para Itálico
   - Ctrl+Shift+C para Bloco de Código
   - Ctrl+T para Tabela
2. **Modo Vivo**: Digite Markdown e veja o resultado no próprio editor.
3. **Abas**: Trabalhe em múltiplos documentos simultaneamente.
`;

const getApiKey = (): string => {
  const isElectron = /Electron/.test(navigator.userAgent);
  if (isElectron) {
    return localStorage.getItem('GEMINI_API_KEY') || '';
  }
  return process.env.API_KEY || '';
};

const THEMES: { id: ThemeType; label: string }[] = [
  { id: 'office-classic', label: 'Office Classic' },
  { id: 'google-docs', label: 'Google Docs' },
  { id: 'macos', label: 'macOS Style' },
  { id: 'dark', label: 'Modo Escuro' },
  { id: 'hacker', label: 'Terminal' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RibbonTabType>('Início');
  const [editorMode, setEditorMode] = useState<'editor' | 'dual' | 'preview'>('dual');
  const [showTableModal, setShowTableModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showAiConfig, setShowAiConfig] = useState(false); 
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSourceManagerModal, setShowSourceManagerModal] = useState(false); 
  const [showSaveLogModal, setShowSaveLogModal] = useState(false);
  const [showThemeQuickPicker, setShowThemeQuickPicker] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [splitWidth, setSplitWidth] = useState(50); 
  const isResizing = useRef(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // -- Gerenciamento de Abas --
  const [files, setFiles] = useState<FileState[]>([
    {
      id: '1',
      name: 'Documento.md',
      content: INITIAL_CONTENT,
      isDirty: false
    }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('1');

  // Helper para pegar o arquivo ativo atual
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const fileRef = useRef(activeFile); 
  useEffect(() => { fileRef.current = activeFile; }, [activeFile]);

  const [saveLog, setSaveLog] = useState<SaveLogEntry[]>(() => {
    const saved = localStorage.getItem('BLUE_EYES_SAVE_LOG');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('BLUE_EYES_SETTINGS');
    if (saved) return JSON.parse(saved);
    return {
      showPreview: true,
      spellCheck: true,
      autoSave: true,
      fontSize: 16,
      isFullWidth: false,
      isFocusMode: false,
      theme: 'office-classic',
      isLive: false
    };
  });

  useEffect(() => {
    localStorage.setItem('BLUE_EYES_SETTINGS', JSON.stringify(settings));
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const startResizing = useCallback(() => { isResizing.current = true; document.body.style.cursor = 'col-resize'; }, []);
  const stopResizing = useCallback(() => { isResizing.current = false; document.body.style.cursor = 'default'; }, []);
  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const percentage = (e.clientX / window.innerWidth) * 100;
    if (percentage > 20 && percentage < 80) setSplitWidth(percentage);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // -- Funções de Arquivo e Abas --

  const handleContentChange = (newContent: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent, isDirty: true } : f));
  };

  const createNewTab = () => {
    const newId = crypto.randomUUID();
    const newFile: FileState = {
      id: newId,
      name: `Novo Documento ${files.length + 1}.md`,
      content: '',
      isDirty: false
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
  };

  const closeTab = (e: React.MouseEvent, idToClose: string) => {
    e.stopPropagation();
    
    // Se for a última aba, apenas reseta ela
    if (files.length === 1) {
      setFiles([{
        id: crypto.randomUUID(),
        name: 'Novo Documento.md',
        content: '',
        isDirty: false
      }]);
      setActiveFileId(files[0]?.id || crypto.randomUUID()); // Fallback seguro
      return;
    }

    const newFiles = files.filter(f => f.id !== idToClose);
    setFiles(newFiles);

    // Se fechou a aba ativa, muda para a última disponível
    if (idToClose === activeFileId) {
      setActiveFileId(newFiles[newFiles.length - 1].id);
    }
  };

  const openFileInNewTab = (name: string, content: string) => {
    const newId = crypto.randomUUID();
    const newFile: FileState = {
      id: newId,
      name,
      content,
      isDirty: false
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
  };

  const handleSave = async () => {
    if (!activeFile) return;

    const currentName = activeFile.name.replace(/\*$/, ''); // Remove asterisco visual se houver

    // Função helper para o salvamento "clássico" (fallback)
    const performLegacySave = () => {
      const newName = prompt("Salvar arquivo como:", currentName);
      if (newName) {
        const finalName = newName.endsWith('.md') || newName.endsWith('.txt') 
          ? newName 
          : `${newName}.md`;
        
        setFiles(prev => prev.map(f => 
          f.id === activeFileId 
            ? { ...f, name: finalName, isDirty: false } 
            : f
        ));

        downloadFile(activeFile.content, finalName);
      }
    };

    // Tenta usar a API moderna de Sistema de Arquivos (Suportada no Electron e Chrome/Edge)
    if ('showSaveFilePicker' in window) {
      try {
        const options = {
          suggestedName: currentName,
          types: [
            {
              description: 'Markdown File',
              accept: {
                'text/markdown': ['.md'],
                'text/plain': ['.txt'],
              },
            },
          ],
        };
        
        // @ts-ignore - A API existe no Electron/Chrome mas pode não estar nos tipos padrão do TS
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(activeFile.content);
        await writable.close();

        // Atualiza o nome da aba com o nome real escolhido pelo usuário no diálogo
        const finalName = handle.name;
        setFiles(prev => prev.map(f => 
          f.id === activeFileId 
            ? { ...f, name: finalName, isDirty: false } 
            : f
        ));
      } catch (err: any) {
        // Se o usuário cancelou o diálogo (AbortError), paramos silenciosamente
        if (err.name === 'AbortError') return;

        // Se o erro for de segurança (iframe cross-origin) ou outro erro, usamos o fallback
        console.warn('API nativa de salvamento falhou ou foi bloqueada. Tentando método alternativo.', err);
        performLegacySave();
      }
    } else {
      // Fallback para ambientes sem a API (ex: Firefox ou configurações restritas)
      performLegacySave();
    }
  };

  // -- Integração com IA --

  const askAiHelp = async (type: 'completar' | 'corrigir' | 'explicar' | 'chat') => {
    if (type === 'chat') { 
      setChatMessages([]);
      setShowAiChat(true); 
      return; 
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setAiResult("Chave API não configurada. Por favor, configure na aba IA > Configurar.");
      setShowAiModal(true);
      setShowAiConfig(true);
      return;
    }

    setIsProcessing(true);
    setAiResult("");
    setShowAiModal(true);
    try {
      const selection = editorRef.current?.getSelection() || "";
      const context = selection || activeFile.content;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tarefa: ${type}. Contexto: ${context}. Responda apenas com o texto processado em Markdown Português.`,
      });
      setAiResult(response.text || "Sem resposta da IA.");
    } catch (err) {
      console.error(err);
      setAiResult("Erro ao conectar com a Blue IA. Verifique sua chave API na aba IA > Configurar.");
    } finally { setIsProcessing(false); }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Chave API não configurada. Por favor, vá em IA > Configurar para adicionar sua chave." }]);
      setShowAiConfig(true);
      return;
    }

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', text }];
    setChatMessages(newMessages);
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const history = newMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));
      history.pop();
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: text }] }],
        config: {
          systemInstruction: 'Você é um assistente de escrita. Ajude o usuário a redigir, corrigir e melhorar textos em Markdown.',
        }
      });

      setChatMessages(prev => [...prev, { role: 'model', text: response.text || "Sem resposta." }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "Erro ao processar mensagem. Verifique sua chave API." }]);
    } finally {
      setIsProcessing(false);
    }
  }, [chatMessages]);

  const handleFormat = (type: 'bold' | 'italic' | 'list' | 'list-num' | 'table' | 'image' | 'h1' | 'h2' | 'h3' | 'code-block') => {
    if (!editorRef.current) return;
    switch(type) {
      case 'bold': editorRef.current.insertFormat('**', '**'); break;
      case 'italic': editorRef.current.insertFormat('*', '*'); break;
      case 'list': editorRef.current.insertFormat('\n- ', ''); break;
      case 'list-num': editorRef.current.insertFormat('\n1. ', ''); break;
      case 'h1': editorRef.current.insertFormat('# ', ''); break;
      case 'h2': editorRef.current.insertFormat('## ', ''); break;
      case 'h3': editorRef.current.insertFormat('### ', ''); break;
      case 'code-block': editorRef.current.insertFormat('```\n', '\n```'); break;
      case 'table': setShowTableModal(true); break;
      case 'image': imageInputRef.current?.click(); break;
    }
  };

  // Efeito para atalhos de teclado (Incluindo Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (showTableModal || showAiModal || showAiChat || showAiConfig || showAboutModal || showSourceManagerModal || showSaveLogModal) return;

        const key = e.key.toLowerCase();
        switch(key) {
          case 's': e.preventDefault(); handleSave(); break; // Atalho de Salvar
          case '1': e.preventDefault(); handleFormat('h1'); break;
          case '2': e.preventDefault(); handleFormat('h2'); break;
          case '3': e.preventDefault(); handleFormat('h3'); break;
          case 'i': e.preventDefault(); handleFormat('italic'); break;
          case 'n': e.preventDefault(); handleFormat('bold'); break; 
          case 'l': e.preventDefault(); handleFormat('list'); break;
          case 't': e.preventDefault(); handleFormat('table'); break;
          case 'c': 
            if (e.shiftKey) { e.preventDefault(); handleFormat('code-block'); }
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTableModal, showAiModal, showAiChat, showAiConfig, showAboutModal, showSourceManagerModal, showSaveLogModal, activeFile]); // Added activeFile dependency for handleSave context

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const imagePath = (selectedFile as any).path || selectedFile.name;
    editorRef.current?.insertFormat(`\n![${selectedFile.name}](${imagePath})\n`, '');
    e.target.value = '';
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<{ insertFormat: (p: string, s: string) => void, getSelection: () => string }>(null);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <input type="file" ref={fileInputRef} className="hidden" accept=".md,.txt" onChange={(e) => {
         const selectedFile = e.target.files?.[0];
         if (!selectedFile) return;
         const reader = new FileReader();
         reader.onload = (event) => openFileInNewTab(selectedFile.name, event.target?.result as string);
         reader.readAsText(selectedFile);
      }} />
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />

      <TableModal isOpen={showTableModal} onClose={() => setShowTableModal(false)} onConfirm={(rows, cols) => {
          let tableMd = '\n| ' + Array(cols).fill('Header').join(' | ') + ' |\n| ' + Array(cols).fill('---').join(' | ') + ' |\n';
          for (let i = 0; i < rows; i++) tableMd += '| ' + Array(cols).fill('...').join(' | ') + ' |\n';
          editorRef.current?.insertFormat(tableMd, '');
          setShowTableModal(false);
      }} />
      
      <AiResultModal isOpen={showAiModal} content={aiResult} isLoading={isProcessing} onClose={() => setShowAiModal(false)} onInsert={(c) => editorRef.current?.insertFormat(c, "")} />
      <AiChatModal isOpen={showAiChat} onClose={() => setShowAiChat(false)} messages={chatMessages} isProcessing={isProcessing} onSendMessage={handleSendMessage} onInsertAtCursor={(t) => editorRef.current?.insertFormat(t, "")} />
      <AiConfigModal isOpen={showAiConfig} onClose={() => setShowAiConfig(false)} />
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
      <SourceManagerModal isOpen={showSourceManagerModal} onClose={() => setShowSourceManagerModal(false)} onInsert={(t) => editorRef.current?.insertFormat(t, "")} />
      <SaveLogModal isOpen={showSaveLogModal} onClose={() => setShowSaveLogModal(false)} saveLog={saveLog} onRestore={(c) => handleContentChange(c)} onDelete={() => {}} autoSaveEnabled={settings.autoSave} onToggleAutoSave={(v) => setSettings(s => ({...s, autoSave: v}))} />

      {!settings.isFocusMode && (
        <div className="bg-[var(--theme-bg)] h-12 flex items-center px-4 justify-between text-xs select-none shrink-0 transition-colors z-[60] relative gap-4">
          
          {/* Logo e Nome (Menor) */}
          <div className="flex items-center gap-3 text-[var(--theme-text)] shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--theme-accent)] flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <FileText size={18} />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block">Blue Eyes</span>
          </div>
          
          {/* Barra de Abas */}
          <div className="flex-1 flex items-center overflow-x-auto scrollbar-thin h-full gap-1 px-2 pt-2">
            {files.map(f => (
              <div 
                key={f.id}
                onClick={() => setActiveFileId(f.id)}
                className={`
                  group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-[11px] font-medium cursor-pointer transition-all min-w-[120px] max-w-[200px] border-t border-x
                  ${activeFileId === f.id 
                    ? 'bg-white border-[var(--theme-border)] text-[var(--theme-text)] shadow-sm translate-y-[1px] z-10' 
                    : 'bg-transparent border-transparent hover:bg-black/5 text-[var(--theme-text-secondary)]'}
                `}
              >
                <FileText size={12} className={activeFileId === f.id ? 'text-[var(--theme-accent)]' : 'opacity-50'} />
                <span className="truncate flex-1">{f.name}{f.isDirty ? '*' : ''}</span>
                <button 
                  onClick={(e) => closeTab(e, f.id)}
                  className={`p-0.5 rounded-md hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-all ${activeFileId === f.id ? 'opacity-100' : ''}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button 
              onClick={createNewTab}
              className="p-1.5 rounded-md hover:bg-black/5 text-[var(--theme-text-secondary)] transition-colors"
              title="Nova Aba"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Controles da Direita */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 relative z-[60] bg-white/50 p-1 rounded-lg border border-[var(--theme-border)]">
              <div className="relative">
                <button 
                  onClick={() => setShowThemeQuickPicker(!showThemeQuickPicker)}
                  className={`px-3 py-1 hover:bg-black/5 rounded-md transition-colors flex items-center gap-2 text-[var(--theme-text)] font-medium ${showThemeQuickPicker ? 'bg-black/10' : ''}`}
                  title="Trocar Tema"
                >
                  <Palette size={14} />
                  <span className="hidden lg:inline">Tema</span>
                  <ChevronDown size={10} />
                </button>
                {showThemeQuickPicker && (
                  <>
                    <div className="fixed inset-0 z-[140]" onClick={() => setShowThemeQuickPicker(false)} />
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white text-gray-800 border border-gray-100 shadow-2xl rounded-xl py-2 z-[150] overflow-hidden">
                      {THEMES.map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => { setSettings(s => ({...s, theme: t.id})); setShowThemeQuickPicker(false); }} 
                          className={`w-full px-4 py-2.5 text-left text-xs hover:bg-gray-50 flex items-center justify-between ${settings.theme === t.id ? 'font-bold text-[var(--theme-accent)] bg-blue-50/50' : 'text-gray-600'}`}
                        >
                          {t.label}
                          {settings.theme === t.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="w-[1px] h-4 bg-gray-200"></div>

              <button 
                onClick={() => setSettings(s => ({...s, isFullWidth: !s.isFullWidth}))}
                className={`p-1.5 hover:bg-black/5 rounded-md transition-colors flex items-center gap-1.5 ${settings.isFullWidth ? 'text-[var(--theme-accent)]' : 'text-gray-500'}`}
                title="Widescreen Total"
              >
                <MonitorCheck size={14} />
              </button>
            </div>
          
            {/* Header Layout Controls */}
            <div className="flex items-center gap-1 bg-white/50 p-1 rounded-lg border border-[var(--theme-border)]">
              <button onClick={() => setEditorMode('editor')} className={`p-1.5 px-3 rounded-md transition-all ${editorMode === 'editor' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}><Maximize2 size={14} /></button>
              <button onClick={() => setEditorMode('dual')} className={`p-1.5 px-3 rounded-md transition-all ${editorMode === 'dual' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}><Columns size={14} /></button>
              <button onClick={() => setEditorMode('preview')} className={`p-1.5 px-3 rounded-md transition-all ${editorMode === 'preview' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}><Eye size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {!settings.isFocusMode && (
        <Ribbon 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          onNew={createNewTab} 
          onSave={handleSave} 
          onOpen={() => fileInputRef.current?.click()} 
          onExport={(f) => {
            const n = activeFile.name.split('.')[0];
            if (f === 'pdf') exportToPdf(activeFile.content, n);
            else if (f === 'odt') exportToOdt(activeFile.content, n);
            else downloadFile(activeFile.content, activeFile.name);
          }} 
          onFormat={handleFormat} settings={settings} setSettings={setSettings} 
          onAiPrompt={askAiHelp} isProcessing={isProcessing} 
          editorMode={editorMode} setEditorMode={setEditorMode}
          onToggleFocus={() => setSettings(s => ({...s, isFocusMode: !s.isFocusMode}))}
          onAbout={() => setShowAboutModal(true)}
          onOpenAiChat={() => askAiHelp('chat')} 
          onOpenAiConfig={() => setShowAiConfig(true)}
        />
      )}

      <div className="flex-1 overflow-hidden flex flex-row relative z-10">
        <TaskSidebar 
          isOpen={isTaskSidebarOpen} 
          onToggle={() => setIsTaskSidebarOpen(!isTaskSidebarOpen)} 
          onOpenSourcesModal={() => setShowSourceManagerModal(true)}
          onOpenSaveLogModal={() => setShowSaveLogModal(true)}
        />
        
        <div className="flex-1 flex flex-col transition-colors overflow-hidden relative">
          
          <div className={`flex flex-1 h-full relative overflow-hidden ${settings.isFullWidth ? 'w-full px-2' : 'max-w-[1200px] mx-auto w-full px-8'} py-6 gap-6`}>
            
            {(editorMode === 'editor' || editorMode === 'dual') && (
              <div 
                className="flex flex-col h-full overflow-hidden transition-all duration-300" 
                style={{ width: editorMode === 'dual' ? `${splitWidth}%` : '100%' }}
              >
                <div className="paper-shadow flex-1 overflow-hidden flex flex-col relative border border-[var(--theme-border)]/50">
                    <Editor 
                        key={activeFileId} // Força recriar editor ao trocar de aba para limpar histórico de undo/redo interno
                        ref={editorRef} 
                        content={activeFile.content} 
                        onChange={handleContentChange} 
                        fontSize={settings.fontSize} 
                        isPreview={false}
                        isLive={settings.isLive} 
                    />
                </div>
              </div>
            )}

            {editorMode === 'dual' && (
              <div 
                onMouseDown={startResizing}
                className="w-4 hover:scale-110 cursor-col-resize flex-shrink-0 transition-all z-20 group relative flex items-center justify-center"
              >
                <div className="w-1 h-12 bg-gray-300 rounded-full group-hover:bg-[var(--theme-accent)] transition-colors"></div>
              </div>
            )}

            {(editorMode === 'preview' || editorMode === 'dual') && (
              <div 
                className="flex flex-col h-full overflow-hidden transition-all duration-300" 
                style={{ width: editorMode === 'dual' ? `${100 - splitWidth}%` : '100%' }}
              >
                <div className="paper-shadow flex-1 overflow-hidden border border-[var(--theme-border)]/50 bg-[var(--theme-paper-bg)]">
                  <Editor content={activeFile.content} onChange={() => {}} fontSize={settings.fontSize} isPreview={true} />
                </div>
              </div>
            )}
          </div>
          
          <FloatingAiMenu onAction={askAiHelp} disabled={settings.isFocusMode} />
        </div>
      </div>
      <StatusBar 
        file={activeFile} 
        isFocusMode={settings.isFocusMode} 
        onToggleFocus={() => setSettings(s => ({...s, isFocusMode: !s.isFocusMode}))} 
        editorMode={editorMode}
        onSetEditorMode={setEditorMode}
      />
    </div>
  );
};

export default App;