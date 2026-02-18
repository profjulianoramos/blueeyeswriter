import React, { useState, useEffect } from 'react';
import { X, BookText, Plus, Copy, Check, Trash2 } from 'lucide-react';
import { Source } from '../types';

interface SourceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

const SourceManagerModal: React.FC<SourceManagerModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [sources, setSources] = useState<Source[]>(() => {
    const saved = localStorage.getItem('BLUE_EYES_SOURCES');
    return saved ? JSON.parse(saved) : [];
  });
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [site, setSite] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('BLUE_EYES_SOURCES', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    if (!isOpen) {
      setAuthor('');
      setYear('');
      setTitle('');
      setSite('');
      setCopiedId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateReferenceText = (newAuthor: string, newYear?: string, newTitle?: string, newSite?: string): string => {
    let ref = '';
    if (newAuthor.trim()) {
      const parts = newAuthor.trim().split(' ');
      const lastName = parts[parts.length - 1].toUpperCase();
      const firstNameInitials = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase()).join('.');
      ref += `${lastName}, ${firstNameInitials}.`;
    }

    if (newYear && newYear.trim()) {
      ref += ` (${newYear.trim()}).`;
    }

    if (newTitle && newTitle.trim()) {
      ref += ` ${newTitle.trim()}.`;
    }

    if (newSite && newSite.trim()) {
      if (!ref.endsWith('.')) ref += '.';
      ref += ` Disponível em: ${newSite.trim()}.`;
    }

    return ref.trim();
  };

  const addSource = () => {
    if (!author.trim()) {
      alert('O campo Autor é obrigatório.');
      return;
    }

    const newSource: Source = {
      id: crypto.randomUUID(),
      author: author.trim(),
      year: year.trim() || undefined,
      title: title.trim() || undefined,
      site: site.trim() || undefined,
      fullReference: generateReferenceText(author, year, title, site),
      createdAt: Date.now(),
    };
    setSources([newSource, ...sources]);
    setAuthor('');
    setYear('');
    setTitle('');
    setSite('');
  };

  const deleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] border office-border">
        {/* Header */}
        <div className="office-blue p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookText size={18} />
            <span className="text-sm font-semibold">Gerenciar Fontes Bibliográficas</span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 p-1 rounded transition-opacity">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50 flex flex-col gap-6">
          {/* Adicionar Nova Fonte */}
          <div className="bg-white p-4 rounded-lg shadow-sm border office-border">
            <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">ADICIONAR NOVA FONTE</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-gray-500">Autor(es) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ex: Julianor Ramos"
                  className="border p-2 rounded text-sm outline-none focus:border-[#2b579a] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-gray-500">Ano (opcional)</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ex: 2024"
                  className="border p-2 rounded text-sm outline-none focus:border-[#2b579a] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-medium text-gray-500">Título/Descrição (opcional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Guia Completo de Blue Eyes Writer"
                  className="border p-2 rounded text-sm outline-none focus:border-[#2b579a] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-medium text-gray-500">Site/URL (opcional)</label>
                <input
                  type="text"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="Ex: https://certbestlinux.com"
                  className="border p-2 rounded text-sm outline-none focus:border-[#2b579a] transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={addSource}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[var(--theme-accent)] text-[var(--theme-on-accent)] hover:opacity-90 rounded transition-colors shadow-sm disabled:opacity-50"
                disabled={!author.trim()}
              >
                <Plus size={14} />
                ADICIONAR FONTE
              </button>
            </div>
            <p className="text-[9px] text-gray-400 italic mt-3">
              Pré-visualização: {generateReferenceText(author, year, title, site) || "Preencha os campos para ver a referência formatada."}
            </p>
          </div>

          {/* Lista de Fontes Existentes */}
          <div className="bg-white p-4 rounded-lg shadow-sm border office-border flex-1">
            <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">FONTES EXISTENTES</h4>
            {sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 opacity-60">
                <BookText size={32} strokeWidth={1.5} className="mb-2" />
                <span className="text-[10px] font-medium">Nenhuma fonte adicionada ainda.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sources.map((src) => (
                  <div key={src.id} className="group flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="flex-1 text-xs text-gray-700 leading-snug pr-2">{src.fullReference}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(src.fullReference, src.id)}
                        className={`p-1.5 rounded-full transition-colors ${copiedId === src.id ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-400'}`}
                        title="Copiar"
                      >
                        {copiedId === src.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => onInsert(src.fullReference)}
                        className="p-1.5 rounded-full bg-blue-50 text-[#2b579a] hover:bg-blue-100 transition-colors"
                        title="Inserir no Documento"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => deleteSource(src.id)}
                        className="p-1.5 rounded-full hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default SourceManagerModal;