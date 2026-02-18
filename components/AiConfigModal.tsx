import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Info, ShieldCheck, Sparkles, Save, Laptop, Trash2, Check } from 'lucide-react';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const isElectron = /Electron/.test(navigator.userAgent);

const AiConfigModal: React.FC<AiConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen && isElectron) {
      const savedKey = localStorage.getItem('GEMINI_API_KEY');
      setApiKey(savedKey || '');
    }
    // Reseta o estado de 'salvo' quando o modal é fechado/aberto
    setIsSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLinkKey = async () => {
    // @ts-ignore - Chamada para o seletor nativo conforme diretrizes
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      onClose();
    } else {
      alert("O seletor de chaves nativo não está disponível neste ambiente.");
    }
  };

  const handleSaveLocalKey = () => {
    if (isElectron) {
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      setIsSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500); // Fecha o modal após 1.5s
    }
  };

  const handleClearLocalKey = () => {
    if (isElectron) {
      if (window.confirm('Tem certeza de que deseja limpar a chave API salva?')) {
        localStorage.removeItem('GEMINI_API_KEY');
        setApiKey('');
      }
    }
  };

  const WebConfig = () => (
    <div className="p-4 bg-gray-50 border office-border rounded-lg flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <ShieldCheck size={20} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase">Método Seguro e Oficial (Web)</h4>
          <p className="text-[10px] text-gray-500 leading-normal">
            Utilize o seletor nativo para vincular sua chave API de forma segura, sem expô-la.
          </p>
        </div>
      </div>
      
      <button 
        onClick={handleLinkKey}
        className="w-full py-2.5 bg-[var(--theme-accent)] text-[var(--theme-on-accent)] rounded text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-sm transition-all"
      >
        <Key size={14} />
        VINCULAR MINHA CHAVE GEMINI
      </button>
    </div>
  );

  const ElectronConfig = () => (
    <div className="p-4 bg-gray-50 border office-border rounded-lg flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Laptop size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase">Configuração Local (AppImage)</h4>
          <p className="text-[10px] text-gray-500 leading-normal">
            Sua chave API será salva de forma segura no seu computador.
          </p>
        </div>
      </div>
      <input 
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Cole sua chave Gemini API aqui..."
        className="border p-2 rounded text-sm outline-none focus:border-[#2b579a] transition-colors"
      />
      <div className="flex items-center gap-2">
        <button 
          onClick={handleSaveLocalKey}
          disabled={isSaved || !apiKey}
          className={`flex-1 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
            isSaved 
              ? 'bg-green-600 text-white' 
              : 'bg-[var(--theme-accent)] text-[var(--theme-on-accent)] hover:opacity-90'
          } disabled:opacity-70`}
        >
          {isSaved ? (
            <>
              <Check size={14} />
              SALVO!
            </>
          ) : (
            <>
              <Save size={14} />
              SALVAR CHAVE
            </>
          )}
        </button>
        {apiKey && !isSaved && (
          <button 
            onClick={handleClearLocalKey}
            className="py-2.5 px-4 bg-red-50 text-red-600 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 border border-red-200 transition-all"
            title="Limpar Chave Salva"
          >
            <Trash2 size={14} />
            LIMPAR
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col border office-border">
        <div className="office-blue p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Key size={18} />
            <span className="text-sm font-semibold">Configurações da Blue IA</span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 p-1 rounded transition-opacity">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3 text-center mb-2">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#2b579a]">
               <Sparkles size={32} />
             </div>
             <h3 className="font-bold text-gray-800">Turbine sua escrita com IA</h3>
             <p className="text-xs text-gray-500 leading-relaxed px-4">
               O Blue Eyes Writer utiliza a tecnologia <strong>Google Gemini</strong>. Vincule sua chave API para ativar os recursos.
             </p>
          </div>

          <div className="flex flex-col gap-4">
            {isElectron ? <ElectronConfig /> : <WebConfig />}
            
            <div className="p-3 border border-blue-100 bg-blue-50/50 rounded-lg flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#2b579a]">
                <Info size={16} />
                <span className="text-xs font-bold uppercase">Não tem uma chave?</span>
              </div>
              <p className="text-[10px] text-gray-600">
                Você pode criar uma chave API do Gemini <strong>gratuitamente</strong> para uso pessoal no Google AI Studio.
              </p>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-1.5 bg-white border border-[#2b579a]/30 text-[#2b579a] rounded text-[10px] font-bold hover:bg-blue-50 transition-all"
              >
                CRIAR CHAVE GRATUITA AGORA
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex justify-end gap-2 border-t office-border shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiConfigModal;