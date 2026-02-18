import React, { useMemo, useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { Heading1, Heading2, Type, Table as TableIcon, Code, ChevronDown } from 'lucide-react';
import Prism from 'prismjs';

// Importa linguagens adicionais para o Prism (via esm.sh no importmap)
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup'; // HTML

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  fontSize: number; 
  isPreview: boolean;
  isLive?: boolean;
}

const LANGUAGES = [
  { value: '', label: 'Texto Puro' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'csharp', label: 'C#' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'markdown', label: 'Markdown' },
];

const Editor = forwardRef<{ insertFormat: (p: string, s: string) => void, getSelection: () => string }, EditorProps>(
  ({ content, onChange, fontSize, isPreview, isLive }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const visualEditorRef = useRef<HTMLDivElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    
    // Estado para gerenciar o bloco de código ativo no Modo Vivo
    const [activeCodeBlock, setActiveCodeBlock] = useState<HTMLElement | null>(null);
    const [codeLanguage, setCodeLanguage] = useState<string>('');

    // Inicializa o serviço de conversão HTML -> Markdown
    const turndownService = useMemo(() => {
        const service = new TurndownService({ 
            headingStyle: 'atx', 
            codeBlockStyle: 'fenced',
            bulletListMarker: '-',
            emDelimiter: '*'
        });
        service.use(gfm);
        // Regra para manter classes de linguagem
        service.addRule('languageClass', {
          filter: ['pre'],
          replacement: function (content, node) {
            const code = (node as HTMLElement).querySelector('code');
            const className = code ? code.className : '';
            const language = className.match(/language-(\S+)/);
            const lang = language ? language[1] : '';
            // GFM plugin usa textContent por padrão, o que remove as tags de cor do Prism.
            // Aqui garantimos que pegamos apenas o texto limpo para salvar no MD.
            return '\n```' + lang + '\n' + node.textContent?.trim() + '\n```\n';
          }
        });
        return service;
    }, []);

    // Sincronização MODO CÓDIGO -> MODO VISUAL
    useEffect(() => {
        if (isLive && visualEditorRef.current) {
            if (document.activeElement !== visualEditorRef.current) {
                 const html = marked.parse(content) as string;
                 visualEditorRef.current.innerHTML = html;
                 // Reaplica highlight ao carregar conteúdo externo
                 if (visualEditorRef.current) {
                     Prism.highlightAllUnder(visualEditorRef.current);
                 }
            }
        }
    }, [isLive, content]);

    // Detecta se o cursor está dentro de um bloco de código para mostrar opções
    useEffect(() => {
        if (!isLive) return;

        const checkSelection = () => {
            const selection = window.getSelection();
            if (!selection?.anchorNode) return;

            let node: Node | null = selection.anchorNode;
            let foundPre: HTMLElement | null = null;

            while (node && node !== visualEditorRef.current) {
                if (node.nodeName === 'PRE') {
                    foundPre = node as HTMLElement;
                    break;
                }
                node = node.parentNode;
            }

            if (foundPre !== activeCodeBlock) {
                setActiveCodeBlock(foundPre);
                if (foundPre) {
                    const code = foundPre.querySelector('code');
                    if (code) {
                        const match = code.className.match(/language-(\S+)/);
                        setCodeLanguage(match ? match[1] : '');
                    } else {
                        setCodeLanguage('');
                    }
                }
            }
        };

        document.addEventListener('selectionchange', checkSelection);
        return () => document.removeEventListener('selectionchange', checkSelection);
    }, [isLive, activeCodeBlock]);

    const changeCodeLanguage = (lang: string) => {
        if (activeCodeBlock) {
            const code = activeCodeBlock.querySelector('code');
            if (code) {
                // Remove classes antigas de linguagem
                code.className = code.className.replace(/language-\S+/g, '').trim();
                // Remove formatação anterior (spans do Prism) para evitar conflitos
                code.textContent = code.textContent || ""; 
                
                if (lang) {
                    code.classList.add(`language-${lang}`);
                    // Aplica Syntax Highlighting
                    Prism.highlightElement(code);
                }
                setCodeLanguage(lang);
                handleVisualInput();
            }
        }
    };

    // Cálculo de linhas para a calha lateral (apenas modo código)
    const lines = useMemo(() => content.split('\n'), [content]);
    const currentLineHeight = 1.8;
    const lineHeightPx = fontSize * currentLineHeight;

    const insertTableVisual = () => {
        const tableHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 1em; margin-bottom: 1em;">
            <thead>
              <tr>
                <th style="border: 1px solid #ccc; padding: 8px; background-color: #f9f9f9;">Cabeçalho 1</th>
                <th style="border: 1px solid #ccc; padding: 8px; background-color: #f9f9f9;">Cabeçalho 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">Item 1</td>
                <td style="border: 1px solid #ccc; padding: 8px;">Item 2</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">Item 3</td>
                <td style="border: 1px solid #ccc; padding: 8px;">Item 4</td>
              </tr>
            </tbody>
          </table>
          <p><br></p>
        `;
        document.execCommand('insertHTML', false, tableHtml);
        handleVisualInput();
    };

    useImperativeHandle(ref, () => ({
      insertFormat: (prefix: string, suffix: string) => {
        if (isLive) {
            // --- Lógica WYSIWYG (Modo Vivo) ---
            if (!visualEditorRef.current) return;
            visualEditorRef.current.focus();

            if (prefix === '**') document.execCommand('bold');
            else if (prefix === '*') document.execCommand('italic');
            else if (prefix === '# ') document.execCommand('formatBlock', false, 'h1');
            else if (prefix === '## ') document.execCommand('formatBlock', false, 'h2');
            else if (prefix === '### ') document.execCommand('formatBlock', false, 'h3');
            else if (prefix.includes('1.')) document.execCommand('insertOrderedList');
            else if (prefix.includes('-')) document.execCommand('insertUnorderedList');
            else if (prefix.startsWith('```')) {
                const selection = window.getSelection();
                const text = selection?.toString() || "";
                // Cria estrutura padrão PRE > CODE
                const html = `<pre><code>${text || ' '}</code></pre><p><br></p>`;
                document.execCommand('insertHTML', false, html);
            }
            else if (prefix.includes('![')) {
                const url = prefix.match(/\((.*?)\)/)?.[1]; 
                if (url) document.execCommand('insertImage', false, url);
            }
            else if (prefix.includes('|')) {
                insertTableVisual();
            }
            else {
                document.execCommand('insertText', false, prefix + suffix);
            }
            handleVisualInput();
        } else {
            // --- Lógica Markdown Puro (Modo Padrão) ---
            if (!textareaRef.current) return;
            const el = textareaRef.current;
            el.focus();
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const selection = content.substring(start, end);
            const before = content.substring(0, start);
            const after = content.substring(end);
            
            let newText = "";
            if (prefix.startsWith('![') && prefix.endsWith(')\n')) {
                 newText = before + prefix + after;
            } else {
                 newText = before + prefix + selection + suffix + after;
            }
            
            onChange(newText);
            setTimeout(() => {
              el.focus();
              const newCursorPos = start + prefix.length + selection.length + suffix.length;
              el.setSelectionRange(newCursorPos, newCursorPos);
            }, 10);
        }
      },
      getSelection: () => {
        if (isLive) {
            return window.getSelection()?.toString() || "";
        }
        if (!textareaRef.current) return "";
        return content.substring(textareaRef.current.selectionStart, textareaRef.current.selectionEnd);
      }
    }), [content, onChange, isLive, activeCodeBlock]); 

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      const { scrollTop } = e.currentTarget;
      if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
    };

    const handleVisualInput = () => {
        if (visualEditorRef.current) {
            const html = visualEditorRef.current.innerHTML;
            const markdown = turndownService.turndown(html);
            onChange(markdown);
        }
    };

    const handleVisualKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (!selection?.anchorNode) return;

            // Navega para cima para encontrar se estamos em um PRE
            let node: Node | null = selection.anchorNode;
            let insideCode = false;
            
            while (node && node !== visualEditorRef.current) {
                if (node.nodeName === 'PRE') {
                    insideCode = true;
                    break;
                }
                node = node.parentNode;
            }

            if (insideCode) {
                e.preventDefault();
                // Usar Range API é mais seguro para PRE do que execCommand insertText
                // pois garante que não criará novos blocos HTML
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode('\n');
                range.deleteContents();
                range.insertNode(textNode);
                
                // Move o cursor para depois do \n
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
                
                handleVisualInput();
            }
        }
    };

    const commonStyles = `w-full h-full paper-shadow outline-none resize-none transition-colors duration-300`;
    
    const textLayout: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      lineHeight: `${currentLineHeight}`,
      padding: '3rem', // 48px
      fontFamily: isLive ? '"Inter", sans-serif' : '"JetBrains Mono", monospace',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    };

    if (isPreview) {
      return (
        <div 
          className={`${commonStyles} p-12 overflow-auto prose prose-slate max-w-none prose-headings:text-[var(--theme-text)] prose-p:text-[var(--theme-text)] prose-strong:text-[var(--theme-accent)] scrollbar-thin`} 
          style={{ fontSize: `${fontSize}px`, lineHeight: `${currentLineHeight}`, color: 'var(--theme-text)' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Nenhum conteúdo para exibir.*"}</ReactMarkdown>
        </div>
      );
    }

    return (
      <div className={`${commonStyles} flex relative overflow-hidden text-[var(--theme-text)]`}>
        {!isLive && (
          <div ref={gutterRef} className="w-10 border-r office-border flex-shrink-0 flex flex-col items-end pr-2 font-mono select-none overflow-hidden pt-12 pb-10"
               style={{ backgroundColor: 'var(--theme-gutter-bg)', color: 'var(--theme-gutter-text)' }}>
            {lines.map((_, i) => (
              <div key={i} className="flex items-center" style={{ fontSize: `calc(${fontSize}px * 0.7)`, height: `${lineHeightPx}px` }}>{i + 1}</div>
            ))}
          </div>
        )}

        <div className="flex-1 relative h-full">
          {/* MODO VISUAL (WYSIWYG) */}
          {isLive ? (
             <div 
                className="w-full h-full flex flex-col relative"
                style={{ backgroundColor: 'var(--theme-editor-bg)' }}
             >
                {/* Barra de Ferramentas Interna (Sticky) */}
                <div className="sticky top-0 z-20 px-4 py-2 bg-[var(--theme-editor-bg)]/95 backdrop-blur border-b border-[var(--theme-border)] flex items-center gap-1 shadow-sm shrink-0 transition-colors h-10">
                    <button 
                        onMouseDown={(e) => { e.preventDefault(); document.execCommand('formatBlock', false, 'h1'); handleVisualInput(); }}
                        className="p-1.5 rounded hover:bg-black/5 text-[var(--theme-text)] transition-colors flex items-center gap-1"
                        title="Título 1"
                    >
                        <Heading1 size={14} />
                    </button>
                    <button 
                        onMouseDown={(e) => { e.preventDefault(); document.execCommand('formatBlock', false, 'h2'); handleVisualInput(); }}
                        className="p-1.5 rounded hover:bg-black/5 text-[var(--theme-text)] transition-colors flex items-center gap-1"
                        title="Subtítulo"
                    >
                        <Heading2 size={14} />
                    </button>
                    <button 
                        onMouseDown={(e) => { e.preventDefault(); document.execCommand('formatBlock', false, 'p'); handleVisualInput(); }}
                        className="p-1.5 rounded hover:bg-black/5 text-[var(--theme-text)] transition-colors flex items-center gap-1"
                        title="Parágrafo"
                    >
                        <Type size={14} />
                    </button>
                    <div className="w-[1px] h-4 bg-[var(--theme-border)] mx-1"></div>
                    <button 
                        onMouseDown={(e) => { e.preventDefault(); insertTableVisual(); }}
                        className="p-1.5 rounded hover:bg-black/5 text-[var(--theme-text)] transition-colors flex items-center gap-1"
                        title="Inserir Tabela"
                    >
                        <TableIcon size={14} />
                    </button>

                    {/* Controles de Bloco de Código Contextual */}
                    {activeCodeBlock && (
                        <>
                            <div className="w-[1px] h-4 bg-[var(--theme-border)] mx-1"></div>
                            <div className="flex items-center gap-1 bg-black/5 rounded px-2 py-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <Code size={12} className="text-[#2b579a]" />
                                <div className="relative flex items-center">
                                    <select 
                                        className="appearance-none bg-transparent text-[10px] font-bold text-[#2b579a] outline-none pr-4 cursor-pointer w-24"
                                        value={codeLanguage}
                                        onChange={(e) => changeCodeLanguage(e.target.value)}
                                        onMouseDown={(e) => e.stopPropagation()} // Impede perda de foco
                                    >
                                        {LANGUAGES.map(lang => (
                                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={10} className="absolute right-0 text-[#2b579a] pointer-events-none" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div 
                    className="flex-1 overflow-y-auto scrollbar-thin cursor-text"
                    onClick={() => visualEditorRef.current?.focus()}
                >
                    <div
                        ref={visualEditorRef}
                        contentEditable
                        onInput={handleVisualInput}
                        onKeyDown={handleVisualKeyDown}
                        className="visual-editor outline-none min-h-full"
                        style={{
                            ...textLayout,
                            color: 'var(--theme-text)',
                            cursor: 'text',
                            paddingTop: '2rem'
                        }}
                    />
                </div>
             </div>
          ) : (
            /* MODO CÓDIGO (MARKDOWN PURO) */
            <textarea
                ref={textareaRef}
                className={`editor-textarea w-full h-full bg-transparent border-none outline-none resize-none relative scrollbar-thin transition-all`}
                style={{ 
                ...textLayout,
                color: 'var(--theme-text)',
                caretColor: 'var(--theme-accent)',
                }}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                placeholder="Escreva seu texto..."
                spellCheck={false}
            />
          )}
        </div>
      </div>
    );
  }
);

Editor.displayName = 'Editor';
export default Editor;